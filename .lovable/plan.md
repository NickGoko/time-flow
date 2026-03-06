

# Slice 1 Implementation Plan — Non-destructive Auth Linking

## Current State

The previous migration (20260306) already added `profiles.auth_user_id` and updated `handle_new_user`. However, three gaps remain vs the prompt requirements:

1. **`resolveCallerId()` returns auth UUID directly** — JWT callers get `auth.users.id` as `callerId`, but `user_roles.user_id` references `profiles.id` (roster ID). Role checks will fail for any user where `profiles.id ≠ auth_user_id`.

2. **`create` action is invite-first** — It invites, waits for the trigger to create/link a profile, then updates. The prompt requires roster-first: find/create profile by email, then invite auth, then link.

3. **`handle_new_user` still creates profiles for unknown emails** — The prompt says: if no matching email, do NOT insert a new profile. Only link `auth_user_id` when email matches.

4. **Unique index is not partial** — Current migration uses `UNIQUE` constraint which prevents multiple NULLs in some edge cases. Should be a partial unique index (`WHERE auth_user_id IS NOT NULL`).

## Files to Touch (2)

1. `supabase/migrations/*_handle_new_user_link_only.sql` — Fix trigger to link-only (no profile creation) and fix unique index to be partial.
2. `supabase/functions/admin-users/index.ts` — Fix `resolveCallerId` and `create` action.

## Migration: Fix trigger + index

```sql
-- Drop the plain UNIQUE constraint, replace with partial unique index
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_auth_user_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_auth_user_id_unique
  ON public.profiles(auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- Replace handle_new_user: link-only, no profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Link existing roster profile by email; do NOT create new profiles
  UPDATE public.profiles
    SET auth_user_id = NEW.id
    WHERE lower(email) = lower(NEW.email)
      AND auth_user_id IS NULL;

  -- Ensure employee role exists for linked profile
  INSERT INTO public.user_roles (user_id, role)
  SELECT p.id, 'employee'
  FROM public.profiles p
  WHERE p.auth_user_id = NEW.id
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
```

## Edge Function Changes

### `resolveCallerId()` — Map auth ID → roster ID

JWT path changes from returning `user.id` directly to:
1. Get auth user via JWT
2. Query `profiles` where `auth_user_id = authId`
3. Fallback: query `profiles` where `id = authId` (legacy users where IDs were previously rewritten)
4. Return `profile.id` (roster ID)

Demo fallback (`x-acting-user-id`) stays exactly as-is.

### `create` action — Roster-first flow

Replace invite-first with:
1. Normalize email
2. Find existing profile by email, or insert new profile with `crypto.randomUUID()` as id
3. Upsert `user_roles` with roster ID and desired appRole
4. Invite auth user; if invite fails (already exists), find existing auth user
5. Link: `profiles.update({ auth_user_id: authId }).eq('id', rosterId)`
6. Return `{ success: true, userId: rosterId, authUserId: authId }`

Remove the trigger-wait loop entirely.

### Other actions — Already correct

`update`, `toggle-active`, `bulk-import`, `provision-invite`, `send-reset`, `create-with-password`, `bulk-provision` — all already use roster IDs and set `auth_user_id` without mutating PKs. No changes needed.

## What Does NOT Change

- No UI/route/styling changes
- No time entry logic changes
- `AUTH_ENABLED` stays `false`, demo mode stays on
- `UserContext.tsx` and `types/index.ts` not touched (already updated in prior slice)
- `SignIn.tsx` not touched

