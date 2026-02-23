

## Milestone 2.4: Data Access Control Layer

### Current State

The `TimeEntriesContext` already enforces:
- **Mutations**: `assertOwnership` blocks add/update/delete/submit for non-matching userId
- **Query functions**: All take a `userId` param and filter internally
- **Admin reports**: Access raw `entries` array from context to aggregate across all users

**Gap**: The raw `entries` array is exposed on the context and consumed by employee components (`TimeEntryForm`, `DailyGridEntry`) for the `getGroupedWorkstreams` helper. While that helper internally filters by userId, the full array is technically accessible to any component.

### Plan (3 files changed)

#### File 1: `src/contexts/TimeEntriesContext.tsx`

1. Add two new scoped accessors to the context:
   - `getOwnEntries(): TimeEntry[]` -- returns `entries.filter(e => e.userId === currentUser.id)`. Safe for employee components.
   - `getAllEntries(): TimeEntry[]` -- returns the full array but logs a `console.warn` if called by a non-admin user: `"[TimeEntries] getAllEntries called by non-admin user"`.

2. Remove raw `entries` from the context type (breaking change forces all consumers to pick the right accessor).

3. Keep `weekStatuses` exposed (admin reports need it and it contains no sensitive data beyond submission flags).

#### File 2: `src/components/TimeEntryForm.tsx`

- Replace `entries` destructure with `getOwnEntries()` call for the `getGroupedWorkstreams` usage.

#### File 3: `src/components/DailyGridEntry.tsx`

- Same change: replace `entries` with `getOwnEntries()`.

#### File 4: `src/pages/AdminReportsOverview.tsx`

- Replace `entries` with `getAllEntries()` (admin-scoped, clearly labeled).

#### File 5: `src/components/admin/WeeklyChart.tsx`

- Replace `entries` with `getAllEntries()`.

#### File 6: `src/components/admin/TeamSummaryTable.tsx`

- Replace `entries` with `getAllEntries()`.

#### File 7: `src/components/admin/CohortWidget.tsx`

- Replace `entries` with `getAllEntries()`.

**Total: 7 files** (within the 8-file guardrail).

### What This Achieves

- Employee components can only access their own entries -- even if someone hacks a component, `getOwnEntries()` is pre-filtered.
- Admin components explicitly opt into `getAllEntries()` with a dev warning if misused.
- Mutations remain protected by existing `assertOwnership`.
- No new service file needed -- the context IS the data access layer, now with scoped read accessors.

### Test Steps

1. Sign in as an employee (e.g. Sarah Chen). Create a time entry. Open browser console -- no warnings.
2. Navigate to `/` -- verify entries display correctly (only own entries).
3. Sign out. Sign in as admin (e.g. James Odhiambo). Go to `/admin/reports/overview` -- verify all-user reports render correctly with no console warnings.
4. (Dev test) Temporarily call `getAllEntries()` from an employee component -- verify console warning appears.
5. Verify no TypeScript errors (raw `entries` removed from context type).

