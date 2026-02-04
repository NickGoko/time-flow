import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { users } from '@/data/seed';

interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(users[0]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers: users,
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
