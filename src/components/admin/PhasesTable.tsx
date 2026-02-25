import { useState } from 'react';
import { AdminCrudTable, type CrudColumn } from '@/components/admin/AdminCrudTable';
import { PhaseDialog } from '@/components/admin/PhaseDialog';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Phase, ActivityType } from '@/types';

const phaseColumns: CrudColumn<Phase>[] = [
  { key: 'name', header: 'Phase Name' },
];

const actColumns: CrudColumn<ActivityType>[] = [
  { key: 'name', header: 'Activity Type Name' },
];

export function PhasesTable() {
  const {
    phases,
    activityTypes,
    addPhase,
    updatePhase,
    togglePhaseActive,
    addActivityType,
    updateActivityType,
    toggleActivityTypeActive,
  } = useReferenceData();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'phase' | 'activityType'>('phase');
  const [editingItem, setEditingItem] = useState<Phase | ActivityType | null>(null);
  const [defaultPhaseId, setDefaultPhaseId] = useState<string | undefined>();
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);

  const openPhaseAdd = () => {
    setDialogMode('phase');
    setEditingItem(null);
    setDefaultPhaseId(undefined);
    setDialogOpen(true);
  };

  const openPhaseEdit = (phase: Phase) => {
    setDialogMode('phase');
    setEditingItem(phase);
    setDefaultPhaseId(undefined);
    setDialogOpen(true);
  };

  const openActivityAdd = (phaseId: string) => {
    setDialogMode('activityType');
    setEditingItem(null);
    setDefaultPhaseId(phaseId);
    setDialogOpen(true);
  };

  const openActivityEdit = (activity: ActivityType) => {
    setDialogMode('activityType');
    setEditingItem(activity);
    setDefaultPhaseId(activity.phaseId);
    setDialogOpen(true);
  };

  const handleSavePhase = (name: string) => {
    if (editingItem) {
      updatePhase(editingItem.id, name);
      toast({ title: 'Phase updated', description: name });
    } else {
      addPhase(name);
      toast({ title: 'Phase added', description: name });
    }
  };

  const handleSaveActivityType = (name: string, phaseId: string) => {
    if (editingItem) {
      updateActivityType(editingItem.id, { name, phaseId });
      toast({ title: 'Activity type updated', description: name });
    } else {
      addActivityType(name, phaseId);
      toast({ title: 'Activity type added', description: name });
    }
  };

  return (
    <div className="space-y-6">
      <AdminCrudTable<Phase>
        columns={phaseColumns}
        data={phases}
        onToggleActive={(id) => {
          togglePhaseActive(id);
          const p = phases.find(ph => ph.id === id);
          toast({ title: p?.isActive ? 'Phase deactivated' : 'Phase activated', description: p?.name });
        }}
        onEdit={openPhaseEdit}
        onAdd={openPhaseAdd}
        addLabel="Add Phase"
        entityLabel="phase"
        searchPlaceholder="Search phases…"
        searchKeys={['name']}
      />

      {/* Expandable activity types per phase */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Activity Types by Phase</h3>
        {phases.map(phase => {
          const activities = activityTypes.filter(a => a.phaseId === phase.id);
          const isOpen = expandedPhase === phase.id;
          return (
            <Collapsible
              key={phase.id}
              open={isOpen}
              onOpenChange={(open) => setExpandedPhase(open ? phase.id : null)}
            >
              <CollapsibleTrigger className={cn(
                'flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors',
                !phase.isActive && 'opacity-50',
              )}>
                <ChevronRight className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90')} />
                {phase.name}
                <span className="text-muted-foreground ml-auto text-xs">{activities.length} activities</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 pt-2">
                <AdminCrudTable<ActivityType>
                  columns={actColumns}
                  data={activities}
                  onToggleActive={(id) => {
                    toggleActivityTypeActive(id);
                    const a = activities.find(act => act.id === id);
                    toast({ title: a?.isActive ? 'Activity deactivated' : 'Activity activated', description: a?.name });
                  }}
                  onEdit={openActivityEdit}
                  onAdd={() => openActivityAdd(phase.id)}
                  addLabel="Add Activity Type"
                  entityLabel="activity type"
                  searchPlaceholder="Search activities…"
                  searchKeys={['name']}
                />
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      <PhaseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        editingItem={editingItem}
        phases={phases}
        defaultPhaseId={defaultPhaseId}
        onSavePhase={handleSavePhase}
        onSaveActivityType={handleSaveActivityType}
      />
    </div>
  );
}
