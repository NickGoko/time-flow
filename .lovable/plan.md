

# Correctness Audit + Shared `getDashboardData` Module

## Part 1: Current Architecture Map

### Files where KPIs/charts/tables are calculated

| File | What it computes | Data source |
|---|---|---|
| `src/pages/EmployeeInsights.tsx` | summary totals, topProjects, topActivities, 6-week trend chart, recent history | `getOwnEntries()` from `TimeEntriesContext` (in-memory seed data) |
| `src/pages/AdminReportsOverview.tsx` | Delegates to `useDashboardDataset` hook + `deriveMetrics`/`deriveOperationalInsights` from `reportsMockData.ts` | `getAllEntries()` from `TimeEntriesContext` |
| `src/hooks/useDashboardDataset.ts` | Scoped entries/users/weekStatuses, date window, metrics, insights, blockedByCapCount | `getAllEntries()` + `weekStatuses` + `validationEvents` from context |
| `src/data/reportsMockData.ts` | `deriveMetrics`, `deriveDailyBreakdown`, `deriveProjectBreakdown`, `deriveDepartmentBreakdown`, `deriveTeamSummary`, `deriveOperationalInsights`, cohort helpers | Pure functions operating on `TimeEntry[]` |
| `src/components/admin/WeeklyChart.tsx` | Daily breakdown by status/project/department (own date window calculation duplicating `useDashboardDataset`) | Receives `entries` as prop or falls back to `getAllEntries()` |
| `src/components/admin/TeamSummaryTable.tsx` | Team summary rows via `deriveTeamSummary` | Receives `entries`, `users`, `weekStatuses` as props |
| `src/components/admin/MetricCards.tsx` | Pure display — receives `metrics` | Props only |
| `src/components/admin/CohortWidget.tsx` | Cohort buckets via `deriveCohortSummaries` + `buildCohortBuckets` | Receives `entries`, `users`, `weekStart`, `days` as props |
| `src/components/PersonalDashboard.tsx` | Weekly KPI cards (logged, remaining, billable rate, week status) | `getWeekSummary()` from context |
| `src/lib/reconcile.ts` | Cross-check billing mix + entry sum vs KPI | Called from both pages |

### Supabase queries executed

Both pages currently use **in-memory seed data** — no Supabase queries are executed for dashboard/report calculations. The `TimeEntriesContext` loads `seedTimeEntries` into state. All filtering and aggregation happens client-side.

The network requests visible are reference data loads (profiles, departments, projects, phases, activity_types, etc.) from Supabase tables — NOT time entry queries. The `time_entries_enriched` view exists but is not queried by either dashboard page.

### Where billable/maybe/not billable totals are computed — drift sources

**EmployeeInsights.tsx** computes totals **3 independent times**:

1. **`summary` useMemo (line 112-122)**: Iterates `rangeEntries`, bucketing by `billableStatus`. Single-pass, correct.
2. **`topProjects` useMemo (line 131-155)**: Iterates `rangeEntries` again, only tracks `billableMinutes` (not maybe/not). Could drift from summary if entry filtering diverges.
3. **`chartData` useMemo (line 190-233)**: Iterates `ownEntries` (not `rangeEntries`!) with its own category+project filter. Uses a **different date range** (6-week windows) so intentionally different from summary — but the filter logic is duplicated.

**AdminReportsOverview.tsx** has **2 independent computation paths**:

1. **`useDashboardDataset` hook**: Calls `deriveMetrics()` which filters entries by date range and computes billable buckets.
2. **`WeeklyChart` component**: Has its own `weekStart`/`days` calculation (lines 78-108 of WeeklyChart.tsx) that **duplicates** `getDateWindow()` logic. If these diverge, chart totals won't match KPI totals.
3. **`TeamSummaryTable`**: Calls `deriveTeamSummary()` which filters entries by date range independently.

**Identified drift sources:**
- `WeeklyChart` duplicates date window calculation instead of receiving `weekStart`/`days` from parent
- `deriveMetrics` and `deriveTeamSummary` both independently filter by date range — could produce different entry sets
- `EmployeeInsights` chart uses `ownEntries` with duplicated filter logic instead of deriving from `rangeEntries`
- `reconcileDashboardTotals` in `EmployeeInsights` checks KPI vs entry sum but both come from same `rangeEntries` — the chart is the unvalidated path

## Part 2: Recommended Shared Module

### Approach: `useDashboardData(params)` hook

Rather than a full refactor, create a thin hook that wraps the existing aggregation functions into a single output. Both pages call it, get one object, pass slices to child components.

```text
src/hooks/useDashboardData.ts  (NEW — ~80 lines)

Input:
  entries: TimeEntry[]           // already scoped/filtered by caller
  range: RangeOption
  users?: User[]                 // for team/dept breakdowns
  weekStatuses?: WeekStatus[]    // for submission status

Output:
  totals: { totalMinutes, billableMinutes, maybeMinutes, notBillableMinutes }
  topProjects: { id, name, minutes, billableMinutes, billablePct }[]
  topActivities: { label, minutes }[]
  weeklyTrend: { weekLabel, totalMinutes, billableMinutes, maybeMinutes, notBillableMinutes }[]
  teamSummary: TeamMemberSummary[]  (if users provided)
  reconcileResult: ReconcileResult
```

### Key design decisions:
- **Input is pre-filtered entries** — the caller (EmployeeInsights or useDashboardDataset) handles scope/category/project filtering. This avoids changing the filtering logic.
- **One pass** for totals + project + activity aggregation (single loop over entries).
- **Trend data** computed from a broader entry set (caller provides full user entries, hook handles 6-week windowing internally with category/project filter params).
- **Reconciliation built-in** — runs automatically after aggregation, ensuring every consumer is validated.

### Files to change:
1. `src/hooks/useDashboardData.ts` — **New**. Shared aggregation hook.
2. `src/pages/EmployeeInsights.tsx` — Replace inline `summary`, `topProjects`, `topActivities`, `chartData` useMemos with single `useDashboardData()` call.
3. `src/pages/AdminReportsOverview.tsx` — Wire `useDashboardData()` for the reconciliation pass (metrics already come from `useDashboardDataset` which calls `deriveMetrics` — keep that, but add cross-widget validation).

### What NOT to change:
- `useDashboardDataset.ts` — keep as-is for scope/user filtering
- `reportsMockData.ts` — keep existing derive functions; the new hook calls them internally
- `WeeklyChart.tsx`, `TeamSummaryTable.tsx`, `MetricCards.tsx` — keep as-is; they receive props from parent
- No new routes or pages

### Implementation order:
1. Create `useDashboardData.ts` with aggregation logic extracted from EmployeeInsights
2. Wire EmployeeInsights to use it (summary, topProjects, topActivities, trend all from one source)
3. Wire AdminReportsOverview's reconciliation to validate team table sum against metrics

