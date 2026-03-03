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

async function resolveCallerId(req: Request, supabaseUrl: string, anonKey: string, adminClient: ReturnType<typeof createClient>): Promise<{ callerId: string | null; error?: string }> {
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

      const userId = inviteData.user.id;

      // Wait for handle_new_user trigger to create the profile row
      for (let attempt = 0; attempt < 10; attempt++) {
        const { data: exists } = await adminClient
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        if (exists) break;
        await new Promise(r => setTimeout(r, 300));
      }

      // Update profile with additional fields
      const profileUpdates: Record<string, unknown> = {};
      if (name) profileUpdates.name = name;
      if (departmentId) profileUpdates.department_id = departmentId;
      if (role) profileUpdates.role = role;
      if (weeklyExpectedHours !== undefined) profileUpdates.weekly_expected_hours = weeklyExpectedHours;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: updateErr } = await adminClient.from('profiles').update(profileUpdates).eq('id', userId);
        if (updateErr) {
          return jsonResponse({ error: 'Profile update failed: ' + updateErr.message }, 400);
        }
      }

      // If appRole is admin, update user_roles
      if (appRole === 'admin') {
        await adminClient.from('user_roles').update({ role: 'admin' }).eq('user_id', userId);
      }

      return jsonResponse({ success: true, userId });
    }

    // ── Action: update ───────────────────────────────────────────
    if (action === 'update') {
      const { userId, updates } = body;
      if (!userId) return jsonResponse({ error: 'userId is required' }, 400);

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

    return jsonResponse({ error: 'Unknown action' }, 400);
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
