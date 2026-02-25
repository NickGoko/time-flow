

## Brick 4: Wire Admin CRUD (Reference Data + User Management) to Database

### Objective

Replace all localStorage-based mutations in `ReferenceDataContext` with Supabase writes, AND implement secure admin user management via an Edge Function that uses the service role key to create/invite users and manage their profiles and roles.

### Scope: 2 Parts

**Part A -- Reference Data CRUD (7 tables)**
Rewrite the 18 mutation callbacks in `ReferenceDataContext.tsx` to write to the database instead of localStorage.

**Part B -- Admin User Management (Edge Function)**
Create an `admin-users` Edge Function that uses the Supabase Admin API (service role key, server-side only) to:
- Create/invite new users (creates `auth.users` entry, which triggers profile + role creation)
- Update user profiles (name, department, role, weekly hours)
- Update user app roles (admin/employee) in `user_roles`
- Toggle user active status

---

### Part A: Reference Data CRUD

**Migration (1 file):** Add INSERT, UPDATE, DELETE RLS policies to all 7 reference tables, gated by `has_role(auth.uid(), 'admin'::app_role)`.

Tables: `departments`, `projects`, `project_department_access`, `phases`, `activity_types`, `internal_work_areas`, `deliverable_types`.

**Code change (1 file):** `src/contexts/ReferenceDataContext.tsx`
- Replace all 18 `persist(LS_KEY, ...)` calls with Supabase `.insert()` / `.update()` / `.delete()`
- Use optimistic UI pattern: update state immediately, rollback on DB error
- Remove `loadOrSeed`, `persist`, and all `LS_*` constants
- Keep initial fetch from Supabase (already working from Brick 1)

---

### Part B: Admin User Management

**Why an Edge Function?**
Creating users requires the Supabase Admin API (`supabase.auth.admin.createUser()` or `inviteUserByEmail()`), which needs the **service role key**. This key must NEVER be in client code. An Edge Function runs server-side and can safely use it.

**Edge Function: `supabase/functions/admin-users/index.ts`**

Endpoints (single function, action-based):
```text
POST /admin-users
Body: { action: "create", email, name, departmentId, role, appRole, weeklyExpectedHours }
      { action: "update", userId, updates: { name?, departmentId?, role?, appRole?, weeklyExpectedHours? } }
      { action: "toggle-active", userId }
```

Logic per action:

1. **create**: 
   - Validate caller is admin (via `getClaims()` + check `user_roles`)
   - Call `adminClient.auth.admin.inviteUserByEmail(email, { data: { full_name: name } })`
   - This triggers `handle_new_user` trigger, creating profile + default employee role
   - Then update the profile with department, role, weekly hours
   - If appRole is 'admin', update `user_roles` accordingly

2. **update**:
   - Validate caller is admin
   - Update `profiles` row (name, department_id, role, weekly_expected_hours)
   - If appRole changed, update `user_roles` (delete old + insert new, or upsert)

3. **toggle-active**:
   - Validate caller is admin
   - Toggle `is_active` on `profiles`

**Config (`supabase/config.toml`):** Add `[functions.admin-users]` with `verify_jwt = false`.

**RLS additions needed:**
- Admin INSERT/UPDATE/DELETE on `profiles` (currently only self-update exists)
- Admin INSERT/UPDATE/DELETE on `user_roles` (currently read-only)

These will be included in the migration.

**Code changes:**

| # | File | Action |
|---|---|---|
| 1 | Migration SQL | NEW -- admin write RLS on 7 ref tables + profiles + user_roles |
| 2 | `src/contexts/ReferenceDataContext.tsx` | EDIT -- rewrite 18 mutations to use Supabase client |
| 3 | `supabase/functions/admin-users/index.ts` | NEW -- Edge Function for user CRUD |
| 4 | `src/contexts/UserContext.tsx` | EDIT -- wire `addUser`, `updateUser`, `toggleUserActive` to call the Edge Function |
| 5 | `src/components/admin/UserDialog.tsx` | EDIT (small) -- make dialog async, show loading/error states |
| 6 | `src/components/admin/UsersTable.tsx` | EDIT (small) -- handle async save, refresh user list after mutations |

Total: 1 migration + 1 edge function + 4 code files = **6 touches**.

---

### Detailed Implementation

**Migration SQL**

```sql
-- Reference data: admin write access (7 tables x 3 operations = ~20 policies)
-- Example for departments:
CREATE POLICY "Admins can insert departments"
  ON public.departments FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update departments"
  ON public.departments FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete departments"
  ON public.departments FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
-- (repeat for projects, phases, activity_types, internal_work_areas, 
--  deliverable_types, project_department_access)

-- User management: admin access to profiles and user_roles
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert user_roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update user_roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete user_roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
```

**Edge Function: `admin-users/index.ts`**

```text
1. Parse JSON body, extract { action, ... }
2. Verify caller's JWT via getClaims()
3. Create admin Supabase client using SUPABASE_SERVICE_ROLE_KEY
4. Check caller has admin role in user_roles
5. Switch on action:
   - "create": inviteUserByEmail → update profile → optionally set admin role
   - "update": update profiles + user_roles as needed
   - "toggle-active": flip is_active on profiles
6. Return result or error with CORS headers
```

**UserContext.tsx changes**

Replace no-op stubs with:
```text
addUser(data) → supabase.functions.invoke('admin-users', { body: { action: 'create', ...data } })
updateUser(id, updates) → supabase.functions.invoke('admin-users', { body: { action: 'update', userId: id, updates } })
toggleUserActive(id) → supabase.functions.invoke('admin-users', { body: { action: 'toggle-active', userId: id } })
```
After each successful call, refresh `allUsersList` from the database.

**UserDialog.tsx changes**

- Add loading state during save
- Show error toast if Edge Function returns an error
- For "Add User" mode: email field is the primary input (user receives invite email)
- Add helper text: "User will receive an invite email to set their password"

**UsersTable.tsx changes**

- Make `handleSave` async
- Show toast on success/failure
- Refresh user list after mutation

---

### What Does NOT Change

- `types/index.ts` -- User interface stays identical
- All admin UI dialogs for reference data (they call the same context methods)
- Auth flow, routing, time entries
- `seed.ts` -- kept but no longer imported by ReferenceDataContext

### Security Summary

- Service role key stays server-side in the Edge Function (accessed via `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`)
- Edge Function validates the caller is an admin before any mutation
- Client code never touches `auth.admin` APIs
- All database writes are gated by RLS (admin-only policies)

### Test Checklist

| # | Test | Expected |
|---|---|---|
| 1 | Admin adds a department | Persists to DB, visible after refresh |
| 2 | Admin edits a phase name | Updates in DB |
| 3 | Admin toggles a work area inactive | `is_active` flips in DB |
| 4 | Employee attempts reference data mutation | RLS blocks, error shown |
| 5 | Admin creates a new user (invite) | User receives invite email, profile created in DB |
| 6 | Admin updates user's department and role | Profile updated in DB |
| 7 | Admin changes user's app role to admin | `user_roles` updated |
| 8 | Admin toggles user inactive | `is_active` flips on profile |
| 9 | Admin cannot deactivate themselves | UI prevents self-deactivation |
| 10 | Sign out + sign in: all changes persist | No localStorage dependency |

