

# Plan: Reports Overview Cleanup — Scope, Breakdown, and Department Filter Fixes

## 1. Audit — Current State

### File map

| File | Role |
|---|---|
| `src/pages/AdminReportsOverview.tsx` | Page: scope chips, range chips, passes scoped data to children |
| `src/components/admin/WeeklyChart.tsx` | Chart: breakdown chips (By status / By project), project dropdown, department dropdown |
| `src/components/admin/MetricCards.tsx` | KPI cards (receives `metrics` prop) |
| `src/components/admin/TeamSummaryTable.tsx` | Sortable table (receives entries/users/weekStatuses props) |
| `src/components/admin/CohortWidget.tsx` | Cohort widget (receives entries/users props) |
| `src/data/reportsMockData.ts` | All derive* functions |
| `src/types/reports.ts` | Type definitions |

### Current UI controls

| Control | Location | State | Affects |
|---|---|---|---|
| Scope chips (My / Department / Organisation) | `AdminReportsOverview` L119-133 | `scope` | Filters `scopedEntries`, `scopedUsers` → KPIs, insights, chart, table, cohort |
| Department dropdown | `AdminReportsOverview` L135-146 | `selectedDeptId` | Filters `scopedUsers` when scope=department |
| Range chips (This week / Last week / This month) | `AdminReportsOverview` L150-163 | `range` | KPIs, insights, chart, table |
| Breakdown chips (By status / By project) | `WeeklyChart` L105-120 | `breakdownMode` | Chart only |
| Project dropdown | `WeeklyChart` L122-137 | `projectFilter` | Chart only (status mode) |
| Department dropdown | `WeeklyChart` L139-154 | `departmentFilter` | Chart only (sub-filters entries) |

### Mismatches / issues

1. **Department dropdown in WeeklyChart is redundant** — scope already filters by department. When scope=Department, the chart's own department dropdown re-filters the already-scoped data, which is confusing. When scope=Org, it partially duplicates what the scope selector should do. The screenshot shows "Business..." dropdown next to "All projects" — this is the chart's department filter, and it's misleading.

2. **No "By department" breakdown mode** — user wants 3 breakdown modes: By status, By project, By department. Currently only 2 exist.

3. **Project dropdown shows in status mode only** — correct behavior, but when "By project" is selected, there's no project dropdown (it shows top 5 + Other). User wants: By project mode can optionally filter to a single project (showing status within that project).

4. **"My" label** — user wants "My dashboard" instead.

5. **No Today/Quarter/Year range options** — user mentioned these.

## 2. Implementation Plan

### Files to change (3)

| # | File | Change |
|---|---|---|
| 1 | `src/pages/AdminReportsOverview.tsx` | Rename "My" → "My dashboard". Add `today`, `this_quarter`, `this_year` range options. |
| 2 | `src/components/admin/WeeklyChart.tsx` | Add "By department" breakdown mode. Restructure dropdowns: By status → no dropdown. By project → project dropdown. By department → department dropdown. Remove the always-visible department dropdown. Add `deriveDailyDepartmentBreakdown` data path. |
| 3 | `src/data/reportsMockData.ts` | Add `deriveDepartmentBreakdown` and `deriveDailyDepartmentBreakdown` functions (analogous to project breakdown but grouped by department). |

### Detailed changes

**AdminReportsOverview.tsx:**
- Line 120-122: Change `My` label to `My dashboard`
- Lines 150-163: Expand range options to include `['today', 'Today'], ['this_quarter', 'This quarter'], ['this_year', 'This year']`
- Update `RangeOption` type and the `weekStart/days` computation to handle new ranges
- Pass `users` prop to WeeklyChart (already done)

**WeeklyChart.tsx:**
- Change `BreakdownMode` type to `'billable_status' | 'top_projects' | 'top_departments'`
- Add third "By department" chip button
- Restructure dropdown logic:
  - `billable_status` → no dropdown shown
  - `top_projects` → show project dropdown (All projects + list). When a specific project is selected, chart shows status breakdown within that project (reuse `deriveDailyBreakdown` with projectFilter)
  - `top_departments` → show department dropdown (All departments + list). When a specific department is selected, chart shows status breakdown within that department (filter entries to that dept, then use `deriveDailyBreakdown`)
- Remove the standalone department filter dropdown (lines 139-154)
- Add department breakdown chart rendering using new derive functions

**reportsMockData.ts:**
- Add `deriveDepartmentBreakdown(entries, weekStart, days, users)` → returns top 7 departments + Other (like `deriveProjectBreakdown` but grouped by user→department)
- Add `deriveDailyDepartmentBreakdown(entries, weekStart, days, deptItems, users)` → daily stacked data by department

### QA Checklist

1. "My dashboard" shows only current user's data in KPIs, chart, table (hidden), insights, cohort
2. "Department" shows only selected department — switching department dropdown updates everything
3. "Organisation" shows all users/entries
4. Chart "By status": no extra dropdowns, stacked Billable/Maybe/Not billable
5. Chart "By project": project dropdown visible. "All projects" → top 5 + Other. Single project → status breakdown within that project
6. Chart "By department": department dropdown visible. "All departments" → top 7 + Other. Single department → status breakdown within that department
7. No redundant/dead dropdowns visible
8. Today/Quarter/Year range options work correctly

