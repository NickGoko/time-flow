

## Milestone 2.5: Admin-only Reference Data Management Gating

### Current State Analysis

After thorough codebase exploration, here is what exists today:

| Requirement | Status | Details |
|---|---|---|
| Reference data mutation screens | **None exist** | All reference data (projects, phases, activity types, work areas, departments) is hardcoded in `src/data/seed.ts`. There are no admin CRUD screens or mutation actions for any of this data. |
| Employee blocked from admin actions | **N/A** | No mutation actions exist to block. |
| Entry form fetches only "active" items | **Already done** | Both `getAvailableWorkstreams()` and `getGroupedWorkstreams()` in `src/data/seed.ts` already filter by `p.isActive` (lines 389, 397, 421, 429). |

### Conclusion: No Changes Required

All three requirements are already satisfied:

1. **No reference data mutation UI exists** -- there are no screens, buttons, or forms that let any user (admin or employee) create, edit, or delete projects, phases, activity types, work areas, or deliverable types. Everything is static seed data.

2. **Employee cannot trigger mutations** -- since no mutation actions exist, there is nothing to block.

3. **Active-only filtering** -- the `getAvailableWorkstreams()` and `getGroupedWorkstreams()` functions already filter `isActive === true` before populating the entry form dropdowns. The Leave project is handled separately and always included.

### Files Changed

None. Zero diff.

### Test Steps

1. Sign in as an **employee** (e.g. Sarah Chen). Open the time entry form. Verify that all workstream/project dropdowns only show active items (all seed data is currently active, so everything should appear).
2. Confirm there are no "Manage projects", "Edit workstreams", or similar admin CRUD buttons anywhere in the UI.
3. Sign in as an **admin** (e.g. James Odhiambo). Confirm the same -- no reference data management screens exist yet.
4. (Future) When admin CRUD screens are built, they should be placed under `/admin/*` routes which are already protected by the `AdminGuard`.

