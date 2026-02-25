

## Brick 8: Department Add/Edit

### Overview

Replace the stub toast callbacks on the Departments section with a functional `DepartmentDialog` and wire up `addDepartment` / `updateDepartment` methods in `ReferenceDataContext`. Department is a simple entity with only a `name` field.

### Files (3 files)

| # | File | Action | Description |
|---|---|---|---|
| 1 | `src/contexts/ReferenceDataContext.tsx` | EDIT | Add `addDepartment(name: string)` and `updateDepartment(id: string, name: string)` methods. Expose on context type. |
| 2 | `src/components/admin/DepartmentDialog.tsx` | NEW | Add/Edit dialog with a single "Name" field. Uses `EditDialog` wrapper from `AdminCrudTable`. |
| 3 | `src/pages/admin/AdminReferenceData.tsx` | EDIT | Import `DepartmentDialog`, add state for dialog open/editing, wire `onAdd`/`onEdit` to open dialog instead of showing stubs. |

### Context Changes (ReferenceDataContext.tsx)

```text
addDepartment(name: string): void
  - ID: 'dept-' + Date.now()
  - isActive: true
  - Persists to localStorage (LS_DEPARTMENTS)

updateDepartment(id: string, name: string): void
  - Merges name, persists to localStorage
```

Both follow the exact same `useCallback` + `persist` pattern as `addPhase`/`updatePhase`.

### DepartmentDialog

Single-field dialog following the same pattern as `PhaseDialog` in phase mode:

| Field | Type | Validation |
|---|---|---|
| Name | Input (text) | Required |

Props: `open`, `onOpenChange`, `editing: Department | null`. Calls `addDepartment` or `updateDepartment` from context, then closes.

### AdminReferenceData.tsx Changes

- Add `useState` for `deptDialogOpen` and `editingDept`
- `onAdd` opens dialog with `editingDept = null`
- `onEdit` opens dialog with the selected department
- Render `DepartmentDialog` component

### What Does NOT Change

- `AdminCrudTable` (reused as-is)
- `seed.ts`, types, routing
- Other CRUD tables (Workstreams, Phases, Work Areas, Deliverables)
- `UserContext` or `TimeEntriesContext`

### Test Plan

| # | Test | Expected |
|---|---|---|
| 1 | Click "Add Department", enter "Research", save | New department row appears |
| 2 | Click edit on "Finance & Admin", rename to "Finance", save | Name updates in table |
| 3 | Toggle a department inactive then active | Row greys/ungreys; department availability updates in user/workstream forms |
| 4 | Refresh page | All changes persist |

