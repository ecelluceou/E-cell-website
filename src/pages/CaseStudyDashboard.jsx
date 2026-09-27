import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Copy, Share2, LogOut, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCaseStudy } from '../hooks/useCaseStudy';
import { Loader } from '../components/UI/Loader';

const VERMILION = '#E4472E';
const TEAL = '#168C83';

export default function CaseStudyDashboard() {
  const { teamId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { removeMember, deleteTeam, loading: actionLoading, error: actionError } = useCaseStudy();
  
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    async function fetchTeamDetails() {
      if (!teamId) return;
      
      const { data: teamData, error: teamErr } = await supabase
        .from('case_study_teams')
        .select('*')
        .eq('id', teamId)
        .single();
        
      if (teamErr) {
        console.error('Error fetching team:', teamErr);
        navigate('/events');
        return;
      }
      
      setTeam(teamData);

      const { data: membersData, error: memErr } = await supabase
        .from('case_study_members')
        .select('*')
        .eq('team_id', teamId)
        .order('is_lead', { ascending: false });
        
      if (!memErr) {
        setMembers(membersData || []);
      }
      
      setLoading(false);
    }

    fetchTeamDetails();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`case_study_team_${teamId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'case_study_members',
        filter: `team_id=eq.${teamId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMembers(prev => {
            const exists = prev.find(m => m.id === payload.new.id);
            if (exists) return prev;
            // Place leader at top if somehow they join later, though usually they are first
            if (payload.new.is_lead) return [payload.new, ...prev];
            return [...prev, payload.new];
          });
        } else if (payload.eventType === 'DELETE') {
          setMembers(prev => prev.filter(m => m.id !== payload.old.id));
        } else if (payload.eventType === 'UPDATE') {
          setMembers(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
        }
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'case_study_teams',
        filter: `id=eq.${teamId}`
      }, () => {
        // Team was deleted
        navigate('/events');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(team?.team_code || '');
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `Hey! Join my Case Study team "${team?.team_name}".\n\nUse this Team Code to register: *${team?.team_code}*\n\nRegister here: ${window.location.origin}/events`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Leader = the member with is_lead === true AND matching the current user's email
  const isCurrentUserLead = members.some(m => m.is_lead === true && m.email === user?.email);

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      await removeMember(memberId);
    }
  };

  const handleDeleteTeam = async () => {
    if (window.confirm("WARNING: This will delete the entire team and remove all members. This cannot be undone. Are you sure?")) {
      const res = await deleteTeam(teamId);
      if (res.success) {
        navigate('/events');
      }
    }
  };

  if (loading) return <Loader />;
  if (!team) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Team not found</div>;

  const maxMembers = team.max_members || 5;
  const slots = Array.from({ length: maxMembers }, (_, i) => i);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', paddingBottom: '4rem', paddingInline: '1rem', color: 'white' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: 'clamp(1.25rem, 4vw, 2rem)', marginBottom: '2rem', backdropFilter: 'blur(16px)', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{team.team_name}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: 'clamp(0.95rem, 3vw, 1.1rem)' }}>Case Study Registration Dashboard</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px dashed var(--glass-border)', borderRadius: '16px', padding: 'clamp(0.75rem, 3vw, 1rem) clamp(1rem, 4vw, 1.5rem)', gap: 'clamp(0.75rem, 3vw, 1.5rem)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.2rem' }}>Team Code</div>
              <div style={{ fontSize: 'clamp(1.25rem, 5vw, 1.75rem)', fontWeight: 800, letterSpacing: '0.15em', color: TEAL }}>{team.team_code}</div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '12px', color: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Copy Code">
                {copySuccess ? <span style={{ color: '#4ade80', fontSize: '0.8rem', fontWeight: 700 }}>Copied!</span> : <Copy size={18} />}
              </button>
              <button onClick={handleShareWhatsApp} style={{ background: '#25D366', border: 'none', padding: '0.75rem', borderRadius: '12px', color: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Share on WhatsApp">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {actionError && (
          <div style={{ background: 'rgba(228,71,46,0.1)', color: VERMILION, padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: `1px solid rgba(228,71,46,0.3)` }}>
            {actionError}
          </div>
        )}

        {/* Roster */}
        <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 700, marginBottom: '1.5rem', paddingLeft: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          Team Roster ({members.length}/{maxMembers})
          
          {isCurrentUserLead && (
            <button 
              onClick={handleDeleteTeam}
              disabled={actionLoading}
              style={{ background: 'rgba(228,71,46,0.1)', border: '1px solid rgba(228,71,46,0.3)', color: VERMILION, padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Trash2 size={14} /> Delete Team
            </button>
          )}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {slots.map(index => {
              const member = members[index];
              const isFilled = !!member;
              const isLeadSlot = index === 0;

              return (
                <motion.div 
                  key={member ? member.id : `empty-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  style={{
                    background: isFilled ? 'var(--glass-bg)' : 'rgba(255,255,255,0.02)',
                    border: isFilled ? (member.is_lead ? `1px solid ${TEAL}` : '1px solid var(--glass-border)') : '1px dashed rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: 'clamp(1rem, 3vw, 1.25rem)',
                    display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '50%', 
                    background: isFilled ? (member.is_lead ? 'rgba(22,140,131,0.2)' : 'rgba(255,255,255,0.05)') : 'transparent',
                    border: isFilled ? 'none' : '1px dashed rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: isFilled ? (member.is_lead ? TEAL : 'var(--text-secondary)') : 'rgba(255,255,255,0.2)'
                  }}>
                    {isFilled ? (member.is_lead ? <Shield size={24} /> : <User size={24} />) : <User size={24} />}
                  </div>

                  <div style={{ flex: '1 1 min(100%, 200px)' }}>
                    {isFilled ? (
                      <>
                        <div style={{ fontWeight: 700, fontSize: 'clamp(1rem, 3vw, 1.1rem)', color: 'white' }}>
                          {member.full_name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.college}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Empty Slot</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Share team code to invite a member</div>
                      </>
                    )}
                  </div>
                  
                  {isFilled && member.is_lead && (
                    <div style={{ background: 'rgba(22,140,131,0.1)', color: TEAL, padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Leader
                    </div>
                  )}

                  {isFilled && !member.is_lead && isCurrentUserLead && (
                    <button 
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={actionLoading}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                      title="Remove Member"
                    >
                      <LogOut size={18} />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {members.length < maxMembers && (
          <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Note: Empty slots are fine. If you don't fill all {maxMembers} slots, your team will compete with the current members.
          </div>
        )}
      </div>
    </div>
  );
}
