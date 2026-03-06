import { useMemo } from 'react';
import { toTotalMinutes } from '@/types';
import { getProjectById, getPhaseById, getActivityTypeById, internalWorkAreas } from '@/data/seed';
import { reconcileDashboardTotals, type ReconcileResult } from '@/lib/reconcile';

export interface DashboardTotals {
  totalMinutes: number;
  billableMinutes: number;
  maybeMinutes: number;
  notBillableMinutes: number;
}

export interface TopProject {
  id: string;
  name: string;
  minutes: number;
  billableMinutes: number;
  billablePct: number;
}

export interface TopActivity {
  label: string;
  minutes: number;
}

interface EntryLike {
  projectId: string;
  billableStatus: string;
  hours: number;
  minutes: number;
  phaseId?: string;
  activityTypeId?: string;
  workAreaId?: string;
  workAreaActivityTypeId?: string;
}

function getActivityLabel(entry: EntryLike): string {
  if (entry.phaseId) {
    const phase = getPhaseById(entry.phaseId);
    const activity = entry.activityTypeId ? getActivityTypeById(entry.activityTypeId) : undefined;
    if (phase && activity) return `${phase.name} → ${activity.name}`;
    if (phase) return phase.name;
  }
  if (entry.workAreaId) {
    const wa = internalWorkAreas.find(w => w.id === entry.workAreaId);
    const waPhase = wa ? getPhaseById(wa.phaseId) : undefined;
    const activity = entry.workAreaActivityTypeId ? getActivityTypeById(entry.workAreaActivityTypeId) : undefined;
    const areaName = waPhase?.name ?? wa?.name ?? 'Internal';
    return activity ? `${areaName} → ${activity.name}` : areaName;
  }
  return 'Uncategorised';
}

/**
 * Shared aggregation hook — single-pass computation of totals, top projects,
 * top activities, with built-in cross-widget reconciliation.
 *
 * Callers provide pre-filtered entries; this hook does NOT filter by scope/range/category.
 */
export function useDashboardData(entries: EntryLike[], label: string) {
  return useMemo(() => {
    // ── Single pass: totals + project map + activity map ──────────────
    let totalMinutes = 0, billableMinutes = 0, maybeMinutes = 0, notBillableMinutes = 0;
    const projMap: Record<string, { minutes: number; billableMinutes: number }> = {};
    const actMap: Record<string, number> = {};

    for (const e of entries) {
      const mins = toTotalMinutes(e.hours, e.minutes);
      totalMinutes += mins;
      if (e.billableStatus === 'billable') billableMinutes += mins;
      else if (e.billableStatus === 'maybe_billable') maybeMinutes += mins;
      else notBillableMinutes += mins;

      // project
      if (!projMap[e.projectId]) projMap[e.projectId] = { minutes: 0, billableMinutes: 0 };
      projMap[e.projectId].minutes += mins;
      if (e.billableStatus === 'billable') projMap[e.projectId].billableMinutes += mins;

      // activity
      const actLabel = getActivityLabel(e);
      actMap[actLabel] = (actMap[actLabel] || 0) + mins;
    }

    const totals: DashboardTotals = { totalMinutes, billableMinutes, maybeMinutes, notBillableMinutes };

    // ── Top Projects (top 5 + Other) ─────────────────────────────────
    const sortedProjects = Object.entries(projMap)
      .map(([id, data]) => ({
        id,
        name: getProjectById(id)?.name ?? id,
        minutes: data.minutes,
        billableMinutes: data.billableMinutes,
        billablePct: data.minutes > 0 ? Math.round((data.billableMinutes / data.minutes) * 100) : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    let topProjects: TopProject[];
    if (sortedProjects.length <= 5) {
      topProjects = sortedProjects;
    } else {
      topProjects = sortedProjects.slice(0, 5);
      const rest = sortedProjects.slice(5);
      const otherMins = rest.reduce((s, p) => s + p.minutes, 0);
      const otherBillMins = rest.reduce((s, p) => s + p.billableMinutes, 0);
      topProjects.push({
        id: '__other__',
        name: 'Other',
        minutes: otherMins,
        billableMinutes: otherBillMins,
        billablePct: otherMins > 0 ? Math.round((otherBillMins / otherMins) * 100) : 0,
      });
    }

    // ── Top Activities (top 8 + Other) ───────────────────────────────
    const sortedActivities = Object.entries(actMap)
      .map(([lbl, mins]) => ({ label: lbl, minutes: mins }))
      .sort((a, b) => b.minutes - a.minutes);

    let topActivities: TopActivity[];
    if (sortedActivities.length <= 8) {
      topActivities = sortedActivities;
    } else {
      topActivities = sortedActivities.slice(0, 8);
      const otherMins = sortedActivities.slice(8).reduce((s, a) => s + a.minutes, 0);
      if (otherMins > 0) topActivities.push({ label: 'Other', minutes: otherMins });
    }

    // ── Cross-widget reconciliation ──────────────────────────────────
    const TOLERANCE = 2;
    const issues: string[] = [];

    // Check 1: billing buckets sum to total
    const billingSum = billableMinutes + maybeMinutes + notBillableMinutes;
    if (Math.abs(billingSum - totalMinutes) > TOLERANCE) {
      issues.push(`Billing mix: ${billableMinutes}+${maybeMinutes}+${notBillableMinutes}=${billingSum} vs total=${totalMinutes}`);
    }

    // Check 2: topProjects sum matches total
    const projSum = topProjects.reduce((s, p) => s + p.minutes, 0);
    if (Math.abs(projSum - totalMinutes) > TOLERANCE) {
      issues.push(`Projects sum: ${projSum} vs total: ${totalMinutes}`);
    }

    // Check 3: topActivities sum matches total
    const actSum = topActivities.reduce((s, a) => s + a.minutes, 0);
    if (Math.abs(actSum - totalMinutes) > TOLERANCE) {
      issues.push(`Activities sum: ${actSum} vs total: ${totalMinutes}`);
    }

    // Check 4: entry-level sum matches total (catches hook vs caller drift)
    const entrySum = entries.reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0);
    if (Math.abs(entrySum - totalMinutes) > TOLERANCE) {
      issues.push(`Entry sum: ${entrySum} vs KPI total: ${totalMinutes}`);
    }

    const reconcileResult: ReconcileResult = {
      hasMismatch: issues.length > 0,
      details: issues,
    };

    if (issues.length > 0) {
      console.warn(`[Reconcile/${label}] Mismatch detected:`, issues);
    }

    return { totals, topProjects, topActivities, reconcileResult };
  }, [entries, label]);
}
