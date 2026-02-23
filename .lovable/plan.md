

## Brick 2: Admin Navigation + Reusable CRUD Scaffolding

### Overview

Create the three admin page shells (`/admin/reference-data`, `/admin/users`, `/admin/import-export`) with proper routing, plus a set of reusable CRUD building-block components. Wire one real entity (Departments) as a working example to prove the pattern end-to-end.

### Files (5 files, within the 6-file limit)

| # | File | Action | Description |
|---|---|---|---|
| 1 | `src/App.tsx` | EDIT | Add lazy routes for `/admin/reference-data`, `/admin/users`, `/admin/import-export` inside the existing AdminGuard block |
| 2 | `src/pages/admin/AdminReferenceData.tsx` | NEW | Tabbed page shell with three tabs: Workstreams, Phases, Work Areas. Each tab renders a placeholder until entity-specific CRUD is wired in later bricks. The Workstreams tab is initially a "Coming soon" card. |
| 3 | `src/pages/admin/AdminUsers.tsx` | NEW | Page shell with "Users" heading and placeholder content ("Coming soon — Brick 5"). Follows same layout pattern as AdminReportsOverview (TopBar + container). |
| 4 | `src/pages/admin/AdminImportExport.tsx` | NEW | Page shell with Export / Import tabs. Placeholder content for both tabs. |
| 5 | `src/components/admin/AdminCrudTable.tsx` | NEW | Reusable generic table component with: column definitions, active/inactive toggle, add button, edit button, search/filter input. Accepts generic `<T>` rows via props. Includes an inline `ConfirmDeactivateDialog` (AlertDialog) and an `EditDialog` wrapper (Dialog shell that accepts children as the form body). One working example is rendered inside AdminReferenceData's first tab: a **Departments** mini-table showing id, name, isActive toggle — proving the full pattern. |

### Component Design: AdminCrudTable

```text
Props<T extends { id: string; isActive: boolean }>:
  - columns: { key: keyof T; header: string; render?: (row: T) => ReactNode }[]
  - data: T[]
  - onToggleActive: (id: string) => void
  - onEdit: (row: T) => void
  - onAdd: () => void
  - addLabel: string           // e.g. "Add Workstream"
  - entityLabel: string        // e.g. "workstream" (for confirm dialog text)
  - searchPlaceholder?: string // optional filter input

Built-in sub-components (not exported separately):
  - ActiveToggle: Switch component with confirm-deactivate AlertDialog
  - ConfirmDeactivateDialog: "Are you sure?" with entity name
  - EditDialog: Dialog shell (open/close state managed by parent page)
```

This single file provides all the reusable CRUD primitives. Entity-specific pages (Bricks 3-5) will import `AdminCrudTable` and pass their own columns, data, and handlers.

### Routing Changes (App.tsx)

Add three new routes inside the existing `<Route path="/admin" element={<AdminGuard />}>` block:

```text
<Route path="reference-data" element={<AdminReferenceData />} />
<Route path="users" element={<AdminUsers />} />
<Route path="import-export" element={<AdminImportExport />} />
```

### Navigation

TopBar already has "Reference Data" and "Users" links from Brick 1. No TopBar changes needed. The "Import/Export" page will be accessible from within the Reference Data page or directly via URL (no top-nav link yet to keep the nav clean).

### Example Entity: Departments Table

Inside the "Workstreams" tab of AdminReferenceData, a small Departments section will render `AdminCrudTable` with:
- Data: `departments` from `useReferenceData()`
- Columns: Name, Active status
- Toggle active: wired to a new `toggleDepartmentActive` method added to ReferenceDataContext
- This proves the full create/read/toggle pattern works before building entity-specific CRUD in Bricks 3-5

To support this, `ReferenceDataContext.tsx` gets one small addition: `setDepartments` exposed via a `toggleDepartmentActive` callback. This is a minimal addition (under 15 lines) to the existing context file — no new file needed.

### What Does NOT Change

- TopBar (already has the right links)
- Types (already have isActive on all entities)
- Seed data (already has isActive: true)
- TimeEntryForm (untouched)
- Employee-facing pages (untouched)

### Test Plan

| # | Test | Expected |
|---|---|---|
| 1 | Sign in as admin (Ian Lorenzen), click "Reference Data" | Navigates to `/admin/reference-data`, shows tabbed page with Workstreams / Phases / Work Areas tabs |
| 2 | Workstreams tab | Shows Departments mini-table with all departments listed, each with an active toggle |
| 3 | Toggle a department inactive | Confirm dialog appears; on confirm, switch flips to off; persists on refresh |
| 4 | Click "Users" in top nav | Navigates to `/admin/users`, shows placeholder page |
| 5 | Navigate to `/admin/import-export` | Shows tabbed page with Export / Import tabs (placeholder content) |
| 6 | Sign in as employee | "Reference Data" and "Users" nav links not visible; direct URL to `/admin/reference-data` shows "Not authorised" |
| 7 | Refresh on `/admin/reference-data` | Page loads correctly (no 404) |

