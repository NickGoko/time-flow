

# Auth Discovery Audit Report

---

## 1. Current User Model

**Source of truth table**: `profiles` (Supabase, public schema)

| Field | Column | Source |
|---|---|---|
| Identity (PK) | `id` (uuid) | `profiles.id` — currently decoupled from `auth.users`. No foreign key constraint. |
| Name | `name` (text) | `profiles.name` |
| Email | `email` (text, unique) | `profiles.email` |
| Department | `department_id` (text, nullable) | `profiles.department_id` |
| Job title | `role` (text) | `profiles.role` — this is the *job title*, not the app role |
| Weekly hours | `weekly_expected_hours` (int, default 40) | `profiles.weekly_expected_hours` |
| Active status | `is_active` (bool, default true) | `profiles.is_active` |
| Avatar | `avatar_url` (text, nullable) | `profiles.avatar_url` |
| Created | `created_at` (timestamptz) | `profiles.created_at` |

**App role**: Stored in a separate `user_roles` table (`user_id` uuid, `role` app_role enum). Enum values: `employee`, `hod`, `leadership`, `admin`, `super_admin`. One row per user (unique constraint on `user_id`).

**Department scope** (for HODs): `user_department_scope` table (`user_id`, `department_id`).

**TypeScript model**: `src/types/index.ts` — `User` interface. The `id` field is `string` (accepts both seed text IDs and real UUIDs).

**Auth-related field**: There is no explicit `auth_user_id` column. The `profiles.id` IS the auth user ID when provisioned — the `handle_new_user()` trigger does `ON CONFLICT (email) DO UPDATE SET id = NEW.id`, meaning when auth provisions a user, the profile's UUID is rewritten to match `auth.users.id`.

**Confirmed**: `profiles` has no FK to `auth.users` (intentionally removed to support demo mode / CSV-imported users without auth accounts).

---

## 2. Current Users Management Flow

### Users page (`src/pages/admin/AdminUsers.tsx` → `src/components/admin/UsersTable.tsx`)
- Displays `allUsersList` from `UserContext` (all profiles, including inactive)
- Columns: Name, Email, Department, Role, App Role, Weekly Hours, Auth actions, Impersonate

### "Invite User" action
- Opens `UserDialog` for creating a new user
- Calls `UserContext.addUser()` → invokes `admin-users` Edge Function with `action: 'create'`
- Edge Function: calls `adminClient.auth.admin.inviteUserByEmail()`, waits for `handle_new_user` trigger to create profile, then updates profile fields and role
- **This creates a real auth account and sends an email invite**

### Auth provisioning actions (dropdown per user row)
- **Send Invite** (`provision-invite`): For CSV-imported profiles without auth. Creates auth user or re-sends magiclink. Syncs `profiles.id` to match `auth.users.id`.
- **Reset Password** (`send-reset`): Generates recovery link. Fails if no auth account exists.
- **Create Login** (`create-with-password`, super_admin only): Creates auth account with explicit password, auto-confirms email.

### Bulk provisioning
- `src/pages/admin/AdminImportExport.tsx` has a "Provision Logins" tab for batch invites.
- Calls `UserContext.bulkProvision()` → `admin-users` Edge Function `action: 'bulk-provision'`.

### Editing users
- Admins can edit all fields via `UserDialog` → `updateUser()` → Edge Function `action: 'update'`
- Changes are audited in `audit_log` table with before/after snapshots and mandatory reason

### Impersonation
- Super-admins only. `admin-impersonate` Edge Function generates a magic link for the target user, opened in new tab.
- **Confirmed**: This is real auth impersonation, not a UI switcher.

### Demo mode user switching
- `src/components/UserSelector.tsx`: When `DEMO_MODE=true && AUTH_ENABLED=false`, shows a dropdown of all active users. Sets `currentUser` in React state only — no auth session.
- `src/pages/DevAccess.tsx`: Lists all profiles from DB, lets you select one or enter email manually to create synthetic admin session. No real auth.
- `src/contexts/UserContext.tsx` line 151: `setDevUser()` — sets user in state, bypasses auth.

---

## 3. Current Auth Implementation State

### Auth integration status: **FULLY IMPLEMENTED but DISABLED by default**

**Control flags** (`src/lib/devMode.ts`):
```
AUTH_ENABLED = false  ← auth is off
DEMO_MODE = true      ← user-switcher dropdown enabled
DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'
```

### Files referencing auth:

| File | What it does | Real vs Placeholder |
|---|---|---|
| `src/contexts/UserContext.tsx` | Full auth lifecycle: `onAuthStateChange`, `getSession`, `signOut`, `fetchUserProfile` | **Real** — fully wired but gated behind `AUTH_ENABLED` |
| `src/pages/SignIn.tsx` | Sign-in + sign-up forms using `supabase.auth.signInWithPassword` and `supabase.auth.signUp` | **Real** |
| `src/pages/DevAccess.tsx` | Dev-only user picker, bypasses auth | **Real dev tool** |
| `src/App.tsx` → `SessionGate` | Route guard: redirects to `/sign-in` (or `/dev/access` in DEV_MODE) if no `currentUser` | **Real** but bypassed when `AUTH_ENABLED=false` |
| `src/App.tsx` → `AdminGuard` | Checks `isAdmin` from context | **Real** |
| `src/components/UserSelector.tsx` | Sign-out button (auth mode) or user switcher (demo mode) | **Real** |
| `src/components/TopBar.tsx` | Contains `UserSelector` | Passive |
| `supabase/functions/admin-users/index.ts` | `resolveCallerId()` — JWT or `x-acting-user-id` fallback | **Real** |
| `supabase/functions/admin-impersonate/index.ts` | Magic link generation for impersonation | **Real** |

### Partial/broken auth logic: **None**. The auth implementation is complete and functional. It's simply toggled off via `AUTH_ENABLED = false`.

---

## 4. Current Routing and Access Behaviour

### Public routes (no session required):
- `/sign-in` — Sign in/up page
- `/dev/access` — Dev mode user picker

### Protected routes (behind `SessionGate`):
- `/` — Employee timesheet (Index)
- `/me/insights` — Employee personal dashboard
- `/admin` — Admin dashboard (additionally behind `AdminGuard`)
- `/admin/reports/overview`, `/admin/reference-data`, `/admin/users`, `/admin/import-export`, `/admin/roles`, `/admin/audit`

### How active user is determined today (AUTH_ENABLED=false):
1. App loads → `UserProvider` runs the "auth-disabled" effect
2. Fetches all profiles + roles from Supabase via anon key
3. Auto-selects first admin/super_admin as `currentUser`
4. `SessionGate` sees `currentUser` is set → renders children
5. User can switch via the dropdown in `TopBar`

### When AUTH_ENABLED=true:
1. `onAuthStateChange` + `getSession()` check for existing session
2. If no session → redirect to `/sign-in` (or `/dev/access` if DEV_MODE)
3. On sign-in → `fetchUserProfile(session.user.id)` loads from `profiles` + `user_roles`
4. On sign-out → clears state, supabase session destroyed
5. Failed sign-in → error message displayed on form, no redirect

---

## 5. Supabase and Environment Configuration

### Environment variables:
- `VITE_SUPABASE_URL` — used by client
- `VITE_SUPABASE_PUBLISHABLE_KEY` — anon key, used by client
- `VITE_SUPABASE_PROJECT_ID` — available but not used in app code
- `VITE_DEV_MODE` — controls dev mode features

### Supabase client: `src/integrations/supabase/client.ts` (auto-generated, DO NOT EDIT)

### Files depending on Supabase client:
- `src/contexts/UserContext.tsx` — auth + profile queries
- `src/contexts/ReferenceDataContext.tsx` — reference data loads
- `src/contexts/TimeEntriesContext.tsx` — uses seed data, not Supabase for time entries
- `src/components/admin/UsersTable.tsx` — impersonation edge function calls
- `src/pages/SignIn.tsx` — auth calls
- `src/pages/DevAccess.tsx` — profile/role queries

### Service-role operations in frontend: **NONE**. All privileged operations (user creation, role changes, impersonation) go through Edge Functions that use `SUPABASE_SERVICE_ROLE_KEY` server-side.

### Edge Function config (`supabase/config.toml`):
```toml
[functions.admin-users]
verify_jwt = false
[functions.admin-impersonate]
verify_jwt = false
```
Both use `resolveCallerId()` for manual auth validation.

---

## 6. Risks and Fragile Areas

### Risk 1: Profile ID rewrite on auth provisioning
The `handle_new_user()` trigger does `ON CONFLICT (email) DO UPDATE SET id = NEW.id`. When a CSV-imported profile (with a random UUID) gets an auth invite, the profile's PK changes. This cascades to `user_roles` and `user_department_scope` via Edge Function logic — but `time_entries.user_id` has **no cascade**. Existing time entries would become orphaned.

**Confirmed**: `time_entries.user_id` has no FK constraint, so no cascade. The Edge Function (`provision-invite`) manually updates `profiles.id` and `user_roles.user_id` but does NOT update `time_entries.user_id`.

### Risk 2: Seed data vs DB data divergence
`src/data/seed.ts` contains hardcoded users with text IDs like `'user-ilo'`. The database has real UUIDs. The `TimeEntriesContext` currently loads from seed data, not the database. If auth is enabled, `currentUser.id` will be a real UUID, but seed time entries reference text IDs → zero entries will match.

### Risk 3: Demo mode dependencies
Multiple components check `AUTH_ENABLED`, `DEMO_MODE`, `DEV_MODE`. Flipping `AUTH_ENABLED` to `true` requires:
- Users to have real auth accounts (invites sent)
- Time entries to be in the database (not seed data)
- The `x-acting-user-id` fallback in Edge Functions becomes unused

### Risk 4: RLS policies assume auth
`time_entries` RLS: `user_id = auth.uid()` — this works only with real auth sessions. Currently bypassed because the app uses seed data in-memory. If the app switches to querying `time_entries` from Supabase with `AUTH_ENABLED=false`, anon reads would fail (no `auth.uid()`). The open-access policies mentioned in architecture notes may have been removed or may only be on specific tables.

### Risk 5: `isAdmin` includes `leadership`
`UserContext.tsx` line 307: `isAdmin` is true for `admin`, `super_admin`, AND `leadership`. This means leadership users can access all admin routes. This is a design choice, not a bug, but could surprise if auth policies diverge.

---

## 7. Unknowns (Cannot Verify from Code Alone)

1. **Which profiles have auth accounts**: The `profiles` table has 27 rows but we cannot query `auth.users` from the client to know which have been provisioned. The `provision-invite` Edge Function checks via `admin.listUsers()` but this data isn't exposed to the frontend.

2. **Email confirmation setting**: Whether auto-confirm is enabled in auth settings. The `SignIn.tsx` sign-up flow shows "Check your email for a confirmation link" suggesting auto-confirm is OFF, but this needs dashboard verification.

3. **Trigger existence**: The schema info says "There are no triggers in the database" but `handle_new_user()` function exists. The trigger may be attached to `auth.users` (a reserved schema not visible in the query). Cannot confirm it's active without dashboard access.

4. **Time entries in database**: `TimeEntriesContext` uses seed data. Whether any real time entries exist in the `time_entries` table is unknown — the context never queries it.

5. **Open-access RLS policies**: Architecture notes mention open-access policies on `time_entries` and `week_statuses` for demo mode, but the current RLS policies shown require `auth.uid()`. These may have been changed since the notes were written.

