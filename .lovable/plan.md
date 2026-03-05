

# Diagnosis: Deliverable Type Wrong Options

## Root Cause

**Deliverables are a flat, global, hardcoded list** — not department-scoped.

The `TimeEntryForm.tsx` and `DailyGridEntry.tsx` both render deliverable options from `DELIVERABLE_TYPES` — a hardcoded array in `src/types/index.ts` containing 6 items: Workshop, Reporting, Training, Event, Case study, Other. These are Impact/consulting deliverables. Every department sees the same list regardless of their function.

The DB table `deliverable_types` exists but has only these same 6 global rows with no `department_id` column. The admin CRUD page (`DeliverablesTable.tsx`) manages them as a flat list.

## Files Involved

| # | File | Role |
|---|---|---|
| 1 | `src/types/index.ts` | Hardcoded `DELIVERABLE_TYPES` array + `DeliverableType` union type |
| 2 | `src/components/TimeEntryForm.tsx` | Uses `DELIVERABLE_TYPES.map()` for dropdown |
| 3 | `src/components/DailyGridEntry.tsx` | Same hardcoded list for grid dropdown |
| 4 | `src/contexts/ReferenceDataContext.tsx` | Fetches `deliverable_types` from DB but only for admin CRUD |
| 5 | `src/components/admin/DeliverablesTable.tsx` | Admin CRUD for deliverable types |
| 6 | `src/components/admin/DeliverableDialog.tsx` | Add/edit dialog |
| 7 | `src/contexts/UserContext.tsx` | Current user + department_id source |

## Current User Source

The authenticated user's `department_id` comes from the `profiles` table, loaded in `UserContext.tsx`. This is correct and department-aware.

## DB Confirmation

The `deliverable_types` table has columns: `id` (text PK), `name` (text), `is_active` (boolean). **No `department_id` or `is_global` column exists.** Only 6 rows (del-workshop, del-reporting, del-training, del-event, del-case_study, del-other).

---

# Implementation Plan: Department-Scoped Deliverables (DB Only)

## Step 1: Migration — Alter `deliverable_types` table

Add columns to existing table:
- `department_id` (text, nullable — null means global)
- `is_global` (boolean, default false)
- `sort_order` (integer, default 0)
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

Mark existing 6 rows as `department_id = 'dept-consulting'` (Impact) since they match Impact deliverables.

Add indexes on `(department_id, is_active)` and `(is_global, is_active)`.

## Step 2: Seed department-specific deliverables

Insert rows per department (7 departments × 6 items = 42 new rows):

| Dept | Items |
|---|---|
| `dept-finance` | Payment pack, Reconciliation, Finance report, Compliance filing, Audit evidence pack, Other |
| `dept-hr` | Recruitment pack, Onboarding pack, Payroll input, People policy document, Performance record, Other |
| `dept-comms` | Content piece, Design asset, Media release, Website/newsletter update, Event communications pack, Other |
| `dept-it` | Ticket resolution, Account/access setup, Device setup/repair, System/network change, Guide/SOP, Other |
| `dept-bd` | Opportunity note, Concept note, Proposal, Pitch deck, Engagement record, Other |
| `dept-mel` | Data collection tool, Dataset, Analysis brief, Indicator update, Learning note, Other |
| `dept-consulting` | Already exists (Workshop, Reporting, Training, Event, Case study, Other) — update with department_id |

## Migration SQL

```sql
-- Add department scoping columns
ALTER TABLE public.deliverable_types
  ADD COLUMN IF NOT EXISTS department_id text,
  ADD COLUMN IF NOT EXISTS is_global boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deliverable_types_dept_active
  ON public.deliverable_types (department_id, is_active);
CREATE INDEX IF NOT EXISTS idx_deliverable_types_global_active
  ON public.deliverable_types (is_global, is_active);

-- Tag existing rows as Impact (dept-consulting)
UPDATE public.deliverable_types
  SET department_id = 'dept-consulting', sort_order = 
    CASE id
      WHEN 'del-workshop' THEN 1
      WHEN 'del-reporting' THEN 2
      WHEN 'del-training' THEN 3
      WHEN 'del-event' THEN 4
      WHEN 'del-case_study' THEN 5
      WHEN 'del-other' THEN 6
    END
  WHERE id IN ('del-workshop','del-reporting','del-training','del-event','del-case_study','del-other');
```

Then seed 36 new rows for the other 6 departments via INSERT.

## Row Counts

| Department | Rows |
|---|---|
| dept-consulting (Impact) | 6 (existing, updated) |
| dept-finance | 6 |
| dept-hr | 6 |
| dept-comms | 6 |
| dept-it | 6 |
| dept-bd | 6 |
| dept-mel | 6 |
| **Total** | **42** |

## No UI Changes

This plan only modifies the database. The UI will continue to use the hardcoded `DELIVERABLE_TYPES` until a follow-up brick updates the dropdown queries to filter by `currentUser.departmentId`.

