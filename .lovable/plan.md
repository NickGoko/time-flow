

## History and Insights — Employee Page

### A) File List (5 files)

| # | File | Action |
|---|------|--------|
| 1 | `src/pages/EmployeeInsights.tsx` | **New** — the full page component with all four sections |
| 2 | `src/App.tsx` | **Edit** — add `/me/insights` route |
| 3 | `src/pages/Index.tsx` | **Edit** — add "History and Insights" button/link to the employee home |
| 4 | `src/contexts/TimeEntriesContext.tsx` | **Edit** — add two helper functions to the context for aggregation |
| 5 | `src/data/seed.ts` | No change needed |

### B) Step-by-Step Plan

#### 1. Add aggregation helpers to `TimeEntriesContext`

Add two new functions to the context interface and provider:

- `getWeeklyTotals(userId, weekStartDates[])` — returns an array of `{ weekStart, totalMinutes, billableMinutes, maybeBillableMinutes, notBillableMinutes }` for charting trends
- `getRecentDays(userId, count)` — returns last N days with entries: `{ date, totalMinutes, billableMinutes, billablePercent, submitted }` for the history table

Both derive from the existing `entries` array — no new data structures needed.

#### 2. Create `src/pages/EmployeeInsights.tsx`

One page with four vertically stacked sections:

**Section 1 — "Today" Card**
- Shows total hours for the selected/current day
- Small breakdown: billable / maybe / not-billable minutes
- "Missing hours" indicator if total is below 8h target (shows delta)
- Uses `getDailyTotalMinutes` + filtered entries from context

**Section 2 — "This Week" Card**
- Weekly total vs 40h expected (reuse the progress bar pattern from `WeeklyTimesheet`)
- Submission status from `isWeekSubmitted` — show "Submitted", "In progress", or "—" with a "Preview" badge
- Small table: top 3-5 projects by hours this week (project name, hours, percentage)
- Derived from `getWeekSummary`

**Section 3 — "Trend" Section**
- Recharts `BarChart` (already available) showing weekly total hours for the last 6 weeks
- X-axis: week labels (e.g. "3 Feb"), Y-axis: hours
- Optional toggle (simple state boolean) to switch bars to show billable % instead of total hours
- Uses `getWeeklyTotals` helper
- Reuses `ChartContainer` and `ChartTooltipContent` from `src/components/ui/chart.tsx`

**Section 4 — "History" Table**
- Uses shadcn `Table` component (already exists)
- Columns: Date (formatted), Hours, Billable %, Submitted?, "View" link
- Shows last 14-21 days with any entries
- "View" link navigates to `/?date=YYYY-MM-DD` — which will require a small URL-param reader in `Index.tsx` to preselect the day/week (or simply navigate to `/` and let the user find the week — simpler approach, just link to `/`)
- Actually, the simplest deep-link: navigate to `/` with a query param `?week=YYYY-MM-DD&day=N`. The `WeeklyTimesheet` can optionally read this from URL search params — but that's extra complexity. For v1, the "View" link will navigate to `/` and the date context will be set via a shared state or simply left as current week. **Simplest approach**: the link navigates to `/` — no deep-linking in v1. Label button as "View week".

#### 3. Update routing in `App.tsx`

Add: `<Route path="/me/insights" element={<EmployeeInsights />} />`

Place it before the catch-all route, inside the providers (already wrapped).

#### 4. Add entry point from employee home (`Index.tsx`)

Add a button or link in the header area (next to the welcome text) that navigates to `/me/insights`:

```text
[History and Insights ->]
```

Using a `Link` from react-router-dom styled as a secondary button.

### C) Helper Function Interfaces

```text
interface WeeklyTotal {
  weekStart: string;
  totalMinutes: number;
  billableMinutes: number;
  maybeBillableMinutes: number;
  notBillableMinutes: number;
}

interface DayHistoryRow {
  date: string;
  totalMinutes: number;
  billableMinutes: number;
  billablePercent: number;
  isSubmitted: boolean | null;  // null = unknown
}

// Added to TimeEntriesContextType:
getWeeklyTotals(userId: string, numberOfWeeks: number): WeeklyTotal[]
getRecentDays(userId: string, numberOfDays: number): DayHistoryRow[]
```

These aggregate from the existing `entries` and `weekStatuses` arrays — no new mock data needed.

### D) Test Steps

1. Navigate to `/` as Sarah (employee) — confirm "History and Insights" button/link appears
2. Click the link — navigates to `/me/insights`
3. **Today card**: shows hours for today, billable split, missing hours indicator
4. **This week**: shows progress bar, top projects table, submission status
5. **Trend chart**: 6 bars visible (one per week), hover shows tooltip with hours
6. Toggle billable % view on chart — bars change to show percentage
7. **History table**: 14+ rows visible with varied data, billable % column shows realistic values
8. Click "View week" on a history row — navigates back to `/`
9. Switch to Emily (admin) — the `/me/insights` page still works (shows Emily's personal data, not admin reports)
10. Verify TopBar still shows correctly on the insights page

