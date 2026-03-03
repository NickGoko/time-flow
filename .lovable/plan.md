

# Phase 2: Auth Provisioning from Profiles

## Current State

- **4 profiles** exist in DB, none linked to `auth.users` (FK was dropped for demo mode)
- `AUTH_ENABLED = false` — app uses acting-user switcher, no Supabase Auth sessions
- `admin-users` edge function already handles create/update/toggle-active/bulk-import with `resolveCallerId` (JWT or `x-acting-user-id`)
- `admin-impersonate` generates magic links via `adminClient.auth.admin.generateLink`
- SignIn page exists with email/password sign-in and sign-up forms
- `handle_new_user` trigger creates profile + employee role on auth signup

## Key Design Decisions

**Problem**: Profiles exist without corresponding `auth.users` entries. We need to provision auth accounts for existing profile rows so users can actually log in when `AUTH_ENABLED` is flipped to `true`.

**Approach**: Add new actions to the existing `admin-users` edge function (no new function needed). This keeps the single admin auth pattern and avoids proliferating functions.

## A. Edge Function Design

Add 3 new actions to `supabase/functions/admin-users/index.ts`:

### Action: `provision-invite`
Sends a Supabase invite email. User clicks link to set password.

```
Request:  { action: "provision-invite", userId: "<profile-uuid>" }
Response: { success: true } or { error: "..." }
```

Logic:
1. Look up profile by `userId` → get email
2. Check if auth user exists: `adminClient.auth.admin.listUsers()` filtered by email
3. If auth user exists and profile.id differs → update profile.id to match auth user id (sync)
4. If auth user exists → call `adminClient.auth.admin.generateLink({ type: 'invite', email })` to re-invite
5. If no auth user → call `adminClient.auth.admin.inviteUserByEmail(email, { data: { full_name: name } })`
6. After invite, ensure profile.id matches the new auth user id (update if needed)
7. The `handle_new_user` trigger will try to create a duplicate profile — add `ON CONFLICT (email) DO NOTHING` to the trigger to handle this gracefully

### Action: `send-reset`
Generates a password reset link for an existing auth user.

```
Request:  { action: "send-reset", userId: "<profile-uuid>" }
Response: { success: true } or { error: "..." }
```

Logic:
1. Look up profile email
2. Generate reset link via `adminClient.auth.admin.generateLink({ type: 'recovery', email })`
3. Return success (Supabase sends the email)

### Action: `create-with-password` (super_admin only)
Creates auth user with a specified password. No email sent.

```
Request:  { action: "create-with-password", userId: "<profile-uuid>", password: "..." }
Response: { success: true } or { error: "..." }
```

Logic:
1. Verify caller is `super_admin` (not just admin)
2. Look up profile email
3. `adminClient.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: name } })`
4. Sync profile.id to match auth user id

### Caller verification
Same `resolveCallerId` pattern. `provision-invite` and `send-reset` require admin or super_admin. `create-with-password` requires super_admin only.

### Idempotency
- Inviting an already-invited user re-sends the invite (safe)
- Sending reset to a user without auth account returns a clear error
- Creating with password when auth user exists returns error "user already exists"

## B. Database Migration

Update `handle_new_user` trigger to handle the case where a profile already exists (from CSV import):

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (email) DO UPDATE SET id = NEW.id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'employee')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
```

This ensures that when an auth user is created for an email that already has a profile, the profile's `id` is updated to match the auth user's `id`, keeping everything in sync.

## C. Admin UI Changes

Add action buttons to `UsersTable.tsx` per user row:

| Button | Visible to | Condition |
|---|---|---|
| **Invite** | admin, super_admin | Always (re-invites if already invited) |
| **Reset Password** | admin, super_admin | User has auth account |
| **Create Login** | super_admin only | User has no auth account |

Add a dropdown menu (or inline buttons) with these actions in the UsersTable columns.

Update `UserDialog.tsx`: no changes needed (it already calls `addUser` which uses the `create` action for new users).

## D. File List (≤10 files)

| # | File | Change |
|---|---|---|
| 1 | `supabase/functions/admin-users/index.ts` | Add `provision-invite`, `send-reset`, `create-with-password` actions |
| 2 | `src/components/admin/UsersTable.tsx` | Add action dropdown with Invite/Reset/Create Login buttons |
| 3 | `src/contexts/UserContext.tsx` | Add `provisionUser`, `sendReset`, `createWithPassword` methods |
| 4 | SQL migration | Update `handle_new_user` to use `ON CONFLICT (email) DO UPDATE SET id` |

4 files total.

## E. Test Plan

### Test 1: Invite flow
1. As admin, go to `/admin/users`
2. Click action menu on a user (e.g., "Test User Two") → click "Invite"
3. Edge function creates auth user + sends invite email
4. Verify toast: "Invite sent"
5. Check: profile.id should now match auth.users.id for that email

### Test 2: Re-invite
1. Click "Invite" again on same user
2. Should succeed without error (idempotent)

### Test 3: Send password reset
1. After inviting a user, click "Reset Password" on them
2. Should generate recovery link
3. Toast: "Password reset email sent"

### Test 4: Create with password (super_admin)
1. Switch to super_admin user
2. Click "Create Login" on an uninvited user
3. Enter password in dialog
4. Auth user created, user can sign in immediately
5. Verify: set `AUTH_ENABLED = true`, navigate to `/sign-in`, sign in with that email/password

### Test 5: Employee cannot provision
1. Switch to employee user
2. Action buttons should not be visible (AdminGuard protects the page anyway)

### Test 6: Flip AUTH_ENABLED
1. Set `AUTH_ENABLED = true` in `devMode.ts`
2. App redirects to `/sign-in`
3. Sign in with a provisioned user's credentials
4. App loads with correct role and permissions

