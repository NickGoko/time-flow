

## Brick 1: Reference Data Schema + Read from Database

### A) Current State Summary

- **Identity**: Demo user picker stored in `localStorage`. No Supabase Auth.
- **Data**: All data is in-memory (seeded from `src/data/seed.ts`) + `localStorage` persistence for reference data. Zero Supabase tables exist. The `types.ts` confirms an empty schema.
- **Supabase client**: Already exists at `src/integrations/supabase/client.ts` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Ready to use.
- **Admin gating**: Client-side only (`AdminGuard` checks `currentUser.appRole`).

### B) Recommended First Dataset: Reference Data (not time_entries)

`time_entries` and `users` both require `auth.uid()` for secure RLS. Since auth is not wired yet, starting with either would require temporary workarounds or no security.

**Reference data tables** (departments, phases, activity_types, projects, etc.) are the safest first target:
- No user-ownership semantics -- they are shared lookup tables
- Simple RLS: anon/authenticated can SELECT; writes stay client-side for now
- Already have full CRUD in `ReferenceDataContext` -- easy to swap reads

### C) Required Supabase Tables (first migration)

| Table | Columns |
|---|---|
| `departments` | `id text PK`, `name text`, `is_active bool default true` |
| `projects` | `id text PK`, `name text`, `code text`, `is_active bool`, `default_billable_status text`, `type text`, `owning_department_id text FK` |
| `project_department_access` | `workstream_id text FK`, `department_id text FK`, composite PK |
| `phases` | `id text PK`, `name text`, `is_active bool default true` |
| `activity_types` | `id text PK`, `name text`, `phase_id text FK`, `is_active bool default true` |
| `internal_work_areas` | `id text PK`, `name text`, `department_id text FK`, `phase_id text FK`, `is_active bool default true` |
| `deliverable_types` | `id text PK`, `name text`, `is_active bool default true` |

All tables use `text` PKs matching existing seed IDs (e.g. `dept-finance`, `phase-inception`). Migration includes seed `INSERT` statements.

RLS: Enable on all tables. Single policy per table: `SELECT` for `anon` and `authenticated`. No write policies yet (writes remain client-side via localStorage until auth is wired).

### D) Proposed File List (4 files, well under limit)

| # | File | Action | Purpose |
|---|---|---|---|
| 1 | `supabase/migrations/001_reference_tables.sql` | NEW (migration tool) | DDL + RLS + seed INSERTs for all 7 reference tables |
| 2 | `src/contexts/ReferenceDataContext.tsx` | EDIT | Replace `loadOrSeed()` init with Supabase `SELECT` queries. Keep `localStorage` writes as-is (fallback). Add loading state. |
| 3 | `src/types/index.ts` | NO CHANGE | Existing types match DB columns; no changes needed |
| 4 | `src/data/seed.ts` | NO CHANGE | Kept as fallback for offline/loading states |

### E) Step-by-Step Plan

**Step 1: Create migration (1 file)**
- Use the migration tool to create all 7 tables with seed data
- Enable RLS with read-only policies for `anon` role
- No write policies -- mutations stay client-side for now

**Step 2: Update ReferenceDataContext (1 file)**
- Add a `useEffect` that fetches each table from Supabase on mount
- On success, replace React state with DB data (overriding localStorage seed)
- On failure, fall back to existing `loadOrSeed()` behavior (graceful degradation)
- All existing CRUD callbacks remain unchanged (still write to localStorage)
- Add an `isLoading` flag to context (optional, for future use)

**What does NOT change:**
- `seed.ts` (retained as fallback)
- `types/index.ts` (types already match)
- `UserContext.tsx`, `TimeEntriesContext.tsx` (untouched)
- All UI components (they consume context, not Supabase directly)
- Routing, auth, admin guards

### F) Test Script

| # | Test | Expected |
|---|---|---|
| 1 | Run migration, check database tables | 7 tables exist with seed data |
| 2 | Load app, open DevTools Network tab | See Supabase REST calls to `departments`, `projects`, etc. |
| 3 | Verify reference data page shows all departments, phases, workstreams | Same data as before, now sourced from DB |
| 4 | Add a department via admin UI | Appears in UI (localStorage write). Does NOT appear in DB yet (expected). |
| 5 | Refresh page | DB data loads; manually-added department from localStorage may appear via fallback merge (acceptable for now) |
| 6 | Clear localStorage, refresh | App loads entirely from Supabase -- seed data visible, no errors |

### Risks / Notes

- **ID format**: Using `text` PKs preserves compatibility with all existing code that references IDs like `dept-finance`. Migration to UUIDs deferred to auth brick.
- **Write gap**: Writes go to localStorage, reads come from Supabase. This is intentional and temporary. The next brick (auth + write policies) will close this gap.
- **No auth dependency**: This brick works with the anon key. No sign-in changes needed.

