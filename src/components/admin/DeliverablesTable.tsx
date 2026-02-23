import { useState } from 'react';
import { AdminCrudTable, type CrudColumn } from '@/components/admin/AdminCrudTable';
import { DeliverableDialog } from '@/components/admin/DeliverableDialog';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import type { DeliverableTypeItem } from '@/types';

const columns: CrudColumn<DeliverableTypeItem>[] = [
  { key: 'name', header: 'Name' },
];

export function DeliverablesTable() {
  const { deliverableTypes, addDeliverableType, updateDeliverableType, toggleDeliverableTypeActive } = useReferenceData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeliverableTypeItem | null>(null);

  return (
    <>
      <AdminCrudTable<DeliverableTypeItem>
        columns={columns}
        data={deliverableTypes}
        onToggleActive={toggleDeliverableTypeActive}
        onEdit={row => { setEditing(row); setDialogOpen(true); }}
        onAdd={() => { setEditing(null); setDialogOpen(true); }}
        addLabel="Add Deliverable Type"
        entityLabel="deliverable type"
        searchPlaceholder="Search deliverable types…"
        searchKeys={['name']}
      />
      <DeliverableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingItem={editing}
        onSave={name => {
          if (editing) {
            updateDeliverableType(editing.id, name);
          } else {
            addDeliverableType(name);
          }
        }}
      />
    </>
  );
}
