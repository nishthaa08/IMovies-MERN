import { createContext, useContext, useState } from "react";
import api, { TOKEN_KEY, USER_KEY } from "../api";

const AuthContext = createContext(null);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const saveSession = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
    return user;
  };

  const login = async (email, password, asAdmin = false) => {
    const { data } = await api.post(asAdmin ? "/auth/admin/login" : "/auth/login", { email, password });
    return saveSession(data);
  };

  const register = async (payload, asAdmin = false) => {
    const { data } = await api.post(asAdmin ? "/auth/admin/register" : "/auth/register", payload);
    return saveSession(data);
  };

  const updateUser = (u) => {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
