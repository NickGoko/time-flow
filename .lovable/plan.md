

# Plan: Time Granularity, Team Summary Scope Consistency, and Unified Data Query

## Summary

Three changes across 4 files: (1) the new time ranges already exist but compliance % in TeamSummaryTable is hardcoded to weekly expected hours — fix it to be range-aware; (2) make TeamSummaryTable show a single-row "My summary" when scope=My; (3) extract a shared `useDashboardDataset` hook so all sections consume one filtered dataset.

## Current issues

1. **Time ranges already added** — Today/Quarter/Year chips exist and work for KPIs + chart. But `deriveTeamSummary` in `reportsMockData.ts` (line 232) hardcodes `WEEKLY_EXPECTED_HOURS * 60` for compliance %, which is wrong for Today (should be 8h), This month (working days × 8h), This quarter, This year.

2. **Team summary ignores scope=My** — Currently hidden when `scope === 'my'` (line 236 of AdminReportsOverview). Should show a single-row summary for the current user.

3. **No unified dataset hook** — AdminReportsOverview computes `scopedEntries`, `scopedUsers`, `scopedWeekStatuses`, `weekStart`, `days`, `rangeStartDate`, `rangeEndDate` inline. Extract to a hook for reuse and single-source-of-truth.

4. **CohortWidget ignores range** — always uses `getWeekStart()` (current week) regardless of the selected range. Should use the same range.

## Files to change (4)

| # | File | Change |
|---|---|---|
| 1 | `src/hooks/useDashboardDataset.ts` | **New.** Extract scope/range/filter logic from AdminReportsOverview into a reusable hook. Returns `scopedEntries`, `scopedUsers`, `scopedWeekStatuses`, `weekStart`, `days`, `rangeStartDate`, `rangeEndDate`, `metrics`, `insights`, `blockedByCapCount`. |
| 2 | `src/pages/AdminReportsOverview.tsx` | Replace inline computation with `useDashboardDataset()`. Show TeamSummaryTable for all scopes (remove `scope !== 'my'` guard). Pass `range` to TeamSummaryTable and CohortWidget. |
| 3 | `src/components/admin/TeamSummaryTable.tsx` | Accept `range` prop. Compute `expectedMinutes` based on range: Today → 8h, This week/Last week → 40h, This month/quarter/year → (working days in range × 8h). For scope=My, show single row with "My summary" heading instead of "Team Summary". |
| 4 | `src/components/admin/CohortWidget.tsx` | Accept `weekStart` and `days` as props instead of computing internally. Use parent-provided range. |
| 5 | `src/data/reportsMockData.ts` | Update `deriveTeamSummary` to accept `expectedMinutesPerUser` parameter instead of hardcoding `WEEKLY_EXPECTED_HOURS * 60`. |

## Compliance % calculation

```typescript
function getExpectedMinutes(range: RangeOption, days: number): number {
  if (range === 'today') return 8 * 60;                    // 480
  if (range === 'this_week' || range === 'last_week') return 40 * 60; // 2400
  // For month/quarter/year: count weekdays in the range
  // Approximate: days × (5/7) × 8h
  const workingDays = Math.round(days * 5 / 7);
  return workingDays * 8 * 60;
}
```

## useDashboardDataset hook

Encapsulates all the logic currently on lines 22–127 of AdminReportsOverview:
- Inputs: `scope`, `selectedDeptId`, `range`
- Reads from `useTimeEntries()` and `useAuthenticatedUser()`
- Returns: `{ scopedEntries, scopedUsers, scopedWeekStatuses, weekStart, days, rangeStartDate, rangeEndDate, metrics, insights, blockedByCapCount, availableDepartments, canViewDepartment, canViewOrg }`

AdminReportsOverview becomes a thin UI shell that renders controls and passes hook output to children.

## TeamSummaryTable for scope=My

When `users` array has length 1, show heading "My summary" instead of "Team Summary". Table still renders with one row — same columns, same data. No special card needed.

## CohortWidget range awareness

Currently hardcodes `getWeekStart()`. Change to accept `weekStart` and `days` props, pass from parent. The "current week" label becomes dynamic based on range.

## QA checklist

1. Switch to each range (Today through This year) — verify compliance % changes appropriately in team table
2. Scope=My shows single-row table with "My summary" heading
3. Scope=Department shows only department users, compliance % correct for range
4. Scope=Org shows all users, compliance % correct for range
5. CohortWidget reflects selected range, not just current week
6. KPI totals match sum of team table Hours column
7. Switching any filter immediately updates all sections

