import { TopBar } from '@/components/TopBar';
import { Card } from '@/components/ui/card';

export default function AdminUsers() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <Card className="mt-6 p-6 text-center text-muted-foreground">
          <p className="text-sm">Users CRUD — coming in Brick 5</p>
        </Card>
      </main>
    </div>
  );
}
