---
tags:
  - growthafrica/strategic-projects/time-registration
---


## 30-second elevator pitch

- A simple, low-friction time tracking tool.
- Log work in seconds, not minutes.
- See personal summaries instantly.
- Later: power org-wide dashboards and finance-ready reporting.
    

## Problem and mission

- Problem
    
    - Time entry is repetitive and slow.
        
    - Data quality is inconsistent (missing days, mismatched categories).
        
    - Reporting takes manual cleanup.
        
- Mission
    
    - Make time logging “easy enough to do daily.”
        
    - Make data “structured enough to trust.”
        
    - Make insights “obvious enough to act on.”
        

## Target audience

- Primary
    
    - Employees logging time daily (high-frequency use).
        
- Secondary (Phase 2)
    
    - Team leads / department heads (capacity and contribution).
        
    - Finance (billability, invoicing, profitability inputs).
        
    - Leadership (utilization, allocation, strategic resourcing).
        
- Admins
    
    - Maintain reference data (projects, phases, activities, people).
        

## Core features

### MVP (employee entry + personal summaries)

- Fast time entry
    
    - Table/grid entry (Excel-like) with one row per task.
        
    - Bulk add for a day (add many tasks under the same date).
        
    - Clone/duplicate entry (repeat a similar task with 1 click).
        
    - Smart defaults (keep last-used project, date, billable flag).
        
- Guided, low-thought data capture
    
    - Cascading dropdowns (Project → Phase → Activity/Deliverable).
        
    - Required fields enforced before save.
        
    - Time captured as:
        
        - decimal hours (e.g., 0.25 increments), or
            
        - hours + minutes (converted consistently).
            
- Personal summaries (“My Summary”)
    
    - This week / month totals.
        
    - Billable vs non-billable split.
        
    - Breakdown by project and category.
        
    - “Missing time” indicator (hours logged vs expected).
        
    - “My entries” list with quick edit (within allowed window).
        
- Entry correction rules (MVP-safe)
    
    - Users can edit within a defined window (e.g., last 7 days).
        
    - After window: request a correction (stored as an adjustment, not silent overwrite).
        

### Phase 2 (org dashboards + governance)

- Role-based views
    
    - HoD: team utilization, project focus, compliance.
        
    - Finance: billability, invoicing inputs, profitability proxy.
        
    - Leadership: allocation, trends, hotspots.
        
- Review and reclassification workflow
    
    - Finance/HoD can reclassify “billable/invoicable” via adjustments.
        
    - Full audit trail (who/when/why).
        
- Admin management
    
    - CRUD for reference lists (projects, phases, activities, deliverables).
        
    - Active/inactive toggle (no breaking historical records).
        
    - Bulk import/export of reference data.
        

## High-level tech stack (tool-agnostic)

- UI layer (web-first, mobile-friendly)
    
    - Supports grid entry, bulk add, and fast keyboard navigation.
        
    - Why it fits: reduces friction for daily habit formation.
        
- Workflow layer (business rules + validation)
    
    - Cascading dropdown logic, edit window rules, adjustment logging.
        
    - Why it fits: keeps data consistent and auditable.
        
- Data store (relational-first recommended)
    
    - Structured entities + reliable reporting joins.
        
    - Why it fits: projects/phases/activities are taxonomies; time entries are facts.
        
- Analytics layer (read-optimized)
    
    - Personal summary views first; org dashboards later.
        
    - Why it fits: isolates reporting from operational entry workloads.
        
- Identity and access layer
    
    - SSO or secure login; roles later expanded.
        
    - Why it fits: reduces manual user management and improves security.
        
- Notifications (optional, later)
    
    - Reminders for missing days; nudges for compliance.
        

## Conceptual data model (ERD sketch in words)

- User
    
    - belongs to Department/Team
        
    - has Role (Employee, Admin; later HoD, Finance, Leadership)
        
- Project
    
    - has many Phases (or Categories)
        
- Phase
    
    - belongs to Project
        
    - has many Activities (or Deliverables)
        
- Activity
    
    - belongs to Phase
        
- TimeEntry (fact table)
    
    - belongs to User
        
    - belongs to Project
        
    - belongs to Phase
        
    - belongs to Activity (optional if not needed)
        
    - fields
        
        - Date
            
        - Duration (minutes or decimal hours)
            
        - Billable flag
            
        - Invoicable flag (optional MVP; can be Phase 2)
            
        - Notes / task description
            
        - Metadata (created_at, updated_at)
            
- Adjustment (audit-friendly corrections)
    
    - belongs to TimeEntry
        
    - fields
        
        - changed_field(s)
            
        - old_value / new_value
            
        - reason_code
            
        - changed_by
            
        - changed_at
            
        - approval_required? (later)
            

## UI design principles (Krug-aligned)

- Don’t make me think
    
    - Show only valid next choices (cascading dropdowns).
        
    - Default what users repeat (date, last project).
        
- Three mindless clicks
    
    - Add day → add rows → save (no extra screens required).
        
- Design for scanning
    
    - Spreadsheet layout, fixed column order, minimal modal dialogs.
        
- Forgiving by default
    
    - Undo/adjust instead of silent overwrites.
        
    - Clear validation messages beside the field (not at top of page).
        
- Speed over decoration (for entry screens)
    
    - Keyboard-first navigation.
        
    - Minimal scrolling, sticky headers, compact rows.
        

## Security and compliance notes

- Data minimization
    
    - Store only what’s needed: identity, team, time entries, taxonomy selections.
        
- Access control
    
    - MVP: employees see only their own entries.
        
    - Phase 2: add team/org scopes by role.
        
- Auditability
    
    - Separate Adjustments table for sensitive changes (billable/invoicable, reallocations).
        
- Privacy and retention
    
    - Define retention policy (e.g., keep raw entries X years).
        
    - Provide export for the user’s own data if required by policy.
        
- Operational resilience
    
    - Backups, role-separated admin actions, import validation, rollback on bulk updates.
        

## Phased roadmap

### MVP (Entry + My Summary)

- Entry grid + bulk add + clone
    
- Cascading taxonomy (Project → Phase → Activity)
    
- Personal summary dashboard
    
- “My entries” list + edit window rules
    
- Admin reference data management (minimum viable)
    

### V1 (Org dashboards + trust)

- HoD / Finance / Leadership dashboards
    
- Adjustment workflow + reason codes
    
- Compliance nudges (reminders, missing time alerts)
    
- Export formats for finance and ops (configurable templates)
    

### V2 (Planning + integrations)

- Budgeting and variance (planned vs logged)
    
- Calendar/leave/holidays awareness (expected hours logic)
    
- Deeper integrations (chat notifications, calendar context, SSO hardening)
    
- Alternative entry modes (assistant/wizard, offline capture)
    

## Risks and mitigations

- Low adoption (people don’t log daily)
    
    - Mitigation: bulk add, defaults, reminders, “missing time” feedback loop.
        
- Messy taxonomy (dropdown explosion)
    
    - Mitigation: keep Phase/Activity tight; allow inactive; quarterly cleanup; ownership by admin.
        
- Data mistrust (silent changes, “gaming” billable flags)
    
    - Mitigation: adjustments + reason codes + audit trail.
        
- Reporting confusion (different stakeholders want different truths)
    
    - Mitigation: define KPI glossary early (billable, invoicable, expected hours).
        

## Future expansion ideas

- Timesheet approval cycles (weekly sign-off).
    
- Client-facing rollups (if applicable).
    
- Predictive prompts (“looks like you usually log X on Mondays”).
    
- Automated categorization suggestions (optional AI layer, later).