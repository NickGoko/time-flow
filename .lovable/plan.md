

# Plan: Tri-state Legend + Form Label Harmonisation

## A) Files to change (5 total)

| # | File | What changes |
|---|---|---|
| 1 | `src/types/index.ts` | Add `maybeBillableMinutes` to `WeekSummary` |
| 2 | `src/contexts/TimeEntriesContext.tsx` | Compute `maybeBillableMinutes` in `getWeekSummary` |
| 3 | `src/components/WeeklyTimesheet.tsx` | Add "Maybe billable" legend item (lines 260-273); rename form labels in entry card display |
| 4 | `src/components/TimeEntryForm.tsx` | Rename labels: "Workstream" → "Category", "Phase"/"Work area" → "Project", "Activity type" → "Activity/task", "Deliverable type" → "Deliverable type" (keep), "Deliverable description" → "Deliverable description" (keep) |
| 5 | `src/components/DailyGridEntry.tsx` | Same label renames in grid placeholders |

## B) Data source for weekly totals + billable split

- `getWeekSummary()` in `TimeEntriesContext.tsx` (lines ~110-145) computes `totalMinutes`, `billableMinutes`, `notBillableMinutes`. It does NOT compute `maybeBillableMinutes` — entries with `maybe_billable` status are currently unaccounted (they fall into neither billable nor notBillable).
- Fix: add `maybeBillableMinutes` filter in `getWeekSummary`, add field to `WeekSummary` interface.

## C) UI change points for legend

**Weekly legend** (WeeklyTimesheet.tsx lines 260-273): Currently two items with dot + label. Add third item between them:
```
Billable: Xh  ·  Maybe billable: Yh  ·  Not billable: Zh
```
- Billable dot: `bg-billable` (existing)
- Maybe billable dot: `bg-warning` (matches existing `maybe_billable` color in `getBillableColor`)
- Not billable dot: `bg-not-billable` (existing, but currently labeled "Non-billable" — rename to "Not billable" for consistency with enum)

**Billable rate card** (PersonalDashboard.tsx): No change requested, stays as-is.

## D) Label mapping for form fields

| Current label | New label | Files |
|---|---|---|
| `Workstream *` | `Category *` | TimeEntryForm L274, DailyGridEntry L333 placeholder |
| `Phase *` / `Work area *` (dynamic via `phaseLabel`) | `Project *` | TimeEntryForm L305, DailyGridEntry L364 placeholder |
| `Activity type *` | `Activity/task *` | TimeEntryForm L322, DailyGridEntry L379 placeholder |
| `Task description *` | `Task description *` | No change needed |
| `Deliverable type *` | `Deliverable type *` | No change needed |
| `Deliverable description (optional)` | `Deliverable description` | Remove "(optional)" text, keep field optional |

In DailyGridEntry, placeholders serve as labels. The `phaseLabel` variable (line 308) that switches between "Work area" and "Phase" will be replaced with a constant `"Project"`.

## E) Test checklist

1. **Tri-state legend**: Create entries with all three billable statuses in one week. Verify legend shows three items and X + Y + Z = total.
2. **All-billable week**: Maybe = 0h, Not billable = 0h displayed.
3. **Label check (single entry)**: Open "Add entry" dialog — verify labels read "Category", "Project", "Activity/task", "Task description", "Deliverable type", "Deliverable description".
4. **Label check (grid)**: Switch to "Multiple entries" — verify same harmonised labels in placeholders.
5. **Department switch**: Switch users — verify dropdown contents unchanged, only labels differ.
6. **Submit flow**: Save an entry in both modes — no regressions.

