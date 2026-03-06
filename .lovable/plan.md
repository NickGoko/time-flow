

# Slice 1: Add `profiles.auth_user_id` and Stop Mutating PKs

## Problem

When auth provisioning occurs, the `handle_new_user` trigger and the `admin-users` Edge Function both rewrite `profiles.id` to match `auth.users.id`. This orphans `time_entries`, `week_statuses`, and `validation_events` rows that reference the old UUID.

## Solution

Add a nullable `auth_user_id` column to `profiles`. Use it as the link between `profiles` and `auth.users`. Stop mutating `profiles.id` or `user_roles.user_id` anywhere.

## Files to Touch (4)

1. **Migration SQL** (new file in `supabase/migrations/`)
2. **`supabase/functions/admin-users/index.ts`** — update provision-invite, create-with-password, bulk-provision to set `auth_user_id` instead of rewriting `profiles.id`
3. **`src/contexts/UserContext.tsx`** — update `fetchUserProfile` to look up profile by `auth_user_id` when authenticated (session user id = auth user id, not profile id)
4. **`src/types/index.ts`** — add optional `authUserId` field to `User` type

## Migration SQL

```sql
-- 1. Add auth_user_id column
ALTER TABLE public.profiles
  ADD COLUMN auth_user_id uuid UNIQUE;

-- 2. Backfill: for any profile whose id already matches an auth user, set auth_user_id = id
UPDATE public.profiles SET auth_user_id = id
WHERE id IN (SELECT id FROM auth.users);

-- 3. Replace handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- If profile exists by email, link it; otherwise create new
  UPDATE public.profiles
    SET auth_user_id = NEW.id
    WHERE email = NEW.email AND auth_user_id IS NULL;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email, name, auth_user_id)
    VALUES (gen_random_uuid(), NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
            NEW.id)
    ON CONFLICT (email) DO UPDATE SET auth_user_id = NEW.id;
  END IF;

  -- Ensure employee role exists (keyed to profile.id, not auth id)
  INSERT INTO public.user_roles (user_id, role)
  SELECT p.id, 'employee'
  FROM public.profiles p
  WHERE p.auth_user_id = NEW.id
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
```

## Edge Function Changes (`admin-users/index.ts`)

For actions **provision-invite**, **create-with-password**, and **bulk-provision**, replace all instances of:
```
await adminClient.from('profiles').update({ id: newAuthId }).eq('id', profile.id);
await adminClient.from('user_roles').update({ user_id: newAuthId }).eq('user_id', profile.id);
```
with:
```
await adminClient.from('profiles').update({ auth_user_id: newAuthId }).eq('id', profile.id);
```

No PK or `user_roles.user_id` mutation. The `create` action (invite new user) also needs adjustment: after the trigger fires, look up the profile by `auth_user_id` instead of by `id`.

## UserContext Changes

`fetchUserProfile(userId)` currently queries `profiles` by `id`. When `AUTH_ENABLED`, the session user id is an auth UUID. After this change, it must query by `auth_user_id`:

```typescript
// When called from auth session:
supabase.from('profiles').select('*').eq('auth_user_id', userId).single()
// Then use profile.id (not auth_user_id) for user_roles lookup
```

When `AUTH_ENABLED=false` (demo mode), continue using `profiles.id` directly — no change.

## What Does NOT Change

- `time_entries`, `week_statuses`, `validation_events` — untouched
- Dashboard/insights pages — untouched
- `AUTH_ENABLED` stays `false`, demo mode stays on
- UI styling — untouched
- `SignIn.tsx` — untouched
- Routing/guards — untouched

