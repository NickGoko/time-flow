import { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MetricCards } from '@/components/admin/MetricCards';
import { WeeklyChart } from '@/components/admin/WeeklyChart';
import { CohortWidget } from '@/components/admin/CohortWidget';
import { TeamSummaryTable } from '@/components/admin/TeamSummaryTable';
import { useDashboardDataset, RangeOption, ScopeOption } from '@/hooks/useDashboardDataset';
import { formatDuration } from '@/types';
import { AlertTriangle, Clock, HelpCircle, ShieldAlert } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { ReconciliationBanner } from '@/components/ReconciliationBanner';

export default function AdminReportsOverview() {
  const [range, setRange] = useState<RangeOption>('this_week');

  // Determine default scope based on role (need canViewOrg/canViewDepartment before hook, but hook needs scope)
  // We'll initialise scope then pass it in
  const [scope, setScope] = useState<ScopeOption>('org');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  const {
    scopedEntries, scopedUsers, scopedWeekStatuses,
    weekStart, days,
    metrics, insights, blockedByCapCount,
    availableDepartments, canViewDepartment, canViewOrg,
  } = useDashboardDataset(scope, selectedDeptId, range);

  const { reconcileResult } = useDashboardData(scopedEntries, `Reports/${scope}/${range}`);

  // Set default dept if not yet set
  if (!selectedDeptId && availableDepartments.length > 0) {
    setSelectedDeptId(availableDepartments[0].id);
  }

  // Correct scope if user doesn't have permission
  if (scope === 'org' && !canViewOrg && canViewDepartment) {
    setScope('department');
  } else if (scope === 'org' && !canViewOrg && !canViewDepartment) {
    setScope('my');
  } else if (scope === 'department' && !canViewDepartment) {
    setScope('my');
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboards</h1>
          <Badge variant="secondary">Preview</Badge>
        </div>

        {/* Scope selector */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex gap-1">
            <Button size="sm" variant={scope === 'my' ? 'default' : 'outline'} onClick={() => setScope('my')}>
              My dashboard
            </Button>
            {canViewDepartment && (
              <Button size="sm" variant={scope === 'department' ? 'default' : 'outline'} onClick={() => setScope('department')}>
                Department
              </Button>
            )}
            {canViewOrg && (
              <Button size="sm" variant={scope === 'org' ? 'default' : 'outline'} onClick={() => setScope('org')}>
                Organisation
              </Button>
            )}
          </div>

          {scope === 'department' && availableDepartments.length > 1 && (
            <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {availableDepartments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Range selector */}
        <div className="mt-3 flex flex-wrap gap-1">
          {([['today', 'Today'], ['this_week', 'This week'], ['last_week', 'Last week'], ['this_month', 'This month'], ['this_quarter', 'This quarter'], ['this_year', 'This year']] as [RangeOption, string][]).map(
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
          <ReconciliationBanner result={reconcileResult} />
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
                {reconcileResult.hasMismatch && (
                  <p className="text-xs text-destructive mt-1">Reconciliation mismatch</p>
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
                <p className="text-lg font-semibold">
                  {blockedByCapCount} {blockedByCapCount === 1 ? 'attempt' : 'attempts'}
                </p>
              </div>
            </Card>
          </div>

          <WeeklyChart range={range} entries={scopedEntries} users={scopedUsers} />

          <TeamSummaryTable
            weekStart={weekStart}
            days={days}
            range={range}
            entries={scopedEntries}
            users={scopedUsers}
            weekStatuses={scopedWeekStatuses}
          />

          <CohortWidget entries={scopedEntries} users={scopedUsers} weekStart={weekStart} days={days} />
        </div>
      </main>
    </div>
  );
}
