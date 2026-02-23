

## Brick 3: Workstreams CRUD + Department Access

### Overview

Add full add/edit/deactivate support for Workstreams (projects) and their department access mappings. The existing `AdminCrudTable` component handles the table, toggle, and dialog scaffolding. The entry form already reads from `useReferenceData()`, so changes propagate automatically.

### Files (5 files)

| # | File | Action | Description |
|---|---|---|---|
| 1 | `src/contexts/ReferenceDataContext.tsx` | EDIT | Upgrade `projects` and `access` from read-only `useState` to mutable with setters. Add 4 methods: `addProject`, `updateProject`, `toggleProjectActive`, `setProjectDepartmentAccess`. Expose them on the context type. |
| 2 | `src/components/admin/WorkstreamsTable.tsx` | NEW | Renders `AdminCrudTable<Project>` with columns: Name, Code, Type (badge), Owning Dept (for internal), Dept Access (pill list for external). Wires toggle/edit/add callbacks. |
| 3 | `src/components/admin/WorkstreamDialog.tsx` | NEW | Add/Edit dialog form with fields: name (Input), code (Input), type (Select: external_project / internal_department), owning department (Select, shown only when type=internal), default billable status (Select), department access (multi-select checkboxes, shown only when type=external). On save calls `addProject` or `updateProject` + `setProjectDepartmentAccess`. |
| 4 | `src/pages/admin/AdminReferenceData.tsx` | EDIT | Replace the "Workstreams CRUD -- coming in Brick 3" placeholder card with `WorkstreamsTable`. Keep the existing Departments section above it. |
| 5 | `src/types/index.ts` | EDIT | No structural changes needed. Minor: export a `WORKSTREAM_TYPES` constant (`['external_project', 'internal_department']`) for the dialog dropdown. |

### Context Changes (ReferenceDataContext.tsx)

New methods added to the context interface:

```text
addProject(project: Project): void
  - Generates ID from code (e.g. 'proj-' + code.toLowerCase())
  - Persists to localStorage

updateProject(id: string, updates: Partial<Project>): void
  - Merges updates into existing project
  - Persists to localStorage

toggleProjectActive(id: string): void
  - Flips isActive, persists

setProjectDepartmentAccess(projectId: string, departmentIds: string[]): void
  - Replaces all access rows for this project
  - Persists to localStorage
```

The existing `getGroupedWorkstreams` already filters by `isActive` and access rows, so it will immediately reflect changes.

### WorkstreamsTable Columns

| Column | Source | Render |
|---|---|---|
| Name | `project.name` | Plain text |
| Code | `project.code` | Monospace badge |
| Type | `project.type` | "External" or "Internal" badge |
| Department | `project.owningDepartmentId` | Department name (internal only), dash for external |
| Access | `projectDepartmentAccess` | Comma-separated department names (external only) |

### WorkstreamDialog Fields

| Field | Type | Visibility | Required |
|---|---|---|---|
| Name | Text input | Always | Yes |
| Code | Text input | Always | Yes |
| Type | Select (External / Internal) | Always | Yes |
| Owning Department | Select (all departments) | When type = internal_department | Yes (conditional) |
| Default Billable Status | Select (Billable / Maybe / Not Billable) | Always | Yes |
| Department Access | Checkbox list of departments | When type = external_project | At least 1 required |

### What Does NOT Change

- AdminCrudTable component (reused as-is)
- TimeEntryForm (already reads from context -- auto-updates)
- TopBar, routing, other admin pages
- Seed data (remains as initial state)

### Test Plan

| # | Test | Expected |
|---|---|---|
| 1 | Navigate to `/admin/reference-data`, Workstreams tab | See table with all 13 existing projects (6 external + 1 leave + 6 internal) |
| 2 | Click "Add Workstream", fill in: name="Test Project", code="TEST", type=External, billable=Billable, access=[Finance] | Dialog saves; new row appears in table with Finance access pill |
| 3 | Sign in as Alex Njoroge (Finance dept), open time entry form | "Test Project" appears under External projects in workstream dropdown |
| 4 | Sign in as Brian Muvea (Impact dept), open time entry form | "Test Project" does NOT appear (Impact not in access list) |
| 5 | As admin, edit "Test Project", add Impact to access list | Save; sign in as Brian Muvea -- "Test Project" now visible |
| 6 | As admin, toggle "Test Project" inactive | Confirm dialog appears; after confirm, project disappears from both admin table (greyed row) and employee dropdowns |
| 7 | As admin, toggle it back active | Row un-greys; employees see it again |
| 8 | Add internal workstream: type=Internal, owning dept=Finance | No dept access checkboxes shown; saves correctly; Finance users see it under Internal projects |
| 9 | Refresh page | All changes persist (localStorage) |

