import { Clock } from 'lucide-react';
import { UserSelector } from './UserSelector';

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Clock className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">TimeTrack</span>
            <span className="text-xs text-muted-foreground">Time Registration</span>
          </div>
        </div>
        
        <UserSelector />
      </div>
    </header>
  );
}
