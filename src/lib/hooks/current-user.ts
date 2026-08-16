'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../supabase/client';
import { UserProfile } from '@/app/types/types';

export function useCurrentUser() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      try {
        setLoading(true);

        const { data: { user }, error: sessionError } = await supabase.auth.getUser();

        if (sessionError || !user) {
          if (isMounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const { data, error: profileError } = await supabase
          .from('user_profile')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (isMounted) {
          setProfile(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch user profile');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { profile, loading, error };
}