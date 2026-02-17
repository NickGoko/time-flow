

## Workstream Model — Plan

### A) Current Data Structure

| File | Key Structures |
|------|---------------|
| `src/types/index.ts` | `User` (has `department: string`), `Project`, `Phase`, `ActivityType`, `TimeEntry` (references `projectId`, `phaseId`, `activityTypeId`) |
| `src/data/seed.ts` | 14 users (department as plain string), 7 projects (flat list), 9 phases, ~40 activity types, ~420 generated entries |
| `src/components/TimeEntryForm.tsx` | Single-entry form — renders `projects.filter(p => p.isActive)` in Project dropdown |
| `src/components/DailyGridEntry.tsx` | Grid-entry form — same `projects.filter(p => p.isActive)` in Project dropdown |

The `TimeEntry` stores `projectId`. Both forms import `projects` directly from `seed.ts` with no department filtering.

### B) File List (4 files)

| # | File | Action |
|---|------|--------|
| 1 | `src/types/index.ts` | Add `Department`, `WorkstreamType`, extend `Project` with `type` and `owningDepartmentId`, add `ProjectDepartmentAccess`, `InternalWorkArea` |
| 2 | `src/data/seed.ts` | Add `departments[]`, `internalWorkAreas[]` with activity types, `projectDepartmentAccess[]`, update existing projects with `type: 'external_project'`, add internal department workstreams |
| 3 | `src/components/TimeEntryForm.tsx` | Replace `projects.filter(p => p.isActive)` with a department-aware helper that returns allowed workstreams for the current user |
| 4 | `src/components/DailyGridEntry.tsx` | Same department-aware filtering |

### C) Data Model Design

#### New Types in `src/types/index.ts`

```text
Department {
  id: string          // e.g. 'dept-consulting'
  name: string        // e.g. 'Consulting'
}

WorkstreamType = 'internal_department' | 'external_project'

Project (extended) {
  ...existing fields
  type: WorkstreamType              // NEW
  owningDepartmentId?: string       // NEW — required when type = 'internal_department'
}

ProjectDepartmentAccess {
  workstreamId: string      // Project.id for external projects
  departmentId: string      // which departments can see this project
}

InternalWorkArea {
  id: string
  name: string
  departmentId: string      // which department owns this
}
```

#### How internal work areas connect to existing Phase/Activity model

Internal work areas will be added as new `Phase` entries (with a naming convention like "Finance — Budgeting") and their activities as new `ActivityType` entries. This reuses the existing `Phase -> ActivityType` hierarchy without a schema change. The `InternalWorkArea` type maps a work area to its owning department so the form can filter phases when an internal workstream is selected.

#### Departments (6)

| ID | Name |
|----|------|
| dept-consulting | Consulting |
| dept-operations | Operations |
| dept-bd | Business Development |
| dept-finance | Finance |
| dept-it | IT |
| dept-hr | HR |

#### Internal Workstreams (6 — one per department)

Each department gets one internal workstream of type `internal_department`, e.g.:
- "Consulting — Internal" (proj-internal-consulting)
- "Operations — Internal" (proj-internal-operations)
- etc.

All are `defaultBillableStatus: 'not_billable'`.

#### Internal Work Areas + Activities (per department)

Each department gets 3-5 work areas (as Phases) with 2-4 activities each, plus an "Other (specify)" activity. Example:

**Consulting**: Strategy Development, Client Relationship Management, Knowledge Management, Other
**Operations**: Programme Coordination, Procurement, Logistics, Other
**Business Development**: Proposal Writing, Partnership Development, Market Research, Other
**Finance**: Budgeting, Financial Reporting, Audit Preparation, Other
**IT**: Systems Administration, Development, User Support, Other
**HR**: Recruitment and Onboarding, Training and Development, Policy and Compliance, Other

Activities under each work area follow the pattern:
- Planning/Preparation
- Execution/Delivery
- Review/Follow-up
- Other (specify)

#### External Project Department Access

Mapping which departments can see which external projects:

| Project | Departments |
|---------|------------|
| Flagship | Consulting, Operations, BD |
| JICA GBV | Consulting, Operations |
| CEIC | Consulting, Operations, BD |
| RISA | Consulting, Operations |
| Disrupt_for_Her | BD, Operations |
| Orange Corners | BD, Operations |
| Leave / Absence | All departments |

#### User Updates

Change `department: string` to `departmentId: string` on the `User` interface. Update all 14 users in seed.ts accordingly.

### D) Form Filtering Logic

A new helper function `getAvailableWorkstreams(departmentId: string): Project[]` in `seed.ts`:

1. Get all internal workstreams where `owningDepartmentId === departmentId`
2. Get all external projects where `projectDepartmentAccess` includes the department
3. Always include Leave / Absence
4. Return combined, sorted (internal first, then external, then leave)

When an internal workstream is selected, the Phase dropdown filters to only show work areas belonging to that department (via `InternalWorkArea.departmentId`). When an external project is selected, all standard phases are shown (existing behavior).

Both `TimeEntryForm.tsx` and `DailyGridEntry.tsx` will call this helper using `currentUser.departmentId`.

### E) Test Steps

1. Log in as Sarah Mitchell (Consulting) — Project dropdown shows: "Consulting — Internal", Flagship, JICA GBV, CEIC, RISA, Leave / Absence. Does NOT show Orange Corners or Disrupt_for_Her.
2. Select "Consulting — Internal" — Phase dropdown shows only Consulting work areas (Strategy Development, Client Relationship Management, Knowledge Management, Other). NOT the standard project phases.
3. Select a work area — Activity dropdown shows that work area's activities including "Other (specify)".
4. Select "Flagship" (external) — Phase dropdown shows standard phases (Inception, Recruitment, etc.) as before.
5. Switch user to Liam O'Brien (BD) — Project dropdown shows: "BD — Internal", Flagship, CEIC, Disrupt_for_Her, Orange Corners, Leave / Absence. Does NOT show JICA GBV or RISA.
6. Switch to Emily Thompson (Operations/admin) — sees Operations internal + all external projects assigned to Operations.
7. Both Single entry and Multiple entries modes reflect the same filtering.
8. Existing seeded time entries still load and display correctly (no regressions in Weekly Timesheet or Insights page).

