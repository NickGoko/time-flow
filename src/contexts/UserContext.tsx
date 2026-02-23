import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, AppRole } from '@/types';
import { users } from '@/data/seed';

const STORAGE_KEY = 'timetrack_current_user_id';

function loadUserFromStorage(): User | null {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    if (!id) return null;
    return users.find(u => u.id === id) ?? null;
  } catch {
    return null;
  }
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  signOut: () => void;
  allUsers: User[];
  appRole: AppRole | null;
  isAdmin: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(loadUserFromStorage);

  const setCurrentUser = useCallback((user: User) => {
    localStorage.setItem(STORAGE_KEY, user.id);
    setCurrentUserState(user);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUserState(null);
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        signOut,
        allUsers: users,
        appRole: currentUser?.appRole ?? null,
        isAdmin: currentUser?.appRole === 'admin',
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

/** Use inside SessionGate-protected routes where currentUser is guaranteed non-null */
export function useAuthenticatedUser() {
  const context = useCurrentUser();
  if (!context.currentUser) {
    throw new Error('useAuthenticatedUser must be used within an authenticated route');
  }
  return context as Omit<UserContextType, 'currentUser'> & { currentUser: import('@/types').User };
}
