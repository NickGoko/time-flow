

# Phase 1.2 + 1.3: CSV Import UI & DB-Only User Lists

## Assessment

**Phase 1.2 (CSV Import UI) is already implemented.** The file `src/pages/admin/AdminImportExport.tsx` already contains:
- CSV file picker
- Client-side parsing with department mapping
- Preview table with validation
- "Import Users" button calling the `admin-users` edge function's `bulk-import` action
- Import report display (created/updated/skipped)

**Phase 1.3 is also largely done.** `UserContext` already loads user lists exclusively from the `profiles` + `user_roles` DB tables — the seed `users[]` array is never imported by any runtime code for user listing. The `/admin/users` page and the user switcher dropdown both consume `allUsersList` / `allUsers` from `UserContext`, which reads from DB.

## Remaining Issue

One minor cleanup: `WeeklyTimesheet.tsx` imports `getDepartmentById` from `@/data/seed` instead of using `useReferenceData()`. This is a stale seed dependency but does not affect user listing — it only affects department name resolution. Since the guardrails say "no refactors," this should be left alone unless it causes a bug.

## What Actually Needs Doing

**Nothing.** Both phases are already satisfied:

| Requirement | Status |
|---|---|
| `/admin/import-export` uploads CSV, previews, commits | Done — `AdminImportExport.tsx` |
| Upserts departments + profiles via edge function | Done — `admin-users` bulk-import action |
| `/admin/users` lists users from `profiles` table | Done — `UsersTable` → `UserContext.allUsersList` → DB |
| Switch-user dropdown lists active profiles | Done — `UserSelector` → `UserContext.allUsers` (filtered `isActive`) |
| Legacy demo users marked inactive (not deleted) | N/A — seed `users[]` array is not used at runtime; DB is the source |

## Test Steps

1. Navigate to Admin > Import/Export > Import tab
2. Upload the GrowthAfrica CSV
3. Preview shows ~25 rows with mapped departments
4. Click "Import Users" → report shows created/updated counts
5. Navigate to Admin > Users → all imported users visible with correct departments and roles
6. Re-upload same CSV → report shows 0 created, ~25 updated (idempotent)
7. Open user switcher dropdown → all active imported users appear
8. Switch between users → UI updates to reflect selected user

No code changes required. Both phases can be marked complete.

