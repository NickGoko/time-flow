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
import { deriveDailyBreakdown, deriveProjectBreakdown, deriveDailyProjectBreakdown } from '@/data/reportsMockData';
import { getWeekStart, getWeekDate, projects } from '@/data/seed';
import { TimeEntry } from '@/types';

type RangeOption = 'this_week' | 'last_week' | 'this_month';
type BreakdownMode = 'billable_status' | 'top_projects';

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
  'hsl(0 0% 70%)', // "Other"
];

interface Props {
  range: RangeOption;
  entries?: TimeEntry[];
}

export function WeeklyChart({ range, entries: entriesProp }: Props) {
  const { getAllEntries } = useTimeEntries();
  const entries = entriesProp ?? getAllEntries();
  const [breakdownMode, setBreakdownMode] = useState<BreakdownMode>('billable_status');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const { weekStart, days } = useMemo(() => {
    const now = new Date();
    if (range === 'this_week') return { weekStart: getWeekStart(now), days: 7 };
    if (range === 'last_week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { weekStart: getWeekStart(d), days: 7 };
    }
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayCount = now.getDate();
    return { weekStart: getWeekStart(first), days: Math.min(dayCount + (first.getDay() === 0 ? 6 : first.getDay() - 1), 35) };
  }, [range]);

  // Status breakdown data
  const statusData = useMemo(
    () => deriveDailyBreakdown(entries, weekStart, days, projectFilter === 'all' ? undefined : projectFilter),
    [entries, weekStart, days, projectFilter],
  );

  // Project breakdown data
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

  const activeProjects = projects.filter(p => p.isActive && p.id !== 'proj-leave');

  const isStatusMode = breakdownMode === 'billable_status';

  return (
    <Card className="border-border bg-card rounded-lg p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Breakdown toggle */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={isStatusMode ? 'default' : 'outline'}
            onClick={() => setBreakdownMode('billable_status')}
          >
            By status
          </Button>
          <Button
            size="sm"
            variant={!isStatusMode ? 'default' : 'outline'}
            onClick={() => setBreakdownMode('top_projects')}
          >
            By project
          </Button>
        </div>

        {/* Project filter — only when in status mode */}
        {isStatusMode && (
          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {activeProjects.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isStatusMode ? (
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
      ) : (
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
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {isStatusMode ? (
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
        ) : (
          projectItems.map((item, i) => (
            <span key={item.projectId} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: PROJECT_COLOURS[i % PROJECT_COLOURS.length] }}
              />
              {item.projectName}
            </span>
          ))
        )}
      </div>
    </Card>
  );
}
