import { DEV_MODE } from './devMode';

export interface ReconcileInput {
  entries: { billableStatus: string; hours: number; minutes: number }[];
  kpiTotalMinutes: number;
  kpiBillable: number;
  kpiMaybe: number;
  kpiNotBillable: number;
  teamRowsTotalMinutes?: number;
  label: string;
}

export interface ReconcileResult {
  hasMismatch: boolean;
  details: string[];
}

export function reconcileDashboardTotals(input: ReconcileInput): ReconcileResult {
  const TOLERANCE = 1;
  const details: string[] = [];

  const billingSum = input.kpiBillable + input.kpiMaybe + input.kpiNotBillable;
  if (Math.abs(billingSum - input.kpiTotalMinutes) > TOLERANCE) {
    details.push(`Billing mix: ${input.kpiBillable}+${input.kpiMaybe}+${input.kpiNotBillable}=${billingSum} vs total=${input.kpiTotalMinutes}`);
  }

  const entrySum = input.entries.reduce((s, e) => s + (e.hours * 60 + e.minutes), 0);
  if (Math.abs(entrySum - input.kpiTotalMinutes) > TOLERANCE) {
    details.push(`Entry sum: ${entrySum} vs KPI total: ${input.kpiTotalMinutes}`);
  }

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
