import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      
      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            return { error: error.message };
          }
          
          set({ 
            user: data.user, 
            session: data.session,
            isAuthenticated: true,
            isLoading: false 
          });
          
          return {};
        } catch (error) {
          return { error: 'Erro inesperado durante o login' };
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          const redirectUrl = `${window.location.origin}/`;
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: redirectUrl,
              data: {
                name: name
              }
            }
          });
          
          if (error) {
            return { error: error.message };
          }
          
          if (data.user && data.session) {
            set({ 
              user: data.user, 
              session: data.session,
              isAuthenticated: true,
              isLoading: false 
            });
          }
          
          return {};
        } catch (error) {
          return { error: 'Erro inesperado durante o cadastro' };
        }
      },
      
      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({ 
            user: null, 
            session: null,
            isAuthenticated: false,
            isLoading: false 
          });
        } catch (error) {
          console.error('Erro durante logout:', error);
        }
      },
      
      initialize: () => {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            set({
              session,
              user: session?.user ?? null,
              isAuthenticated: !!session,
              isLoading: false
            });
          }
        );
        
        // Check for existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
          set({
            session,
            user: session?.user ?? null,
            isAuthenticated: !!session,
            isLoading: false
          });
        });
        
        return () => subscription.unsubscribe();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);