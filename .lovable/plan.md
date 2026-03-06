

# Plan: QA Drift Fixes for Personal Dashboard

## Issues Found

### 1. Reconciliation is a tautology (no real check)
Lines 121-128: `summary` useMemo computes `totalMinutes` from `rangeEntries`, then passes both `rangeEntries` and `totalMinutes` to `reconcileDashboardTotals`. Since the totals are derived from the same entries in the same loop, this can never detect drift. It's checking a value against itself.

**Fix**: Add a second reconciliation pass that cross-checks **topProjects sum** against `summary.totalMinutes`. This catches bugs where the project aggregation diverges from the billing aggregation.

### 2. Top Projects "Other" billable % uses double-rounding
Line 159: `Math.round(p.minutes * p.billablePct / 100)` — `billablePct` is already rounded, so this loses precision. Should track raw billable minutes through the "Other" aggregation.

**Fix**: Track `billableMinutes` as a raw number in the sorted array, compute "Other" billable from raw values.

### 3. No "Other" row in Top Activities table
Top Activities shows top 8 only. The % column won't sum to 100%, which is confusing.

**Fix**: Add an "Other" row when there are more than 8 activities, matching the Top Projects pattern.

## Files to change (1)

`src/pages/EmployeeInsights.tsx` — all fixes are in this file.

### Change A: Fix topProjects "Other" billable precision (lines 138-162)

Track raw `billableMinutes` instead of re-deriving from rounded `billablePct`:
```typescript
const sorted = Object.entries(map)
  .map(([id, data]) => ({
    id,
    name: getProjectById(id)?.name ?? id,
    minutes: data.minutes,
    billableMinutes: data.billableMinutes,
    billablePct: data.minutes > 0 ? Math.round((data.billableMinutes / data.minutes) * 100) : 0,
  }))
  .sort((a, b) => b.minutes - a.minutes);
// "Other" row uses raw billableMinutes sum
const otherBillMins = rest.reduce((s, p) => s + p.billableMinutes, 0);
```

### Change B: Add "Other" row to Top Activities (lines 164-175)

After slicing top 8, compute remaining minutes and add an "Other" row if > 0.

### Change C: Add cross-widget reconciliation (after summary useMemo)

Add a second `useMemo` that checks:
- `topProjects` minutes sum === `summary.totalMinutes`
- `topActivities` minutes sum (including Other) === `summary.totalMinutes`

```typescript
const widgetReconcile = useMemo(() => {
  const projSum = topProjects.reduce((s, p) => s + p.minutes, 0);
  const actSum = topActivities.reduce((s, a) => s + a.minutes, 0);
  return reconcileDashboardTotals({
    entries: rangeEntries,
    kpiTotalMinutes: summary.totalMinutes,
    kpiBillable: summary.billableMinutes,
    kpiMaybe: summary.maybeMinutes,
    kpiNotBillable: summary.notBillableMinutes,
    teamRowsTotalMinutes: projSum, // cross-check projects table
    label: `Personal/${range}/${category}/${projectFilter}/widgets`,
  });
}, [topProjects, topActivities, rangeEntries, summary, range, category, projectFilter]);
```

Remove the reconciliation call from inside the `summary` useMemo (it's a tautology there).

