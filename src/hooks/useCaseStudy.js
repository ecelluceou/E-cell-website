import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Helper to generate a 6-character unambiguous code (no O, 0, I, 1)
const generateTeamCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'CS-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export function useCaseStudy() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -- Create Team ------------------------------------------------------------
  const createTeam = useCallback(async (teamName, leadDetails) => {
    setLoading(true);
    setError(null);
    try {
      let teamCode = generateTeamCode();
      let teamId = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: newTeam, error: teamError } = await supabase
          .from('case_study_teams')
          .insert({ team_name: teamName, team_code: teamCode })
          .select()
          .single();

        if (teamError) {
          if (teamError.code === '23505') { teamCode = generateTeamCode(); continue; }
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
          full_name: leadDetails.name,
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
      console.error('createTeam error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // -- Join Team --------------------------------------------------------------
  const joinTeam = useCallback(async (teamCode, memberDetails) => {
    setLoading(true);
    setError(null);
    try {
      const { data: teamId, error: rpcError } = await supabase.rpc('join_case_study_team', {
        p_team_code: teamCode.toUpperCase(),
        p_name: memberDetails.name,
        p_email: memberDetails.email,
        p_phone: memberDetails.phone,
        p_college: memberDetails.college,
        p_roll_number: memberDetails.rollNumber
      });

      if (rpcError) {
        if (rpcError.message.includes('unique_team_email') || rpcError.code === '23505') {
          throw new Error('This email is already registered in this team.');
        }
        throw new Error(rpcError.message || 'Failed to join team.');
      }

      return { success: true, teamId };
    } catch (err) {
      console.error('joinTeam error:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // -- Remove Member ----------------------------------------------------------
  const removeMember = useCallback(async (memberId) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('case_study_members').delete().eq('id', memberId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // -- Delete Team ------------------------------------------------------------
  const deleteTeam = useCallback(async (teamId) => {
    setLoading(true);
    setError(null);
    try {
      const { error: membersError } = await supabase
        .from('case_study_members').delete().eq('team_id', teamId);
      if (membersError) throw membersError;

      const { error } = await supabase
        .from('case_study_teams').delete().eq('id', teamId);
      if (error) throw error;
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { createTeam, joinTeam, removeMember, deleteTeam, loading, error, setError };
}
