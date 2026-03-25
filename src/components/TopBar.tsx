import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserSelector } from './UserSelector';
import { useAuthenticatedUser } from '@/contexts/UserContext';
import { Badge } from '@/components/ui/badge';

export function TopBar() {
  const { currentUser, isAdmin } = useAuthenticatedUser();

  const homePath = isAdmin ? '/admin/reports/overview' : '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to={homePath} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold tracking-tight">TimeTrack</span>
                {isAdmin && <Badge variant="default" className="text-[10px] px-2 py-0">Admin</Badge>}
              </div>
              <span className="text-xs text-muted-foreground">Time Registration</span>
            </div>
          </Link>

          {currentUser && (
            <nav className="hidden md:flex items-center gap-1">
              {isAdmin ? (
                <>
                  <Link to="/admin/reports/overview" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Reports</Link>
                  <Link to="/admin/reference-data" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Reference Data</Link>
                  <Link to="/admin/users" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Users</Link>
                </>
              ) : (
                <Link to="/me/insights" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">History &amp; Insights</Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <UserSelector />
        </div>
      </div>
    </header>
  );
}
