import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Send, Lock, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
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
import { DailyGridEntry } from './DailyGridEntry';
import { getWeekStart, getWeekDate, toLocalDateString, parseLocalDate } from '@/data/seed';
import { 
  formatDuration, 
  formatHours, 
  getBillableLabel, 
  getDeliverableLabel,
  WEEKLY_EXPECTED_HOURS,
  HOURS_PER_DAY_TARGET,
  MAX_DAILY_HOURS,
  BillableStatus,
  toTotalMinutes,
} from '@/types';
import { cn } from '@/lib/utils';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function WeeklyTimesheet() {
  const { currentUser } = useCurrentUser();
  const { getDailyTotals, getWeekSummary, submitWeek, isWeekSubmitted, deleteEntry } = useTimeEntries();
  
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [selectedDay, setSelectedDay] = useState(0);
  const [entryMode, setEntryMode] = useState<'single' | 'grid'>('single');
  const [entriesExpanded, setEntriesExpanded] = useState(true);

  // Reset expand state when day changes
  useEffect(() => {
    setEntriesExpanded(true);
  }, [selectedDay]);

  const dailyTotals = getDailyTotals(currentUser.id, weekStart);
  const weekSummary = getWeekSummary(currentUser.id, weekStart);
  const submitted = isWeekSubmitted(currentUser.id, weekStart);

  const expectedMinutes = WEEKLY_EXPECTED_HOURS * 60;
  const progressPercent = Math.min(100, (weekSummary.totalMinutes / expectedMinutes) * 100);

  const navigateWeek = (direction: number) => {
    const d = parseLocalDate(weekStart);
    d.setDate(d.getDate() + direction * 7);
    setWeekStart(toLocalDateString(d));
  };

  const formatWeekRange = () => {
    const start = parseLocalDate(weekStart);
    const end = parseLocalDate(weekStart);
    end.setDate(end.getDate() + 6);
    
    const startStr = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const endStr = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    
    return `${startStr} – ${endStr}`;
  };

  const isToday = (date: string) => {
    return date === toLocalDateString(new Date());
  };

  const getBillableColor = (status: BillableStatus) => {
    switch (status) {
      case 'billable':
        return 'bg-billable/10 text-billable border-billable/20';
      case 'maybe_billable':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'not_billable':
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const selectedDate = getWeekDate(weekStart, selectedDay);
  const selectedDayData = dailyTotals[selectedDay];
  const dayTargetMinutes = HOURS_PER_DAY_TARGET * 60;
  const dayProgressPercent = Math.round((selectedDayData.totalMinutes / dayTargetMinutes) * 100);

  return (
    <div className="space-y-6">
      {/* Week Navigation & Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateWeek(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base sm:text-lg font-semibold">{formatWeekRange()}</CardTitle>
              <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigateWeek(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              {submitted ? (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="gap-1.5 bg-muted">
                    <Lock className="h-3 w-3" />
                    Week locked
                  </Badge>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="gap-2 w-full sm:w-auto"
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
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {dailyTotals.map((day, i) => {
              const dayTarget = HOURS_PER_DAY_TARGET * 60;
              const dayMax = MAX_DAILY_HOURS * 60;
              const isWeekend = i >= 5;
              const hasEntries = day.totalMinutes > 0;
              const isMet = day.totalMinutes >= dayTarget;
              const isAtMax = day.totalMinutes >= dayMax;
              
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(i)}
                  className={cn(
                    "flex flex-col items-center p-2 sm:p-3 rounded-lg border transition-all min-h-[68px]",
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
                    {parseLocalDate(day.date).getDate()}
                  </span>
                  <div className={cn(
                    "mt-1 sm:mt-2 text-base sm:text-lg font-semibold tabular-nums",
                    !hasEntries && "text-muted-foreground/50",
                    hasEntries && isMet && !isWeekend && "text-success",
                    hasEntries && !isMet && !isWeekend && "text-foreground",
                    isAtMax && "text-warning"
                  )}>
                    {formatHours(day.totalMinutes)}h
                  </div>
                  {isAtMax && (
                    <span className="text-[10px] text-warning mt-0.5">Max</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Billable summary */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-billable" />
              <span className="text-sm text-muted-foreground">
                Billable: {formatHours(weekSummary.billableMinutes)}h
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
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <CardTitle className="text-sm sm:text-base font-medium">
                  {parseLocalDate(selectedDate).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </CardTitle>
                <span className="text-xs sm:text-sm text-muted-foreground tabular-nums">
                  {formatHours(selectedDayData.totalMinutes)}h / {dayProgressPercent}%
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {!submitted && (
                <Tabs value={entryMode} onValueChange={(v) => setEntryMode(v as 'single' | 'grid')}>
                  <TabsList className="h-8 w-full sm:w-auto">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value="single"
                          className="text-xs px-3 h-7 flex-1 sm:flex-initial data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          Single entry
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Log a single time entry via a form</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger
                          value="grid"
                          className="text-xs px-3 h-7 flex-1 sm:flex-initial data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          Multiple entries
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Log multiple entries at once in a table</TooltipContent>
                    </Tooltip>
                  </TabsList>
                </Tabs>
              )}
              {submitted ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>This week is locked</span>
                </div>
              ) : entryMode === 'single' ? (
                <TimeEntryForm selectedDate={selectedDate} />
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Grid view */}
          {entryMode === 'grid' && !submitted && (
            <div className="mb-6">
              <DailyGridEntry selectedDate={selectedDate} disabled={submitted} />
            </div>
          )}

          {/* Existing entries list */}
          {selectedDayData.entries.length === 0 && entryMode !== 'grid' ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No time entries for this day</p>
              {!submitted && (
                <p className="text-sm mt-1">Click "Add entry" to log time</p>
              )}
            </div>
          ) : selectedDayData.entries.length > 0 ? (
            <div className="space-y-3">
              {/* Collapsible header */}
              <button
                type="button"
                onClick={() => setEntriesExpanded(prev => !prev)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                {entriesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                {entryMode === 'grid' ? 'Existing entries' : 'Entries'} ({selectedDayData.entries.length})
              </button>

              {entriesExpanded && selectedDayData.entries.map(entry => {
                const entryMinutes = toTotalMinutes(entry.hours, entry.minutes);
                return (
                  <div 
                    key={entry.id}
                    className="flex flex-col sm:flex-row items-start justify-between p-3 sm:p-4 rounded-lg border bg-card shadow-card gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-muted-foreground">
                          {entry.project.code}
                        </span>
                        <span className="font-medium truncate">{entry.project.name}</span>
                        {entry.projectId === 'proj-leave' && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            {entry.activityTypeId === 'act-public-holiday' ? '📅 Public holiday' : '🏖️ Leave'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {entry.phase.name} → {entry.activityType.name}
                      </p>
                      <p className="text-sm line-clamp-2">
                        {entry.taskDescription}
                      </p>
                      {entry.deliverableDescription && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          {getDeliverableLabel(entry.deliverableType)}: {entry.deliverableDescription}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className={getBillableColor(entry.billableStatus)}>
                          {getBillableLabel(entry.billableStatus)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:ml-4 self-end sm:self-auto shrink-0">
                      <span className="text-lg font-semibold tabular-nums">
                        {formatDuration(entryMinutes)}
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
                                This will permanently remove this {formatDuration(entryMinutes)} entry for {entry.project.name}.
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
                );
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
