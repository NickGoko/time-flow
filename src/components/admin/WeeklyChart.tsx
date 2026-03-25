import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { deriveDailyBreakdown, deriveProjectBreakdown, deriveDailyProjectBreakdown, deriveDepartmentBreakdown, deriveDailyDepartmentBreakdown } from '@/data/reportsMockData';
import { getWeekStart, getWeekDate, projects, departments } from '@/data/seed';
import { TimeEntry, User } from '@/types';

type RangeOption = 'this_week' | 'last_week' | 'this_month' | 'today' | 'this_quarter' | 'this_year';
type BreakdownMode = 'billable_status' | 'top_projects' | 'top_departments';

const STATUS_CHART_CONFIG = {
  billableMinutes: { label: 'Billable', color: 'hsl(24 100% 55%)' },
  maybeBillableMinutes: { label: 'Maybe Billable', color: 'hsl(0 0% 46%)' },
  notBillableMinutes: { label: 'Not Billable', color: 'hsl(0 0% 92%)' },
};

const PROJECT_COLOURS = [
  'hsl(24 100% 55%)',
  'hsl(200 70% 50%)',
  'hsl(150 60% 45%)',
  'hsl(280 55% 55%)',
  'hsl(45 90% 50%)',
  'hsl(0 0% 70%)',
];

const DEPT_COLOURS = [
  'hsl(24 100% 55%)',
  'hsl(200 70% 50%)',
  'hsl(150 60% 45%)',
  'hsl(280 55% 55%)',
  'hsl(45 90% 50%)',
  'hsl(340 65% 55%)',
  'hsl(180 50% 45%)',
  'hsl(0 0% 70%)',
];

interface Props {
  range: RangeOption;
  entries?: TimeEntry[];
  users?: User[];
}

export function WeeklyChart({ range, entries: entriesProp, users: usersProp }: Props) {
  const { getAllEntries } = useTimeEntries();
  const entries = entriesProp ?? getAllEntries();
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>('billable_status');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const activeDepartments = departments.filter(d => d.isActive);
  const activeProjects = projects.filter(p => p.isActive && p.id !== 'proj-leave');

  // When switching breakdown mode, reset the sub-filter
  const handleBreakdownChange = (mode: BreakdownMode) => {
    setBreakdownMode(mode);
    setProjectFilter('all');
    setDepartmentFilter('all');
  };

  // Filter entries by selected single department (for "By department" drill-down)
  const deptFilteredEntries = useMemo(() => {
    if (departmentFilter === 'all' || !usersProp) return entries;
    const deptUserIds = new Set(usersProp.filter(u => u.departmentId === departmentFilter).map(u => u.id));
    return entries.filter(e => deptUserIds.has(e.userId));
  }, [entries, departmentFilter, usersProp]);

  const { weekStart, days } = useMemo(() => {
    const now = new Date();
    if (range === 'this_week') return { weekStart: getWeekStart(now), days: 5 };
    if (range === 'last_week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { weekStart: getWeekStart(d), days: 5 };
    }
    if (range === 'today') {
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      return { weekStart: todayStr, days: 1 };
    }
    if (range === 'this_quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const first = new Date(now.getFullYear(), qMonth, 1);
      const ws = getWeekStart(first);
      const startDate = new Date(ws);
      const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      return { weekStart: ws, days: Math.min(totalDays, 100) };
    }
    if (range === 'this_year') {
      const first = new Date(now.getFullYear(), 0, 1);
      const ws = getWeekStart(first);
      const startDate = new Date(ws);
      const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;
      return { weekStart: ws, days: Math.min(totalDays, 366) };
    }
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayCount = now.getDate();
    return { weekStart: getWeekStart(first), days: Math.min(dayCount + (first.getDay() === 0 ? 6 : first.getDay() - 1), 35) };
  }, [range]);

  // ── Status breakdown ──
  const statusData = useMemo(
    () => deriveDailyBreakdown(
      breakdownMode === 'top_departments' && departmentFilter !== 'all' ? deptFilteredEntries : entries,
      weekStart,
      days,
      breakdownMode === 'top_projects' && projectFilter !== 'all' ? projectFilter : undefined,
    ),
    [entries, deptFilteredEntries, weekStart, days, projectFilter, departmentFilter, breakdownMode],
  );

  // ── Project breakdown ──
  const projectItems = useMemo(
    () => deriveProjectBreakdown(entries, weekStart, days),
    [entries, weekStart, days],
  );
  const projectData = useMemo(
    () => deriveDailyProjectBreakdown(entries, weekStart, days, projectItems),
    [entries, weekStart, days, projectItems],
  );
  const projectChartConfig = useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {};
    projectItems.forEach((item, i) => {
      cfg[item.projectId] = { label: item.projectName, color: PROJECT_COLOURS[i % PROJECT_COLOURS.length] };
    });
    return cfg;
  }, [projectItems]);

  // ── Department breakdown ──
  const deptItems = useMemo(
    () => usersProp ? deriveDepartmentBreakdown(entries, weekStart, days, usersProp) : [],
    [entries, weekStart, days, usersProp],
  );
  const deptData = useMemo(
    () => usersProp ? deriveDailyDepartmentBreakdown(entries, weekStart, days, deptItems, usersProp) : [],
    [entries, weekStart, days, deptItems, usersProp],
  );
  const deptChartConfig = useMemo(() => {
    const cfg: Record<string, { label: string; color: string }> = {};
    deptItems.forEach((item, i) => {
      cfg[item.departmentId] = { label: item.departmentName, color: DEPT_COLOURS[i % DEPT_COLOURS.length] };
    });
    return cfg;
  }, [deptItems]);

  // Determine what to render
  const showStatusChart = breakdownMode === 'billable_status'
    || (breakdownMode === 'top_projects' && projectFilter !== 'all')
    || (breakdownMode === 'top_departments' && departmentFilter !== 'all');

  return (
    <Card className="border-border bg-card rounded-lg p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Breakdown toggle */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={breakdownMode === 'billable_status' ? 'default' : 'outline'}
            onClick={() => handleBreakdownChange('billable_status')}
          >
            By status
          </Button>
          <Button
            size="sm"
            variant={breakdownMode === 'top_projects' ? 'default' : 'outline'}
            onClick={() => handleBreakdownChange('top_projects')}
          >
            By project
          </Button>
          <Button
            size="sm"
            variant={breakdownMode === 'top_departments' ? 'default' : 'outline'}
            onClick={() => handleBreakdownChange('top_departments')}
          >
            By department
          </Button>
        </div>

        {/* Project dropdown — only in project mode */}
        {breakdownMode === 'top_projects' && (
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {activeProjects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Department dropdown — only in department mode */}
        {breakdownMode === 'top_departments' && (
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {activeDepartments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {showStatusChart ? (
        <ChartContainer config={STATUS_CHART_CONFIG} className="aspect-[2/1] w-full">
          <BarChart data={statusData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(v: number) => `${Math.round(v / 60)}h`} />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="billableMinutes" stackId="a" fill="var(--color-billableMinutes)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="maybeBillableMinutes" stackId="a" fill="var(--color-maybeBillableMinutes)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="notBillableMinutes" stackId="a" fill="var(--color-notBillableMinutes)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      ) : breakdownMode === 'top_projects' ? (
        <ChartContainer config={projectChartConfig} className="aspect-[2/1] w-full">
          <BarChart data={projectData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(v: number) => `${Math.round(v / 60)}h`} />
            <Tooltip content={<ChartTooltipContent />} />
            {projectItems.map((item, i) => (
              <Bar
                key={item.projectId}
                dataKey={item.projectId}
                stackId="a"
                fill={PROJECT_COLOURS[i % PROJECT_COLOURS.length]}
                radius={i === projectItems.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      ) : (
        <ChartContainer config={deptChartConfig} className="aspect-[2/1] w-full">
          <BarChart data={deptData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(v: number) => `${Math.round(v / 60)}h`} />
            <Tooltip content={<ChartTooltipContent />} />
            {deptItems.map((item, i) => (
              <Bar
                key={item.departmentId}
                dataKey={item.departmentId}
                stackId="a"
                fill={DEPT_COLOURS[i % DEPT_COLOURS.length]}
                radius={i === deptItems.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ChartContainer>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {showStatusChart ? (
          <>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" /> Billable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-muted-foreground" /> Maybe Billable
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-secondary" /> Not Billable
            </span>
          </>
        ) : breakdownMode === 'top_projects' ? (
          projectItems.map((item, i) => (
            <span key={item.projectId} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: PROJECT_COLOURS[i % PROJECT_COLOURS.length] }}
              />
              {item.projectName}
            </span>
          ))
        ) : (
          deptItems.map((item, i) => (
            <span key={item.departmentId} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: DEPT_COLOURS[i % DEPT_COLOURS.length] }}
              />
              {item.departmentName}
            </span>
          ))
        )}
      </div>
    </Card>
  );
}
