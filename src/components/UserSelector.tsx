import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function UserSelector() {
  const { currentUser, signOut } = useCurrentUser();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

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
