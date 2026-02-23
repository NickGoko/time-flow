

## Brick 5: Deliverable Types CRUD

### Overview

Implement admin management for Deliverable Types on a new "Deliverables" tab of the Reference Data page. Deliverable types are currently defined as a static union type and constant array in `types/index.ts`. To support CRUD, we'll shift them to the `ReferenceDataContext` with localStorage persistence, while keeping the entry form's dependency on them minimal.

### Files (5 files)

| # | File | Action | Description |
|---|---|---|---|
| 1 | `src/types/index.ts` | EDIT | Add `DeliverableTypeItem` interface. Update `DeliverableType` to be a string (or keep it as is if needed for compatibility). |
| 2 | `src/contexts/ReferenceDataContext.tsx` | EDIT | Add `deliverableTypes` to state (seeded from `DELIVERABLE_TYPES`). Add `addDeliverableType`, `updateDeliverableType`, `toggleDeliverableTypeActive` methods. |
| 3 | `src/components/admin/DeliverablesTable.tsx` | NEW | Renders `AdminCrudTable<DeliverableTypeItem>` with columns: Name. Wires toggle/edit/add callbacks. |
| 4 | `src/components/admin/DeliverableDialog.tsx` | NEW | Simple Add/Edit dialog with a single "Name" field. |
| 5 | `src/pages/admin/AdminReferenceData.tsx` | EDIT | Add "Deliverables" tab. Replace the existing tabs list and content to include `DeliverablesTable`. |

### Context Changes (ReferenceDataContext.tsx)

```typescript
interface DeliverableTypeItem {
  id: string;
  name: string;
  isActive: boolean;
}

// New methods
addDeliverableType(name: string): void
  - Generates ID: 'del-' + Date.now()
  - Persists to localStorage

updateDeliverableType(id: string, name: string): void
  - Persists to localStorage

toggleDeliverableTypeActive(id: string): void
  - Flips isActive, persists
```

### Data Flow
- **Entry Form**: Will be updated (if necessary) to read `deliverableTypes.filter(d => d.isActive)` from `ReferenceDataContext` instead of the static `DELIVERABLE_TYPES` constant.

### Test Plan

| # | Test | Expected |
|---|---|---|
| 1 | Navigate to `/admin/reference-data`, click "Deliverables" tab | See table with default types (Workshop, Reporting, etc.) |
| 2 | Click "Add Deliverable Type", enter "Technical Spec" | Row appears in table |
| 3 | Toggle "Workshop" to inactive | Row greys out; "Workshop" disappears from the time entry form dropdown |
| 4 | Edit "Reporting" to "Project Reporting" | Name updates in table and entry form dropdown |
| 5 | Refresh page | All changes persist in localStorage |

