import { Clock, TrendingUp, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthenticatedUser } from '@/contexts/UserContext';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { getWeekStart } from '@/data/seed';
import { formatHours, WEEKLY_EXPECTED_HOURS } from '@/types';
import { cn } from '@/lib/utils';

export function PersonalDashboard() {
  const { currentUser } = useAuthenticatedUser();
  const { getWeekSummary } = useTimeEntries();
  
  const currentWeekStart = getWeekStart();
  const weekSummary = getWeekSummary(currentUser.id, currentWeekStart);
  
  const expectedMinutes = WEEKLY_EXPECTED_HOURS * 60;
  const remainingMinutes = Math.max(0, expectedMinutes - weekSummary.totalMinutes);
  const utilizationRate = weekSummary.totalMinutes > 0 
    ? Math.round((weekSummary.billableMinutes / weekSummary.totalMinutes) * 100) 
    : 0;

  // Calculate working days remaining (simple: weekdays only)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const workingDaysRemaining = dayOfWeek === 0 ? 0 : Math.max(0, 5 - dayOfWeek);

  const stats = [
    {
      title: 'Logged this week',
      value: `${formatHours(weekSummary.totalMinutes)}h`,
      subtitle: `of ${WEEKLY_EXPECTED_HOURS}h target`,
      icon: Clock,
      color: 'text-primary',
    },
    {
      title: 'Hours remaining',
      value: `${formatHours(remainingMinutes)}h`,
      subtitle: `${workingDaysRemaining} working days left`,
      icon: Target,
      color: remainingMinutes > 0 ? 'text-warning' : 'text-muted-foreground',
    },
    {
      title: 'Billable rate',
      value: `${utilizationRate}%`,
      subtitle: `${formatHours(weekSummary.billableMinutes)}h billable`,
      icon: TrendingUp,
      color: utilizationRate >= 70 ? 'text-success' : 'text-muted-foreground',
    },
    {
      title: 'Week status',
      value: weekSummary.status?.isSubmitted ? 'Submitted' : 'In progress',
      subtitle: weekSummary.status?.isSubmitted 
        ? `on ${new Date(weekSummary.status.submittedAt!).toLocaleDateString('en-GB')}`
        : 'Not yet submitted',
      icon: Calendar,
      color: weekSummary.status?.isSubmitted ? 'text-success' : 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
