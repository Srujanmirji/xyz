import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'AGENT' | 'USER';
  avatar?: string;
  phone?: string;
  bio?: string;
  location?: string;
  onboardingCompleted?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  googleLogin: (payload: { email: string; name: string; avatar?: string }) => Promise<any>;
  registerUser: (name: string, email: string, password: string, role?: string) => Promise<any>;
  logout: () => void;
  updateProfile: (data: { name?: string; avatar?: string; phone?: string; bio?: string; location?: string }) => Promise<any>;
  completeOnboarding: (data: { avatar?: string; phone?: string; bio?: string; location?: string }) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set Axios default base URL
axios.defaults.baseURL = 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

        try {
          // Verify with backend
          const res = await axios.get('/auth/profile');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('user', JSON.stringify(res.data.data));
          }
        } catch (error) {
          // Token expired or invalid
          console.error('Auto-auth verification failed', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      if (res.data.success) {
        const { user: loggedUser, token: authToken } = res.data.data;
        setToken(authToken);
        setUser(loggedUser);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        return res.data;
      }
    } catch (error: any) {
      setIsLoading(false);
      throw error.response?.data?.message || 'Login failed';
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (payload: { email: string; name: string; avatar?: string }) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/google', payload);
      if (res.data.success) {
        const { user: loggedUser, token: authToken } = res.data.data;
        setToken(authToken);
        setUser(loggedUser);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        return res.data;
      }
    } catch (error: any) {
      setIsLoading(false);
      throw error.response?.data?.message || 'Google login failed';
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (name: string, email: string, password: string, role?: string) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        const { user: registeredUser, token: authToken } = res.data.data;
        setToken(authToken);
        setUser(registeredUser);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(registeredUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
        return res.data;
      }
    } catch (error: any) {
      setIsLoading(false);
      throw error.response?.data?.message || 'Registration failed';
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (data: { name?: string; avatar?: string; phone?: string; bio?: string; location?: string }) => {
    try {
      const res = await axios.put('/auth/profile', data);
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
        return res.data;
      }
    } catch (error: any) {
      throw error.response?.data?.message || 'Update profile failed';
    }
  };

  const completeOnboarding = async (data: { avatar?: string; phone?: string; bio?: string; location?: string }) => {
    try {
      const res = await axios.post('/auth/onboarding', data);
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('user', JSON.stringify(res.data.data));
        return res.data;
      }
    } catch (error: any) {
      throw error.response?.data?.message || 'Onboarding failed';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        googleLogin,
        registerUser,
        logout,
        updateProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
