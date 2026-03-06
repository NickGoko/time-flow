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
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error } = await callerClient.auth.getUser();
    if (!error && user) {
      return { callerId: user.id };
    }
  }

  const actingUserId = req.headers.get('x-acting-user-id');
  if (actingUserId) {
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

    const { callerId, error: idError } = await resolveCallerId(req, supabaseUrl, anonKey, adminClient);
    if (!callerId) {
      return jsonResponse({ error: idError ?? 'Unauthorized' }, 401);
    }

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

    const actionLink = linkData.properties?.action_link;
    if (!actionLink) {
      return jsonResponse({ error: 'No action link returned' }, 500);
    }

    return jsonResponse({ url: actionLink });
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
});
