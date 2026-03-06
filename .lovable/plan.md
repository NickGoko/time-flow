

# Plan: Personal Dashboard — Time Range Controls, Shared Aggregation, and Breakdown Tables

## 1. Audit — Current State

### File map

| File | Role |
|---|---|
| `src/pages/EmployeeInsights.tsx` | Page component at `/me/insights`. 4 sections: Today card, This Week card (with top projects table), 6-Week Trend chart, Recent History table |
| `src/components/PersonalDashboard.tsx` | Small 4-card grid on the Index page (not the Dashboard page) |
| `src/hooks/useDashboardDataset.ts` | Shared hook used by AdminReportsOverview. Has `RangeOption` type and `getExpectedMinutes()` |
| `src/contexts/TimeEntriesContext.tsx` | Provides `getOwnEntries()`, `getWeekSummary()`, `getWeeklyTotals()`, `getRecentDays()` |
| `src/data/seed.ts` | `getProjectById()`, `getPhaseById()`, `getActivityTypeById()`, `getEntryWithDetails()` |

### Current date computation

- **Today**: hardcoded `new Date()` → `toLocalDateString(today)` → filters `ownEntries` by date string
- **This Week**: `getWeekStart(today)` → `getWeekSummary(userId, weekStart)` which internally filters entries for 7 days
- **Trend**: `getWeeklyTotals(userId, 6)` — last 6 weeks, hardcoded
- **History**: `getRecentDays(userId, 28)` — last 28 days, hardcoded

### Shared helpers available

`useDashboardDataset` already has `RangeOption` type (`today | this_week | last_week | this_month | this_quarter | this_year`) and date window computation. Can reuse `RangeOption` type and the date window logic. However, the hook itself is admin-oriented (scoped users, departments). For the personal dashboard, we just need the date window computation — we can import and reuse `RangeOption` and the date range math.

### Entry structure

`TimeEntry` has: `projectId`, `phaseId`, `activityTypeId`, `workAreaId`, `workAreaActivityTypeId`, `billableStatus`, `hours`, `minutes`, `date`.

Resolvers exist: `getProjectById()`, `getPhaseById()`, `getActivityTypeById()`.

## 2. Implementation Plan

### Files to change (2)

| # | File | Change |
|---|---|---|
| 1 | `src/pages/EmployeeInsights.tsx` | Add range chips, recompute all sections from range-filtered entries, add Top Projects and Top Activities tables |
| 2 | `src/hooks/useDashboardDataset.ts` | Extract `getDateWindow(range)` as a standalone exported function (currently inline in the hook). Both pages reuse it. |

### Detailed changes

**`src/hooks/useDashboardDataset.ts`** — Extract date window logic

Export a pure function:
```typescript
export function getDateWindow(range: RangeOption): { weekStart: string; days: number; rangeStartDate: Date; rangeEndDate: Date }
```

This is the same logic currently on lines 52-95, extracted so `EmployeeInsights` can call it without using the full hook. The hook itself calls `getDateWindow(range)` internally (no behavior change).

**`src/pages/EmployeeInsights.tsx`** — Major rework

1. **Range state**: Add `const [range, setRange] = useState<RangeOption>('this_week')`. Render 6 chip buttons matching Reports Overview style.

2. **Filtered entries**: Use `getDateWindow(range)` to get `rangeStartDate`/`rangeEndDate`. Filter `ownEntries` to entries within that window:
   ```typescript
   const rangeEntries = useMemo(() => {
     const startStr = toLocalDateString(rangeStartDate);
     const endStr = toLocalDateString(rangeEndDate);
     return ownEntries.filter(e => e.date >= startStr && e.date <= endStr);
   }, [ownEntries, rangeStartDate, rangeEndDate]);
   ```

3. **Summary card** (replaces Today + This Week cards): Single summary card showing:
   - Total hours vs expected (using `getExpectedMinutes(range, days)`)
   - Progress bar
   - Tri-state breakdown: Billable / Maybe billable / Not billable
   - Reconciliation check in dev console: `console.assert(bill + maybe + notBill === total)`

4. **Top Projects table**: Top 5 projects by hours from `rangeEntries`, with "Other" row if >5. Columns: Project | Hours | %. Uses `getProjectById()` for names.

5. **Top Activities table**: Top 8 activities by hours from `rangeEntries`. Columns: Activity | Hours | %. Activity label logic:
   - External entry (`phaseId` set): `${getPhaseById(phaseId)?.name} → ${getActivityTypeById(activityTypeId)?.name}`
   - Internal entry (`workAreaId` set): `${getPhaseById(workAreaId)?.name} → ${getActivityTypeById(workAreaActivityTypeId)?.name ?? 'Other'}`
   - Fallback: "Uncategorised"

6. **Layout order**: Range chips → Summary card → Top Projects + Top Activities (side by side on desktop, stacked on mobile) → 6-Week Trend chart → Recent History table.

7. **Empty state**: If `rangeEntries.length === 0`, show "No entries for this period" message. Keep Trend and History visible below.

8. **Keep existing sections**: Trend chart and Recent History remain unchanged (they show fixed 6-week / 28-day windows regardless of range, which is useful context).

### QA checklist

1. Default "This week" shows same data as before
2. Switch to each range — summary numbers update, tables update
3. Billable + Maybe + Not billable = Total (check console for assertion)
4. Top Projects shows correct project names and percentages sum to ~100%
5. Top Activities shows correct labels for both external and internal entries
6. Empty range (e.g., future week) shows empty state message
7. Trend chart and History table remain unaffected by range selection

