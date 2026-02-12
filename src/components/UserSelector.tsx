import { ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser, DEV_MODE } from '@/contexts/UserContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function UserSelector() {
  const { currentUser, setCurrentUser, allUsers, appRole, setAppRole } = useCurrentUser();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleRoleSwitch = (role: 'employee' | 'admin') => {
    setAppRole(role);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={appRole === 'admin' ? 'default' : 'ghost'}
          className="h-10 gap-2 px-3"
        >
          <span className="text-sm font-medium">
            {appRole === 'admin' ? 'Admin' : 'Employee'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          View mode
        </div>
        <DropdownMenuItem
          onClick={() => handleRoleSwitch('employee')}
          className="cursor-pointer gap-3 py-2"
        >
          {appRole === 'employee' ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <span className="h-4 w-4" />
          )}
          <span className="font-medium">Employee</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleRoleSwitch('admin')}
          className="cursor-pointer gap-3 py-2"
        >
          {appRole === 'admin' ? (
            <Check className="h-4 w-4 text-primary" />
          ) : (
            <span className="h-4 w-4" />
          )}
          <span className="font-medium">Admin</span>
        </DropdownMenuItem>

        {DEV_MODE && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Dev: switch user
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
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
