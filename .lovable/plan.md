

## Improve Admin Reports Overview — Plan

### A) Files to Touch (5)

| # | File | Status |
|---|------|--------|
| 1 | `src/types/reports.ts` | Edit — add `TeamMemberSummary`, `ProjectBreakdownItem`, `OperationalInsights` interfaces |
| 2 | `src/data/reportsMockData.ts` | Edit — add `deriveTeamSummary`, `deriveProjectBreakdown`, `deriveOperationalInsights` helpers |
| 3 | `src/components/admin/WeeklyChart.tsx` | Edit — add breakdown toggle (Billable status / Top projects) |
| 4 | `src/components/admin/TeamSummaryTable.tsx` | New — scannable user summary table |
| 5 | `src/pages/AdminReportsOverview.tsx` | Edit — add operational insight cards + TeamSummaryTable, wire metrics to match chart range |

---

### B) Step-by-Step Plan

#### 1. New interfaces (`src/types/reports.ts`)

Add three new interfaces:

```text
TeamMemberSummary {
  userId: string
  userName: string
  totalMinutes: number
  compliancePercent: number    // totalMinutes / expectedMinutes * 100
  billablePercent: number
  maybeBillableMinutes: number
  weekSubmitted: boolean
}

ProjectBreakdownItem {
  projectId: string
  projectName: string
  totalMinutes: number
}

OperationalInsights {
  maybeBillableCount: number
  maybeBillableMinutes: number
  backdatedEntryCount: number  // entries where createdAt date > entry date + 1 day
}
```

#### 2. Data helpers (`src/data/reportsMockData.ts`)

Add three new functions that derive from live `TimeEntry[]` data:

- **`deriveTeamSummary(entries, weekStart, days, users, weekStatuses)`**: Groups entries by userId, computes hours/compliance/billable%/maybe-billable for each user. Checks `weekStatuses` for submission status. Returns `TeamMemberSummary[]`.

- **`deriveProjectBreakdown(entries, weekStart, days)`**: Groups entries by projectId, sums minutes per project, sorts descending. Returns top 5 as named items + aggregates the rest into an "Other" bucket. Returns `ProjectBreakdownItem[]` — used as chart data when "Top projects" breakdown is selected.

- **`deriveOperationalInsights(entries, weekStart, days)`**: Counts maybe-billable entries/minutes and backdated entries (where `createdAt` date is more than 1 day after `entry.date`). Returns `OperationalInsights`.

#### 3. Chart breakdown toggle (`src/components/admin/WeeklyChart.tsx`)

- Add a `breakdownMode` state: `'billable_status' | 'top_projects'` (default: `'billable_status'`).
- Render a small toggle (two `Button` elements) next to the existing date-range buttons, labelled "By status" / "By project".
- When `'billable_status'` is selected: current stacked bar chart (no change).
- When `'top_projects'` is selected:
  - Call `deriveProjectBreakdown` to get top 5 projects + "Other".
  - Reshape daily breakdown data so each day has keys per project (e.g. `proj-flagship`, `proj-ceic`, ..., `other`).
  - Render stacked bars with one segment per project, using a generated colour palette (5 distinct hues + grey for "Other").
  - Update the legend dynamically to show project names.
- The project filter dropdown is hidden when breakdown is "By project" (redundant).

#### 4. Team summary table (`src/components/admin/TeamSummaryTable.tsx`)

A new component using existing `Table` primitives. Columns:

| User | Hours | Compliance % | Billable % | Maybe billable | Week submitted? |
|------|-------|-------------|-----------|---------------|----------------|
| Sarah Mitchell | 24h 0m | 60% | 92% | 0h | No |

- Compliance = totalMinutes / (expectedWeeklyHours * 60) * 100, capped display at 100%.
- "Week submitted?" shows a green check or red dash.
- Uses `deriveTeamSummary` for data.
- Labelled "Preview — sample data" if user count is small (optional, since this is live data).
- Not a ranking: rows sorted alphabetically by name, not by hours.

Props: `entries`, `weekStart`, `days` — derived in the page shell to stay in sync with the chart's range.

#### 5. Page shell updates (`src/pages/AdminReportsOverview.tsx`)

- **Lift range state up**: Move the `range` state (this_week / last_week / this_month) from `WeeklyChart` into the page shell so MetricCards, TeamSummaryTable, and OperationalInsights all respond to the same time range. Pass `range` down to `WeeklyChart` as a prop.
- **Operational insights**: Add two small `Card` components between MetricCards and the chart:
  - "Maybe billable": shows count of entries + total hours with maybe_billable status in the range.
  - "Data quality": shows count of backdated entries (created more than 1 day after the entry date). If zero, shows "No flags".
- **TeamSummaryTable**: Rendered below the CohortWidget.
- **Context note**: The page always uses all entries (all users), independent of the user-selector context switch. No filtering by `currentUser` — this is an admin-wide view.

---

### C) Data Model Summary

All new interfaces are backend-agnostic and can be populated by Supabase queries returning the same shapes. The derivation functions accept raw `TimeEntry[]` arrays, so swapping the data source only requires changing where entries come from (context vs. query).

---

### D) Test Steps

1. **Load reports page as Admin** — metric cards, chart, cohort widget, team table, and insight cards all render.
2. **Default state** — chart shows "By status" breakdown for "This week", project filter set to "All projects".
3. **Toggle to "By project"** — chart switches to per-project stacked bars. Project filter dropdown hides. Legend updates to show project names.
4. **Toggle back to "By status"** — original billable/maybe/not-billable stacking returns. Project filter reappears.
5. **Change range to "Last week"** — metric cards, chart, team table, and operational insights all update together.
6. **Change range to "This month"** — same synchronised update.
7. **Team summary table** — verify all 3 seed users appear with correct hours, compliance %, billable %, and submission status.
8. **Operational insights** — "Maybe billable" card shows count/hours. "Data quality" card shows backdated count or "No flags".
9. **Switch user context** (Employee dropdown) — reports page data does NOT change (admin sees all users regardless).
10. **Switch role to Employee** — navigate to `/admin/reports/overview` directly, see "Not authorised".

