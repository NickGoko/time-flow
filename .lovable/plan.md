

# Bulk Import + RBAC UI — Implementation Plan

## Current State (Already Built)

Most of the requested functionality **already exists**:

- **Edge Function** `admin-users` already has: `bulk-import`, `provision-invite`, `send-reset`, `create-with-password`, `bulk-provision` actions
- **AdminImportExport.tsx** already has: Import tab (CSV upload + preview + import), Provision Logins tab (checkbox select + bulk provision)
- **UsersTable.tsx** already has: Auth dropdown column with Invite, Reset Password, Create Login actions

## What's Missing (Gaps vs. New CSV Schema)

The uploaded CSV uses a richer schema than the current importer handles:

| CSV Field | Current Handling | Gap |
|---|---|---|
| `roles` (multi: `Employee;HOD;Leadership;Admin`) | Maps to single `appRole` (`admin`/`super_admin`/`employee`) | Missing `hod`, `leadership` in TypeScript `AppRole` type; only picks highest role |
| `managed_departments` | Ignored | Not imported into `user_department_scope` table |
| `capabilities` | Ignored | Not mapped to permissions (handled by role_permissions seed, informational only) |
| `FinanceReporter` role | Ignored | Custom role not in `app_role` enum — needs decision |

## Plan

### Brick 1: Update Import to Support RBAC Fields (≤5 files)

| # | File | Change |
|---|---|---|
| 1 | `src/types/index.ts` | Add `'hod' \| 'leadership'` to `AppRole` type |
| 2 | `src/pages/admin/AdminImportExport.tsx` | Update `parseRoles()` to map `HOD→hod`, `Leadership→leadership`, `Admin→admin`; parse `managed_departments` column; send `managedDepartments` array to edge function |
| 3 | `supabase/functions/admin-users/index.ts` | In `bulk-import` action: accept `managedDepartments` per user, upsert into `user_department_scope`; accept `appRole` values including `hod`/`leadership` |
| 4 | `src/contexts/UserContext.tsx` | Update `AppRole` references to include new values; fetch `user_department_scope` in `refreshAllUsers` |

### Brick 2: Phase 3.2 Admin UI (≤8 files)

| # | File | Change |
|---|---|---|
| 1 | `src/pages/admin/AdminRoles.tsx` | New: read-only role × permission matrix from `permissions` + `role_permissions` |
| 2 | `src/pages/admin/AdminAudit.tsx` | New: filterable audit log viewer querying `audit_log` |
| 3 | `src/components/admin/UserDialog.tsx` | Updated role dropdown (4 roles), managed departments multi-select for HOD, mandatory "Reason for change" field |
| 4 | `src/components/admin/UsersTable.tsx` | Show new roles in badge; pass reason to update |
| 5 | `src/contexts/UserContext.tsx` | Pass `reason` + `managedDepartments` in `updateUser`; expose `hasPermission()` client helper |
| 6 | `supabase/functions/admin-users/index.ts` | In `update` action: handle `managedDepartments` upsert + write audit_log entry with before/after + reason |
| 7 | `src/App.tsx` | Add routes `/admin/roles`, `/admin/audit` |
| 8 | `src/components/TopBar.tsx` | Add Roles, Audit nav links for admin |

### FinanceReporter Decision

The CSV includes a `FinanceReporter` role not in the `app_role` enum. Options:
- **A) Ignore** — map to `employee` (they already get `export:org` + `view:org` from capabilities column, but capabilities aren't enforced client-side today)
- **B) Add to enum** — requires SQL migration to add `finance_reporter` to `app_role`, plus seeding `role_permissions`

Recommendation: **Option A** for now. FinanceReporter users get `employee` role. Their specific permissions can be handled later via custom role_permissions or a future enum expansion.

### Test Steps

1. Upload the provided CSV on Import tab → preview shows 25 users with correct roles (hod, leadership, admin, employee)
2. Click Import → report shows created/updated counts, 0 errors
3. Go to Users page → all 25 users visible with correct departments and role badges
4. Users with `managed_departments` (Ian=Communications, Johnni=Finance & Admin, Patricia=Impact, Winnie=HR) have entries in `user_department_scope`
5. Re-import same CSV → all show as "updated", idempotent
6. Provision tab → select 5 users → provision → per-row results
7. Admin Roles page → permission matrix visible
8. Admin Audit page → shows recent import/provision actions

### Implementation Order

1. **First**: Brick 1 (types + import updates) — gets all 25 users into the system
2. **Second**: Brick 2 (admin UI for roles, audit, user dialog updates)

