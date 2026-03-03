import { useState, useCallback } from 'react';
import { TopBar } from '@/components/TopBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExportPanel } from '@/components/admin/ExportPanel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser } from '@/contexts/UserContext';
import { AUTH_ENABLED } from '@/lib/devMode';
import { toast } from 'sonner';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

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
  appRole: 'admin' | 'employee' | 'super_admin';
  isActive: boolean;
}

interface ImportReport {
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

function parseRoles(rolesStr: string): 'admin' | 'super_admin' | 'employee' {
  if (!rolesStr) return 'employee';
  const parts = rolesStr.split(';').map(s => s.trim().toLowerCase());
  if (parts.includes('admin')) return 'admin';
  if (parts.includes('leadership')) return 'super_admin';
  return 'employee';
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

    result.push({
      name: row['display_name'] || '',
      email,
      departmentId: deptId,
      departmentName: deptName,
      role: row['job_title'] || '',
      appRole: parseRoles(row['roles'] || ''),
      isActive: (row['is_active'] || 'true').toLowerCase() === 'true',
    });
  }

  return result;
}

export default function AdminImportExport() {
  const { currentUser } = useCurrentUser();
  const [parsed, setParsed] = useState<ParsedUser[] | null>(null);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [importing, setImporting] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Import / Export</h1>

        <Tabs defaultValue="export" className="mt-6">
          <TabsList>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
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
                            <Badge variant={u.appRole === 'admin' ? 'default' : u.appRole === 'super_admin' ? 'secondary' : 'outline'}>
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
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
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
        </Tabs>
      </main>
    </div>
  );
}
