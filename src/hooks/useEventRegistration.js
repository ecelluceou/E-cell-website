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

    // Get total attendee count from regular registrations
    const { count: total } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);
      
    let finalCount = total ?? 0;

    // Add case study team members count (combined leads + members) if any exist
    const { data: teamsData } = await supabase
      .from('case_study_teams')
      .select('id')
      .eq('event_id', eventId);
      
    if (teamsData && teamsData.length > 0) {
      const teamIds = teamsData.map(t => t.id);
      const { count: memberCount } = await supabase
        .from('case_study_members')
        .select('*', { count: 'exact', head: true })
        .in('team_id', teamIds);
      finalCount += (memberCount ?? 0);
    }

    setCount(finalCount);

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
