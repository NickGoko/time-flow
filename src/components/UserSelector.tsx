import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DEMO_MODE, AUTH_ENABLED } from '@/lib/devMode';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function UserSelector() {
  const { currentUser, allUsers, setCurrentUser, signOut } = useCurrentUser();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  // Demo mode: show a user-switcher dropdown
  if (DEMO_MODE && !AUTH_ENABLED) {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
            {getInitials(currentUser.name)}
          </AvatarFallback>
        </Avatar>
        <Select
          value={currentUser.id}
          onValueChange={(id) => {
            const user = allUsers.find(u => u.id === id);
            if (user) setCurrentUser(user);
          }}
        >
          <SelectTrigger className="h-8 w-[180px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {allUsers.map(u => (
              <SelectItem key={u.id} value={u.id}>
                {u.name} ({u.appRole})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  // Auth mode: show name + sign-out
  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-7 w-7">
        <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
          {getInitials(currentUser.name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{currentUser.name}</span>
      <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-muted-foreground">
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  );
}
