import { TopBar } from '@/components/TopBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AdminCrudTable, type CrudColumn } from '@/components/admin/AdminCrudTable';
import { WorkstreamsTable } from '@/components/admin/WorkstreamsTable';
import { WorkAreasTable } from '@/components/admin/WorkAreasTable';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import type { Department } from '@/types';
import { useToast } from '@/hooks/use-toast';

const deptColumns: CrudColumn<Department>[] = [
  { key: 'name', header: 'Department Name' },
];

export default function AdminReferenceData() {
  const { departments, toggleDepartmentActive } = useReferenceData();
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Reference Data</h1>

        <Tabs defaultValue="workstreams" className="mt-6">
          <TabsList>
            <TabsTrigger value="workstreams">Workstreams</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="work-areas">Work Areas</TabsTrigger>
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
                onEdit={() => {
                  toast({ title: 'Edit coming in Brick 3', description: 'Department editing is not yet implemented.' });
                }}
                onAdd={() => {
                  toast({ title: 'Add coming in Brick 3', description: 'Department creation is not yet implemented.' });
                }}
                addLabel="Add Department"
                entityLabel="department"
                searchPlaceholder="Search departments…"
                searchKeys={['name']}
              />
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4">Workstreams</h2>
              <WorkstreamsTable />
            </section>
          </TabsContent>

          <TabsContent value="phases" className="mt-6">
            <Card className="p-6 text-center text-muted-foreground">
              <p className="text-sm">Phases &amp; Activity Types — coming in Brick 4</p>
            </Card>
          </TabsContent>

          <TabsContent value="work-areas" className="mt-6">
            <WorkAreasTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
