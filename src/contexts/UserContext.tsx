import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { users } from '@/data/seed';

export type AppRole = 'employee' | 'admin';

interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
  appRole: AppRole;
  setAppRole: (role: AppRole) => void;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function getInitialAppRole(): AppRole {
  const stored = localStorage.getItem('appRole');
  if (stored === 'admin' || stored === 'employee') return stored;
  return 'employee';
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(users[0]);
  const [appRole, setAppRoleState] = useState<AppRole>(getInitialAppRole);

  const setAppRole = (role: AppRole) => {
    setAppRoleState(role);
    localStorage.setItem('appRole', role);
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers: users,
        appRole,
        setAppRole,
        isAdmin: appRole === 'admin',
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useCurrentUser must be used within a UserProvider');
  }
  return context;
}
