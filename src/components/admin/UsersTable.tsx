import { useState, useCallback, useMemo } from 'react';
import { AdminCrudTable, type CrudColumn } from '@/components/admin/AdminCrudTable';
import { UserDialog } from '@/components/admin/UserDialog';
import { useCurrentUser } from '@/contexts/UserContext';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LogIn, Mail, KeyRound, UserPlus, MoreHorizontal, Copy, CheckCircle2 } from 'lucide-react';
import { AUTH_ENABLED, DEMO_MODE_ALLOWED } from '@/lib/devMode';
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

  // Invite link modal state
  const [inviteLinkDialogOpen, setInviteLinkDialogOpen] = useState(false);
  const [inviteLinkUrl, setInviteLinkUrl] = useState('');
  const [inviteLinkType, setInviteLinkType] = useState<'invite' | 'recovery' | 'magiclink'>('invite');
  const [linkCopied, setLinkCopied] = useState(false);

  const actingHeaders = useMemo(() => {
    if (DEMO_MODE_ALLOWED && !AUTH_ENABLED && currentUser) {
      return { 'x-acting-user-id': currentUser.id };
    }
    return {};
  }, [currentUser]);

  const showInviteLink = useCallback((link: string, linkType?: string) => {
    setInviteLinkUrl(link);
    setInviteLinkType((linkType as 'invite' | 'recovery' | 'magiclink') || 'invite');
    setLinkCopied(false);
    setInviteLinkDialogOpen(true);
  }, []);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteLinkUrl);
      setLinkCopied(true);
      toast.success('Invite link copied to clipboard');
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  }, [inviteLinkUrl]);

  const handleImpersonate = useCallback(async (userId: string) => {
    if (!AUTH_ENABLED) {
      toast.error('Impersonation requires authentication. Enable auth and sign in first.');
      return;
    }

    setImpersonating(userId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        toast.error('Please sign in before using impersonation.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-impersonate', {
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { targetUserId: userId },
      });

      if (error) { toast.error('Impersonation failed: ' + error.message); return; }
      if (data?.error) {
        if (String(data.error).includes('Provision login first')) {
          toast.error('This user has no login yet. Use "Send Invite" to provision their account first.');
        } else {
          toast.error('Impersonation failed: ' + data.error);
        }
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
  }, []);

  const handleProvisionInvite = useCallback(async (userId: string) => {
    setActionLoading(userId);
    try {
      const result = await provisionInvite(userId);
      if (result && result.action_link) {
        showInviteLink(result.action_link, result.link_type as string);
      }
    } catch { /* toast already shown */ } finally { setActionLoading(null); }
  }, [provisionInvite, showInviteLink]);

  const handleSendReset = useCallback(async (userId: string) => {
    setActionLoading(userId);
    try {
      const result = await sendReset(userId);
      if (result && result.action_link) {
        showInviteLink(result.action_link, result.link_type as string ?? 'recovery');
      }
    } catch { /* toast already shown */ } finally { setActionLoading(null); }
  }, [sendReset, showInviteLink]);

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
          <div className="flex flex-col gap-1">
            <Badge variant={isHighRole ? 'default' : row.appRole === 'hod' ? 'secondary' : 'outline'}>
              {label}
            </Badge>
            {row.appRole === 'hod' && row.managedDepartments && row.managedDepartments.length > 0 && (
              <div className="flex flex-wrap gap-0.5">
                {row.managedDepartments.map(dId => (
                  <Badge key={dId} variant="outline" className="text-[10px] px-1 py-0">
                    {getDepartmentById(dId)?.name ?? dId}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'weeklyExpectedHours',
      header: 'Weekly Hours',
      render: (row) => String(row.weeklyExpectedHours),
    },
    // Auth status column
    ...(isAdmin
      ? [
          {
            key: 'authUserId' as keyof User,
            header: 'Auth Status',
            render: (row: User) => (
              <Badge variant={row.authUserId ? 'default' : 'outline'} className={row.authUserId ? 'bg-emerald-600 hover:bg-emerald-600/80' : ''}>
                {row.authUserId ? 'Provisioned' : 'Not provisioned'}
              </Badge>
            ),
          },
        ]
      : []),
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
            key: 'avatarUrl' as keyof User,
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

  const handleSave = useCallback(async (data: Omit<User, 'id'> & { managedDepartments?: string[]; reason?: string }) => {
    if (editingUser) {
      const { managedDepartments, reason, ...updates } = data;
      await updateUser(editingUser.id, updates, reason, managedDepartments);
    } else {
      const result = await addUser(data);
      if (result && result.action_link) {
        showInviteLink(result.action_link, result.link_type as string);
      }
    }
  }, [editingUser, updateUser, addUser, showInviteLink]);

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

      {/* Invite link modal */}
      <Dialog open={inviteLinkDialogOpen} onOpenChange={setInviteLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{inviteLinkType === 'recovery' ? 'Password Reset Link' : 'Invite Link'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {inviteLinkType === 'recovery'
                ? 'Share this link so the user can reset their password and sign in.'
                : 'Share this link if email delivery is delayed. The user can use it to set their password and sign in.'}
            </p>
            <div className="space-y-2">
              <Label htmlFor="invite-link-input">Link</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-link-input"
                  readOnly
                  value={inviteLinkUrl}
                  className="text-xs font-mono"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="shrink-0">
                  {linkCopied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  {linkCopied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteLinkDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
