

## Brick 7: Users CRUD

### Overview

Replace the placeholder Users page with a fully functional admin CRUD interface. The `UserContext` will be enhanced to hold mutable user state (seeded from `seed.ts`, persisted to localStorage), exposing add/update/toggle methods. A new `UsersTable` and `UserDialog` will follow the same patterns as existing reference data CRUDs.

### Files (4 files)

| # | File | Action | Description |
|---|---|---|---|
| 1 | `src/contexts/UserContext.tsx` | EDIT | Add mutable `allUsersList` state with localStorage persistence (seeded from `seed.ts`). Add `addUser`, `updateUser`, `toggleUserActive` methods. Update `allUsers` to derive from mutable state. Update `loadUserFromStorage` to read from mutable list. |
| 2 | `src/components/admin/UsersTable.tsx` | NEW | Renders `AdminCrudTable<User>` with columns: Name, Email, Department, Role, App Role, Weekly Hours. Wires toggle/edit/add callbacks. Department shown as resolved name via lookup. |
| 3 | `src/components/admin/UserDialog.tsx` | NEW | Add/Edit dialog with fields: Name (Input), Email (Input), Department (Select), Role (Input), App Role (Select: admin/employee), Weekly Expected Hours (number Input). |
| 4 | `src/pages/admin/AdminUsers.tsx` | EDIT | Replace placeholder card with `UsersTable` component. |

### Context Changes (UserContext.tsx)

New localStorage key: `timetrack_users`

```text
State:
  allUsersList: User[]  — seeded from seed.ts users, persisted to localStorage

Methods:
  addUser(data: Omit<User, 'id'>): void
    - ID: 'user-' + Date.now()
    - Persists to localStorage

  updateUser(id: string, updates: Partial<Omit<User, 'id'>>): void
    - Merges updates, persists

  toggleUserActive(id: string): void
    - Flips isActive, persists
    - If deactivating the currently signed-in user, signs them out

Derived:
  allUsers → allUsersList.filter(u => u.isActive)  (for sign-in screen)
  loadUserFromStorage → searches allUsersList instead of static seed
```

### UsersTable Columns

| Column | Source | Notes |
|---|---|---|
| Name | `user.name` | Plain text |
| Email | `user.email` | Plain text |
| Department | `user.departmentId` | Resolved to department name via ReferenceDataContext |
| Role | `user.role` | Plain text |
| App Role | `user.appRole` | Badge: "Admin" or "Employee" |
| Weekly Hours | `user.weeklyExpectedHours` | Number |

Search filters on Name and Email.

### UserDialog Fields

| Field | Type | Validation |
|---|---|---|
| Name | Input (text) | Required |
| Email | Input (email) | Required |
| Department | Select | Required, populated from active departments |
| Role | Input (text) | Required (e.g. "Associate", "Finance Officer") |
| App Role | Select | Required, options: Admin / Employee |
| Weekly Expected Hours | Input (number) | Required, default 40 |

### Safety Considerations

- Cannot deactivate own account (button disabled or hidden for current user)
- Deactivating a user who is currently signed in elsewhere has no real-time effect (localStorage-based, no sessions to invalidate)
- Inactive users are excluded from the sign-in picker but their historical time entries remain intact

### What Does NOT Change

- `seed.ts` (remains the initial seed source)
- `ReferenceDataContext` (departments already available there)
- `TimeEntriesContext` (entries reference userId; no cascading deletes)
- `SignIn.tsx` (already reads `allUsers` which will now come from mutable state)
- Routing, AdminGuard, SessionGate

### Test Plan

| # | Test | Expected |
|---|---|---|
| 1 | Navigate to `/admin/users` | See table with all 26 users, inactive ones greyed out |
| 2 | Click "Add User", fill in all fields, save | New user row appears in table |
| 3 | Edit user "Brian Muvea", change role to "Senior Associate" | Role updates in table |
| 4 | Toggle "Duncan Asila" to active | User now appears on sign-in screen |
| 5 | Toggle an active user to inactive | Row greys out; user disappears from sign-in picker |
| 6 | Attempt to deactivate own account | Action is prevented (button disabled) |
| 7 | Change a user's department | Department column updates with new department name |
| 8 | Change a user's appRole from Employee to Admin | Badge updates; user gains admin nav on next sign-in |
| 9 | Refresh page | All changes persist (localStorage) |

