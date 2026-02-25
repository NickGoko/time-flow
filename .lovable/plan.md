

## Brick 2: Auth-Related Tables (profiles, user_roles, time_entries, week_statuses)

### Objective

Create the four user/auth-linked tables in Supabase with RLS policies. This is schema-only -- no application code changes. The tables will be ready for Brick 3 (Auth UI + session context) and Brick 5 (time entries migration).

### Migration Scope (1 file)

A single SQL migration that creates:

**1. `app_role` enum and `user_roles` table**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK default gen_random_uuid()` | |
| `user_id` | `uuid FK auth.users(id) ON DELETE CASCADE NOT NULL` | |
| `role` | `app_role NOT NULL` | enum: `admin`, `employee` |
| | `UNIQUE(user_id, role)` | |

**2. `has_role()` security definer function**

```text
public.has_role(_user_id uuid, _role app_role) returns boolean
  -- SECURITY DEFINER, stable, search_path = public
  -- checks user_roles table without triggering RLS recursion
```

**3. `profiles` table**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK FK auth.users(id) ON DELETE CASCADE` | |
| `name` | `text NOT NULL` | |
| `email` | `text NOT NULL` | |
| `department_id` | `text FK departments(id)` | nullable (unassigned) |
| `role` | `text NOT NULL DEFAULT ''` | job title, not auth role |
| `weekly_expected_hours` | `integer NOT NULL DEFAULT 40` | |
| `is_active` | `boolean NOT NULL DEFAULT true` | |
| `avatar_url` | `text` | nullable |
| `created_at` | `timestamptz DEFAULT now()` | |

RLS policies:
- SELECT: all authenticated users can read all profiles (needed for name display)
- UPDATE: users can update only their own profile (`auth.uid() = id`)
- INSERT: none (created by trigger)
- DELETE: none

**4. `handle_new_user()` trigger**

On `auth.users` INSERT, auto-creates a `profiles` row with `id`, `email`, and defaults. Also inserts an `employee` role into `user_roles`.

**5. `time_entries` table**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid PK default gen_random_uuid()` | |
| `user_id` | `uuid FK auth.users(id) ON DELETE CASCADE NOT NULL` | |
| `project_id` | `text FK projects(id) NOT NULL` | |
| `phase_id` | `text FK phases(id)` | nullable |
| `activity_type_id` | `text FK activity_types(id)` | nullable |
| `work_area_id` | `text FK internal_work_areas(id)` | nullable |
| `work_area_activity_type_id` | `text FK activity_types(id)` | nullable |
| `support_department_id` | `text FK departments(id)` | nullable |
| `task_description` | `text NOT NULL` | |
| `deliverable_type` | `text NOT NULL` | |
| `deliverable_description` | `text` | nullable |
| `date` | `date NOT NULL` | |
| `hours` | `integer NOT NULL DEFAULT 0` | |
| `minutes` | `integer NOT NULL DEFAULT 0` | |
| `billable_status` | `text NOT NULL DEFAULT 'not_billable'` | |
| `comments` | `text` | nullable |
| `created_at` | `timestamptz DEFAULT now()` | |
| `updated_at` | `timestamptz DEFAULT now()` | |

RLS policies:
- SELECT: own rows (`auth.uid() = user_id`) OR admin (`has_role(auth.uid(), 'admin')`)
- INSERT: only own rows (`auth.uid() = user_id`)
- UPDATE: only own rows (`auth.uid() = user_id`)
- DELETE: only own rows (`auth.uid() = user_id`)

**6. `week_statuses` table**

| Column | Type | Notes |
|---|---|---|
| `user_id` | `uuid FK auth.users(id) ON DELETE CASCADE NOT NULL` | |
| `week_start_date` | `date NOT NULL` | |
| `is_submitted` | `boolean NOT NULL DEFAULT false` | |
| `submitted_at` | `timestamptz` | nullable |
| `is_locked` | `boolean NOT NULL DEFAULT false` | |
| `locked_at` | `timestamptz` | nullable |
| | `PRIMARY KEY (user_id, week_start_date)` | |

RLS policies:
- SELECT: own rows OR admin
- INSERT: own rows only
- UPDATE: own rows only (admin can also update for locking)
- DELETE: none

### File Limit

1 migration file. Zero application code changes.

### What Does NOT Change

- `UserContext.tsx`, `TimeEntriesContext.tsx` (untouched until Bricks 3 and 5)
- `ReferenceDataContext.tsx` (already wired to DB in Brick 1)
- All UI components, routing, seed data
- Existing 7 reference data tables

### Key Design Decisions

1. **`user_id` is `uuid`** -- references `auth.users(id)`. Current string IDs (`user-ilo`) will be retired when auth is wired in Brick 3.
2. **`project_id` and other reference FKs remain `text`** -- matching the Brick 1 reference tables which use text PKs.
3. **No seed data for time_entries or week_statuses** -- these will be populated by the app after auth is wired.
4. **Profiles trigger** creates a minimal row; admin will later update `name`, `department_id`, etc. via the admin user management flow (Brick 6).
5. **`app_role` enum** uses only `admin` and `employee` to match the existing `AppRole` type.

### Risks / Edge Cases

- The trigger attaches to `auth.users` via an `AFTER INSERT` trigger on the auth schema indirectly (using a function in public schema that references `NEW.id` and `NEW.email`). This is the standard Supabase pattern.
- `time_entries` and `week_statuses` will have no data until Brick 5 migrates `TimeEntriesContext` to use Supabase. The app continues using in-memory data until then.
- Minutes validation (0/15/30/45) is enforced at the application level, not via DB constraint, to keep migrations simple.

### Test Checklist

| # | Test | Expected |
|---|---|---|
| 1 | Run migration, check database | 4 new tables exist: `profiles`, `user_roles`, `time_entries`, `week_statuses` |
| 2 | Check `app_role` enum | Enum exists with values `admin`, `employee` |
| 3 | Check `has_role()` function | Function exists and is `SECURITY DEFINER` |
| 4 | Verify RLS is enabled on all 4 tables | All tables show RLS enabled |
| 5 | App still loads and works normally | No regressions -- these tables are not yet consumed by application code |
| 6 | Verify existing reference data tables unaffected | Departments, projects, phases etc. still return data |

