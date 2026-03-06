import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useAuthenticatedUser } from '@/contexts/UserContext';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { toLocalDateString, parseLocalDate, getProjectById, getPhaseById, getActivityTypeById, internalWorkAreas } from '@/data/seed';
import {
  formatHours,
  toTotalMinutes,
} from '@/types';
import { cn, getProgressColor } from '@/lib/utils';
import { type RangeOption, getDateWindow, getExpectedMinutes } from '@/hooks/useDashboardDataset';

const RANGE_OPTIONS: { value: RangeOption; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'last_week', label: 'Last week' },
  { value: 'this_month', label: 'This month' },
  { value: 'this_quarter', label: 'This quarter' },
  { value: 'this_year', label: 'This year' },
];

function getActivityLabel(entry: { phaseId?: string; activityTypeId?: string; workAreaId?: string; workAreaActivityTypeId?: string }): string {
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

const EmployeeInsights = () => {
  const { currentUser } = useAuthenticatedUser();
  const { getOwnEntries, getWeeklyTotals, getRecentDays } = useTimeEntries();
  const [range, setRange] = useState<RangeOption>('this_week');

  const ownEntries = getOwnEntries();
  const { rangeStartDate, rangeEndDate, days } = useMemo(() => getDateWindow(range), [range]);

  // ── Range-filtered entries ─────────────────────────────────────────
  const rangeEntries = useMemo(() => {
    const startStr = toLocalDateString(rangeStartDate);
    const endStr = toLocalDateString(rangeEndDate);
    return ownEntries.filter(e => e.userId === currentUser.id && e.date >= startStr && e.date <= endStr);
  }, [ownEntries, currentUser.id, rangeStartDate, rangeEndDate]);

  // ── Aggregated summary ─────────────────────────────────────────────
  const summary = useMemo(() => {
    let totalMinutes = 0, billableMinutes = 0, maybeMinutes = 0, notBillableMinutes = 0;
    for (const e of rangeEntries) {
      const mins = toTotalMinutes(e.hours, e.minutes);
      totalMinutes += mins;
      if (e.billableStatus === 'billable') billableMinutes += mins;
      else if (e.billableStatus === 'maybe_billable') maybeMinutes += mins;
      else notBillableMinutes += mins;
    }
    // Dev reconciliation check
    console.assert(
      billableMinutes + maybeMinutes + notBillableMinutes === totalMinutes,
      `Billing mix mismatch: ${billableMinutes}+${maybeMinutes}+${notBillableMinutes} !== ${totalMinutes}`
    );
    return { totalMinutes, billableMinutes, maybeMinutes, notBillableMinutes };
  }, [rangeEntries]);

  const expectedMinutes = getExpectedMinutes(range, days);
  const progressPct = expectedMinutes > 0 ? Math.round((summary.totalMinutes / expectedMinutes) * 100) : 0;
  const progressColor = getProgressColor(progressPct);
  const overtime = Math.max(0, summary.totalMinutes - expectedMinutes);
  const remaining = Math.max(0, expectedMinutes - summary.totalMinutes);

  // ── Top Projects ───────────────────────────────────────────────────
  const topProjects = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of rangeEntries) {
      map[e.projectId] = (map[e.projectId] || 0) + toTotalMinutes(e.hours, e.minutes);
    }
    const sorted = Object.entries(map)
      .map(([id, mins]) => ({ id, name: getProjectById(id)?.name ?? id, minutes: mins }))
      .sort((a, b) => b.minutes - a.minutes);
    if (sorted.length <= 5) return sorted;
    const top5 = sorted.slice(0, 5);
    const otherMins = sorted.slice(5).reduce((s, p) => s + p.minutes, 0);
    top5.push({ id: '__other__', name: 'Other', minutes: otherMins });
    return top5;
  }, [rangeEntries]);

  // ── Top Activities ─────────────────────────────────────────────────
  const topActivities = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of rangeEntries) {
      const label = getActivityLabel(e);
      map[label] = (map[label] || 0) + toTotalMinutes(e.hours, e.minutes);
    }
    return Object.entries(map)
      .map(([label, mins]) => ({ label, minutes: mins }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 8);
  }, [rangeEntries]);

  // ── 6-Week Trend (unchanged) ───────────────────────────────────────
  const [showBillablePercent, setShowBillablePercent] = useState(false);
  const weeklyTotals = getWeeklyTotals(currentUser.id, 6);

  const chartConfig: ChartConfig = {
    hours: { label: 'Hours', color: 'hsl(var(--primary))' },
    billablePercent: { label: 'Billable %', color: 'hsl(var(--primary))' },
  };

  const chartData = weeklyTotals.map(w => {
    const d = parseLocalDate(w.weekStart);
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const billPct = w.totalMinutes > 0 ? Math.round((w.billableMinutes / w.totalMinutes) * 100) : 0;
    return { week: label, hours: +(w.totalMinutes / 60).toFixed(1), billablePercent: billPct };
  });

  // ── Recent History (unchanged) ─────────────────────────────────────
  const recentDays = getRecentDays(currentUser.id, 28);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container py-8 px-4 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Your personal time tracking overview</p>
          </div>
        </div>

        {/* Range chips */}
        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map(opt => (
            <Button
              key={opt.value}
              variant={range === opt.value ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setRange(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* Summary card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" /> Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn('font-medium tabular-nums', progressColor.text)}>
                  {formatHours(summary.totalMinutes)}h / {formatHours(expectedMinutes)}h ({progressPct}%)
                  {overtime > 0 && <span className="ml-1.5 text-success">· Overtime +{formatHours(overtime)}h</span>}
                </span>
              </div>
              <Progress value={Math.min(100, progressPct)} className="h-2" />
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>Billable: {formatHours(summary.billableMinutes)}h</span>
              <span>Maybe: {formatHours(summary.maybeMinutes)}h</span>
              <span>Non-billable: {formatHours(summary.notBillableMinutes)}h</span>
            </div>
            {remaining > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-warning">
                <AlertCircle className="h-3.5 w-3.5" />
                {formatHours(remaining)}h remaining
              </div>
            )}
          </CardContent>
        </Card>

        {/* Breakdown tables */}
        {rangeEntries.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground text-center">No entries for this period</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Projects */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Top projects</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8 text-xs">Project</TableHead>
                      <TableHead className="h-8 text-xs text-right">Hours</TableHead>
                      <TableHead className="h-8 text-xs text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProjects.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="py-1.5 text-sm">{p.name}</TableCell>
                        <TableCell className="py-1.5 text-sm text-right tabular-nums">{formatHours(p.minutes)}h</TableCell>
                        <TableCell className="py-1.5 text-sm text-right tabular-nums">
                          {summary.totalMinutes > 0 ? Math.round((p.minutes / summary.totalMinutes) * 100) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Activities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">Top activities / tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8 text-xs">Activity</TableHead>
                      <TableHead className="h-8 text-xs text-right">Hours</TableHead>
                      <TableHead className="h-8 text-xs text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topActivities.map(a => (
                      <TableRow key={a.label}>
                        <TableCell className="py-1.5 text-sm">{a.label}</TableCell>
                        <TableCell className="py-1.5 text-sm text-right tabular-nums">{formatHours(a.minutes)}h</TableCell>
                        <TableCell className="py-1.5 text-sm text-right tabular-nums">
                          {summary.totalMinutes > 0 ? Math.round((a.minutes / summary.totalMinutes) * 100) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 6-Week Trend */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> 6-Week Trend
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setShowBillablePercent(p => !p)}
              >
                {showBillablePercent ? 'Show hours' : 'Show billable %'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey={showBillablePercent ? 'billablePercent' : 'hours'}
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent History */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Recent History</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDays.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No entries found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8 text-xs">Date</TableHead>
                    <TableHead className="h-8 text-xs text-right">Hours</TableHead>
                    <TableHead className="h-8 text-xs text-right">Billable %</TableHead>
                    <TableHead className="h-8 text-xs text-center">Submitted</TableHead>
                    <TableHead className="h-8 text-xs text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDays.map(day => {
                    const d = parseLocalDate(day.date);
                    const formatted = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                    return (
                      <TableRow key={day.date}>
                        <TableCell className="py-1.5 text-sm">{formatted}</TableCell>
                        <TableCell className="py-1.5 text-sm text-right tabular-nums">{formatHours(day.totalMinutes)}h</TableCell>
                        <TableCell className="py-1.5 text-sm text-right tabular-nums">{day.billablePercent}%</TableCell>
                        <TableCell className="py-1.5 text-center">
                          {day.isSubmitted === null ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : day.isSubmitted ? (
                            <Badge variant="secondary" className="text-xs">Yes</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">No</span>
                          )}
                        </TableCell>
                        <TableCell className="py-1.5 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                            <Link to="/">View week</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EmployeeInsights;
