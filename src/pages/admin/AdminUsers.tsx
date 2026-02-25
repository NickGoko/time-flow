import { TopBar } from '@/components/TopBar';
import { UsersTable } from '@/components/admin/UsersTable';

export default function AdminUsers() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <div className="mt-6">
          <UsersTable />
        </div>
      </main>
    </div>
  );
}
