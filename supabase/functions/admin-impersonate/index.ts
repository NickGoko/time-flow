import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify caller identity
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: callerUser }, error: userError } = await callerClient.auth.getUser();
    if (userError || !callerUser) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const callerId = callerUser.id;
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify super_admin role (not just admin)
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

    // Prevent self-impersonation
    if (targetUserId === callerId) {
      return jsonResponse({ error: 'Cannot impersonate yourself' }, 400);
    }

    // Look up target user email
    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('email')
      .eq('id', targetUserId)
      .single();

    if (!targetProfile) {
      return jsonResponse({ error: 'Target user not found' }, 404);
    }

    // Generate magic link for the target user
    const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: targetProfile.email,
    });

    if (linkError || !linkData) {
      return jsonResponse({ error: linkError?.message ?? 'Failed to generate link' }, 500);
    }

    // Build the verification URL
    const actionLink = linkData.properties?.action_link;
    if (!actionLink) {
      return jsonResponse({ error: 'No action link returned' }, 500);
    }

    return jsonResponse({ url: actionLink });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
