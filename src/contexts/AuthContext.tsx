
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
} | null;

type AuthContextType = {
  user: User;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing login on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('ecommerce-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // In a real app, you'd call an API here
    // For demo purposes, we'll do basic validation and simulate a server response
    setLoading(true);
    try {
      // Demo authentication logic
      if (email === 'admin@example.com' && password === 'admin123') {
        const adminUser = { id: '1', name: 'Admin User', email, isAdmin: true };
        setUser(adminUser);
        localStorage.setItem('ecommerce-user', JSON.stringify(adminUser));
      } else if (email && password) {
        // Any other valid email/password is a regular user
        const regularUser = { id: '2', name: 'Customer', email, isAdmin: false };
        setUser(regularUser);
        localStorage.setItem('ecommerce-user', JSON.stringify(regularUser));
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    // In a real app, you'd call an API here
    setLoading(true);
    try {
      // Demo registration logic
      if (!name || !email || !password) {
        throw new Error('All fields are required');
      }
      
      const newUser = { id: Math.random().toString(36).substr(2, 9), name, email, isAdmin: false };
      setUser(newUser);
      localStorage.setItem('ecommerce-user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ecommerce-user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
