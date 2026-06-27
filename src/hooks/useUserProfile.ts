import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from './useSession';

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
};

export function useUserProfile() {
  const { session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, phone, address')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile((data as UserProfile) || null);
    } catch (err) {
      console.warn('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return { profile, loading, refreshProfile };
}
