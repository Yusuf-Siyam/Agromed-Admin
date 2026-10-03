import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { superAdminLogin, superAdminLogout, superAdminRefresh } from '@/lib/superadmin-api';

// Rotate this long before the access token expires, so no request goes out on a dead token.
const REFRESH_SKEW_MS = 60_000;

interface SessionContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SuperAdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  // Rotate the pair shortly before expiry, as the buyer app's session does. Only a failed rotation
  // ends the session; the refresh token is single-use, so the new one replaces it.
  useEffect(() => {
    if (!expiresAt || !refreshToken) return;
    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      try {
        const session = await superAdminRefresh(refreshToken);
        if (cancelled) return;
        if (!session.user.roles.includes('super_admin')) throw new Error('SuperAdmin access is required.');
        setAccessToken(session.accessToken);
        setRefreshToken(session.refreshToken);
        setExpiresAt(Date.parse(session.expiresAt));
      } catch {
        if (cancelled) return;
        setAccessToken(null);
        setRefreshToken(null);
        setExpiresAt(null);
      }
    }, Math.max(0, expiresAt - Date.now() - REFRESH_SKEW_MS));
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [expiresAt, refreshToken]);

  const value = useMemo<SessionContextValue>(() => ({
    accessToken,
    isAuthenticated: accessToken != null && (expiresAt == null || expiresAt > Date.now()),
    async login(identifier, password) {
      const session = await superAdminLogin(identifier, password);
      if (!session.user.roles.includes('super_admin')) throw new Error('SuperAdmin access is required.');
      setAccessToken(session.accessToken);
      setRefreshToken(session.refreshToken);
      setExpiresAt(Date.parse(session.expiresAt));
    },
    async logout() {
      try {
        if (accessToken && refreshToken) await superAdminLogout(accessToken, refreshToken);
      } finally {
        setAccessToken(null);
        setRefreshToken(null);
        setExpiresAt(null);
      }
    }
  }), [accessToken, expiresAt, refreshToken]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSuperAdminSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('SuperAdmin session provider is missing.');
  return value;
}
