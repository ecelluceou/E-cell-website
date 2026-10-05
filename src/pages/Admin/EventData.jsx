import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader } from '../../components/UI/Loader';
import { Download, CheckCircle, Trophy, ArrowLeft, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { isTeamEvent } from '../../lib/eventType';

export default function EventData() {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'event' | 'initiative'
  const [events, setEvents] = useState([]);
  const [initiatives, setInitiatives] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all events and initiatives
  useEffect(() => {
    async function loadData() {
      const { data: eventsData, error: eventErr } = await supabase.from('events').select('*').order('date', { ascending: false });
      if (eventErr) console.error("Error loading events:", eventErr);
      setEvents(eventsData || []);

      const { data: initData, error: initErr } = await supabase.from('initiatives').select('*').order('created_at', { ascending: false });
      if (initErr) console.error("Error loading initiatives:", initErr);
      setInitiatives(initData || []);

      setLoading(false);
    }
    loadData();
  }, []);

  // Fetch registrations when an event is selected
  useEffect(() => {
    if (viewMode !== 'event' || !selectedItem) return;
    
    async function fetchRegistrations() {
      setLoading(true);
      
      const isCaseStudy = isTeamEvent(selectedItem);
      let allRegs = [];

      // Always fetch regular event_registrations (legacy or fallback registrations)
      const { data: regularData, error: regularError } = await supabase
        .from('event_registrations')
        .select(`
          id,
          status,
          registered_at,
          profiles ( id, full_name, email, college, phone )
        `)
        .eq('event_id', selectedItem.id);

      if (regularError) {
        console.error("Error fetching regular registrations:", regularError);
      } else if (regularData) {
        allRegs = [...regularData];
      }

      if (isCaseStudy) {
        // Fetch from case study tables
        const { data: teamData, error: teamError } = await supabase
          .from('case_study_teams')
          .select(`
            id,
            team_name,
            event_id,
            case_study_members ( id, full_name, email, college, phone, created_at, status, is_lead )
          `);
          
        if (teamError) {
          console.error("Error fetching case study registrations:", teamError);
        } else {
          const relevantTeams = (teamData || []).filter(
            t => String(t.event_id) === String(selectedItem.id) || t.event_id === null || t.event_id === undefined
          );
          relevantTeams.forEach(team => {
            if (team.case_study_members) {
              team.case_study_members.forEach(member => {
                allRegs.push({
                  id: member.id,
                  team_id: team.id,
                  status: member.status || 'registered',
                  registered_at: member.created_at,
                  isCaseStudyMember: true,
                  team_name: team.team_name,
                  role: member.is_lead ? 'Team Lead' : 'Member',
                  profiles: {
                    full_name: member.full_name,
                    email: member.email,
                    college: member.college,
                    phone: member.phone
                  }
                });
              });
            }
          });
        }
      }

      allRegs.sort((a, b) => new Date(b.registered_at || 0) - new Date(a.registered_at || 0));
      setRegistrations(allRegs);
      
      setLoading(false);
    }
    fetchRegistrations();
  }, [viewMode, selectedItem]);

  const exportCSV = () => {
    if (registrations.length === 0) return;
    const isCaseStudy = registrations[0]?.isCaseStudyMember;
    const headers = ['Name', 'Email', 'College', 'Phone', isCaseStudy ? 'Team Name' : '', isCaseStudy ? 'Role' : '', 'Registered At', 'Status'].filter(Boolean);
    const rows = registrations.map(r => {
      const p = r.profiles || {};
      const row = [
        p.full_name || '',
        p.email || '',
        p.college || '',
        p.phone || ''
      ];
      if (isCaseStudy) {
        row.push(r.team_name || '');
        row.push(r.role || 'Participant');
      }
      row.push(new Date(r.registered_at).toLocaleString());
      row.push(r.status || 'registered');
      return row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','); 
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `event_${selectedItem.id}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateStatus = async (reg, newStatus) => {
    // Optimistic update
    if (reg.isCaseStudyMember) {
      setRegistrations(regs => regs.map(r => r.team_id === reg.team_id ? { ...r, status: newStatus } : r));
    } else {
      setRegistrations(regs => regs.map(r => r.id === reg.id ? { ...r, status: newStatus } : r));
    }
    
    let updateError = null;
    
    if (reg.isCaseStudyMember) {
      // Update all members of the team
      const { error } = await supabase.from('case_study_members').update({ status: newStatus }).eq('team_id', reg.team_id);
      updateError = error;
    } else {
      const { error } = await supabase.from('event_registrations').update({ status: newStatus }).eq('id', reg.id);
      updateError = error;
    }

    if (updateError) {
      console.error("Error updating status:", updateError);
      alert("Failed to update status. Please ensure you have admin permissions and RLS policies are set.");
      // For simplicity, we just alert them that it failed. They can refresh to revert.
    }
  };

  if (loading && viewMode === 'list') return <Loader />;

  if (viewMode === 'list') {
    return (
      <div>
        <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '2rem' }}>Event Data & Attendance</h1>
        
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-primary)' }}>
          <Calendar size={20} /> Events
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          {events.map(ev => (
            <motion.div
              key={ev.id}
              whileHover={{ y: -4 }}
              onClick={() => { setSelectedItem(ev); setViewMode('event'); setLoading(true); }}
              style={{
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px',
                padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{ev.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {new Date(ev.date).toLocaleDateString()} • {ev.registration_type === 'team' ? 'Team Event' : 'Solo Event'}
              </div>
            </motion.div>
          ))}
        </div>

        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-primary)' }}>
          <Award size={20} /> Initiatives
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
          {initiatives.map(init => (
            <motion.div
              key={init.id}
              whileHover={{ y: -4 }}
              onClick={() => { setSelectedItem(init); setViewMode('initiative'); }}
              style={{
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px',
                padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{init.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Initiative
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => setViewMode('list')}
            style={{ 
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', 
              color: 'var(--text-primary)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', margin: 0 }}>{selectedItem?.title}</h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {viewMode === 'event' ? 'Event Registrations' : 'Initiative Data'}
            </div>
          </div>
        </div>
        
        {viewMode === 'event' && registrations.length > 0 && (
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={exportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1rem', background: 'var(--brand-primary)', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600
            }}
          >
            <Download size={16} /> Export CSV
          </motion.button>
        )}
      </div>

      <div style={{ background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        {viewMode === 'initiative' ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Data for initiatives is currently collected via external forms. 
            {selectedItem?.link && (
              <div style={{ marginTop: '1rem' }}>
                <a href={selectedItem.link} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>
                  View External Form →
                </a>
              </div>
            )}
          </div>
        ) : loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><Loader /></div>
        ) : registrations.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No registrations found for this event.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>College</th>
                <th style={{ padding: '1rem' }}>Registered At</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{reg.profiles?.full_name || 'Unknown'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{reg.profiles?.email}</div>
                    {reg.team_name && (
                      <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: 'var(--brand-primary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span>Team: {reg.team_name}</span>
                        {reg.role && (
                          <span style={{ 
                            background: reg.role === 'Team Lead' ? 'rgba(228,71,46,0.15)' : 'rgba(255,255,255,0.1)', 
                            color: reg.role === 'Team Lead' ? '#E4472E' : 'var(--text-secondary)',
                            padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold'
                          }}>
                            {reg.role}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{reg.profiles?.college || '-'}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(reg.registered_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600,
                      background: reg.status === 'won' ? 'rgba(229,169,0,0.15)' : reg.status === 'attended' ? 'rgba(22,140,131,0.15)' : 'rgba(255,255,255,0.1)',
                      color: reg.status === 'won' ? '#E5A900' : reg.status === 'attended' ? '#168C83' : 'var(--text-secondary)'
                    }}>
                      {reg.status?.toUpperCase() || 'REGISTERED'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        onClick={() => updateStatus(reg, 'registered')}
                        title="Reset to Registered"
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.4rem', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>
                      <button 
                        onClick={() => updateStatus(reg, 'attended')}
                        title="Mark as Attended"
                        style={{ background: 'rgba(22,140,131,0.1)', border: 'none', padding: '0.4rem', borderRadius: '6px', color: '#168C83', cursor: 'pointer' }}
                      ><CheckCircle size={16} /></button>
                      <button 
                        onClick={() => updateStatus(reg, 'won')}
                        title="Mark as Winner"
                        style={{ background: 'rgba(229,169,0,0.1)', border: 'none', padding: '0.4rem', borderRadius: '6px', color: '#E5A900', cursor: 'pointer' }}
                      ><Trophy size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
