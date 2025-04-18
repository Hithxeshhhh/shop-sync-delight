import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { createAdminUser, isUserAdmin } from "../lib/supabase-admin";

type AuthUser = {
  id: string;
  name?: string;
  email?: string;
  isAdmin?: boolean;
} | null;

type AuthContextType = {
  user: AuthUser;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  createAdmin: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
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
  const [user, setUser] = useState<AuthUser>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  // Function to transform Supabase user to our app user
  const formatUser = (supabaseUser: User | null): AuthUser => {
    if (!supabaseUser) return null;
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name,
      isAdmin: supabaseUser.user_metadata?.isAdmin || false,
    };
  };

  // Check if the default admin exists
  const checkDefaultAdmin = async () => {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      
      if (!adminEmail) {
        console.warn('Admin email not defined in environment variables');
        return;
      }

      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) {
        console.error('Error checking for admin users:', error);
        return;
      }

      // Check if admin exists by searching for the admin email
      const adminExists = data.users.some(user => 
        user.email === adminEmail && 
        user.user_metadata?.isAdmin === true
      );

      if (!adminExists) {
        await createDefaultAdmin();
      }
      
      setInitialized(true);
    } catch (error) {
      console.error('Error in admin initialization:', error);
      setInitialized(true); // Still set as initialized to not block the app
    }
  };

  // Create the default admin from environment variables
  const createDefaultAdmin = async () => {
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
      const adminName = import.meta.env.VITE_ADMIN_NAME;

      if (!adminEmail || !adminPassword) {
        console.error('Admin credentials not found in environment variables');
        return;
      }

      // Create admin user
      const { error } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            name: adminName || 'Admin User',
            isAdmin: true
          },
        }
      });

      if (error) {
        console.error('Error creating default admin:', error);
      } else {
        console.log('Default admin created successfully');
      }
    } catch (error) {
      console.error('Error creating default admin:', error);
    }
  };

  // Initialize auth state from Supabase session
  useEffect(() => {
    // Add debug info to console about available admin credentials
    if (import.meta.env.DEV) {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
      console.info(
        `Admin credentials available: ${!!adminEmail && !!adminPassword}`,
        adminEmail ? `Email: ${adminEmail}` : ''
      );
    }

    // First check for admin session in localStorage
    const adminSession = localStorage.getItem('admin-session');
    
    if (adminSession) {
      try {
        const { user, expires_at } = JSON.parse(adminSession);
        
        // Check if session is still valid
        if (expires_at > Date.now()) {
          setUser(user);
          setLoading(false);
          return;
        } else {
          // Session expired, remove it
          localStorage.removeItem('admin-session');
        }
      } catch (err) {
        console.error('Error parsing admin session:', err);
        localStorage.removeItem('admin-session');
      }
    }
    
    // If no admin session, continue with normal Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(formatUser(session?.user ?? null));
      // After setting the user, try to initialize the admin if needed
      checkDefaultAdmin();
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const formattedUser = formatUser(session?.user ?? null);
        setUser(formattedUser);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Check if login is with admin credentials from environment variables
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
      
      if (email === adminEmail && password === adminPassword) {
        // Create an admin session with environment variables
        const adminUser: AuthUser = {
          id: 'admin-env',
          name: 'Environment Admin',
          email: adminEmail,
          isAdmin: true,
        };
        
        localStorage.setItem('admin-session', JSON.stringify({
          user: adminUser,
          createdAt: new Date().toISOString(),
        }));
        
        setUser(adminUser);
        navigate('/admin');
        return;
      }
      
      // Regular Supabase login for all other users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Get updated user data
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      // Check if user is admin using Supabase admin API
      let isAdmin = false;
      if (currentUser) {
        isAdmin = await isUserAdmin(currentUser.id);
      }
      
      // Update user metadata if admin status has changed
      if (currentUser && currentUser.user_metadata.isAdmin !== isAdmin) {
        await supabase.auth.updateUser({
          data: { 
            ...currentUser.user_metadata,
            isAdmin 
          }
        });
      }
      
      const formattedUser = formatUser(currentUser);
      
      // Redirect based on user role
      if (formattedUser?.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Register the user
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            isAdmin: false,
          },
          // Ensure email confirmation is required
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        throw error;
      }
      
      // Do not navigate - we'll handle this in the Register component
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Function to create a new admin user (only available to existing admins)
  const createAdmin = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      // Check if the current user is an admin (either Supabase or environment admin)
      if (!user?.isAdmin) {
        throw new Error('Only admins can create new admin users');
      }
      
      // Simple validation
      if (!name || !email || !password) {
        throw new Error('Name, email and password are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Create the admin user using our supabase-admin utility
      const createdUser = await createAdminUser(name, email, password);
      
      if (!createdUser) {
        throw new Error('Failed to create admin user');
      }
      
      console.log('New admin user created successfully:', name, email);
      return createdUser;
    } catch (error: any) {
      console.error('Create admin error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const resendVerificationEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Check if this is an admin session first
      const adminSession = localStorage.getItem('admin-session');
      if (adminSession) {
        localStorage.removeItem('admin-session');
        setUser(null);
        setSession(null);
        navigate('/login');
        return;
      }
      
      // Normal Supabase logout
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    session,
    login,
    register,
    createAdmin,
    logout,
    resendVerificationEmail,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
