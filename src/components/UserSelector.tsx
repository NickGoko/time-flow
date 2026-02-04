import { ChevronDown, User as UserIcon } from 'lucide-react';
import { useCurrentUser } from '@/contexts/UserContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function UserSelector() {
  const { currentUser, setCurrentUser, allUsers } = useCurrentUser();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm font-medium">{currentUser.name}</span>
            <span className="text-xs text-muted-foreground">{currentUser.role}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Switch user context
        </div>
        {allUsers.map(user => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => setCurrentUser(user)}
            className="cursor-pointer gap-3 py-2.5"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">
                {user.department} · {user.role}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
