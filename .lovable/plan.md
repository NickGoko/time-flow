

# Plan: Scope Selector + Scoped Team Summary Table

## Overview

Add a scope selector (My / Department / Org) to the Reports Overview page. All existing data-derive functions receive a pre-filtered `entries` array and `users` array based on scope. The TeamSummaryTable is only shown for Department and Org scopes. Sorting by hours descending is added.

## Current architecture

All report components (`MetricCards`, `WeeklyChart`, `TeamSummaryTable`, `CohortWidget`) independently call `getAllEntries()` and `allUsers` from context, then pass to derive functions in `reportsMockData.ts`. To add scoping, the parent page must filter entries/users and pass them down, rather than each child fetching independently.

## Files to change (5)

| # | File | Change |
|---|---|---|
| 1 | `src/pages/AdminReportsOverview.tsx` | Add scope state + selector UI. Compute `scopedEntries` and `scopedUsers`. Pass them as props to child components. |
| 2 | `src/components/admin/MetricCards.tsx` | No change (already receives `metrics` as props). |
| 3 | `src/components/admin/WeeklyChart.tsx` | Accept optional `entries` prop; if provided, use it instead of `getAllEntries()`. |
| 4 | `src/components/admin/TeamSummaryTable.tsx` | Accept `entries`, `users` props. Add sortable columns (hours desc default). Only rendered when scope is not "my". |
| 5 | `src/components/admin/CohortWidget.tsx` | Accept optional `entries`, `users` props. |

## Scope selector UI

Segmented button group (reuse existing `Button` pattern like the range selector):

```
[My] [Department] [Organisation]
```

- **My**: always visible. Filters `entries` to `userId === currentUser.id`, `users` to just current user.
- **Department**: visible only if `currentUser.appRole` is `hod`, `leadership`, `admin`, or `super_admin`. For HOD: uses `currentUser.managedDepartments` to filter. If multiple departments, show a `Select` dropdown beside scope selector. For admin/leadership: show all departments in dropdown.
- **Organisation**: visible only if `appRole` is `leadership`, `admin`, or `super_admin`. No filtering.

Default scope: "My" for employees/HODs, "Organisation" for admin/leadership.

## Scope filtering logic (in AdminReportsOverview)

```typescript
const scopedEntries = useMemo(() => {
  if (scope === 'my') return entries.filter(e => e.userId === currentUser.id);
  if (scope === 'department') return entries.filter(e => {
    const user = allUsers.find(u => u.id === e.userId);
    return user && selectedDepartments.includes(user.departmentId);
  });
  return entries; // org
}, [scope, entries, currentUser, allUsers, selectedDepartments]);

const scopedUsers = useMemo(() => {
  if (scope === 'my') return allUsers.filter(u => u.id === currentUser.id);
  if (scope === 'department') return allUsers.filter(u => selectedDepartments.includes(u.departmentId));
  return allUsers;
}, [scope, allUsers, currentUser, selectedDepartments]);
```

## TeamSummaryTable enhancements

- Accept `entries: TimeEntry[]` and `users: User[]` as props (no longer fetches from context).
- Default sort: hours descending (currently alphabetical).
- Add click-to-sort on column headers (simple state toggle, no library needed).
- Only rendered when `scope !== 'my'` (controlled by parent).

## RBAC enforcement

Backend enforcement is already in place: `time_entries` RLS restricts SELECT to own entries + `time:read_all` + `time:read_department` with `is_department_scoped()`. The scope selector only controls which subset the UI requests; the backend will not return unauthorized rows regardless. The UI hides scope options the user cannot use.

## Acceptance criteria

1. Employee sees only "My" scope option. Cannot select Department or Org.
2. HOD sees "My" and "Department". Department dropdown shows only their managed departments.
3. Admin/Leadership/Super_admin sees all three scopes. Department dropdown shows all departments.
4. TeamSummaryTable hidden in "My" scope, visible in Department/Org.
5. TeamSummaryTable sorts by hours descending by default.
6. Metric cards, chart, insights, and cohort widget all reflect the selected scope.
7. Values in TeamSummaryTable reconcile with headline metric totals for the same scope and range.

