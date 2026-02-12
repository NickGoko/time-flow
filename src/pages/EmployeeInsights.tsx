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
import { useCurrentUser } from '@/contexts/UserContext';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { toLocalDateString, parseLocalDate, getWeekStart, getWeekDate } from '@/data/seed';
import { getProjectById } from '@/data/seed';
import {
  formatHours,
  toTotalMinutes,
  WEEKLY_EXPECTED_HOURS,
  HOURS_PER_DAY_TARGET,
} from '@/types';
import { cn } from '@/lib/utils';

const EmployeeInsights = () => {
  const { currentUser } = useCurrentUser();
  const {
    entries,
    getWeekSummary,
    isWeekSubmitted,
    getWeeklyTotals,
    getRecentDays,
  } = useTimeEntries();

  const [showBillablePercent, setShowBillablePercent] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toLocalDateString(today);
  const currentWeekStart = getWeekStart(today);

  // ── Section 1: Today ──────────────────────────────────────────────
  const todayEntries = useMemo(
    () => entries.filter(e => e.userId === currentUser.id && e.date === todayStr),
    [entries, currentUser.id, todayStr]
  );

  const todayMinutes = useMemo(
    () => todayEntries.reduce((sum, e) => sum + toTotalMinutes(e.hours, e.minutes), 0),
    [todayEntries]
  );

  const todayBillable = useMemo(
    () => todayEntries.filter(e => e.billableStatus === 'billable').reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0),
    [todayEntries]
  );
  const todayMaybe = useMemo(
    () => todayEntries.filter(e => e.billableStatus === 'maybe_billable').reduce((s, e) => s + toTotalMinutes(e.hours, e.minutes), 0),
    [todayEntries]
  );
  const todayNotBillable = todayMinutes - todayBillable - todayMaybe;
  const todayTarget = HOURS_PER_DAY_TARGET * 60;
  const todayMissing = Math.max(0, todayTarget - todayMinutes);

  // ── Section 2: This Week ──────────────────────────────────────────
  const weekSummary = getWeekSummary(currentUser.id, currentWeekStart);
  const weekSubmitted = isWeekSubmitted(currentUser.id, currentWeekStart);
  const expectedWeekMinutes = WEEKLY_EXPECTED_HOURS * 60;
  const weekProgress = Math.min(100, Math.round((weekSummary.totalMinutes / expectedWeekMinutes) * 100));

  const topProjects = useMemo(() => {
    const projectTotals: Record<string, number> = {};
    for (const dayEntries of Object.values(weekSummary.entriesByDay)) {
      for (const e of dayEntries) {
        projectTotals[e.projectId] = (projectTotals[e.projectId] || 0) + toTotalMinutes(e.hours, e.minutes);
      }
    }
    return Object.entries(projectTotals)
      .map(([id, mins]) => ({ id, name: getProjectById(id)?.name ?? id, minutes: mins }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);
  }, [weekSummary]);

  // ── Section 3: Trend ──────────────────────────────────────────────
  const weeklyTotals = getWeeklyTotals(currentUser.id, 6);

  const chartConfig: ChartConfig = {
    hours: { label: 'Hours', color: 'hsl(var(--primary))' },
    billablePercent: { label: 'Billable %', color: 'hsl(var(--primary))' },
  };

  const chartData = weeklyTotals.map(w => {
    const d = parseLocalDate(w.weekStart);
    const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const billPct = w.totalMinutes > 0 ? Math.round((w.billableMinutes / w.totalMinutes) * 100) : 0;
    return {
      week: label,
      hours: +(w.totalMinutes / 60).toFixed(1),
      billablePercent: billPct,
    };
  });

  // ── Section 4: History ────────────────────────────────────────────
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
            <h1 className="text-2xl font-bold tracking-tight">History &amp; Insights</h1>
            <p className="text-muted-foreground text-sm">Your personal time tracking overview</p>
          </div>
        </div>

        {/* Section 1: Today */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" /> Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div>
                <span className="text-3xl font-bold tabular-nums">{formatHours(todayMinutes)}h</span>
                <span className="text-muted-foreground text-sm ml-2">/ {HOURS_PER_DAY_TARGET}h target</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Billable: {formatHours(todayBillable)}h</span>
                <span>Maybe: {formatHours(todayMaybe)}h</span>
                <span>Non-billable: {formatHours(todayNotBillable)}h</span>
              </div>
              {todayMissing > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-warning">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {formatHours(todayMissing)}h remaining
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Section 2: This Week */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">This Week</CardTitle>
              {weekSubmitted ? (
                <Badge variant="secondary">Submitted</Badge>
              ) : (
                <Badge variant="outline">In progress</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Weekly progress</span>
                <span className="font-medium tabular-nums">{formatHours(weekSummary.totalMinutes)}h / {WEEKLY_EXPECTED_HOURS}h</span>
              </div>
              <Progress value={weekProgress} className="h-2" />
            </div>

            {topProjects.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">Top projects</h4>
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
                          {weekSummary.totalMinutes > 0 ? Math.round((p.minutes / weekSummary.totalMinutes) * 100) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Trend */}
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

        {/* Section 4: History */}
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
