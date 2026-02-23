

## Milestone 2.3: Route and Navigation Gating

### Current State (already implemented)

| Requirement | Status | Where |
|---|---|---|
| Admin routes require `role === 'admin'` | Done | `AdminGuard` in `App.tsx` lines 23-37 |
| Employee sees "Not authorised" on `/admin/*` | Done | `AdminGuard` renders block page with back link |
| Admin nav items visible only to admins | Done | `TopBar.tsx` lines 31-35 conditionally render Dashboard/Reports |
| Employee nav excludes admin items | Done | `TopBar.tsx` line 37 shows only "History and Insights" |

### One remaining gap

The sign-in page routes admins to `/admin` (the placeholder dashboard). The requirement says admins should land on `/admin/reports/overview`.

### Proposed changes (2 files, 2 lines)

**File 1: `src/pages/SignIn.tsx`**
- Line 19: change `'/admin'` to `'/admin/reports/overview'` in `handleSelect` so admin users land directly on the reports page after sign-in.

**File 2: `src/components/TopBar.tsx`**
- Line 10: change `homePath` from `'/admin'` to `'/admin/reports/overview'` so the logo click takes admins to reports instead of the placeholder dashboard.

### Test steps

1. Clear localStorage, open the app -- redirected to `/sign-in`.
2. Pick an **employee** (e.g. Sarah Chen) -- lands on `/` (time entry page). TopBar shows only "History and Insights".
3. Manually type `/admin` in the URL bar -- see "Not authorised" page.
4. Sign out, pick an **admin** (e.g. James Odhiambo) -- lands on `/admin/reports/overview`. TopBar shows "Dashboard" and "Reports".
5. Refresh the page -- session persists, still on admin reports.

