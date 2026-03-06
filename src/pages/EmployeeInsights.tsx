import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { ReconciliationBanner } from '@/components/ReconciliationBanner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthenticatedUser } from '@/contexts/UserContext';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { toLocalDateString, parseLocalDate, getProjectById, internalWorkAreas, projects, getWeekStart } from '@/data/seed';
import {
  formatHours,
  toTotalMinutes,
} from '@/types';
import { cn, getProgressColor } from '@/lib/utils';
import { type RangeOption, getDateWindow, getExpectedMinutes } from '@/hooks/useDashboardDataset';
import { useDashboardData } from '@/hooks/useDashboardData';

const RANGE_OPTIONS: { value: RangeOption; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'last_week', label: 'Last week' },
  { value: 'this_month', label: 'This month' },
  { value: 'this_quarter', label: 'This quarter' },
  { value: 'this_year', label: 'This year' },
];

type CategoryFilter = 'all' | 'external' | 'internal';

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'external', label: 'External projects' },
  { value: 'internal', label: 'Internal projects' },
];

const STATUS_CHART_CONFIG: ChartConfig = {
  billable: { label: 'Billable', color: 'hsl(24 100% 55%)' },
  maybe: { label: 'Maybe Billable', color: 'hsl(0 0% 46%)' },
  notBillable: { label: 'Not Billable', color: 'hsl(0 0% 92%)' },
};


function matchesCategory(projectId: string, category: CategoryFilter): boolean {
  if (category === 'all') return true;
  const project = getProjectById(projectId);
  if (!project) return true;
  return category === 'external'
    ? project.type === 'external_project'
    : project.type === 'internal_department';
}

const EmployeeInsights = () => {
  const { currentUser } = useAuthenticatedUser();
  const { getOwnEntries, getRecentDays } = useTimeEntries();
  const [range, setRange] = useState<RangeOption>('this_week');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [trendView, setTrendView] = useState<'hours' | 'billing_mix'>('hours');

  // Reset project filter when category changes
  useEffect(() => { setProjectFilter('all'); }, [category]);

  const ownEntries = getOwnEntries();
  const { rangeStartDate, rangeEndDate, days } = useMemo(() => getDateWindow(range), [range]);

  // ── Available projects for dropdown ────────────────────────────────
  const availableProjects = useMemo(() => {
    return projects.filter(p => {
      if (!p.isActive) return false;
      if (category === 'external') return p.type === 'external_project';
      if (category === 'internal') return p.type === 'internal_department' && p.owningDepartmentId === currentUser.departmentId;
      // 'all': show both external + user's internal
      return p.type === 'external_project' || (p.type === 'internal_department' && p.owningDepartmentId === currentUser.departmentId);
    });
  }, [category, currentUser.departmentId]);

  // ── Range + category + project filtered entries ────────────────────
  const rangeEntries = useMemo(() => {
    const startStr = toLocalDateString(rangeStartDate);
    const endStr = toLocalDateString(rangeEndDate);
    return ownEntries.filter(e => {
      if (e.userId !== currentUser.id) return false;
      if (e.date < startStr || e.date > endStr) return false;
      if (!matchesCategory(e.projectId, category)) return false;
      if (projectFilter !== 'all' && e.projectId !== projectFilter) return false;
      return true;
    });
  }, [ownEntries, currentUser.id, rangeStartDate, rangeEndDate, category, projectFilter]);

  // ── Aggregated data (single-pass via shared hook) ───────────────────
  const dashLabel = `Personal/${range}/${category}/${projectFilter}`;
  const { totals: summary, topProjects, topActivities, reconcileResult } = useDashboardData(rangeEntries, dashLabel);

  const expectedMinutes = getExpectedMinutes(range, days);
  const progressPct = expectedMinutes > 0 ? Math.round((summary.totalMinutes / expectedMinutes) * 100) : 0;
  const progressColor = getProgressColor(progressPct);
  const overtime = Math.max(0, summary.totalMinutes - expectedMinutes);
  const remaining = Math.max(0, expectedMinutes - summary.totalMinutes);

  // ── 6-Week Trend (filter-aware) ────────────────────────────────────
  const chartData = useMemo(() => {
    // Get 6 week boundaries
    const now = new Date();
    const weeks: { start: string; end: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);
      const ws = getWeekStart(d);
      const startDate = parseLocalDate(ws);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      const label = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      weeks.push({ start: ws, end: toLocalDateString(endDate), label });
    }

    // Filter all own entries by category + project, then bucket by week
    const filtered = ownEntries.filter(e => {
      if (e.userId !== currentUser.id) return false;
      if (!matchesCategory(e.projectId, category)) return false;
      if (projectFilter !== 'all' && e.projectId !== projectFilter) return false;
      return true;
    });

    return weeks.map(w => {
      let totalMinutes = 0, billableMinutes = 0, maybeMinutes = 0, notBillableMinutes = 0;
      for (const e of filtered) {
        if (e.date >= w.start && e.date <= w.end) {
          const mins = toTotalMinutes(e.hours, e.minutes);
          totalMinutes += mins;
          if (e.billableStatus === 'billable') billableMinutes += mins;
          else if (e.billableStatus === 'maybe_billable') maybeMinutes += mins;
          else notBillableMinutes += mins;
        }
      }
      return {
        week: w.label,
        hours: +(totalMinutes / 60).toFixed(1),
        billablePercent: totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 0,
        billable: +(billableMinutes / 60).toFixed(1),
        maybe: +(maybeMinutes / 60).toFixed(1),
        notBillable: +(notBillableMinutes / 60).toFixed(1),
      };
    });
  }, [ownEntries, currentUser.id, category, projectFilter]);

  const hoursChartConfig: ChartConfig = {
    hours: { label: 'Hours', color: 'hsl(var(--primary))' },
  };

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

        {/* Category chips + Project dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map(opt => (
              <Button
                key={opt.value}
                variant={category === opt.value ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setCategory(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[200px] h-8 text-xs">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {availableProjects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ReconciliationBanner result={reconcileResult} />

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
                      <TableHead className="h-8 text-xs text-right">Billable %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProjects.map(p => (
                      <TableRow
                        key={p.id}
                        className={cn(p.id !== '__other__' && 'cursor-pointer', projectFilter === p.id && 'bg-muted')}
                        onClick={() => { if (p.id !== '__other__') setProjectFilter(p.id); }}
                      >
                        <TableCell className="py-1.5 text-sm">{p.name}</TableCell>
                        <TableCell className="py-1.5 text-sm text-right tabular-nums">{formatHours(p.minutes)}h</TableCell>
                        <TableCell className="py-1.5 text-sm text-right tabular-nums">
                          {summary.totalMinutes > 0 ? Math.round((p.minutes / summary.totalMinutes) * 100) : 0}%
                        </TableCell>
                        <TableCell className="py-1.5 text-sm text-right tabular-nums">{p.billablePct}%</TableCell>
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
                onClick={() => setTrendView(v => v === 'hours' ? 'billing_mix' : 'hours')}
              >
                {trendView === 'hours' ? 'Show billing mix' : 'Show hours'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {trendView === 'hours' ? (
              <ChartContainer config={hoursChartConfig} className="aspect-[2/1] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <ChartContainer config={STATUS_CHART_CONFIG} className="aspect-[2/1] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} className="text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="billable" stackId="a" fill="hsl(24 100% 55%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="maybe" stackId="a" fill="hsl(0 0% 46%)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="notBillable" stackId="a" fill="hsl(0 0% 92%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
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
