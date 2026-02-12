import { Link } from 'react-router-dom';
import { TopBar } from '@/components/TopBar';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Coming soon.</p>
        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link to="/admin/reports/overview">Reports Overview</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
