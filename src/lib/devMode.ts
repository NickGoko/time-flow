/** Environment policy — single source of truth for all mode flags. */

export type AppEnv = 'dev' | 'staging' | 'prod';

/** Derived from VITE_APP_ENV; defaults to 'dev' when unset (local development). */
export const APP_ENV: AppEnv = (import.meta.env.VITE_APP_ENV || 'dev') as AppEnv;

/** Legacy flag — kept for backward compat but prefer APP_ENV checks. */
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';

/** Whether demo-mode features (user switcher, x-acting-user-id header) are allowed. */
export const DEMO_MODE_ALLOWED = APP_ENV !== 'prod';

/** Whether Supabase Auth is required for all operations. */
export const AUTH_ENABLED = APP_ENV === 'prod' || import.meta.env.VITE_AUTH_ENABLED === 'true';

/**
 * True only when demo-mode fallback is both allowed AND auth is not enforced.
 * When AUTH_ENABLED is true, DEMO_MODE is always false regardless of APP_ENV —
 * this prevents the app from bootstrapping a demo session instead of requiring login.
 * @deprecated Use DEMO_MODE_ALLOWED instead. Kept for existing imports.
 */
export const DEMO_MODE = DEMO_MODE_ALLOWED && !AUTH_ENABLED;
