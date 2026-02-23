

## Brick 4: Internal Work Areas CRUD

### Overview

Add admin management for Internal Work Areas on the "Work Areas" tab of the Reference Data page. Work areas belong to a department and link to a phase. The entry form already reads work areas from `useReferenceData()` via `getPhasesForProject`, so changes propagate automatically.

### Files (4 files)

| # | File | Action | Description |
|---|---|---|---|
| 1 | `src/contexts/ReferenceDataContext.tsx` | EDIT | Make `workAreas` mutable (`setWorkAreas`). Add 3 methods: `addWorkArea`, `updateWorkArea`, `toggleWorkAreaActive`. Expose on context type. |
| 2 | `src/components/admin/WorkAreasTable.tsx` | NEW | Renders `AdminCrudTable<InternalWorkArea>` with columns: Name, Department (looked up via `getDepartmentById`), Phase (looked up from phases array). Includes a department filter dropdown above the table. Wires toggle/edit/add callbacks. |
| 3 | `src/components/admin/WorkAreaDialog.tsx` | NEW | Add/Edit dialog with fields: Name (Input), Department (Select from active departments), Phase (Select from active phases). On save calls `addWorkArea` or `updateWorkArea`. |
| 4 | `src/pages/admin/AdminReferenceData.tsx` | EDIT | Replace the "Work Areas -- coming in Brick 5" placeholder with `WorkAreasTable`. |

### Context Changes (ReferenceDataContext.tsx)

New methods:

```text
addWorkArea(workArea: Omit<InternalWorkArea, 'id'>): void
  - Generates ID: 'wa-' + Date.now()
  - Persists to localStorage

updateWorkArea(id: string, updates: Partial<InternalWorkArea>): void
  - Merges updates into existing work area
  - Persists to localStorage

toggleWorkAreaActive(id: string): void
  - Flips isActive, persists
```

The existing `getPhasesForProject` already filters `workAreas` by `departmentId` and `isActive`, so toggling a work area inactive immediately removes it from internal workstream phase dropdowns in the entry form.

### WorkAreasTable Columns

| Column | Source | Render |
|---|---|---|
| Name | `workArea.name` | Plain text |
| Department | `workArea.departmentId` | Department name via `getDepartmentById` |
| Phase | `workArea.phaseId` | Phase name looked up from `phases` array |

A department filter Select above the table allows narrowing to a single department's work areas.

### WorkAreaDialog Fields

| Field | Type | Required |
|---|---|---|
| Name | Text input | Yes |
| Department | Select (active departments) | Yes |
| Phase | Select (active phases) | Yes |

When editing, Department and Phase are pre-filled from the existing work area.

### What Does NOT Change

- AdminCrudTable (reused as-is)
- WorkstreamsTable, WorkstreamDialog (untouched)
- TimeEntryForm (already reads from context)
- Seed data, types, routing

### Test Plan

| # | Test | Expected |
|---|---|---|
| 1 | Navigate to `/admin/reference-data`, click "Work Areas" tab | See table with all existing work areas across departments |
| 2 | Use department filter to select "Finance" | Table shows only Finance work areas (e.g., Management Accounts, Payroll) |
| 3 | Click "Add Work Area", fill: name="Tax Filing", dept=Finance, phase=(any active phase) | Saves; new row appears in table under Finance filter |
| 4 | Sign in as Finance user, select Finance internal workstream | "Tax Filing" appears in the phase/work area dropdown |
| 5 | As admin, toggle "Tax Filing" inactive | Row greys out; Finance user no longer sees it in entry form |
| 6 | Toggle it back active | Reappears in entry form |
| 7 | Edit existing work area name | Name updates in table and entry form |
| 8 | Refresh page | All changes persist (localStorage) |

