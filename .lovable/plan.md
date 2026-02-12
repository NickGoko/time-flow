

## Enrich Demo/Mock Data — Plan

### A) Current Seed Structure

| File | Contents |
|------|----------|
| `src/data/seed.ts` | 3 users, 7 projects, 9 phases, ~40 activity types, 7 time entries (current week only, Sarah only), empty `weekStatuses[]` |
| `src/data/reportsMockData.ts` | 8 synthetic `mockUserWeekSummaries` (not tied to real users), plus live derivation functions (`deriveMetrics`, `deriveTeamSummary`, etc.) |
| `src/contexts/UserContext.tsx` | Exposes `allUsers` from `seed.users` array |
| `src/types/index.ts` | `User` interface with `appRole`, `department`, `role` fields |

All report computations (`deriveMetrics`, `deriveTeamSummary`, `deriveOperationalInsights`) operate on the **real** `entries` array from `TimeEntriesContext`. The `mockUserWeekSummaries` are only used by the `CohortWidget`. So enriching `seed.ts` with more users and entries will automatically flow through to all reports.

### B) Files to Edit (3)

| # | File | Change |
|---|------|--------|
| 1 | `src/data/seed.ts` | Expand `users[]` to 15 users across 6 departments. Expand `timeEntries[]` to ~120-180 entries spanning 6 weeks. Add realistic `weekStatuses[]`. |
| 2 | `src/data/reportsMockData.ts` | Replace hardcoded `mockUserWeekSummaries` with a function that derives cohort data from real entries and users (so CohortWidget also shows real data). |
| 3 | `src/types/reports.ts` | No change needed — existing interfaces already support all fields. |

Total: **2 files**.

### C) Data Generation Strategy

#### Users (15 total)

| Department | Users | appRole |
|---|---|---|
| Consulting | Sarah Mitchell, James Chen, Amara Osei, David Mwangi | employee |
| Operations | Emily Thompson, Fatima Al-Hassan | admin |
| Business Development | Liam O'Brien, Priya Sharma, Grace Kimani | employee |
| Finance | Raj Patel, Nneka Chukwu | employee |
| IT | Tom Baker | admin |
| HR | Sofia Martinez, Aisha Banda | employee |

#### Time Entries (~150 entries, 6 weeks)

Generation approach — a deterministic helper function inside `seed.ts` that loops over users and weeks:

- **Week range**: current week minus 5 through current week (6 weeks total)
- **Per user per week**: 3-8 entries across Mon-Fri, targeting 30-42 hours total (with variance)
- **Distribution patterns**:
  - Consulting users: heavy on Flagship, CEIC, RISA (billable)
  - BD users: heavy on Orange Corners, Disrupt_for_Her
  - Admin/Ops users: mix of all projects + more admin time
  - Finance/HR: more admin/reporting + Leave entries
- **Billable mix**: ~65% billable, ~15% maybe_billable, ~20% not_billable (varies by user)
- **Incomplete weeks**: 2-3 users will have 1-2 weeks with only 20-30 hours (realistic gaps)
- **Backdated entries**: ~8-10 entries will have `createdAt` set 3+ days after `date` to trigger the "Data quality" insight
- **15-minute increments**: some entries use 15/30/45 minute values, not just whole hours
- **Leave entries**: 2-3 users take 1-2 leave days across the 6 weeks

#### Week Statuses

- For past weeks (not current): ~60% of users have submitted status
- Current week: no one submitted yet
- This creates realistic "Weeks not submitted" counts

#### Cohort Data

Replace the 8 hardcoded `mockUserWeekSummaries` with a `deriveCohortSummaries(entries, users, weekStart)` function that computes real per-user totals vs expected hours, so the CohortWidget reflects actual seed data.

### D) Deterministic vs Random

All data will be **deterministic** (seeded by user index + week offset, no `Math.random()`). This ensures consistent UI across refreshes while still looking varied. The helper will use a simple pattern:

```text
for each user (index u):
  for each week (offset w from -5 to 0):
    pick 2-4 projects based on (u % projectCount)
    distribute 5-8 entries across weekdays
    vary hours using pattern: base + ((u * 7 + w * 3) % 4) - 1
    assign billable status based on project default + user variance
```

### E) Test Steps

1. Navigate to `/admin/reports/overview` as Emily (admin)
2. Verify **MetricCards** show totals across all 15 users (not just 3)
3. Verify **Active Users** count is > 10
4. Verify **Maybe billable** insight shows non-zero count
5. Verify **Data quality** insight shows backdated entries
6. Verify **Weeks not submitted** shows a realistic count (not 15/15)
7. Switch to "Last week" — numbers change, all cards still populated
8. Switch to "This month" — higher totals across the month
9. Check **Team Summary Table** — 15 rows with varied compliance %, billable %, and some submitted weeks
10. Check **WeeklyChart** — stacked bars show meaningful distribution across days
11. Toggle chart to "Top projects" — multiple project bars visible
12. Check **CohortWidget** — buckets reflect real user distributions
13. Switch to Sarah (employee) — employee view shows Sarah's entries only
14. Switch back to Emily — admin reports unchanged (global view)

