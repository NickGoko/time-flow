---
tags:
  - growthafrica/strategic-projects/time-registration
---

---
Phase 1: Policy alignment + locking/edit window

Phase 2: Supabase persistence (no auth)

Phase 3: Admin Reference Data UI (taxonomy CRUD)

Phase 4: Finance CSV export + optional bulk import

Phase 4.5: Replace demo users with real employees + Users screen (v0)

Phase 5: Audit log + maybe-billable review

Phase 6: Supabase Auth + invites/passwords + RLS

---

```
help me breakdown this milestone into its components that will build the whole milestone brick by brick, then turn the changes into a multi-prompt flow

```
## Deep breakdown of the Implementation Plan (sequential)

### Milestone 0 — Foundations

- Define MVP “done”: fast entry (<30s), multiple entries/day, My entries + edit window, My summary (week/month/quarter/annual, billable split, missing hours/project hours split/individual projects areas/phases split).
- Lock scope: employee-only views; admin-only reference data maintenance; org dashboards deferred.
    

**Connection to your build:** You’ve nailed most of the **UX feel** (multiple entries, insights page), but “edit window” and the **admin maintenance loop** aren’t fully real yet.

---

### Milestone 1 — Data model v1 (structured + reportable)

- [x] Core entities: Users, Departments/Teams (optional), Roles.
- [x] Reference taxonomy: Projects → Phases/Activities → Tasks/Deliverables.
- [x] Facts: TimeEntries.
- [x] Active/inactive reference items (so history never breaks).
- [x] Trust layer (optional MVP, required Phase 2): Adjustments/audit.
    
**Connection to your build:** You’ve implemented a _workstream_ version of taxonomy (internal department work areas + external project phases). But it’s still largely “prototype state” unless persisted and managed centrally.

### Milestone 2 — Authentication + access control (MVP-simple)

- [ ] Sign-in, autofill identity on every entry.
- [x] Employees: only own entries. Admin: manage reference data.
    
~~**Key point for your constraint:** You said you’re **not ready** for Supabase Auth. That’s fine—BUT we still need a “current user identity” that is stable and persists across sessions (your demo user switcher can serve this purpose until auth later).~~

Since you’re not ready for Supabase Auth, Milestone 2 becomes:
1. **Stable “current user identity”** (demo sign-in/session)
2. **Autofill identity on every entry** (owner = current user, not editable)
3. **MVP access control**
    - Employee: only sees/edits own data
    - Admin: can access Admin screens (reference data + reports)
4. **Route + navigation gating**
5. **Data access gating**
    - Even without RLS, the app must enforce scoping via a single data layer (no bypass)

**Deferred (explicitly out of scope):**
- Supabase Auth (passwords, invites, magic links)
- RLS policies
- Secure session tokens

### Milestone 3 — Time entry UX (heart of adoption)

- Excel-style grid + bulk save.
- Clone/duplicate row.
- Cascading dropdowns.
- Inline validation.
- Canonical time format (minutes/decimal).

**Connection to your build:** You _have_ multi-entry grid and branching workstream fields. What’s missing is consistency around policies (cap/overtime) and some of the “fast entry” power features (clone row) if not yet built.


### Milestone 4 — My entries + edit window

- List with date filters.
- Quick edit/delete within policy.
- Enforce edit window (e.g., 7 days), then adjustments workflow.
**Connection to your build:** You have day entries + delete icons, but not the fully defined “My entries” list with range filter + edit window enforcement in a way that matches policy.

**What the task includes**

1. **Seed real employees into `users`**
    - name, email (optional), department, role, active
2. **Replace demo switcher list**
    - switcher should query `users` table (active users only), not a hardcoded array
3. **Add simple Admin “Users” screen (v0)**
    - Add user
    - Edit user
    - Deactivate user (soft)
4. **Data hygiene**
    - Ensure entries reference `user_id` so names can change without breaking history
**What it does NOT include (since you’re not ready for auth)**
- passwords
- invitation emails
- login sessions
- RLS policies
Those stay for the later Auth phase.



### Milestone 5 — My summary (feedback loop)

- Week/month/quarters/annual totals, billable split, expected vs logged, missing hours. Totals logged & split by projects, phases & activities split
- Private by default.
**Connection to your build:** Your **History & Insights**(Should be called "Dashboard" to align with system wide taxanomy) page is very close to this milestone already.

---

### Milestone 6 — Admin-managed dropdowns + bulk import/export

- [x] Admin screens for add/edit/deactivate Projects, Phases, Tasks/Deliverables.
- [x] Bulk import/export CSV with validation + safe rollback.

**This is the big missing piece you called out.** Right now you have admin reporting visuals, but not the “admin is the source of truth for what appears in the entry form.”

#### Brick 6.0 — Data source of truth contract

- Decide: employee forms and admin pages read from the **same** store (prefer Supabase DB even without auth).
- Enforce `is_active` soft deactivation on all reference items.
- Ensure entry forms show **active items only**, but historical entries still render names for inactive items.

**Done when:** entry dropdowns are entirely driven by reference tables, not seed arrays.

#### Brick 6.1 — Admin IA + shared CRUD scaffolding

- Add Admin nav section: **Reference Data**, **Users**, **Imports/Exports**
- Build reusable patterns:
    - List page: search, active filter, “Add”
    - Edit drawer/modal
    - Activate/deactivate toggle
    - Dependency warning banner (“used in X entries”
**Done when:** you can add one entity end-to-end (e.g., Workstreams) using the shared scaffolding.

#### Brick 6.2 — CRUD: Workstreams (+ project assignments)
Start here because it immediately affects the entry form.
- Workstreams list/edit/deactivate
- Add “type”: internal_department vs external_project
- Internal workstream must have owning_department
- External projects: add department access assignments (project_department_access)
**Done when:** admin can add an external project and assign it to Finance, and Finance users see it in Workstream dropdown.

#### Brick 6.3 — CRUD: Phases + Activity types (external)
- Phase list/edit/deactivate
- Phase activity types list/edit/deactivate
- Validation: activity_type belongs to phase
- Entry form uses cascading filtering
**Done when:** admin adds a new activity type under “Reporting” phase and it appears in entry form.

#### Brick 6.4 — CRUD: Internal work areas (per department)
- Department → work areas list/edit/deactivate
- Optional: work_area_activity_types (can be deferred if too big)

**Done when:** HR internal work areas are maintained by admin and appear for HR users.

#### Brick 6.5 — CRUD: Deliverable types (optional)

- Simple list/edit/deactivate
- Entry form shows deliverable types list (or keep free text if you want minimal)

**Done when:** admin adds “Case study” and it appears everywhere.

#### Brick 6.6 — Bulk import/export for reference data (CSV) with safety

Start with export (cheap), then import (harder).
- **Export** each entity table as CSV
- **Import** with:
    1. template CSV download
    2. dry-run validation report (errors, duplicates)
    3. commit step (only if clean) 

**Safe rollback (practical MVP):**
- Don’t write anything until validation passes (prevents partial writes).
- If you want true rollback, do imports via a single DB function/RPC (atomic transaction) — can be Phase 6.6b
**Done when:** admin can bulk add workstreams or work areas via CSV without breaking the app.

#### Brick 6.7 — Finance export (time entries)
- CSV export: date range + filters (department/workstream/user/billable status)
- Stable schema for reconciliatio
**Done when:** Finance can download a clean CSV without touching DB tools.

#### Brick 6.8 — Users CRUD v0 (profiles, roles, departments)

This is _not Supabase Auth_, it’s “user directory”.
- Admin can create/edit/deactivate users
- Assign department + role
- These users appear in the “Select user” dropdown and behave consistently
**Done when:** creating a new employee profile automatically gives them the correct internal defaults and shape of entry form.

#### Brick 6.9 — Passwords & authentication (later milestone)
What you asked (“admin assigns password and it authenticates in Supabase”) requires **Supabase Auth Admin API** + invites/password reset flows + RLS. That should be **Milestone 2+ (real auth)**, not Milestone 6.

### Milestone 7 — Quality gate + pilot rollout

- Keyboard nav, clear validation, totals match raw entries, accessibility.
- Pilot process and feedback loop.
    
**Connection to your build:** You’re ready to add a QA gate checklist soon, especially because policy drift (like 13.5h/day showing “Max”) undermines trust.