

# Slice 3 Plan: Invite-first Provisioning + Linking Hardening

## A) Preflight Assessment

### What exists and works
- `admin-users` returns `action_link` and `supabase_ref` for `create`, `provision-invite`, `bulk-provision` -- PASS
- UI shows Copy link modal when `action_link` is returned -- PASS
- Auth Status badges ("Provisioned" / "Not provisioned") based on `authUserId` -- PASS
- Toast errors on failure -- PASS
- `resolveCallerId` maps JWT auth ID → roster ID via `auth_user_id` with legacy fallback -- PASS

### Gaps found (require fixes)
1. **No pagination on `listUsers()`** — all actions use `adminClient.auth.admin.listUsers()` which returns max 1000 users by default. Will fail silently for larger deployments.
2. **Always generates `invite` link** — `generateInviteLink` always tries `type: 'invite'` then falls back to `type: 'magiclink'`. For existing auth users, a `recovery` link is more appropriate (lets user set/reset password). No `link_type` returned.
3. **`send-reset` doesn't return `action_link`** — generates the recovery link but discards it, returning only `{ success: true }`.
4. **`admin-impersonate` uses `callerId` directly** — doesn't map JWT auth ID → roster ID, so role check fails for linked users. Also looks up target by email instead of using `auth_user_id`.
5. **No backfill** — existing profiles with matching auth emails but NULL `auth_user_id` remain unlinked.
6. **UI doesn't distinguish invite vs recovery links** in the modal title.

### No Brick 3.0 needed
All preflight items (action_link, supabase_ref, modal, badges) are present. The gaps above are addressed by Bricks 3.1–3.4.

---

## B) Brick Plan

### Brick 3.1 — SQL Only: Backfill `profiles.auth_user_id`

**Scope**: Link existing auth users to roster profiles by email match. Diagnostics first, then safe backfill.

**Files**: 1 migration file

**SQL**:

Diagnostics (run manually via backend query tool):
```sql
-- Unlinked profiles with matching auth users
SELECT p.id, p.email, p.auth_user_id
FROM public.profiles p
JOIN auth.users a ON lower(a.email) = lower(p.email)
WHERE p.auth_user_id IS NULL;

-- Duplicate emails in profiles (unsafe to auto-link)
SELECT lower(email), count(*)
FROM public.profiles
GROUP BY lower(email) HAVING count(*) > 1;

-- Orphan auth users (no matching profile)
SELECT a.id, a.email
FROM auth.users a
LEFT JOIN public.profiles p ON lower(p.email) = lower(a.email)
WHERE p.id IS NULL;
```

Backfill migration:
```sql
UPDATE public.profiles p
SET auth_user_id = a.id
FROM auth.users a
WHERE lower(p.email) = lower(a.email)
  AND p.auth_user_id IS NULL
  AND lower(p.email) NOT IN (
    SELECT lower(email) FROM public.profiles
    GROUP BY lower(email) HAVING count(*) > 1
  );
```

**Tests**: Run verification count query. Confirm no `profiles.id` changes. Confirm `time_entries` joins intact.

**Rollback**: `UPDATE public.profiles SET auth_user_id = NULL WHERE auth_user_id IS NOT NULL;` (safe — only clears links, doesn't delete data).

---

### Brick 3.2 — Edge Function: Harden `admin-users` provisioning

**Scope**: Add paginated auth user lookup, correct link types (invite vs recovery), return `link_type`.

**Files** (1):
- `supabase/functions/admin-users/index.ts`

**Changes**:

1. **Add `findAuthUserByEmail` helper** — paginate `listUsers()` with `page`/`perPage` params until email found or pages exhausted.

2. **Replace `generateInviteLink` with `generateOnboardingLink`** — accepts a boolean `authExists`:
   - `authExists = false` → `generateLink({ type: 'invite', email })`
   - `authExists = true` → `generateLink({ type: 'recovery', email })`
   - Returns `{ action_link, link_type: 'invite' | 'recovery', warning? }`

3. **Action `create`**: Use `findAuthUserByEmail` instead of `listUsers().find()`. Return `link_type`.

4. **Action `provision-invite`**: Check `profile.auth_user_id` first (skip email search if already linked). Use correct link type. Return `link_type`.

5. **Action `send-reset`**: Capture and return `action_link` from recovery `generateLink`. Link `auth_user_id` if missing.

6. **Action `create-with-password`**: Use `findAuthUserByEmail` instead of full list scan.

7. **Action `bulk-provision`**: Paginate initial `listUsers()` to build full map. Return `link_type` per row.

8. **All error responses**: Include `{ action, error, details }`.

**Tests**:
- Invite new user → `link_type: 'invite'`, link works
- Provision existing auth user → `link_type: 'recovery'`, link works
- `send-reset` returns `action_link`
- No ID rewrites; `time_entries` joins intact

**Rollback**: Revert `admin-users/index.ts`.

---

### Brick 3.3 — Edge Function: Fix `admin-impersonate`

**Scope**: Use roster `auth_user_id` for target lookup. Require JWT auth (not demo header). Return clear error if unprovisioned.

**Files** (1):
- `supabase/functions/admin-impersonate/index.ts`

**Changes**:

1. **`resolveCallerId`**: Reuse same JWT → roster ID mapping (auth_user_id lookup + legacy fallback). Reject `x-acting-user-id` — impersonation requires real auth.

2. **Role check**: Use roster ID for `user_roles` lookup (already does this if callerId is roster ID).

3. **Target lookup**: Load `profiles` by `id = targetUserId`, read `auth_user_id` and `email`.
   - If `auth_user_id` is NULL → return `400: "User has no login yet. Provision login first."`
   - Otherwise generate `magiclink` using `email`.

4. **Return**: `{ url: actionLink, link_type: 'magiclink', targetRosterUserId, supabase_ref }`.

**Tests**:
- Impersonate linked user → returns working magic link
- Impersonate unlinked user → clear error message
- Demo mode caller → 401 (JWT required)

**Rollback**: Revert `admin-impersonate/index.ts`.

---

### Brick 3.4 — UI: Admin Users improvements

**Scope**: Reflect `link_type` in modal title, show `action_link` from `send-reset`, update impersonate error handling.

**Files** (2):
- `src/components/admin/UsersTable.tsx`
- `src/contexts/UserContext.tsx`

**Changes**:

1. **`UserContext.tsx`**:
   - `sendReset` returns response data (currently returns void). Change to return `{ action_link, link_type }`.

2. **`UsersTable.tsx`**:
   - Track `linkType` state alongside `inviteLinkUrl`.
   - Modal title: "Invite Link" when `link_type === 'invite'`, "Password Reset Link" when `link_type === 'recovery'`.
   - `handleSendReset`: capture returned `action_link`, show in modal.
   - `handleImpersonate`: if error contains "Provision login first", show specific toast guidance.

**Tests**:
- Provision unlinked user → modal says "Invite Link"
- Send reset → modal says "Password Reset Link" with copyable URL
- Impersonate unprovisioned user → clear error toast
- Auth Status badges update after refresh

**Rollback**: Revert the 2 files.

---

## Implementation Order

```text
3.1 (SQL backfill) → 3.2 (admin-users hardening) → 3.3 (admin-impersonate) → 3.4 (UI)
```

Each brick is independently deployable and rollbackable. Total files across all bricks: 4 (1 migration + 2 edge functions + 2 app files, but UsersTable.tsx and UserContext.tsx are in the same brick).

