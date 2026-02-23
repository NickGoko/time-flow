import { useState, useEffect } from 'react';
import { EditDialog } from '@/components/admin/AdminCrudTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DeliverableTypeItem } from '@/types';

interface DeliverableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingItem: DeliverableTypeItem | null;
  onSave: (name: string) => void;
}

export function DeliverableDialog({ open, onOpenChange, editingItem, onSave }: DeliverableDialogProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) setName(editingItem?.name ?? '');
  }, [open, editingItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim());
    onOpenChange(false);
  };

  return (
    <EditDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingItem ? 'Edit Deliverable Type' : 'Add Deliverable Type'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="del-name">Name</Label>
          <Input id="del-name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={!name.trim()}>Save</Button>
        </div>
      </form>
    </EditDialog>
  );
}
