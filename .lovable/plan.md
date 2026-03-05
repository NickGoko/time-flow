

# Combined Implementation Plan: Department-Scoped Deliverables UI + Validation + L&D Hotfix

## Current State

- **Deliverables DB**: 42 rows seeded, each with `department_id`, `is_global`, `sort_order` — ready to use.
- **UI**: Both `TimeEntryForm.tsx` and `DailyGridEntry.tsx` use the hardcoded `DELIVERABLE_TYPES` array from `src/types/index.ts`. They never query the DB.
- **ReferenceDataContext**: Fetches `deliverable_types` from DB but only maps `{ id, name, isActive }` — ignores `department_id` and `is_global`.
- **L&D hotfix**: HR L&D work area (`iwa-hr-1`) and 6 activity types already exist in DB. No DB changes needed. Internal filtering already works correctly via `getPhasesForProject` scoping by `owningDepartmentId`.

## Files to Change (6 total, within all limits)

| # | File | Changes |
|---|---|---|
| 1 | `src/types/index.ts` | Add `departmentId` and `isGlobal` to `DeliverableTypeItem`. Add `getDeliverablesByDepartment` helper. |
| 2 | `src/contexts/ReferenceDataContext.tsx` | Map `department_id`/`is_global` when fetching. Expose `getDeliverablesForDepartment(deptId)` getter. |
| 3 | `src/components/TimeEntryForm.tsx` | Replace `DELIVERABLE_TYPES.map()` with `getDeliverablesForDepartment(currentUser.departmentId)`. Use DB `id` as value instead of hardcoded type string. Add empty-state message. Clear selected deliverable on user/department change. |
| 4 | `src/components/DailyGridEntry.tsx` | Same change as TimeEntryForm — use DB deliverables filtered by department. Add empty-state. Clear on project change if deliverable no longer valid. |
| 5 | `src/contexts/TimeEntriesContext.tsx` | In `addEntry`, validate that `deliverableType` matches a deliverable allowed for the user's department. Reject with toast error if mismatched. |
| 6 | `src/data/seed.ts` | Update seed entries to use new deliverable IDs (e.g., `del-workshop` instead of `workshop`) so existing demo data doesn't break. |

## Key Implementation Details

### Deliverable dropdown (Prompt 3)
- `ReferenceDataContext` exposes: `getDeliverablesForDepartment(deptId: string): DeliverableTypeItem[]` — returns items where `(departmentId === deptId || isGlobal) && isActive`, sorted by `sortOrder`.
- Both forms use this instead of `DELIVERABLE_TYPES`. The dropdown value becomes the deliverable `id` (e.g., `del-fin-1`) instead of the old type string (`workshop`).
- When the user switches in demo mode, the `currentUser.departmentId` changes, the `useMemo` recomputes, and if the selected deliverable isn't in the new list, it gets cleared.
- Empty state: if filtered list is empty, show a disabled select with "No deliverables configured for your department. Contact Admin."

### Backend validation (Prompt 4)
- In `TimeEntriesContext.addEntry`: before inserting, check the deliverable exists in the filtered list for `currentUser.departmentId`. If not, `toast.error("Deliverable type is not allowed for your department.")` and return early.
- Same check in `updateEntry` if `deliverableType` is being changed.

### L&D + internal filtering hotfix (Prompt 5)
- **No changes needed.** The DB already has HR L&D work area (`iwa-hr-1` / `phase-hr-1`) with 6 activity types. The `getPhasesForProject` function already filters by `owningDepartmentId`, so IT users see only IT work areas, HR users see HR work areas (including L&D). Verified via code inspection.
- The only remaining concern is that existing seed `TimeEntry` objects use old hardcoded deliverable type strings (`workshop`, `other`, etc.) — these need updating to match the new DB IDs (`del-workshop`, `del-other`, etc.) in `seed.ts`.

## Test Steps

1. **Switch to Finance user** → Deliverable dropdown shows: Payment pack, Reconciliation, Finance report, Compliance filing, Audit evidence pack, Other
2. **Switch to IT user** → Dropdown shows: Ticket resolution, Account/access setup, Device setup/repair, System/network change, Guide/SOP, Other
3. **Switch to HR user** → See HR deliverables. Select "L&D progress management" work area → see 6 activity types
4. **Try submitting with wrong deliverable** (if somehow bypassed) → toast error "Deliverable type is not allowed for your department."
5. **Switch user mid-form** → previously selected deliverable clears if not in new department's list
6. **Department with no deliverables** → shows "No deliverables configured" message

