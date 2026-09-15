import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { superAdminLogin, superAdminLogout } from '@/lib/superadmin-api';

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

  useEffect(() => {
    if (!expiresAt) return;
    const timeout = window.setTimeout(() => {
      setAccessToken(null);
      setRefreshToken(null);
      setExpiresAt(null);
    }, Math.max(0, expiresAt - Date.now()));
    return () => window.clearTimeout(timeout);
  }, [expiresAt]);

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
