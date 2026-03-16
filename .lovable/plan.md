
# Slice 4: Environment Policy + Production Hardening

## Status: Brick 4.1 + 4.2 IMPLEMENTED | 4.3 SKIPPED | 4.4 DEFERRED

### Files changed
1. `src/lib/devMode.ts` — env-derived policy (APP_ENV, DEMO_MODE_ALLOWED, AUTH_ENABLED)
2. `src/contexts/UserContext.tsx` — gated actingHeaders on DEMO_MODE_ALLOWED
3. `src/components/admin/UsersTable.tsx` — same header gating
4. `src/components/UserSelector.tsx` — demo selector gated on DEMO_MODE_ALLOWED
5. `src/pages/admin/AdminImportExport.tsx` — same header gating
6. `supabase/functions/admin-users/index.ts` — rejects x-acting-user-id when APP_ENV=prod

### Environment variables
- `VITE_APP_ENV` → 'dev' (default) | 'staging' | 'prod'
- `VITE_AUTH_ENABLED` → optional override for non-prod auth
- `APP_ENV` → Edge Function secret (defaults to 'dev')

### Behavior matrix
| APP_ENV | Demo selector | x-acting-user-id (frontend) | x-acting-user-id (edge fn) | Auth required |
|---------|--------------|----------------------------|---------------------------|---------------|
| dev     | ✅ visible    | ✅ sent                     | ✅ accepted                | ❌ optional    |
| staging | ✅ visible    | ✅ sent                     | ✅ accepted                | ❌ optional*   |
| prod    | ❌ hidden     | ❌ never sent               | ❌ rejected (403)          | ✅ required    |

*staging uses AUTH_ENABLED=false by default; set VITE_AUTH_ENABLED=true to enable

### Brick 4.3 — SKIPPED
verify_jwt must stay false per signing-keys constraint. JWT validation happens in code.

### Brick 4.4 — DEFERRED
Query-layer scope enforcement deferred until seed data → Supabase migration.
