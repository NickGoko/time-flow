

## Brick 3: Auth UI + Session Context

### Objective

Replace the demo user-picker sign-in with real email/password authentication, and rewire `UserContext` to use the authentication session + `profiles` table + `user_roles` table as the source of truth for the current user.

### Current State

- `SignIn.tsx`: Shows a grid of demo users; clicking one stores their ID in localStorage
- `UserContext.tsx`: Reads `currentUser` from localStorage; provides `allUsers`, `addUser`, `updateUser`, `toggleUserActive` (all localStorage-based)
- `UserSelector.tsx`: Shows current user name + sign-out button (clears localStorage)
- `App.tsx`: `SessionGate` checks `currentUser !== null`; `AdminGuard` checks `isAdmin`
- The `User` type uses `string` for `id` and includes `appRole: AppRole`

### Key Design Decision: User type compatibility

The `User` interface has `id: string` -- this stays compatible since `uuid` serializes to string. The `appRole` field will now come from `user_roles` table instead of being stored on the user object directly. We map `profiles` + `user_roles` query results into the existing `User` shape so **no downstream components need changes**.

### Files to Change (4 files)

| # | File | Action | What Changes |
|---|---|---|---|
| 1 | `src/contexts/UserContext.tsx` | REWRITE | Replace localStorage identity with Supabase Auth session. On mount: listen to `onAuthStateChange`, fetch profile + role from DB, map to `User` type. `signOut` calls `supabase.auth.signOut()`. Keep `allUsers`/`addUser`/`updateUser`/`toggleUserActive` reading from `profiles` table. Add `isLoading` state. |
| 2 | `src/pages/SignIn.tsx` | REWRITE | Email/password login form with tabs for Sign In and Sign Up. On submit, call `supabase.auth.signInWithPassword()` or `supabase.auth.signUp()`. Keep the demo user-picker behind `import.meta.env.DEV` flag. |
| 3 | `src/components/UserSelector.tsx` | EDIT (small) | Change `handleSignOut` to call `supabase.auth.signOut()` instead of the context `signOut` (context `signOut` will internally do the same, but this ensures the Supabase session is cleared). Actually -- context `signOut` will call supabase internally, so this file only needs the navigate kept. Minimal change. |
| 4 | `src/App.tsx` | EDIT (small) | `SessionGate` needs to handle loading state (show spinner while auth resolves). No route changes needed. |

### Detailed Plan

**Step 1: Rewrite `UserContext.tsx`**

The provider will:
1. Initialize with `isLoading: true`, `currentUser: null`
2. Set up `supabase.auth.onAuthStateChange()` listener FIRST (before `getSession`)
3. On `SIGNED_IN` / `TOKEN_REFRESHED`: fetch `profiles` row + `user_roles` row for `session.user.id`
4. Map DB result to the existing `User` type:
   ```text
   {
     id: profile.id,           // uuid as string
     name: profile.name,
     email: profile.email,
     departmentId: profile.department_id ?? '',
     role: profile.role,       // job title
     appRole: userRole.role,   // 'admin' | 'employee'
     weeklyExpectedHours: profile.weekly_expected_hours,
     isActive: profile.is_active,
     avatarUrl: profile.avatar_url
   }
   ```
5. On `SIGNED_OUT`: set `currentUser` to null
6. Set `isLoading: false` after initial session check
7. `signOut()` calls `supabase.auth.signOut()`
8. `allUsers` / `allUsersList`: fetch from `profiles` table joined with `user_roles` (needed for admin user management). Cache in state.
9. `addUser`, `updateUser`, `toggleUserActive`: keep signatures but defer to Brick 6 (admin edge function). For now, these can be no-ops or throw "not implemented" -- OR we can keep localStorage fallback temporarily. Decision: **keep them as no-ops with a console.warn** since admin user management will be fully reworked in Brick 6.

**Step 2: Rewrite `SignIn.tsx`**

- Two tabs: "Sign In" and "Sign Up"
- Sign In: email + password fields, submit calls `supabase.auth.signInWithPassword()`
- Sign Up: email + password + name fields, submit calls `supabase.auth.signUp()` with `data: { full_name: name }` (the trigger uses `raw_user_meta_data->>'full_name'`)
- Error display for invalid credentials, already-registered, etc.
- After successful sign-in, `onAuthStateChange` in UserContext handles the rest -- no manual navigate needed (SessionGate will redirect)
- DEV-only: show the existing demo user picker below the form, behind `import.meta.env.DEV`

**Step 3: Update `App.tsx`**

- `SessionGate`: add `isLoading` check from context. While loading, render a centered spinner. Once resolved, redirect to `/sign-in` if no user.
- Export `isLoading` from UserContext (add to interface).

**Step 4: Update `UserSelector.tsx`**

- Minimal: `signOut` from context already calls `supabase.auth.signOut()`, so the only change is ensuring navigate happens after the async sign-out completes (add `await`).

### What Does NOT Change

- `types/index.ts` -- `User` interface stays identical
- `ReferenceDataContext.tsx` -- untouched
- `TimeEntriesContext.tsx` -- untouched
- All admin pages, components, TopBar, NavLink
- All UI components
- No new routes needed (sign-up is a tab on the sign-in page, not a separate route)
- No migration needed (tables already exist from Brick 2)

### RLS Note

The `profiles` SELECT policy currently uses `USING (true)` which requires authentication. The `user_roles` SELECT policy uses `USING (auth.uid() = user_id)` so users can only read their own role. This is correct -- the context fetches the current user's own profile and role after auth.

However, `allUsers` (used by admin pages) fetches ALL profiles. The current `profiles` SELECT policy allows this for any authenticated user. The `user_roles` policy only allows reading own roles -- so the admin's `allUsers` list won't have `appRole` for other users. We need to either:
- Add an admin SELECT policy on `user_roles`: `has_role(auth.uid(), 'admin')` -- **requires a small migration**
- Or fetch `appRole` only for the current user and leave it undefined for others

Decision: **Add a migration** to allow admins to read all `user_roles`. This is 1 SQL statement.

### Migration Needed (1 small addition)

Add SELECT policy on `user_roles`:
```sql
CREATE POLICY "Admins can read all roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
```

This brings the file count to: 1 migration + 4 code files = **5 touches, within limit**.

### Test Checklist

| # | Test | Expected |
|---|---|---|
| 1 | Navigate to `/sign-in` | See email/password login form with Sign In / Sign Up tabs |
| 2 | Sign up with email + password + name | Success message (check email or auto-confirmed depending on config) |
| 3 | Sign in with valid credentials | Redirected to `/` (employee) or `/admin/reports/overview` (admin) |
| 4 | Sign in with wrong password | Error message shown, stays on sign-in page |
| 5 | Click "Sign out" in top bar | Redirected to `/sign-in`; refreshing stays on sign-in |
| 6 | Refresh while signed in | Session persists, user stays on current page |
| 7 | Navigate to protected route while signed out | Redirected to `/sign-in` |
| 8 | As admin, verify `isAdmin` is true | Admin nav links visible, admin pages accessible |
| 9 | As employee, navigate to `/admin/*` | "Not authorised" message shown |
| 10 | DEV mode: demo user picker visible below login form | Picker shown only in development |

