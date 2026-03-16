

# Slice 4: Environment Policy + Production Hardening

## A) Current State

### Frontend env flags (`src/lib/devMode.ts`)
- `DEV_MODE` — from `VITE_DEV_MODE` env var
- `AUTH_ENABLED = false` — hardcoded
- `DEMO_MODE = true` — hardcoded

### Where `x-acting-user-id` is sent from frontend
- `src/contexts/UserContext.tsx` (actingHeaders)
- `src/components/admin/UsersTable.tsx` (actingHeaders)
- `src/pages/admin/AdminImportExport.tsx`

### Edge functions accepting demo header
- `admin-users`: accepts `x-acting-user-id` fallback when JWT absent
- `admin-impersonate`: JWT-only (already hardened)

### `verify_jwt` config (`supabase/config.toml`)
Both `admin-users` and `admin-impersonate` have `verify_jwt = false`.

Per project knowledge (`disable-jwt-edge-functions`), **this project uses signing-keys**, so `verify_jwt = true` doesn't work. Must keep `verify_jwt = false` and validate JWTs in code. This means **Brick 4.3 is a no-op** — the current approach is already correct per platform constraints.

### Dashboard scope enforcement (`useDashboardDataset.ts`)
- Scope filtering is **UI-only**: `scope` dropdown options are hidden based on `appRole`, but `getAllEntries()` returns **all entries** from seed data regardless.
- `TimeEntriesContext.getAllEntries()` returns the full dataset. `getOwnEntries()` filters by `currentUser.id`.
- The `scopedEntries` filter in `useDashboardDataset` works correctly IF `allUsers` is already scoped — but `allUsers` is the full active user list. So any user with access to `/admin` routes can see all data if they pass the `AdminGuard` (which checks `isAdmin` including `leadership`).
- RLS is not currently enforced since data comes from seed/local state, not direct Supabase queries.

---

## B) Brick Plan

### Brick 4.1 — Environment Policy + UI Gating

**Scope**: Replace hardcoded flags with env-derived policy. Gate demo selector and demo header on environment.

**Files (3)**:
1. `src/lib/devMode.ts` — derive flags from `VITE_APP_ENV`
2. `src/contexts/UserContext.tsx` — gate `x-acting-user-id` on `DEMO_MODE_ALLOWED`
3. `src/components/admin/UsersTable.tsx` — same header gating

**Changes**:

`src/lib/devMode.ts`:
```typescript
export const APP_ENV = (import.meta.env.VITE_APP_ENV || 'dev') as 'dev' | 'staging' | 'prod';
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
export const DEMO_MODE_ALLOWED = APP_ENV !== 'prod';
export const AUTH_ENABLED = APP_ENV === 'prod' || import.meta.env.VITE_AUTH_ENABLED === 'true';
export const DEMO_MODE = DEMO_MODE_ALLOWED;
```

`UserContext.tsx` and `UsersTable.tsx`: replace `!AUTH_ENABLED` check for actingHeaders with `DEMO_MODE_ALLOWED && !AUTH_ENABLED`.

`UserSelector.tsx`: already uses `DEMO_MODE && !AUTH_ENABLED` — update to use `DEMO_MODE_ALLOWED && !AUTH_ENABLED`.

**Tests**:
- No env var set → `APP_ENV='dev'`, demo selector visible, `x-acting-user-id` sent
- `VITE_APP_ENV=prod` → `AUTH_ENABLED=true`, demo selector hidden, no demo header sent
- `VITE_APP_ENV=staging` → demo allowed, auth follows explicit var

**Rollback**: Revert `devMode.ts`, `UserContext.tsx`, `UsersTable.tsx`.

---

### Brick 4.2 — Edge Function: Reject demo header in prod

**Scope**: Add env policy to `admin-users` so `x-acting-user-id` is rejected when `APP_ENV=prod`.

**Files (1)**:
1. `supabase/functions/admin-users/index.ts` — add env check in `resolveCallerId`

**Changes**:
In `resolveCallerId`, after JWT resolution fails, before accepting `x-acting-user-id`:
```typescript
const appEnv = Deno.env.get('APP_ENV') || 'dev';
const demoAllowed = appEnv !== 'prod';
if (!demoAllowed) {
  return { callerId: null, error: 'Demo mode disabled in production' };
}
```

Add `mode` and `policy` debug fields to success responses.

**Secret needed**: `APP_ENV` secret must be set (defaults to `dev` if absent).

**Tests**:
- Dev: `x-acting-user-id` works for admin roster user
- Prod (`APP_ENV=prod`): same request returns 403
- JWT works in all envs and ignores `x-acting-user-id`

**Rollback**: Revert the file.

---

### Brick 4.3 — verify_jwt strategy

**Decision: No action needed.**

Per `knowledge://disable-jwt-edge-functions`, this project uses Supabase's signing-keys system. The default `verify_jwt = true` is deprecated and doesn't work with signing-keys. The current approach (`verify_jwt = false` + in-code JWT validation via `getUser()`) is the correct pattern. No changes.

---

### Brick 4.4 (Plan only) — Dashboard query-layer enforcement

**Current state**: All data comes from seed files loaded into React state. There are no Supabase queries for time entries on the dashboard — `TimeEntriesContext` loads seed data into memory.

**Scope filtering location**: `useDashboardDataset.ts` lines 81-89. This filters `allUsers` by scope, then filters entries by user IDs. The scope dropdown visibility is controlled by `appRole` checks (lines 67-68).

**UI-only enforcement paths**:
1. `canViewOrg` / `canViewDepartment` — controls which scope options appear in dropdown
2. `AdminGuard` — controls access to `/admin/*` routes (checks `isAdmin` which includes `leadership`)
3. `scopedUsers` — filters by `currentUser.id` for "my" scope, by `departmentId` for "department"

**Gaps**:
- `getAllEntries()` returns all entries regardless of caller. Any user who passes `AdminGuard` can access all data.
- HoD users can select "org" scope if they manipulate React state (the dropdown hides it, but it's not enforced).
- No RLS since data is in-memory seed.

**Proposed patch (≤3 files)**:
1. `src/hooks/useDashboardDataset.ts` — hard-enforce scope at query layer:
   - If `appRole === 'hod'` and `scope === 'org'` → force to `'department'`
   - If `appRole === 'hod'` and `scope === 'department'` → verify `selectedDeptId` is in `managedDepartments`
   - If `appRole === 'employee'` → force scope to `'my'`
2. `src/contexts/TimeEntriesContext.tsx` — `getAllEntries()` should check role and filter:
   - Employee: own entries only
   - HoD: own + managed department entries
   - Leadership/Admin/Super_admin: all
3. `src/pages/AdminReportsOverview.tsx` — no change needed if query layer enforces

This brick should be implemented when the app moves from seed data to real Supabase queries, as the current in-memory model makes query-layer enforcement partially moot (all data is already on the client).

---

## Implementation Order

```text
4.1 (frontend env policy) → 4.2 (edge function env policy) → 4.3 (skip) → 4.4 (deferred to data migration)
```

Total files for 4.1 + 4.2: 4 files + 1 edge function redeploy.

