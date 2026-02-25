import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { User, AppRole } from '@/types';
import { users as seedUsers } from '@/data/seed';

const STORAGE_KEY = 'timetrack_current_user_id';
const LS_USERS = 'timetrack_users';

function loadOrSeed<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as T[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* fall through */ }
  return seed;
}

function persist<T>(key: string, data: T[]) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* noop */ }
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  signOut: () => void;
  allUsers: User[];
  allUsersList: User[];
  appRole: AppRole | null;
  isAdmin: boolean;
  addUser: (data: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<Omit<User, 'id'>>) => void;
  toggleUserActive: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [allUsersList, setAllUsersList] = useState<User[]>(() => loadOrSeed(LS_USERS, seedUsers));

  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    try {
      const id = localStorage.getItem(STORAGE_KEY);
      if (!id) return null;
      const list = loadOrSeed(LS_USERS, seedUsers);
      return list.find(u => u.id === id) ?? null;
    } catch { return null; }
  });

  const setCurrentUser = useCallback((user: User) => {
    localStorage.setItem(STORAGE_KEY, user.id);
    setCurrentUserState(user);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUserState(null);
  }, []);

  const addUser = useCallback((data: Omit<User, 'id'>) => {
    setAllUsersList(prev => {
      const id = 'user-' + Date.now();
      const next = [...prev, { ...data, id } as User];
      persist(LS_USERS, next);
      return next;
    });
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<Omit<User, 'id'>>) => {
    setAllUsersList(prev => {
      const next = prev.map(u => u.id === id ? { ...u, ...updates } : u);
      persist(LS_USERS, next);
      return next;
    });
    // If updating the current user, sync their state
    setCurrentUserState(prev => {
      if (prev && prev.id === id) return { ...prev, ...updates };
      return prev;
    });
  }, []);

  const toggleUserActive = useCallback((id: string) => {
    setAllUsersList(prev => {
      const next = prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u);
      persist(LS_USERS, next);
      return next;
    });
    // If deactivating the current user, sign them out
    setCurrentUserState(prev => {
      if (prev && prev.id === id && prev.isActive) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return prev;
    });
  }, []);

  const allUsers = useMemo(() => allUsersList.filter(u => u.isActive), [allUsersList]);

  const value = useMemo<UserContextType>(() => ({
    currentUser,
    setCurrentUser,
    signOut,
    allUsers,
    allUsersList,
    appRole: currentUser?.appRole ?? null,
    isAdmin: currentUser?.appRole === 'admin',
    addUser,
    updateUser,
    toggleUserActive,
  }), [currentUser, setCurrentUser, signOut, allUsers, allUsersList, addUser, updateUser, toggleUserActive]);

  return (
    <UserContext.Provider value={value}>
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
  return context as Omit<UserContextType, 'currentUser'> & { currentUser: User };
}
