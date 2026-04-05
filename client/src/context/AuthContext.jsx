import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [judge, setJudge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('spotlight_token');
    if (token) {
      api.get('/auth/me')
        .then((res) => setJudge(res.data))
        .catch(() => localStorage.removeItem('spotlight_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('spotlight_token', res.data.token);
    setJudge(res.data.judge);
    return res.data.judge;
  };

  const logout = () => {
    localStorage.removeItem('spotlight_token');
    setJudge(null);
  };

  return (
    <AuthContext.Provider value={{ judge, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
