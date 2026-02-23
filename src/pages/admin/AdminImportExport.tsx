import { TopBar } from '@/components/TopBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export default function AdminImportExport() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Import / Export</h1>

        <Tabs defaultValue="export" className="mt-6">
          <TabsList>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="mt-6">
            <Card className="p-6 text-center text-muted-foreground">
              <p className="text-sm">CSV Export — coming in Brick 6</p>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="mt-6">
            <Card className="p-6 text-center text-muted-foreground">
              <p className="text-sm">CSV Import — coming in Brick 7</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
