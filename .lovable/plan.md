

# Slice 2 Plan: Session → Roster Resolution

## Current State Assessment

The `UserContext.tsx` already implements most of Slice 2 correctly:

1. **Auth bootstrap** (lines 140-154): `onAuthStateChange` + `getSession` are wired when `AUTH_ENABLED=true`
2. **Auth→roster mapping** (line 131): `fetchUserProfile(session.user.id, true)` queries by `auth_user_id`
3. **Demo bootstrap** (lines 105-120): loads all users, auto-selects first admin when `AUTH_ENABLED=false`
4. **Edge function headers** (lines 178-183): sends `x-acting-user-id` only when `!AUTH_ENABLED`
5. **Downstream queries**: `TimeEntriesContext` uses `currentUser.id` which is always the roster ID (`profiles.id`)

### Gaps to Fix

| Gap | Current Behavior | Required |
|-----|-----------------|----------|
| Legacy fallback | `fetchUserProfile(id, true)` queries only `auth_user_id` | Should fallback to `profiles.id = authId` for legacy users whose IDs were rewritten pre-Slice-1 |
| Unprovisioned account | If no profile found, `currentUser=null` → redirect to sign-in (infinite loop) | Show "Account not provisioned" message instead of redirect loop |
| Auth+Demo hybrid | When `AUTH_ENABLED=true` and `DEMO_MODE=true`, sign-out clears user → redirect to sign-in, no demo fallback | After sign-out, if `DEMO_MODE=true`, fall back to demo selector instead of redirect |
| Sign-up tab visible | SignIn.tsx shows Sign Up tab; prompt says self-registration should be disabled | Hide sign-up tab (users are admin-provisioned only) |

## Files to Touch (3)

1. **`src/contexts/UserContext.tsx`** — add legacy fallback in `fetchUserProfile`; add "not provisioned" state; handle auth+demo hybrid on sign-out
2. **`src/pages/SignIn.tsx`** — hide sign-up tab (admin-provisioned only)
3. **`src/lib/devMode.ts`** — no changes needed (already correct)

## Detailed Changes

### 1. `src/contexts/UserContext.tsx`

**`fetchUserProfile` — add legacy fallback:**
```typescript
async function fetchUserProfile(userId: string, byAuthId = false): Promise<User | null> {
  let profileRes;
  if (byAuthId) {
    // Primary: lookup by auth_user_id
    profileRes = await supabase.from('profiles').select('*').eq('auth_user_id', userId).single();
    // Fallback: legacy users where profiles.id was rewritten to match auth id
    if (profileRes.error || !profileRes.data) {
      profileRes = await supabase.from('profiles').select('*').eq('id', userId).single();
    }
  } else {
    profileRes = await supabase.from('profiles').select('*').eq('id', userId).single();
  }
  // ... rest unchanged
}
```

**`handleSession` — add "not provisioned" handling:**
When profile lookup returns null but session exists, set a `notProvisioned` state flag instead of leaving `currentUser=null` (which triggers redirect to sign-in). The SessionGate can then show a message.

**Auth+Demo hybrid sign-out:**
When `AUTH_ENABLED=true` and `DEMO_MODE=true`, after `supabase.auth.signOut()`, fall back to demo bootstrap (load all users, auto-select first admin) instead of leaving `currentUser=null`.

### 2. `src/pages/SignIn.tsx`

Remove the Sign Up tab entirely. Users are provisioned by admins only. Keep only the sign-in form.

### 3. No other files need changes

- `TimeEntriesContext` already uses `currentUser.id` (roster ID) — correct
- `App.tsx` routing/guards — already correct
- `UserSelector.tsx` — already correct (shows demo selector when `DEMO_MODE && !AUTH_ENABLED`)
- Edge function `admin-users` — already handles both JWT and `x-acting-user-id` paths correctly
- No DB migrations needed

## What Does NOT Change

- No route additions or removals
- No time entry / dashboard logic changes
- `AUTH_ENABLED` stays `false`, `DEMO_MODE` stays `true`
- No DB schema changes
- No edge function changes

## Test Script

1. `AUTH_ENABLED=false, DEMO_MODE=true`: demo selector appears, switching users works, admin pages work
2. `AUTH_ENABLED=true, DEMO_MODE=true`: sign in resolves roster user by `auth_user_id` (or legacy `id` fallback); sign out falls back to demo selector
3. `AUTH_ENABLED=true, DEMO_MODE=false`: logged out → Sign In screen; logged in → roster user resolved
4. Unprovisioned auth account: signs in successfully but sees "not provisioned" message, no crash

## Rollback

Revert the 3 files. Set `AUTH_ENABLED=false`, `DEMO_MODE=true`.

