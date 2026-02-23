import { useState } from 'react';
import { AdminCrudTable, type CrudColumn } from '@/components/admin/AdminCrudTable';
import { WorkstreamDialog } from '@/components/admin/WorkstreamDialog';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/types';
import { getWorkstreamTypeLabel } from '@/types';

const columns: CrudColumn<Project>[] = [
  { key: 'name', header: 'Name' },
  {
    key: 'code',
    header: 'Code',
    render: (row) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{row.code}</code>,
  },
  {
    key: 'type',
    header: 'Type',
    render: (row) => (
      <Badge variant={row.type === 'external_project' ? 'default' : 'secondary'}>
        {getWorkstreamTypeLabel(row.type)}
      </Badge>
    ),
  },
];

export function WorkstreamsTable() {
  const {
    projects,
    projectDepartmentAccess,
    departments,
    toggleProjectActive,
    getDepartmentById,
  } = useReferenceData();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const columnsWithDept: CrudColumn<Project>[] = [
    ...columns,
    {
      key: 'owningDepartmentId' as keyof Project & string,
      header: 'Dept / Access',
      render: (row) => {
        if (row.type === 'internal_department') {
          const dept = row.owningDepartmentId ? getDepartmentById(row.owningDepartmentId) : undefined;
          return <span className="text-sm">{dept?.name ?? '—'}</span>;
        }
        const accessDepts = projectDepartmentAccess
          .filter(a => a.workstreamId === row.id)
          .map(a => getDepartmentById(a.departmentId)?.name)
          .filter(Boolean);
        if (accessDepts.length === 0) return <span className="text-muted-foreground">—</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {accessDepts.map(name => (
              <Badge key={name} variant="outline" className="text-xs">{name}</Badge>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <AdminCrudTable<Project>
        columns={columnsWithDept}
        data={projects}
        onToggleActive={(id) => {
          toggleProjectActive(id);
          const proj = projects.find(p => p.id === id);
          toast({
            title: proj?.isActive ? 'Workstream deactivated' : 'Workstream activated',
            description: proj?.name,
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
        addLabel="Add Workstream"
        entityLabel="workstream"
        searchPlaceholder="Search workstreams…"
        searchKeys={['name', 'code']}
      />
      <WorkstreamDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
      />
    </>
  );
}
