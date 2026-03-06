---
tags:
  - growthafrica/strategic-projects/time-registration
---
## Deep breakdown of the Implementation Plan (sequential)

### Milestone 0 — Foundations

- Define MVP “done”: fast entry (<30s), multiple entries/day, My entries + edit window, My summary (week/month, billable split, missing hours).
- Lock scope: employee-only views; admin-only reference data maintenance; org dashboards deferred.

**Connection to your build:** You’ve nailed most of the **UX feel** (multiple entries, insights page), but “edit window” and the **admin maintenance loop** aren’t fully real yet.

---

### Milestone 1 — Data model v1 (structured + reportable)

- Core entities: Users, Departments/Teams (optional), Roles.
- Reference taxonomy: Projects → Phases/Activities → Tasks/Deliverables.
- Facts: TimeEntries.
- Active/inactive reference items (so history never breaks).
- Trust layer (optional MVP, required Phase 2): Adjustments/audit.
    

**Connection to your build:** You’ve implemented a _workstream_ version of taxonomy (internal department work areas + external project phases). But it’s still largely “prototype state” unless persisted and managed centrally.

---

### Milestone 2 — Authentication + access control (MVP-simple)

- Sign-in, autofill identity on every entry.
- [x] Employees: only own entries. Admin: manage reference data.

**Key point for your constraint:** You said you’re **not ready** for Supabase Auth. That’s fine—BUT we still need a “current user identity” that is stable and persists across sessions (your demo user switcher can serve this purpose until auth later).

---

### Milestone 3 — Time entry UX (heart of adoption)

- [x] Excel-style grid + bulk save.
- Clone/duplicate row.
- Cascading dropdowns.
- Inline validation.
- [x] Canonical time format (minutes/decimal).

**Connection to your build:** You _have_ multi-entry grid and branching workstream fields. What’s missing is consistency around policies (cap/overtime) and some of the “fast entry” power features (clone row) if not yet built.

---

### Milestone 4 — My entries + edit window

- List with date filters.
    
- Quick edit/delete within policy.
    
- Enforce edit window (e.g., 7 days), then adjustments workflow.
    

**Connection to your build:** You have day entries + delete icons, but not the fully defined “My entries” list with range filter + edit window enforcement in a way that matches policy.

### Milestone 5 — My summary (feedback loop)

- Week/month totals, billable split, expected vs logged, missing hours.
- Private by default.
    
**Connection to your build:** Your **History & Insights** page is very close to this milestone already.


### Milestone 6 — Admin-managed dropdowns + bulk import/export

- [x] Admin screens for add/edit/deactivate Projects, Phases, Tasks/Deliverables.
- Bulk import/export CSV with validation + safe rollback.

**This is the big missing piece you called out.** Right now you have admin reporting visuals, but not the “admin is the source of truth for what appears in the entry form.”

### Milestone 7 — Quality gate + pilot rollout

- Keyboard nav, clear validation, totals match raw entries, accessibility.
- Pilot process and feedback loop.
**Connection to your build:** You’re ready to add a QA gate checklist soon, especially because policy drift (like 13.5h/day showing “Max”) undermines trust.