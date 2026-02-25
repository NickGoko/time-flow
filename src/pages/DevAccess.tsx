import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { DEV_MODE } from '@/lib/devMode';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, AlertTriangle } from 'lucide-react';
import type { User, AppRole } from '@/types';

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  department_id: string | null;
  role: string;
  weekly_expected_hours: number;
  is_active: boolean;
  avatar_url: string | null;
}

export default function DevAccess() {
  const navigate = useNavigate();
  const { setDevUser, currentUser } = useCurrentUser();
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<Map<string, AppRole>>(new Map());
  const [loading, setLoading] = useState(true);
  const [manualEmail, setManualEmail] = useState('');

  useEffect(() => {
    if (!DEV_MODE) return;
    async function load() {
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('user_roles').select('user_id, role'),
      ]);
      if (profilesRes.data) setProfiles(profilesRes.data as ProfileRow[]);
      const rm = new Map<string, AppRole>();
      rolesRes.data?.forEach((r: { user_id: string; role: string }) => rm.set(r.user_id, r.role as AppRole));
      setRoles(rm);
      setLoading(false);
    }
    load();
  }, []);

  if (!DEV_MODE) return <Navigate to="/sign-in" replace />;
  if (currentUser) return <Navigate to={currentUser.appRole === 'admin' ? '/admin/reports/overview' : '/'} replace />;

  const selectUser = (p: ProfileRow) => {
    const user: User = {
      id: p.id,
      name: p.name,
      email: p.email,
      departmentId: p.department_id ?? '',
      role: p.role,
      appRole: roles.get(p.id) ?? 'employee',
      weeklyExpectedHours: p.weekly_expected_hours,
      isActive: p.is_active,
      avatarUrl: p.avatar_url ?? undefined,
    };
    setDevUser(user);
    navigate(user.appRole === 'admin' ? '/admin/reports/overview' : '/');
  };

  const handleManualEntry = () => {
    // Create a synthetic admin user — no DB query needed (RLS blocks anon reads)
    const syntheticUser: User = {
      id: 'dev-mode-user',
      name: manualEmail.split('@')[0],
      email: manualEmail,
      departmentId: '',
      role: 'Developer',
      appRole: 'admin',
      weeklyExpectedHours: 40,
      isActive: true,
    };
    setDevUser(syntheticUser);
    navigate('/admin/reports/overview');
  };

  const activeProfiles = profiles.filter(p => p.is_active);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Clock className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">TimeTrack</h1>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase">Dev Mode</span>
          </div>
          <CardTitle className="text-lg">Select Demo User</CardTitle>
          <CardDescription>
            Auth is bypassed. Writes may fail (no real session). Choose a user to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : activeProfiles.length > 0 ? (
            <div className="flex flex-col gap-2">
              {activeProfiles.map(p => (
                <Button
                  key={p.id}
                  variant="outline"
                  className="justify-between h-auto py-3"
                  onClick={() => selectUser(p)}
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="font-medium">{p.name || p.email}</span>
                    <span className="text-xs text-muted-foreground">{p.email}</span>
                  </div>
                  <Badge variant={roles.get(p.id) === 'admin' ? 'default' : 'secondary'} className="ml-2">
                    {roles.get(p.id) ?? 'employee'}
                  </Badge>
                </Button>
              ))}
            </div>
          ) : null}

          {/* Manual email fallback — always shown, creates synthetic admin user */}
          <div className="border-t pt-4 flex flex-col gap-2">
            <Label htmlFor="dev-email" className="text-sm font-medium">
              {activeProfiles.length > 0 ? 'Or enter email manually (admin)' : 'Enter any email to proceed as admin'}
            </Label>
            <div className="flex gap-2">
              <Input
                id="dev-email"
                type="email"
                placeholder="you@example.com"
                value={manualEmail}
                onChange={e => setManualEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && manualEmail && handleManualEntry()}
              />
              <Button onClick={handleManualEntry} disabled={!manualEmail}>Go</Button>
            </div>
            <p className="text-xs text-muted-foreground">Creates a synthetic admin session (read-only, no real auth).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
