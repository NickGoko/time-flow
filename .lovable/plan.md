

# Combined Implementation Plan: Bricks 1, 2, and 3

---

## BRICK 1: Travel Exception + Daily 10h Cap

### Current State
- `MAX_DAILY_HOURS = 10` and `MAX_DAILY_MINUTES = 600` already exist in `src/types/index.ts`
- Daily cap is enforced in two places:
  - `TimeEntryForm.tsx` (single entry): lines 153-157 calculate `wouldExceedCap`
  - `DailyGridEntry.tsx` (multi entry): lines 177-186 check aggregate in `validateAndSave`
- "Travel" exists only as an activity type: `act-admin-travel` ("Travel/logistics") under phase "General administrative"
- There is also `act-es-transport` ("Transport") under "Entrepreneur support"

### Decision: Option B — Infer travel from activity type

Justification: Adding a `time_category` column (Option A) requires a DB migration, changes to the Supabase schema, RLS updates, and edge function changes — heavy for a UI-level validation rule. Instead, we tag specific activity type IDs as "travel-exempt" using a constant list. This is simpler, requires no schema changes, and can be expanded later.

### Schema Changes
None.

### Plan

1. **`src/types/index.ts`**: Add a `TRAVEL_EXEMPT_ACTIVITY_IDS` constant set containing `'act-admin-travel'` and `'act-es-transport'`. Add helper `isTravelExempt(activityTypeId?: string): boolean`.

2. **`src/components/TimeEntryForm.tsx`**: Import `isTravelExempt`. When checking `wouldExceedCap`, skip the check if the selected `activityTypeId` is travel-exempt. Update the error message to say: "Daily total cannot exceed 10h. Only Travel entries may exceed this limit."

3. **`src/components/DailyGridEntry.tsx`**: Import `isTravelExempt`. In `validateAndSave`, split rows into travel-exempt and non-travel. Only sum non-travel rows + existing non-travel entries for the cap check. Update the error message similarly.

4. **`src/contexts/TimeEntriesContext.tsx`**: Add `getDailyNonTravelMinutes(userId, date)` that filters out entries with travel-exempt activity IDs when summing. This requires checking `activityTypeId` and `workAreaActivityTypeId` on each entry.

### Files (4 files)

| # | File | Change |
|---|---|---|
| 1 | `src/types/index.ts` | Add `TRAVEL_EXEMPT_ACTIVITY_IDS` set + `isTravelExempt()` |
| 2 | `src/contexts/TimeEntriesContext.tsx` | Add `getDailyNonTravelMinutes()` |
| 3 | `src/components/TimeEntryForm.tsx` | Use travel-aware cap check |
| 4 | `src/components/DailyGridEntry.tsx` | Use travel-aware cap check in `validateAndSave` |

### Test Script
- Log 9h of regular work on a day. Try adding 2h more regular work -> FAIL with message mentioning Travel.
- Log 9h of regular work. Add 3h with activity "Travel/logistics" -> PASS (total 12h allowed).
- Grid mode: 3 rows (4h work + 4h work + 3h travel). Save all -> PASS.
- Grid mode: 3 rows (4h work + 4h work + 3h work = 11h non-travel) -> FAIL.

---

## BRICK 2: Leave/Absence + Public Holiday Auto-fill

### Current State
- Leave auto-fill already partially works in both `TimeEntryForm.tsx` and `DailyGridEntry.tsx`
- When `proj-leave` is selected, phase is set to `phase-absence`, hours to 8, billable to `not_billable`, deliverable to `other`
- But there's no distinction between "Leave day" vs "Public holiday" — both are activity types under `phase-absence`
- The activity type is NOT auto-set (left empty)
- No "Public Holiday" workstream — it's just an activity under Leave

### What's Needed
- When Leave is selected AND activity = "Leave day": defaults already work, just auto-select the activity
- When Leave is selected AND activity = "Public holiday": same defaults
- Currently the user must manually pick the activity type after selecting Leave — this should auto-default to "Leave day"

### Plan

1. **`src/data/seed.ts`** (or `src/types/index.ts`): Add constant `LEAVE_DAY_ACTIVITY_ID = 'act-leave-day'` and `PUBLIC_HOLIDAY_ACTIVITY_ID = 'act-public-holiday'`.

2. **`src/components/TimeEntryForm.tsx`**: When `LEAVE_PROJECT_ID` is selected, also auto-set `activityTypeId` to `LEAVE_DAY_ACTIVITY_ID`. Disable the activity dropdown for Leave (already done for phase). User can still switch to "Public holiday" if needed.

3. **`src/components/DailyGridEntry.tsx`**: Same auto-fill logic in `updateRow` when `projectId` changes to `LEAVE_PROJECT_ID`: set `activityTypeId = 'act-leave-day'`.

### Files (2 files — already touched by Brick 1)

| # | File | Change |
|---|---|---|
| 1 | `src/components/TimeEntryForm.tsx` | Auto-set activityTypeId to leave-day on Leave select |
| 2 | `src/components/DailyGridEntry.tsx` | Same auto-set in grid row |

### Test Script
- Select "Leave / Absence" workstream -> Phase auto-sets to "Absence", Activity auto-sets to "Leave day", Hours = 8, Minutes = 0, Billable = Not billable, Deliverable = Other
- User can change activity to "Public holiday" — all other defaults stay
- Grid mode: add a row, select Leave -> same auto-fill
- Save a Leave entry -> entry shows correctly with badge

---

## BRICK 3: UX Polish (Sentence Case, Labels, Grouping, Collapse)

### Current State
- "History & Insights" label: `src/pages/Index.tsx` line 28, `src/pages/EmployeeInsights.tsx` line 116
- "Row 1" label: `src/components/DailyGridEntry.tsx` line 299
- Entry list starts expanded: `src/components/WeeklyTimesheet.tsx` line 47 (`entriesExpanded: true`), reset on day change line 51
- Deliverable type + description are separate grid cells in `DailyGridEntry.tsx` lines 380-402
- Dropdown labels already use sentence case in most places

### Plan

| Change | File(s) | Detail |
|---|---|---|
| "History & Insights" -> "Dashboard" | `src/pages/Index.tsx`, `src/pages/EmployeeInsights.tsx` | Change link text + page title |
| "Row 1" -> "Entry 1" | `src/components/DailyGridEntry.tsx` | Line 299: `Row {index + 1}` -> `Entry {index + 1}` |
| Default collapsed entries | `src/components/WeeklyTimesheet.tsx` | Change `entriesExpanded` initial state to `false`, remove auto-expand on day change |
| Group deliverable fields | `src/components/DailyGridEntry.tsx` | Wrap deliverable type + description in a visual group (shared border/bg) |

### Files (4 files)

| # | File | Change |
|---|---|---|
| 1 | `src/pages/Index.tsx` | "History & Insights" -> "Dashboard" |
| 2 | `src/pages/EmployeeInsights.tsx` | Page title "History & Insights" -> "Dashboard" |
| 3 | `src/components/DailyGridEntry.tsx` | "Row" -> "Entry", group deliverable fields visually |
| 4 | `src/components/WeeklyTimesheet.tsx` | Default `entriesExpanded = false`, remove auto-expand effect |

---

## Combined File Count

Across all 3 bricks, unique files touched: **6**

| # | File | Bricks |
|---|---|---|
| 1 | `src/types/index.ts` | 1 |
| 2 | `src/contexts/TimeEntriesContext.tsx` | 1 |
| 3 | `src/components/TimeEntryForm.tsx` | 1, 2 |
| 4 | `src/components/DailyGridEntry.tsx` | 1, 2, 3 |
| 5 | `src/components/WeeklyTimesheet.tsx` | 3 |
| 6 | `src/pages/Index.tsx` | 3 |
| 7 | `src/pages/EmployeeInsights.tsx` | 3 |

Total: **7 files** (within all brick limits).

## Implementation Order
1. Brick 1 (types + context + form + grid cap logic)
2. Brick 2 (leave auto-fill in form + grid)
3. Brick 3 (label renames + collapse default + deliverable grouping)

