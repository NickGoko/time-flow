

## Milestone 6: Admin-Managed Dropdowns + Bulk Import/Export

### A) Data Model — Missing Columns & Tables

All data currently lives as static arrays in `src/data/seed.ts`. To support admin CRUD, we need mutable state. No new Supabase tables are needed (yet). The following type changes are required:

| Entity | Current Location | Missing Fields |
|---|---|---|
| `Phase` | `src/types/index.ts` | Add `isActive: boolean` |
| `ActivityType` | `src/types/index.ts` | Add `isActive: boolean` |
| `InternalWorkArea` | `src/types/index.ts` | Add `isActive: boolean` |
| `Department` | `src/types/index.ts` | Add `isActive: boolean` |
| `DeliverableType` | string union in types | No change (keep as constant; optional CRUD deferred) |
| `Project` | `src/types/index.ts` | Already has `isActive` -- no change |
| `User` | `src/types/index.ts` | Already has `isActive` -- no change |
| `ProjectDepartmentAccess` | `src/types/index.ts` | No change needed |

### B) Route Map & Nav Structure

```text
/admin
  /admin/reports/overview    (existing)
  /admin/reference-data      (NEW — tabbed: Workstreams | Phases | Work Areas)
  /admin/users               (NEW — Users CRUD table)
  /admin/import-export       (NEW — tabbed: Export | Import)
```

The existing admin nav in `TopBar.tsx` adds two links: **Reference Data** and **Users**. Import/Export lives under Reference Data or as a third nav item.

### C) Brick Sequence (7 bricks, each 6 files max)

---

#### Brick 1: ReferenceDataContext + Admin Nav (foundation)

Creates the mutable state layer that replaces direct seed.ts imports for all reference data. Persists to localStorage.

| # | File | Action |
|---|---|---|
| 1 | `src/types/index.ts` | Add `isActive` to Phase, ActivityType, InternalWorkArea, Department |
| 2 | `src/data/seed.ts` | Add `isActive: true` to all existing phase/activity/workArea/department records. Export raw defs for initial state. |
| 3 | `src/contexts/ReferenceDataContext.tsx` | **NEW** — Context holding departments, projects, projectDepartmentAccess, phases, activityTypes, internalWorkAreas in `useState`. Init from seed, persist to localStorage. Exposes CRUD methods + filtered getters (active-only). |
| 4 | `src/App.tsx` | Wrap app in `ReferenceDataProvider`, add new admin routes |
| 5 | `src/components/TopBar.tsx` | Add "Reference Data" and "Users" nav links for admin |
| 6 | `src/components/TimeEntryForm.tsx` | Switch from direct seed imports to `useReferenceData()` context |

**Key design**: `useReferenceData()` exposes the same helper functions currently in seed.ts (`getGroupedWorkstreams`, `getPhasesForProject`, `getActivitiesForPhase`, etc.) but backed by mutable state. Entry forms become automatically driven by admin-managed data.

---

#### Brick 2: Workstreams CRUD (projects + department access)

| # | File | Action |
|---|---|---|
| 1 | `src/pages/admin/AdminReferenceData.tsx` | **NEW** — Tabbed page shell (Workstreams / Phases / Work Areas tabs) |
| 2 | `src/components/admin/WorkstreamsTable.tsx` | **NEW** — Table listing all projects with name, code, type, department access pills, isActive toggle |
| 3 | `src/components/admin/WorkstreamDialog.tsx` | **NEW** — Add/Edit dialog: name, code, type (external/internal), owning department, default billable status, department access multi-select |
| 4 | `src/contexts/ReferenceDataContext.tsx` | Add `addProject`, `updateProject`, `toggleProjectActive`, `setProjectDepartmentAccess` methods |

4 files.

---

#### Brick 3: Phases + Activity Types CRUD

| # | File | Action |
|---|---|---|
| 1 | `src/components/admin/PhasesTable.tsx` | **NEW** — Expandable table: phases as rows, click to expand shows activity types underneath. Active toggle per phase. |
| 2 | `src/components/admin/PhaseDialog.tsx` | **NEW** — Add/Edit phase dialog |
| 3 | `src/components/admin/ActivityTypeDialog.tsx` | **NEW** — Add/Edit activity type dialog (linked to a phase) |
| 4 | `src/contexts/ReferenceDataContext.tsx` | Add `addPhase`, `updatePhase`, `togglePhaseActive`, `addActivityType`, `updateActivityType`, `toggleActivityTypeActive` methods |

4 files.

---

#### Brick 4: Internal Work Areas CRUD

| # | File | Action |
|---|---|---|
| 1 | `src/components/admin/WorkAreasTable.tsx` | **NEW** — Table grouped by department showing work areas, each expandable to show its activity types. Department filter dropdown. |
| 2 | `src/components/admin/WorkAreaDialog.tsx` | **NEW** — Add/Edit work area dialog (department selector, name) |
| 3 | `src/contexts/ReferenceDataContext.tsx` | Add `addWorkArea`, `updateWorkArea`, `toggleWorkAreaActive` methods |

3 files.

---

#### Brick 5: Users CRUD v0

| # | File | Action |
|---|---|---|
| 1 | `src/pages/admin/AdminUsers.tsx` | **NEW** — Table of all users (active + inactive). Columns: name, email, department, job title, appRole pill, isActive toggle. Add/Edit button. |
| 2 | `src/components/admin/UserDialog.tsx` | **NEW** — Add/Edit user dialog: name, email, job title, department dropdown, appRole dropdown, weeklyExpectedHours, isActive toggle |
| 3 | `src/contexts/UserContext.tsx` | Move users array into useState, add `addUser`, `updateUser`, `toggleUserActive`. Persist to localStorage. `allUsers` continues to filter active-only for non-admin consumers. |
| 4 | `src/pages/SignIn.tsx` | No changes needed (already consumes `allUsers` from context) |

3 files (UserDialog, AdminUsers, UserContext).

---

#### Brick 6: CSV Export (entities + finance time entries)

| # | File | Action |
|---|---|---|
| 1 | `src/lib/csv.ts` | **NEW** — Utility: `arrayToCSV(rows, columns)`, `downloadCSV(content, filename)`, `parseCSV(text)` |
| 2 | `src/pages/admin/AdminImportExport.tsx` | **NEW** — Page with Export and Import tabs |
| 3 | `src/components/admin/ExportPanel.tsx` | **NEW** — Export buttons for: Users, Workstreams, Phases, Activity Types, Work Areas, Department Access. Plus Finance Time Entries export with date range + department + project filters. |
| 4 | `src/components/admin/FinanceExportFilters.tsx` | **NEW** — Filter bar for time entry export: date range picker, department multi-select, project multi-select, billable status filter |

4 files.

---

#### Brick 7: CSV Import with Dry-Run Validation

| # | File | Action |
|---|---|---|
| 1 | `src/components/admin/ImportPanel.tsx` | **NEW** — Entity selector dropdown + file upload area. Triggers dry-run on upload. |
| 2 | `src/components/admin/ImportPreviewDialog.tsx` | **NEW** — Shows parsed rows in a table with validation status per row (green = ok, red = error with message). "Commit" button to apply. Row count summary. |
| 3 | `src/lib/csv-import-validators.ts` | **NEW** — Per-entity validation functions: `validateUserRow`, `validateProjectRow`, `validatePhaseRow`, etc. Checks required fields, foreign key references, uniqueness. |

3 files.

---

### D) Test Plan Per Brick

**Brick 1: ReferenceDataContext + Admin Nav**

| # | Test | Expected |
|---|---|---|
| 1 | Sign in as admin, check nav | See "Reference Data" and "Users" links |
| 2 | Open time entry form | Workstream/phase/activity dropdowns still work identically |
| 3 | Refresh page | All reference data persists (localStorage) |
| 4 | Sign in as employee | No admin nav links visible |

**Brick 2: Workstreams CRUD**

| # | Test | Expected |
|---|---|---|
| 1 | Navigate to /admin/reference-data | See Workstreams tab with table of all 13 projects |
| 2 | Click "Add Workstream" | Dialog opens with all required fields |
| 3 | Create external project, assign to 2 departments | Appears in table with department pills |
| 4 | Toggle project inactive | Disappears from employee time entry dropdowns |
| 5 | Edit existing project name | Name updates in table and in entry forms |

**Brick 3: Phases + Activity Types CRUD**

| # | Test | Expected |
|---|---|---|
| 1 | Click Phases tab | See all external phases listed |
| 2 | Expand a phase | See its activity types |
| 3 | Add new activity type to "Inception" | Appears in time entry form under Inception phase |
| 4 | Deactivate a phase | No longer selectable in entry forms |

**Brick 4: Internal Work Areas CRUD**

| # | Test | Expected |
|---|---|---|
| 1 | Click Work Areas tab | See work areas grouped by department |
| 2 | Filter by Finance department | Shows only Finance work areas |
| 3 | Add new work area to IT department | Appears in IT internal workstream dropdown for IT users |
| 4 | Deactivate a work area | No longer selectable |

**Brick 5: Users CRUD v0**

| # | Test | Expected |
|---|---|---|
| 1 | Navigate to /admin/users | See all 26 users in table |
| 2 | Add new user | Appears on sign-in page |
| 3 | Change user department | Reflected in sign-in card and time entry workstream access |
| 4 | Toggle user inactive | Disappears from sign-in page |
| 5 | Change appRole to admin | User sees admin nav after sign-in |

**Brick 6: CSV Export**

| # | Test | Expected |
|---|---|---|
| 1 | Export Users CSV | Downloads CSV with all 26 users, correct columns |
| 2 | Export Workstreams CSV | Downloads CSV with all projects |
| 3 | Export Finance Time Entries | Downloads CSV with date, user, project, phase, hours, billable status |
| 4 | Apply date filter to finance export | Only entries in range are exported |
| 5 | Re-import exported CSV | Round-trip produces identical data |

**Brick 7: CSV Import**

| # | Test | Expected |
|---|---|---|
| 1 | Upload valid Users CSV | Dry-run shows all rows green, row count matches |
| 2 | Upload CSV with missing required field | Row shows red with error message |
| 3 | Upload CSV with invalid department reference | Row shows red: "Unknown department" |
| 4 | Click "Commit" after dry-run | Data merges into context, visible in admin tables |
| 5 | Upload duplicate email | Row shows warning: "User already exists — will update" |

### Summary

- **7 bricks**, each 3-6 files
- **~25 new/modified files** total across all bricks
- **No Supabase**, no auth changes
- **Entry forms automatically driven** by ReferenceDataContext after Brick 1
- Recommend implementing in order: Brick 1 is the critical foundation, then 2-4 (reference data CRUD), then 5 (users), then 6-7 (import/export)

