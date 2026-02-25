

## Brick C3: Enforce Entry Ownership

### Current State

- `addEntry` accepts a full `userId` field from callers -- both `TimeEntryForm.tsx` and `DailyGridEntry.tsx` pass `currentUser.id` explicitly
- `updateEntry` accepts `Partial<TimeEntry>` which technically allows overwriting `userId`
- `assertOwnership` exists but only logs a console error and returns false -- it does not throw
- RLS on `time_entries` already enforces `auth.uid() = user_id` for INSERT/UPDATE/DELETE (ready for Brick 5)
- Employee reads are filtered by `getOwnEntries()` which filters by `currentUser.id` in memory

### Changes (3 files)

**1. `src/contexts/TimeEntriesContext.tsx`**

- Change `addEntry` signature from `Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>` to `Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId'>` -- callers can no longer pass a userId
- Inside `addEntry`, auto-inject `userId: currentUser!.id` 
- In `updateEntry`, strip `userId` from the updates object so entries cannot be reassigned: `const { userId: _strip, ...safeUpdates } = updates`
- In `deleteEntry`, keep the existing ownership check (already correct)

**2. `src/components/TimeEntryForm.tsx`**

- Remove `userId: currentUser.id` from the `addEntry({...})` call (line ~181). The context now injects it automatically.

**3. `src/components/DailyGridEntry.tsx`**

- Remove `userId: currentUser.id` from the `addEntry({...})` call (line ~198). Same reason.

### What Does NOT Change

- UI layout, styling, or component structure
- `WeeklyTimesheet.tsx`, `PersonalDashboard.tsx`, `EmployeeInsights.tsx` -- these only read data, they don't pass userId to mutations
- RLS policies -- already correct
- Types in `src/types/index.ts` -- `TimeEntry` type stays the same; only the context method signature narrows

### Edge Cases

- If `currentUser` is null when `addEntry` is called, the function returns early (already inside SessionGate, so this shouldn't happen)
- `updateEntry` strips userId silently -- no error, just prevents the field from being overwritten

### Test Steps

1. Sign in as an employee
2. Create a time entry via the single-entry form -- verify it appears under your name
3. Create entries via the grid (multiple entries) -- verify all appear under your name
4. Check the database: `SELECT user_id FROM time_entries ORDER BY created_at DESC LIMIT 5` -- all should match the session user's UUID
5. Sign out, sign in as a different user -- verify you see only your own entries, not the previous user's
6. (After Brick 5 wires to DB) Verify RLS blocks cross-user access at the query layer

