/** Backend paths. The BFF mirrors them under `/api` (see `src/app/api/auth`). */
export const AUTH_KEYS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
} as const;
