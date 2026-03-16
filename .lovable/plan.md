

# Slice 5: Tiny-Cohort Auth Pilot — Combined Plan + Readiness Audit

## 1) Current State of Slice 5 Touchpoints

### Target accounts

| Field | ngo@growthafrica.com (operating) | it@growthafrica.com (break-glass) |
|---|---|---|
| profiles.id | `cca0759d-ebc9-4fa5-9fd0-e61e51c2ef65` | `d42a2ddb-05a4-4051-bbfe-8614e6da4d21` |
| auth_user_id | `cca0759d-...` (same as id) | `d42a2ddb-...` (same as id) |
| auth.users.id | `cca0759d-...` | `d42a2ddb-...` |
| email_confirmed | Yes | Yes |
| last_sign_in | 2026-03-13 | 2026-02-26 |
| user_roles.role | **employee** | **admin** |
| Auth linkage | Legacy (id == auth_user_id) | Legacy (id == auth_user_id) |

### Existing flows (verified in code)

- **Invite / provision**: `admin-users` edge function actions `create`, `provision-invite`, `create-with-password` — all functional with paginated auth lookup and correct link types.
- **Reset / re-invite**: `send-reset` action returns `action_link` and `link_type`.
- **Session-to-roster resolution**: `UserContext.fetchUserProfile` maps auth user ID → roster via `auth_user_id` column with legacy fallback (`profiles.id`). Both target accounts work with both paths since their IDs match.
- **Impersonation**: `admin-impersonate` requires JWT + `super_admin` role. Looks up target by `auth_user_id`. Returns clear error if not provisioned.
- **Environment policy**: `AUTH_ENABLED` is currently `false` (APP_ENV defaults to `dev`). Setting `VITE_APP_ENV=prod` or `VITE_AUTH_ENABLED=true` activates auth.

---

## 2) Readiness Blockers

| # | Blocker | Severity | Fix |
|---|---------|----------|-----|
| 1 | **Neither user is `super_admin`**. `it@growthafrica.com` is `admin`, `ngo@growthafrica.com` is `employee`. | Critical | SQL: update `user_roles` for both |
| 2 | **No `super_admin` exists in the system at all** | Critical | Same fix as #1 |
| 3 | Legacy ID pattern (profile.id == auth_user_id) — **not a blocker**. The resolution code handles this via fallback. Both values match so lookups work either way. | Info | No fix needed |

No schema changes needed. No code changes needed. Both auth accounts already exist and are confirmed.

---

## 3) Proposed Minimum Implementation Batch

### Step 1: Role upgrades (SQL migration)
Update both target users to `super_admin`:
```sql
UPDATE public.user_roles SET role = 'super_admin'
WHERE user_id = 'cca0759d-ebc9-4fa5-9fd0-e61e51c2ef65'; -- ngo (operating)

UPDATE public.user_roles SET role = 'super_admin'
WHERE user_id = 'd42a2ddb-05a4-4051-bbfe-8614e6da4d21'; -- it (break-glass)
```

### Step 2: Enable auth
Set environment variable `VITE_AUTH_ENABLED=true` so auth is required while keeping `APP_ENV=dev` (demo selector remains available as safety net during pilot).

### Step 3: Verify sign-in
Both users sign in with their existing credentials. The `UserContext` auth listener fires, resolves roster via `auth_user_id` / legacy fallback, loads roles.

No new files. No code changes. No schema changes.

---

## 4) Exact Files / Systems Involved

| System | What | Change type |
|--------|------|-------------|
| Database | `user_roles` table | SQL migration (2 UPDATE statements) |
| Environment | `VITE_AUTH_ENABLED` | Set to `true` |
| Code | None | No changes |

---

## 5) Verification Checklist

### First-login — operating super-admin (ngo@growthafrica.com)
- [ ] Navigate to app → redirected to `/sign-in`
- [ ] Sign in with email/password → lands on `/admin/reports/overview`
- [ ] `appRole` resolves to `super_admin`
- [ ] Admin menu fully accessible
- [ ] Can view Users page, see auth status badges

### First-login — break-glass super-admin (it@growthafrica.com)
- [ ] Sign in with email/password → lands on admin page
- [ ] `appRole` resolves to `super_admin`
- [ ] Can access all admin functions

### Impersonation
- [ ] From operating super-admin session, impersonate a provisioned user → magic link returned
- [ ] Impersonate an unprovisioned user → clear error "Provision login first"

### Roster drift checks
- [ ] `profiles.id` unchanged for both accounts (query before/after)
- [ ] `profiles.auth_user_id` unchanged
- [ ] `user_roles.user_id` matches `profiles.id` for both
- [ ] `user_department_scope` unchanged (if any entries exist)
- [ ] Time entries still join correctly to `profiles.id`

### Auth boundary checks
- [ ] Demo user selector still visible (APP_ENV=dev)
- [ ] Sign out → redirected to sign-in page
- [ ] No other users affected (still `employee` roles, no auth changes)

---

## 6) Rollback Checklist

1. Revert roles:
```sql
UPDATE public.user_roles SET role = 'employee'
WHERE user_id = 'cca0759d-ebc9-4fa5-9fd0-e61e51c2ef65';
UPDATE public.user_roles SET role = 'admin'
WHERE user_id = 'd42a2ddb-05a4-4051-bbfe-8614e6da4d21';
```
2. Remove `VITE_AUTH_ENABLED` environment variable (reverts to `false`).
3. No code to revert.

---

## 7) Break-Glass Handling Recommendation

**Invite and test both simultaneously.** Rationale:
- Both accounts already have confirmed auth credentials — no new invite is needed.
- The break-glass account (`it@growthafrica.com`) must be verified as working *before* relying on it as a recovery path.
- Testing the break-glass account does not risk routine-use contamination because it has a distinct email and the pilot is limited to two users.
- If the break-glass account is held back untested, it provides false confidence — you cannot trust a recovery path you haven't verified.

