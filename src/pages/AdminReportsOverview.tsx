import { useMemo, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCards } from '@/components/admin/MetricCards';
import { WeeklyChart } from '@/components/admin/WeeklyChart';
import { CohortWidget } from '@/components/admin/CohortWidget';
import { TeamSummaryTable } from '@/components/admin/TeamSummaryTable';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { useAuthenticatedUser } from '@/contexts/UserContext';
import { deriveMetrics, deriveOperationalInsights } from '@/data/reportsMockData';
import { getWeekStart } from '@/data/seed';
import { formatDuration } from '@/types';
import { AlertTriangle, Clock, HelpCircle, ShieldAlert } from 'lucide-react';

type RangeOption = 'this_week' | 'last_week' | 'this_month';

export default function AdminReportsOverview() {
  const { getAllEntries, weekStatuses } = useTimeEntries();
  const entries = getAllEntries();
  const { allUsers } = useAuthenticatedUser();
  const [range, setRange] = useState<RangeOption>('this_week');

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

  const metrics = useMemo(() => deriveMetrics(entries, weekStart, days), [entries, weekStart, days]);
  const insights = useMemo(() => deriveOperationalInsights(entries, weekStart, days, allUsers, weekStatuses), [entries, weekStart, days, allUsers, weekStatuses]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Reports Overview</h1>
          <Badge variant="secondary">Preview</Badge>
        </div>

        {/* Range selector */}
        <div className="mt-4 flex gap-1">
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

        <div className="mt-6 space-y-6">
          <MetricCards metrics={metrics} />

          {/* Operational insights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border bg-card rounded-lg p-4 flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Maybe billable</p>
                <p className="text-lg font-semibold">
                  {insights.maybeBillableCount} {insights.maybeBillableCount === 1 ? 'entry' : 'entries'}
                </p>
                <p className="text-xs text-muted-foreground">{formatDuration(insights.maybeBillableMinutes)} total</p>
              </div>
            </Card>
            <Card className="border-border bg-card rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Data quality</p>
                {insights.backdatedEntryCount > 0 ? (
                  <p className="text-lg font-semibold">
                    {insights.backdatedEntryCount} backdated {insights.backdatedEntryCount === 1 ? 'entry' : 'entries'}
                  </p>
                ) : (
                  <p className="text-lg font-semibold">No flags</p>
                )}
              </div>
            </Card>
            <Card className="border-border bg-card rounded-lg p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Weeks not submitted</p>
                <p className="text-lg font-semibold">
                  {insights.weeksNotSubmitted} {insights.weeksNotSubmitted === 1 ? 'user' : 'users'}
                </p>
              </div>
            </Card>
            <Card className="border-border bg-card rounded-lg p-4 flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Blocked by cap</p>
                <p className="text-lg font-semibold">{insights.blockedByCap}</p>
                <Badge variant="secondary" className="text-[10px] mt-1">Preview</Badge>
              </div>
            </Card>
          </div>

          <WeeklyChart range={range} />
          <TeamSummaryTable weekStart={weekStart} days={days} />
          <CohortWidget />
        </div>
      </main>
    </div>
  );
}
