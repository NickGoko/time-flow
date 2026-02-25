

## Brick 6: Phases & Activity Types CRUD

### Overview

Add admin management for Phases and their child Activity Types on the "Phases" tab. Phases are the parent; each activity type belongs to one phase via `phaseId`. Both support name + isActive. The entry form already reads via `getActivitiesForPhase` and `getPhasesForProject` which filter by `isActive`, so changes propagate automatically.

### Files (4 files)

| # | File | Action | Description |
|---|---|---|---|
| 1 | `src/contexts/ReferenceDataContext.tsx` | EDIT | Make `phases` and `activityTypes` mutable (add `setPhases`, `setActivityTypes`). Add 6 methods: `addPhase`, `updatePhase`, `togglePhaseActive`, `addActivityType`, `updateActivityType`, `toggleActivityTypeActive`. Expose on context type. |
| 2 | `src/components/admin/PhasesTable.tsx` | NEW | Two-level display: phases listed via `AdminCrudTable`, with an expandable/inline section showing child activity types for the selected phase. Includes phase-level add/edit/toggle and a nested activity types sub-table. |
| 3 | `src/components/admin/PhaseDialog.tsx` | NEW | Add/Edit dialog for a phase (single "Name" field) and for an activity type (Name field + parent Phase select, pre-filled when adding from within a phase). |
| 4 | `src/pages/admin/AdminReferenceData.tsx` | EDIT | Replace the Phases placeholder card with `PhasesTable`. |

### Context Changes (ReferenceDataContext.tsx)

New methods added to the interface:

```text
addPhase(name: string): void
  - ID: 'phase-' + Date.now()
  - isActive: true
  - Persists to localStorage (LS_PHASES)

updatePhase(id: string, name: string): void
  - Persists to localStorage

togglePhaseActive(id: string): void
  - Flips isActive, persists

addActivityType(name: string, phaseId: string): void
  - ID: 'act-' + Date.now()
  - isActive: true
  - Persists to localStorage (LS_ACTIVITY_TYPES)

updateActivityType(id: string, updates: { name?: string; phaseId?: string }): void
  - Merges updates, persists

toggleActivityTypeActive(id: string): void
  - Flips isActive, persists
```

Implementation: change line 95-96 from `const [phases]` / `const [activityTypes]` to include setters, then add 6 `useCallback` methods following the exact same pattern as existing CRUD methods (e.g., `addDeliverableType`).

### PhasesTable Design

The table displays phases using `AdminCrudTable<Phase>` with a single "Name" column. When a phase row is clicked or expanded, a nested sub-table appears below it showing that phase's activity types (also using `AdminCrudTable<ActivityType>`). Each level has its own Add button:

- Top level: "Add Phase" button
- Nested level: "Add Activity Type" button (pre-fills `phaseId` to the parent phase)

### PhaseDialog

A single dialog component handling both entity types via a `mode` prop:

| Mode | Fields | Notes |
|---|---|---|
| phase | Name (Input) | Simple single field |
| activityType | Name (Input), Phase (Select) | Phase pre-selected when adding from nested view; editable when adding from top-level |

### What Does NOT Change

- AdminCrudTable (reused as-is)
- TimeEntryForm (reads from `getActivitiesForPhase` and `getPhasesForProject` which already filter by `isActive`)
- Other tables (Workstreams, Work Areas, Deliverables)
- Seed data, types, routing

### Test Plan

| # | Test | Expected |
|---|---|---|
| 1 | Navigate to `/admin/reference-data`, click "Phases" tab | See all 9 phases (Inception, Recruitment, Workshops, etc.) |
| 2 | Click/expand "Inception" phase | See child activity types (Kickoff preparation, Kickoff meeting, etc.) |
| 3 | Click "Add Phase", enter "Pilot Testing" | New phase row appears in table |
| 4 | Expand "Pilot Testing", click "Add Activity Type", enter "Field trial" | Activity appears under Pilot Testing |
| 5 | Toggle "Workshops / bootcamps" phase inactive | Row greys out; phase disappears from external project dropdowns in entry form |
| 6 | Toggle activity "Kickoff preparation" inactive under Inception | Activity disappears from entry form when Inception phase is selected |
| 7 | Edit phase name "Reporting" to "Reports & Documentation" | Name updates in table and entry form |
| 8 | Refresh page | All changes persist (localStorage) |

