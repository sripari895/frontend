import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('swiftship_token'));
  const [loading, setLoading] = useState(true);

  // Set/remove default auth header whenever token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('swiftship_token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('swiftship_token');
    }
  }, [token]);

  // On mount, validate stored token
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.data);
      } catch {
        // Token expired or invalid
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.data.token);
    setUser(data.data.user);
    return data; // Return full response data including the role
  };

  const register = async (name, email, password, phone) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    setToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
