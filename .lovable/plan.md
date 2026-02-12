

## Admin Context Switch — Plan

### A) Approach

Extend the existing `UserContext` to include an `appRole` state (`'employee' | 'admin'`) persisted in `localStorage`. No new context/provider needed — this keeps the diff minimal and follows existing patterns. The `User.role` field (e.g. "Senior Consultant") remains untouched; `appRole` is a separate concept for access gating.

### B) Files to Touch (5)

1. **`src/contexts/UserContext.tsx`** — add `appRole` state + localStorage persistence
2. **`src/components/UserSelector.tsx`** — add role toggle (Employee / Admin) below the user list
3. **`src/App.tsx`** — add `/admin/*` route with guard
4. **`src/pages/AdminDashboard.tsx`** *(new)* — placeholder admin page
5. **`src/components/TopBar.tsx`** — conditionally show "Admin" nav link

### C) Detailed Changes

#### 1. `src/contexts/UserContext.tsx`
- Add `appRole: 'employee' | 'admin'` to context type.
- Initialize from `localStorage.getItem('appRole') || 'employee'`.
- Add `setAppRole` that writes to both state and localStorage.
- Add `isAdmin` derived boolean for convenience.
- Export new type: `type AppRole = 'employee' | 'admin'`.

#### 2. `src/components/UserSelector.tsx`
- Below the user list in the dropdown, add a `DropdownMenuSeparator` and a toggle section.
- Two `DropdownMenuItem` items: "Employee" and "Admin", with a check icon on the active one.
- Calls `setAppRole(...)` on click.
- Label: "Dev context" in muted text above the options.

#### 3. `src/App.tsx`
- Import a simple `AdminGuard` wrapper (inline component, not a separate file).
- `AdminGuard`: reads `isAdmin` from context; if false, renders a centered "Not authorized" message with a link back to `/`. If true, renders `<Outlet />` or the child.
- Add route: `<Route path="/admin" element={<AdminGuard />}> <Route index element={<AdminDashboard />} /> </Route>`

#### 4. `src/pages/AdminDashboard.tsx` *(new)*
- Minimal placeholder: TopBar + heading "Admin Dashboard" + "Coming soon" text.
- Uses existing layout patterns (container, spacing).

#### 5. `src/components/TopBar.tsx`
- Import `useCurrentUser` and read `isAdmin`.
- If admin, render a `NavLink` or simple link to `/admin` between the logo and user selector, labeled "Admin".
- Uses existing `Button` variant="ghost" styling.

### D) Route Guard Approach

- **Guard component** defined inline in `App.tsx` (no extra file).
- Uses `useCurrentUser().isAdmin`.
- Non-admin hitting `/admin` sees a static "Not authorized" message (no redirect, to keep it simple).
- Nav link to `/admin` is conditionally rendered only when `isAdmin === true`.

### E) Test Steps

1. Load app — default role is "Employee", no "Admin" link visible in header.
2. Open user dropdown — see "Dev context" section with Employee (checked) and Admin.
3. Click "Admin" — dropdown closes, "Admin" link appears in header.
4. Refresh page — role persists as admin (localStorage).
5. Click "Admin" link in header — navigates to `/admin`, shows placeholder dashboard.
6. Open user dropdown, switch back to "Employee".
7. "Admin" link disappears from header.
8. Navigate directly to `/admin` via URL bar — see "Not authorized" message.
9. Switch to Admin again — `/admin` becomes accessible.
10. Switch user (e.g. Sarah to James) — appRole remains unchanged (role is independent of user).

