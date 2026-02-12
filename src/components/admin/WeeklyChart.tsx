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
import { deriveDailyBreakdown } from '@/data/reportsMockData';
import { getWeekStart, getWeekDate } from '@/data/seed';
import { projects } from '@/data/seed';

type RangeOption = 'this_week' | 'last_week' | 'this_month';

const chartConfig = {
  billableMinutes: { label: 'Billable', color: 'hsl(24 100% 55%)' },
  maybeBillableMinutes: { label: 'Maybe Billable', color: 'hsl(0 0% 46%)' },
  notBillableMinutes: { label: 'Not Billable', color: 'hsl(0 0% 92%)' },
};

export function WeeklyChart() {
  const { entries } = useTimeEntries();
  const [range, setRange] = useState<RangeOption>('this_week');
  const [projectFilter, setProjectFilter] = useState<string>('all');

  const { weekStart, days } = useMemo(() => {
    const now = new Date();
    if (range === 'this_week') {
      return { weekStart: getWeekStart(now), days: 7 };
    }
    if (range === 'last_week') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return { weekStart: getWeekStart(d), days: 7 };
    }
    // this_month — from 1st of current month to today
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayCount = now.getDate();
    // align to Monday of the week containing the 1st
    return { weekStart: getWeekStart(first), days: Math.min(dayCount + (first.getDay() === 0 ? 6 : first.getDay() - 1), 35) };
  }, [range]);

  const data = useMemo(
    () => deriveDailyBreakdown(entries, weekStart, days, projectFilter === 'all' ? undefined : projectFilter),
    [entries, weekStart, days, projectFilter],
  );

  const activeProjects = projects.filter(p => p.isActive && p.id !== 'proj-leave');

  return (
    <Card className="border-border bg-card rounded-lg p-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {([['this_week', 'This week'], ['last_week', 'Last week'], ['this_month', 'This month']] as const).map(
            ([value, label]) => (
              <Button
                key={value}
                size="sm"
                variant={range === value ? 'default' : 'outline'}
                onClick={() => setRange(value)}
              >
                {label}
              </Button>
            ),
          )}
        </div>

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
      </div>

      <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${Math.round(v / 60)}h`}
          />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar dataKey="billableMinutes" stackId="a" fill="var(--color-billableMinutes)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="maybeBillableMinutes" stackId="a" fill="var(--color-maybeBillableMinutes)" radius={[0, 0, 0, 0]} />
          <Bar dataKey="notBillableMinutes" stackId="a" fill="var(--color-notBillableMinutes)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" /> Billable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-muted-foreground" /> Maybe Billable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-secondary" /> Not Billable
        </span>
      </div>
    </Card>
  );
}
