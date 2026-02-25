

## Brick 9: CSV Export

### Overview

Replace the Export tab placeholder with a functional CSV export for time entries. The admin selects a date range and optionally filters by user(s), then downloads a CSV file with all entry details resolved to human-readable names.

### Files (2 files)

| # | File | Action | Description |
|---|---|---|---|
| 1 | `src/components/admin/ExportPanel.tsx` | NEW | Filter UI (date range picker, user multi-select) + export button. Builds CSV in-browser and triggers download. |
| 2 | `src/pages/admin/AdminImportExport.tsx` | EDIT | Replace Export tab placeholder with `ExportPanel`. |

### ExportPanel Design

**Filters (top section)**

| Filter | Component | Default |
|---|---|---|
| Start Date | `<Input type="date" />` | First day of current month |
| End Date | `<Input type="date" />` | Today |
| Users | Multi-select checkboxes in a Popover | All users selected |

**Export Button**: "Download CSV" -- disabled when no entries match filters.

**CSV Generation Logic** (all in-browser, no backend):

1. Read `getAllEntries()` from `TimeEntriesContext`
2. Filter by date range and selected user IDs
3. For each entry, resolve IDs to names using `ReferenceDataContext` lookups (user name, department, project name, phase, activity type, work area)
4. Build CSV string with headers and rows
5. Create a `Blob`, generate object URL, trigger download via a temporary `<a>` element

### CSV Columns

| Column | Source |
|---|---|
| Date | `entry.date` |
| User | Resolved from `userId` |
| Department | Resolved from user's `departmentId` |
| Workstream | Resolved from `projectId` (project name) |
| Workstream Type | Project's `type` ("External" / "Internal") |
| Phase | Resolved from `phaseId` or work area's phase |
| Activity Type | Resolved from `activityTypeId` or `workAreaActivityTypeId` |
| Task Description | `entry.taskDescription` |
| Deliverable Type | `entry.deliverableType` label |
| Deliverable Description | `entry.deliverableDescription` or empty |
| Hours | Decimal format: `(hours * 60 + minutes) / 60` rounded to 2 decimals |
| Billable Status | Label from `getBillableLabel()` |
| Comments | `entry.comments` or empty |

### Implementation Details

- CSV values are escaped: double-quotes in content are doubled, values containing commas or newlines are wrapped in quotes
- Filename format: `time-entries-YYYY-MM-DD-to-YYYY-MM-DD.csv`
- Uses existing `useTimeEntries().getAllEntries()` and `useReferenceData()` for all data -- no new context methods needed
- User list sourced from `useAuthenticatedUser().allUsers` (includes inactive for completeness of historical data -- actually will use the full `allUsersList` if available, otherwise `allUsers`)

### What Does NOT Change

- TimeEntriesContext, ReferenceDataContext, UserContext (read-only usage)
- Import tab (remains placeholder)
- Types, seed data, routing

### Test Plan

| # | Test | Expected |
|---|---|---|
| 1 | Navigate to `/admin/import-export`, Export tab | See date range inputs, user filter, and Download button |
| 2 | Click "Download CSV" with defaults | CSV downloads with current month entries, all users |
| 3 | Narrow date range to a single day | CSV contains only that day's entries |
| 4 | Deselect all users except one | CSV contains only that user's entries |
| 5 | Open CSV in Excel/Sheets | Columns are correct, names resolved, no raw IDs visible |
| 6 | Entry with commas in task description | Value is properly quoted in CSV |

