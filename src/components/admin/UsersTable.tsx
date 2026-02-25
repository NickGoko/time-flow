import { useState, useCallback } from 'react';
import { AdminCrudTable, type CrudColumn } from '@/components/admin/AdminCrudTable';
import { UserDialog } from '@/components/admin/UserDialog';
import { useCurrentUser } from '@/contexts/UserContext';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/types';

export function UsersTable() {
  const { allUsersList, currentUser, addUser, updateUser, toggleUserActive } = useCurrentUser();
  const { getDepartmentById } = useReferenceData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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
        <Badge variant={row.appRole === 'admin' ? 'default' : 'secondary'}>
          {row.appRole === 'admin' ? 'Admin' : 'Employee'}
        </Badge>
      ),
    },
    {
      key: 'weeklyExpectedHours',
      header: 'Weekly Hours',
      render: (row) => String(row.weeklyExpectedHours),
    },
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
