

# Plan: Drift Detector — Reconciliation Check for Reports Overview + Personal Dashboard

## Summary

Create a shared `reconcileDashboardTotals` helper that validates billing mix consistency and entry-level totals. Wire it into both pages on every filter change. Surface mismatches in DEV_MODE via console warnings, and add a "Reconciliation mismatch" line to the existing Data Quality card on Reports Overview.

## Files to change (4)

| # | File | Change |
|---|---|---|
| 1 | `src/lib/reconcile.ts` | **New.** Shared reconciliation helper |
| 2 | `src/pages/AdminReportsOverview.tsx` | Run reconciliation on filter change, surface mismatch in Data Quality card |
| 3 | `src/pages/EmployeeInsights.tsx` | Run reconciliation on range change (replace existing `console.assert`) |
| 4 | `src/lib/devMode.ts` | No change needed — already exports `DEV_MODE` |

## Detailed changes

### `src/lib/reconcile.ts` — New shared helper

```typescript
import { DEV_MODE } from './devMode';

interface ReconcileInput {
  entries: { billableStatus: string; hours: number; minutes: number }[];
  kpiTotalMinutes: number;
  kpiBillable: number;
  kpiMaybe: number;
  kpiNotBillable: number;
  teamRowsTotalMinutes?: number; // sum of team table Hours column
  label: string; // e.g. "Reports/Org/this_week"
}

interface ReconcileResult {
  hasMismatch: boolean;
  details: string[];
}

export function reconcileDashboardTotals(input: ReconcileInput): ReconcileResult {
  const TOLERANCE = 1; // 1 minute
  const details: string[] = [];

  // Check 1: Billable + Maybe + Not billable == Total
  const billingSum = input.kpiBillable + input.kpiMaybe + input.kpiNotBillable;
  if (Math.abs(billingSum - input.kpiTotalMinutes) > TOLERANCE) {
    details.push(`Billing mix: ${input.kpiBillable}+${input.kpiMaybe}+${input.kpiNotBillable}=${billingSum} vs total=${input.kpiTotalMinutes}`);
  }

  // Check 2: KPI total matches sum of entry minutes
  const entrySum = input.entries.reduce((s, e) => s + (e.hours * 60 + e.minutes), 0);
  if (Math.abs(entrySum - input.kpiTotalMinutes) > TOLERANCE) {
    details.push(`Entry sum: ${entrySum} vs KPI total: ${input.kpiTotalMinutes}`);
  }

  // Check 3: Team table sum matches total (if provided)
  if (input.teamRowsTotalMinutes !== undefined) {
    if (Math.abs(input.teamRowsTotalMinutes - input.kpiTotalMinutes) > TOLERANCE) {
      details.push(`Team table sum: ${input.teamRowsTotalMinutes} vs KPI total: ${input.kpiTotalMinutes}`);
    }
  }

  if (details.length > 0 && DEV_MODE) {
    console.warn(`[Reconcile/${input.label}] Mismatch detected:`, details);
  }

  return { hasMismatch: details.length > 0, details };
}
```

### `src/pages/AdminReportsOverview.tsx`

- Import `reconcileDashboardTotals` from `@/lib/reconcile`
- Add a `useMemo` that runs reconciliation using `metrics` (from hook), `scopedEntries`, and team summary totals
- In the Data Quality card (lines 116-128), add a conditional line below the existing backdated entries content:
  ```
  {reconcileResult.hasMismatch && (
    <p className="text-xs text-destructive mt-1">Reconciliation mismatch</p>
  )}
  ```
- Include QA matrix as a code comment block at the bottom of the file

### `src/pages/EmployeeInsights.tsx`

- Import `reconcileDashboardTotals`
- Replace the existing `console.assert` (line 74-77) with a call to `reconcileDashboardTotals` passing `rangeEntries`, `summary.*` values, and label `Personal/${range}`
- No UI flag needed here (no Data Quality card on personal dashboard)

### QA test matrix (included as code comment)

```
// ── QA Reconciliation Test Matrix ────────────────────────────────
// SMOKE TEST (highest value combos — test these first):
//  1. Org + This week + By status
//  2. Org + This month + By project
//  3. Department + This week + By department
//  4. My dashboard + Today + By status
//  5. Org + This quarter + By status
//
// FULL MATRIX:
//  Scopes: My dashboard, Department, Organisation
//  Ranges: Today, This week, Last week, This month, This quarter, This year
//  Breakdowns: By status, By project, By department
//  Total combos: 3 × 6 × 3 = 54
//
// Personal Dashboard:
//  Ranges: Today, This week, Last week, This month, This quarter, This year
//  Total combos: 6
```

