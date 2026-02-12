import { TopBar } from '@/components/TopBar';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Coming soon.</p>
      </main>
    </div>
  );
}
