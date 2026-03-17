import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we already have a token, try to fetch the current user.
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then((fetched) => setUser(fetched))
      .catch(() => {
        apiLogout();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    await apiLogin(credentials);
    const fetched = await getCurrentUser();
    setUser(fetched);
  };

  const register = async (payload) => {
    return apiRegister(payload);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, logout, register }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
