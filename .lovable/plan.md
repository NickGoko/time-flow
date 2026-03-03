

# Phase 1-3 Master Plan: Users Restore + Auth Provisioning + RBAC

## A. Current State Summary

### Audit Answers

| # | Question | Answer |
|---|---|---|
| 1 | Canonical user store | **`profiles` + `user_roles` tables in Supabase**. The seed file (`data/seed.ts`) has a hardcoded `users[]` array but it is NOT used at runtime -- `UserContext` loads from DB. |
| 2 | /admin/users | **Yes, exists** (`src/pages/admin/AdminUsers.tsx` → `UsersTable.tsx`). Queries DB via `UserContext.allUsersList` which reads `profiles` + `user_roles`. CRUD goes through the `admin-users` edge function. |
| 3 | RLS enabled? | **Yes, on all 11 tables.** Reference tables: PERMISSIVE SELECT `true`, admin-gated writes. `time_entries` and `week_statuses`: fully open (`true`) for demo mode. |
| 4 | Auth enabled? | **No.** `AUTH_ENABLED = false`, `DEMO_MODE = true`. App uses acting-user switcher; no Supabase Auth session exists at runtime. |

### Identity Flow Today

```text
UserContext (AUTH_ENABLED=false)
  → loads profiles + user_roles from DB
  → auto-selects first admin as currentUser
  → UserSelector dropdown switches acting user
  → No supabase.auth calls
```

### Key Problem

The `admin-users` edge function **requires a valid JWT** (lines 22-53: extracts Bearer token, calls `getUser()`, checks admin role). With `AUTH_ENABLED=false`, no JWT exists, so **all admin user management operations fail silently** (create, update, toggle-active). The function returns 401.

## B. Table Inventory

| Table | PK type | Used by | RLS open? |
|---|---|---|---|
| `profiles` | uuid | UserContext, UsersTable, TopBar | SELECT: yes, WRITE: admin-only |
| `user_roles` | uuid | UserContext (role lookup) | SELECT: yes, WRITE: admin-only |
| `departments` | text | ReferenceDataContext | SELECT: yes, WRITE: admin-only |
| `projects` | text | ReferenceDataContext | SELECT: yes, WRITE: admin-only |
| `phases` | text | ReferenceDataContext | SELECT: yes, WRITE: admin-only |
| `activity_types` | text | ReferenceDataContext | SELECT: yes, WRITE: admin-only |
| `internal_work_areas` | text | ReferenceDataContext | SELECT: yes, WRITE: admin-only |
| `deliverable_types` | text | ReferenceDataContext | SELECT: yes, WRITE: admin-only |
| `project_department_access` | composite | ReferenceDataContext | SELECT: yes, WRITE: admin-only |
| `time_entries` | uuid | TimeEntriesContext (seed only!) | Fully open |
| `week_statuses` | composite | TimeEntriesContext (seed only!) | Fully open |

**Critical gap**: `TimeEntriesContext` still uses **in-memory seed data**, not Supabase. This is Phase 2 scope (persist time entries to DB).

## C. Brick Plan

### Phase 1: Users Restore (make /admin/users fully functional in demo mode)

**Brick 1.1 — Fix admin-users edge function for demo mode** (≤3 files)

The edge function currently requires a JWT. In demo mode there is none. Fix: accept a header like `x-acting-user-id` when no valid JWT is present, and validate that user's admin role server-side using the service role key.

| # | File | Change |
|---|---|---|
| 1 | `supabase/functions/admin-users/index.ts` | Add fallback: if no valid JWT, read `x-acting-user-id` header, verify admin role via service key, proceed |
| 2 | `src/contexts/UserContext.tsx` | Pass `x-acting-user-id: currentUser.id` header when calling edge functions in demo mode |

**Test**: Switch to an admin user → Admin > Users → click "Invite User" → fill form → confirm user appears in list and in `profiles` table.

---

**Brick 1.2 — Fix admin-impersonate for demo mode** (≤2 files)

| # | File | Change |
|---|---|---|
| 1 | `supabase/functions/admin-impersonate/index.ts` | Same pattern: accept `x-acting-user-id` fallback |
| 2 | `src/components/admin/UsersTable.tsx` | Pass acting-user header when invoking impersonate function |

**Test**: As super_admin user, click "Login as" on another user → magic link generated (or in demo mode, switch acting user directly).

---

### Phase 2: Persist Time Entries to Supabase

**Brick 2.1 — Connect TimeEntriesContext to DB** (≤6 files)

Replace in-memory seed arrays with Supabase queries.

| # | File | Change |
|---|---|---|
| 1 | `src/contexts/TimeEntriesContext.tsx` | Replace `useState(seedTimeEntries)` with Supabase fetch. `addEntry`/`updateEntry`/`deleteEntry` write to DB. Load entries for current user on mount and when user switches. |
| 2 | `src/components/WeeklyTimesheet.tsx` | May need minor updates if data shape changes |
| 3 | `src/components/TimeEntryForm.tsx` | Ensure async save (await DB write) |
| 4 | `src/components/DailyGridEntry.tsx` | Ensure async save |
| 5 | `src/components/PersonalDashboard.tsx` | Verify works with async data |

**Test**: 
1. Select User A, add time entry → verify row in `time_entries` table
2. Switch to User B → User A's entry not visible
3. Refresh page → entries persist

---

**Brick 2.2 — Week status persistence** (≤2 files)

| # | File | Change |
|---|---|---|
| 1 | `src/contexts/TimeEntriesContext.tsx` | `submitWeek` and `isWeekSubmitted` read/write `week_statuses` table |

**Test**: Submit a week → refresh → still shows submitted.

---

### Phase 3: RBAC Enforcement

**Brick 3.1 — Admin guard for reference data writes** (≤4 files)

Reference data mutations (add/update/toggle in `ReferenceDataContext`) currently write directly via the anon client, which fails because admin-write RLS policies require `auth.uid()`. Fix: route admin writes through an edge function (or add open PERMISSIVE write policies gated by app logic).

| # | File | Change |
|---|---|---|
| 1 | `supabase/functions/admin-reference-data/index.ts` | New edge function: accepts CRUD operations for reference tables, validates admin role via `x-acting-user-id` |
| 2 | `src/contexts/ReferenceDataContext.tsx` | Route all mutations through the edge function instead of direct Supabase client writes |

**Test**: As admin, add a department → succeeds. Switch to employee → reference data page hidden (AdminGuard). Verify employee cannot call edge function directly (role check).

---

**Brick 3.2 — Tighten time_entries RLS** (SQL only)

Once Phase 2 is done and entries flow through app logic with `user_id` injection, we can optionally tighten RLS. However, since there's no auth session in demo mode, this stays open. Document as future work when `AUTH_ENABLED` is re-enabled.

**No changes needed now** — document only.

---

## D. Execution Order & Dependencies

```text
Brick 1.1 (fix admin-users EF)     ← no deps, do first
Brick 1.2 (fix admin-impersonate)  ← no deps, can parallel with 1.1
Brick 2.1 (time entries to DB)     ← no deps on Phase 1
Brick 2.2 (week status to DB)      ← after 2.1
Brick 3.1 (ref data via EF)        ← after 1.1 (same pattern)
Brick 3.2 (RLS tightening)         ← future, when AUTH re-enabled
```

## E. Test Script Summary

| Brick | Test |
|---|---|
| 1.1 | Admin user: create, update, toggle-active all work from /admin/users |
| 1.2 | Super-admin: "Login as" button generates magic link or switches user |
| 2.1 | Time entries persist across page refresh and user switch |
| 2.2 | Week submit persists across refresh |
| 3.1 | Admin can CRUD reference data; employee cannot |
| 3.2 | (Future) Entries scoped by auth.uid() when AUTH re-enabled |

