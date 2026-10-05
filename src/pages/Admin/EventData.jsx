import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader } from '../../components/UI/Loader';
import { Download, CheckCircle, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { isTeamEvent } from '../../lib/eventType';

export default function EventData() {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all events for the dropdown
  useEffect(() => {
    async function loadEvents() {
      const { data } = await supabase.from('events').select('id, title, registration_type').order('date', { ascending: false });
      setEvents(data || []);
      if (data && data.length > 0) {
        setSelectedEventId(data[0].id);
      }
      setLoading(false);
    }
    loadEvents();
  }, []);

  // Fetch registrations when an event is selected
  useEffect(() => {
    if (!selectedEventId) return;
    
    async function fetchRegistrations() {
      setLoading(true);
      
      const selectedEvent = events.find(ev => String(ev.id) === String(selectedEventId));
      const isCaseStudy = isTeamEvent(selectedEvent);

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
        .eq('event_id', selectedEventId);

      if (regularError) {
        console.error("Error fetching regular registrations:", regularError);
      } else if (regularData) {
        allRegs = [...regularData];
      }

      if (isCaseStudy) {
        // Fetch from case study tables - filter by event_id (works after migration)
        // Also fetch teams without event_id set (legacy data) as fallback
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
          // Filter: include teams that belong to this event OR have no event_id (legacy)
          const relevantTeams = (teamData || []).filter(
            t => String(t.event_id) === String(selectedEventId) || t.event_id === null || t.event_id === undefined
          );
          relevantTeams.forEach(team => {
            if (team.case_study_members) {
              team.case_study_members.forEach(member => {
                allRegs.push({
                  id: member.id,
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



      // Sort combined array by date descending
      allRegs.sort((a, b) => new Date(b.registered_at || 0) - new Date(a.registered_at || 0));
      setRegistrations(allRegs);
      
      setLoading(false);
    }
    fetchRegistrations();
  }, [selectedEventId, events]);

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
      return row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','); // Escape quotes
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `event_${selectedEventId}_attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateStatus = async (registrationId, newStatus, isCaseStudyMember) => {
    setRegistrations(regs => regs.map(r => r.id === registrationId ? { ...r, status: newStatus } : r));
    
    if (isCaseStudyMember) {
      const { error } = await supabase.from('case_study_members').update({ status: newStatus }).eq('id', registrationId);
      if (error) {
        console.error("Error updating status (Make sure 'status' column exists on case_study_members):", error);
        alert("Failed to update status. Please make sure the 'status' column exists in the 'case_study_members' table.");
      }
    } else {
      await supabase.from('event_registrations').update({ status: newStatus }).eq('id', registrationId);
    }
  };

  if (loading && events.length === 0) return <Loader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)' }}>Event Data & Attendance</h1>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={selectedEventId} 
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{
              padding: '0.6rem 1rem', background: 'var(--glass-bg)', color: 'white',
              border: '1px solid var(--glass-border)', borderRadius: '8px', cursor: 'pointer'
            }}
          >
            {events.map(ev => <option key={ev.id} value={ev.id} style={{ background: '#222', color: 'white' }}>{ev.title}</option>)}
          </select>

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
        </div>
      </div>

      <div style={{ background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        {loading ? (
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
                        onClick={() => updateStatus(reg.id, 'registered', reg.isCaseStudyMember)}
                        title="Reset to Registered"
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', padding: '0.4rem', borderRadius: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                      ><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg></button>
                      <button 
                        onClick={() => updateStatus(reg.id, 'attended', reg.isCaseStudyMember)}
                        title="Mark as Attended"
                        style={{ background: 'rgba(22,140,131,0.1)', border: 'none', padding: '0.4rem', borderRadius: '6px', color: '#168C83', cursor: 'pointer' }}
                      ><CheckCircle size={16} /></button>
                      <button 
                        onClick={() => updateStatus(reg.id, 'won', reg.isCaseStudyMember)}
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
