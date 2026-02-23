import { useState } from 'react';
import { AdminCrudTable, type CrudColumn } from '@/components/admin/AdminCrudTable';
import { WorkAreaDialog } from '@/components/admin/WorkAreaDialog';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { InternalWorkArea } from '@/types';

export function WorkAreasTable() {
  const {
    internalWorkAreas,
    departments,
    phases,
    getDepartmentById,
    toggleWorkAreaActive,
    addWorkArea,
    updateWorkArea,
  } = useReferenceData();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InternalWorkArea | null>(null);
  const [deptFilter, setDeptFilter] = useState<string>('all');

  const filteredData = deptFilter === 'all'
    ? internalWorkAreas
    : internalWorkAreas.filter(wa => wa.departmentId === deptFilter);

  const columns: CrudColumn<InternalWorkArea>[] = [
    { key: 'name', header: 'Name' },
    {
      key: 'departmentId',
      header: 'Department',
      render: (row) => getDepartmentById(row.departmentId)?.name ?? '—',
    },
    {
      key: 'phaseId',
      header: 'Phase',
      render: (row) => phases.find(p => p.id === row.phaseId)?.name ?? '—',
    },
  ];

  return (
    <>
      <div className="mb-4 max-w-xs">
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.filter(d => d.isActive).map(d => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AdminCrudTable<InternalWorkArea>
        columns={columns}
        data={filteredData}
        onToggleActive={(id) => {
          toggleWorkAreaActive(id);
          const wa = internalWorkAreas.find(w => w.id === id);
          toast({
            title: wa?.isActive ? 'Work area deactivated' : 'Work area activated',
            description: wa?.name,
          });
        }}
        onEdit={(row) => {
          setEditing(row);
          setDialogOpen(true);
        }}
        onAdd={() => {
          setEditing(null);
          setDialogOpen(true);
        }}
        addLabel="Add Work Area"
        entityLabel="work area"
        searchPlaceholder="Search work areas…"
        searchKeys={['name']}
      />

      <WorkAreaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSave={(data) => {
          if (editing) {
            updateWorkArea(editing.id, data);
            toast({ title: 'Work area updated', description: data.name ?? editing.name });
          } else {
            addWorkArea(data as Omit<InternalWorkArea, 'id'>);
            toast({ title: 'Work area added', description: data.name });
          }
          setDialogOpen(false);
        }}
      />
    </>
  );
}
