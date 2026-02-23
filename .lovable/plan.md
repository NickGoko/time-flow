

## Replace Demo Users with Real Team Members

### Overview

Replace the 18 hardcoded demo users with 26 real team members from the uploaded CSV. All seed time entries will be cleared. No Supabase Auth is used -- the "switch user" sign-in page remains unchanged.

### Data Mapping

**CSV to User object mapping:**

| CSV Column | User Property | Mapping Logic |
|---|---|---|
| Display Name | `name` | Direct |
| Email | `email` | Direct |
| Role (job title) | `role` | Direct |
| Department | `departmentId` | See department map below |
| (derived) | `appRole` | `'admin'` for Ian Lorenzen, Johnni Kjelsgaard, Patricia Jumi; `'employee'` for all others |
| (derived) | `isActive` | `false` for Duncan Asila and Maureen Wachira; `true` for all others |
| (derived) | `id` | Email prefix slug, e.g. `'user-anm'` from `anm@growthafrica.com` |
| (default) | `weeklyExpectedHours` | 40 |

**Department mapping:**

| CSV Department | Maps to departmentId |
|---|---|
| Impact | `dept-consulting` (Project Delivery / Impact) |
| Finance & Admin | `dept-finance` |
| Communications | `dept-comms` |
| Business Development | `dept-bd` |
| Productivity & IT | `dept-it` |
| HR | `dept-hr` |
| Admin (leadership) | `dept-operations` |

### Files to Edit (4 files)

| # | File | What Changes |
|---|---|---|
| 1 | `src/types/index.ts` | Add `isActive: boolean` to the `User` interface |
| 2 | `src/data/seed.ts` | Replace 18 demo users with 26 real users. Empty the `generateTimeEntries()` and `generateWeekStatuses()` functions to return `[]`. |
| 3 | `src/contexts/UserContext.tsx` | Filter `allUsers` to only include `isActive === true` users |
| 4 | `src/pages/SignIn.tsx` | Change fallback text from empty `departmentId` to `"Unassigned"` |

### Step-by-Step Plan

**Step 1: Add `isActive` to User type** (src/types/index.ts)
- Add `isActive: boolean` after `weeklyExpectedHours` in the `User` interface

**Step 2: Replace users and clear entries** (src/data/seed.ts)
- Replace the `users` array with 26 real team members using the mapping above
- Simplify `generateTimeEntries()` to `return []`
- Simplify `generateWeekStatuses()` to `return []`

The 26 users will be (sorted by department):

```text
Operations (Admin dept):
  Ian Lorenzen      - Executive Director & Partner     (admin)
  Johnni Kjelsgaard - Founder & Executive Chairman     (admin)
  Patricia Jumi     - Managing Director                (admin)

Impact (dept-consulting):
  Brian Muvea, Duncan Asila (INACTIVE), Eugene Eluerkeh,
  Hilda Mugambi, Ida Sarup Kjelsgaard, Jesse Baddoo,
  Linda Mathenge, Maureen Wachira (INACTIVE), Meselu Andargie,
  Michael Otoo, Modechai Nyerere, Mohammed Sultan,
  Patrick Mulumba, Richard Wiafe

Finance & Admin:
  Alex Njoroge, Connie Nekesa

Communications:
  Edward Angyinaa, Joyce Nyoro, Sheila Gacheru, Trudy Natabona

Business Development:
  Michelle Murugi

Productivity & IT:
  Nicholas Goko

HR:
  Winnie Teresia
```

**Step 3: Filter active users in context** (src/contexts/UserContext.tsx)
- Change `allUsers: users` to `allUsers: users.filter(u => u.isActive)`

**Step 4: Fix "Unassigned" fallback** (src/pages/SignIn.tsx)
- Change line 56 fallback from `?? user.departmentId` to `?? 'Unassigned'`
- (All users currently have departments, but this protects against future blanks)

### What Does NOT Change

- Sign-in page layout and UX (no redesign)
- TopBar, UserSelector components
- TimeEntriesContext logic (ownership, scoping)
- Route guards (SessionGate, AdminGuard)
- Project/phase/activity type seed data
- Admin user management UI (deferred to future milestone)

### Test Plan

| # | Test | Expected |
|---|---|---|
| 1 | Open `/sign-in` | Shows 24 active users (not Duncan Asila or Maureen Wachira) |
| 2 | Verify department labels | Each user card shows correct department name |
| 3 | Verify role badges | Ian, Johnni, Patricia show "Admin" badge; others show "Employee" |
| 4 | Sign in as Ian Lorenzen | Lands on `/admin/reports/overview`, TopBar shows "Admin" badge |
| 5 | Sign in as Brian Muvea | Lands on `/`, sees empty timesheet (no seed entries) |
| 6 | Session persistence | Refresh page -- stays signed in with correct user |
| 7 | Sign out and switch | Sign out, pick different user -- no data bleed |
| 8 | localStorage | Key `timetrack_current_user_id` stores new user IDs (e.g. `user-bmu`) |
| 9 | Old user IDs | If localStorage has stale `user-1`, app redirects to `/sign-in` (user not found) |

