

## Admin Reports Overview — V0 Preview Plan

### Data Approach

**Hybrid (A + B)**: Metric cards and the stacked bar chart will derive real aggregates from the existing `TimeEntriesContext` (3 users, ~7 seed entries). The cohort/benchmarking widget will use a small mock dataset with realistic distributions, structured behind a typed interface so it can be swapped to real queries later. All mock-sourced sections will carry a "Preview — sample data" label.

---

### A) File List (6 files)

| # | File | Status |
|---|------|--------|
| 1 | `src/types/reports.ts` | New — aggregate interfaces |
| 2 | `src/data/reportsMockData.ts` | New — mock cohort data + helper to derive live aggregates |
| 3 | `src/components/admin/MetricCards.tsx` | New — 4 top-line KPI cards |
| 4 | `src/components/admin/WeeklyChart.tsx` | New — stacked bar chart + filters |
| 5 | `src/components/admin/CohortWidget.tsx` | New — distribution buckets widget |
| 6 | `src/pages/AdminReportsOverview.tsx` | New — page shell |

Plus one small edit to **`src/App.tsx`** to add the `/admin/reports/overview` route under the existing `AdminGuard`. (Same file, not a new one, so still within the 7-file guardrail.)

---

### B) Component Breakdown

#### 1. Metric Cards (`MetricCards.tsx`)
Four cards in a responsive grid (2x2 on mobile, 4-col on desktop):

- **Total Hours** — sum of all entries in the selected range, formatted as "Xh Ym"
- **Billable %** — billable minutes / total minutes, shown as percentage with a small progress bar (accent colour)
- **Non-billable Hours** — not_billable + maybe_billable totals
- **Active Users** — count of distinct userIds with entries in range (from live data; will be small in V0)

Each card uses the existing `Card` primitive with `bg-card border-border rounded-lg`. Values in large semibold text, labels in `text-muted-foreground`.

#### 2. Stacked Bar Chart (`WeeklyChart.tsx`)
- Uses `recharts` (already installed) via the existing `ChartContainer` wrapper from `src/components/ui/chart.tsx`.
- X-axis: days of the selected week (Mon-Sun).
- Stacked bars: one segment per billable status (Billable / Maybe Billable / Not Billable).
- Colours: Billable = `--primary` (#FF6F16), Maybe = `--muted-foreground` (#767676), Not Billable = `--secondary` (#EBEBEB with dark text).
- **Filters** (above chart):
  - Date range toggle: "This week" / "Last week" / "This month" (switches between weekly and daily granularity).
  - Project filter: a `Select` dropdown listing all active projects, defaulting to "All projects".
- Data derived live from `useTimeEntries().entries`.

#### 3. Cohort Widget (`CohortWidget.tsx`)
- Three horizontal buckets displayed as a simple bar/card layout:
  - **Top 25%**: users logging >= 95% of expected hours
  - **Mid 50%**: users between 60-95%
  - **Bottom 25%**: users below 60%
- Each bucket shows: bucket label, user count, average % of expected hours.
- **Privacy guard**: if total users in the dataset < 5, render an "Insufficient group size for anonymous reporting" placeholder instead of buckets.
- V0 uses mock data from `reportsMockData.ts` (8 synthetic user summaries). Labelled "Preview — sample data" in muted text.
- Interface designed so the mock array can be replaced by a Supabase query returning the same shape.

#### 4. Page Shell (`AdminReportsOverview.tsx`)
- `TopBar` at top (existing).
- Page heading: "Reports Overview" with a "Preview" badge.
- Layout: MetricCards row, then Chart section, then CohortWidget — all inside a `container px-4 py-8` with 24px vertical gaps.

---

### C) Data Model Interfaces (`src/types/reports.ts`)

```text
ReportMetrics {
  totalMinutes: number
  billableMinutes: number
  maybeBillableMinutes: number
  notBillableMinutes: number
  activeUserCount: number
  periodLabel: string
}

DailyBreakdown {
  date: string
  dayLabel: string
  billableMinutes: number
  maybeBillableMinutes: number
  notBillableMinutes: number
}

CohortBucket {
  label: string            // "Top 25%", "Mid 50%", "Bottom 25%"
  userCount: number
  avgPercentOfExpected: number
  minPercent: number
  maxPercent: number
}

UserWeekSummary {
  userId: string
  totalMinutes: number
  expectedMinutes: number
  percentOfExpected: number
}
```

These interfaces are backend-agnostic. When Supabase is added, a query will return data conforming to these same shapes.

---

### D) Route Wiring (`App.tsx` edit)

Add a nested route under the existing admin guard:

```text
<Route path="/admin" element={<AdminGuard />}>
  <Route index element={<AdminDashboard />} />
  <Route path="reports/overview" element={<AdminReportsOverview />} />
</Route>
```

The existing `AdminGuard` already enforces the admin role check. A link from `AdminDashboard` to `/admin/reports/overview` will also be added.

---

### E) Test Steps

1. **Default role (Employee)** — navigate to `/admin/reports/overview` directly. Expect "Not authorised" message.
2. **Switch to Admin** via user dropdown. Navigate to `/admin`. See a link to "Reports Overview".
3. **Open reports page** — four metric cards render with values derived from seed entries.
4. **Check chart** — stacked bar chart shows current week's data by billable status.
5. **Change date filter** to "Last week" — chart updates (may show zero if no seed data for that week).
6. **Change project filter** — chart filters to selected project only.
7. **Cohort widget** — three buckets render with mock data. "Preview — sample data" label visible.
8. **Privacy guard** — (verified by code inspection) if `userCount < 5`, the widget shows the "Insufficient group size" placeholder instead of buckets.
9. **Visual check** — no shadows on cards, accent colour only on primary elements, all text uses design-system tokens.
10. **Switch back to Employee** — admin nav link disappears; direct URL to reports page is blocked.

