import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useEventRegistration(eventId) {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkStatus = useCallback(async () => {
    setChecking(true);

    // Use the SECURITY DEFINER RPC — works for ALL users (anon + logged in)
    // Falls back to direct query if RPC doesn't exist yet (pre-migration)
    const { data: rpcCount, error: rpcError } = await supabase
      .rpc('get_event_participant_count', { p_event_id: eventId });

    if (!rpcError && rpcCount !== null) {
      setCount(rpcCount);
    } else {
      // Fallback: direct query (only counts what RLS allows)
      const { count: total } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);
      setCount(total ?? 0);
    }


    // Check if this user is registered
    if (user) {
      const { data } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();
      setIsRegistered(!!data);
    } else {
      setIsRegistered(false);
    }

    setChecking(false);
  }, [eventId, user]);

  useEffect(() => { checkStatus(); }, [checkStatus]);

  const register = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('event_registrations').insert({
      user_id: user.id,
      event_id: eventId,
    });
    if (!error) await checkStatus(); // Only refresh count on success
    setLoading(false);
    return { error };
  };

  const unregister = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('event_registrations')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', user.id);
    if (!error) await checkStatus(); // Only refresh count on success
    setLoading(false);
    return { error };
  };

  return { isRegistered, count, loading, checking, register, unregister, checkStatus };
}
