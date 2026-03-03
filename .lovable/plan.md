

# Milestone 2.2: Autofill Identity on Every Time Entry

## Assessment

This milestone is **already implemented**. After reviewing all relevant files, every requirement is satisfied by existing code:

| Requirement | Status | Evidence |
|---|---|---|
| Create payloads use `currentUser.id` | Done | `addEntry` in `TimeEntriesContext.tsx:69-79` auto-injects `currentUser.id` — caller cannot pass `userId` |
| Update payloads cannot change owner | Done | `updateEntry` in `TimeEntriesContext.tsx:82` strips `userId` from updates via destructuring |
| No UI control to change owner | Done | Neither `TimeEntryForm` nor `DailyGridEntry` render an owner selector |
| Single entry form uses session identity | Done | `TimeEntryForm.tsx:62` gets `currentUser` from `useAuthenticatedUser()`, passes to `addEntry` |
| Grid "Save all" uses session identity | Done | `DailyGridEntry.tsx:73` gets `currentUser` from `useAuthenticatedUser()`, all rows go through `addEntry` |
| Switching users shows correct entries | Done | `WeeklyTimesheet` passes `currentUser.id` to `getDailyTotals`, `getWeekSummary`, `isWeekSubmitted` — React re-renders on context change |

## What exists

- **`addEntry`** signature is `Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId'>` — `userId` is not accepted from callers
- **`updateEntry`** destructures out `userId` before applying updates
- **`assertOwnership`** blocks mutations targeting other users
- **`getOwnEntries`** filters by `currentUser.id`
- **User switcher** (Brick 1) changes `currentUser` in context, which triggers re-renders in all consuming components

## Recommendation

No code changes needed. Zero files to modify. This can be marked complete.

## Verification Steps

1. Open app, select User A via switcher
2. Add a time entry — confirm it appears under User A's day
3. Switch to User B — confirm User A's entry is not visible
4. Add entry as User B — confirm it appears
5. Switch back to User A — confirm only User A's entry shows, not User B's

