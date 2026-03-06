# Security audit findings

Date: 2026-03-06
Scope: Static review of frontend + Supabase functions/migrations.

## Critical findings

1. **Unauthenticated invocation of privileged edge functions**
   - `supabase/config.toml` sets `verify_jwt = false` for both `admin-users` and `admin-impersonate`.
   - This allows requests without a verified JWT to reach code paths that use the service-role key.
   - Impact: attacker can call admin endpoints directly from the browser or curl and attempt privileged actions.

2. **Header-based identity spoofing in edge functions**
   - Both admin functions accept `x-acting-user-id` as a fallback identity source when JWT auth is absent.
   - The fallback only checks whether the profile exists; it does **not** cryptographically prove caller identity.
   - Combined with `verify_jwt = false`, this enables impersonating any existing user ID and inheriting that user’s role checks.

## High findings

3. **Overly permissive CORS on admin edge functions**
   - Both functions return `Access-Control-Allow-Origin: *`.
   - With token-bearing browser sessions, permissive CORS increases risk of cross-origin abuse/misconfiguration.

4. **RLS policies intentionally opened to "Anyone" for sensitive tables**
   - Migration `20260226061937_ae4c9762...sql` creates broad policies such as:
     - `Anyone can read profiles`
     - `Anyone can read user_roles`
     - `Anyone can read/insert/update/delete time_entries`
     - `Anyone can read/insert/update week_statuses`
   - Impact: authenticated users can access/modify data beyond least privilege; confidentiality/integrity exposure.

## Medium findings

5. **Demo-mode defaults can lead to accidental insecure deployments**
   - Frontend defaults set `AUTH_ENABLED = false` and `DEMO_MODE = true`.
   - If promoted to production without strict environment gating, auth can be unintentionally bypassed in UX and API calling patterns.

## Recommended remediations

1. Set `verify_jwt = true` for privileged edge functions, then require valid JWT in code.
2. Remove `x-acting-user-id` fallback in production paths (or gate behind explicit local/dev env check and shared secret).
3. Restrict CORS to known origins for admin functions.
4. Replace `Anyone can ...` RLS policies on sensitive tables with least-privilege, role-aware rules.
5. Make secure defaults explicit:
   - `AUTH_ENABLED = true` by default.
   - Keep demo mode opt-in via environment variable only.

## Notes

- Some insecure behavior appears intentional for demo workflows, but currently there is no hard technical boundary preventing production misuse.
