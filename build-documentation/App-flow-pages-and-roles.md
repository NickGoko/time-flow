

## Site map (top-level pages only)

- Authentication
    
    - Sign in
        
- Employee
    - Time Entry
    - My Entries
    - My Summary
    - Profile and Preferences
        
- Admin
    - Reference Data Management
    - User and Role Management
    - System Settings
- Support
    
    - Help and FAQ
        
---

## Purpose of each page (one line each)

- Sign in
    
    - Secure access and identify the current user.
        
- Time Entry
    
    - Log time fast (single entry or bulk daily entry in a grid).
        
- My Entries
    
    - Review, edit, duplicate, or delete your own entries within the allowed window.
        
- My Summary
    
    - See your week/month totals, billable split, and missing-hours nudges.
        
- Profile and Preferences
    
    - Manage personal defaults (work hours, time format, reminders).
        
- Reference Data Management (Admin)
    
    - Maintain Projects, Phases/Categories, Activities/Deliverables (add/edit/deactivate).
        
- User and Role Management (Admin)
    
    - Add users, assign roles, map users to departments/teams (if used).
        
- System Settings (Admin)
    
    - Configure edit window, expected hours logic, increments, retention, exports.
        
- Help and FAQ
    
    - Quick “how to log in 30 seconds” guidance and policy explanations.
        

---

## User roles and access levels

### Employee (MVP)

- Can
    
    - Create time entries for self
        
    - View personal entries and summaries
        
    - Edit/delete within the configured edit window
        
    - Duplicate entries
        
- Cannot
    
    - View other users’ entries
        
    - Change reference data (projects/phases/activities)
        
    - Change system rules
        

### Admin (MVP)

- Can
    
    - Everything an employee can (for own entries)
        
    - Manage reference data (CRUD + activate/deactivate)
        
    - Manage users and roles
        
    - Configure system settings (edit window, increments, expected hours)
        
    - Run basic exports (if enabled)
        
- Cannot (until Phase 2, if you choose)
    
    - Reclassify others’ entries without audit/adjustment rules
        

### Phase 2 roles (for org dashboards later)

- Head of Department / Team Lead
    
    - Team-level dashboards (view-only by default)
        
    - Optional: request reclassification via workflow
        
- Finance
    
    - Billing-focused dashboards + exports
        
    - Optional: approve adjustments/reclassifications
        
- Leadership
    
    - Org-level dashboards (high-level KPIs, trends)
        
    - No raw-entry editing
        

---

## Primary user journeys (3 steps max each)

### 1) Daily bulk time entry (Employee)

1. Open **Time Entry** → pick **date** (defaults to today).
    
2. Add rows fast (project → phase → activity) → enter duration + note.
    
3. Hit **Save all** → see “Saved” confirmation + day total.
    

### 2) Repeat yesterday quickly (Employee)

1. Open **My Entries** → filter to yesterday.
    
2. Click **Duplicate** on relevant rows.
    
3. Change date/durations as needed → **Save**.
    

### 3) Fix a mistake (Employee)

1. Open **My Entries** → find the entry.
    
2. Edit fields (if within edit window) or choose “Request correction” (later).
    
3. Save → see what changed (and why, if adjustment workflow is enabled).
    

### 4) Check personal progress (Employee)

1. Open **My Summary**.
    
2. Review week/month totals + billable split.
    
3. If “Missing hours” appears → click **Add time** to jump to Time Entry.
    

### 5) Maintain project taxonomy (Admin)

1. Open **Reference Data Management**.
    
2. Add/edit/deactivate Project/Phase/Activity (no deleting history).
    
3. Save → changes instantly apply to dropdowns.
    

### 6) Configure rules (Admin)

1. Open **System Settings**.
    
2. Set edit window, expected hours, time increments, reminders.
    
3. Save → applies system-wide (with change log).
    

---

## Phase 2 site map (org dashboards + governance)

### Leadership

- Org Dashboard
    
    - KPIs (utilization, billable %, trend lines)
        
    - Org-wide filters (date range, department, project)
        
- Portfolio View
    
    - Project health rollups (time mix, allocation drift)
        
- Insights
    
    - Hotspots (over/under utilization), trend alerts (view-only)
        

### Head of Department / Team Lead

- Team Dashboard
    
    - Team utilization, compliance (missing time), time mix
        
- Team Timesheets
    
    - Read-only view of team entries (with drill-down)
        
- Exceptions Queue
    
    - Missing time, unusual spikes, uncategorized/“Other”
        
- Adjustment Requests
    
    - Review/approve correction requests (if you enable approvals)
        

### Finance

- Billing Dashboard
    
    - Billable vs non-billable, invoicable readiness, client/project rollups
        
- Export Center
    
    - Configurable exports (by period, project, client)
        
- Reclassification Workbench
    
    - Propose or apply billable/invoicable changes via **adjustments** (no silent edits)
        
- Audit Log
    
    - All adjustments, approvals, export runs (who/when/what)
        

### Admin (expanded)

- Reference Data Management (expanded)
    
    - Bulk import/update, versioning, mapping rules
        
- Policy and Rules
    
    - Edit window, approvals, required fields, reason codes, retention
        
- Role and Access Control
    
    - Data scopes (self/team/department/org) by role
        
- Notification Templates
    
    - Reminder schedules + message variants
        

### Shared / cross-role

- Reports Library
    
    - Saved reports, scheduled reports (Phase 2+)
        
- Glossary and KPI Definitions
    
    - “Billable”, “Invoicable”, “Expected hours”, “Utilization” definitions (single source of truth)
        
- Data Quality Center
    
    - Validation exceptions, taxonomy gaps, “inactive mapping” warnings
        

---

## Phase 2 navigation rules (so it stays simple)

- Default landing page depends on role
    
    - Leadership → Org Dashboard
        
    - HoD → Team Dashboard
        
    - Finance → Billing Dashboard
        
    - Admin → Admin Console
        
- One “truth” for edits
    
    - Org roles don’t edit raw entries directly.
        
    - They create **adjustments** with reason codes + audit trail.
        
- Drill-down stays shallow
    
    - Dashboard → project/team → entry list (max 3 clicks).
        

## Phase 2 user journeys (3-step max)

### Leadership

#### 1) Check org health (utilization + trends)

1. Open **Org Dashboard**.
    
2. Filter by **date range** + **department**.
    
3. Click a KPI card (e.g., utilization) → drill into **top drivers** (projects/depts).
    

#### 2) Spot resourcing risk (over/under allocation)

1. Open **Insights**.
    
2. Review **hotspots** (overloaded / underused groups).
    
3. Click a hotspot → open **Portfolio View** for the project set behind it.
    

#### 3) Validate a strategic initiative’s focus

1. Open **Portfolio View**.
    
2. Select initiative/project group.
    
3. Review **time mix** (billable/non-billable, category split) + trend line.
    

---

### Head of Department / Team Lead (HoD)

#### 1) Weekly team compliance (missing time)

1. Open **Team Dashboard**.
    
2. View **missing time** list for the week.
    
3. Click **Nudge** (optional) or open **Team Timesheets** for details.
    

#### 2) Investigate an anomaly (spike or unusual category)

1. Open **Exceptions Queue**.
    
2. Select an exception (spike / uncategorized / unusual billable mix).
    
3. Drill to **entry list** → if needed, create an **Adjustment Request**.
    

#### 3) Approve a correction (if approvals enabled)

1. Open **Adjustment Requests**.
    
2. Review the request (what changed + reason).
    
3. **Approve / Reject** → system logs decision to **Audit Log**.
    

---

### Finance

#### 1) Prepare invoicing inputs (period close)

1. Open **Billing Dashboard**.
    
2. Filter by **client/project** + **period**.
    
3. Export from **Export Center** (uses configured template).
    

#### 2) Reclassify for billing accuracy (audited)

1. Open **Reclassification Workbench**.
    
2. Filter to entries needing attention (e.g., “billable = unknown”).
    
3. Apply **adjustment** with reason code → appears in **Audit Log**.
    

#### 3) Audit what changed (trust + compliance)

1. Open **Audit Log**.
    
2. Filter by **date range** + **changed field** (billable/invoicable/project).
    
3. Drill into a record to see **who/when/why** (and approval, if used).