

## Workstream Selector UX — Plan

### A) Component Mapping

| Current Component | Current Behavior | Change Needed |
|---|---|---|
| `TimeEntryForm.tsx` | Flat "Project" dropdown via `getAvailableWorkstreams(departmentId)` | Replace with grouped Workstream dropdown (Recent / External / Internal) with conditional Phase vs Work Area fields |
| `DailyGridEntry.tsx` | Same flat "Project" dropdown per grid row | Same grouped dropdown + conditional branching per row |
| `WeeklyTimesheet.tsx` | Entry cards show `project.name`, `phase.name -> activityType.name` | Update display to distinguish internal vs external entries |
| `src/data/seed.ts` | `getAvailableWorkstreams()` returns flat sorted list | Add `getGroupedWorkstreams()` returning `{ recent, external, internal }` and `getRecentWorkstreams()` helper |

### B) File List (5 files)

| # | File | Action |
|---|------|--------|
| 1 | `src/data/seed.ts` | Add `getGroupedWorkstreams(departmentId, entries)` and `getRecentWorkstreams(userId, entries)` helpers |
| 2 | `src/components/TimeEntryForm.tsx` | Replace flat Project dropdown with grouped Workstream selector; add conditional Phase/Work Area branching |
| 3 | `src/components/DailyGridEntry.tsx` | Same grouped selector + conditional branching per grid row |
| 4 | `src/components/WeeklyTimesheet.tsx` | Update entry card display to show "Internal -- Dept" prefix for internal entries |
| 5 | `src/types/index.ts` | Add `GroupedWorkstreams` interface |

### C) Step-by-Step Plan

#### Step 1: Add types and helpers

In `src/types/index.ts`, add:

```text
interface GroupedWorkstreams {
  recent: Project[];       // last 5 distinct workstreams used by user
  external: Project[];     // filtered by department access
  internal: Project[];     // user's department internal workstream
  leave: Project[];        // Leave / Absence (always)
}
```

In `src/data/seed.ts`, add two new exports:

- `getRecentWorkstreams(userId: string, entries: TimeEntry[], limit = 5): Project[]`
  - Filter entries by userId, sort by date descending
  - Extract distinct projectIds in order of most recently used
  - Map to Project objects, return first 5

- `getGroupedWorkstreams(departmentId: string, userId: string, entries: TimeEntry[]): GroupedWorkstreams`
  - `internal`: projects where `type === 'internal_department'` and `owningDepartmentId === departmentId`
  - `external`: projects accessible via `projectDepartmentAccess` for this department (excluding leave)
  - `leave`: the Leave / Absence project
  - `recent`: call `getRecentWorkstreams()`, exclude duplicates already shown? No -- keep all in recent for quick access
  - Return the grouped object

#### Step 2: Update TimeEntryForm.tsx (Single entry mode)

Replace the flat Project `<Select>` with a grouped dropdown using `<SelectGroup>` and `<SelectLabel>`:

```text
<SelectContent>
  {grouped.recent.length > 0 && (
    <SelectGroup>
      <SelectLabel>Recent</SelectLabel>
      {grouped.recent.map(...)}
    </SelectGroup>
  )}
  <SelectGroup>
    <SelectLabel>External projects (support)</SelectLabel>
    {grouped.external.map(...)}
  </SelectGroup>
  <SelectGroup>
    <SelectLabel>Internal -- {departmentName}</SelectLabel>
    {grouped.internal.map(...)}
  </SelectGroup>
  <SelectGroup>
    <SelectLabel>Leave</SelectLabel>
    {grouped.leave.map(...)}
  </SelectGroup>
</SelectContent>
```

Conditional branching after project selection:
- Determine `selectedProject.type` from the selected projectId
- If `external_project`: show Phase dropdown (standard phases via `getPhasesForProject`), then Activity Type dropdown filtered by phase -- existing behavior, no change needed
- If `internal_department`: show Phase dropdown (which already returns department work areas via `getPhasesForProject`) relabeled as "Work area", then Activity Type dropdown -- also existing behavior, just relabel
- The Phase label changes: "Phase" for external, "Work area" for internal
- The Activity Type label changes: "Activity type" for external, "Activity (optional)" text change is not needed per spec -- keep as "Activity type"

Default selection logic:
- On form open, default projectId to the user's internal department workstream (e.g. `proj-internal-consulting` for Consulting users)
- This pre-fills because internal workstreams are always present

#### Step 3: Update DailyGridEntry.tsx (Multiple entries mode)

Same grouped dropdown treatment per grid row. The `GridRowEntry` component gets the same `<SelectGroup>` structure.

Conditional branching per row:
- Check `row.projectId` to determine type
- Phase dropdown placeholder changes to "Work area" for internal, "Phase" for external
- The underlying data flow (phases and activities) already works correctly via `getPhasesForProject()`

Pass `entries` from context to compute recents (the `DailyGridEntry` component already has access to `useTimeEntries`).

#### Step 4: Update WeeklyTimesheet.tsx entry display

Currently shows: `{entry.project.name}` and `{entry.phase.name} -> {entry.activityType.name}`

Change to:
- If `entry.project.type === 'internal_department'`: show "Internal -- {deptName}" as project label, and "{workAreaName} -> {activityName}" below
- If `entry.project.type === 'external_project'`: show project name as before, and "Phase -> Activity" as before
- Use `getDepartmentById(entry.project.owningDepartmentId)` for the department name

This avoids duplicate labels (e.g., showing "Consulting -- Internal" + "Strategy Development -> Planning" instead of repeating department info).

### D) Test Script (15 steps)

1. Log in as Sarah Mitchell (Consulting). Navigate to the Time Registration page.
2. Click "Add entry" (Single entry mode). Verify the Workstream dropdown shows grouped sections: Recent (if entries exist), External projects, Internal -- Consulting, Leave.
3. Verify External projects section shows: Flagship, JICA GBV, CEIC, RISA. Does NOT show Orange Corners or Disrupt_for_Her.
4. Verify Internal section shows: "Consulting -- Internal".
5. Select "Consulting -- Internal". Verify the second dropdown label shows "Work area" and lists: Strategy Development, Client Relationship Management, Knowledge Management, Other.
6. Select "Strategy Development" work area. Verify Activity type dropdown shows: Planning/Preparation, Execution/Delivery, Review/Follow-up, Other (specify).
7. Fill remaining fields (task description, deliverable type, 2h 0min, billable status) and save. Verify entry appears in the day list with label "Internal -- Consulting" and "Strategy Development -> Planning/Preparation".
8. Click "Add entry" again. Select "Flagship" (external). Verify Phase dropdown shows standard phases (Inception, Recruitment, Workshops, etc.) with label "Phase".
9. Select "Inception" phase, then "Inception/kickoff preparations" activity. Fill remaining fields and save. Verify entry shows as "Flagship" with "Inception -> Inception/kickoff preparations".
10. Switch to "Multiple entries" mode. Add a new grid row. Verify the Project dropdown in the grid row also shows grouped sections.
11. In the grid row, select "Consulting -- Internal", then a work area and activity. Save all. Verify entry appears correctly.
12. Switch user to Liam O'Brien (BD). Open "Add entry". Verify External section shows: Flagship, CEIC, Disrupt_for_Her, Orange Corners. Internal section shows "Business Development -- Internal".
13. Select "Business Development -- Internal". Verify work areas show: Proposal Writing, Partnership Development, Market Research, Other.
14. Open "Add entry" again. Verify "Recent" section appears at top showing the workstream just used (BD Internal).
15. Switch to Raj Patel (Finance). Verify External section is empty (Finance has no external project access except Leave). Internal shows "Finance -- Internal". Select it and verify work areas: Budgeting, Financial Reporting, Audit Preparation, Other.

