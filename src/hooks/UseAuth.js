// src/hooks/useAuth.js
export function useAuth() {
 
  return {
    isAuthenticated: false,
    user: null,
    login: () => {},
    logout: () => {},
  };
}
