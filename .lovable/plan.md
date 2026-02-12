

## Sprint 1: Functional Integrity and Bug Fix

### A) Files to Touch (4)

1. `src/types/index.ts`
2. `src/components/WeeklyTimesheet.tsx`
3. `src/components/TimeEntryForm.tsx`
4. `src/components/DailyGridEntry.tsx`

---

### B) Current State Analysis

**Submission/locking**: Partially implemented. `isWeekSubmitted()` already drives:
- Hiding entry mode tabs and "Add entry" button
- Hiding delete icons on entry cards
- Showing "Week locked" badge in week header
- DailyGridEntry already shows a locked message

**Daily cap**: Already enforced in both TimeEntryForm (lines 131-134) and DailyGridEntry (lines 122-131). Grid aggregates all non-empty rows before save. Both block saves exceeding 600 minutes.

**Date constraints**: Not implemented anywhere. Calendar allows any date. Week navigation has no bounds.

**Duplication bug**: Entry cards show `entry.project.code` and `entry.project.name` side-by-side (lines 319-322 of WeeklyTimesheet). For projects where code matches name (CEIC/CEIC, RISA/RISA), this reads as "CEIC CEIC" -- a visual duplication.

---

### C) Step-by-Step Plan

#### 1. Add date constraint constant (`src/types/index.ts`)

Add `MAX_PAST_DAYS = 14` constant. This centralizes the 14-day lookback window.

#### 2. Date constraints on day selection and week navigation (`src/components/WeeklyTimesheet.tsx`)

- Import `MAX_PAST_DAYS` and compute `earliestAllowableDate` (today minus 14 days) and `today`.
- **Day columns**: Disable (visually grey out + non-clickable) any day column where `date > today` or `date < earliestAllowableDate`. If the currently selected day becomes invalid after week navigation, auto-select the nearest valid day.
- **Week navigation**: Disable the "next week" arrow if the entire week (Mon-Sun) would be in the future. Disable the "previous week" arrow if the entire week would be before the 14-day window.
- **Submitted week lock message**: Replace the simple "This week is locked" text with a more prominent banner: "Week submitted -- entries locked" using an alert-style container with the Lock icon.

#### 3. Date constraints on calendar picker (`src/components/TimeEntryForm.tsx`)

- Pass `disabled` prop to the `Calendar` component:
  - `before: earliestAllowableDate` (today - 14 days)
  - `after: today`
- This uses react-day-picker's built-in date disabling -- greyed out, non-selectable.

#### 4. Grid date validation (`src/components/DailyGridEntry.tsx`)

- Add a safety check in `validateAndSave`: if `selectedDate` is outside the allowed range, show a global error and block save. This is a fallback since the day selector already constrains selection.

#### 5. Fix entry card duplication (`src/components/WeeklyTimesheet.tsx`)

- Change the entry card header to show project code only when it differs from the project name (case-insensitive). When they match, display only the name. This fixes CEIC/CEIC, RISA/RISA while preserving useful distinctions like "D4H / Disrupt_for_Her".

---

### D) Risks and Edge Cases

| Risk | Mitigation |
|------|-----------|
| **Timezone / DST**: "today" calculated at midnight could shift across DST boundaries | All date logic uses local-time helpers (`toLocalDateString`, `parseLocalDate`) per project convention -- no UTC methods |
| **Selected day becomes invalid after week nav**: User navigates to a week partially outside the 14-day window | Auto-select the nearest valid day in that week; if no valid day exists, the week arrow is already disabled |
| **Grid save on locked week**: DailyGridEntry already shows locked UI, but a race condition could occur if week is submitted in another tab | The `disabled` prop is already passed from WeeklyTimesheet; adding the date-range safety check reinforces this |
| **Seed data outside window**: Sample entries are for "current week" so they remain valid | No issue expected |

---

### E) Test Script (15 Steps)

1. **Load app** -- verify current week displays with entries visible.
2. **Navigate to next week** -- if entirely in the future, the forward arrow should be disabled.
3. **Navigate forward anyway (if partially future)** -- future days (after today) should appear greyed out and non-clickable.
4. **Click a future day** -- nothing should happen (day stays unselected).
5. **Navigate back 3 weeks** -- the back arrow should be disabled once the entire week falls before the 14-day window.
6. **On a partially-valid old week** -- days older than 14 days should be greyed out.
7. **Open "Add entry" modal** -- open the date picker calendar. Verify tomorrow and dates beyond are greyed/unselectable. Verify dates older than 14 days are greyed/unselectable.
8. **Try to pick tomorrow in the calendar** -- the date should not be selectable.
9. **Try to pick a date 3 weeks ago** -- the date should not be selectable.
10. **Add an entry for today totalling 9h** -- should succeed (under 10h cap).
11. **Try adding another 2h entry for the same day** -- should be blocked with a cap error message (9+2 = 11 > 10).
12. **Switch to Multiple entries mode** -- add two rows totalling 11h for the same day. Click "Save all" -- should be blocked with a cap error.
13. **Submit the current week** -- click "Submit week", confirm the "Week submitted -- entries locked" banner appears.
14. **Verify lock state** -- "Add entry" button gone, entry mode tabs gone, delete icons gone, grid entry disabled. All entry cards visible but read-only.
15. **Check entry cards** -- verify project name appears once per card (no "CEIC CEIC" or "RISA RISA" duplication). Projects like Disrupt_for_Her should still show "D4H" code alongside the name.

