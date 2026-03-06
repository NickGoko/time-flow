import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-acting-user-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function resolveCallerId(req: Request, supabaseUrl: string, anonKey: string, adminClient: any): Promise<{ callerId: string | null; error?: string }> {
  // Try JWT first
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error } = await callerClient.auth.getUser();
    if (!error && user) {
      return { callerId: user.id };
    }
  }

  // Fallback: x-acting-user-id header (demo mode)
  const actingUserId = req.headers.get('x-acting-user-id');
  if (actingUserId) {
    // Verify user exists in profiles
    const { data: profile } = await adminClient.from('profiles').select('id').eq('id', actingUserId).single();
    if (profile) {
      return { callerId: actingUserId };
    }
    return { callerId: null, error: 'Invalid acting user ID' };
  }

  return { callerId: null, error: 'Unauthorized' };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Resolve caller identity (JWT or x-acting-user-id)
    const { callerId, error: idError } = await resolveCallerId(req, supabaseUrl, anonKey, adminClient);
    if (!callerId) {
      return jsonResponse({ error: idError ?? 'Unauthorized' }, 401);
    }

    // Check admin role
    const { data: roleRow } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .in('role', ['admin', 'super_admin'])
      .limit(1)
      .maybeSingle();

    if (!roleRow) {
      return jsonResponse({ error: 'Forbidden: admin role required' }, 403);
    }

    // ── Parse body ───────────────────────────────────────────────
    const body = await req.json();
    const { action } = body;

    // ── Action: create (invite user) ─────────────────────────────
    if (action === 'create') {
      const { email, name, departmentId, role, appRole, weeklyExpectedHours } = body;

      if (!email) return jsonResponse({ error: 'email is required' }, 400);

      // Invite user (triggers handle_new_user which creates profile + default employee role)
      const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { full_name: name || '' },
      });

      if (inviteError) {
        return jsonResponse({ error: inviteError.message }, 400);
      }

      const authUserId = inviteData.user.id;

      // Wait for handle_new_user trigger to link the profile via auth_user_id
      let profileId: string | null = null;
      for (let attempt = 0; attempt < 10; attempt++) {
        const { data: exists } = await adminClient
          .from('profiles')
          .select('id')
          .eq('auth_user_id', authUserId)
          .maybeSingle();
        if (exists) { profileId = exists.id; break; }
        await new Promise(r => setTimeout(r, 300));
      }

      if (!profileId) {
        return jsonResponse({ error: 'Profile was not created by trigger' }, 500);
      }

      // Update profile with additional fields
      const profileUpdates: Record<string, unknown> = {};
      if (name) profileUpdates.name = name;
      if (departmentId) profileUpdates.department_id = departmentId;
      if (role) profileUpdates.role = role;
      if (weeklyExpectedHours !== undefined) profileUpdates.weekly_expected_hours = weeklyExpectedHours;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: updateErr } = await adminClient.from('profiles').update(profileUpdates).eq('id', profileId);
        if (updateErr) {
          return jsonResponse({ error: 'Profile update failed: ' + updateErr.message }, 400);
        }
      }

      // If appRole is admin, update user_roles
      if (appRole === 'admin') {
        await adminClient.from('user_roles').update({ role: 'admin' }).eq('user_id', profileId);
      }

      return jsonResponse({ success: true, userId: profileId });
    }

    // ── Action: update ───────────────────────────────────────────
    if (action === 'update') {
      const { userId, updates, reason, managedDepartments } = body;
      if (!userId) return jsonResponse({ error: 'userId is required' }, 400);

      // Snapshot before state
      const [beforeProfile, beforeRole, beforeScopes] = await Promise.all([
        adminClient.from('profiles').select('*').eq('id', userId).single(),
        adminClient.from('user_roles').select('role').eq('user_id', userId).single(),
        adminClient.from('user_department_scope').select('department_id').eq('user_id', userId),
      ]);
      const beforeData = {
        profile: beforeProfile.data,
        role: beforeRole.data?.role,
        managedDepartments: beforeScopes.data?.map((s: { department_id: string }) => s.department_id) ?? [],
      };

      // Apply profile updates
      const profileUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) profileUpdates.name = updates.name;
      if (updates.departmentId !== undefined) profileUpdates.department_id = updates.departmentId;
      if (updates.role !== undefined) profileUpdates.role = updates.role;
      if (updates.weeklyExpectedHours !== undefined) profileUpdates.weekly_expected_hours = updates.weeklyExpectedHours;

      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await adminClient.from('profiles').update(profileUpdates).eq('id', userId);
        if (error) return jsonResponse({ error: error.message }, 400);
      }

      // Update app role if changed
      if (updates.appRole !== undefined) {
        const { error } = await adminClient
          .from('user_roles')
          .update({ role: updates.appRole })
          .eq('user_id', userId);
        if (error) return jsonResponse({ error: error.message }, 400);
      }

      // Update managed departments (delete+insert)
      if (Array.isArray(managedDepartments)) {
        await adminClient.from('user_department_scope').delete().eq('user_id', userId);
        if (managedDepartments.length > 0) {
          const scopeRows = managedDepartments.map((deptId: string) => ({
            user_id: userId,
            department_id: deptId,
          }));
          const { error: scopeErr } = await adminClient.from('user_department_scope').insert(scopeRows);
          if (scopeErr) return jsonResponse({ error: 'Department scope update failed: ' + scopeErr.message }, 400);
        }
      }

      // Snapshot after state
      const [afterProfile, afterRole, afterScopes] = await Promise.all([
        adminClient.from('profiles').select('*').eq('id', userId).single(),
        adminClient.from('user_roles').select('role').eq('user_id', userId).single(),
        adminClient.from('user_department_scope').select('department_id').eq('user_id', userId),
      ]);
      const afterData = {
        profile: afterProfile.data,
        role: afterRole.data?.role,
        managedDepartments: afterScopes.data?.map((s: { department_id: string }) => s.department_id) ?? [],
      };

      // Write audit log
      await adminClient.from('audit_log').insert({
        actor_id: callerId,
        action: 'user.update',
        target_type: 'user',
        target_id: userId,
        reason: reason || null,
        before_data: beforeData,
        after_data: afterData,
      });

      return jsonResponse({ success: true });
    }

    // ── Action: toggle-active ────────────────────────────────────
    if (action === 'toggle-active') {
      const { userId } = body;
      if (!userId) return jsonResponse({ error: 'userId is required' }, 400);

      // Prevent self-deactivation
      if (userId === callerId) {
        return jsonResponse({ error: 'Cannot deactivate yourself' }, 400);
      }

      const { data: profile } = await adminClient
        .from('profiles')
        .select('is_active')
        .eq('id', userId)
        .single();

      if (!profile) return jsonResponse({ error: 'User not found' }, 404);

      const { error } = await adminClient
        .from('profiles')
        .update({ is_active: !profile.is_active })
        .eq('id', userId);

      if (error) return jsonResponse({ error: error.message }, 400);

      return jsonResponse({ success: true, isActive: !profile.is_active });
    }

    // ── Action: bulk-import ─────────────────────────────────────
    if (action === 'bulk-import') {
      const { users } = body;
      if (!Array.isArray(users) || users.length === 0) {
        return jsonResponse({ error: 'users array is required' }, 400);
      }

      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const u of users) {
        try {
          if (!u.email) {
            skipped++;
            errors.push(`Row skipped: missing email`);
            continue;
          }

          const email = u.email.trim().toLowerCase();

          // 1. Check if profile exists by email
          const { data: existing } = await adminClient
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          let profileId: string;

          if (existing) {
            // 2. UPDATE existing profile
            profileId = existing.id;
            const updates: Record<string, unknown> = {};
            if (u.name !== undefined) updates.name = u.name;
            if (u.departmentId !== undefined) updates.department_id = u.departmentId;
            if (u.role !== undefined) updates.role = u.role;
            if (u.isActive !== undefined) updates.is_active = u.isActive;

            if (Object.keys(updates).length > 0) {
              const { error: upErr } = await adminClient
                .from('profiles')
                .update(updates)
                .eq('id', profileId);
              if (upErr) {
                errors.push(`Update failed for ${email}: ${upErr.message}`);
                skipped++;
                continue;
              }
            }
            updated++;
          } else {
            // 3. INSERT new profile with generated UUID
            profileId = crypto.randomUUID();
            const { error: insErr } = await adminClient
              .from('profiles')
              .insert({
                id: profileId,
                email,
                name: u.name || '',
                department_id: u.departmentId || null,
                role: u.role || '',
                is_active: u.isActive ?? true,
              });
            if (insErr) {
              errors.push(`Insert failed for ${email}: ${insErr.message}`);
              skipped++;
              continue;
            }
            created++;
          }

          // 4. Upsert user_roles (one role per user)
          const appRole = u.appRole || 'employee';
          const { error: roleUpsertErr } = await adminClient
            .from('user_roles')
            .upsert(
              { user_id: profileId, role: appRole },
              { onConflict: 'user_id' }
            );
          if (roleUpsertErr) {
            errors.push(`Role upsert failed for ${email}: ${roleUpsertErr.message}`);
          }

          // 5. Upsert user_department_scope (managed departments for HODs)
          if (Array.isArray(u.managedDepartments) && u.managedDepartments.length > 0) {
            // Delete existing scopes then insert new ones
            await adminClient
              .from('user_department_scope')
              .delete()
              .eq('user_id', profileId);

            const scopeRows = u.managedDepartments.map((deptId: string) => ({
              user_id: profileId,
              department_id: deptId,
            }));
            const { error: scopeErr } = await adminClient
              .from('user_department_scope')
              .insert(scopeRows);
            if (scopeErr) {
              errors.push(`Department scope failed for ${email}: ${scopeErr.message}`);
            }
          }
        } catch (rowErr) {
          errors.push(`Unexpected error: ${String(rowErr)}`);
          skipped++;
        }
      }

      return jsonResponse({ created, updated, skipped, errors });
    }

    // ── Action: provision-invite ───────────────────────────────
    if (action === 'provision-invite') {
      const { userId } = body;
      if (!userId) return jsonResponse({ error: 'userId is required' }, 400);

      // Look up profile
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id, email, name')
        .eq('id', userId)
        .single();

      if (!profile) return jsonResponse({ error: 'Profile not found' }, 404);

      // Check if auth user already exists for this email
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const existingAuthUser = listData?.users?.find(
        (u: { email?: string }) => u.email?.toLowerCase() === profile.email.toLowerCase()
      );

      if (existingAuthUser) {
        // Link auth_user_id if not already set
        await adminClient
          .from('profiles')
          .update({ auth_user_id: existingAuthUser.id })
          .eq('id', profile.id);

        // Re-send via magiclink (invite type fails if user already exists)
        const { error: linkErr } = await adminClient.auth.admin.generateLink({
          type: 'magiclink',
          email: profile.email,
        });
        if (linkErr) return jsonResponse({ error: linkErr.message }, 400);
      } else {
        // Create new auth user via invite
        const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
          profile.email,
          { data: { full_name: profile.name } }
        );
        if (inviteErr) return jsonResponse({ error: inviteErr.message }, 400);

        // Link auth_user_id (trigger may have already done this, but ensure it)
        const newAuthId = inviteData.user.id;
        await adminClient
          .from('profiles')
          .update({ auth_user_id: newAuthId })
          .eq('id', profile.id);
      }

      return jsonResponse({ success: true });
    }

    // ── Action: send-reset ──────────────────────────────────────
    if (action === 'send-reset') {
      const { userId } = body;
      if (!userId) return jsonResponse({ error: 'userId is required' }, 400);

      const { data: profile } = await adminClient
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (!profile) return jsonResponse({ error: 'Profile not found' }, 404);

      // Check auth user exists
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const authUser = listData?.users?.find(
        (u: { email?: string }) => u.email?.toLowerCase() === profile.email.toLowerCase()
      );

      if (!authUser) {
        return jsonResponse({ error: 'No auth account exists for this user. Send an invite first.' }, 400);
      }

      const { error: resetErr } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email: profile.email,
      });

      if (resetErr) return jsonResponse({ error: resetErr.message }, 400);

      return jsonResponse({ success: true });
    }

    // ── Action: create-with-password (super_admin only) ─────────
    if (action === 'create-with-password') {
      // Require super_admin
      if (roleRow.role !== 'super_admin') {
        return jsonResponse({ error: 'Forbidden: super_admin role required' }, 403);
      }

      const { userId, password } = body;
      if (!userId) return jsonResponse({ error: 'userId is required' }, 400);
      if (!password || password.length < 8) {
        return jsonResponse({ error: 'Password must be at least 8 characters' }, 400);
      }

      const { data: profile } = await adminClient
        .from('profiles')
        .select('id, email, name')
        .eq('id', userId)
        .single();

      if (!profile) return jsonResponse({ error: 'Profile not found' }, 404);

      // Check if auth user already exists
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const existingAuthUser = listData?.users?.find(
        (u: { email?: string }) => u.email?.toLowerCase() === profile.email.toLowerCase()
      );

      if (existingAuthUser) {
        return jsonResponse({ error: 'Auth account already exists for this email. Use send-reset instead.' }, 400);
      }

      const { data: createData, error: createErr } = await adminClient.auth.admin.createUser({
        email: profile.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: profile.name },
      });

      if (createErr) return jsonResponse({ error: createErr.message }, 400);

      // Link auth_user_id (trigger may have already done this, but ensure it)
      const newAuthId = createData.user.id;
      await adminClient
        .from('profiles')
        .update({ auth_user_id: newAuthId })
        .eq('id', profile.id);

      return jsonResponse({ success: true });
    }

    // ── Action: bulk-provision ──────────────────────────────────
    if (action === 'bulk-provision') {
      const { userIds } = body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return jsonResponse({ error: 'userIds array is required' }, 400);
      }

      // Fetch all auth users once to avoid repeated listUsers calls
      const { data: listData } = await adminClient.auth.admin.listUsers();
      const authUsersByEmail = new Map<string, { id: string }>();
      listData?.users?.forEach((u: { id: string; email?: string }) => {
        if (u.email) authUsersByEmail.set(u.email.toLowerCase(), { id: u.id });
      });

      const results: { userId: string; email: string; status: string; error?: string }[] = [];

      for (const uid of userIds) {
        try {
          const { data: profile } = await adminClient
            .from('profiles')
            .select('id, email, name')
            .eq('id', uid)
            .single();

          if (!profile) {
            results.push({ userId: uid, email: '', status: 'error', error: 'Profile not found' });
            continue;
          }

          const emailLower = profile.email.toLowerCase();
          const existingAuth = authUsersByEmail.get(emailLower);

          if (existingAuth) {
            // Link auth_user_id
            await adminClient.from('profiles').update({ auth_user_id: existingAuth.id }).eq('id', profile.id);
            // Re-invite
            const { error: linkErr } = await adminClient.auth.admin.generateLink({
              type: 'invite',
              email: profile.email,
            });
            if (linkErr) {
              results.push({ userId: uid, email: profile.email, status: 'error', error: linkErr.message });
            } else {
              results.push({ userId: uid, email: profile.email, status: 're-invited' });
            }
          } else {
            // New invite
            const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
              profile.email,
              { data: { full_name: profile.name } }
            );
            if (inviteErr) {
              results.push({ userId: uid, email: profile.email, status: 'error', error: inviteErr.message });
              continue;
            }
            const newAuthId = inviteData.user.id;
            // Link auth_user_id (trigger may have already done this)
            await adminClient.from('profiles').update({ auth_user_id: newAuthId }).eq('id', profile.id);
            // Add to map for subsequent lookups
            authUsersByEmail.set(emailLower, { id: newAuthId });
            results.push({ userId: uid, email: profile.email, status: 'invited' });
          }
        } catch (err) {
          results.push({ userId: uid, email: '', status: 'error', error: String(err) });
        }
      }

      return jsonResponse({ results });
    }

    return jsonResponse({ error: 'Unknown action' }, 400);
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
