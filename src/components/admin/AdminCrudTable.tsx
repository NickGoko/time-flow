import { useState, useMemo, type ReactNode } from 'react';
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Search } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────

export interface CrudColumn<T> {
  key: keyof T & string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface AdminCrudTableProps<T extends { id: string; isActive: boolean }> {
  columns: CrudColumn<T>[];
  data: T[];
  onToggleActive: (id: string) => void;
  onEdit: (row: T) => void;
  onAdd: () => void;
  addLabel: string;
  entityLabel: string;
  searchPlaceholder?: string;
  searchKeys?: (keyof T & string)[];
}

// ── EditDialog (exported for use by parent pages) ───────────────────

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
}

export function EditDialog({ open, onOpenChange, title, children }: EditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

// ── Main table component ────────────────────────────────────────────

export function AdminCrudTable<T extends { id: string; isActive: boolean }>({
  columns,
  data,
  onToggleActive,
  onEdit,
  onAdd,
  addLabel,
  entityLabel,
  searchPlaceholder = 'Search…',
  searchKeys,
}: AdminCrudTableProps<T>) {
  const [search, setSearch] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter(row => {
      const keys = searchKeys ?? columns.map(c => c.key);
      return keys.some(k => {
        const val = row[k];
        return typeof val === 'string' && val.toLowerCase().includes(q);
      });
    });
  }, [data, search, searchKeys, columns]);

  const confirmRow = confirmId ? data.find(r => r.id === confirmId) : null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          {addLabel}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (
                <TableHead key={col.key}>{col.header}</TableHead>
              ))}
              <TableHead className="w-20 text-center">Active</TableHead>
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="text-center text-muted-foreground py-8">
                  No {entityLabel}s found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(row => (
                <TableRow key={row.id} className={!row.isActive ? 'opacity-50' : ''}>
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <Switch
                      checked={row.isActive}
                      onCheckedChange={() => {
                        if (row.isActive) {
                          setConfirmId(row.id);
                        } else {
                          onToggleActive(row.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirm deactivate dialog */}
      <AlertDialog open={!!confirmId} onOpenChange={open => { if (!open) setConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate {entityLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              This {entityLabel} will no longer be available in dropdown menus. You can reactivate it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmId) onToggleActive(confirmId);
                setConfirmId(null);
              }}
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
