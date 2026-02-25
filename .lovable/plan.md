

## Supabase Auth + RLS Readiness Audit

---

### A) Current State Summary

**1. Current Identity Model**
- User is selected via a demo "sign-in" screen (`SignIn.tsx`) that lists all active users as clickable cards
- Selected user ID is stored in `localStorage` key `timetrack_current_user_id`
- `UserContext` loads the user on mount by matching that ID against the mutable `allUsersList` (also localStorage-persisted)
- `SessionGate` component redirects to `/sign-in` if `currentUser` is null
- `useAuthenticatedUser()` hook provides a non-null guarantee for protected routes
- **No real authentication exists** — any visitor can impersonate any user by picking a card or editing localStorage

**2. Current Data Sources**
- **Zero Supabase usage.** No Supabase client, no database tables, no edge functions
- All data lives in React state, seeded from `src/data/seed.ts` on first load, then persisted to localStorage:
  - Users: `timetrack_users`
  - Time entries: in-memory only (seeded each page load from `seed.ts`, no localStorage persistence)
  - Week statuses: in-memory only (same)
  - Reference data (7 keys): departments, projects, project-dept access, phases, activity types, work areas, deliverable types — all localStorage-persisted
- CRUD mutations update React state + localStorage; no server calls

**3. Current Admin Gating**
- Route-level: `AdminGuard` checks `isAdmin` (derived from `currentUser.appRole === 'admin'`) and renders a "Not authorised" message for non-admins
- Nav-level: `TopBar` shows admin links only when `isAdmin` is true
- Data-level: `getAllEntries()` logs a console warning for non-admin callers but still returns all data
- **No server-side enforcement exists** — all gating is purely client-side

---

### B) Inventory: Tables and Entities

**1. Tables That Already Exist / Are Being Used**
- None. There are zero Supabase tables. Everything is in-memory + localStorage.

**2. Tables Needed for Supabase Auth Migration**

| Table | Key Columns | Notes |
|---|---|---|
| `profiles` | `id (uuid PK, FK auth.users)`, `name`, `email`, `department_id (FK)`, `role (text)`, `weekly_expected_hours (int)`, `is_active (bool)`, `avatar_url` | Created by trigger on auth.users insert |
| `user_roles` | `id (uuid PK)`, `user_id (uuid FK auth.users, unique with role)`, `role (app_role enum: admin/employee)` | Separate table per security requirement. Security-definer `has_role()` function for RLS |
| `departments` | `id (uuid PK)`, `name`, `is_active` | |
| `projects` (workstreams) | `id (uuid PK)`, `name`, `code`, `is_active`, `default_billable_status`, `type (workstream_type enum)`, `owning_department_id (FK)` | |
| `project_department_access` | `project_id (FK)`, `department_id (FK)`, composite PK | |
| `phases` | `id (uuid PK)`, `name`, `is_active` | |
| `activity_types` | `id (uuid PK)`, `name`, `phase_id (FK)`, `is_active` | |
| `internal_work_areas` | `id (uuid PK)`, `name`, `department_id (FK)`, `phase_id (FK)`, `is_active` | |
| `deliverable_types` | `id (uuid PK)`, `name`, `is_active` | |
| `time_entries` | `id (uuid PK)`, `user_id (uuid FK auth.users, NOT NULL)`, `project_id (FK)`, `phase_id`, `activity_type_id`, `work_area_id`, `work_area_activity_type_id`, `support_department_id`, `task_description`, `deliverable_type`, `deliverable_description`, `date`, `hours`, `minutes`, `billable_status`, `comments`, `created_at`, `updated_at` | `user_id` must reference `auth.users(id)` for RLS |
| `week_statuses` | `user_id (uuid FK auth.users)`, `week_start_date (date)`, `is_submitted`, `submitted_at`, `is_locked`, `locked_at`, composite PK `(user_id, week_start_date)` | |

**Key Relations:**
- `profiles.id` and `user_roles.user_id` both FK to `auth.users(id) ON DELETE CASCADE`
- `time_entries.user_id` FK to `auth.users(id)` — RLS filters on `auth.uid()`
- `week_statuses.user_id` same pattern
- All reference data tables are admin-writable, all-authenticated-readable

---

### C) File Touch Map

**Auth / Session Wiring (5 files)**
- `src/lib/supabase.ts` — NEW: Supabase client init
- `src/contexts/UserContext.tsx` — Major rewrite: replace localStorage identity with Supabase Auth session, `onAuthStateChange`, profile fetch, role fetch
- `src/pages/SignIn.tsx` — Rewrite: email/password login form (keep demo switcher behind DEV flag)
- `src/components/UserSelector.tsx` — Update sign-out to call `supabase.auth.signOut()`
- `src/App.tsx` — Wrap with session listener; adjust `SessionGate` to use auth state

**Data Access Layer (3 files)**
- `src/contexts/ReferenceDataContext.tsx` — Replace localStorage with Supabase queries for all 7 entity types
- `src/contexts/TimeEntriesContext.tsx` — Replace in-memory arrays with Supabase queries; all mutations become inserts/updates/deletes against `time_entries` and `week_statuses`
- `src/data/seed.ts` — Retain as dev-only seed script or remove; no longer imported at runtime

**Entry Flows — Single + Grid (2 files)**
- `src/components/TimeEntryForm.tsx` — No structural change needed (already calls context methods), but must ensure `userId` comes from `auth.uid()` via context
- `src/components/DailyGridEntry.tsx` — Same: userId sourced from context

**Admin Pages (6 files)**
- `src/pages/AdminReportsOverview.tsx` — Uses `getAllEntries()` / `allUsers`; will read from Supabase via context
- `src/pages/admin/AdminReferenceData.tsx` — CRUD calls go through context (no direct change needed if context handles Supabase)
- `src/pages/admin/AdminUsers.tsx` — Admin user management; invite flow needs server-side user creation
- `src/pages/admin/AdminImportExport.tsx` — Export reads from context; no direct change
- `src/components/admin/UsersTable.tsx` — Wire to updated context
- `src/components/admin/ExportPanel.tsx` — Reads via context; no direct change

**Routing / Nav Guards (2 files)**
- `src/App.tsx` — `SessionGate` checks Supabase session; `AdminGuard` checks role via `has_role()` query or cached context
- `src/components/TopBar.tsx` — No change needed (reads `isAdmin` from context)

**Other (2 files)**
- `src/components/PersonalDashboard.tsx` — Reads from context; no change
- `src/pages/EmployeeInsights.tsx` — Reads from context; no change

---

### D) Minimal Brick Plan (6 Bricks)

**Brick 1: Supabase Schema — Reference Data Tables + Seed**
- Objective: Create all reference data tables (departments, projects, project_department_access, phases, activity_types, internal_work_areas, deliverable_types) with RLS (authenticated can SELECT; admin can INSERT/UPDATE via `has_role()`)
- Deliverables: 1 migration file with all DDL + RLS policies + seed INSERT statements
- File limit: 1 migration file
- Risks: Must create `app_role` enum, `user_roles` table, and `has_role()` function first (include in same migration). Seed data IDs should use UUIDs — need a deterministic mapping from current string IDs to UUIDs for FK integrity

**Brick 2: Supabase Schema — Auth Tables (profiles, user_roles, time_entries, week_statuses)**
- Objective: Create profiles table with trigger on `auth.users` insert, `user_roles` table (already created in Brick 1 prerequisite), `time_entries`, and `week_statuses` with proper FKs and RLS
- Deliverables: 1 migration file
- File limit: 1 migration file
- Risks: `time_entries` RLS must enforce `user_id = auth.uid()` for INSERT/UPDATE/DELETE; SELECT must allow own rows for employees, all rows for admins. `week_statuses` same pattern. Profiles: users can read all profiles (for display), update only their own
- Edge case: Admin must be able to read all time entries for reports; use `has_role(auth.uid(), 'admin')` in SELECT policy

**Brick 3: Auth UI + Session Context**
- Objective: Add Supabase client, rewrite `UserContext` to use Supabase Auth session + profile/role fetch, update `SignIn.tsx` with email/password form, keep DEV-only demo switcher behind env flag
- Deliverables: `src/lib/supabase.ts` (new), `UserContext.tsx` (rewrite), `SignIn.tsx` (rewrite), `UserSelector.tsx` (update signOut), `App.tsx` (session wiring)
- File limit: 5 files
- Risks: Must handle auth state loading (show spinner while session resolves). Demo switcher should only appear in development. Password reset flow needs `/reset-password` route
- Edge case: If a user is deactivated (`profiles.is_active = false`), sign-in should be blocked even if auth credentials are valid

**Brick 4: Data Access — Reference Data Context on Supabase**
- Objective: Replace localStorage reads/writes in `ReferenceDataContext` with Supabase queries (select, insert, update). Remove localStorage persistence
- Deliverables: `ReferenceDataContext.tsx` (rewrite), possibly `src/data/seed.ts` (remove runtime imports)
- File limit: 2-3 files
- Risks: Must handle loading states. Optimistic updates vs refetch strategy. Activity types and work areas have FK dependencies on phases — ensure cascade behavior is correct
- Edge case: `getGroupedWorkstreams` does a complex join of projects + access + entries — may need a Supabase view or RPC for performance

**Brick 5: Data Access — Time Entries + Week Statuses on Supabase**
- Objective: Replace in-memory time entries with Supabase CRUD. All mutations use `auth.uid()` server-side via RLS. Read operations scoped by RLS (employees see own, admins see all)
- Deliverables: `TimeEntriesContext.tsx` (rewrite)
- File limit: 1-2 files
- Risks: `getEntriesForWeek`, `getWeekSummary`, `getDailyTotals` currently do complex in-memory filtering — need efficient Supabase queries with date range filters. Week submission must be atomic (insert or update `week_statuses`)
- Edge case: `submitWeek` should check that user hasn't already submitted (idempotent). Locked weeks must prevent entry mutations — enforce via RLS or DB constraint

**Brick 6: Admin User Management (Server-Side)**
- Objective: Replace client-side user add/edit with server-side flow. Admin creates users via Supabase Auth admin API (edge function), assigns roles via `user_roles` insert. Update `AdminUsers` page accordingly
- Deliverables: 1 edge function (`create-user` or `admin-users`), `UsersTable.tsx` update, `UserDialog.tsx` update, `UserContext` additions
- File limit: 4-5 files
- Risks: Supabase `auth.admin.createUser()` requires service role key — must be in edge function, never client-side. Deactivating a user should set `profiles.is_active = false` but NOT delete their auth account (preserves history). Role changes need `user_roles` upsert
- Edge case: Cannot remove own admin role. Inviting a user who already has an auth account (e.g., re-activation)

---

### E) QA / Test Checklist (Manual)

| # | Test | Expected Result |
|---|---|---|
| 1 | Navigate to `/sign-in`, enter valid email/password, submit | Redirected to `/` (employee) or `/admin/reports/overview` (admin) |
| 2 | Click "Sign out" in top bar | Redirected to `/sign-in`; refreshing stays on sign-in |
| 3 | As employee, navigate to `http://…/admin/reports/overview` directly | See "Not authorised" or redirect to `/` |
| 4 | As employee, open browser DevTools > Network | All `time_entries` queries return only own rows (no other user IDs visible) |
| 5 | As employee, create a time entry | Entry appears in weekly timesheet; `user_id` in DB matches `auth.uid()` |
| 6 | As employee, attempt to manually POST a time entry with a different `user_id` via Supabase client | RLS blocks: "new row violates row-level security policy" |
| 7 | As admin, open Reports Overview | All users' entries visible; metric cards show aggregate data |
| 8 | As admin, go to Reference Data, add a department | Department appears in list; persists after refresh |
| 9 | As admin, go to Users, create a new user with email | User receives invite; can sign in after setting password |
| 10 | Submit a week, then attempt to edit an entry in that week | Entry edit is blocked (submitted week protection) |
| 11 | As employee, verify `/admin/users` returns 403/redirect | Cannot access user management |
| 12 | Deactivate a user (admin), then try to sign in as that user | Sign-in fails or shows "account deactivated" message |

---

### Assumptions Made

1. **Supabase project will be connected** before implementation begins (needed for migrations and auth)
2. **Email/password auth** is the primary method; no OAuth providers initially
3. **Existing string IDs** (e.g., `user-ilo`, `dept-finance`) will be mapped to deterministic UUIDs during seed migration using `uuid_generate_v5` or hardcoded UUID constants
4. **DEV demo switcher** will be retained temporarily behind `import.meta.env.DEV` flag, calling `supabase.auth.signInWithPassword()` with pre-seeded credentials
5. **No real-time subscriptions** needed initially — standard query/refetch pattern is sufficient
6. **Week locking** (preventing edits to submitted weeks) will be enforced via RLS policy on `time_entries` that checks `week_statuses.is_submitted`

