import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Backend endpoints config
export const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '';

export interface User {
  id: number;
  email: string;
  gemini_api_key?: string | null;
}

export interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUserKey: (key: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (sessionToken: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${sessionToken}` }
      });
      setUser(response.data);
    } catch (err) {
      console.error("Failed to retrieve profile credentials", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    await fetchProfile(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUserKey = (newKey: string) => {
    if (user) {
      setUser({ ...user, gemini_api_key: newKey });
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, updateUserKey }}>
      {children}
    </AuthContext.Provider>
  );
};
