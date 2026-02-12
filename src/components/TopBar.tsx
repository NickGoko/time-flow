import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserSelector } from './UserSelector';
import { useCurrentUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';

export function TopBar() {
  const { isAdmin } = useCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Clock className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight">TimeTrack</span>
              <span className="text-xs text-muted-foreground">Time Registration</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">Admin</Link>
            </Button>
          )}
          <UserSelector />
        </div>
      </div>
    </header>
  );
}
