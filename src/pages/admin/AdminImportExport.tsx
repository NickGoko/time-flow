import { useState, useCallback } from 'react';
import { TopBar } from '@/components/TopBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExportPanel } from '@/components/admin/ExportPanel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/contexts/UserContext';
import { useReferenceData } from '@/contexts/ReferenceDataContext';
import { AUTH_ENABLED, DEMO_MODE_ALLOWED } from '@/lib/devMode';
import { toast } from 'sonner';
import type { AppRole } from '@/types';
import { Upload, FileText, CheckCircle2, AlertCircle, Users } from 'lucide-react';

const DEPT_MAP: Record<string, string> = {
  'finance & admin': 'dept-finance',
  'impact': 'dept-consulting',
  'communications': 'dept-comms',
  'admin': 'dept-operations',
  'business development': 'dept-bd',
  'productivity & it': 'dept-it',
  'hr': 'dept-hr',
};

interface ParsedUser {
  name: string;
  email: string;
  departmentId: string;
  departmentName: string;
  role: string;
  appRole: AppRole;
  isActive: boolean;
  managedDepartments?: string[]; // department IDs for HOD scoping
}

interface ImportReport {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

function parseHighestRole(rolesStr: string): AppRole {
  if (!rolesStr) return 'employee';
  const parts = rolesStr.split(';').map(s => s.trim().toLowerCase());
  // Priority: admin > leadership > hod > employee (FinanceReporter maps to employee)
  if (parts.includes('admin')) return 'admin';
  if (parts.includes('leadership')) return 'leadership';
  if (parts.includes('hod')) return 'hod';
  return 'employee';
}

function parseManagedDepartments(deptStr: string): string[] {
  if (!deptStr) return [];
  return deptStr.split(';').map(d => {
    const key = d.trim().toLowerCase();
    return DEPT_MAP[key] || '';
  }).filter(Boolean);
}

function parseCsv(text: string): ParsedUser[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const result: ParsedUser[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Simple CSV parse (handles no quoted commas in this dataset)
    const vals = lines[i].split(',').map(v => v.trim());
    if (vals.length < headers.length) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = vals[idx] || ''));

    const email = row['email'];
    if (!email || !email.includes('@')) break; // Stop at non-user rows

    const deptName = row['home_department'] || '';
    const deptId = DEPT_MAP[deptName.toLowerCase()] || '';

    const managedDepts = parseManagedDepartments(row['managed_departments'] || '');

    result.push({
      name: row['display_name'] || '',
      email,
      departmentId: deptId,
      departmentName: deptName,
      role: row['job_title'] || '',
      appRole: parseHighestRole(row['roles'] || ''),
      isActive: (row['is_active'] || 'true').toLowerCase() === 'true',
      managedDepartments: managedDepts.length > 0 ? managedDepts : undefined,
    });
  }

  return result;
}

export default function AdminImportExport() {
  const { currentUser, allUsersList, bulkProvision } = useCurrentUser();
  const { getDepartmentById } = useReferenceData();
  const [parsed, setParsed] = useState<ParsedUser[] | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [importing, setImporting] = useState(false);

  // Provision tab state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [provisioning, setProvisioning] = useState(false);
  const [provisionResults, setProvisionResults] = useState<{ userId: string; email: string; status: string; error?: string }[] | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReport(null);
    const reader = new FileReader();
    reader.onload = () => {
      const users = parseCsv(reader.result as string);
      setParsed(users);
      if (users.length === 0) toast.error('No valid user rows found in CSV');
    };
    reader.readAsText(file);
  }, []);

  const handleImport = useCallback(async () => {
    if (!parsed || parsed.length === 0) return;
    setImporting(true);

    const headers: Record<string, string> = {};
    if (!AUTH_ENABLED && currentUser) {
      headers['x-acting-user-id'] = currentUser.id;
    }

    try {
      const { data, error } = await supabase.functions.invoke('admin-users', {
        headers,
        body: {
          action: 'bulk-import',
          users: parsed.map(u => ({
            name: u.name,
            email: u.email,
            departmentId: u.departmentId || null,
            role: u.role,
            appRole: u.appRole,
            isActive: u.isActive,
            managedDepartments: u.managedDepartments || null,
          })),
        },
      });

      if (error) {
        toast.error('Import failed: ' + error.message);
        return;
      }

      if (data?.error) {
        toast.error('Import failed: ' + data.error);
        return;
      }

      setReport(data as ImportReport);
      toast.success(`Import complete: ${data.created} created, ${data.updated} updated`);
    } finally {
      setImporting(false);
    }
  }, [parsed, currentUser]);

  const handleBulkProvision = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setProvisioning(true);
    try {
      const results = await bulkProvision(Array.from(selectedIds));
      setProvisionResults(results);
      const invited = results.filter(r => r.status === 'invited' || r.status === 're-invited').length;
      const errors = results.filter(r => r.status === 'error').length;
      toast.success(`Provisioned ${invited} user(s)${errors > 0 ? `, ${errors} error(s)` : ''}`);
    } catch { /* toast already shown */ } finally {
      setProvisioning(false);
    }
  }, [selectedIds, bulkProvision]);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === allUsersList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allUsersList.map(u => u.id)));
    }
  }, [selectedIds.size, allUsersList]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Import / Export</h1>

        <Tabs defaultValue="export" className="mt-6">
          <TabsList>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="provision">Provision Logins</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="mt-6">
            <ExportPanel />
          </TabsContent>

          <TabsContent value="import" className="mt-6 space-y-6">
            {/* File picker */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <h3 className="font-medium">Upload Users CSV</h3>
                  <p className="text-sm text-muted-foreground">Select a CSV file with user data to import</p>
                </div>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFile}
                  className="w-auto max-w-xs"
                />
              </div>
            </Card>

            {/* Preview table */}
            {parsed && parsed.length > 0 && (
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Preview ({parsed.length} users)</h3>
                  </div>
                  <Button onClick={handleImport} disabled={importing}>
                    {importing ? 'Importing…' : 'Import Users'}
                  </Button>
                </div>

                <div className="rounded-md border overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsed.map((u, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell className="text-sm">{u.email}</TableCell>
                          <TableCell>
                            {u.departmentId ? (
                              <span className="text-sm">{u.departmentName}</span>
                            ) : (
                              <span className="text-sm text-destructive">Unmapped: {u.departmentName}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{u.role}</TableCell>
                          <TableCell>
                          <Badge variant={u.appRole === 'admin' || u.appRole === 'leadership' ? 'default' : u.appRole === 'hod' ? 'secondary' : 'outline'}>
                              {u.appRole}
                            </Badge>
                          </TableCell>
                          <TableCell>{u.isActive ? '✓' : '✗'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {/* Import report */}
            {report && (
              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Import Report</h3>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{report.created}</p>
                    <p className="text-sm text-muted-foreground">Created</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.updated}</p>
                    <p className="text-sm text-muted-foreground">Updated</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{report.skipped}</p>
                    <p className="text-sm text-muted-foreground">Skipped</p>
                  </div>
                </div>
                {report.errors.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>Errors ({report.errors.length}):</span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1 max-h-32 overflow-auto">
                      {report.errors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}
          </TabsContent>

          {/* ── Provision Logins Tab ──────────────────────────────── */}
          <TabsContent value="provision" className="mt-6 space-y-6">
            {!provisionResults ? (
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-medium">Select Users to Provision ({selectedIds.size} selected)</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                      {selectedIds.size === allUsersList.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button onClick={handleBulkProvision} disabled={provisioning || selectedIds.size === 0}>
                      {provisioning ? 'Provisioning…' : `Provision ${selectedIds.size} User(s)`}
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={selectedIds.size === allUsersList.length && allUsersList.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>App Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsersList.map(u => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(u.id)}
                              onCheckedChange={() => toggleSelect(u.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell className="text-sm">{u.email}</TableCell>
                          <TableCell className="text-sm">{getDepartmentById(u.departmentId)?.name ?? u.departmentId}</TableCell>
                          <TableCell>
                            <Badge variant={u.appRole === 'admin' || u.appRole === 'super_admin' || u.appRole === 'leadership' ? 'default' : u.appRole === 'hod' ? 'secondary' : 'outline'}>
                              {u.appRole === 'super_admin' ? 'Super Admin' : u.appRole}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            ) : (
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Provision Results</h3>
                  </div>
                  <Button variant="outline" onClick={() => { setProvisionResults(null); setSelectedIds(new Set()); }}>
                    Back
                  </Button>
                </div>

                <div className="rounded-md border overflow-auto max-h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {provisionResults.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-sm">{r.email || r.userId}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === 'error' ? 'destructive' : 'default'}>
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{r.error ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
