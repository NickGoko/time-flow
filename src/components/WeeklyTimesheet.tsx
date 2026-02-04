import { useState } from 'react';
import { ChevronLeft, ChevronRight, Send, Lock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCurrentUser } from '@/contexts/UserContext';
import { useTimeEntries } from '@/contexts/TimeEntriesContext';
import { TimeEntryForm } from './TimeEntryForm';
import { getWeekStart, getWeekDate } from '@/data/seed';
import { 
  formatDuration, 
  formatHours, 
  getBillableLabel, 
  WEEKLY_EXPECTED_HOURS,
  HOURS_PER_DAY_TARGET,
  BillableStatus 
} from '@/types';
import { cn } from '@/lib/utils';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyTimesheet() {
  const { currentUser } = useCurrentUser();
  const { getDailyTotals, getWeekSummary, submitWeek, isWeekSubmitted, deleteEntry } = useTimeEntries();
  
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [selectedDay, setSelectedDay] = useState(0);

  const dailyTotals = getDailyTotals(currentUser.id, weekStart);
  const weekSummary = getWeekSummary(currentUser.id, weekStart);
  const submitted = isWeekSubmitted(currentUser.id, weekStart);

  const expectedMinutes = WEEKLY_EXPECTED_HOURS * 60;
  const progressPercent = Math.min(100, (weekSummary.totalMinutes / expectedMinutes) * 100);

  const navigateWeek = (direction: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + direction * 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const formatWeekRange = () => {
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    
    const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    
    return `${startStr} – ${endStr}`;
  };

  const isToday = (date: string) => {
    return date === new Date().toISOString().split('T')[0];
  };

  const getBillableColor = (status: BillableStatus) => {
    switch (status) {
      case 'billable':
        return 'bg-billable/10 text-billable border-billable/20';
      case 'maybe_billable':
        return 'bg-maybe-billable/10 text-maybe-billable border-maybe-billable/20';
      case 'not_billable':
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const selectedDate = getWeekDate(weekStart, selectedDay);
  const selectedDayData = dailyTotals[selectedDay];

  return (
    <div className="space-y-6">
      {/* Week Navigation & Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg font-semibold">{formatWeekRange()}</CardTitle>
              <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              {submitted ? (
                <Badge variant="secondary" className="gap-1.5">
                  <Lock className="h-3 w-3" />
                  Submitted
                </Badge>
              ) : (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => submitWeek(currentUser.id, weekStart)}
                  disabled={weekSummary.totalMinutes === 0}
                >
                  <Send className="h-4 w-4" />
                  Submit week
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Weekly progress</span>
              <span className="font-medium">
                {formatHours(weekSummary.totalMinutes)}h / {WEEKLY_EXPECTED_HOURS}h
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  progressPercent >= 100 ? "bg-success" : "bg-primary"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Day columns */}
          <div className="grid grid-cols-7 gap-2">
            {dailyTotals.map((day, i) => {
              const dayTarget = HOURS_PER_DAY_TARGET * 60;
              const isWeekend = i >= 5;
              const hasEntries = day.totalMinutes > 0;
              const isMet = day.totalMinutes >= dayTarget;
              
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(i)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg border transition-all",
                    selectedDay === i 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                      : "border-transparent hover:border-border hover:bg-muted/50",
                    isToday(day.date) && "ring-2 ring-primary/30"
                  )}
                >
                  <span className={cn(
                    "text-xs font-medium",
                    isWeekend ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {day.dayName}
                  </span>
                  <span className={cn(
                    "text-xs text-muted-foreground",
                    isToday(day.date) && "font-semibold text-primary"
                  )}>
                    {new Date(day.date).getDate()}
                  </span>
                  <div className={cn(
                    "mt-2 text-lg font-semibold tabular-nums",
                    !hasEntries && "text-muted-foreground/50",
                    hasEntries && isMet && !isWeekend && "text-success",
                    hasEntries && !isMet && !isWeekend && "text-foreground"
                  )}>
                    {formatHours(day.totalMinutes)}h
                  </div>
                </button>
              );
            })}
          </div>

          {/* Billable summary */}
          <div className="flex gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-billable" />
              <span className="text-sm text-muted-foreground">
                Billable: {formatHours(weekSummary.billableMinutes)}h
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-maybe-billable" />
              <span className="text-sm text-muted-foreground">
                Maybe: {formatHours(weekSummary.maybeBillableMinutes)}h
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-not-billable" />
              <span className="text-sm text-muted-foreground">
                Non-billable: {formatHours(weekSummary.notBillableMinutes)}h
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">
              {new Date(selectedDate).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </CardTitle>
            {!submitted && (
              <TimeEntryForm selectedDate={selectedDate} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedDayData.entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No time entries for this day</p>
              {!submitted && (
                <p className="text-sm mt-1">Click "Log time" to add an entry</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDayData.entries.map(entry => (
                <div 
                  key={entry.id}
                  className="flex items-start justify-between p-4 rounded-lg border bg-card shadow-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">
                        {entry.project.code}
                      </span>
                      <span className="font-medium truncate">{entry.project.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className={getBillableColor(entry.billableStatus)}>
                        {getBillableLabel(entry.billableStatus)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {entry.project.client.name}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-lg font-semibold tabular-nums">
                      {formatDuration(entry.durationMinutes)}
                    </span>
                    {!submitted && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete time entry?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove this {formatDuration(entry.durationMinutes)} entry for {entry.project.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteEntry(entry.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
