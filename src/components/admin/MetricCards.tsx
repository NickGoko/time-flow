import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ReportMetrics } from '@/types/reports';
import { formatDuration } from '@/types';

interface MetricCardsProps {
  metrics: ReportMetrics;
  expectedMinutes?: number;
}

export function MetricCards({ metrics, expectedMinutes }: MetricCardsProps) {
  const billablePercent =
    metrics.totalMinutes > 0
      ? Math.round((metrics.billableMinutes / metrics.totalMinutes) * 100)
      : 0;

  const registeredPercent =
    expectedMinutes && expectedMinutes > 0
      ? Math.round((metrics.totalMinutes / expectedMinutes) * 100)
      : undefined;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* Total registered */}
      <Card className="border-border bg-card rounded-lg p-4">
        <p className="text-xs text-muted-foreground">Total registered</p>
        <p className="mt-1 text-2xl font-semibold">{formatDuration(metrics.totalMinutes)}</p>
        {registeredPercent !== undefined && (
          <p className="mt-1 text-xs text-muted-foreground">
            {registeredPercent}% of {formatDuration(expectedMinutes!)} expected
          </p>
        )}
      </Card>

      {/* Billable rate */}
      <Card className="border-border bg-card rounded-lg p-4">
        <p className="text-xs text-muted-foreground">Billable rate</p>
        <p className="mt-1 text-2xl font-semibold">{billablePercent}%</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{formatDuration(metrics.billableMinutes)} billable</p>
        <Progress value={billablePercent} className="mt-2 h-1.5" />
      </Card>

      {/* Not billable */}
      <Card className="border-border bg-card rounded-lg p-4">
        <p className="text-xs text-muted-foreground">Not billable</p>
        <p className="mt-1 text-2xl font-semibold">{formatDuration(metrics.notBillableMinutes)}</p>
        {metrics.maybeBillableMinutes > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            + {formatDuration(metrics.maybeBillableMinutes)} maybe billable
          </p>
        )}
      </Card>

      {/* Active users */}
      <Card className="border-border bg-card rounded-lg p-4">
        <p className="text-xs text-muted-foreground">Active users</p>
        <p className="mt-1 text-2xl font-semibold">{metrics.activeUserCount}</p>
      </Card>
    </div>
  );
}
