import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

export interface UserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  theme: 'light' | 'dark' | 'system';
  colorTheme: 'blue' | 'green' | 'purple' | 'orange';
  currency: string;
  numberFormat: string;
  compactMode: boolean;
  sidebarAutoCollapse: boolean;
  defaultPage: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  specialDatesReminder: boolean;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  const loadProfile = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setProfile({
          id: data.id,
          firstName: data.first_name || undefined,
          lastName: data.last_name || undefined,
          theme: (data.theme as 'light' | 'dark' | 'system') || 'system',
          colorTheme: (data.color_theme as 'blue' | 'green' | 'purple' | 'orange') || 'blue',
          currency: data.currency || 'BRL',
          numberFormat: data.number_format || 'br',
          compactMode: data.compact_mode || false,
          sidebarAutoCollapse: data.sidebar_auto_collapse || true,
          defaultPage: data.default_page || 'dashboard',
          emailNotifications: data.email_notifications || true,
          pushNotifications: data.push_notifications || false,
          specialDatesReminder: data.special_dates_reminder || true,
        });
      } else {
        // Create default profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            theme: 'system',
            color_theme: 'blue',
            currency: 'BRL',
            number_format: 'br',
            compact_mode: false,
            sidebar_auto_collapse: true,
            default_page: 'dashboard',
            email_notifications: true,
            push_notifications: false,
            special_dates_reminder: true,
          })
          .select()
          .maybeSingle();

        if (!createError && newProfile) {
          setProfile({
            id: newProfile.id,
            firstName: newProfile.first_name || undefined,
            lastName: newProfile.last_name || undefined,
            theme: (newProfile.theme as 'light' | 'dark' | 'system') || 'system',
            colorTheme: (newProfile.color_theme as 'blue' | 'green' | 'purple' | 'orange') || 'blue',
            currency: newProfile.currency || 'BRL',
            numberFormat: newProfile.number_format || 'br',
            compactMode: newProfile.compact_mode || false,
            sidebarAutoCollapse: newProfile.sidebar_auto_collapse || true,
            defaultPage: newProfile.default_page || 'dashboard',
            emailNotifications: newProfile.email_notifications || true,
            pushNotifications: newProfile.push_notifications || false,
            specialDatesReminder: newProfile.special_dates_reminder || true,
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      const updateData: any = {};
      
      if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
      if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
      if (updates.theme !== undefined) updateData.theme = updates.theme;
      if (updates.colorTheme !== undefined) updateData.color_theme = updates.colorTheme;
      if (updates.currency !== undefined) updateData.currency = updates.currency;
      if (updates.numberFormat !== undefined) updateData.number_format = updates.numberFormat;
      if (updates.compactMode !== undefined) updateData.compact_mode = updates.compactMode;
      if (updates.sidebarAutoCollapse !== undefined) updateData.sidebar_auto_collapse = updates.sidebarAutoCollapse;
      if (updates.defaultPage !== undefined) updateData.default_page = updates.defaultPage;
      if (updates.emailNotifications !== undefined) updateData.email_notifications = updates.emailNotifications;
      if (updates.pushNotifications !== undefined) updateData.push_notifications = updates.pushNotifications;
      if (updates.specialDatesReminder !== undefined) updateData.special_dates_reminder = updates.specialDatesReminder;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        return true;
      } else {
        console.error('Error updating profile:', error);
        return false;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  return {
    profile,
    isLoading,
    updateProfile,
    reloadProfile: loadProfile,
  };
};