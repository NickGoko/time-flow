export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

// Auth gating: when false, app skips supabase.auth and uses acting-user model
export const AUTH_ENABLED = false;

// Demo mode: when true, shows user-switcher dropdown in top bar
export const DEMO_MODE = true;
