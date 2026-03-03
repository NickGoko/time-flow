

# Phase 2.2: Bulk Provision Logins

## What Exists

- `admin-users` edge function has `provision-invite` action (single user)
- `AdminImportExport.tsx` has Import/Export tabs
- `UsersTable.tsx` has per-user Auth dropdown (Invite/Reset/Create Login)

## Approach

Add a `bulk-provision` action to the edge function that accepts an array of user IDs, invites each sequentially, and returns per-row success/failure. Add a "Provision Logins" tab to the Import/Export page showing all profiles, with checkboxes for selection, a dry-run preview, and a results summary.

## Files Changed (3)

| # | File | Change |
|---|---|---|
| 1 | `supabase/functions/admin-users/index.ts` | Add `bulk-provision` action |
| 2 | `src/pages/admin/AdminImportExport.tsx` | Add "Provision" tab with user selection, preview, and results |
| 3 | `src/contexts/UserContext.tsx` | Add `bulkProvision` method |

## Edge Function: `bulk-provision` action

```
Request:  { action: "bulk-provision", userIds: ["uuid1", "uuid2", ...] }
Response: { results: [{ userId, email, status: "invited"|"re-invited"|"error", error?: "..." }, ...] }
```

Logic per user ID:
1. Look up profile (email, name)
2. Check if auth user exists for that email
3. If exists: re-invite via `generateLink({ type: 'invite' })`, sync profile.id, return `"re-invited"`
4. If not: `inviteUserByEmail`, sync profile.id, return `"invited"`
5. On error: return `"error"` with message, continue to next user

Same admin RBAC check as other actions. Processes sequentially to avoid rate limits.

## UI: Provision Tab

In `AdminImportExport.tsx`, add a third tab "Provision Logins":

1. **Load profiles** from `UserContext.allUsersList`
2. **Preview table** with columns: checkbox, Name, Email, Department, App Role
3. **Select All / Deselect All** toggle
4. **"Provision Selected" button** calls the edge function
5. **Results table** replaces preview, showing per-row status with color-coded badges:
   - Green: "invited" / "re-invited"
   - Red: "error" with message

This serves as the dry-run preview (you see who you're about to invite before clicking), plus the per-row summary after.

## Test Steps

1. Navigate to Admin > Import/Export > Provision Logins tab
2. See all profiles listed with checkboxes
3. Select 5 users, click "Provision Selected"
4. Results show per-row status (invited/re-invited/error)
5. Go to Admin > Users — those 5 users should now have auth accounts
6. Re-provision same 5 → all show "re-invited" (idempotent)
7. Set `AUTH_ENABLED = true`, sign in with a provisioned user (if password was set via Create Login) to confirm auth works

