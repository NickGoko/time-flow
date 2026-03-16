
# Slice 5: Tiny-Cohort Auth Pilot

## Status: ROLE UPGRADES DONE | AUTH ACTIVATION PENDING BUILD SECRET

### What was done
1. **SQL migration**: Both target users upgraded to `super_admin`:
   - `ngo@growthafrica.com` (`cca0759d-...`): employee → super_admin ✅
   - `it@growthafrica.com` (`d42a2ddb-...`): admin → super_admin ✅
2. **Runtime secret**: `VITE_AUTH_ENABLED` added (but this is a VITE_ var — needs Build Secret)

### Pending
- User must add `VITE_AUTH_ENABLED=true` as a **Build Secret** (Workspace Settings → Build Secrets)
- Once set, rebuild will activate auth requirement

### Verification checklist (run after build secret is active)
- [ ] App redirects to `/sign-in`
- [ ] ngo@growthafrica.com signs in → `super_admin` role, admin dashboard
- [ ] it@growthafrica.com signs in → `super_admin` role, admin dashboard
- [ ] Impersonation works from authenticated super-admin session
- [ ] Demo user selector still visible (APP_ENV remains `dev`)
- [ ] profiles.id unchanged for both accounts
- [ ] user_roles.user_id matches profiles.id

### Rollback
```sql
UPDATE public.user_roles SET role = 'employee' WHERE user_id = 'cca0759d-ebc9-4fa5-9fd0-e61e51c2ef65';
UPDATE public.user_roles SET role = 'admin' WHERE user_id = 'd42a2ddb-05a4-4051-bbfe-8614e6da4d21';
```
Remove `VITE_AUTH_ENABLED` build secret.
