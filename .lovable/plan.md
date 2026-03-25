

# Bundle 007 + Bundle 001: Navigation/IA Cleanup and Chart Axis Fix

## Current State

### Navigation & Naming (Bundle 007)
| Location | Current Label | Issue |
|---|---|---|
| TopBar admin nav | "Dashboards" | Links to `/admin/reports/overview` — mismatch with page title "Dashboards" but route says "reports" |
| TopBar employee nav | "History & Insights" | Page title says "Dashboard" — inconsistent |
| Index.tsx button | "Dashboard" | Links to `/me/insights` — confusing since Index itself has dashboard widgets |
| AdminReportsOverview h1 | "Dashboards" | Has "Preview" badge, feels placeholder-ish |
| EmployeeInsights h1 | "Dashboard" | Should match nav label |
| `/admin` index route | Redirects to `reports/overview` | Works, but `AdminDashboard.tsx` is a dead redirect file |

### Chart Date Axis (Bundle 001)
- **"Today" range**: Renders Mon through today (e.g. 5 bars on Friday). Should show 1 bar only.
- **"This week" range**: Renders 7 days including Sat/Sun. Should default to Mon-Fri (5 working days).
- **Future dates**: No explicit future-date filtering — if `days` extends past today, empty bars render.
- **CohortWidget**: Renders on AdminReportsOverview. Has a `MIN_USERS_FOR_COHORT = 5` guard. Likely the "weird widget" — will recommend keeping but only showing when threshold is met (already implemented).

## Proposed Changes

### Bundle 007: Naming & Navigation

**Canonical naming model:**
- Admin page: "Reports Overview" (not "Dashboards")
- Admin nav link: "Reports" (not "Dashboards")
- Employee nav link: "My Dashboard" (not "History & Insights")
- Employee page title: "My Dashboard" (matches nav)
- Index button: "My Dashboard" → links to `/me/insights`
- Remove "Preview" badge from admin reports page title

**Files to change:**

1. **`src/components/TopBar.tsx`** (lines 33, 38)
   - Admin link label: "Dashboards" → "Reports"
   - Employee link label: "History & Insights" → "My Dashboard"

2. **`src/pages/AdminReportsOverview.tsx`** (line 53-54)
   - h1: "Dashboards" → "Reports Overview"
   - Remove `<Badge variant="secondary">Preview</Badge>`

3. **`src/pages/EmployeeInsights.tsx`** (line 169)
   - h1: "Dashboard" → "My Dashboard"

4. **`src/pages/Index.tsx`** (line 28)
   - Button label: "Dashboard" → "My Dashboard"

5. **`src/pages/AdminDashboard.tsx`** — no change needed (just a redirect, harmless)

### Bundle 001: Chart Date Axis

**Date logic changes in `WeeklyChart.tsx`** (lines 78-108) and `useDashboardDataset.ts`:

The `WeeklyChart` has its own `weekStart`/`days` calculation (lines 78-108) separate from `useDashboardDataset`. Both need alignment.

1. **"Today" range**: Change to render exactly 1 day point.
   - In `WeeklyChart.tsx` line 86-89: Set `days: 1` and `weekStart` to today's date string.
   - In `useDashboardDataset.ts` line 32-35: Already returns `days: dayOfWeek + 1` — change to `days: 1`.

2. **"This week" range**: Change from 7 days to 5 (Mon-Fri).
   - In both `WeeklyChart.tsx` (line 80) and `useDashboardDataset.ts` (line 20-23): Change `days: 7` → `days: 5`.

3. **Future date filtering**: After computing `days`, clamp to not exceed today.
   - Add a post-calculation clamp: if range end date > today, reduce `days` accordingly.

4. **Day label fix**: `deriveDailyBreakdown` in `reportsMockData.ts` uses `dayLabels[i % 7]` — for "today" with `days: 1`, the label needs to be the actual day name, not always "Mon". Fix by deriving label from the actual date.

**Files to change:**

1. **`src/hooks/useDashboardDataset.ts`** — Fix `getDateWindow` for today (1 day) and this_week (5 days)
2. **`src/components/admin/WeeklyChart.tsx`** — Align local `weekStart`/`days` memo with same logic
3. **`src/data/reportsMockData.ts`** — Fix `deriveDailyBreakdown`, `deriveDailyProjectBreakdown`, `deriveDailyDepartmentBreakdown` to derive day labels from actual dates instead of `dayLabels[i % 7]`

**CohortWidget**: Keep as-is. It already has a `MIN_USERS_FOR_COHORT` threshold and won't render for small scopes.

## Summary of All Files Changed

| File | Bundle | Change |
|---|---|---|
| `src/components/TopBar.tsx` | 007 | Nav labels |
| `src/pages/AdminReportsOverview.tsx` | 007 | Page title, remove Preview badge |
| `src/pages/EmployeeInsights.tsx` | 007 | Page title |
| `src/pages/Index.tsx` | 007 | Button label |
| `src/hooks/useDashboardDataset.ts` | 001 | Date window for today/this_week |
| `src/components/admin/WeeklyChart.tsx` | 001 | Align local date logic |
| `src/data/reportsMockData.ts` | 001 | Day labels from actual dates |

## QA Steps

1. **Admin nav**: Sign in as admin → verify nav shows "Reports" → click it → page title says "Reports Overview" → no "Preview" badge
2. **Employee nav**: Sign in as employee → verify nav shows "My Dashboard" → click it → page title says "My Dashboard"
3. **Index button**: Home page button reads "My Dashboard" and links to `/me/insights`
4. **Admin landing**: Navigate to `/admin` → redirects to `/admin/reports/overview` (not a dead-end)
5. **Chart — Today**: Select "Today" → exactly 1 bar with correct day label (e.g. "Wed")
6. **Chart — This week**: Select "This week" → 5 bars (Mon-Fri), no Sat/Sun
7. **Chart — Last week**: Select "Last week" → 5 bars (Mon-Fri)
8. **Chart — This month/quarter/year**: No future dates beyond today
9. **Chart modes**: Verify by-status, by-project, by-department all still render correctly
10. **CohortWidget**: Still visible when user count >= 5

## Rollback Steps

All changes are label/logic-only in 7 files. Revert any file to restore previous behaviour. No database or auth changes.

