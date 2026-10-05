import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader } from '../../components/UI/Loader';
import { Download, Trophy, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ManageLeaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overall_wins'); // 'overall_wins' | 'solo_wins' | 'team_wins' | 'attendance'

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
          event_registrations ( status )
        `);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // Fetch case study members separately since there's no FK relation
      const { data: caseStudyData, error: caseStudyError } = await supabase
        .from('case_study_members')
        .select('email, status');

      if (caseStudyError) {
        console.error('Error fetching case study members:', caseStudyError);
      }

      // Calculate scores
      const processedUsers = data.map(user => {
        const regs = user.event_registrations || [];
        
        // Find case study registrations for this user by matching email (case insensitive)
        const userEmail = user.email ? user.email.toLowerCase().trim() : null;
        const caseStudyRegs = caseStudyData 
          ? caseStudyData.filter(cs => cs.email && userEmail && cs.email.toLowerCase().trim() === userEmail) 
          : [];
          
        const allRegs = [...regs, ...caseStudyRegs];
        
        const soloWonCount = regs.filter(r => r.status === 'won').length;
        const teamWonCount = caseStudyRegs.filter(r => r.status === 'won').length;
        const wonCount = soloWonCount + teamWonCount;
        const attendedCount = allRegs.filter(r => r.status === 'attended' || r.status === 'won').length;
        
        return { ...user, soloWonCount, teamWonCount, wonCount, attendedCount };
      });

      setUsers(processedUsers);
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  // Compute displayed users based on activeTab
  const getRankedUsers = () => {
    let sorted = [...users].sort((a, b) => {
      if (activeTab === 'solo_wins') return b.soloWonCount - a.soloWonCount || b.attendedCount - a.attendedCount;
      if (activeTab === 'team_wins') return b.teamWonCount - a.teamWonCount || b.attendedCount - a.attendedCount;
      if (activeTab === 'attendance') return b.attendedCount - a.attendedCount || b.wonCount - a.wonCount;
      return b.wonCount - a.wonCount || b.attendedCount - a.attendedCount;
    });

    sorted = sorted.filter(u => {
      if (activeTab === 'solo_wins') return u.soloWonCount > 0;
      if (activeTab === 'team_wins') return u.teamWonCount > 0;
      if (activeTab === 'attendance') return u.attendedCount > 0;
      return u.wonCount > 0 || u.attendedCount > 0;
    });

    let currentRank = 0;
    let lastScore = null;
    return sorted.map((u, i) => {
      let score;
      if (activeTab === 'solo_wins') score = u.soloWonCount;
      else if (activeTab === 'team_wins') score = u.teamWonCount;
      else if (activeTab === 'attendance') score = u.attendedCount;
      else score = u.wonCount;

      if (lastScore !== score) {
        currentRank++;
        lastScore = score;
      }
      return { ...u, rank: currentRank };
    });
  };

  const displayedUsers = getRankedUsers();

  const exportCSV = () => {
    if (displayedUsers.length === 0) return;
    const headers = ['Rank', 'Name', 'Email', 'Phone', 'College', 'Solo Wins', 'Team Wins', 'Total Wins', 'Events Attended'];
    const rows = displayedUsers.map(u => [
      u.rank,
      u.full_name || 'Anonymous',
      u.email || '',
      u.phone || '',
      u.college || '',
      u.soloWonCount,
      u.teamWonCount,
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
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

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[
          { id: 'overall_wins', label: 'Overall Wins' },
          { id: 'solo_wins', label: 'Solo Events (Wins)' },
          { id: 'team_wins', label: 'Team Events (Wins)' },
          { id: 'attendance', label: 'Most Attended' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '999px',
              border: '1px solid',
              borderColor: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--glass-border)',
              background: activeTab === tab.id ? 'rgba(228, 71, 46, 0.1)' : 'var(--glass-bg)',
              color: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--glass-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
        {displayedUsers.length === 0 ? (
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
                <th style={{ padding: '1rem' }}>Score</th>
                <th style={{ padding: '1rem' }}>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                    #{user.rank}
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
                      <Trophy size={16} /> 
                      {activeTab === 'solo_wins' ? user.soloWonCount : activeTab === 'team_wins' ? user.teamWonCount : user.wonCount}
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
