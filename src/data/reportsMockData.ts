import { UserWeekSummary, CohortBucket, ReportMetrics, DailyBreakdown } from '@/types/reports';
import { TimeEntry, toTotalMinutes } from '@/types';
import { getWeekDate, parseLocalDate } from '@/data/seed';

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
