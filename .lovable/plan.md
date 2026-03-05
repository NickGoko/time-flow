

# Plan: Operational "Data Quality" Panel — Blocked-by-Cap Event Logging

## Current state

The 4 operational insight cards already exist in `AdminReportsOverview.tsx`:
1. **Maybe billable** — works (derived from entries)
2. **Data quality / backdated** — works (derived from entries)
3. **Weeks not submitted** — works (derived from week statuses)
4. **Blocked by cap** — hardcoded to `0` (no event source)

Cap validation exists client-side in `TimeEntryForm.tsx` (line 181) and `DailyGridEntry.tsx` (line 188), but blocked attempts are never recorded.

## What needs to happen

1. Create a `validation_events` table in the database for production use
2. Add in-memory cap-block event logging to `TimeEntriesContext` (for demo mode, which is currently active)
3. Log a cap-block event when the 10h validation fires in both entry forms
4. Wire the count into the existing "Blocked by cap" card, filtered by scope + range

## Files to change (5)

| # | File | Change |
|---|---|---|
| 1 | `supabase/migrations/<new>.sql` | Create `validation_events` table with RLS |
| 2 | `src/contexts/TimeEntriesContext.tsx` | Add `validationEvents` state, `logCapBlock(userId, date)` function, expose both |
| 3 | `src/components/TimeEntryForm.tsx` | Call `logCapBlock` when `wouldExceedCap` triggers on submit |
| 4 | `src/components/DailyGridEntry.tsx` | Call `logCapBlock` when cap check fails on save |
| 5 | `src/pages/AdminReportsOverview.tsx` | Compute `blockedByCap` from `validationEvents` filtered by scope + range; replace hardcoded `0` |

## Database table

```sql
CREATE TABLE public.validation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL DEFAULT 'cap_blocked',
  user_id uuid NOT NULL,
  entry_date date NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.validation_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "Users can insert own validation_events"
  ON public.validation_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins + department scoped users can read
CREATE POLICY "validation_events_select"
  ON public.validation_events FOR SELECT
  USING (
    user_id = auth.uid()
    OR has_permission(auth.uid(), 'time:read_all')
    OR (has_permission(auth.uid(), 'time:read_department')
        AND is_department_scoped(auth.uid(), (SELECT department_id FROM profiles WHERE id = validation_events.user_id)))
  );
```

## In-memory logging (demo mode)

```typescript
// In TimeEntriesContext
interface ValidationEvent {
  id: string;
  eventType: string;
  userId: string;
  entryDate: string;
  createdAt: string;
}

const [validationEvents, setValidationEvents] = useState<ValidationEvent[]>([]);

const logCapBlock = useCallback((userId: string, entryDate: string) => {
  setValidationEvents(prev => [...prev, {
    id: `ve-${Date.now()}`,
    eventType: 'cap_blocked',
    userId,
    entryDate,
    createdAt: new Date().toISOString(),
  }]);
}, []);
```

## Wiring in entry forms

In `TimeEntryForm.tsx` handleSubmit, when `wouldExceedCap` is true, call `logCapBlock(currentUser.id, dateStr)` before returning.

In `DailyGridEntry.tsx` handleSave, when cap check fails, call `logCapBlock(currentUser.id, selectedDate)`.

## Wiring in AdminReportsOverview

Compute `blockedByCap` from `validationEvents` filtered by scoped user IDs and date range, replacing the hardcoded `insights.blockedByCap`. Remove the "Preview" badge from that card.

## Acceptance criteria

1. All 4 insight cards update when switching scope and time range
2. "Blocked by cap" increments when you attempt to save an entry that exceeds 10h
3. The count resets to 0 for scopes/ranges with no cap-block events
4. `validation_events` table exists in the database with correct RLS for production use

