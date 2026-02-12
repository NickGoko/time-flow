import { ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '@/contexts/UserContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function UserSelector() {
  const { currentUser, setCurrentUser, allUsers } = useCurrentUser();
  const navigate = useNavigate();

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleSelectUser = (user: typeof currentUser) => {
    setCurrentUser(user);
    navigate(user.appRole === 'admin' ? '/admin' : '/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-10 gap-2 px-3">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{currentUser.name}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          Switch user
        </div>
        {allUsers.map(user => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => handleSelectUser(user)}
            className="cursor-pointer gap-3 py-2.5"
          >
            {currentUser.id === user.id ? (
              <Check className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <span className="h-4 w-4 shrink-0" />
            )}
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.name}</span>
                <Badge
                  variant={user.appRole === 'admin' ? 'default' : 'secondary'}
                  className="text-[10px] px-1.5 py-0"
                >
                  {user.appRole === 'admin' ? 'Admin' : 'Employee'}
                </Badge>
              </div>
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
