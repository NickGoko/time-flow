import { useState, useEffect } from 'react';
import { EditDialog } from '@/components/admin/AdminCrudTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Phase, ActivityType } from '@/types';

interface PhaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'phase' | 'activityType';
  editingItem: Phase | ActivityType | null;
  phases?: Phase[];
  defaultPhaseId?: string;
  onSavePhase: (name: string) => void;
  onSaveActivityType: (name: string, phaseId: string) => void;
}

export function PhaseDialog({
  open,
  onOpenChange,
  mode,
  editingItem,
  phases = [],
  defaultPhaseId,
  onSavePhase,
  onSaveActivityType,
}: PhaseDialogProps) {
  const [name, setName] = useState('');
  const [phaseId, setPhaseId] = useState('');

  useEffect(() => {
    if (open) {
      setName(editingItem?.name ?? '');
      setPhaseId(
        mode === 'activityType'
          ? (editingItem as ActivityType)?.phaseId ?? defaultPhaseId ?? ''
          : '',
      );
    }
  }, [open, editingItem, mode, defaultPhaseId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (mode === 'phase') {
      onSavePhase(name.trim());
    } else {
      if (!phaseId) return;
      onSaveActivityType(name.trim(), phaseId);
    }
    onOpenChange(false);
  };

  const title = mode === 'phase'
    ? (editingItem ? 'Edit project' : 'Add project')
    : (editingItem ? 'Edit activity/task' : 'Add activity/task');

  return (
    <EditDialog open={open} onOpenChange={onOpenChange} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phase-name">Name</Label>
          <Input id="phase-name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        {mode === 'activityType' && (
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={phaseId} onValueChange={setPhaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select project…" />
              </SelectTrigger>
              <SelectContent>
                {phases.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={!name.trim() || (mode === 'activityType' && !phaseId)}>Save</Button>
        </div>
      </form>
    </EditDialog>
  );
}
