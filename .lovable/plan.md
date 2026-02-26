

# Promote it@growthafrica.com to super_admin

The user `it@growthafrica.com` exists in the database with the current role of `employee`. This single data update will promote them to `super_admin`.

## What will happen

- Update the `user_roles` row for `it@growthafrica.com` from `employee` to `super_admin`
- On their next login, they will have full super-admin access including the "Login as" impersonation feature

## SQL to execute

```sql
UPDATE public.user_roles
SET role = 'super_admin'
WHERE user_id = 'd42a2ddb-05a4-4051-bbfe-8614e6da4d21';
```

## Technical details

- No schema changes needed -- the `super_admin` enum value and `has_role()` function are already in place
- No code changes required -- `UserContext` already handles `isSuperAdmin` logic
- Single data operation using the insert tool (not a migration)

