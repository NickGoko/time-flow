

## Calendar/Date Fix Plan

### Root Cause

The off-by-one bug is caused by mixing **local timezone** date methods with **UTC** output throughout the codebase.

Specifically:
- `getWeekStart()` in `seed.ts` uses local methods (`getDay()`, `setDate()`, `setHours(0,0,0,0)`) but then calls `toISOString().split('T')[0]` which converts to **UTC** — shifting the date backwards by one day for anyone in a positive UTC offset (e.g. UTC+2 in South Africa: local midnight = 22:00 previous day in UTC).
- `getWeekDate()` does `new Date("2025-02-10")` which JS parses as **UTC midnight**, then `getDate()` returns the **local** day number (potentially the 9th), creating inconsistency.
- `isToday()` in WeeklyTimesheet uses `toISOString()` — same UTC bug.
- `new Date(selectedDate)` in TimeEntryForm and DailyGridEntry parses as UTC midnight, displaying the wrong day in positive-offset timezones.

### Files to Edit (4 files)

| File | Change |
|------|--------|
| `src/data/seed.ts` | Fix `getWeekStart` and `getWeekDate` to use local-safe date formatting. Add a `toLocalDateString` helper. |
| `src/components/WeeklyTimesheet.tsx` | Fix `isToday` to use local date comparison. Fix date display parsing. |
| `src/components/TimeEntryForm.tsx` | Fix `new Date(selectedDate)` initialisation to parse as local date (not UTC). |
| `src/components/DailyGridEntry.tsx` | Fix `new Date(selectedDate)` in the formatted date display. |

### Implementation Steps

1. **Add `toLocalDateString` helper** in `seed.ts` that formats a Date as `YYYY-MM-DD` using `getFullYear()`/`getMonth()`/`getDate()` (local methods, no UTC conversion).

2. **Add `parseLocalDate` helper** in `seed.ts` that takes a `YYYY-MM-DD` string and returns a Date at local midnight (by splitting on `-` and using `new Date(year, month-1, day)` instead of `new Date(str)` which parses as UTC).

3. **Fix `getWeekStart`**: replace `d.toISOString().split('T')[0]` with the new `toLocalDateString(d)`.

4. **Fix `getWeekDate`**: use `parseLocalDate(weekStart)` then `toLocalDateString(d)` for the output.

5. **Fix `isToday` in WeeklyTimesheet**: compare against `toLocalDateString(new Date())` instead of `new Date().toISOString().split('T')[0]`.

6. **Fix all `new Date(dateString)` display calls**: in TimeEntryForm (line 61) and DailyGridEntry (line 71), use `parseLocalDate(selectedDate)` so the Date object represents the correct local day.

7. **Monday-first calendar**: The Calendar component in TimeEntryForm already uses `react-day-picker`. Add `weekStartsOn={1}` (Monday) to the Calendar props. The week strip in WeeklyTimesheet already renders Mon-Sun via the `DAY_NAMES` array and `getWeekStart` (Monday), so no change needed there once the date bug is fixed.

### Risks / Edge Cases

- **DST transitions**: Using local midnight and local date methods avoids DST issues since we never rely on UTC conversion.
- **Locale differences**: `toLocaleDateString('en-GB', ...)` is used only for display; internal state always uses `YYYY-MM-DD` strings from our own formatter.
- **Existing seed data**: Seed entries use `getWeekDate(currentWeekStart, offset)` which will self-correct once the helpers are fixed.
- **Back-dating**: Already works via week navigation arrows and the date picker in the single-entry modal. No edit-window restrictions exist in V1, so no changes needed.

### Test Script

1. Open the app and note today's date in your system clock.
2. In the week strip, confirm the highlighted "today" column shows the correct weekday and date number.
3. Click on Wednesday in the week strip. Confirm the day detail header says "Wednesday, [correct date]".
4. Click on Tuesday. Confirm it says "Tuesday" (not Wednesday — the original bug).
5. Click on Monday. Confirm it shows the correct Monday date.
6. Click on Saturday and Sunday. Confirm they display correctly.
7. Open the single-entry modal ("Log time"). Confirm the date picker defaults to the selected day and the calendar starts weeks on Monday.
8. Switch to "Grid view". Confirm the sticky date badge shows the correct selected date.
9. Navigate to the previous week using the left arrow. Confirm the week range label and all 7 day columns update correctly.
10. Navigate forward past the current week. Confirm future dates display correctly.
11. Select a day in a previous week. Open "Log time" and confirm the date picker defaults to that past date. Save an entry and confirm it appears under the correct day.
12. Check the weekly progress bar updates after adding a back-dated entry.
13. Submit a week and confirm the lock message appears. Navigate away and back to confirm it persists.
14. Open browser DevTools, change your system timezone to UTC+12 (or use a timezone override). Reload the page and repeat steps 2-6 to confirm no off-by-one errors.

