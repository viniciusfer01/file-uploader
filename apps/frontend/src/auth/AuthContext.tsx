import { createContext, ReactNode, useContext, useState } from 'react';
import { api } from '../services/api';
import { clearSession, getStoredToken, getStoredUser, persistSession } from '../services/auth-storage';
import { LoginResponse } from '../types/auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [userEmail, setUserEmail] = useState<string | null>(() => getStoredUser()?.email ?? null);

  async function login(email: string, password: string) {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    persistSession(response.data.token, response.data.user);
    setToken(response.data.token);
    setUserEmail(response.data.user.email);
  }

  function logout() {
    clearSession();
    setToken(null);
    setUserEmail(null);
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: Boolean(token),
        userEmail,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}

