

Time registration and analytics system (v1–v2)

## Introduction

This product replaces an error-prone, Excel-based time tracking process with a low-friction, role-aware system that supports daily logging, transparent review, and data-driven project and finance decisions. The system prioritises speed of entry, behavioural compliance, and auditability, while remaining extensible for analytics and budgeting in later phases.

The initial release focuses on accurate capture and trust. Advanced analytics and budgeting are layered only after adoption is stable.

## Problem statement

The current time tracking approach suffers from:

- High friction and low compliance due to manual Excel entry.
    
- Inconsistent interpretation of billable vs non-billable work.
    
- No safe mechanism for uncertainty, leading to dishonest reporting.
    
- Limited visibility for finance and project leadership.
    
- No reliable audit trail when entries are corrected or reclassified.
    
- Excessive manual effort to produce finance-ready timesheets.
    

This results in poor project costing, weak utilisation insight, and mistrust in the data.

## Goals and objectives

### Primary goals

- Enable time entry in under 30 seconds per record.
    
- Improve daily and weekly compliance without coercion.
    
- Preserve trust through transparent corrections and auditability.
    
- Provide finance with clean, exportable data without manual rework.
    

### Secondary goals

- Enable role-based visibility without creating surveillance pressure.
    
- Establish a foundation for project budgeting and variance analysis.
    
- Allow future alternative interfaces without compromising data integrity.
    

## User stories

### Employees

- As an employee, I want to log time quickly so I am not distracted from my work.
    
- As an employee, I want a “maybe billable” option so I can be honest without fear.
    
- As an employee, I want to see my own history so I can correct mistakes early.
    

### Heads of department

- As a hod, I want to see my team’s time so I can identify patterns and issues.
    
- As a hod, I want to review uncertain entries without rewriting history.
    

### Finance

- As finance, I want clean exports so I can generate invoices and reports easily.
    
- As finance, I want to reclassify time with a clear audit trail.
    

### Leadership and project managers

- As leadership, I want a high-level view of time usage across projects.
    
- As a pm, I want to compare planned vs actual time once tracking stabilises.
    

## Features and micro-features

### 1. Authentication and identity

**Feature:** user identity capture

- Auto-identify user from login.
    
- Employee field locked and non-editable.
    
- Role assignment (employee, hod, finance, admin).
    
- Department association for filtering and visibility.
    

### 2. Time entry (core mvp)

**Feature:** fast time logging

- Date defaults to today.
    
- Backdating allowed up to a configurable limit.
    
- Hours input restricted to 0.25 increments.
    
- No start and end time required in v1.
    

**Micro-features:**

- Required field validation with inline feedback.
    
- Optional notes field with character limit.
    
- “Save and add another” action preserving context.
    
- Duplicate detection warning for same date and task.
    

### 3. Billable status handling

**Feature:** tiered billable classification

- Options: billable, maybe billable, not billable.
    
- “Maybe billable” flagged for later review.
    

**Micro-features:**

- Clear explanatory helper text for each option.
    
- Default selection configurable by department.
    
- Immutable after submission unless adjusted via review.
    

### 4. Project, activity, and task selection

**Feature:** cascading reference data

- Project selection filters available activities.
    
- Activity selection filters available tasks.
    

**Micro-features:**

- Active and inactive states for reference items.
    
- Historical entries retain old labels even if deactivated.
    
- Admin-only management of reference data.
    
- Bulk csv import for maintenance.
    

### 5. My entries view

**Feature:** personal history

- List of user’s own time entries.
    
- Filter by date range and project.
    

**Micro-features:**

- Editable within a defined time window.
    
- Visual indicator for adjusted entries.
    
- Soft warning before edit window expires.
    

### 6. Review and reclassification

**Feature:** review queue for uncertain time

- Queue of “maybe billable” entries for hod or finance.
    

**Micro-features:**

- Reclassification without overwriting original data.
    
- Mandatory reason for reclassification.
    
- Optional approval requirement by role.
    
- Notification to employee when entry is adjusted.
    

### 7. Adjustment log and audit trail

**Feature:** transparent change tracking

- Separate adjustment record for every change.
    

**Micro-features:**

- Capture old value, new value, actor, timestamp, reason.
    
- Read-only audit view for leadership.
    
- Immutable audit records.
    

### 8. Reminders and nudges

**Feature:** compliance automation

- Weekly reminders to users with missing entries.
    

**Micro-features:**

- Targeted reminders only to non-compliant users.
    
- Configurable reminder schedule.
    
- Opt-out only by admin.
    
- No public shaming or ranking.
    

### 9. Finance exports

**Feature:** data export

- Csv export by date range and project.
    

**Micro-features:**

- Column mapping aligned to finance templates.
    
- Totals and subtotals included.
    
- Export preview before download.
    

### 10. Analytics v1

**Feature:** operational dashboards

- Compliance rate over time.
    
- Hours by project and department.
    
- Billable vs non-billable mix.
    

**Micro-features:**

- Role-based access to dashboards.
    
- Date and project filters.
    
- Exportable summary views.
    

### 11. Phase 2: budgeting and variance

**Feature:** planned vs actual comparison

- Planned hours input per task or project.
    

**Micro-features:**

- Variance calculation and thresholds.
    
- Visual indicators for overruns.
    
- Drill-down from project to task.
    

## Technical requirements

- Front end: low-code or vibe-code tool (e.g. Lovable).
    
- Data storage: structured relational schema with immutable audit records.
    
- Role-based access control enforced server-side.
    
- Csv import and export support.
    
- Mobile-friendly ux from day one.
    
- Extensible api for future interfaces.
    

## Benefits

- Reduced reporting friction and higher compliance.
    
- More honest time classification through safe uncertainty.
    
- Cleaner finance data with less manual correction.
    
- Improved trust through transparent adjustments.
    
- Strong foundation for project costing and forecasting.
    

## KPIs

- Average time to log an entry.
    
- Weekly compliance rate.
    
- Percentage of “maybe billable” entries over time.
    
- Number of manual finance corrections required.
    
- Adoption rate across departments.
    

## Development risks

- Poor identity integration leading to data duplication.
    
- Over-engineering analytics before behavioural adoption.
    
- Silent edits eroding trust if audit rules are bypassed.
    
- Cultural resistance if dashboards feel punitive.
    

## Conclusion

This product should be built thin, honest, and fast. Accuracy and trust matter more than sophistication in early releases. Once daily logging becomes habitual, analytics and budgeting features can be layered with confidence. The system succeeds only if it feels easier than not logging time at all.

---

