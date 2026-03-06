---
tags:
  - growthafrica/strategic-projects/time-registration
  - growthafrica/projects/strategic-projects/vibe-coding
---


---
[[Supabase - Auth + RLS + Real user onboarding]]
[[Supabase Auth + RLS Readiness Audit 25-02-2026]]
[[PRD]]
[[💼GrowthAfricaWork/Projects/Time registration and analytics system/Sprints|Sprints]]
[[💼GrowthAfricaWork/Projects/Time registration and analytics system/Design guidelines|Design guidelines]]
[[💼GrowthAfricaWork/Projects/Time registration and analytics system/Implementation plan|Implementation plan]]


```
brick-by-brick implementation plan + a multi-prompt chain
```
----


**Time tracking form: field details**

**1. Name of team member**
- **Input type:** text

**2. Date**
- **Input type:** date picker

Project
**3. project/activity**

- **Dropdown options:**
    - Flagship
    - JICA GBV
    - CEIC
    - RISA
    - Disrupt_for_her
    - Orange corners

Phase
**4. Phase of project**
- **Dropdown options:**
    - inception
    - recruitment
    - workshops
    - entrepreneur support
    - growthlabs
    - master classes
    - reporting
    - general administrative

Phase types-collapsed

**5. type of inception activity**
- **Dropdown options:**
    - inception/kickoff preparations
    - inception meeting/kickoff
    - inception report
    - online/external meeting with the client
    - online/external meeting with a partner

**6. type of recruitment**
- **dropdown options:**
    - outreach (potential cohort)
    - selection activities (new cohorts)
    - onboarding (new cohorts)
    - external events participation
    - online/external meeting with the client
    - online/external meeting with a partner

**7. type of workshop activity**
- **dropdown options:**
    - workshop/bootcamp prep
    - workshop/bootcamp execution
    - workshop/bootcamp follow-up
    - online/external meeting with the client
    - online/external meeting with a partner

**8. type of entrepreneur support activity**
- **dropdown options:**
    - entrepreneur research & prep
    - entrepreneur support (a&a)
    - entrepreneur support (sprint)
    - entrepreneur support (other)
    - sprint research & prep
    - online/external meeting with the client
    - online/external meeting with a partner
    - transport to/from engagements

**9. type of growthlabs activity**
- **dropdown options:**
    - growthlab planning
    - growthlab execution
    - growthlab follow-up
    - online/external meeting with the client
    - online/external meeting with a partner

**10. type of master classes activity**
- **dropdown options:**
    - master class planning
    - mentor/resource mobilization
    - master class execution
    - online/external meeting with the client
    - online/external meeting with a partner

**11. type of reporting activity**
- **dropdown options:**
    - entrepreneur follow-ups
    - data collection & processing
    - reporting (time, journey track, etc.)
    - case study development

**12. type of general administrative activity**
- **dropdown options:**
    - team meetings
    - transport to/from engagements
    - online/external meeting with the client
    - online/external meeting with a partner
    - attending an event

**13. Task description**
- **input type:** free-text

**14. Deliverable type**
- **dropdown options:**
    - workshop
    - reporting
    - training
    - event
    - case study
    - other

**15. Deliverable description**
- **input type:** free-text

**16. billable/non-billable**
- **dropdown options:**
    - billable
    - Maybe billable
    - non-billable

**17. Hours worked**
- **dropdown options:**
    - 00–14
    - 15–29
    - 30–44
    - 45–59

**18. minutes worked**
- **dropdown options:**
    - typically 0–59 (or any incremental set you prefer, e.g., 5-minute intervals)





---

# 10-02-2026

CURRENT ISSUES
1) Bug: selecting Wednesday displays Tuesday (off-by-one / timezone / date parsing issue).
2) Calendar/week display must run Monday → Sunday (not Sunday → Saturday).
3) Users must be able to back-date entries (default today, but allow previous days/weeks).

EXPECTED BEHAVIOR
- Week strip and date pickers show Monday-first week consistently.
- Selecting a day always shows the correct date in:
  - day header
  - single entry modal default date
  - grid view date header
  - entries list group heading
- Backdating works: user can select previous week/day and log entries there (subject to any edit-window rules already present).
~~CHANGES REQUIRED~~
1) ~~Add hover help text/tooltips:~~
   - ~~"Single entry": explain it opens a single entry form/modal~~
   - ~~"Grid view": explain it allows bulk entry in a table for the selected day~~
1) ~~Update labels:~~
   - ~~"Add Entry" → "Add Activity" (or "Add Time Entry" if more appropriate)~~
   - ~~"One" → "Single entry"~~
1) ~~Ensure consistency across:~~
   - ~~buttons~~
   - ~~toggles~~
   - ~~empty states~~
~~CHANGES REQUIRED~~
1) ~~Add optional "Deliverable description" field to time entries:~~
   - ~~Visible in single entry + grid view~~
   - ~~Non-compulsory~~
   - ~~Stored in the entry object/state (front-end) without breaking existing entries~~
1) ~~Add expand/collapse per day for recorded entries:~~
   - ~~Default expanded~~
   - ~~User can collapse the list to focus on dashboard/progress~~
1) ~~Improve progress clarity (light touch):~~
   - ~~Add label like “8.0h / 100%” on the selected day or daily card where appropriate~~
   - ~~No complex new charts~~

---

~~Mobile-first responsiveness audit + fixes for Time Registration screen only.~~

---

# 11-02-2026

### What to implement now vs later (conservative)

#### Implement NOW (functional, prevents bad data + reduces user friction)

**Sprint 1 — Functional Integrity + Small Bug Fixes**

1. ~~**Fix duplication in Entries cards**~~
    - ~~Project name showing twice is a quick UI bug with clear scope.~~
2. ~~**Submission + locking protocol (hard functional rule)**~~
    - ~~Users can edit/delete entries **until** week submitted~~
    - ~~Once week submitted → entries locked (no add/edit/delete)~~
3. ~~**Date constraints (hard functional rule)**~~
    - ~~**No future dates** entry capability~~
    - ~~**No more than 14 days in the past**~~
    - ~~Apply consistently to:~~
        - ~~day/week selector navigation~~
        - ~~single entry~~
        - ~~multiple entries grid save~~
4. ~~**Daily cap enforcement (hard functional rule)**~~
    - ~~Block save if day total would exceed **10 hours**~~
    - ~~Must apply to both single and multiple entries~~
~~✅ These are the highest ROI because they prevent incorrect data and reduce rework.~~

~~FUNCTIONAL CHANGES (MUST IMPLEMENT)~~
1) ~~Submission + locking protocol:~~
   - ~~Before week submission: user can add, edit, delete entries normally.~~
   - ~~After week is submitted: lock the week for employees:~~
     - ~~Disable Add entry~~
     - ~~Disable delete icons and edit actions~~
     - ~~Grid save disabled~~
     - ~~Show a clear “Week submitted — entries locked” message~~

1) ~~Date constraints:~~
   - ~~Block entry creation if Date > Today (no future)~~
   - ~~Block entry creation if Date < Today - 14 days~~
   - ~~Apply consistently across:~~
     - ~~single entry modal/date input~~
     - ~~multiple entry grid date~~
     - ~~day/week navigation/selector (prefer disabling invalid dates rather than allowing then erroring)~~
   - ~~Use user-local timezone safely (avoid off-by-one).~~

1) ~~Daily cap:~~
   - ~~Hard block if total daily hours would exceed 10h (600 minutes)~~
   - ~~Must work for:~~
     - ~~single entry save~~
     - ~~multiple entry Save all (aggregate existing + all grid rows)~~

BUG FIX (MUST FIX)
4) Entries list duplication:
   - Project name appears twice in each entry card.
   - Remove the duplication so project name appears once, while preserving any needed metadata.


---
1) ~~Add selectable options for:~~
   - ~~"Leave/Absence"~~
   - ~~"Public holiday"~~
~~(Use existing structure: either as special Projects or special Activities—recommend the least disruptive approach.)~~

1) ~~Auto-fill behavior:~~
   - ~~If Project = Leave/Absence:~~
     - ~~Phase auto-sets to "Leave/Absence"~~
     - ~~Activity auto-sets to "Leave/Absence"~~
     - ~~Billable defaults to "Not Billable"~~
     - ~~Duration defaults to 8h 0m~~
     - ~~Deliverable type defaults to "Other" (unless you find an existing preferred value; if ambiguous, keep "Other" for now and flag it)~~
   - ~~If Project = Public holiday:~~
     - ~~Same logic with "Public holiday" values~~


REQUIRED BEHAVIOR
- Show progress percentage on daily and/or weekly progress indicators.
- Colour thresholds:
  - <75% = Red
  - 75–90% = Yellow
  - 90–100% = Green
- Use baseline constants:
  - 8h per day
  - 40h per week
(Do not build part-time logic yet; just keep constants centralized for future.)


----

# 17-02-2026
### Option A — Single form + explicit “Work context” branching

**What it looks like**
- Field 1: Work context (External / Internal)
- If External → choose project → phase → subtype
- If Internal → choose department → work area → (optional) subtype
- Then common fields. 

**Business logic required**
- **UI branching logic** based on context:
    - show/hide external fields vs internal fields
        
- **Department selection logic** for internal:
    - internal departments list
    - department → work areas mapping
        
- **Validation rules** on save:
    - ensure external entries have project/phase
    - ensure internal entries have department/work area
        
- **Filtering rules** (to prevent bloated options):
    - Only show internal departments relevant to the user (usually just their own), otherwise you create confusion.
        

**Blind spots / risks**
- **Mis-click risk:** user selects wrong context and logs incorrectly.
- **Extra step every entry:** adds friction.
- **Cross-department scenario ambiguity:** if BD is logging time on an external delivery project, they must choose “External” and then see phases that may not fit their mental model.
    

**When A is best**
- When you want the user to intentionally declare: “this is internal vs project work” (strong behavioural signalling).
- When cross-department work is rare.

### Model: “Default home view + selectable workstream”

On login, infer department and _preconfigure defaults_, but don’t remove the ability to log to external projects.

**How it works in the UI**
- The user lands on a single “Log time” form.
- The form has one top field: **Workstream** (not “work context”).
- The dropdown is **pre-filtered** and **pre-grouped**:
    

**Workstream dropdown (for a Comms user example)**
- **Recent** (last 5 used)
- **External projects I’m assigned to** (Project A…)
- **Internal – Communications** (their default internal workstream)
    

✅ Hands-off: user does not choose “department” or “context”.  
✅ Cross-department: external projects appear when assigned.  
✅ No clutter: they only see external projects relevant to them.

**Then the form branches automatically**:
- If Workstream = External project → show Phase + Activity type (your existing model)
- If Workstream = Internal – Comms → show Comms work areas


### Taxonomy catalogue - structured seed lists of work areas and sample activity types per department

- For each department, list:
    - **Work areas (Level 2)** taken from your structure
    - **Sample activity types (Level 3)** to seed a first draft (short, realistic, not exhaustive)
- Add a small **shared “universal” activity set** used across departments to reduce duplication.
- Keep every work area with an **“Other (specify)”** activity type so logging never gets blocked.

#### Implementation (first-draft department activities + sample tasks)

Below is a **seed catalogue** you can plug into the first build as dropdown options. It’s designed to be:
- short enough to be usable,
- specific enough to reduce “Other (specify)” overuse,
- consistent across departments.

#### Universal activity types (available under many work areas)

Use these as a shared set where appropriate:
- Planning & preparation
- Execution / doing the work
- Review & quality check
- Documentation & filing
- Stakeholder meeting (internal)
- Stakeholder meeting (external)
- Follow-ups & coordination
- Vendor / partner management
- Travel / logistics
- Other (specify)


#### 1) Project delivery (Impact) — external projects

**Work areas (phases)**

- Inception
    - Activity types: Kickoff preparation; Kickoff meeting; Inception report drafting; Client meeting; Partner meeting; Workplan finalisation; Stakeholder mapping; Other (specify)
- Recruitment
    - Activity types: Outreach; Candidate screening; Selection panel prep; Interviews/selection; Onboarding; External event participation; Client meeting; Partner meeting; Other (specify)
- Workshops / bootcamps
    - Activity types: Curriculum design; Speaker sourcing; Logistics planning; Workshop delivery; Attendance follow-up; Post-workshop evaluation; Client meeting; Partner meeting; Other (specify)
- Entrepreneur support
    - Activity types: 1:1 prep; 1:1 support session; Sprint support; Market research; Business diagnostics; Follow-ups; Transport; Client/partner meeting; Other (specify)
- Growthlabs
    - Activity types: Planning; Participant coordination; Facilitation; Follow-up; Outcome capture; Partner meeting; Other (specify)
- Master classes
    - Activity types: Planning; Mentor/resource mobilisation; Delivery; Learner follow-up; Partner/client meeting; Other (specify)
- Reporting
    - Activity types: Data collection; Data cleaning; Narrative drafting; Donor reporting; Case study development; Internal review; Submission; Other (specify)
- General administrative
    - Activity types: Team meeting; Internal coordination; Travel/logistics; Event attendance; Client/partner meeting; Filing/documentation; Other (specify)

#### 2) Finance, legal & administration — internal workstream

**Work areas**
- Management accounts
    - Activity types: GL review; Journals & accruals; Cost centre review; Variance analysis; Management pack drafting; Review meeting; Other (specify)
        
- Cashflow reports
    - Activity types: Bank position update; Cashflow forecast update; Payables scheduling; Receivables follow-up; Treasury review; Other (specify)
        
- Statutory returns (KE/HQ + subsidiaries)
    - Activity types: Tax computations; Filing preparation; Payment processing; Statutory reconciliations; Queries & follow-ups; Other (specify)
        
- Bookkeeping (general & projects)
    - Activity types: Posting transactions; Coding review; Supporting docs follow-up; Expense verification; Project cost tagging; Other (specify)
        
- Bank reconciliations
    - Activity types: Statement download; Matching & clearing; Exception investigation; Adjustments/journals; Sign-off; Other (specify)
        
- Risk assessment
    - Activity types: Risk register update; Controls testing; Incident review; Mitigation planning; Reporting; Other (specify)
        
- Audit (external/internal)
    - Activity types: PBC preparation; Schedule preparation; Auditor support; Query responses; Evidence collation; Close-out actions; Other (specify)
        
- Policies (training/enforcement/review)
    - Activity types: Policy drafting; Stakeholder review; Training session delivery; Compliance follow-up; Updates/versioning; Other (specify)
        
- Internal project audit / compliance
    - Activity types: Spot checks; Document review; Issue log; Remediation follow-up; Reporting; Other (specify)
        

---

#### 3) Human resources — internal workstream

**Work areas**
- Staff welfare checks/events
    - Activity types: Check-in calls; Welfare assessment; Event planning; Event delivery; Feedback capture; Other (specify)
        
- L&D progress management
    - Activity types: Training needs assessment; Scheduling; Tracking completion; Vendor coordination; Learning report; Other (specify)
        
- HR policy & handbook review
    - Activity types: Policy drafting; Review cycle; Stakeholder consultation; Finalisation; Communication rollout; Other (specify)
        
- Culture & engagement
    - Activity types: Pulse survey; Engagement initiatives; Facilitation; Issue resolution; Reporting; Other (specify)
        
- Payroll management
    - Activity types: Payroll inputs collection; Review & approvals; Payroll processing support; Deductions/reconciliations; Payslip distribution; Other (specify)
        
- Performance management
    - Activity types: Goal-setting cycle support; Check-in reminders; Review facilitation; Documentation; Performance improvement support; Other (specify)
        
- Leave & absenteeism
    - Activity types: Leave approvals support; Leave balance audit; Absenteeism follow-up; Reporting; Other (specify)
        
- Onboarding / offboarding
    - Activity types: Offer & contract admin; Onboarding checklist; Orientation; Access provisioning coordination; Exit process coordination; Other (specify)
        
- Probation / retention / attrition
    - Activity types: Probation check-ins; Retention actions; Exit interviews; Data capture; Reporting; Other (specify)
        
- Appraisals
    - Activity types: Appraisal scheduling; Evidence gathering; Panel support; Results communication; Filing; Other (specify)

#### 4) Communications — internal workstream

**Work areas**

- Social media posts & engagement
    - Activity types: Content planning; Copywriting; Design brief; Publishing; Community management; Performance review; Other (specify)
- Online traffic / website updates
    - Activity types: Website edits; SEO updates; Analytics review; Landing page build; Uploads & publishing; Other (specify)
        
- Media engagements / journalist engagements
    - Activity types: Media list update; Pitching; Interview coordination; Press release drafting; Follow-ups; Other (specify)
        
- Speaking engagements
    - Activity types: Speaker prep; Slide support; Event coordination; Post-event comms; Other (specify)
        
- Knowledge/expert pieces / learning-impact pieces
    - Activity types: Topic research; Interviews; Draft writing; Editing; Publishing; Other (specify)
        
- Storytelling pieces / case narratives
    - Activity types: Story sourcing; Field interviews; Drafting; Editing; Approval cycle; Other (specify)
        
- Newsletter (external)
    - Activity types: Content collection; Drafting; Design; Mailing list management; Send & performance review; Other (specify)
        
- Annual report
    - Activity types: Data requests; Narrative drafting; Design coordination; Proofing; Final approval; Other (specify)
        
- Internal comms training
    - Activity types: Training prep; Training delivery; Materials update; Feedback capture; Other (specify)

#### 5) Data, insights & learning (MEL) — internal workstream

**Work areas**

- Data/system availability
    - Activity types: Tool checks; Access troubleshooting; Data pipeline monitoring; Issue escalation; Other (specify)
        
- Capacity development / team training
    - Activity types: Training design; Training delivery; Coaching; Materials update; Other (specify)
        
- Data quality/integrity
    - Activity types: Data validation; Cleaning; Data audits; Fix recommendations; Other (specify)
        
- Data insights/analysis
    - Activity types: Analysis design; Data extraction; Modelling; Insight write-up; Presentation; Other (specify)
        
- Insight pieces for comms
    - Activity types: Insight drafting; Fact checking; Visuals coordination; Review & sign-off; Other (specify)
        
- M&E resources up to date
    - Activity types: Indicator review; Tools/templates update; Documentation; Stakeholder alignment; Other (specify)
        
- Data collection audits / project results audits
    - Activity types: Sampling plan; Evidence review; Field coordination; Findings log; Reporting; Other (specify)
        
- Impact assumptions deep dive
    - Activity types: Theory-of-change review; Assumption testing; Evidence gathering; Learning brief; Other (specify)

#### 6) Business development — internal workstream

**Work areas**

- Industry engagements / external events
    - Activity types: Outreach; Scheduling; Attendance; Follow-ups; Notes & CRM updates; Other (specify)
        
- New funder/client conversations
    - Activity types: Intro call; Discovery; Needs capture; Follow-up emails; Pipeline update; Other (specify)
        
- Concept notes (first full draft)
    - Activity types: Research; Draft writing; Review cycle; Revision; Submission; Other (specify)
        
- Leads (existing/new)
    - Activity types: Lead sourcing; Qualification; Proposal planning; Handover; Pipeline hygiene; Other (specify)
        
- Proposals submitted
    - Activity types: Proposal drafting; Budgeting inputs; Partner coordination; Compliance checks; Submission admin; Other (specify)
        
- Contracts signed / key account management
    - Activity types: Negotiation support; Contract review coordination; Account check-ins; Reporting to client; Upsell/cross-sell; Other (specify)
        
- Databases (clients/partners)
    - Activity types: Data entry; Data cleaning; Segmentation; Outreach list build; Other (specify)
        

#### 7) IT, AI & productivity — internal workstream

**Work areas**
- User support & troubleshooting
    - Activity types: Ticket triage; Remote support; Hardware diagnostics; Software install/config; Access support; Follow-up; Other (specify)
        
- Laptop servicing & maintenance
    - Activity types: Preventive maintenance; Repairs coordination; Imaging/rebuilds; Warranty/vendor follow-up; Asset tagging; Other (specify)
        
- Connectivity status / network maintenance
    - Activity types: ISP troubleshooting; Router/AP checks; Performance monitoring; Changes/config updates; Documentation; Other (specify)
        
- IT report
    - Activity types: Metrics capture; Incident summary; Asset updates; Risk/issues log; Report drafting; Other (specify)
        
- On/offboarding
    - Activity types: Account setup; Permissions; Device allocation; Security baseline; Exit wipe/return; Other (specify)
        
- Asset inventory management
    - Activity types: Asset register updates; Audit checks; Procurement requests; Disposal processes; Other (specify)
        
- Training (basic / AI)
    - Activity types: Training prep; Training delivery; Office hours; Materials update; Other (specify)
        
- Systems & knowledge documentation
    - Activity types: SOP drafting; Process mapping; How-to guides; Architecture notes; Updates/versioning; Other (specify)
        


# 23-02-2026

What you’ve built so far (from the screenshots)

### Employee side (Time Registration)
- Weekly progress strip + day picker (Mon→Sun looks implemented).
- Day “Time Log” card with **Single entry** + **Multiple entries** and **Add entry** CTA.
- Entries list with delete icon.
- Dashboard cards (Logged / Remaining / Billable rate / Week status).
- “History & Insights” personal analytics page (top projects + 6-week trend).
- Workstream concept is now live:
    - **External** path: Workstream → Phase → Activity → task + deliverables + billable + duration
    - **Internal** path: Internal workstream → Work area (department-specific)

### Admin side
- Reports Overview page with:
    - KPI cards
    - Stacked bar chart (billable / maybe / non-billable)
    - Cohort distribution
    - **All projects** default dropdown + “By status / By project” toggle (looks implemented)
    - Team Summary table (User | Hours | Compliance | Billable | Maybe | Submitted?)
    - Data quality cards (weeks not submitted, maybe billable volume, blocked-by-cap, etc.)
- Switch user dropdown now shows **roles + departments**, but the “Admin context” UX still feels a bit confusing because “Admin” exists both as a _user role_ and as a _navigation area_.

----

## What’s missing to reach a strong v0.9–1.0 MVP

### A) Data trust + persistence (the biggest gap)
Right now you have an excellent **UI prototype**, but MVP credibility needs:
- Persistent storage (Supabase) for users/departments/workstreams/time entries/weeks.
- Week submit → lock enforcement in the data layer (not just UI state).
- Validation that can’t be bypassed (even if still “client-side enforced” for now).
    

### B) Policy alignment (your screenshots show drift)
From your employee screenshot:
- You have **13.5h on a day** and “169%”. That means one of these is true:
    1. 10h/day is not a hard cap anymore (then UI should reflect “overtime allowed”), **or**
    2. It’s a bug and you must block saves above cap.
Right now it reads like **the system allows what it claims it should prevent**, which undermines trust.

### C) Admin experience clarity
You want: “If I switch to an Admin user, I should _be in admin_.”  
So you need:
- Role-based default routing (admin user → Reports Overview by default).
- Remove “Dev context” confusion in UI (or hide it behind a dev flag).
    

### D) Review + audit (minimum viable governance)
To be “MVP complete” for an org:
- A minimal **reclassification workflow** for “Maybe billable” (even if it’s just a queue + change action).
- A minimal **audit log** row whenever a time entry is edited/reclassified.
    

### E) Department analytics (your ask)
You’re already capturing departments in demo users. MVP wants:
- Reports filters: **All users / Department / Project / User**
- Privacy-safe grouping later (don’t do benchmarking/cohorts by department until roles + policy are real).

# 25-02-2026 
[[Milestones 23-02-2026]]
Based on the placeholders in the codebase, here's what remains:

**Completed Bricks:**
- **Brick 1-2**: Foundation (types, seed data, AdminCrudTable, basic pages, routing)
- **Brick 3**: Workstreams CRUD + Department Access ✅
- **Brick 4**: Work Areas CRUD ✅
- **Brick 5**: Deliverable Types CRUD ✅

**Remaining Bricks:**

| Brick | Area | Placeholder Location | Status |
|---|---|---|---|
| **Phases & Activity Types CRUD** | Reference Data → Phases tab | `AdminReferenceData.tsx` line 68-70: *"Phases & Activity Types — coming in Brick 4"* | Placeholder |
| **Users CRUD** | Admin → Users page | `AdminUsers.tsx` line 11: *"Users CRUD — coming in Brick 5"* | Placeholder |
| **CSV Export** | Admin → Import/Export → Export tab | `AdminImportExport.tsx` line 20: *"CSV Export — coming in Brick 6"* | Placeholder |
| **CSV Import** | Admin → Import/Export → Import tab | `AdminImportExport.tsx` line 26: *"CSV Import — coming in Brick 7"* | Placeholder |
| **Department Edit/Add** | Reference Data → Workstreams tab → Departments section | `AdminReferenceData.tsx` lines 49-53: *"Edit/Add coming in Brick 3"* toasts | Toggle works, but add/edit are stubs |

**Summary of each:**

1. **Phases & Activity Types** — Manage phases and their child activity types (two-level hierarchy). Phases are already in state but read-only. Need `addPhase`, `updatePhase`, `togglePhaseActive`, plus same for activity types. A nested table or expandable rows showing activities per phase.

2. **Users CRUD** — Manage users: name, email, department, role, appRole, weeklyExpectedHours, isActive. Currently `UserContext` reads from the static seed `users` array. Needs to shift to mutable state with localStorage persistence, similar to how reference data works.

3. **CSV Export** — Export time entries (and possibly reference data) to CSV. Likely filters by date range, user, project. Generates a downloadable `.csv` file.

4. **CSV Import** — Import time entries from CSV. File upload, parsing, validation, preview, and commit to state.

5. **Department Add/Edit** — Minor: the departments section already has toggle working but add/edit callbacks just show "coming soon" toasts. Needs a simple `DepartmentDialog` and context methods `addDepartment`/`updateDepartment`.

>Would you like me to create a detailed implementation plan for any of these?
- ~~Plan Phases & Activity Types CRUD~~
- ~~Plan Users CRUD~~
- ~~Plan Department Add/Edit~~
- ~~Plan CSV Export~~

# 03-03-2026

<mark style="background: #FF5582A6;">Roles - for:</mark>
- Employee
- HOD
- Leadership/Partner
- System-Admin


1. [ ] **Implement** backend user and password creation to bypass the manual sign-up flow
2. [ ] **Build** an automated email notification system to send credentials to new users 
3. [ ] **Develop** a password reset feature including an automated reminder for forgotten credentials 
4. [ ] **Configure** system permissions to allow heads of departments to see only their own department's 

**Integrate** historical password tracking for admin-led resets 

---

## Capabilities + scopes
### Roles (human-friendly)

- Employee 
- HOD
- Leadership
- Admin

### Capabilities (toggleable permissions)

- View scopes:
    - `view:own`
    - `view:department`
    - `view:org`
- Data actions:
    - `export:org`
    - `export:department`
    - `export:project`
        
- Reference data management:
    - `config:projects`
    - `config:activities`
    - `config:tasks`
    - `config:deliverables`
        
- Governance:
    - `admin:manage_users`
    - `admin:manage_roles`
    - `admin:manage_project_access`
    - `admin:unlock_week`
        

### Scopes (where it applies)
- `managed_departments[]`
- `project_scope[]` (projects a user can export/view)

This gives you exactly what you’re describing:
- A Finance person can be granted **Export + Org dashboards** without being an Admin.
- A Leadership person can manage projects/tasks/deliverables without controlling user roles or unlock.


### How Leadership can “have more” without being full Admin

Give Leadership:

- ✅ `view:org`
- ✅ `config:projects`
- ✅ `config:activities`
- ✅ `config:tasks`
- ✅ `config:deliverables`
- ✅ `export:*` (if you want)  
But keep these Admin-only:
- ❌ `admin:manage_roles`
- ❌ `admin:manage_users`
- ❌ `admin:manage_project_access`
- ❌ `admin:unlock_week` (or only in exceptional cases)

This matches your intention: they can manage the “business structure” of the system, not the governance mechanics.


### Yes — you can manage permissions from the backend with an Admin interface

This is a standard pattern: **RBAC Admin UI**.

#### Admin UI screens (minimal but powerful)

1. **Users**
	- Search user
	- Assign roles (multi-select)
	- Assign managed departments (for HOD)
	- Assign additional capabilities (checkboxes)
	- Assign project scopes (multi-select) 

2. **Roles**
	- Define role templates 
	- Attach default capabilities to each role
	- Version roles (so changes are tracked)

3. **Access scopes**
	- Project visibility by department (who can log support time to which external projects)
	- Export scopes (who can export for which projects/departments/org)
    
4. **Audit log**
	- Who changed permissions, what changed, when, and why

### Practical example (your Finance export scenario)

**Scenario:** Finance needs export permission for all team members for timesheet reporting.

Create a role template:  
**Finance Reporter**
- `view:org`
- `export:org`
- (optional) `view:project` if you want project-specific reporting pages
- ❌ no config permissions
- ❌ no unlock permissions

Then assign this role to:
- Connie (or a finance reporting account)  
    Now finance can export data and see dashboards without being able to change deliverables/tasks.

**Alternative:** project-based reporting  
If finance only exports for certain projects:
- Give `export:project`
- Add project scope: [Project A, Project C, Project G]

### Guardrails (so this doesn’t become chaotic)

**Hard rules I recommend**
- Only **Admin** can grant roles and permissions. (Even if Leadership can config taxonomy.)
- Leadership can edit reference data, but those changes should:
    - require a “reason” note, and
    - be logged.


| Capability                                    | Employee |          HOD |      Leadership |   Admin |
| --------------------------------------------- | -------: | -----------: | --------------: | ------: |
| Log own time                                  |        ✅ |            ✅ |               ✅ |       ✅ |
| Submit/lock own week                          |        ✅ |            ✅ |               ✅ |       ✅ |
| View own dashboard                            |        ✅ |            ✅ |               ✅ |       ✅ |
| View department dashboards                    |        ❌ |     ✅ (dept) |         ✅ (org) | ✅ (org) |
| View other users’ entries                     |        ❌ |     ✅ (dept) |         ✅ (org) | ✅ (org) |
| Manage projects/activities/tasks/deliverables |        ❌ |            ❌ |               ✅ |       ✅ |
| Export data                                   |        ❌ | ❌ (optional) | ✅ (your choice) |       ✅ |
| Manage users/roles/scopes                     |        ❌ |            ❌ | ❌ (recommended) |       ✅ |
| Unlock weeks                                  |        ❌ |            ❌ | ❌ (recommended) |       ✅ |


## Acceptance criteria

- You can grant **export + org view** to a finance reporting user without making them Admin.
- Leadership can manage taxonomy (projects/activities/tasks/deliverables).
- Only Admin can assign roles/permissions and manage scopes.
- All changes are audit-logged.

# 05-03-2026

You’re seeing (“wrong deliverables for the wrong departments”, and sometimes “IT seeing Impact options”) is almost always caused by one of these implementation gaps:
1. **Deliverables are stored/queried as a global list** (no `department_id` filter), so everyone sees everyone’s deliverables.
2. The app’s “current user department” value is **missing/incorrect** (e.g., demo switcher changes the name, but not the `department_id` used by queries).
3. Internal taxonomy tables (internal projects / work areas / tasks) are **not keyed to department**, or your seed/import put them all under one department.


## The smartest fix (do this in bricks, because it’s a “source-of-truth” problem)

### Brick 1 — Make deliverables impossible to mix (DB-level truth)

**Goal:** a deliverable must belong to a department (or be explicitly global).

**Implement:**

- Create/confirm table: `deliverable_types`
    - `id`
    - `name`
    - `department_id` (nullable only if `is_global=true`)
    - `is_global boolean default false`
    - `is_active boolean default true`
    - `sort_order int`
- Add a DB view (optional) `deliverable_types_for_user(department_id)` or just query with filters.

**Acceptance tests:**
- IT user only sees IT deliverables + “Other”
- Finance user only sees Finance deliverables + “Other”.


### Brick 2 — Fix the query that populates the dropdown (UI correctness)

**Goal:** entry form must filter by `current_user.department_id` every time.
**Implement:**
- Wherever the Deliverable dropdown options are loaded:
    - Filter: `is_active=true AND (department_id = currentUser.department_id OR is_global=true)`
- When user switches demo user:
    - Ensure `currentUser.department_id` changes too
    - Force re-fetch of deliverables and clear invalid selection

**Acceptance tests:**
- Switch user from Finance → IT: deliverables list updates instantly; previously-selected Finance deliverable is cleared if invalid.

### Brick 3 — Add server-side validation so UI bugs can’t corrupt data

**Goal:** even if the UI is wrong, saving a mismatched deliverable fails.

**Implement (on the API/mutation that saves a time entry):**

- Load deliverable by `deliverable_type_id`
- Reject if:
    - deliverable is inactive, OR
    - deliverable is not global AND `deliverable.department_id != currentUser.department_id` 
**Acceptance tests:**
- Manually call the endpoint with another dept’s deliverable id → rejected.
    
### Brick 4 — Patch the underlying taxonomy drift (why IT sometimes sees Impact)

This is the sibling issue: internal “projects/work areas/tasks” are also department-scoped in the spec (Finance/MEaL/IT etc.).

**Implement:**
- Ensure internal “projects/work areas/tasks” tables include `department_id`
- Ensure internal queries use that `department_id`
- Seed HR L&D work area/tasks if missing.



## 1) One dashboard system, three scopes (solves Leadership + HOD overlap)

the cleanest way to get **“deeper dashboards”** without creating a rabbit hole of extra pages, fragile filters, or mismatched permissions.

Instead of separate pages per role, treat dashboards as the same components with a **scope switcher**:

**Dashboard scope selector (top control)**
- **My dashboard** (always available)
- **Department dashboard** (only if user has `view:department`)
    - If they manage multiple departments → show a **department dropdown** sourced from `user_department_scope[]`
- **Organisation dashboard** (only if user has `view:org`)
This answers your question: **Yes**, a Leadership+HOD user effectively gets **3 views**, but they live under **one Dashboard/Reports surface** via the scope selector (not three separate apps/pages).

## 2) Keep pages minimal: 2 surfaces total

To avoid “too much in one page” _and_ avoid multiplying routes:

### A) Employee “Dashboard” (existing screen)

Keep it personal + fast:
- Totals for selected time range
- Billing mix (Billable / Maybe / Not)
- Top projects
- Trend

### B) Admin “Reports” (existing tab)

This becomes the same dashboard engine but with scope selector + filters.

**Do not add more routes yet.** Expand content inside the existing `Reports` page using:
- a scope selector (My / Department / Org)
- a single “Breakdown” toggle (By status / By project / By department / By user)
- optional drilldown drawer/modal (not route)

## 3) Make “time range” a required global control everywhere

You said every dashboard must have day/week/month/quarter/annual. Make it a shared component:

**Time range selector (same everywhere)**
- Today | This week | This month | This quarter | This year | Custom
Under the hood, every widget reads the same `date_from/date_to`.


## 4) What each role sees (v1.0 level, not overbuilt)

### Employee (My dashboard)

Minimum blocks:

1. **Total time** in range + “target vs logged” (8h/day, 40h/week)
    
2. **Billing mix** (tri-state)
    
3. **Top projects** table (Project | Hours | %)
    
4. **Trend** (6–12 weeks bars/line)
    
5. Optional drilldown: clicking a project shows **Phase/Activity breakdown** (reuses your taxonomy)
    

> Skip “vs other employees” for named comparisons. If you keep it, make it **anonymised cohorts** (Top 25 / Mid 50 / Bottom 25) like you already started.

### HOD (Department dashboard)

Minimum blocks:

1. **Department totals** in range (hours + billing mix)
2. **Team summary table** (actionable, low charting):
    - User | Hours | Compliance % | Billable % | Maybe billable hours | Week submitted?
        
3. **Hours by project** (stacked or grouped bars)
4. **Data quality panel**:
    - Backdated entries
    - Blocked-by-cap attempts
    - Weeks not submitted
    - Maybe-billable volume
        

### Leadership/Partner (Org dashboard)

Same blocks as HOD but with filters:
- Department filter (All departments default)
- Project filter (All projects default)

Keep it simple: **Org totals + project concentration + department breakdown + compliance list**. Don’t add benchmarking until privacy rules are real.

### System Admin

Same as Leadership **plus**:
- Reference Data CRUD
- Users/roles/scopes
- Audit log
    


## 5) The key technical move: “one reporting dataset” (prevents breakage)

Dashboards only become reliable if everything reads from a single, consistent shape.

Create a DB view (or consistent query layer) that outputs a “denormalised row”:
**`time_entries_enriched` (view)**
- entry_id
- entry_date, week_start
- user_id, user_name
- user_department_id, department_name
- category (external/internal)
- project/workstream_id, project_name
- phase/work_area name
- activity/task name
- deliverable_type name
- billable_status (billable/maybe/not)
- duration_minutes
- week_status (draft/submitted)
    

Then all dashboards are just:
- filter by scope (my/department/org)
- filter by date range
- group by (project/user/department/status

This is how you avoid brittle UI dropdown logic and “wrong data appears for wrong department”.

## 6) How to handle “taxonomy differs per department”

Don’t build separate dashboard logic per department.

Do this instead:
- Store the canonical IDs (project/workstream, phase/work_area, activity/task, deliverable_type)
- Store the **display labels per department** in reference tables
- In dashboards, always show “Project / Activity / Deliverable” labels (generic), and the **values** remain department-specific.

So the UI stays harmonised, the data stays consistent.

## 7) Your specific HOD multi-department question

You **do not** use `home_department_id` to decide what HOD dashboards they see.
You use
- `user_department_scope(user_id, department_id)` (many-to-many

So Ian can manage 3 departments without hacks. The department dashboard simply shows a department picker populated from that scope table.

## 8) Are dropdown-driven dashboards “smart” or “high overhead”?

They’re smart **if you cap them**.

Safe rule for v1:
- **One time range selector** 
- **One scope selector**
- **One breakdown selector**
- Optional: one filter dropdown (project _or_ department, not both at once)
Anything beyond that becomes combinatorial and fragile.


# 06-03-2026
## Brick-by-brick implementation plan (Reports Overview)

### Brick 1 — Fix scope meaning + remove “unused” dropdown drift

**Goal:** “Department/Organisation” must dictate **metrics + chart + team summary**, not just “some data below”.

### Brick 2 — Split the mixed dropdowns into real filters

**Goal:** Stop mixing departments + projects in one dropdown.  
Add a third toggle **By department** and show the right dropdown for each mode.

### Brick 3 — Add proper time granularity (day/month/quarter/annual)

**Goal:** Add `Today / This quarter / This year` while keeping the current style and keeping behaviour predictable.

### Brick 4 — Team summary must follow scope + selections

**Goal:** Team table changes depending on Scope and Department selection.


## Brick plan (Personal Dashboard + QA)

### Brick 1 — Personal Dashboard: add the same Time range control (Today/Week/Month/Quarter/Year)

**Outcome:** A single `timeRange` state drives **Today card + This Week/Range card + Top tables** (and optionally the trend).

### Brick 2 — Reuse the same aggregation logic as Reports Overview

**Outcome:** The personal dashboard uses the **same date window utility + same “billing mix” aggregation** (Billable/Maybe/Not) so totals always reconcile.

### Brick 3 — Add lightweight breakdown tables
**Outcome:** Two small tables (no new charts):
- **Top projects** for selected range
- **Top activities/tasks** for selected range (using a unified label)
    

### Brick 4 — Tight QA / Drift detector

**Outcome:** A **reconciliation check** runs whenever filters change and flags mismatches (in console + optionally in the existing Data quality card), so you catch drift immediately.


## PROCESS ONLY: Manual QA run steps (for you / the team)

(Not a Lovable code prompt—use this as your QA script.)

**Smoke test (fast, high-signal)**

1. Reports: Organisation + This month + By status
2. Reports: Department (pick a department) + This week + By department
3. Reports: Organisation + This month + By project (select 1 project)
4. Reports: My dashboard + Today + By status
5. Personal Dashboard: switch Today → This week → This month and confirm top tables change

For each step, confirm:
- KPI totals reconcile (Billable+Maybe+Not = Total)
- Chart totals reconcile with KPIs
- Team Summary matches scope (Dept shows dept users only; Org shows org users; My shows me only)


## Most reliable, non-rabbit-hole way to add Project filtering + better activity/task breakdown to the Employee “Dashboard” page, without breaking your existing ranges, totals, or admin reporting.


### Brick 1 — Add filters to the personal Dashboard (no new logic yet)

**Goal:** Let employees filter their dashboard by **Category** and **Project**, like Admin Reports, but scoped to _their_ data.

**UI controls (top row, next to the time range pills):**
1. **Category** (segmented control or dropdown)
	- Options: **All**, **External projects**, **Internal projects**
	- Default: **All**
2. **Project** (dropdown)
	- Default: **All projects**
	- If Category = External → show external project list
	- If Category = Internal → show internal workstreams/projects for the user’s department
	- If Category = All → show **both**, grouped (External / Internal)
**Guardrails**
- No new routes/pages.
- Keep layout + spacing.
- Filters must affect **everything** on the page consistently (KPIs, breakdown tables, charts).
    

### Brick 2 — Reuse the same aggregation logic with optional filters

**Goal:** Don’t invent new math. Extend your existing “dashboard aggregation” function to accept:

- `user_id` (current user)
- `range` (today/week/last week/month/quarter/year)
- `category` (all/external/internal)
- `project_id` (nullable)
**Single source of truth rule**  
All widgets on the page must use **the same filtered dataset**:
- Summary card totals (Billable/Maybe/Not)
- Progress bar
- Trend chart
- Breakdown tables
This is the only way to avoid “drift.”

---

### Brick 3 — Add 2 lightweight breakdown tables (high signal, low complexity)

Add **one card** containing two simple tables:

1. **Top projects (for selected range + category filter)**
	- Columns: Project | Hours | % of total | Billable %
	- Top 5 + “Other”
	- Clicking a project row sets the **Project dropdown** (in-page drill, no navigation)
2. **Top activities/tasks**
- Column name: **Activity/task**
- Value logic (important for consistency across departments):
    - External entries: `Phase → Activity type` (or your external activity label)
    - Internal entries: `Work area → Activity type` (or your internal task label)
    - Fallback: “Unclassified
- Columns: Activity/task | Hours | % of total


### Brick 4 — Improve the 6-Week Trend without a new chart zoo

Keep the chart simple and stable:
- Add a toggle: **Trend view: Hours | Billing mix**
    - **Hours** = current weekly totals (existing)
    - **Billing mix** = stacked by Billable/Maybe/Not (reuse your existing stacked-bar logic)

**Apply the same filters (Category + Project)** to the trend data.

### Brick 5 — Tight QA matrix + drift fixes (before adding anything else)

A manual QA pass that forces reconciliation:

For **each** range (Today / This week / Last week / This month / This quarter / This year):
- Category: All / External / Internal
- Project: All projects + one specific project
- Trend view: Hours / Billing mix

**Checks**
- `Billable + Maybe + Not billable = Total logged`
- KPI totals match breakdown totals
- Trend totals reconcile with the same filtered dataset
- When filters change, **all widgets update together**


## **“Stability / Correctness iteration”** that does _nothing new visually_ and instead guarantees every widget is driven by the **same filtered dataset**, with **reconciliation checks** that catch drift immediately.

### Brick S1 — Canonical dataset contract

**Goal:** Define one canonical “dashboard dataset” shape that everything uses.

**Canonical unit:** minutes (never mix hours/decimals internally).  
**Canonical billable buckets:** `billable | maybe_billable | not_billable` (exact enum mapping).

**Dataset input params (shared everywhere):**

- `scope`: my | department | org (on Reports only; Personal is always `my`)
- `range`: today | week | last_week | month | quarter | year
- `category`: all | external | internal
- `projectId`: null | uuid/string
    

**Dataset output (single source of truth):**
- `entries[]` (optional to return if you already query it; OK to omit if you return aggregates only)
- `totals`: `{ totalMin, billableMin, maybeMin, notBillableMin }`
- `series`: chart-ready (daily/weekly buckets)
- `topProjects[]`
- `topTasks[]` (activity/task grouping)

### Brick S2 — One shared query + one shared aggregation module

**Goal:** Stop each widget from running its own query or its own math.

Create **one module** (or one hook) like:

- `getDashboardData(params): DashboardData`

Internally, it should:
1. Build **one filter** (date range + scope + category + project)
2. Fetch data once (either rows or pre-aggregated)
3. Compute all totals + tables + series from the same dataset
4. Return one object used by all components
    

### Brick S3 — Reconciliation guard (DEV-only)

**Goal:** If totals drift, we show a warning immediately.

Add a function:
- `reconcileDashboardData(data) => { ok: boolean, issues: string[] }`
Checks:

- `billableMin + maybeMin + notBillableMin === totalMin`
- Sum of chart series mins equals `totalMin` (within 1–2 minutes tolerance if rounding)
- Sum of `topProjects + other` equals `totalMin`
- Sum of `topTasks + other` equals `totalMin`

If not ok:
- Show a small **non-blocking warning banner** on the page **only when `DEV_MODE=true`**
- Log details to console with the filter params
### Brick S4 — QA matrix runner (manual but systematic)

**Goal:** One controlled QA pass that is repeatable.

Create a checklist (and optionally a dev helper that prints reconciliation result on each filter change).

QA combinations for **Personal Dashboard**:
- Range: Today / This week / Last week / This month / This quarter / This year
- Category: All / External / Internal
- Project: All projects + one project
    

QA combinations for **Reports Overview**:
- Scope: My / Department / Organisation
- Range (your existing)
- Breakdown toggles (By status / By project)
- Project filter (All + one)

## [[Auth Discovery Audit Report - Lovable audit & Codex-AI-coding-agent audits]]

### The most useful one-line questions to ask each tool

#### Ask Lovable
- “What existing assumptions about users would auth break if introduced carelessly?”
- “Where does the current app pretend a user exists without real authentication?”
- “What in the current Users page is real behaviour versus placeholder behaviour?”
- “What would cause existing user records to be duplicated during auth rollout?”

#### Ask Codex
- “Show me every file that reads or writes current-user state.”
- “Show me every file that references Supabase, auth, session, redirect, login, logout, invite, or reset password.”
- “Show me every place where email is used as identity.”
- “Show me the exact current user data shape used by the UI.”
- “Show me anything that would conflict with a nullable `auth_user_id` link model.”
- “Show me anything that would make second sign-in fail after first logout.”


## Super-admin account considerations before implementation

Your current setup already has a real super-admin impersonation path and also a demo-mode fake-user path. That combination is powerful, but it is exactly why you need stricter boundaries before you switch auth on. The audit confirms that super-admin impersonation is a real auth flow via `admin-impersonate`, while demo mode can also switch users in local state with no real auth session.
### What to do with the super-admin account

Do not rely on a single “all-powerful” day-to-day account for everything. Use three layers:
#### 1) Named operating super-admin

This is your normal admin identity. It should:
- be a real invited account
- be linked to the preserved roster row
- be used for normal admin work
- be allowed to impersonate users
- not be used as the only recovery path

#### 2) Break-glass super-admin
This is your recovery account. It should:
- be separate from your normal named account
- have a different email address from your daily admin if possible
- never be used for routine testing
- be manually documented outside the app
- be excluded from experimental auth rewrites until the auth rollout is stable
    

#### 3) Dev or testing operator

This is for testing role-specific flows during rollout. It can be:
- demo-mode switching while auth is still off
- seeded test users for employee, HOD, leadership and admin roles
- a staging-only impersonation workflow
    

That way, if daily admin auth breaks, you still have a recovery identity. If impersonation breaks, you still have real seeded users. If demo mode causes confusion, your break-glass account is untouched.

#### Rules that should apply to the super-admin account

Your super-admin should never be able to:
- deactivate itself
- demote itself
- delete itself
- lose its auth link because of a bulk provisioning or ID rewrite process
- be forced through the same migration path as ordinary imported users
The audit already confirms self-deactivation is blocked, which is good, but that is only one lockout path. The larger risks are still mixed-mode auth, ID rewrites, and profile-link drift.

#### Practical design principle
Your super-admin should be linked by a stable `auth_user_id`, not by rewriting the business user row primary key. The audit is very clear that the current ID rewrite approach is the fragile part, and that the safer path is to add a nullable `auth_user_id` to `profiles` and migrate linking logic to that field.



## Slice 1 Verification Steps & Rollback Plan
verification steps to run in Supabase + app UI for Slice 1 (schema checks, provisioning test, demo mode still works)
### A. Schema Verification

**1. Confirm `auth_user_id` column exists on `profiles`:**

Run in the backend query tool (or ask me to run it):
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'auth_user_id';
```
Expected: one row, `uuid`, `YES` (nullable).

**2. Confirm unique constraint:**
```sql
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'profiles' AND constraint_type = 'UNIQUE'
  AND constraint_name LIKE '%auth_user_id%';
```
Expected: one row.

**3. Confirm `handle_new_user` function body uses `auth_user_id`:**
```sql
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
```
Expected: body contains `SET auth_user_id = NEW.id` and does NOT contain `ON CONFLICT (email) DO UPDATE SET id = NEW.id`.

**4. Confirm trigger is attached to `auth.users`:**
```sql
SELECT tgname, tgrelid::regclass FROM pg_trigger
WHERE tgfoid = (SELECT oid FROM pg_proc WHERE proname = 'handle_new_user');
```
Expected: one row referencing `auth.users`. If zero rows, the trigger was never created or was dropped — this is a known unknown from the audit.

---

### B. Provisioning Test (via Edge Function)

**5. Test `provision-invite` does NOT mutate `profiles.id`:**

Pick an existing profile without auth. Record its `id`:
```sql
SELECT id, email, auth_user_id FROM profiles WHERE auth_user_id IS NULL LIMIT 1;
```

Call the Edge Function (from app UI: Admin → Users → Auth dropdown → Send Invite, or via curl):
```bash
curl -X POST \
  https://zmrulycwatgakndyojsh.supabase.co/functions/v1/admin-users \
  -H "Content-Type: application/json" \
  -H "x-acting-user-id: " \
  -d '{"action":"provision-invite","userId":""}'
```

Then verify:
```sql
SELECT id, email, auth_user_id FROM profiles WHERE email = '';
```
Expected:
- `id` is **unchanged** (same UUID as before)
- `auth_user_id` is now set to the auth user's UUID

Also verify `user_roles.user_id` was NOT changed:
```sql
SELECT user_id, role FROM user_roles WHERE user_id = '';
```
Expected: still uses the original profile `id`.

**6. Test `create-with-password` (super_admin only):**

Same pattern — pick an unprovisioned profile, call with a test password, verify `profiles.id` unchanged and `auth_user_id` set.

---

### C. Demo Mode Verification

**7. Confirm demo mode still works in the app UI:**

1. Open the preview URL
2. The app should auto-load with a user selected (no sign-in screen)
3. The user-switcher dropdown in the top bar should list all active users
4. Switch between 2–3 users — timesheet and insights pages should load without errors
5. Open browser console — no auth errors, no 401s

**8. Confirm `AUTH_ENABLED` is still `false`:**

Check `src/lib/devMode.ts` — should read:
```typescript
export const AUTH_ENABLED = false;
export const DEMO_MODE = true;
```

---

### D. Negative Tests

**9. Confirm the old PK-mutation path is gone:**

Search the Edge Function code for any remaining `.update({ id:` or `.update({ user_id:` patterns that would rewrite PKs. There should be none in provisioning actions.

**10. Confirm `fetchUserProfile` has dual-path logic:**

In `src/contexts/UserContext.tsx`, the function should query by `auth_user_id` when called from an auth session and by `id` when in demo mode.

---

### E. Rollback Plan

If Slice 1 causes issues, revert in this order:

**Step 1 — Revert code changes:**

Use Lovable's built-in revert. Click the revert button on the chat message **before** the Slice 1 implementation message. This restores:
- `supabase/functions/admin-users/index.ts`
- `src/contexts/UserContext.tsx`
- `src/types/index.ts`

**Step 2 — Revert the database migration:**

Run a counter-migration to undo the schema change:
```sql
-- 1. Restore original handle_new_user (PK-rewriting version)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (email) DO UPDATE SET id = NEW.id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 2. Drop the auth_user_id column
ALTER TABLE public.profiles DROP COLUMN IF EXISTS auth_user_id;
```

**Step 3 — Verify rollback:**

Re-run schema check (step 1 above) — `auth_user_id` should not exist. Confirm demo mode works (step 7).

---

### Summary Checklist

| # | Check | Pass criteria |
|---|---|---|
| 1 | `auth_user_id` column exists | One row in `information_schema` |
| 2 | Unique constraint on `auth_user_id` | Constraint found |
| 3 | `handle_new_user` sets `auth_user_id` | Function body confirmed |
| 4 | Trigger attached to `auth.users` | `pg_trigger` row exists |
| 5 | `provision-invite` preserves `profiles.id` | ID unchanged, `auth_user_id` set |
| 6 | `create-with-password` preserves `profiles.id` | Same as above |
| 7 | Demo mode works | User switcher, timesheet, insights all functional |
| 8 | `AUTH_ENABLED = false` | Confirmed in source |
| 9 | No PK mutation in Edge Function | Code search clean |
| 10 | `fetchUserProfile` dual-path | Code review confirmed |

Run schema verification queries
Test demo mode end-to-end
Test provision-invite preserves PKs
