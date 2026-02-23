

## Milestone 2 — QA Checklist and Manual Test Script

### QA Checklist

| # | Area | Check | Pass? |
|---|------|-------|-------|
| 1 | Session persistence | Signing in stores session in localStorage | |
| 2 | Session persistence | Refreshing the page keeps the user signed in on the same route | |
| 3 | Session persistence | Signing out clears localStorage and redirects to /sign-in | |
| 4 | User switch | Signing out then selecting a different user loads that user's data only | |
| 5 | User switch | No entries from the previous user bleed into the new session | |
| 6 | Employee routing | Employee sign-in lands on / (timesheet page) | |
| 7 | Employee routing | Employee sees "History and Insights" nav link (no Dashboard/Reports) | |
| 8 | Employee routing | Employee can navigate to /me/insights | |
| 9 | Admin routing | Admin sign-in lands on /admin/reports/overview | |
| 10 | Admin routing | Admin sees "Dashboard" and "Reports" nav links (no History and Insights) | |
| 11 | Admin routing | Admin TopBar logo links to /admin/reports/overview | |
| 12 | Route protection | Employee visiting /admin shows "Not authorised" page | |
| 13 | Route protection | Employee visiting /admin/reports/overview shows "Not authorised" page | |
| 14 | Route protection | Unauthenticated visitor on / redirects to /sign-in | |
| 15 | Data isolation | Employee time entry form only shows own entries | |
| 16 | Data isolation | Employee cannot create an entry for another userId (assertOwnership blocks) | |
| 17 | Data isolation | Employee cannot update an entry belonging to another user | |
| 18 | Data isolation | Employee cannot delete an entry belonging to another user | |
| 19 | Data isolation | Employee dropdowns only show active workstreams/projects | |
| 20 | Admin data access | Admin reports page aggregates entries from all users | |
| 21 | Admin data access | Admin dashboard shows team-wide metrics | |
| 22 | Admin data access | No console warnings when admin calls getAllEntries() | |
| 23 | Reference data | No CRUD UI exists for projects/phases/activity types for any role | |

---

### Manual Test Script

**Prerequisites**: Open the app in a browser. Clear localStorage (DevTools > Application > Local Storage > Clear All) before starting.

---

**Test 1 — Unauthenticated redirect**

1. Navigate to `/`
2. Expected: Redirected to `/sign-in`
3. Navigate to `/admin`
4. Expected: Redirected to `/sign-in`

---

**Test 2 — Employee sign-in and landing**

1. On `/sign-in`, click **Sarah Chen** (Employee)
2. Expected: URL is `/`, TopBar shows "Sarah Chen", nav shows only "History and Insights"
3. Click "History and Insights"
4. Expected: URL is `/me/insights`, page renders without errors

---

**Test 3 — Employee route protection**

1. While signed in as Sarah Chen, manually type `/admin` in the address bar and press Enter
2. Expected: "Not authorised" page with a "Back to home" link
3. Manually type `/admin/reports/overview` and press Enter
4. Expected: Same "Not authorised" page

---

**Test 4 — Session persistence**

1. While signed in as Sarah Chen on `/`, press F5 (hard refresh)
2. Expected: Still on `/`, still signed in as Sarah Chen
3. Open DevTools > Application > Local Storage
4. Expected: Key `timetrack_current_user_id` exists with Sarah's user ID

---

**Test 5 — Sign out**

1. Click "Sign out" in the TopBar
2. Expected: Redirected to `/sign-in`, localStorage key is removed
3. Navigate to `/`
4. Expected: Redirected back to `/sign-in`

---

**Test 6 — Admin sign-in and landing**

1. On `/sign-in`, click **James Odhiambo** (Admin)
2. Expected: URL is `/admin/reports/overview`, TopBar shows "Admin" badge, nav shows "Dashboard" and "Reports"
3. Click the TimeTrack logo
4. Expected: Navigates to `/admin/reports/overview`
5. Click "Dashboard"
6. Expected: URL is `/admin`, dashboard renders with team metrics

---

**Test 7 — Admin data visibility**

1. While signed in as James Odhiambo, on `/admin/reports/overview`
2. Expected: Reports table/charts show data from multiple users (not just James)
3. Open browser console
4. Expected: No `[TimeEntries] getAllEntries called by non-admin user` warnings

---

**Test 8 — User switch and data separation**

1. Sign out from James Odhiambo
2. Sign in as **Sarah Chen**
3. Create a new time entry on today's date (e.g. 2h on any project)
4. Note the entry appears in Sarah's view
5. Sign out, sign in as **Priya Sharma** (another employee)
6. Expected: Sarah's newly created entry is NOT visible in Priya's timesheet
7. Priya sees only her own entries

---

**Test 9 — Mutation ownership enforcement**

1. Sign in as Sarah Chen
2. Open browser DevTools console
3. Observe that `getOwnEntries()` is used (no other user data in component state)
4. If you were to programmatically call context mutation functions with a different userId, the console should log: `[TimeEntries] addEntry blocked: userId "..." does not match current user "..."`

---

**Test 10 — Active-only reference data**

1. Sign in as any employee
2. Open the time entry form
3. Expected: Project/workstream dropdowns are populated with items (all seed data is currently active)
4. No inactive or archived items appear

---

**Test 11 — No reference data management UI**

1. Sign in as any employee — confirm no "Manage", "Edit", or "Delete" buttons for projects or activity types
2. Sign out, sign in as admin — confirm the same (admin CRUD screens are not yet built)

