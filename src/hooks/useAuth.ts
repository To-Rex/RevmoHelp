import { useState, useEffect } from 'react';
import { supabase, signOut as supabaseSignOut, isSupabaseAvailable, setSupabaseConnectionHealth } from '../lib/supabase';
import { userCache } from '../lib/cacheUtils';
import type { User as AuthUser } from '@supabase/supabase-js';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [authProvider, setAuthProvider] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log('useAuth: Getting initial session...');
        
        // Check cache first
        const cachedUser = userCache.get<User>('current_user');
        if (cachedUser) {
          setUser(cachedUser);
          setLoading(false);
          setInitialized(true);
          console.log('📦 Using cached user session');
          return;
        }
        
        if (!isSupabaseAvailable() || !supabase) {
          console.log('⚠️ Supabase not available');
          setUser(null);
          setLoading(false);
          setInitialized(true);
          return;
        }
        
        // Attempt to get session directly. If this fails due to network, mark Supabase as unhealthy.
        let session: any = null;
        let error: any = null;
        try {
          const res = await supabase.auth.getSession();
          session = res.data?.session;
          error = res.error;
        } catch (e) {
          console.error('Supabase getSession threw:', e);
          error = e;
        }
        console.log('🔍 useAuth: Initial session:', session?.user?.email || 'no session');
        
        if (error) {
          console.error('Error getting session:', error);
          // Mark connection unhealthy if network issues
          if (error instanceof Error && (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed to fetch') || error.name === 'TypeError' || error.message?.includes('NetworkError'))) {
            console.log('🚨 Network error detected while getting session, marking Supabase as unhealthy');
            setSupabaseConnectionHealth(false);
          }
          setUser(null);
        } else if (session?.user) {
          console.log('🔍 Session user metadata:', session.user.user_metadata);
          console.log('🔍 Session app metadata:', session.user.app_metadata);

          // Create user object from session
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            phone: session.user.user_metadata?.phone || undefined,
            role: session.user.user_metadata?.role || 'patient',
            avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || undefined,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          };
          setUser(userData);
          setSession(session);

          // Cache user data
          userCache.set('current_user', userData, 10 * 60 * 1000); // 10 minutes

          // Cache user data
          userCache.set('current_user', userData, 10 * 60 * 1000); // 10 minutes

          // Determine auth provider
          const provider = session.user.app_metadata?.provider || 'email';
          setAuthProvider(provider);

          console.log('✅ useAuth: User session loaded:', userData.email);
          console.log('🔍 Auth provider:', provider);
        } else {
          // Check for custom user (e.g., Telegram)
          const customUserId = localStorage.getItem('custom_user_id');
          if (customUserId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', customUserId)
              .single();
            if (profile) {
              setUser(profile);
              setAuthProvider('telegram');
              console.log('✅ useAuth: Custom user loaded:', profile.full_name);
            } else {
              localStorage.removeItem('custom_user_id');
              setUser(null);
              setAuthProvider(null);
            }
          } else {
            console.log('❌ useAuth: No session found');
            setUser(null);
            setAuthProvider(null);
            setSession(null);
          }
        }
      } catch (err) {
        console.error('Session loading error:', err);
        // Mark Supabase as unhealthy on any connection error
        if (err instanceof Error && (err.message?.includes('fetch') || err.message?.includes('network') || err.name === 'TypeError')) {
          console.log('🚨 Connection error detected, marking Supabase as unhealthy');
          setSupabaseConnectionHealth(false);
        }
        setUser(null);
        setAuthProvider(null);
      }
      
      setLoading(false);
      setInitialized(true);
    };

    getSession();

    // Only set up auth listener if Supabase is available
    let subscription: any = null;
    if (isSupabaseAvailable() && supabase) {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 useAuth: Auth state change:', event, session?.user?.email || 'no user');
          
          if (session?.user) {
            console.log('🔍 Auth state change user metadata:', session.user.user_metadata);

            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              phone: session.user.user_metadata?.phone || undefined,
              role: session.user.user_metadata?.role || 'patient',
              avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || undefined,
              created_at: session.user.created_at,
              updated_at: session.user.updated_at || session.user.created_at,
            };
            setUser(userData);
            setSession(session);

            // Determine auth provider
            const provider = session.user.app_metadata?.provider || 'email';
            setAuthProvider(provider);

            console.log('✅ useAuth: User set from state change:', userData.email);
            console.log('🔍 Full user data:', userData);
          } else {
            if (!supabase) return;
            // Check for custom user
            const customUserId = localStorage.getItem('custom_user_id');
            if (customUserId) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', customUserId)
                .single();
              if (profile) {
                setUser(profile);
                setAuthProvider('telegram');
              } else {
                localStorage.removeItem('custom_user_id');
                setUser(null);
                setAuthProvider(null);
              }
            } else {
              setUser(null);
              setAuthProvider(null);
            }
            setSession(null);

            // Clear user cache
            userCache.delete('current_user');
            console.log('❌ useAuth: User cleared from state change');
          }
          
          if (initialized) {
            setLoading(false);
          }
        }
      );
      subscription = authSubscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [initialized]);

  const signOut = async () => {
    const { error } = await supabaseSignOut();
    if (!error) {
      setUser(null);
      setAuthProvider(null);
    }
    return { error };
  };

  return {
    user,
    session,
    authProvider,
    loading,
    initialized,
    signOut,
    isAuthenticated: !!user,
  };
};
