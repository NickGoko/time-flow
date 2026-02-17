

## Update Time Entry Data Model + Full Taxonomy Overhaul

### Problem

The current internal workstreams are named "Consulting -- Internal", "Finance -- Internal" etc. with generic activity types (Planning/Preparation, Execution/Delivery, Review/Follow-up). The user has provided a detailed taxonomy catalogue with department-specific work areas and realistic activity types that must replace the current seed data. Additionally, the `TimeEntry` type needs explicit workstream-aware fields.

### A) File List (6 files)

| # | File | Action |
|---|------|--------|
| 1 | `src/types/index.ts` | Extend `TimeEntry` with `supportDepartmentId?`, make `phaseId` and `activityTypeId` optional (nullable for internal entries), add `workAreaId?` and `workAreaActivityTypeId?` for internal entries |
| 2 | `src/data/seed.ts` | Replace departments, internal workstreams, work areas, and activity types with the full taxonomy. Update seed entry generator. Add migration helper. |
| 3 | `src/contexts/TimeEntriesContext.tsx` | Update `addEntry` signature, update `getEntryWithDetails` usage to handle nullable phase/activity fields |
| 4 | `src/components/TimeEntryForm.tsx` | Use new field names when saving internal vs external entries |
| 5 | `src/components/DailyGridEntry.tsx` | Same field mapping updates |
| 6 | `src/components/WeeklyTimesheet.tsx` | Update entry display to handle nullable phase/activity and show work area fields for internal entries |

### B) Data Model Changes

#### Updated `TimeEntry`

```text
TimeEntry {
  id, userId, date, hours, minutes, billableStatus,
  taskDescription, deliverableType, deliverableDescription?,
  comments?, createdAt, updatedAt,

  projectId: string;             // workstream ID (unchanged)

  // External project fields (null when internal)
  phaseId?: string;
  activityTypeId?: string;
  supportDepartmentId?: string;  // NEW -- user's dept when logging to external project

  // Internal workstream fields (null when external)
  workAreaId?: string;           // NEW -- maps to a Phase entry for internal work areas
  workAreaActivityTypeId?: string; // NEW -- maps to an ActivityType entry
}
```

#### Updated `TimeEntryWithDetails`

```text
TimeEntryWithDetails extends TimeEntry {
  project: Project;
  phase?: Phase;            // present for external entries
  activityType?: ActivityType;  // present for external entries
  workArea?: Phase;         // present for internal entries (same Phase type, different semantics)
  workAreaActivity?: ActivityType; // present for internal entries
}
```

### C) Taxonomy Overhaul

#### Departments (7 -- add Communications and Data/MEL, remove Consulting as internal)

| ID | Name |
|----|------|
| dept-consulting | Project Delivery (Impact) |
| dept-operations | Operations |
| dept-bd | Business Development |
| dept-finance | Finance, Legal and Administration |
| dept-it | IT, AI and Productivity |
| dept-hr | Human Resources |
| dept-comms | Communications |
| dept-mel | Data, Insights and Learning (MEL) |

Note: "Consulting" and "Operations" users work primarily on external projects. They may also log to other departments' internal workstreams if given access, but for now they get no dedicated internal workstream since the taxonomy has none for them.

#### Internal Workstreams (6 -- one per taxonomy section 2-7)

| ID | Name | Department |
|----|------|-----------|
| proj-internal-finance | Finance, Legal and Administration | dept-finance |
| proj-internal-hr | Human Resources | dept-hr |
| proj-internal-comms | Communications | dept-comms |
| proj-internal-mel | Data, Insights and Learning (MEL) | dept-mel |
| proj-internal-bd | Business Development | dept-bd |
| proj-internal-it | IT, AI and Productivity | dept-it |

No internal workstream for Consulting/Operations -- those users log to external projects.

#### External Project Phases (Section 1 of taxonomy)

Replace current generic phase activities with the full taxonomy:

- **Inception**: Kickoff preparation, Kickoff meeting, Inception report drafting, Client meeting, Partner meeting, Workplan finalisation, Stakeholder mapping, Other (specify)
- **Recruitment**: Outreach, Candidate screening, Selection panel prep, Interviews/selection, Onboarding, External event participation, Client meeting, Partner meeting, Other (specify)
- **Workshops / bootcamps**: Curriculum design, Speaker sourcing, Logistics planning, Workshop delivery, Attendance follow-up, Post-workshop evaluation, Client meeting, Partner meeting, Other (specify)
- **Entrepreneur support**: 1:1 prep, 1:1 support session, Sprint support, Market research, Business diagnostics, Follow-ups, Transport, Client/partner meeting, Other (specify)
- **Growthlabs**: Planning, Participant coordination, Facilitation, Follow-up, Outcome capture, Partner meeting, Other (specify)
- **Master classes**: Planning, Mentor/resource mobilisation, Delivery, Learner follow-up, Partner/client meeting, Other (specify)
- **Reporting**: Data collection, Data cleaning, Narrative drafting, Donor reporting, Case study development, Internal review, Submission, Other (specify)
- **General administrative**: Team meeting, Internal coordination, Travel/logistics, Event attendance, Client/partner meeting, Filing/documentation, Other (specify)

#### Internal Work Areas + Activities (per taxonomy sections 2-7)

Each department gets its specific work areas and detailed activity types as listed in the taxonomy. For example:

**Finance, Legal and Administration** (9 work areas):
Management accounts, Cashflow reports, Statutory returns, Bookkeeping, Bank reconciliations, Risk assessment, Audit, Policies, Internal project audit/compliance

**Human Resources** (10 work areas):
Staff welfare, L&D progress, HR policy and handbook, Culture and engagement, Payroll management, Performance management, Leave and absenteeism, Onboarding/offboarding, Probation/retention/attrition, Appraisals

**Communications** (9 work areas):
Social media, Online traffic/website, Media engagements, Speaking engagements, Knowledge/expert pieces, Storytelling/case narratives, Newsletter, Annual report, Internal comms training

**Data, Insights and Learning** (8 work areas):
Data/system availability, Capacity development, Data quality/integrity, Data insights/analysis, Insight pieces for comms, M&E resources, Data collection audits, Impact assumptions deep dive

**Business Development** (7 work areas):
Industry engagements, New funder/client conversations, Concept notes, Leads, Proposals submitted, Contracts/key account management, Databases

**IT, AI and Productivity** (8 work areas):
User support and troubleshooting, Laptop servicing, Connectivity/network, IT report, On/offboarding, Asset inventory, Training (basic/AI), Systems and knowledge documentation

Every work area includes "Other (specify)" as the last activity type.

### D) Migration Strategy

1. **Existing seed entries** are all generated for external projects (the `generateTimeEntries` function only uses `userProjectMap` which references external project IDs). These entries already have valid `phaseId` and `activityTypeId`.

2. **Migration in `getEntryWithDetails`**: When an entry has `phaseId` but no `workAreaId`, treat it as an external entry. Set `phase` and `activityType` from the existing fields. Leave `workArea` and `workAreaActivity` as undefined.

3. **New entries**: The form will populate either `phaseId + activityTypeId` (external) or `workAreaId + workAreaActivityTypeId` (internal), never both.

4. **Backward compatibility**: The `getEntryWithDetails` function checks which fields are populated and resolves accordingly. Old entries with `phaseId` set continue to render correctly.

5. **Seed generator update**: Update `userProjectMap` and `projectPhaseActivity` to use the new phase/activity IDs from the taxonomy. Existing external project phase IDs (phase-inception, etc.) stay the same -- only the activity type IDs under them get replaced with the new taxonomy entries.

### E) Validation Rules (unchanged, reinforced)

- External: `phaseId` required, `activityTypeId` required, activity must belong to phase
- Internal: `workAreaId` required, `workAreaActivityTypeId` optional (but encouraged), work area must belong to user's department
- Duration: 15-min increments, daily sum no more than 600 min (10h)
- Submitted week: block edits/saves (existing lock logic unchanged)

### F) User Assignment Updates

| User | Department | Can log to |
|------|-----------|-----------|
| Sarah, James, Amara, David | Project Delivery (Impact) | External projects only (no internal workstream) |
| Emily, Fatima | Operations | External projects only (no internal workstream) |
| Liam, Priya, Grace | Business Development | BD internal + assigned external projects |
| Raj, Nneka | Finance, Legal and Admin | Finance internal + Leave |
| Tom | IT, AI and Productivity | IT internal + Leave |
| Sofia, Aisha | Human Resources | HR internal + Leave |

New demo users needed for Communications and MEL departments (2 each) to test those workstreams. Total users: 18 (14 existing + 4 new).

### G) Test Steps

1. Load app as Sarah (Project Delivery). Verify no internal workstream appears. Only external projects + Leave shown in workstream dropdown.
2. Select Flagship. Verify Phase dropdown shows: Inception, Recruitment, Workshops/bootcamps, Entrepreneur support, Growthlabs, Master classes, Reporting, General administrative.
3. Select Inception phase. Verify activities show: Kickoff preparation, Kickoff meeting, Inception report drafting, Client meeting, Partner meeting, Workplan finalisation, Stakeholder mapping, Other (specify).
4. Save entry. Verify it renders in weekly view with project name + phase + activity.
5. Switch to Raj (Finance). Verify internal workstream "Finance, Legal and Administration" appears. No external projects except Leave.
6. Select Finance internal. Verify Work area dropdown shows 9 work areas (Management accounts through Internal project audit/compliance).
7. Select "Management accounts". Verify activities: GL review, Journals and accruals, Cost centre review, Variance analysis, Management pack drafting, Review meeting, Other (specify).
8. Save entry. Verify it renders as "Finance, Legal and Administration" with "Management accounts" arrow "GL review".
9. Old seeded entries for Raj still appear correctly in weekly view (they reference external project phases that still exist).
10. Switch to Liam (BD). Verify BD internal workstream appears with 7 work areas.
11. Select "Proposals submitted". Verify activities match taxonomy.
12. Test daily cap: log entries totalling 10h, verify next entry is blocked.
13. Submit a week. Verify entries are locked and no new entries can be added.
14. Switch to grid mode. Verify grouped workstream dropdown works per row.
15. Add a new Communications user. Verify Communications internal workstream appears with 9 work areas.

