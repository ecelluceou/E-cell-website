import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader } from '../components/UI/Loader';
import { Trophy, Medal, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { SparklesCore } from '../components/UI/Sparkles';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('wins'); // 'wins' or 'attendance'

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
          avatar_url,
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
        
        const wonCount = allRegs.filter(r => r.status === 'won').length;
        const attendedCount = allRegs.filter(r => r.status === 'attended' || r.status === 'won').length;
        return { ...user, wonCount, attendedCount };
      });

      setUsers(processedUsers);
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  const getRankColor = (index) => {
    if (index === 0) return 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'; // Gold
    if (index === 1) return 'linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)'; // Silver
    if (index === 2) return 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)'; // Bronze
    return 'var(--glass-bg)';
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (activeTab === 'wins') {
      return b.wonCount - a.wonCount || b.attendedCount - a.attendedCount;
    }
    return b.attendedCount - a.attendedCount || b.wonCount - a.wonCount;
  }).filter(u => activeTab === 'wins' ? u.wonCount > 0 : u.attendedCount > 0);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <SparklesCore
          id="leaderboard-sparkles"
          background="transparent"
          minSize={0.6}
          maxSize={1.5}
          particleDensity={20}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(6rem, 12vh, 8rem) 1rem 4rem', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 800, margin: '0 0 1rem 0' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #E4472E 0%, #E5A900 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              display: 'inline-flex', alignItems: 'center', gap: '1rem'
            }}>
              <Trophy size={48} /> Leaderboard
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Top innovators and active members of the community.</p>
        </motion.div>

        {/* Tabs */}
        <div className="leaderboard-tabs" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('wins')}
            style={{
              padding: '0.8rem 1.5rem', borderRadius: '999px', fontWeight: 600, border: 'none', cursor: 'pointer',
              background: activeTab === 'wins' ? '#E5A900' : 'var(--glass-bg)',
              color: activeTab === 'wins' ? '#000' : 'white',
              transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <Trophy size={16} /> Most Wins
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            style={{
              padding: '0.8rem 1.5rem', borderRadius: '999px', fontWeight: 600, border: 'none', cursor: 'pointer',
              background: activeTab === 'attendance' ? '#168C83' : 'var(--glass-bg)',
              color: activeTab === 'attendance' ? '#fff' : 'white',
              transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}
          >
            <Award size={16} /> Most Attended
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}><Loader /></div>
        ) : sortedUsers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--glass-bg)', borderRadius: '24px' }}>
            No one has ranked yet. Join events to climb the leaderboard!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedUsers.map((user, index) => (
              <motion.div 
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="leaderboard-row"
                style={{
                  display: 'flex', alignItems: 'center', padding: '1rem 1.5rem',
                  background: index < 3 ? getRankColor(index) : 'var(--glass-bg)',
                  borderRadius: '16px', border: index >= 3 ? '1px solid var(--glass-border)' : 'none',
                  color: index < 3 ? (index === 0 ? '#000' : '#fff') : 'var(--text-primary)',
                  boxShadow: index < 3 ? '0 10px 30px rgba(0,0,0,0.2)' : 'none',
                  transform: index === 0 ? 'scale(1.02)' : 'none'
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 800, width: '40px', opacity: 0.8 }}>#{index + 1}</div>
                <img 
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                  alt={user.full_name} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', margin: '0 1.5rem 0 1rem', border: '2px solid rgba(255,255,255,0.2)' }}
                />
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{user.full_name || 'Anonymous'}</h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', opacity: 0.8 }}>{user.college || 'Unknown College'}</p>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {activeTab === 'wins' ? user.wonCount : user.attendedCount}
                    {activeTab === 'wins' ? <Trophy size={16} /> : <Award size={16} />}
                  </div>
                  <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>
                    {activeTab === 'wins' ? 'Events Won' : 'Events Attended'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
