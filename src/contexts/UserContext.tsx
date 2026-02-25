import { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from 'react';
import { User, AppRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Session } from '@supabase/supabase-js';
import { DEV_MODE } from '@/lib/devMode';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  setDevUser: (user: User) => void;
  signOut: () => Promise<void>;
  allUsers: User[];
  allUsersList: User[];
  appRole: AppRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  isDevMode: boolean;
  addUser: (data: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<Omit<User, 'id'>>) => Promise<void>;
  toggleUserActive: (id: string) => Promise<void>;
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

  const handleSession = useCallback(async (session: Session | null) => {
    if (!session?.user) {
      setCurrentUserState(null);
      setIsLoading(false);
      return;
    }

    const user = await fetchUserProfile(session.user.id);
    setCurrentUserState(user);
    setIsLoading(false);

    if (user) {
      refreshAllUsers();
    }
  }, [refreshAllUsers]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await handleSession(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
  }, []);

  const setDevUser = useCallback((user: User) => {
    if (!DEV_MODE) return;
    setCurrentUserState(user);
    setIsLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUserState(null);
  }, []);

  // ── Admin user management via Edge Function ───────────────────

  const addUser = useCallback(async (data: Omit<User, 'id'>) => {
    const { data: result, error } = await supabase.functions.invoke('admin-users', {
      body: {
        action: 'create',
        email: data.email,
        name: data.name,
        departmentId: data.departmentId,
        role: data.role,
        appRole: data.appRole,
        weeklyExpectedHours: data.weeklyExpectedHours,
      },
    });

    if (error) {
      toast.error('Failed to create user: ' + error.message);
      throw error;
    }
    if (result?.error) {
      toast.error('Failed to create user: ' + result.error);
      throw new Error(result.error);
    }

    toast.success('User invited successfully. They will receive an email to set their password.');
    await refreshAllUsers();
  }, [refreshAllUsers]);

  const updateUser = useCallback(async (id: string, updates: Partial<Omit<User, 'id'>>) => {
    const { data: result, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'update', userId: id, updates },
    });

    if (error) {
      toast.error('Failed to update user: ' + error.message);
      throw error;
    }
    if (result?.error) {
      toast.error('Failed to update user: ' + result.error);
      throw new Error(result.error);
    }

    toast.success('User updated successfully.');
    await refreshAllUsers();

    // Refresh current user if we updated ourselves
    if (id === currentUser?.id) {
      const session = (await supabase.auth.getSession()).data.session;
      if (session) {
        const refreshed = await fetchUserProfile(session.user.id);
        if (refreshed) setCurrentUserState(refreshed);
      }
    }
  }, [refreshAllUsers, currentUser?.id]);

  const toggleUserActive = useCallback(async (id: string) => {
    const { data: result, error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'toggle-active', userId: id },
    });

    if (error) {
      toast.error('Failed to toggle user: ' + error.message);
      throw error;
    }
    if (result?.error) {
      toast.error('Failed to toggle user: ' + result.error);
      throw new Error(result.error);
    }

    await refreshAllUsers();
  }, [refreshAllUsers]);

  const allUsers = useMemo(() => allUsersList.filter(u => u.isActive), [allUsersList]);

  const value = useMemo<UserContextType>(() => ({
    currentUser,
    setCurrentUser,
    setDevUser,
    signOut,
    allUsers,
    allUsersList,
    appRole: currentUser?.appRole ?? null,
    isAdmin: currentUser?.appRole === 'admin',
    isLoading,
    isDevMode: DEV_MODE,
    addUser,
    updateUser,
    toggleUserActive,
  }), [currentUser, setCurrentUser, setDevUser, signOut, allUsers, allUsersList, isLoading, addUser, updateUser, toggleUserActive]);

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
