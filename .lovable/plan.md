

# Brick D2: Super-Admin Bootstrap + Secure Impersonation

## A. Database Changes

### A1. Add `super_admin` to `app_role` enum

```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
```

### A2. Promote break-glass user

```sql
UPDATE public.user_roles
SET role = 'super_admin'
WHERE user_id = (SELECT id FROM public.profiles WHERE email = 'it@growthafrica.com');

-- If no row exists yet:
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin' FROM public.profiles WHERE email = 'it@growthafrica.com'
ON CONFLICT (user_id, role) DO NOTHING;
```

### A3. Update `has_role` to treat `super_admin` as superset of `admin`

Replace the function so that checking `has_role(uid, 'admin')` returns true for both `admin` and `super_admin`:

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND (
        role = _role
        OR (role = 'super_admin' AND _role = 'admin')
      )
  )
$$;
```

This is the only SQL change needed for RLS. Every existing policy already uses `has_role(auth.uid(), 'admin')`, so `super_admin` automatically inherits all admin access across all tables -- no per-table policy changes required.

### A4. Fix remaining RESTRICTIVE policies

The last migration fixed `profiles` and `user_roles`, but these tables still have `Permissive: No` (RESTRICTIVE) SELECT policies:

| Table | Policy to drop and recreate as PERMISSIVE |
|---|---|
| `activity_types` | "Anyone can read activity_types" |
| `deliverable_types` | "Anyone can read deliverable_types" |
| `departments` | "Anyone can read departments" |
| `internal_work_areas` | "Anyone can read internal_work_areas" |
| `phases` | "Anyone can read phases" |
| `projects` | "Anyone can read projects" |
| `project_department_access` | "Anyone can read project_department_access" |
| `time_entries` | "Users can read own entries or admin reads all" |
| `week_statuses` | "Users can read own week statuses or admin reads all" |

All SELECT (and write) policies on these tables are currently RESTRICTIVE. They must be dropped and recreated as PERMISSIVE (the Postgres default). The policy expressions stay identical -- only the `AS RESTRICTIVE` qualifier is removed.

## B. Edge Function: `admin-impersonate`

**Purpose**: Generate a short-lived magic link or session token for a target user. Super-admin only.

**Endpoint**: `POST /admin-impersonate`

**Request body**:
```json
{ "targetUserId": "uuid-of-user-to-impersonate" }
```

**Server-side logic** (in `supabase/functions/admin-impersonate/index.ts`):
1. Validate caller JWT via `callerClient.auth.getUser()`.
2. Check `has_role(callerId, 'super_admin')` using `adminClient` -- reject if not super_admin.
3. Prevent self-impersonation.
4. Use `adminClient.auth.admin.generateLink({ type: 'magiclink', email: targetEmail })` to get a one-time login link.
5. Return `{ url: actionLink }` to the caller.

**Response**:
```json
{ "url": "https://...supabase.co/auth/v1/verify?token=...&type=magiclink&redirect_to=/" }
```

The admin opens this URL in an incognito window to start an authenticated session as the target user. No demo switcher is re-enabled; this uses real auth sessions.

**Config** (`supabase/config.toml`):
```toml
[functions.admin-impersonate]
verify_jwt = false
```

## C. App-Side File List (7 files, within the 8-file limit)

| # | File | Change |
|---|---|---|
| 1 | `src/types/index.ts` | Add `'super_admin'` to `AppRole` union type |
| 2 | `src/contexts/UserContext.tsx` | Update `isAdmin` to include `super_admin`; add `isSuperAdmin` flag |
| 3 | `src/App.tsx` | Update `AdminGuard` to allow `super_admin` |
| 4 | `src/pages/admin/AdminUsers.tsx` | Add "Login as" button (visible to super_admin only) |
| 5 | `src/components/admin/UsersTable.tsx` | Render "Login as" action; call edge function; open link in new tab |
| 6 | `supabase/functions/admin-impersonate/index.ts` | New edge function (design above) |
| 7 | Migration SQL file | enum + has_role + RESTRICTIVE fix + promote it@growthafrica.com |

## D. Step-by-Step Implementation Order

1. **Migration**: Add `super_admin` enum value, update `has_role()`, fix all RESTRICTIVE policies, promote `it@growthafrica.com`.
2. **`src/types/index.ts`**: `export type AppRole = 'admin' | 'employee' | 'super_admin';`
3. **`src/contexts/UserContext.tsx`**: Add `isSuperAdmin: currentUser?.appRole === 'super_admin'` to context. Update `isAdmin` check to `appRole === 'admin' || appRole === 'super_admin'`.
4. **`src/App.tsx`**: `AdminGuard` already reads `isAdmin` from context -- no change needed if step 3 is done correctly.
5. **`supabase/functions/admin-impersonate/index.ts`**: Create the edge function.
6. **`src/components/admin/UsersTable.tsx`**: Add "Login as" button for super_admin, calling the edge function and opening the returned URL.

## E. Test Plan

| # | Scenario | Expected |
|---|---|---|
| 1 | Sign in as `it@growthafrica.com` | Lands on admin dashboard; context shows `isSuperAdmin = true` |
| 2 | Sign in as `ngo@growthafrica.com` (admin) | Admin dashboard works; "Login as" button is NOT visible |
| 3 | Super-admin visits `/admin/users` | "Login as" button appears next to each non-self user |
| 4 | Super-admin clicks "Login as" on an employee | Edge function returns magic link; opens in new tab; new tab is authenticated as that employee |
| 5 | Non-super-admin calls `/admin-impersonate` directly | Returns 403 Forbidden |
| 6 | All reference data tables load for authenticated users | Confirms RESTRICTIVE-to-PERMISSIVE fix works |
| 7 | Break-glass: run promotion SQL for a new email | That user gains super_admin access on next login |

## F. Break-Glass SQL (save for emergencies)

```sql
-- Promote any user to super_admin by email
UPDATE public.user_roles
SET role = 'super_admin'
WHERE user_id = (
  SELECT id FROM public.profiles WHERE email = 'TARGET_EMAIL_HERE'
);
```

