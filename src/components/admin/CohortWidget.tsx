import { Card } from '@/components/ui/card';
import { deriveCohortSummaries, buildCohortBuckets } from '@/data/reportsMockData';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { useAuthenticatedUser } from '@/contexts/UserContext';
import { useMemo } from 'react';
import { TimeEntry, User } from '@/types';

const MIN_USERS_FOR_COHORT = 5;

interface Props {
  entries?: TimeEntry[];
  users?: User[];
  weekStart?: string;
  days?: number;
}

export function CohortWidget({ entries: entriesProp, users: usersProp, weekStart: weekStartProp, days: daysProp }: Props) {
  const { getAllEntries } = useTimeEntries();
  const { allUsers: contextUsers } = useAuthenticatedUser();

  const entries = entriesProp ?? getAllEntries();
  const allUsers = usersProp ?? contextUsers;
  const weekStart = weekStartProp ?? '';
  const days = daysProp ?? 7;

  const summaries = useMemo(
    () => weekStart ? deriveCohortSummaries(entries, allUsers, weekStart, days) : [],
    [entries, allUsers, weekStart, days],
  );
  const buckets = useMemo(() => buildCohortBuckets(summaries), [summaries]);

  if (allUsers.length < MIN_USERS_FOR_COHORT) {
    return (
      <Card className="border-border bg-card rounded-lg p-6 text-center">
        <p className="text-muted-foreground">
          Insufficient group size for anonymous reporting
        </p>
      </Card>
    );
  }

  const maxCount = Math.max(...buckets.map(b => b.userCount), 1);

  return (
    <Card className="border-border bg-card rounded-lg p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-medium">Cohort Distribution</h3>
        <span className="text-xs text-muted-foreground">{allUsers.length} users · {days === 1 ? 'today' : `${days} days`}</span>
      </div>

      <div className="mt-3 space-y-3">
        {buckets.map(bucket => (
          <div key={bucket.label}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{bucket.label}</span>
              <span className="text-muted-foreground">
                {bucket.userCount} {bucket.userCount === 1 ? 'user' : 'users'} · avg {bucket.avgPercentOfExpected}%
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-secondary">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${(bucket.userCount / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
