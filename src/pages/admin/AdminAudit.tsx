import { useEffect, useState, useCallback } from 'react';
import { TopBar } from '@/components/TopBar';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { format } from 'date-fns';

interface AuditEntry {
  id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  reason: string | null;
  before_data: Record<string, unknown> | null;
  after_data: Record<string, unknown> | null;
  created_at: string;
  actor_name?: string;
}

export default function AdminAudit() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [profiles, setProfiles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [auditRes, profilesRes] = await Promise.all([
      supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('profiles').select('id, name'),
    ]);

    const profileMap = new Map<string, string>();
    profilesRes.data?.forEach(p => profileMap.set(p.id, p.name));
    setProfiles(profileMap);
    setEntries((auditRes.data ?? []) as AuditEntry[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = search.trim()
    ? entries.filter(e => {
        const q = search.toLowerCase();
        return e.action.toLowerCase().includes(q)
          || e.target_type.toLowerCase().includes(q)
          || (e.reason?.toLowerCase().includes(q) ?? false)
          || (e.target_id?.toLowerCase().includes(q) ?? false)
          || (profiles.get(e.actor_id)?.toLowerCase().includes(q) ?? false);
      })
    : entries;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          History of administrative changes with before/after snapshots.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by action, target, reason, actor…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="mt-8 text-center text-muted-foreground">No audit entries found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(entry => (
                  <>
                    <TableRow key={entry.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                      <TableCell>
                        {entry.before_data || entry.after_data ? (
                          expandedId === entry.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                        ) : null}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {format(new Date(entry.created_at), 'dd MMM yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="text-sm">{profiles.get(entry.actor_id) ?? entry.actor_id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.action}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.target_type}{entry.target_id ? `: ${entry.target_id.slice(0, 8)}…` : ''}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {entry.reason ?? '—'}
                      </TableCell>
                    </TableRow>
                    {expandedId === entry.id && (entry.before_data || entry.after_data) && (
                      <TableRow key={`${entry.id}-detail`}>
                        <TableCell colSpan={6} className="bg-muted/50 p-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Before</p>
                              <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-48">
                                {entry.before_data ? JSON.stringify(entry.before_data, null, 2) : '—'}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground mb-1">After</p>
                              <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-48">
                                {entry.after_data ? JSON.stringify(entry.after_data, null, 2) : '—'}
                              </pre>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
