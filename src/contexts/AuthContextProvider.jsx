import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { getCurrentUserRole } from '../lib/adminService';
import { AuthContext } from './AuthContext';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Fetch user role from database
  const fetchUserRole = useCallback(async (userId) => {
    if (!userId) {
      console.log('fetchUserRole: No userId provided');
      setUserRole('admin'); // Default to admin for testing
      return;
    }
    
    console.log('fetchUserRole: Fetching role for userId:', userId);
    try {
      const { role, error } = await getCurrentUserRole(userId);
      console.log('fetchUserRole result:', { role, error });
      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('admin'); // Default to 'admin' role for testing
      } else {
        console.log('Setting userRole to:', role || 'admin');
        setUserRole(role || 'admin');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('admin'); // Default to admin for testing
    }
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserRole(session.user.id);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
        console.log('Error in getInitialSession');
      } finally {
        setLoading(false);
        console.log('getInitialSession completed, loading set to false');
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('SIGNED_IN event: processing');
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Set role immediately to avoid loading delays
          setUserRole('admin');
          // Fetch actual role in background
          fetchUserRole(session.user.id).catch(console.error);
        }
        setLoading(false);
        console.log('SIGNED_IN event: completed');
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserRole]);

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) {
      console.error('Sign up error:', error);
    }

    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
    }

    return { data, error };
  };

  const signOut = async () => {
    try {
      // Check if there's an active session before attempting to sign out
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Sign out error:', error);
          return { error };
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error };
    }
  };

  const updatePassword = async (newPassword) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return userRole === 'admin';
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    isAdmin,
    refreshUserRole: () => fetchUserRole(user?.id)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;