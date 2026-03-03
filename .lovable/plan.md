

# Combined Plan: Bricks 4, 5, and 6

---

## BRICK 4: Progress Labels + Overtime Display

### A) Where progress is computed today

| Location | File | Lines | Current Display |
|---|---|---|---|
| Weekly progress bar | `WeeklyTimesheet.tsx` | 95-96, 174-178 | `{hours}h / 40h` |
| Daily tiles | `WeeklyTimesheet.tsx` | 228-236 | `{hours}h` only |
| Selected day header | `WeeklyTimesheet.tsx` | 276-278 | `{hours}h / {percent}%` |
| Grid sticky header | `DailyGridEntry.tsx` | 236-238 | `Logged: {hours}h / 10h` |
| Employee insights (today) | `EmployeeInsights.tsx` | 115-118 | `{hours}h / 8h target` |
| Employee insights (week) | `EmployeeInsights.tsx` | 135-138 | `{hours}h / 40h` |

### B) Plan (3 files)

1. **`src/components/WeeklyTimesheet.tsx`**:
   - Weekly bar: change label to `Xh / 40h (Y%)`. If >100%, clamp bar at 100%, append `Overtime +Zh`.
   - Daily tiles: change to `Xh / 8h`. If >=100%, show green check icon. If >100%, show `+Zh OT` below.
   - Selected day header: `Xh / 8h (Y%)`, overtime label if >100%.

2. **`src/components/DailyGridEntry.tsx`**:
   - Sticky header: `Logged: Xh / 8h (Y%)` with overtime indicator.

3. **`src/pages/EmployeeInsights.tsx`**:
   - Today card: `Xh / 8h (Y%)` with overtime if applicable.
   - Week card: same pattern.

### C) Test script
- 0h logged: `0h / 8h (0%)`
- 4h logged: `4h / 8h (50%)`
- 8h logged: `8h / 8h (100%)`
- 10h logged (travel): `10h / 8h (125%) · Overtime +2h`
- Weekly 45h: `45h / 40h (113%) · Overtime +5h`

---

## BRICK 5: Traffic Light Colours

### A) Progress bar component

The progress bar is NOT the shadcn `<Progress>` component in these views. It's a custom `div` with inline width in `WeeklyTimesheet.tsx` lines 180-188. Daily tiles use text color classes (lines 228-234).

### B) Plan (3 files, subset of Brick 4 files)

1. **`src/lib/utils.ts`**: Add helper `getProgressColor(percent: number): string` returning:
   - `<75` → `bg-destructive` (red) / `text-destructive`
   - `75–90` → `bg-warning` (yellow) / `text-warning`  
   - `90–100` → `bg-success` (green) / `text-success`
   - `>100` → `bg-success` (green, overtime is fine once target met)

2. **`src/components/WeeklyTimesheet.tsx`**: Apply to weekly bar + daily tile text colors + day header.

3. **`src/components/DailyGridEntry.tsx`**: Apply to grid header progress text.

4. **`src/pages/EmployeeInsights.tsx`**: Apply to today/week progress.

### C) Test script
- 50% (4h/8h): red bar + red text
- 80% (6.4h/8h): yellow bar + yellow text
- 95% (7.6h/8h): green bar + green text
- 112% (9h/8h): green bar, "Overtime +1h"

---

## BRICK 6: Department Filtering Bug + L&D

### A) Root cause hypothesis

The `getGroupedWorkstreams` function in `ReferenceDataContext.tsx` (lines 152-181) correctly filters external projects via `project_department_access`. However, the **data itself** is the issue:

Current `project_department_access` only grants external project access to: `dept-bd`, `dept-consulting`, `dept-operations` (plus `proj-leave` for all).

**Missing access**: departments like `dept-it`, `dept-finance`, `dept-hr`, `dept-comms`, `dept-mel` have NO access to external projects (except Leave). If these departments should support external projects (e.g., IT supporting Flagship), entries are missing from `project_department_access`.

The bug "IT only sees Impact external project options" likely means an IT user was previously assigned to `dept-consulting` or there's a stale state. The fix is to ensure correct `project_department_access` rows exist.

For `getPhasesForProject` (line 135): when an external project is selected, it returns ALL `EXTERNAL_PHASE_IDS` phases — this is correct because external projects share the same phase set. Internal projects correctly scope to department-specific work areas.

### B) Exact files involved

| # | File | Role |
|---|---|---|
| 1 | `src/contexts/ReferenceDataContext.tsx` | `getGroupedWorkstreams`, `getPhasesForProject` — filtering logic |
| 2 | DB: `project_department_access` | Access control data |
| 3 | DB: `projects`, `internal_work_areas` | Missing L&D entries |

### C) Plan (≤4 files + SQL migration)

1. **SQL migration**: Insert missing `project_department_access` rows so all departments can access support-type external projects where appropriate. Add L&D-related reference data:
   - If L&D is a separate concern, add work areas under existing departments (e.g., `iwa-hr-10` "L&D coordination" under `dept-hr`, or create a cross-cutting L&D phase).
   - Based on existing data, HR already has `iwa-hr-1` "L&D progress management". The gap may be L&D activity types or work areas for other departments.

2. **`src/contexts/ReferenceDataContext.tsx`**: No code change needed if the data fix resolves it. However, add a safety improvement: if a user's `departmentId` is empty/null, show all external projects (graceful fallback instead of showing nothing).

3. **Verify `getPhasesForProject`** handles the `internal_department` path correctly — it does, via work area → phase mapping.

### D) Test script
- Login as IT user (`dept-it`) → see IT internal workstream + Leave + any newly-granted external projects
- Login as Finance user (`dept-finance`) → see Finance internal workstream + Leave + any newly-granted external projects
- Select IT internal workstream → see only IT work areas (User support, Laptop servicing, etc.)
- Select an external project → see generic phases (Inception, Recruitment, Workshops, etc.)
- Check L&D options appear where added

---

## Combined File Count

| # | File | Bricks |
|---|---|---|
| 1 | `src/lib/utils.ts` | 5 |
| 2 | `src/components/WeeklyTimesheet.tsx` | 4, 5 |
| 3 | `src/components/DailyGridEntry.tsx` | 4, 5 |
| 4 | `src/pages/EmployeeInsights.tsx` | 4, 5 |
| 5 | `src/contexts/ReferenceDataContext.tsx` | 6 |
| 6 | SQL migration | 6 |

Total: **5 code files + 1 migration** (within all brick limits).

## Implementation Order
1. Brick 5 first (add `getProgressColor` util — needed by Brick 4)
2. Brick 4 (progress labels + overtime using the color helper)
3. Brick 6 (data fix via migration + optional context safety)

