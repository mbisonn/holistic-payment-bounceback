
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthObserver = (callback: (user: any) => void) => {
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      callback(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [callback]);
};
