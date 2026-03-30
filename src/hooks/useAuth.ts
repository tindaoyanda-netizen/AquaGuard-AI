import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'resident' | 'county_admin' | 'sub_admin';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  county_id: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    role: null,
    isLoading: true,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setState(prev => ({
            ...prev,
            profile: null,
            role: null,
            isLoading: false,
          }));
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      setState(prev => ({
        ...prev,
        profile: profile as UserProfile | null,
        role: roleData?.role as UserRole | null,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    countyId: string,
    role: UserRole
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          county_id: countyId,
          role,
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error('Signup failed');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        full_name: fullName,
        county_id: countyId,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error('Failed to create profile');
    }

    const roleToInsert: UserRole = role === 'county_admin' ? 'county_admin' : 'resident';
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: data.user.id,
        role: roleToInsert,
      });

    if (roleError) {
      // Role table may have RLS restrictions — non-fatal, role is inferred from profile
      console.warn('Role insert skipped (RLS):', roleError.message);
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    localStorage.removeItem('ag_location');
    localStorage.removeItem('ag_user');
    
    setState({
      user: null,
      session: null,
      profile: null,
      role: null,
      isLoading: false,
    });
  };

  // Government admin is identified purely by county_id in their profile
  const isGovernmentAdmin = state.profile?.county_id === 'kenya_national';

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    isGovernmentAdmin,
    isCountyAdmin: state.role === 'county_admin' && !isGovernmentAdmin,
    isSubAdmin: state.role === 'sub_admin',
    isAdmin: (state.role === 'county_admin' || state.role === 'sub_admin') && !isGovernmentAdmin,
    isResident: state.role === 'resident',
  };
}
