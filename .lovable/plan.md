

# Brick 2: Admin RBAC UI — Implementation Plan

## Summary

Create two new admin pages (Roles matrix, Audit log) and enhance the UserDialog with managed departments multi-select and mandatory audit reason field. Total: **8 files** (within limit).

## Files

| # | File | Action | Change |
|---|---|---|---|
| 1 | `src/pages/admin/AdminRoles.tsx` | **New** | Read-only role × permission matrix. Fetches `permissions` and `role_permissions` tables. Renders a table with roles as columns and permissions as rows, checkmarks where mapped. super_admin shown as "all". |
| 2 | `src/pages/admin/AdminAudit.tsx` | **New** | Filterable audit log viewer. Fetches `audit_log` joined with `profiles` for actor name. Filters: action type, date range, search by target. Shows actor, action, target, reason, timestamp, expandable before/after JSON. |
| 3 | `src/components/admin/UserDialog.tsx` | **Edit** | Add: (a) multi-select checkboxes for managed departments (visible when appRole=hod), (b) textarea "Reason for change" (required on edit, hidden on add). Pass `managedDepartments` and `reason` through `onSave`. |
| 4 | `src/components/admin/UsersTable.tsx` | **Edit** | Update `handleSave` to pass `reason` and `managedDepartments` to `updateUser`. Fetch and display managed departments for HOD users as sub-badges. |
| 5 | `src/contexts/UserContext.tsx` | **Edit** | Update `updateUser` signature to accept `reason` and `managedDepartments`. Pass both to edge function. Fetch `user_department_scope` in `refreshAllUsers` and attach `managedDepartments` to User objects. |
| 6 | `src/types/index.ts` | **Edit** | Add `managedDepartments?: string[]` to `User` interface. |
| 7 | `supabase/functions/admin-users/index.ts` | **Edit** | In `update` action: accept `reason` and `managedDepartments`. Snapshot before/after state. Write to `audit_log`. Upsert `user_department_scope` (delete+insert pattern). |
| 8 | `src/App.tsx` | **Edit** | Add routes: `/admin/roles` → `AdminRoles`, `/admin/audit` → `AdminAudit`. |

**TopBar.tsx** already has admin nav links for Dashboard, Reports, Reference Data, Users. Adding Roles and Audit links would be a 9th file. Instead, these pages are accessible from the Users page or via direct URL. If needed, TopBar can be updated in a follow-up.

## Key Details

### AdminRoles page
- Reads `permissions` and `role_permissions` via supabase client (both have public SELECT)
- Builds a matrix: rows = permissions (sorted by id), columns = employee, hod, leadership, admin, super_admin
- super_admin column shows all checkmarks (inherits everything per `has_permission` function)
- Read-only — no edit capability in this brick

### AdminAudit page
- Queries `audit_log` ordered by `created_at DESC`, limited to 100
- Joins `profiles` for actor name display
- Filters: text search on action/target_type/reason, date picker for range
- Each row expandable to show `before_data` / `after_data` JSON diffs

### UserDialog changes
- When `appRole === 'hod'`, show a "Managed Departments" section with checkboxes for each active department
- On edit mode, pre-populate from `user.managedDepartments`
- "Reason for change" textarea (required when editing, min 5 chars)
- `onSave` signature changes to include `managedDepartments` and `reason`

### Edge Function audit logging
- In `update` action: fetch current profile + role + scopes as `before_data`
- After applying changes: fetch new state as `after_data`
- Insert into `audit_log`: `{ actor_id: callerId, action: 'user.update', target_type: 'user', target_id: userId, reason, before_data, after_data }`
- `audit_log` has no INSERT RLS policy (blocked for regular users), so the edge function uses the service role client which bypasses RLS

### Data flow for managedDepartments
- `UserContext.refreshAllUsers`: also fetches `user_department_scope`, groups by `user_id`, attaches as `managedDepartments: string[]` on each User
- `UserDialog`: reads from `user.managedDepartments` on open
- On save: passes array to edge function which does delete+insert pattern

## Test Steps

1. Navigate to `/admin/roles` — see a matrix of 16 permissions × 5 roles with checkmarks
2. Navigate to `/admin/audit` — see audit log entries (initially from import actions if any)
3. Edit a user, change their role to HOD — department checkboxes appear, select 2 departments, enter reason "Promoted to HOD", save
4. Check `/admin/audit` — new entry shows with reason, before/after snapshots
5. Re-edit same user — managed departments pre-populated correctly
6. Try saving without reason on edit — validation prevents it

