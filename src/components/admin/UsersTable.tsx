import { useState, useCallback, useMemo } from 'react';
import { AdminCrudTable, type CrudColumn } from '@/components/admin/AdminCrudTable';
import { UserDialog } from '@/components/admin/UserDialog';
import { useCurrentUser } from '@/contexts/UserContext';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';
import { AUTH_ENABLED } from '@/lib/devMode';
import type { User } from '@/types';

export function UsersTable() {
  const { allUsersList, currentUser, addUser, updateUser, toggleUserActive, isSuperAdmin } = useCurrentUser();
  const { getDepartmentById } = useReferenceData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const actingHeaders = useMemo(() => {
    if (!AUTH_ENABLED && currentUser) {
      return { 'x-acting-user-id': currentUser.id };
    }
    return {};
  }, [currentUser]);

  const handleImpersonate = useCallback(async (userId: string) => {
    setImpersonating(userId);
    try {
      const { data, error } = await supabase.functions.invoke('admin-impersonate', {
        headers: actingHeaders,
        body: { targetUserId: userId },
      });

      if (error) {
        toast.error('Impersonation failed: ' + error.message);
        return;
      }
      if (data?.error) {
        toast.error('Impersonation failed: ' + data.error);
        return;
      }
      if (data?.url) {
        window.open(data.url, '_blank');
        toast.success('Magic link opened in new tab. Use incognito for a clean session.');
      }
    } catch (err) {
      toast.error('Impersonation failed: ' + String(err));
    } finally {
      setImpersonating(null);
    }
  }, [actingHeaders]);

  const columns: CrudColumn<User>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'departmentId',
      header: 'Department',
      render: (row) => getDepartmentById(row.departmentId)?.name ?? row.departmentId,
    },
    { key: 'role', header: 'Role' },
    {
      key: 'appRole',
      header: 'App Role',
      render: (row) => (
        <Badge variant={row.appRole === 'admin' || row.appRole === 'super_admin' ? 'default' : 'secondary'}>
          {row.appRole === 'super_admin' ? 'Super Admin' : row.appRole === 'admin' ? 'Admin' : 'Employee'}
        </Badge>
      ),
    },
    {
      key: 'weeklyExpectedHours',
      header: 'Weekly Hours',
      render: (row) => String(row.weeklyExpectedHours),
    },
    ...(isSuperAdmin
      ? [
          {
            key: 'id' as keyof User,
            header: '',
            render: (row: User) =>
              row.id !== currentUser?.id ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={impersonating === row.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImpersonate(row.id);
                  }}
                >
                  <LogIn className="mr-1 h-3.5 w-3.5" />
                  {impersonating === row.id ? 'Loading…' : 'Login as'}
                </Button>
              ) : null,
          },
        ]
      : []),
  ];

  const handleAdd = useCallback(() => {
    setEditingUser(null);
    setDialogOpen(true);
  }, []);

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setDialogOpen(true);
  }, []);

  const handleToggle = useCallback(async (id: string) => {
    if (id === currentUser?.id) return;
    await toggleUserActive(id);
  }, [currentUser, toggleUserActive]);

  const handleSave = useCallback(async (data: Omit<User, 'id'>) => {
    if (editingUser) {
      await updateUser(editingUser.id, data);
    } else {
      await addUser(data);
    }
  }, [editingUser, updateUser, addUser]);

  return (
    <>
      <AdminCrudTable<User>
        columns={columns}
        data={allUsersList}
        onToggleActive={handleToggle}
        onEdit={handleEdit}
        onAdd={handleAdd}
        addLabel="Invite User"
        entityLabel="user"
        searchPlaceholder="Search by name or email…"
        searchKeys={['name', 'email']}
      />
      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser}
        onSave={handleSave}
      />
    </>
  );
}
