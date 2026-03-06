

# Plan: Personal Dashboard — Category/Project Filters, Breakdown Tables, and Trend View Toggle

## Current State

**Single file**: `src/pages/EmployeeInsights.tsx` renders the entire page. It already has:
- Time range chips (Today through This year) using `getDateWindow()` from `useDashboardDataset.ts`
- Summary card with tri-state billing totals
- Top Projects table (top 5 + Other, columns: Project | Hours | %)
- Top Activities table (top 8, columns: Activity | Hours | %)
- 6-Week Trend chart (single bar, toggle between Hours and Billable %)
- Recent History table

**Data**: `getOwnEntries()` returns all user entries. Filtered by date range into `rangeEntries`. Projects available in `projects` array from `seed.ts` with `type: 'external_project' | 'internal_department'`.

**Admin Reports stacked bar logic**: `WeeklyChart.tsx` uses `deriveDailyBreakdown()` from `reportsMockData.ts` for billable/maybe/not stacked bars. This returns per-day breakdown from entries.

## Changes — 2 files

### File 1: `src/pages/EmployeeInsights.tsx`

**A) Add Category + Project filter state (lines 52-53 area)**
```typescript
type CategoryFilter = 'all' | 'external' | 'internal';
const [category, setCategory] = useState<CategoryFilter>('all');
const [projectFilter, setProjectFilter] = useState<string>('all');
const [trendView, setTrendView] = useState<'hours' | 'billing_mix'>('hours');
```

**B) Add filter controls below range chips (after line 168)**
- Category: 3 chips (All / External / Internal) matching existing button style
- Project dropdown: `<Select>` showing projects filtered by category. External projects + Leave when "External", internal projects for user's department when "Internal", both when "All". Default "All projects".
- Reset `projectFilter` to `'all'` when `category` changes

**C) Filter `rangeEntries` by category + project (modify lines 58-62)**
Apply category filter: check `getProjectById(e.projectId)?.type` against category. Apply project filter if not `'all'`.

All downstream consumers (`summary`, `topProjects`, `topActivities`) already derive from `rangeEntries` — no further wiring needed.

**D) Enhance Top Projects table (lines 211-238)**
Add "Billable %" column: compute per-project billable minutes / project total minutes. Make rows clickable — `onClick` sets `setProjectFilter(p.id)`.

**E) Replace trend chart with filter-aware stacked option (lines 271-303)**
- Replace the toggle button text: "Hours | Billing mix"
- `trendView === 'hours'`: current single bar behavior BUT filtered by category + project
- `trendView === 'billing_mix'`: stacked bars (billable/maybe/not) per week, reusing the same color scheme as `WeeklyChart.tsx` (`STATUS_CHART_CONFIG`)

For this, change `getWeeklyTotals()` to compute from `ownEntries` filtered by category + project, or compute trend data in a `useMemo` directly from filtered entries grouped by week.

**F) Compute trend from filtered entries instead of `getWeeklyTotals()`**
Build a `useMemo` that groups filtered `ownEntries` (by category + project, across last 6 weeks) into weekly buckets with `totalMinutes`, `billableMinutes`, `maybeMinutes`, `notBillableMinutes`. This replaces the `getWeeklyTotals(currentUser.id, 6)` call.

### File 2: `src/hooks/useDashboardDataset.ts`

No changes needed — `getDateWindow` and `getExpectedMinutes` already exported.

## Layout

```text
[Header]
[Range chips: Today | This week | ... ]
[Category: All | External | Internal]  [Project: dropdown]
[Summary card]
[Top Projects (5+Other)] [Top Activities (8)]
[6-Week Trend — toggle: Hours | Billing mix]
[Recent History]
```

## QA
1. Default state (This week / All / All projects) matches current behavior exactly
2. Selecting "External" hides internal projects from dropdown and tables
3. Clicking a project row in Top Projects sets the project filter
4. Trend chart reflects category + project filters
5. Billing mix stacked bars show correct proportions
6. Totals reconcile across summary card and tables for every filter combo

