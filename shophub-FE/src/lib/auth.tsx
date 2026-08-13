import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { api, clearSession, getStoredUser, storeSession, type ShopHubUser } from '@/lib/api';

type AuthContextValue = {
  user: ShopHubUser | null;
  login: (email: string, password: string, role: string, rememberMe?: boolean) => Promise<ShopHubUser>;
  register: (payload: { fullName: string; email: string; password: string; role: string; storeName?: string }) => Promise<ShopHubUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ShopHubUser | null>(() => getStoredUser());

  const value = useMemo<AuthContextValue>(() => ({
    user,
    async login(email, password, role, rememberMe = false) {
      const result = await api<{ accessToken: string; refreshToken: string; user: ShopHubUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role, rememberMe }),
      });
      storeSession(result.accessToken, result.refreshToken, result.user);
      setUser(result.user);
      return result.user;
    },
    async register(payload) {
      const result = await api<{ accessToken: string; refreshToken: string; user: ShopHubUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      storeSession(result.accessToken, result.refreshToken, result.user);
      setUser(result.user);
      return result.user;
    },
    async logout() {
      const refreshToken = localStorage.getItem('shophub.refresh');
      try {
        await api('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) });
      } catch {
        /* still clear local session */
      }
      clearSession();
      setUser(null);
    },
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
