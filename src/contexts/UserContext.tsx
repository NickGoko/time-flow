import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { User, AppRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  signOut: () => Promise<void>;
  allUsers: User[];
  allUsersList: User[];
  appRole: AppRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  addUser: (data: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<Omit<User, 'id'>>) => void;
  toggleUserActive: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

async function fetchUserProfile(userId: string): Promise<User | null> {
  const [profileRes, roleRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_roles').select('role').eq('user_id', userId).single(),
  ]);

  if (profileRes.error || !profileRes.data) return null;

  const profile = profileRes.data;
  const appRole: AppRole = (roleRes.data?.role as AppRole) ?? 'employee';

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    departmentId: profile.department_id ?? '',
    role: profile.role,
    appRole,
    weeklyExpectedHours: profile.weekly_expected_hours,
    isActive: profile.is_active,
    avatarUrl: profile.avatar_url ?? undefined,
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [allUsersList, setAllUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all users (for admin pages)
  const refreshAllUsers = useCallback(async () => {
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('user_id, role');

    if (!profiles) return;

    const roleMap = new Map<string, AppRole>();
    roles?.forEach(r => roleMap.set(r.user_id, r.role as AppRole));

    const users: User[] = profiles.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      departmentId: p.department_id ?? '',
      role: p.role,
      appRole: roleMap.get(p.id) ?? 'employee',
      weeklyExpectedHours: p.weekly_expected_hours,
      isActive: p.is_active,
      avatarUrl: p.avatar_url ?? undefined,
    }));

    setAllUsersList(users);
  }, []);

  // Handle session changes
  const handleSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setCurrentUserState(null);
      setIsLoading(false);
      return;
    }

    const user = await fetchUserProfile(session.user.id);
    setCurrentUserState(user);
    setIsLoading(false);

    // Fetch all users once authenticated (admin needs this)
    if (user) {
      refreshAllUsers();
    }
  }, [refreshAllUsers]);

  useEffect(() => {
    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await handleSession(session);
      }
    );

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUserState(null);
  }, []);

  // These are no-ops until Brick 6 (admin edge functions)
  const addUser = useCallback((_data: Omit<User, 'id'>) => {
    console.warn('addUser: not implemented yet (Brick 6)');
  }, []);

  const updateUser = useCallback((_id: string, _updates: Partial<Omit<User, 'id'>>) => {
    console.warn('updateUser: not implemented yet (Brick 6)');
  }, []);

  const toggleUserActive = useCallback((_id: string) => {
    console.warn('toggleUserActive: not implemented yet (Brick 6)');
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
    isLoading,
    addUser,
    updateUser,
    toggleUserActive,
  }), [currentUser, setCurrentUser, signOut, allUsers, allUsersList, isLoading, addUser, updateUser, toggleUserActive]);

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
