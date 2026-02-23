

## Milestone 2: Demo Sign-in/Session + Access Control

### A) Current State Audit

**Where "current user" is stored:**
- `UserContext` (`src/contexts/UserContext.tsx`) holds a `useState<User>(users[0])` -- purely in-memory React state, no localStorage, no persistence. Refreshing the page resets to `users[0]` (Sarah Chen, employee).
- The `UserSelector` component in the TopBar lets any visitor pick any user from the full seed list -- no authentication gate.

**Admin-only routes:**
- `/admin` and `/admin/reports/overview` are wrapped in `AdminGuard` (inside `App.tsx`), which checks `isAdmin` from `UserContext`. Non-admin users see a "Not authorised" message with a link back to `/`.

**Data reads/writes:**
- All time-entry CRUD flows through `TimeEntriesContext` (`addEntry`, `updateEntry`, `deleteEntry`, `submitWeek`). The `userId` is passed explicitly by the calling component (always `currentUser.id` from `UserContext`).
- No server calls -- everything is in-memory arrays seeded from `src/data/seed.ts`.

**Gaps to close:**
1. Session does not persist across page refresh.
2. No sign-in screen -- user picker is open to everyone.
3. `addEntry` trusts whatever `userId` the caller passes; no server-side (or context-level) enforcement.
4. Employee users can manually navigate to `/me/insights` for any user (though it currently only shows their own data).
5. TopBar nav links (e.g., "History and Insights") are visible to all roles even when not relevant.

---

### B) Proposed File List (6 files)

| # | File | Change |
|---|------|--------|
| 1 | `src/contexts/UserContext.tsx` | Persist selected user ID to `localStorage`; restore on mount; expose a `signOut` helper that clears storage and resets to sign-in state |
| 2 | `src/App.tsx` | Add a `/sign-in` route; wrap all authenticated routes in a `<SessionGate>` that redirects to `/sign-in` when no user is selected |
| 3 | `src/pages/SignIn.tsx` | **New file** -- simple card listing all demo users as clickable tiles; selecting one sets context + navigates to `/` or `/admin` |
| 4 | `src/components/UserSelector.tsx` | Replace full user-switch dropdown with current-user display + "Sign out" button (remove ability to switch without going through sign-in) |
| 5 | `src/components/TopBar.tsx` | Conditionally show admin nav links only for admins; show employee nav links only for employees |
| 6 | `src/contexts/TimeEntriesContext.tsx` | Enforce `userId === currentUser.id` inside `addEntry` and `updateEntry` at the context level (ignore or throw if mismatched) |

---

### C) Step Plan (4 slices)

#### Slice 1 -- Persistent session in UserContext

**What:** Make the selected user survive a page refresh.

- Store `currentUser.id` in `localStorage` under key `timetrack_current_user_id`.
- On mount, read from `localStorage`, find the matching user in the seed array, and initialise state with that user (fall back to `null` if not found).
- Expose `currentUser: User | null` (nullable when signed out).
- Add `signOut()` that clears localStorage and sets `currentUser` to `null`.
- Keep `setCurrentUser` but have it also write to localStorage.

**Test:**
1. Select a user, refresh the page -- same user is restored.
2. Call `signOut` -- localStorage is cleared, `currentUser` becomes null.

#### Slice 2 -- Sign-in page + SessionGate

**What:** Gate all app routes behind a session check.

- Create `src/pages/SignIn.tsx`: a simple card grid showing each demo user as a tile (avatar, name, role badge). Clicking a tile calls `setCurrentUser` and navigates to `/` (employee) or `/admin` (admin).
- In `App.tsx`, add a `<SessionGate>` wrapper component that checks `currentUser !== null`. If null, redirect to `/sign-in`. The `/sign-in` route itself is outside the gate.
- `AdminGuard` stays as-is (nested inside SessionGate).

**Test:**
1. Clear localStorage, load `/` -- redirected to `/sign-in`.
2. Pick an employee -- lands on `/`.
3. Pick an admin -- lands on `/admin`.
4. Manually navigate to `/admin` as employee -- see "Not authorised".

#### Slice 3 -- TopBar + UserSelector updates

**What:** Remove the open user-switcher; show role-appropriate nav.

- `UserSelector`: show current user avatar + name + a "Sign out" button. No dropdown of other users. Signing out calls `signOut()` and navigates to `/sign-in`.
- `TopBar`: show "Admin Dashboard" link only when `isAdmin`. Show "History and Insights" link only for employees. Always show app logo linking to `/` (employees) or `/admin` (admins).

**Test:**
1. As employee, TopBar shows "History and Insights" but not "Admin Dashboard".
2. As admin, TopBar shows "Admin Dashboard" link.
3. Click "Sign out" -- redirected to `/sign-in`, localStorage cleared.

#### Slice 4 -- Data-layer userId enforcement

**What:** Prevent accidental userId mismatch at the context boundary.

- In `TimeEntriesContext`, accept the current user ID as a prop or read it from `UserContext` directly (nest TimeEntriesProvider inside UserProvider, which is already the case).
- `addEntry`: assert `entry.userId === currentUser.id`; if mismatch, throw an error (dev safeguard).
- `updateEntry`: verify the entry being updated belongs to `currentUser.id`.
- `deleteEntry`: same ownership check.
- `submitWeek`: same ownership check.

**Test:**
1. Normal entry creation works (userId matches).
2. Manually calling `addEntry` with a different userId logs an error / is rejected.
3. Editing or deleting another user's entry is blocked.

---

### D) Reversibility Notes

All changes are designed to be replaced by Supabase Auth later:
- `localStorage` session will be replaced by Supabase session tokens.
- `SignIn.tsx` will be replaced by a real login form.
- `SessionGate` will check `supabase.auth.getUser()` instead of context.
- userId enforcement in context will move to RLS policies.
- No schema, type, or data-model changes are needed for this milestone.
