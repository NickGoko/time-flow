

# Plan: `time_entries_enriched` Supabase VIEW + Unified Dashboard Audit

## Part A — Audit findings

### Where Reports query time entries today
- **`AdminReportsOverview.tsx`** → calls `getAllEntries()` from `TimeEntriesContext`, then passes raw `TimeEntry[]` into helper functions in `reportsMockData.ts` (`deriveMetrics`, `deriveTeamSummary`, `deriveOperationalInsights`, etc.)
- **`EmployeeInsights.tsx`** → calls `getOwnEntries()`, `getWeekSummary()`, `getWeeklyTotals()`, `getRecentDays()` from `TimeEntriesContext`
- **`PersonalDashboard.tsx`** → calls `getWeekSummary()`
- **`reportsMockData.ts`** — all derive* functions take `TimeEntry[]` + `User[]` and do client-side filtering/grouping

### User identity source
- Demo mode: `UserContext` switcher (no Supabase auth)
- Authenticated mode: Supabase auth session → profile lookup

### Tables used for reports
`time_entries`, `profiles`, `departments`, `projects`, `phases`, `activity_types`, `internal_work_areas`, `deliverable_types`, `week_statuses`

### Current gap
All report logic does client-side joins. There is no single denormalized dataset. The PDF spec calls for a `time_entries_enriched` view so all dashboards filter/group from one consistent shape.

---

## Part B — Implementation plan: Create `time_entries_enriched` VIEW

### Approach
Create a Supabase VIEW via migration. This is feasible because all required tables are in the `public` schema and the VIEW inherits the RLS of the underlying `time_entries` table.

### Files to change: 1 (migration SQL only, no UI)

| # | File | What |
|---|---|---|
| 1 | `supabase/migrations/<new>.sql` | `CREATE VIEW time_entries_enriched` |

### VIEW definition

```sql
CREATE OR REPLACE VIEW public.time_entries_enriched AS
SELECT
  te.id              AS entry_id,
  te.date            AS entry_date,
  -- week_start: Monday of the entry's week
  (te.date - ((EXTRACT(ISODOW FROM te.date) - 1)::int) * INTERVAL '1 day')::date AS week_start_date,
  te.user_id,
  p.name             AS user_name,
  p.email            AS user_email,
  p.department_id    AS user_department_id,
  d.name             AS department_name,
  pr.type            AS category,
  te.project_id,
  pr.name            AS project_name,
  ph.name            AS phase_name,
  iwa.name           AS work_area_name,
  at_ext.name        AS activity_name,
  at_int.name        AS work_area_activity_name,
  dt.name            AS deliverable_type_name,
  te.billable_status,
  (te.hours * 60 + te.minutes) AS duration_minutes,
  COALESCE(ws.is_submitted, false) AS is_submitted,
  te.task_description,
  te.deliverable_description,
  te.comments,
  te.created_at,
  te.updated_at
FROM public.time_entries te
LEFT JOIN public.profiles p           ON p.id = te.user_id
LEFT JOIN public.departments d        ON d.id = p.department_id
LEFT JOIN public.projects pr          ON pr.id = te.project_id
LEFT JOIN public.phases ph            ON ph.id = te.phase_id
LEFT JOIN public.internal_work_areas iwa ON iwa.id = te.work_area_id
LEFT JOIN public.activity_types at_ext ON at_ext.id = te.activity_type_id
LEFT JOIN public.activity_types at_int ON at_int.id = te.work_area_activity_type_id
LEFT JOIN public.deliverable_types dt  ON dt.id = te.deliverable_type
LEFT JOIN public.week_statuses ws     ON ws.user_id = te.user_id
                                      AND ws.week_start_date = (te.date - ((EXTRACT(ISODOW FROM te.date) - 1)::int) * INTERVAL '1 day')::date;
```

All joins are LEFT JOIN so entries with null optional fields are never dropped.

### RLS consideration
Supabase views inherit RLS from underlying tables when queried via the API (the `time_entries` RLS policies apply). The view is read-only by nature.

### Acceptance tests
1. Query `SELECT count(*) FROM time_entries` and `SELECT count(*) FROM time_entries_enriched` for a date range — counts match.
2. Entries with null `phase_id`, `work_area_id`, `activity_type_id` still appear (LEFT JOIN).
3. `duration_minutes` = `hours * 60 + minutes` for every row.
4. `week_start_date` is always a Monday.
5. `is_submitted` correctly reflects `week_statuses` (false when no status row exists).

### What this unlocks (future prompts, not this one)
- Scope selector (My / Department / Org) — just `WHERE` clauses on `user_id` / `user_department_id`
- Breakdown toggles — just `GROUP BY` on `billable_status` / `project_name` / `department_name` / `user_name`
- Time range — just `WHERE entry_date BETWEEN x AND y`
- All dashboards read from this single dataset

