import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader } from '../../components/UI/Loader';
import { Download, Trophy, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManageLeaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      // Fetch all profiles and their registrations
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          college,
          event_registrations ( status ),
          case_study_members ( status )
        `);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Calculate scores
      const processedUsers = data.map(user => {
        const regs = user.event_registrations || [];
        const caseStudyRegs = user.case_study_members || [];
        const allRegs = [...regs, ...caseStudyRegs];
        
        const wonCount = allRegs.filter(r => r.status === 'won').length;
        const attendedCount = allRegs.filter(r => r.status === 'attended' || r.status === 'won').length;
        return { ...user, wonCount, attendedCount };
      });

      // Sort by total wins, then attendance, then filter out 0s
      const sortedUsers = processedUsers
        .sort((a, b) => b.wonCount - a.wonCount || b.attendedCount - a.attendedCount)
        .filter(u => u.wonCount > 0 || u.attendedCount > 0);

      setUsers(sortedUsers);
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  const exportCSV = () => {
    if (users.length === 0) return;
    const headers = ['Rank', 'Name', 'Email', 'Phone', 'College', 'Events Won', 'Events Attended'];
    const rows = users.map((u, i) => [
      i + 1,
      u.full_name || 'Anonymous',
      u.email || '',
      u.phone || '',
      u.college || '',
      u.wonCount,
      u.attendedCount
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leaderboard_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)' }}>User Leaderboards</h1>
        
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

      <div style={{ background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        {users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No one has ranked yet. (No wins or attendance recorded).
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Rank</th>
                <th style={{ padding: '1rem' }}>User</th>
                <th style={{ padding: '1rem' }}>Contact</th>
                <th style={{ padding: '1rem' }}>Wins</th>
                <th style={{ padding: '1rem' }}>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                    #{index + 1}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{user.full_name || 'Anonymous'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.college || '-'}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontSize: '0.85rem' }}>{user.email}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{user.phone || '-'}</div>
                  </td>
                  <td style={{ padding: '1rem', color: '#E5A900', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Trophy size={16} /> {user.wonCount}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#168C83', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Award size={16} /> {user.attendedCount}
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
