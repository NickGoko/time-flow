import { UserWeekSummary, CohortBucket, ReportMetrics, DailyBreakdown, TeamMemberSummary, ProjectBreakdownItem, OperationalInsights } from '@/types/reports';
import { TimeEntry, toTotalMinutes, User, WeekStatus, WEEKLY_EXPECTED_HOURS } from '@/types';
import { getWeekDate, parseLocalDate, projects } from '@/data/seed';

// ── Mock cohort data (8 synthetic users) ────────────────────────────
export const mockUserWeekSummaries: UserWeekSummary[] = [
  { userId: 'mock-1', totalMinutes: 2400, expectedMinutes: 2400, percentOfExpected: 100 },
  { userId: 'mock-2', totalMinutes: 2340, expectedMinutes: 2400, percentOfExpected: 97.5 },
  { userId: 'mock-3', totalMinutes: 2280, expectedMinutes: 2400, percentOfExpected: 95 },
  { userId: 'mock-4', totalMinutes: 2040, expectedMinutes: 2400, percentOfExpected: 85 },
  { userId: 'mock-5', totalMinutes: 1920, expectedMinutes: 2400, percentOfExpected: 80 },
  { userId: 'mock-6', totalMinutes: 1680, expectedMinutes: 2400, percentOfExpected: 70 },
  { userId: 'mock-7', totalMinutes: 1320, expectedMinutes: 2400, percentOfExpected: 55 },
  { userId: 'mock-8', totalMinutes: 1080, expectedMinutes: 2400, percentOfExpected: 45 },
];

export function buildCohortBuckets(summaries: UserWeekSummary[]): CohortBucket[] {
  const sorted = [...summaries].sort((a, b) => b.percentOfExpected - a.percentOfExpected);
  const top = sorted.filter(s => s.percentOfExpected >= 95);
  const mid = sorted.filter(s => s.percentOfExpected >= 60 && s.percentOfExpected < 95);
  const bottom = sorted.filter(s => s.percentOfExpected < 60);

  const bucket = (label: string, items: UserWeekSummary[]): CohortBucket => {
    if (items.length === 0) return { label, userCount: 0, avgPercentOfExpected: 0, minPercent: 0, maxPercent: 0 };
    const pcts = items.map(i => i.percentOfExpected);
    return {
      label,
      userCount: items.length,
      avgPercentOfExpected: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
      minPercent: Math.min(...pcts),
      maxPercent: Math.max(...pcts),
    };
  };

  return [bucket('Top 25%', top), bucket('Mid 50%', mid), bucket('Bottom 25%', bottom)];
}

// ── Live aggregate helpers ──────────────────────────────────────────

export function deriveMetrics(
  entries: TimeEntry[],
  weekStart: string,
  days: number,
  projectFilter?: string,
): ReportMetrics {
  const dates = Array.from({ length: days }, (_, i) => getWeekDate(weekStart, i));
  let filtered = entries.filter(e => dates.includes(e.date));
  if (projectFilter) filtered = filtered.filter(e => e.projectId === projectFilter);

  const totalMinutes = filtered.reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0);
  const billableMinutes = filtered.filter(e => e.billableStatus === 'billable').reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0);
  const maybeBillableMinutes = filtered.filter(e => e.billableStatus === 'maybe_billable').reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0);
  const notBillableMinutes = filtered.filter(e => e.billableStatus === 'not_billable').reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0);
  const activeUserCount = new Set(filtered.map(e => e.userId)).size;

  return { totalMinutes, billableMinutes, maybeBillableMinutes, notBillableMinutes, activeUserCount, periodLabel: '' };
}

export function deriveDailyBreakdown(
  entries: TimeEntry[],
  weekStart: string,
  days: number,
  projectFilter?: string,
): DailyBreakdown[] {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return Array.from({ length: days }, (_, i) => {
    const date = getWeekDate(weekStart, i);
    let dayEntries = entries.filter(e => e.date === date);
    if (projectFilter) dayEntries = dayEntries.filter(e => e.projectId === projectFilter);

    return {
      date,
      dayLabel: dayLabels[i % 7],
      billableMinutes: dayEntries.filter(e => e.billableStatus === 'billable').reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0),
      maybeBillableMinutes: dayEntries.filter(e => e.billableStatus === 'maybe_billable').reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0),
      notBillableMinutes: dayEntries.filter(e => e.billableStatus === 'not_billable').reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0),
    };
  });
}

// ── Project breakdown (top 5 + Other) ───────────────────────────────

export function deriveProjectBreakdown(
  entries: TimeEntry[],
  weekStart: string,
  days: number,
): ProjectBreakdownItem[] {
  const dates = Array.from({ length: days }, (_, i) => getWeekDate(weekStart, i));
  const filtered = entries.filter(e => dates.includes(e.date));

  const byProject = new Map<string, number>();
  for (const e of filtered) {
    byProject.set(e.projectId, (byProject.get(e.projectId) || 0) + toTotalMinutes(e.hours, e.minutes));
  }

  const sorted = [...byProject.entries()].sort((a, b) => b[1] - a[1]);
  const top5 = sorted.slice(0, 5).map(([projectId, totalMinutes]) => {
    const proj = projects.find(p => p.id === projectId);
    return { projectId, projectName: proj?.name ?? projectId, totalMinutes };
  });

  const otherMinutes = sorted.slice(5).reduce((s, [, m]) => s + m, 0);
  if (otherMinutes > 0) {
    top5.push({ projectId: 'other', projectName: 'Other', totalMinutes: otherMinutes });
  }

  return top5;
}

// ── Daily breakdown by project ──────────────────────────────────────

export function deriveDailyProjectBreakdown(
  entries: TimeEntry[],
  weekStart: string,
  days: number,
  projectItems: ProjectBreakdownItem[],
): Record<string, unknown>[] {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const topIds = new Set(projectItems.filter(p => p.projectId !== 'other').map(p => p.projectId));

  return Array.from({ length: days }, (_, i) => {
    const date = getWeekDate(weekStart, i);
    const dayEntries = entries.filter(e => e.date === date);
    const row: Record<string, unknown> = { date, dayLabel: dayLabels[i % 7] };

    for (const item of projectItems) {
      if (item.projectId === 'other') {
        row['other'] = dayEntries
          .filter(e => !topIds.has(e.projectId))
          .reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0);
      } else {
        row[item.projectId] = dayEntries
          .filter(e => e.projectId === item.projectId)
          .reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0);
      }
    }

    return row;
  });
}

// ── Team summary ────────────────────────────────────────────────────

export function deriveTeamSummary(
  entries: TimeEntry[],
  weekStart: string,
  days: number,
  allUsers: User[],
  weekStatuses: WeekStatus[],
): TeamMemberSummary[] {
  const dates = Array.from({ length: days }, (_, i) => getWeekDate(weekStart, i));
  const filtered = entries.filter(e => dates.includes(e.date));
  const expectedMinutes = WEEKLY_EXPECTED_HOURS * 60;

  return allUsers
    .map(user => {
      const userEntries = filtered.filter(e => e.userId === user.id);
      const totalMinutes = userEntries.reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0);
      const billableMinutes = userEntries.filter(e => e.billableStatus === 'billable').reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0);
      const maybeBillableMinutes = userEntries.filter(e => e.billableStatus === 'maybe_billable').reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0);

      const submitted = weekStatuses.some(
        ws => ws.userId === user.id && ws.weekStartDate === weekStart && ws.isSubmitted,
      );

      return {
        userId: user.id,
        userName: user.name,
        totalMinutes,
        compliancePercent: expectedMinutes > 0 ? Math.round((totalMinutes / expectedMinutes) * 100) : 0,
        billablePercent: totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0,
        maybeBillableMinutes,
        weekSubmitted: submitted,
      };
    })
    .sort((a, b) => a.userName.localeCompare(b.userName));
}

// ── Operational insights ────────────────────────────────────────────

export function deriveOperationalInsights(
  entries: TimeEntry[],
  weekStart: string,
  days: number,
): OperationalInsights {
  const dates = Array.from({ length: days }, (_, i) => getWeekDate(weekStart, i));
  const filtered = entries.filter(e => dates.includes(e.date));

  const maybeEntries = filtered.filter(e => e.billableStatus === 'maybe_billable');
  const maybeBillableCount = maybeEntries.length;
  const maybeBillableMinutes = maybeEntries.reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0);

  let backdatedEntryCount = 0;
  for (const e of filtered) {
    const entryDate = parseLocalDate(e.date);
    const createdDate = new Date(e.createdAt);
    const diffMs = createdDate.getTime() - entryDate.getTime();
    if (diffMs > 2 * 24 * 60 * 60 * 1000) {
      backdatedEntryCount++;
    }
  }

  return { maybeBillableCount, maybeBillableMinutes, backdatedEntryCount };
}
