import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Helper to generate a 6-character unambiguous code
const generateTeamCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitted O, 0, I, 1
  let result = 'CS-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function useCaseStudy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTeam = useCallback(async (teamName, leadDetails, userId) => {
    setLoading(true);
    setError(null);
    try {
      let teamCode = generateTeamCode();
      let teamId = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: newTeam, error: teamError } = await supabase
          .from('case_study_teams')
          .insert({
            name: teamName,
            team_code: teamCode
          })
          .select()
          .single();
          
        if (teamError) {
          if (teamError.code === '23505') { 
            teamCode = generateTeamCode();
            continue;
          }
          throw teamError;
        }
        
        teamId = newTeam.id;
        break;
      }
      
      if (!teamId) throw new Error('Failed to generate a unique team code. Please try again.');

      const { error: memberError } = await supabase
        .from('case_study_members')
        .insert({
          team_id: teamId,
          user_id: userId || null,
          name: leadDetails.name,
          email: leadDetails.email,
          phone: leadDetails.phone,
          college: leadDetails.college,
          roll_number: leadDetails.rollNumber,
          is_lead: true
        });

      if (memberError) {
        await supabase.from('case_study_teams').delete().eq('id', teamId);
        throw memberError;
      }

      return { success: true, teamId, teamCode };
    } catch (err) {
      console.error('Error creating team:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const joinTeam = useCallback(async (teamCode, memberDetails, userId) => {
    setLoading(true);
    setError(null);
    try {
      const { data: team, error: teamError } = await supabase
        .from('case_study_teams')
        .select('id')
        .eq('team_code', teamCode.toUpperCase())
        .single();
        
      if (teamError || !team) {
        throw new Error('Invalid team code. Please check and try again.');
      }

      const { data, error: rpcError } = await supabase.rpc('join_case_study_team', {
        p_team_id: team.id,
        p_user_id: userId || null,
        p_name: memberDetails.name,
        p_email: memberDetails.email,
        p_phone: memberDetails.phone,
        p_college: memberDetails.college,
        p_roll_number: memberDetails.rollNumber
      });

      if (rpcError) throw rpcError;

      if (data && data.success === false) {
          throw new Error(data.message || 'Failed to join team');
      }

      return { success: true, teamId: team.id };
    } catch (err) {
      console.error('Error joining team:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (memberId) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('case_study_members')
        .delete()
        .eq('id', memberId);
        
      if (error) throw error;
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTeam = useCallback(async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      await supabase.from('case_study_members').delete().eq('team_id', teamId);
      const { error } = await supabase
        .from('case_study_teams')
        .delete()
        .eq('id', teamId);
        
      if (error) throw error;
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createTeam,
    joinTeam,
    removeMember,
    deleteTeam,
    loading,
    error,
    setError
  };
}
