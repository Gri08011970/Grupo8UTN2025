import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getSavedAuth, isAdminUser } from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Cargar sesión guardada (si existe) al montar
  useEffect(() => {
    const saved = getSavedAuth();
    if (saved?.user) {
      setUser(saved.user);
    }
  }, []);

  const isLogged = !!user;
  const isAdmin  = isAdminUser(user);

  async function login({ email, password }) {
    const u = await apiLogin({ email, password });
    setUser(u);
    return u;
  }

  async function signup({ name, email, password, phone }) {
    const u = await apiSignup({ name, email, password, phone });
    setUser(u);
    return u;
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    isLogged,
    isAdmin,
    login,
    signup,
    logout,
  }), [user, isLogged, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

