

## Simplify Context Switching — Role-Driven by User

### A) Where User Context Is Stored Today

- **`src/contexts/UserContext.tsx`**: Holds `currentUser` (state), `appRole` (state + localStorage). These are independent — switching user does NOT change role, and vice versa.
- **`src/types/index.ts`**: `User.role` is a free-text string (e.g. "Senior Consultant", "Programme Manager") — not an app-level role.
- **`src/data/seed.ts`**: Three demo users, all with job-title `role` values — no admin/employee distinction.

### B) Files to Edit (4)

| # | File | Change |
|---|------|--------|
| 1 | `src/types/index.ts` | Add `appRole: 'admin' \| 'employee'` field to `User` interface |
| 2 | `src/data/seed.ts` | Assign `appRole` to each demo user (e.g. Emily = admin, Sarah + James = employee) |
| 3 | `src/contexts/UserContext.tsx` | Derive `appRole` from `currentUser.appRole` instead of separate state. Remove `DEV_MODE`, `setAppRole`, and localStorage persistence. `isAdmin` becomes `currentUser.appRole === 'admin'`. |
| 4 | `src/components/UserSelector.tsx` | Replace view-mode toggle with a user list (always visible). Selecting a user calls `setCurrentUser(user)` and auto-navigates based on `user.appRole`. Show user name + department + role badge in each row. |

### C) Step-by-Step Plan

#### 1. `src/types/index.ts`
- Add `appRole: 'admin' | 'employee'` to the `User` interface.
- Keep the existing `role` field (job title like "Senior Consultant") unchanged.

#### 2. `src/data/seed.ts`
- Add `appRole` to each user:
  - Sarah Mitchell: `appRole: 'employee'`
  - James Chen: `appRole: 'employee'`
  - Emily Thompson: `appRole: 'admin'`

#### 3. `src/contexts/UserContext.tsx`
- Remove `DEV_MODE` export.
- Remove `AppRole` type export (move to types/index.ts or inline).
- Remove `getInitialAppRole()`, `setAppRole`, and `setAppRoleState`.
- Remove localStorage read/write for `appRole`.
- Derive `isAdmin` directly: `currentUser.appRole === 'admin'`.
- `appRole` in context value becomes a getter: `currentUser.appRole`.
- Keep `setCurrentUser` — this is how the dropdown switches context.
- Simplify the context interface: remove `setAppRole`, keep `appRole` as read-only derived value.

#### 4. `src/components/UserSelector.tsx`
- Remove the "View mode" section (Employee/Admin toggle).
- Always show the full user list (no `DEV_MODE` gate).
- Trigger button shows current user name (not "Admin"/"Employee").
- Each dropdown item shows: avatar + name + department + a small badge ("Admin" or "Employee") based on `user.appRole`.
- On click: call `setCurrentUser(user)`, then navigate:
  - If `user.appRole === 'admin'` -> `navigate('/admin')`
  - If `user.appRole === 'employee'` -> `navigate('/')`
- Check mark next to the currently selected user.

**Note**: `TopBar.tsx` already shows an "Admin" badge when `isAdmin` is true — no changes needed there since `isAdmin` will now derive from the selected user.

### D) Test Steps

1. **Default load** — app loads with Sarah (employee), shows employee dashboard at `/`.
2. **Open dropdown** — see all 3 users with role badges. Sarah has a check mark.
3. **Select Emily (admin)** — immediately navigates to `/admin`. Header shows "Admin" badge. Dropdown trigger shows Emily's name.
4. **Open dropdown again** — Emily has check mark. Badge shows "Admin" next to her name.
5. **Select James (employee)** — immediately navigates to `/`. "Admin" badge disappears. Dropdown shows James's name.
6. **Select Emily again** — back to admin dashboard, badge returns.
7. **Refresh page while Emily is selected** — verify the default user is Sarah (employee) on fresh load (no localStorage persistence of role).
8. **Navigate to `/admin` manually as James (employee)** — AdminGuard blocks with "Not authorised".

