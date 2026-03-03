

# Phase 1.1–1.2: Restore Users from CSV into DB

## A. Current State

**DB departments** (8 existing):
| DB ID | DB Name |
|---|---|
| dept-bd | Business Development |
| dept-comms | Communications |
| dept-mel | Data, Insights and Learning (MEL) |
| dept-finance | Finance, Legal and Administration |
| dept-hr | Human Resources |
| dept-it | IT, AI and Productivity |
| dept-operations | Operations |
| dept-consulting | Project Delivery (Impact) |

**DB profiles** (4 existing): Nicholas Goko (admin), Super-Admin (super_admin), 2 test users.

**CSV** has 25 user rows across 7 department names. The CSV also contains role/permission reference tables (rows 32+) which we will ignore for import — only user rows (2–26) matter.

## B. CSV Column → DB Field Mapping

| CSV Column | DB Table.Column | Notes |
|---|---|---|
| `Display_name` | `profiles.name` | Full display name |
| `email` | `profiles.email` | **Match key** for upsert |
| `home_department` | `profiles.department_id` | Via name→ID mapping below |
| `job_title` | `profiles.role` | Job title string |
| `is_active` | `profiles.is_active` | TRUE/FALSE |
| `roles` | `user_roles.role` | Mapped: Admin→admin, Leadership→super_admin, else→employee |
| `first_name`, `last_name` | Ignored | `Display_name` used instead |
| `managed_departments`, `capabilities`, `notes` | Ignored | Future features |

**Department name mapping** (CSV name → existing DB ID):

| CSV `home_department` | DB `departments.id` |
|---|---|
| Finance & Admin | dept-finance |
| Impact | dept-consulting |
| Communications | dept-comms |
| Admin | dept-operations |
| Business Development | dept-bd |
| Productivity & IT | dept-it |
| HR | dept-hr |

All 7 CSV departments map to existing DB departments. No new departments needed.

**App role mapping** (from semicolon-delimited `roles` column):

| CSV contains | `user_roles.role` |
|---|---|
| `Admin` | `admin` |
| `Leadership` | `super_admin` |
| Neither | `employee` |

Priority: Admin > Leadership > Employee. Only one role per user in `user_roles`.

## C. Approach: Edge Function Action

Add a `bulk-import` action to the existing `admin-users` edge function. This keeps the admin auth pattern (x-acting-user-id) and uses the service role key for writes.

**Why edge function over SQL migration?**
- Needs conditional logic (department mapping, role parsing, upsert-by-email)
- Must generate UUIDs for new profiles (no auth.users since AUTH_ENABLED=false)
- Returns a structured report (created/updated/skipped counts)
- Idempotent: uses `ON CONFLICT (email)` for profiles, `ON CONFLICT (user_id)` for roles

**Profile upsert logic:**
1. Look up existing profile by email
2. If exists: UPDATE name, department_id, role, is_active (preserve id)
3. If not exists: INSERT with `gen_random_uuid()` as id
4. Upsert user_roles for the profile id

**Existing users not in CSV** (the 2 test users): left untouched. No deletions.

## D. Files Changed (2 files)

| # | File | Change |
|---|---|---|
| 1 | `supabase/functions/admin-users/index.ts` | Add `bulk-import` action: accepts array of user objects, performs upsert, returns report |
| 2 | `src/pages/admin/AdminImportExport.tsx` | Add CSV upload UI in the Import tab: file picker, parse CSV client-side, call edge function, show report |

## E. Implementation Steps

### Step 1: Edge Function — `bulk-import` action

Accepts body:
```json
{
  "action": "bulk-import",
  "users": [
    { "name": "Alex Njoroge", "email": "anm@growthafrica.com", "departmentId": "dept-finance", "role": "Finance Associate", "appRole": "employee", "isActive": true }
  ]
}
```

For each user:
1. `SELECT id FROM profiles WHERE email = ?`
2. If found → `UPDATE profiles SET name, department_id, role, is_active WHERE id = ?`
3. If not → `INSERT INTO profiles (id, email, name, department_id, role, is_active) VALUES (gen_random_uuid(), ...)`
4. `INSERT INTO user_roles (user_id, role) VALUES (?, ?) ON CONFLICT (user_id) DO UPDATE SET role = ?`

Returns: `{ created: N, updated: N, skipped: N, errors: [...] }`

### Step 2: Import UI

In `AdminImportExport.tsx`, replace the "coming in Brick 7" placeholder with:
- File input accepting `.csv`
- Client-side CSV parsing (split lines, map columns using the department mapping)
- Preview table showing parsed rows before import
- "Import" button that calls the edge function
- Results summary (created/updated/skipped)

## F. Test Steps

1. Navigate to Admin > Import/Export > Import tab
2. Upload the CSV file
3. Preview shows 25 rows with correct department mappings
4. Click Import → report shows ~23 created, ~2 updated (Nicholas Goko + IT developer already exist)
5. Go to Admin > Users → all 25 CSV users visible with correct departments and roles
6. Re-upload same CSV → report shows 0 created, 25 updated, no duplicates
7. Existing test users still present (not deleted)

