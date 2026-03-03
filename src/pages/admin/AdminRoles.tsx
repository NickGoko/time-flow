import { useEffect, useState } from 'react';
import { TopBar } from '@/components/TopBar';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import type { AppRole } from '@/types';

const ROLE_ORDER: AppRole[] = ['employee', 'hod', 'leadership', 'admin', 'super_admin'];
const ROLE_LABELS: Record<AppRole, string> = {
  employee: 'Employee',
  hod: 'HOD',
  leadership: 'Leadership',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

interface Permission {
  id: string;
  description: string;
}

export default function AdminRoles() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermMap, setRolePermMap] = useState<Map<string, Set<string>>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [permRes, rpRes] = await Promise.all([
        supabase.from('permissions').select('id, description').order('id'),
        supabase.from('role_permissions').select('role, permission_id'),
      ]);

      setPermissions(permRes.data ?? []);

      const map = new Map<string, Set<string>>();
      rpRes.data?.forEach(rp => {
        if (!map.has(rp.role)) map.set(rp.role, new Set());
        map.get(rp.role)!.add(rp.permission_id);
      });
      setRolePermMap(map);
      setLoading(false);
    })();
  }, []);

  const hasPermission = (role: AppRole, permId: string) => {
    if (role === 'super_admin') return true;
    return rolePermMap.get(role)?.has(permId) ?? false;
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Roles &amp; Permissions</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Read-only matrix showing which permissions are assigned to each role.
        </p>

        {loading ? (
          <div className="mt-8 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">Permission</TableHead>
                  {ROLE_ORDER.map(role => (
                    <TableHead key={role} className="text-center">
                      <Badge variant={role === 'super_admin' || role === 'admin' ? 'default' : role === 'hod' ? 'secondary' : 'outline'}>
                        {ROLE_LABELS[role]}
                      </Badge>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map(perm => (
                  <TableRow key={perm.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{perm.id}</div>
                      <div className="text-xs text-muted-foreground">{perm.description}</div>
                    </TableCell>
                    {ROLE_ORDER.map(role => (
                      <TableCell key={role} className="text-center">
                        {hasPermission(role, perm.id) && (
                          <Check className="mx-auto h-4 w-4 text-primary" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
