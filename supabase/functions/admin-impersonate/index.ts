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

/** Resolve JWT auth ID → roster profile ID. Rejects x-acting-user-id for impersonation. */
async function resolveCallerFromJwt(req: Request, supabaseUrl: string, anonKey: string, adminClient: any): Promise<{ callerId: string | null; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { callerId: null, error: 'JWT required for impersonation' };
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: userData, error } = await adminClient.auth.getUser(token);
  if (error || !userData?.user?.id) {
    return { callerId: null, error: 'Invalid or expired JWT' };
  }

  const authId = userData.user.id as string;

  // Primary: lookup by auth_user_id
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('auth_user_id', authId)
    .maybeSingle();
  if (profile) return { callerId: profile.id };

  // Legacy fallback
  const { data: legacyProfile } = await adminClient
    .from('profiles')
    .select('id')
    .eq('id', authId)
    .maybeSingle();
  if (legacyProfile) return { callerId: legacyProfile.id };

  return { callerId: null, error: 'No roster profile linked to this auth account' };
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

    // JWT-only auth for impersonation (no demo header)
    const { callerId, error: idError } = await resolveCallerFromJwt(req, supabaseUrl, anonKey, adminClient);
    if (!callerId) {
      return jsonResponse({ error: idError ?? 'Unauthorized' }, 401);
    }

    // Verify super_admin role
    const { data: roleRow } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerId)
      .eq('role', 'super_admin')
      .single();

    if (!roleRow) {
      return jsonResponse({ error: 'Forbidden: super_admin role required' }, 403);
    }

    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return jsonResponse({ error: 'targetUserId is required' }, 400);
    }

    if (targetUserId === callerId) {
      return jsonResponse({ error: 'Cannot impersonate yourself' }, 400);
    }

    // Look up target profile by roster ID
    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('id, email, auth_user_id')
      .eq('id', targetUserId)
      .single();

    if (!targetProfile) {
      return jsonResponse({ error: 'Target user not found' }, 404);
    }

    // Require auth_user_id to be linked
    if (!targetProfile.auth_user_id) {
      return jsonResponse({ error: 'User has no login yet. Provision login first.' }, 400);
    }

    // Generate magic link using email
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: targetProfile.email,
    });

    if (linkError || !linkData?.properties?.action_link) {
      return jsonResponse({ error: linkError?.message ?? 'Failed to generate link' }, 500);
    }

    return jsonResponse({
      url: linkData.properties.action_link,
      link_type: 'magiclink',
      targetRosterUserId: targetUserId,
      supabase_ref: supabaseRef,
    });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
