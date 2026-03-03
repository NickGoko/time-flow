

# Phase 3: RBAC + Backend Enforcement

## Current State

- `app_role` enum: `admin | employee | super_admin`
- `user_roles` table: one role per user (user_id, role)
- `has_role()` security-definer function used in all RLS policies
- RLS on reference tables: admin can write, anyone can read
- RLS on `time_entries`/`week_statuses`: fully open (`true`) for demo mode
- `profiles`: admin can insert/update, users can update own
- No permissions table, no department scoping, no audit log

## A. SQL Schema + Seed Plan

### New/Modified Tables

```text
1. permissions (new)
   ─ id          text PK        (e.g. 'time:write_own')
   ─ description text NOT NULL

2. role_permissions (new)
   ─ role    app_role REFERENCES (via enum)
   ─ permission_id text REFERENCES permissions(id)
   ─ PK (role, permission_id)

3. user_department_scope (new)
   ─ id      uuid PK DEFAULT gen_random_uuid()
   ─ user_id uuid NOT NULL
   ─ department_id text NOT NULL
   ─ UNIQUE (user_id, department_id)

4. audit_log (new)
   ─ id          uuid PK DEFAULT gen_random_uuid()
   ─ actor_id    uuid NOT NULL
   ─ action      text NOT NULL
   ─ target_type text NOT NULL
   ─ target_id   text
   ─ reason      text
   ─ before_data jsonb
   ─ after_data  jsonb
   ─ created_at  timestamptz DEFAULT now()

5. user_roles (modify enum)
   ─ Add 'hod' and 'leadership' to app_role enum
```

### Expand app_role enum

```sql
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'hod';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'leadership';
```

### Seed Permissions

| Permission Key | Employee | HOD | Leadership | Admin |
|---|---|---|---|---|
| `time:write_own` | x | x | x | x |
| `time:read_own` | x | x | x | x |
| `time:read_department` | | x | | x |
| `time:read_all` | | | x | x |
| `week:submit_own` | x | x | x | x |
| `week:unlock_department` | | x | | |
| `week:unlock_all` | | | | x |
| `taxonomy:read` | x | x | x | x |
| `taxonomy:write` | | | x | x |
| `users:read` | | | x | x |
| `users:write` | | | | x |
| `roles:manage` | | | | x |
| `reports:read_department` | | x | | |
| `reports:read_all` | | | x | x |
| `audit:read` | | | | x |
| `export:data` | | | x | x |

### Helper Functions

```sql
-- has_permission(user_id, permission_key) → boolean
-- Checks user_roles → role_permissions → matches permission_id
-- SECURITY DEFINER to avoid RLS recursion

-- is_department_scoped(user_id, department_id) → boolean  
-- Checks user_department_scope for HOD department access
-- SECURITY DEFINER
```

`super_admin` inherits all permissions (hardcoded in `has_permission`).

### Break-Glass SQL

```sql
-- Promote any email to super_admin (run from SQL editor)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'super_admin'
FROM public.profiles p
WHERE p.email = 'it@growthafrica.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
```

## B. RLS Policies Per Table

### time_entries
| Operation | Policy |
|---|---|
| SELECT | Own rows (`user_id = auth.uid()`) OR `has_permission(auth.uid(), 'time:read_department')` + department scope check OR `has_permission(auth.uid(), 'time:read_all')` |
| INSERT | Own rows only (`user_id = auth.uid()`) AND `has_permission(auth.uid(), 'time:write_own')` |
| UPDATE | Own rows + week not locked |
| DELETE | Own rows + week not locked |

Note: Demo-mode open policies (`true`) will be replaced with proper checks. When `AUTH_ENABLED = false`, the acting-user-id header flow bypasses RLS anyway (edge functions use service role).

### week_statuses
| Operation | Policy |
|---|---|
| SELECT | Own OR department-scoped OR `time:read_all` |
| INSERT/UPDATE | Own (`week:submit_own`) OR department unlock (`week:unlock_department` + scope) OR admin unlock (`week:unlock_all`) |

### profiles
| Operation | Policy |
|---|---|
| SELECT | All authenticated (keep current `true`) |
| UPDATE own | `auth.uid() = id` |
| UPDATE all | `has_permission(auth.uid(), 'users:write')` |
| INSERT | `has_permission(auth.uid(), 'users:write')` |

### Taxonomy tables (departments, projects, phases, activity_types, internal_work_areas, deliverable_types)
| Operation | Policy |
|---|---|
| SELECT | Keep `true` (public read) |
| INSERT/UPDATE/DELETE | `has_permission(auth.uid(), 'taxonomy:write')` — grants access to Leadership + Admin |

### user_roles, user_department_scope
| Operation | Policy |
|---|---|
| SELECT | `true` (needed for `has_role`/`has_permission` to work) |
| INSERT/UPDATE/DELETE | `has_permission(auth.uid(), 'roles:manage')` — Admin only |

### audit_log
| Operation | Policy |
|---|---|
| SELECT | `has_permission(auth.uid(), 'audit:read')` |
| INSERT | Admin or via edge function (service role) |

## C. File List for UI Changes (≤10)

| # | File | Purpose |
|---|---|---|
| 1 | SQL migration | Enum expansion, new tables, seeds, functions, RLS |
| 2 | `supabase/functions/admin-users/index.ts` | Add audit logging to role/scope changes; enforce `has_permission` server-side |
| 3 | `src/types/index.ts` | Add `hod`, `leadership` to `AppRole` type |
| 4 | `src/components/admin/UsersTable.tsx` | Role multi-select, department scope assignment, reason field |
| 5 | `src/components/admin/UserDialog.tsx` | Updated role dropdown with new roles |
| 6 | `src/pages/admin/AdminRoles.tsx` | New page: view role templates + permissions, create custom roles |
| 7 | `src/pages/admin/AdminAudit.tsx` | New page: filterable audit log viewer |
| 8 | `src/App.tsx` | Add routes for `/admin/roles` and `/admin/audit` |
| 9 | `src/components/TopBar.tsx` | Add nav links for Roles, Audit |
| 10 | `src/contexts/UserContext.tsx` | Expose `permissions` array and `hasPermission()` client-side helper |

## D. Test Matrix

```text
┌──────────────────────┬──────────┬──────┬────────────┬───────┐
│ Action               │ Employee │ HOD  │ Leadership │ Admin │
├──────────────────────┼──────────┼──────┼────────────┼───────┤
│ View own timesheet   │ ✓        │ ✓    │ ✓          │ ✓     │
│ Edit own timesheet   │ ✓        │ ✓    │ ✓          │ ✓     │
│ View dept timesheets │ ✗        │ ✓*   │ ✗          │ ✓     │
│ View all timesheets  │ ✗        │ ✗    │ ✓          │ ✓     │
│ Submit own week      │ ✓        │ ✓    │ ✓          │ ✓     │
│ Unlock dept week     │ ✗        │ ✓*   │ ✗          │ ✗     │
│ Unlock any week      │ ✗        │ ✗    │ ✗          │ ✓     │
│ Edit taxonomy        │ ✗        │ ✗    │ ✓          │ ✓     │
│ View /admin/users    │ ✗        │ ✗    │ ✓ (read)   │ ✓     │
│ Edit users/roles     │ ✗        │ ✗    │ ✗          │ ✓     │
│ View /admin/roles    │ ✗        │ ✗    │ ✗          │ ✓     │
│ View /admin/audit    │ ✗        │ ✗    │ ✗          │ ✓     │
│ Export data          │ ✗        │ ✗    │ ✓          │ ✓     │
│ Direct URL /admin/*  │ blocked  │ partial │ partial │ full  │
└──────────────────────┴──────────┴──────┴────────────┴───────┘
* HOD: only for managed_departments
```

### Edge Cases to Test
- Employee navigates to `/admin/users` directly → "Not authorised" page
- HOD views department timesheets for a department NOT in their scope → empty/blocked
- Leadership tries to edit a user role → UI hides button, RLS blocks if bypassed
- Admin demotes themselves → prevented (self-protection)
- Break-glass SQL promotes `it@growthafrica.com` → immediate super_admin access
- Role change without "reason" → validation error

### Implementation Order
1. **Phase 3.1 (SQL)**: Migration with enum, tables, seeds, functions, RLS policies
2. **Phase 3.2 (UI)**: Admin pages for roles, audit, updated user management
3. **Phase 3.3 (Edge Function)**: Audit logging + server-side permission enforcement

