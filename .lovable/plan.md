

## Simplify Context Switcher — Plan

### Current State

- **Role storage**: `appRole` lives in `UserContext` (state + localStorage). File: `src/contexts/UserContext.tsx`.
- **Dropdown** (`UserSelector.tsx`): Shows 3 sample users (Sarah/James/Emily) AND a separate "Dev context" toggle (Employee/Admin). Two separate concepts in one dropdown.
- **TopBar** (`TopBar.tsx`): Shows an "Admin" link when role is admin, requiring a second click to reach admin pages.
- **Problem**: Switching to Admin requires two actions (select Admin role, then click Admin link). Sample users clutter the dropdown for non-dev use.

### Files to Touch (3)

| # | File | Change |
|---|------|--------|
| 1 | `src/components/UserSelector.tsx` | Rewrite dropdown: hide sample users by default (behind `DEV_MODE` flag), show only "View mode" toggle, auto-navigate on role switch |
| 2 | `src/components/TopBar.tsx` | Show an "Admin" pill/badge next to the logo when in admin mode; remove the separate "Admin" nav button |
| 3 | `src/contexts/UserContext.tsx` | Add a `DEV_MODE` constant (default `false`) that controls whether sample user switching is exposed |

### Step-by-Step

#### 1. `src/contexts/UserContext.tsx`
- Add `export const DEV_MODE = false;` at the top.
- No other changes to the context logic — `appRole`, `setAppRole`, `currentUser`, `setCurrentUser` all remain.

#### 2. `src/components/UserSelector.tsx`
- Import `useNavigate` from `react-router-dom` and `DEV_MODE` from the context.
- **Trigger button**: Show current mode label ("Employee" or "Admin") instead of the user name. When in admin mode, use a distinct style (e.g. primary background pill).
- **Dropdown contents**:
  - **When `DEV_MODE` is `false`**: Only show the two view-mode options (Employee / Admin) with check marks. No sample users.
  - **When `DEV_MODE` is `true`**: Show a "Dev: switch user" section with the sample users list below a separator.
- **Auto-navigate on role switch**:
  - Clicking "Admin" calls `setAppRole('admin')` then `navigate('/admin')`.
  - Clicking "Employee" calls `setAppRole('employee')` then `navigate('/')`.
  - This delivers the one-click requirement: select Admin and land on the admin dashboard immediately.

#### 3. `src/components/TopBar.tsx`
- Remove the conditional "Admin" `Button`/`Link` (no longer needed — switching mode already navigates).
- When `isAdmin` is true, render a small "Admin" badge/pill next to the logo text (using `Badge` component or a styled `span` with `bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded`).
- This makes the current mode visible at a glance without requiring an extra navigation click.

### How It Works After Changes

1. User opens the header dropdown — sees two options: **Employee** (checked) and **Admin**.
2. Clicks **Admin** — app switches to admin mode, navigates to `/admin`, header shows an "Admin" pill.
3. Opens dropdown again, clicks **Employee** — app switches back, navigates to `/`, pill disappears.
4. If a developer sets `DEV_MODE = true` in the context file, the sample users (Sarah/James/Emily) reappear in the dropdown for testing.

### Test Steps

1. **Default load** — dropdown shows only Employee (checked) and Admin. No sample users visible.
2. **Click Admin** — immediately navigates to `/admin` (or `/admin/reports/overview`). Header shows "Admin" pill.
3. **Click Employee** — immediately navigates to `/`. "Admin" pill disappears.
4. **Refresh in admin mode** — role persists via localStorage, admin pages remain accessible.
5. **Direct URL `/admin` as Employee** — still shows "Not authorised" (AdminGuard unchanged).
6. **DEV_MODE test** — set `DEV_MODE = true` in context file, reload. Sample users appear in dropdown below a separator. Switching user works as before.

