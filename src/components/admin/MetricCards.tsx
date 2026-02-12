import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ReportMetrics } from '@/types/reports';
import { formatDuration } from '@/types';

interface MetricCardsProps {
  metrics: ReportMetrics;
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const billablePercent =
    metrics.totalMinutes > 0
      ? Math.round((metrics.billableMinutes / metrics.totalMinutes) * 100)
      : 0;

  const nonBillableMinutes = metrics.notBillableMinutes + metrics.maybeBillableMinutes;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Total Hours */}
      <Card className="border-border bg-card rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Total Hours</p>
        <p className="mt-1 text-2xl font-semibold">{formatDuration(metrics.totalMinutes)}</p>
      </Card>

      {/* Billable % */}
      <Card className="border-border bg-card rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Billable %</p>
        <p className="mt-1 text-2xl font-semibold">{billablePercent}%</p>
        <Progress value={billablePercent} className="mt-2 h-1.5" />
      </Card>

      {/* Non-billable Hours */}
      <Card className="border-border bg-card rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Non-billable Hours</p>
        <p className="mt-1 text-2xl font-semibold">{formatDuration(nonBillableMinutes)}</p>
      </Card>

      {/* Active Users */}
      <Card className="border-border bg-card rounded-lg p-4">
        <p className="text-sm text-muted-foreground">Active Users</p>
        <p className="mt-1 text-2xl font-semibold">{metrics.activeUserCount}</p>
      </Card>
    </div>
  );
}
