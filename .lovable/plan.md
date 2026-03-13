

# Plan: Deterministic Invite Links + UI Feedback

## Problem

Currently, `create`, `provision-invite`, and `bulk-provision` actions rely on email delivery (via `inviteUserByEmail` or `generateLink` without capturing the link). The `action_link` from `generateLink` is never returned to the caller, so admins see "Invite sent" but have no fallback if email doesn't arrive.

## Files to Touch (4)

1. `supabase/functions/admin-users/index.ts` — return `action_link` from all provisioning actions + add debug `supabase_ref` field
2. `src/contexts/UserContext.tsx` — return full response data (including `action_link`) from `addUser`, `provisionInvite`, `createWithPassword`
3. `src/components/admin/UsersTable.tsx` — show invite link modal + auth status badge in table
4. `src/types/index.ts` — (no change needed, `authUserId` already on User type)

## Edge Function Changes (`admin-users/index.ts`)

### Debug field (all responses)
Add `supabase_ref` extracted from `SUPABASE_URL` to every success response for project verification.

### Action: `create` (lines 152-178)
After invite or fallback magiclink, call `generateLink({ type: 'invite', email })` explicitly and capture `action_link`. Return:
```json
{ "success": true, "userId": "<rosterId>", "authUserId": "<authId>", "action_link": "<url>", "supabase_ref": "zmrulycw..." }
```
If `generateLink` fails, still return success but with `action_link: null` and a `warning` field.

### Action: `provision-invite` (lines 400-446)
Same pattern: after invite/magiclink, call `generateLink({ type: 'invite', email })` and return `action_link`.

### Action: `create-with-password` (lines 482-528)
No invite link needed (user has a password). Just add `supabase_ref` to response.

### Action: `bulk-provision` (lines 532-600)
For each user, capture `action_link` from `generateLink` and include in results array items.

### No ID rewrites
All changes only add return fields. No mutations to `profiles.id` or `user_roles.user_id`.

## Context Changes (`UserContext.tsx`)

Currently `addUser`, `provisionInvite` etc. consume the response but only show toasts. Change them to **return the response data** so `UsersTable` can access `action_link`:

- `addUser`: return `result` (contains `action_link`)
- `provisionInvite`: return `result`
- `createWithPassword`: return `result`
- `bulkProvision`: already returns results

Update function signatures in `UserContextType` interface to return the response.

## UI Changes (`UsersTable.tsx`)

### Invite Link Modal
Add state: `inviteLinkDialogOpen`, `inviteLinkUrl`.

After `addUser` / `provisionInvite` / `createWithPassword` succeeds and response contains `action_link`:
- Open a modal with title "Invite Link"
- Read-only input showing the URL
- "Copy invite link" button (uses `navigator.clipboard.writeText`)
- Helper text: "Share this link if email delivery is delayed."

### Auth Status Column
Add a column showing auth provisioning status:
- `authUserId` exists → green Badge "Provisioned"
- `authUserId` is undefined/null → gray Badge "Not provisioned"

This uses the `authUserId` field already present on the `User` type and populated by `refreshAllUsers`.

### Error Surfacing
All handlers already show `toast.error` on failure. The edge function changes ensure errors always include descriptive messages. No additional UI error handling needed.

## Test Steps

1. Click "Invite User" → fill form → submit → response contains `action_link` → modal shows link → copy works
2. Click Auth dropdown → "Send Invite" → modal shows link for existing roster user
3. Click Auth dropdown → "Create Login" → success toast (no link modal needed for password flow)
4. Verify Auth column shows "Provisioned" / "Not provisioned" badges
5. Open copied `action_link` in incognito → user can set password
6. Verify `profiles.id` unchanged after all actions

