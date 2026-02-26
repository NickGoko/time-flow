

# Brick 1: Disable Auth Gating with AUTH_ENABLED / DEMO_MODE Flags

## Problem

The app currently requires a Supabase auth session to access any page. All RLS policies use `auth.uid()`, so without a session, database reads/writes fail too. We need to bypass auth gating in the UI while keeping the code intact for re-enabling later.

## RLS Dependency (Critical)

All 9+ tables have RLS policies that call `auth.uid()`. Without a real session, the anon key returns no rows. Two options:

- **Option chosen**: Add a PERMISSIVE "anon can read" SELECT policy to reference-data tables and use the service role key via an edge function for writes. However, this is complex.
- **Simpler approach for Brick 1**: Use `DEMO_MODE` to set the acting user in context only (UI gating). For DB access, add PERMISSIVE SELECT policies with `true` for all tables so the anon key can read. For writes, we scope to acting user ID in the app code -- the existing INSERT/UPDATE policies require `auth.uid() = user_id`, which will fail without a session. We need to add PERMISSIVE policies that allow writes when there is no auth session (demo-only).

**Chosen approach**: Since all policies are already RESTRICTIVE (and broken), we will fix them to PERMISSIVE in this brick AND add open-access policies for demo mode. This is a prerequisite -- without it, the app cannot load any data.

## A. Auth Gating Inventory

| Location | What it does | Change needed |
|---|---|---|
| `src/lib/devMode.ts` | `DEV_MODE` flag from env | Replace with `AUTH_ENABLED` and `DEMO_MODE` flags |
| `src/App.tsx` `SessionGate` | Redirects to sign-in if no `currentUser` | Bypass when `!AUTH_ENABLED` |
| `src/App.tsx` `AdminGuard` | Blocks non-admin users | Keep -- still checks acting user role |
| `src/contexts/UserContext.tsx` | Listens to `supabase.auth.onAuthStateChange`, sets user from session | When `!AUTH_ENABLED`, skip auth listener, load users from DB directly, auto-select first admin |
| `src/components/UserSelector.tsx` | Shows name + sign-out button | When `DEMO_MODE`, show a dropdown switcher instead of sign-out |
| `src/components/TopBar.tsx` | Uses `useAuthenticatedUser()` | No change needed if context provides user |
| `src/pages/SignIn.tsx` | Sign-in page | Stays but unused when `!AUTH_ENABLED` |
| `src/pages/DevAccess.tsx` | Dev mode user picker | Stays but unused -- replaced by in-app switcher |

## B. Files Changed (6 files)

| # | File | Change |
|---|---|---|
| 1 | `src/lib/devMode.ts` | Add `AUTH_ENABLED` and `DEMO_MODE` constants alongside existing `DEV_MODE` |
| 2 | `src/contexts/UserContext.tsx` | When `!AUTH_ENABLED`: skip auth listener, load profiles+roles via anon client, auto-select first user, expose `setActingUser` for switcher |
| 3 | `src/App.tsx` | `SessionGate`: when `!AUTH_ENABLED`, pass through without redirect. Remove `/sign-in` and `/dev/access` redirects in this mode |
| 4 | `src/components/UserSelector.tsx` | When `DEMO_MODE`: render a dropdown of all active users instead of just name+sign-out |
| 5 | Migration SQL | Drop all RESTRICTIVE policies, recreate as PERMISSIVE. Add open SELECT+INSERT+UPDATE+DELETE policies for demo mode on `time_entries` and `week_statuses` (scoped by app logic, not RLS) |
| 6 | `src/integrations/supabase/types.ts` | Auto-updated by migration |

## C. Implementation Details

### Step 1: `src/lib/devMode.ts`

```typescript
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
export const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED !== 'false'; // default true
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'; // default false
```

For now, we set in `.env` (but we do NOT edit `.env` -- these are compile-time defaults):
- `AUTH_ENABLED` defaults to `true` but we hardcode `false` in the constant for now
- `DEMO_MODE` defaults to `false` but we hardcode `true` for now

Actually, since we cannot edit `.env`, we hardcode:
```typescript
export const AUTH_ENABLED = false;
export const DEMO_MODE = true;
```

### Step 2: `src/contexts/UserContext.tsx`

Add a branch in `UserProvider`:
- When `!AUTH_ENABLED`: do NOT subscribe to `supabase.auth.onAuthStateChange`
- Instead, call `refreshAllUsers()` on mount, then auto-select the first admin user as `currentUser`
- Expose `setActingUser(user)` which sets `currentUser` to that user (for the switcher)
- `signOut` in demo mode just clears the acting user (no supabase call)
- Keep all existing auth code behind an `if (AUTH_ENABLED)` branch

### Step 3: `src/App.tsx`

In `SessionGate`:
```typescript
if (!AUTH_ENABLED) return <Outlet />;
```
This bypasses the redirect entirely. The existing auth routes (`/sign-in`, `/dev/access`) remain in the router but are simply unused.

### Step 4: `src/components/UserSelector.tsx`

When `DEMO_MODE`:
- Import `allUsers` from context
- Render a `<Select>` dropdown with all active users
- On change, call `setActingUser(selectedUser)`
- Hide the sign-out button

### Step 5: Migration SQL

Drop every RESTRICTIVE policy and recreate as PERMISSIVE (same expressions). This is required because RESTRICTIVE policies with `auth.uid()` return nothing for anon connections.

For demo mode to allow writes to `time_entries` and `week_statuses` without a session, add additional PERMISSIVE policies:
- `time_entries`: INSERT/UPDATE/DELETE with `true` (app-level scoping handles user filtering)
- `week_statuses`: INSERT/UPDATE with `true`

Reference data tables (departments, projects, phases, etc.) already have admin-only write policies -- in demo mode, admin writes go through the edge function which uses the service role key, so no additional policies needed there.

## D. Acceptance Tests

| # | Test | Expected |
|---|---|---|
| 1 | Open app in fresh browser (no session, no cookies) | App loads main UI, no redirect to sign-in |
| 2 | User switcher visible in top bar | Shows dropdown with all active users from profiles table |
| 3 | Select an employee user | Main timesheet page loads, scoped to that user |
| 4 | Select an admin user | Admin badge appears, admin nav links visible, admin pages accessible |
| 5 | Select employee again | Admin pages blocked by AdminGuard, redirected to employee view |
| 6 | `/sign-in` route still accessible if navigated to directly | Page renders but is not used in normal flow |
| 7 | Reference data loads (departments, projects, phases) | All tables return data via anon key with PERMISSIVE policies |

