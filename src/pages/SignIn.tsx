import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { useCurrentUser } from '@/contexts/UserContext';
import { getDepartmentById } from '@/data/seed';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User } from '@/types';

export default function SignIn() {
  const { setCurrentUser, allUsers } = useCurrentUser();
  const navigate = useNavigate();

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleSelect = (user: User) => {
    setCurrentUser(user);
    navigate(user.appRole === 'admin' ? '/admin/reports/overview' : '/');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <Clock className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">TimeTrack</h1>
        <p className="text-sm text-muted-foreground">Select a demo user to continue</p>
      </div>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {allUsers.map(user => (
          <Card
            key={user.id}
            className="cursor-pointer transition-colors hover:border-primary/50 hover:bg-accent/40"
            onClick={() => handleSelect(user)}
          >
            <CardContent className="flex items-center gap-3 p-4">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{user.name}</span>
                  <Badge
                    variant={user.appRole === 'admin' ? 'default' : 'secondary'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {user.appRole === 'admin' ? 'Admin' : 'Employee'}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {getDepartmentById(user.departmentId)?.name ?? 'Unassigned'} · {user.role}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
