

## Enhance Data Quality Panel — Plan

### Current State Assessment

After reviewing all files, **most requested features are already implemented**:

| Requirement | Status |
|---|---|
| Project filter defaults to "All projects" | Already done (WeeklyChart line 43) |
| Population defaults to "All users" | Already done (no user filter, shows all) |
| Time range controls (This week / Last week / This month) | Already done (AdminReportsOverview lines 48-61) |
| Chart breakdown toggle (Billable status / Top projects) | Already done (WeeklyChart lines 42, 91-106) |
| Team summary table with all 6 columns | Already done (TeamSummaryTable.tsx) |
| Operational insights (maybe billable + backdated entries) | Partially done — needs 2 more metrics |

### What Actually Needs to Change

Expand the operational insights from **2 cards** (maybe billable, backdated entries) to **4 cards** adding:

- **Weeks not submitted**: derived from `weekStatuses` — count users without a submitted status for the current `weekStart`
- **Blocked by 10h cap**: not currently tracked in the data model. Show `0` with a "Preview" note, since the front-end form silently prevents over-cap entries rather than logging rejections

### Files to Edit (3)

| # | File | Change |
|---|------|--------|
| 1 | `src/types/reports.ts` | Add `weeksNotSubmitted` and `blockedByCap` fields to `OperationalInsights` |
| 2 | `src/data/reportsMockData.ts` | Update `deriveOperationalInsights` to compute weeks-not-submitted from `weekStatuses` and `allUsers`; set `blockedByCap` to 0 |
| 3 | `src/pages/AdminReportsOverview.tsx` | Expand the insights grid from 2 to 4 cards; pass `allUsers` and `weekStatuses` to the insights function |

### Step-by-Step

#### 1. `src/types/reports.ts`

Add two fields to `OperationalInsights`:

```text
weeksNotSubmitted: number   // users who haven't submitted for the period
blockedByCap: number        // attempts blocked by 10h daily cap (0 in Preview)
```

#### 2. `src/data/reportsMockData.ts`

Update `deriveOperationalInsights` signature to accept `allUsers` and `weekStatuses`. Compute:

- `weeksNotSubmitted`: count of users in `allUsers` who do NOT have a matching submitted `WeekStatus` for the given `weekStart`
- `blockedByCap`: hardcoded to `0` (the form prevents over-cap entries client-side without logging)

#### 3. `src/pages/AdminReportsOverview.tsx`

- Import `useCurrentUser` to access `allUsers`
- Access `weekStatuses` from `useTimeEntries()`
- Pass them to `deriveOperationalInsights`
- Change the insights grid from `grid-cols-1 sm:grid-cols-2` to `grid-cols-2 sm:grid-cols-4`
- Add two new cards:
  - **Weeks not submitted**: count + "users" label, with `Clock` icon
  - **Blocked by cap**: "0" + "Preview" badge in muted text, with `ShieldAlert` icon

### Risks / Edge Cases

- **No entries**: All metrics show 0 — acceptable for Preview
- **Month range**: `weeksNotSubmitted` only checks the first `weekStart` of the range, not every week in a month. Acceptable for V0; note in code
- **Timezone**: All date logic uses local time per project convention
- **blockedByCap**: Cannot be computed from current data. Showing "0 (Preview)" is honest and avoids inventing fake tracking

### Test Steps

1. Navigate to `/admin/reports/overview` as Admin
2. Verify 4 metric cards render at top (Total Hours, Billable %, Non-billable, Active Users) — unchanged
3. Verify 4 operational insight cards render (Maybe billable, Data quality, Weeks not submitted, Blocked by cap)
4. "Maybe billable" card shows count and hours from seed data
5. "Data quality" card shows backdated entry count or "No flags"
6. "Weeks not submitted" card shows count of users without submitted weeks
7. "Blocked by cap" card shows "0" with a "Preview" note
8. Toggle date range to "Last week" — all 4 insight cards update
9. Toggle date range to "This month" — insights update
10. Chart breakdown toggle still works (By status / By project)
11. Team summary table still renders all users with correct columns
12. Switch to Employee mode — page is blocked by AdminGuard

