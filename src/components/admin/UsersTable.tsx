import { useState, useCallback, useMemo } from 'react';
import { AdminCrudTable, type CrudColumn } from '@/components/admin/AdminCrudTable';
import { UserDialog } from '@/components/admin/UserDialog';
import { useCurrentUser } from '@/contexts/UserContext';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LogIn, Mail, KeyRound, UserPlus, MoreHorizontal } from 'lucide-react';
import { AUTH_ENABLED } from '@/lib/devMode';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { User } from '@/types';

export function UsersTable() {
  const {
    allUsersList, currentUser, addUser, updateUser, toggleUserActive,
    isSuperAdmin, isAdmin, provisionInvite, sendReset, createWithPassword,
  } = useCurrentUser();
  const { getDepartmentById } = useReferenceData();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create-with-password dialog state
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [pwdTargetUser, setPwdTargetUser] = useState<User | null>(null);
  const [pwdValue, setPwdValue] = useState('');

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

      if (error) { toast.error('Impersonation failed: ' + error.message); return; }
      if (data?.error) { toast.error('Impersonation failed: ' + data.error); return; }
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

  const handleProvisionInvite = useCallback(async (userId: string) => {
    setActionLoading(userId);
    try { await provisionInvite(userId); } catch { /* toast already shown */ } finally { setActionLoading(null); }
  }, [provisionInvite]);

  const handleSendReset = useCallback(async (userId: string) => {
    setActionLoading(userId);
    try { await sendReset(userId); } catch { /* toast already shown */ } finally { setActionLoading(null); }
  }, [sendReset]);

  const handleCreateWithPassword = useCallback(async () => {
    if (!pwdTargetUser || pwdValue.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setActionLoading(pwdTargetUser.id);
    try {
      await createWithPassword(pwdTargetUser.id, pwdValue);
      setPwdDialogOpen(false);
      setPwdValue('');
      setPwdTargetUser(null);
    } catch { /* toast already shown */ } finally {
      setActionLoading(null);
    }
  }, [pwdTargetUser, pwdValue, createWithPassword]);

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
      render: (row) => {
        const label = row.appRole === 'super_admin' ? 'Super Admin'
          : row.appRole === 'admin' ? 'Admin'
          : row.appRole === 'leadership' ? 'Leadership'
          : row.appRole === 'hod' ? 'HOD'
          : 'Employee';
        const isHighRole = ['admin', 'super_admin', 'leadership'].includes(row.appRole);
        return (
          <Badge variant={isHighRole ? 'default' : row.appRole === 'hod' ? 'secondary' : 'outline'}>
            {label}
          </Badge>
        );
      },
    },
    {
      key: 'weeklyExpectedHours',
      header: 'Weekly Hours',
      render: (row) => String(row.weeklyExpectedHours),
    },
    // Auth provisioning actions column (admin/super_admin only)
    ...(isAdmin
      ? [
          {
            key: 'id' as keyof User,
            header: 'Auth',
            render: (row: User) => {
              const loading = actionLoading === row.id;
              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={loading} onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => handleProvisionInvite(row.id)}>
                      <Mail className="mr-2 h-3.5 w-3.5" />
                      Send Invite
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSendReset(row.id)}>
                      <KeyRound className="mr-2 h-3.5 w-3.5" />
                      Reset Password
                    </DropdownMenuItem>
                    {isSuperAdmin && (
                      <DropdownMenuItem onClick={() => {
                        setPwdTargetUser(row);
                        setPwdValue('');
                        setPwdDialogOpen(true);
                      }}>
                        <UserPlus className="mr-2 h-3.5 w-3.5" />
                        Create Login
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            },
          },
        ]
      : []),
    // Impersonate column (super_admin only)
    ...(isSuperAdmin
      ? [
          {
            key: 'avatarUrl' as keyof User, // unique key to avoid duplicate 'id' key
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

      {/* Create with password dialog */}
      <Dialog open={pwdDialogOpen} onOpenChange={setPwdDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Login for {pwdTargetUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Set a password for <strong>{pwdTargetUser?.email}</strong>. The user will be able to sign in immediately without email verification.
            </p>
            <div className="space-y-2">
              <Label htmlFor="pwd-input">Password</Label>
              <Input
                id="pwd-input"
                type="password"
                placeholder="Minimum 8 characters"
                value={pwdValue}
                onChange={(e) => setPwdValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwdDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleCreateWithPassword}
              disabled={pwdValue.length < 8 || actionLoading === pwdTargetUser?.id}
            >
              {actionLoading === pwdTargetUser?.id ? 'Creating…' : 'Create Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
