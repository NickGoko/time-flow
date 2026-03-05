import { useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AdminCrudTable, type CrudColumn } from '@/components/admin/AdminCrudTable';
import { WorkstreamsTable } from '@/components/admin/WorkstreamsTable';
import { WorkAreasTable } from '@/components/admin/WorkAreasTable';
import { DeliverablesTable } from '@/components/admin/DeliverablesTable';
import { PhasesTable } from '@/components/admin/PhasesTable';
import { DepartmentDialog } from '@/components/admin/DepartmentDialog';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import type { Department } from '@/types';
import { useToast } from '@/hooks/use-toast';

const deptColumns: CrudColumn<Department>[] = [
  { key: 'name', header: 'Department Name' },
];

export default function AdminReferenceData() {
  const { departments, toggleDepartmentActive } = useReferenceData();
  const { toast } = useToast();
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Reference Data</h1>

        <Tabs defaultValue="workstreams" className="mt-6">
          <TabsList>
            <TabsTrigger value="workstreams">Categories</TabsTrigger>
            <TabsTrigger value="phases">Projects</TabsTrigger>
            <TabsTrigger value="work-areas">Work areas</TabsTrigger>
            <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
          </TabsList>

          <TabsContent value="workstreams" className="mt-6 space-y-8">
            <section>
              <h2 className="text-lg font-medium mb-4">Departments</h2>

              <AdminCrudTable<Department>
                columns={deptColumns}
                data={departments}
                onToggleActive={(id) => {
                  toggleDepartmentActive(id);
                  const dept = departments.find(d => d.id === id);
                  toast({
                    title: dept?.isActive ? 'Department deactivated' : 'Department activated',
                    description: dept?.name,
                  });
                }}
                onEdit={(dept) => {
                  setEditingDept(dept);
                  setDeptDialogOpen(true);
                }}
                onAdd={() => {
                  setEditingDept(null);
                  setDeptDialogOpen(true);
                }}
                addLabel="Add Department"
                entityLabel="department"
                searchPlaceholder="Search departments…"
                searchKeys={['name']}
              />
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4">Categories</h2>
              <WorkstreamsTable />
            </section>
          </TabsContent>

          <TabsContent value="phases" className="mt-6">
            <PhasesTable />
          </TabsContent>

          <TabsContent value="work-areas" className="mt-6">
            <WorkAreasTable />
          </TabsContent>

          <TabsContent value="deliverables" className="mt-6">
            <DeliverablesTable />
          </TabsContent>
        </Tabs>
      </main>

      <DepartmentDialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen} editing={editingDept} />
    </div>
  );
}
