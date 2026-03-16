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
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data, error } = await callerClient.auth.getClaims(token);
    if (!error && data?.claims?.sub) {
      const authId = data.claims.sub as string;
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('auth_user_id', authId)
        .maybeSingle();
      if (profile) return { callerId: profile.id };

      const { data: legacyProfile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', authId)
        .maybeSingle();
      if (legacyProfile) return { callerId: legacyProfile.id };

      return { callerId: null, error: 'No roster profile linked to this auth account' };
    }
  }

  // Demo header fallback — blocked in production
  const actingUserId = req.headers.get('x-acting-user-id');
  if (actingUserId) {
    const appEnv = Deno.env.get('APP_ENV') || 'dev';
    const demoAllowed = appEnv !== 'prod';
    if (!demoAllowed) {
      return { callerId: null, error: 'Demo mode disabled in production' };
    }
    const { data: profile } = await adminClient.from('profiles').select('id').eq('id', actingUserId).single();
    if (profile) return { callerId: actingUserId };
    return { callerId: null, error: 'Invalid acting user ID' };
  }

  return { callerId: null, error: 'Unauthorized' };
}

/** Paginated search for an auth user by email. */
async function findAuthUserByEmail(adminClient: any, emailLower: string): Promise<{ id: string; email?: string } | null> {
  let page = 1;
  const perPage = 500;
  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users || data.users.length === 0) return null;
    const found = data.users.find(
      (u: { email?: string }) => u.email?.toLowerCase() === emailLower
    );
    if (found) return found;
    if (data.users.length < perPage) return null;
    page++;
  }
}

/** Build a full email→auth map with pagination. */
async function buildAuthEmailMap(adminClient: any): Promise<Map<string, { id: string }>> {
  const map = new Map<string, { id: string }>();
  let page = 1;
  const perPage = 500;
  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users || data.users.length === 0) break;
    for (const u of data.users) {
      if (u.email) map.set(u.email.toLowerCase(), { id: u.id });
    }
    if (data.users.length < perPage) break;
    page++;
  }
  return map;
}

/** Generate an onboarding link with correct type based on auth existence. */
async function generateOnboardingLink(
  adminClient: any,
  email: string,
  authExists: boolean
): Promise<{ action_link: string | null; link_type: 'invite' | 'recovery'; warning?: string }> {
  const type = authExists ? 'recovery' : 'invite';
  try {
    const { data, error } = await adminClient.auth.admin.generateLink({ type, email });
    if (!error && data?.properties?.action_link) {
      return { action_link: data.properties.action_link, link_type: type };
    }
    // Fallback: try magiclink
    const { data: mlData, error: mlError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (!mlError && mlData?.properties?.action_link) {
      return { action_link: mlData.properties.action_link, link_type: type, warning: `Primary ${type} failed, used magiclink fallback` };
    }
    return { action_link: null, link_type: type, warning: `generateLink failed: ${error?.message ?? mlError?.message ?? 'unknown'}` };
  } catch (err) {
    return { action_link: null, link_type: type, warning: `generateLink exception: ${String(err)}` };
  }
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
    const supabaseRef = new URL(supabaseUrl).hostname.split('.')[0];

    const { callerId, error: idError } = await resolveCallerId(req, supabaseUrl, anonKey, adminClient);
    if (!callerId) {
      return jsonResponse({ error: idError ?? 'Unauthorized' }, 401);
    }

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

    const body = await req.json();
    const { action } = body;

    // ── Action: create ───────────────────────────────────────────
    if (action === 'create') {
      const { email, name, departmentId, role, appRole, weeklyExpectedHours } = body;
      if (!email) return jsonResponse({ error: 'email is required', action }, 400);

      const emailLower = email.trim().toLowerCase();

      // 1. Find or create roster profile
      let rosterId: string;
      const { data: existing } = await adminClient
        .from('profiles')
        .select('id, auth_user_id')
        .eq('email', emailLower)
        .maybeSingle();

      if (existing) {
        rosterId = existing.id;
        const profileUpdates: Record<string, unknown> = {};
        if (name) profileUpdates.name = name;
        if (departmentId) profileUpdates.department_id = departmentId;
        if (role) profileUpdates.role = role;
        if (weeklyExpectedHours !== undefined) profileUpdates.weekly_expected_hours = weeklyExpectedHours;
        if (Object.keys(profileUpdates).length > 0) {
          const { error: updateErr } = await adminClient.from('profiles').update(profileUpdates).eq('id', rosterId);
          if (updateErr) return jsonResponse({ error: 'Profile update failed: ' + updateErr.message, action }, 400);
        }
      } else {
        rosterId = crypto.randomUUID();
        const { error: insErr } = await adminClient.from('profiles').insert({
          id: rosterId, email: emailLower, name: name || '',
          department_id: departmentId || null, role: role || '',
          weekly_expected_hours: weeklyExpectedHours ?? 40, is_active: true,
        });
        if (insErr) return jsonResponse({ error: 'Profile creation failed: ' + insErr.message, action }, 400);
      }

      // 2. Upsert role
      const desiredRole = appRole || 'employee';
      const { error: roleUpsertErr } = await adminClient
        .from('user_roles')
        .upsert({ user_id: rosterId, role: desiredRole }, { onConflict: 'user_id' });
      if (roleUpsertErr) return jsonResponse({ error: 'Role upsert failed: ' + roleUpsertErr.message, action }, 400);

      // 3. Provision auth — link-first
      let authId: string | null = existing?.auth_user_id ?? null;
      let authExists = !!authId;

      if (!authId) {
        // Check if auth user exists by email (paginated)
        const existingAuth = await findAuthUserByEmail(adminClient, emailLower);
        if (existingAuth) {
          authId = existingAuth.id;
          authExists = true;
        } else {
          // Create via invite
          const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(emailLower, {
            data: { full_name: name || '' },
          });
          if (!inviteError && inviteData?.user) {
            authId = inviteData.user.id;
            authExists = false; // newly created
          }
        }
      }

      // 4. Link roster ↔ auth
      if (authId) {
        await adminClient.from('profiles').update({ auth_user_id: authId }).eq('id', rosterId);
      }

      // 5. Generate link
      const { action_link, link_type, warning } = await generateOnboardingLink(adminClient, emailLower, authExists);

      return jsonResponse({
        success: true, userId: rosterId, authUserId: authId,
        action_link, link_type,
        ...(warning ? { warning } : {}),
        supabase_ref: supabaseRef,
      });
    }

    // ── Action: update ───────────────────────────────────────────
    if (action === 'update') {
      const { userId, updates, reason, managedDepartments } = body;
      if (!userId) return jsonResponse({ error: 'userId is required', action }, 400);

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

      const profileUpdates: Record<string, unknown> = {};
      if (updates.name !== undefined) profileUpdates.name = updates.name;
      if (updates.departmentId !== undefined) profileUpdates.department_id = updates.departmentId;
      if (updates.role !== undefined) profileUpdates.role = updates.role;
      if (updates.weeklyExpectedHours !== undefined) profileUpdates.weekly_expected_hours = updates.weeklyExpectedHours;

      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await adminClient.from('profiles').update(profileUpdates).eq('id', userId);
        if (error) return jsonResponse({ error: error.message, action }, 400);
      }

      if (updates.appRole !== undefined) {
        const { error } = await adminClient.from('user_roles').update({ role: updates.appRole }).eq('user_id', userId);
        if (error) return jsonResponse({ error: error.message, action }, 400);
      }

      if (Array.isArray(managedDepartments)) {
        await adminClient.from('user_department_scope').delete().eq('user_id', userId);
        if (managedDepartments.length > 0) {
          const scopeRows = managedDepartments.map((deptId: string) => ({ user_id: userId, department_id: deptId }));
          const { error: scopeErr } = await adminClient.from('user_department_scope').insert(scopeRows);
          if (scopeErr) return jsonResponse({ error: 'Department scope update failed: ' + scopeErr.message, action }, 400);
        }
      }

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

      await adminClient.from('audit_log').insert({
        actor_id: callerId, action: 'user.update', target_type: 'user',
        target_id: userId, reason: reason || null,
        before_data: beforeData, after_data: afterData,
      });

      return jsonResponse({ success: true });
    }

    // ── Action: toggle-active ────────────────────────────────────
    if (action === 'toggle-active') {
      const { userId } = body;
      if (!userId) return jsonResponse({ error: 'userId is required', action }, 400);
      if (userId === callerId) return jsonResponse({ error: 'Cannot deactivate yourself', action }, 400);

      const { data: profile } = await adminClient.from('profiles').select('is_active').eq('id', userId).single();
      if (!profile) return jsonResponse({ error: 'User not found', action }, 404);

      const { error } = await adminClient.from('profiles').update({ is_active: !profile.is_active }).eq('id', userId);
      if (error) return jsonResponse({ error: error.message, action }, 400);

      return jsonResponse({ success: true, isActive: !profile.is_active });
    }

    // ── Action: bulk-import ─────────────────────────────────────
    if (action === 'bulk-import') {
      const { users } = body;
      if (!Array.isArray(users) || users.length === 0) return jsonResponse({ error: 'users array is required', action }, 400);

      let created = 0, updated = 0, skipped = 0;
      const errors: string[] = [];

      for (const u of users) {
        try {
          if (!u.email) { skipped++; errors.push('Row skipped: missing email'); continue; }
          const email = u.email.trim().toLowerCase();
          const { data: existing } = await adminClient.from('profiles').select('id').eq('email', email).maybeSingle();

          let profileId: string;
          if (existing) {
            profileId = existing.id;
            const updates: Record<string, unknown> = {};
            if (u.name !== undefined) updates.name = u.name;
            if (u.departmentId !== undefined) updates.department_id = u.departmentId;
            if (u.role !== undefined) updates.role = u.role;
            if (u.isActive !== undefined) updates.is_active = u.isActive;
            if (Object.keys(updates).length > 0) {
              const { error: upErr } = await adminClient.from('profiles').update(updates).eq('id', profileId);
              if (upErr) { errors.push(`Update failed for ${email}: ${upErr.message}`); skipped++; continue; }
            }
            updated++;
          } else {
            profileId = crypto.randomUUID();
            const { error: insErr } = await adminClient.from('profiles').insert({
              id: profileId, email, name: u.name || '',
              department_id: u.departmentId || null, role: u.role || '', is_active: u.isActive ?? true,
            });
            if (insErr) { errors.push(`Insert failed for ${email}: ${insErr.message}`); skipped++; continue; }
            created++;
          }

          const appRole = u.appRole || 'employee';
          const { error: roleUpsertErr } = await adminClient.from('user_roles').upsert({ user_id: profileId, role: appRole }, { onConflict: 'user_id' });
          if (roleUpsertErr) errors.push(`Role upsert failed for ${email}: ${roleUpsertErr.message}`);

          if (Array.isArray(u.managedDepartments) && u.managedDepartments.length > 0) {
            await adminClient.from('user_department_scope').delete().eq('user_id', profileId);
            const scopeRows = u.managedDepartments.map((deptId: string) => ({ user_id: profileId, department_id: deptId }));
            const { error: scopeErr } = await adminClient.from('user_department_scope').insert(scopeRows);
            if (scopeErr) errors.push(`Department scope failed for ${email}: ${scopeErr.message}`);
          }
        } catch (rowErr) { errors.push(`Unexpected error: ${String(rowErr)}`); skipped++; }
      }

      return jsonResponse({ created, updated, skipped, errors });
    }

    // ── Action: provision-invite ───────────────────────────────
    if (action === 'provision-invite') {
      const { userId } = body;
      if (!userId) return jsonResponse({ error: 'userId is required', action }, 400);

      const { data: profile } = await adminClient
        .from('profiles')
        .select('id, email, name, auth_user_id')
        .eq('id', userId)
        .single();
      if (!profile) return jsonResponse({ error: 'Profile not found', action }, 404);

      let authId: string | null = profile.auth_user_id;
      let authExists = !!authId;

      if (!authId) {
        // Find existing auth user (paginated)
        const existingAuth = await findAuthUserByEmail(adminClient, profile.email.toLowerCase());
        if (existingAuth) {
          authId = existingAuth.id;
          authExists = true;
        } else {
          // Create via invite
          const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
            profile.email, { data: { full_name: profile.name } }
          );
          if (inviteErr) return jsonResponse({ error: inviteErr.message, action, details: 'inviteUserByEmail failed' }, 400);
          authId = inviteData.user.id;
          authExists = false;
        }
      }

      // Link auth_user_id
      if (authId && authId !== profile.auth_user_id) {
        await adminClient.from('profiles').update({ auth_user_id: authId }).eq('id', profile.id);
      }

      const { action_link, link_type, warning } = await generateOnboardingLink(adminClient, profile.email, authExists);

      return jsonResponse({
        success: true, authUserId: authId, action_link, link_type,
        ...(warning ? { warning } : {}),
        supabase_ref: supabaseRef,
      });
    }

    // ── Action: send-reset ──────────────────────────────────────
    if (action === 'send-reset') {
      const { userId } = body;
      if (!userId) return jsonResponse({ error: 'userId is required', action }, 400);

      const { data: profile } = await adminClient
        .from('profiles')
        .select('id, email, auth_user_id')
        .eq('id', userId)
        .single();
      if (!profile) return jsonResponse({ error: 'Profile not found', action }, 404);

      let authId: string | null = profile.auth_user_id;

      if (!authId) {
        // Try to find and link
        const existingAuth = await findAuthUserByEmail(adminClient, profile.email.toLowerCase());
        if (existingAuth) {
          authId = existingAuth.id;
          await adminClient.from('profiles').update({ auth_user_id: authId }).eq('id', profile.id);
        }
      }

      if (!authId) {
        return jsonResponse({ error: 'No auth account exists for this user. Send an invite first.', action }, 400);
      }

      const { action_link, link_type, warning } = await generateOnboardingLink(adminClient, profile.email, true);

      return jsonResponse({
        success: true, action_link, link_type,
        ...(warning ? { warning } : {}),
        supabase_ref: supabaseRef,
      });
    }

    // ── Action: create-with-password (super_admin only) ─────────
    if (action === 'create-with-password') {
      if (roleRow.role !== 'super_admin') {
        return jsonResponse({ error: 'Forbidden: super_admin role required', action }, 403);
      }

      const { userId, password } = body;
      if (!userId) return jsonResponse({ error: 'userId is required', action }, 400);
      if (!password || password.length < 8) return jsonResponse({ error: 'Password must be at least 8 characters', action }, 400);

      const { data: profile } = await adminClient
        .from('profiles')
        .select('id, email, name')
        .eq('id', userId)
        .single();
      if (!profile) return jsonResponse({ error: 'Profile not found', action }, 404);

      const existingAuth = await findAuthUserByEmail(adminClient, profile.email.toLowerCase());
      if (existingAuth) {
        return jsonResponse({ error: 'Auth account already exists for this email. Use send-reset instead.', action }, 400);
      }

      const { data: createData, error: createErr } = await adminClient.auth.admin.createUser({
        email: profile.email, password, email_confirm: true,
        user_metadata: { full_name: profile.name },
      });
      if (createErr) return jsonResponse({ error: createErr.message, action }, 400);

      const authId = createData.user.id;
      await adminClient.from('profiles').update({ auth_user_id: authId }).eq('id', profile.id);

      return jsonResponse({ success: true, authUserId: authId, supabase_ref: supabaseRef });
    }

    // ── Action: bulk-provision ──────────────────────────────────
    if (action === 'bulk-provision') {
      const { userIds } = body;
      if (!Array.isArray(userIds) || userIds.length === 0) return jsonResponse({ error: 'userIds array is required', action }, 400);

      // Build full paginated auth email map
      const authUsersByEmail = await buildAuthEmailMap(adminClient);

      const results: { userId: string; email: string; status: string; action_link?: string | null; link_type?: string; error?: string }[] = [];

      for (const uid of userIds) {
        try {
          const { data: profile } = await adminClient
            .from('profiles')
            .select('id, email, name, auth_user_id')
            .eq('id', uid)
            .single();

          if (!profile) { results.push({ userId: uid, email: '', status: 'error', error: 'Profile not found' }); continue; }

          const emailLower = profile.email.toLowerCase();
          let authId: string | null = profile.auth_user_id;
          let authExists = !!authId;

          if (!authId) {
            const existingAuth = authUsersByEmail.get(emailLower);
            if (existingAuth) {
              authId = existingAuth.id;
              authExists = true;
            } else {
              const { data: inviteData, error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(
                profile.email, { data: { full_name: profile.name } }
              );
              if (inviteErr) { results.push({ userId: uid, email: profile.email, status: 'error', error: inviteErr.message }); continue; }
              authId = inviteData.user.id;
              authExists = false;
              authUsersByEmail.set(emailLower, { id: authId });
            }
          }

          // Link
          if (authId && authId !== profile.auth_user_id) {
            await adminClient.from('profiles').update({ auth_user_id: authId }).eq('id', profile.id);
          }

          const { action_link, link_type } = await generateOnboardingLink(adminClient, profile.email, authExists);
          results.push({
            userId: uid, email: profile.email,
            status: authExists ? 're-linked' : 'invited',
            action_link, link_type,
          });
        } catch (err) {
          results.push({ userId: uid, email: '', status: 'error', error: String(err) });
        }
      }

      return jsonResponse({ results, supabase_ref: supabaseRef });
    }

    return jsonResponse({ error: 'Unknown action', action }, 400);
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
