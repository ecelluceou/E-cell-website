import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, Users, MapPin, Tag,
  CheckCircle, Share2, BookmarkPlus, Trophy, Copy, ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEventRegistration } from '../hooks/useEventRegistration';
import { useEventSave } from '../hooks/useEventSave';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CaseStudyRegistrationModal from '../components/UI/CaseStudyRegistrationModal';

// ─── Palette ────────────────────────────────────────────────────────────────
const VERMILION = '#E4472E';
const COBALT    = '#3157A4';
const TEAL      = '#168C83';
const SAFFRON   = '#E5A900';

const card = {
  background: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)',
  borderRadius: '16px',
};

function CountdownUnit({ value, label }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      background: `rgba(228,71,46,0.07)`,
      border: `1px solid rgba(228,71,46,0.18)`,
      borderRadius: '12px',
      padding: '0.75rem 0.5rem',
      minWidth: 0, flex: 1,
    }}>
      <span style={{
        fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.25rem, 4vw, 2rem)', fontWeight: 700,
        color: VERMILION, lineHeight: 1, fontVariantNumeric: 'tabular-nums'
      }}>
        {String(value).padStart(2, '0')}
      </span>
      <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.3rem' }}>
        {label}
      </span>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isRegistered, count, loading: regLoading, checking, register, unregister, checkStatus } = useEventRegistration(id);
  const { isSaved, loading: saveLoading, toggleSave } = useEventSave(id);
  const [timeLeft, setTimeLeft] = useState(-1);
  const [winners, setWinners] = useState([]);
  const [isCaseStudyModalOpen, setIsCaseStudyModalOpen] = useState(false);
  const [caseStudyTeam, setCaseStudyTeam] = useState(null);
  const isCaseStudy = event?.title?.toLowerCase().includes('case study');

  useEffect(() => {
    async function fetchCaseStudyTeam() {
      if (isCaseStudy && user?.email) {
        // Fetch member matching user email, join with team
        const { data, error } = await supabase
          .from('case_study_members')
          .select('team_id, case_study_teams(team_name, team_code)')
          .eq('email', user.email)
          .single();
          
        if (data && !error) {
          setCaseStudyTeam({
            team_id: data.team_id,
            team_name: data.case_study_teams?.team_name,
            team_code: data.case_study_teams?.team_code
          });
        }
      }
    }
    fetchCaseStudyTeam();
  }, [isCaseStudy, user?.email]);

  useEffect(() => {
    async function fetchEvent() {
      const { data } = await supabase.from('events').select('*').eq('id', id).single();
      if (data) {
        setEvent(data);
        if (data.date) {
          setTimeLeft(Math.max(0, Math.floor((new Date(data.date).getTime() - Date.now()) / 1000)));
        }
      }
      
      // Fetch Winners
      const { data: winnersData } = await supabase
        .from('event_registrations')
        .select(`
          id,
          profiles ( id, full_name, avatar_url, college )
        `)
        .eq('event_id', id)
        .eq('status', 'won');
      
      if (winnersData) {
        setWinners(winnersData.map(w => w.profiles).filter(Boolean));
      }
      
      setLoading(false);
    }
    fetchEvent();

    // Real-time: refresh registration count when anyone registers/unregisters
    const channel = supabase
      .channel(`event_regs_${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_registrations',
        filter: `event_id=eq.${id}`,
      }, () => {
        // Refresh count when another user registers/unregisters
        checkStatus();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.tagline,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (!event) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', padding: '2rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--text-primary)', textAlign: 'center' }}>Event not found</h2>
        <Link to="/events" style={{ color: VERMILION, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={18} /> Back to Events
        </Link>
      </div>
    );
  }

  const days    = timeLeft >= 0 ? Math.floor(timeLeft / 86400) : 0;
  const hours   = timeLeft >= 0 ? Math.floor((timeLeft % 86400) / 3600) : 0;
  const minutes = timeLeft >= 0 ? Math.floor((timeLeft % 3600) / 60) : 0;
  const seconds = timeLeft >= 0 ? timeLeft % 60 : 0;
  const isPast  = timeLeft === 0;
  const dateUnknown = timeLeft === -1;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>

      {/* Hero Image */}
      <div style={{ position: 'relative', height: 'clamp(250px, 50vh, 500px)', overflow: 'hidden' }}>
        <motion.img
          src={event.image}
          alt={event.title}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Theme fade — matches the background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, var(--bg-primary) 100%)'
        }} />

        {/* Back button */}
        <Link to="/events" style={{ textDecoration: 'none' }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              position: 'absolute', top: 'clamp(4.5rem, 12vw, 7rem)', left: 'clamp(1rem, 5vw, 5vw)',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--glass-bg)', backdropFilter: 'blur(12px)',
              color: 'var(--text-primary)', padding: '0.45rem 0.85rem',
              borderRadius: '9999px', fontWeight: 600, fontSize: '0.82rem',
              border: '1px solid var(--glass-border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              cursor: 'pointer',
            }}
            whileHover={{ y: -2 }}
          >
            <ArrowLeft size={14} /> Back
          </motion.div>
        </Link>

        {/* Category Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{
            position: 'absolute', top: 'clamp(4.5rem, 12vw, 7rem)', right: 'clamp(1rem, 5vw, 5vw)',
            background: VERMILION, color: 'white',
            padding: '0.3rem 0.85rem', borderRadius: '9999px',
            fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
            boxShadow: `0 4px 16px rgba(228,71,46,0.4)`
          }}
        >
          {event.category}
        </motion.div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(1rem, 5vw, 5vw) 4rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ marginTop: '-1.5rem', position: 'relative', zIndex: 2 }}
        >
          {/* Title + Actions Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
                fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.1,
                display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
              }}>
                {event.title}
                {event.status && event.status !== 'upcoming' && event.status !== 'active' ? (
                  <span style={{
                    fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                    padding: '0.2rem 0.8rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: event.status === 'ended' ? 'var(--glass-border)' : 'rgba(229,169,0,0.15)',
                    color: event.status === 'ended' ? 'var(--text-secondary)' : '#E5A900',
                    border: `1px solid ${event.status === 'ended' ? 'var(--glass-border)' : 'rgba(229,169,0,0.3)'}`
                  }}>
                    {event.status}
                  </span>
                ) : ((isPast && event.status !== 'upcoming' && event.status !== 'postponed' && event.status !== 'preponed') || event.status === 'active') && event.status !== 'ended' ? (
                  <span style={{
                    fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                    padding: '0.2rem 0.8rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: 'rgba(22,140,131,0.18)',
                    color: 'var(--ecell-teal, #168C83)',
                    border: '1px solid rgba(22,140,131,0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', display: 'inline-block' }} />
                    Active
                  </span>
                ) : (
                  <span style={{
                    fontSize: 'clamp(0.8rem, 2vw, 1.2rem)',
                    padding: '0.2rem 0.8rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: 'rgba(22,140,131,0.1)',
                    color: 'var(--ecell-teal, #168C83)',
                    border: '1px solid rgba(22,140,131,0.2)'
                  }}>
                    Upcoming
                  </span>
                )}
              </h1>
              <p style={{ color: TEAL, fontWeight: 600, margin: '0.4rem 0 0', fontSize: 'clamp(0.82rem, 2vw, 1rem)' }}>
                {event.tagline}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
              <motion.button
                onClick={async () => {
                  if (!user) { navigate('/auth'); return; }
                  await toggleSave();
                }}
                disabled={saveLoading}
                whileHover={{ scale: saveLoading ? 1 : 1.08 }} whileTap={{ scale: 0.95 }}
                style={{
                  background: isSaved ? `rgba(228,71,46,0.12)` : 'var(--glass-bg)',
                  border: isSaved ? `1px solid rgba(228,71,46,0.3)` : '1px solid var(--glass-border)',
                  borderRadius: '9999px', padding: '0.4rem 0.75rem',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  cursor: saveLoading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.8rem',
                  color: isSaved ? VERMILION : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  opacity: saveLoading ? 0.7 : 1
                }}
              >
                <BookmarkPlus size={14} /> {isSaved ? 'Saved' : 'Save'}
              </motion.button>
              <motion.button
                onClick={handleShare}
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                style={{
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  borderRadius: '9999px', padding: '0.4rem 0.75rem',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}
              >
                <Share2 size={14} /> Share
              </motion.button>
            </div>
          </div>

          {/* Meta Info Row */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.25rem',
            marginTop: '1.25rem', padding: 'clamp(0.85rem, 2vw, 1.25rem) clamp(1rem, 2vw, 1.5rem)',
            background: 'var(--glass-bg)',
            borderRadius: '14px',
            border: '1px solid var(--glass-border)',
          }}>
            {[
              event.date   && { icon: <Calendar size={16} />, text: new Date(event.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }), color: VERMILION },
              event.time   && { icon: <Clock size={16} />,    text: event.time,     color: TEAL   },
              event.location && { icon: <MapPin size={16} />, text: event.location, color: COBALT },
              { icon: <Users size={16} />, text: `${count} registered`,   color: SAFFRON },
            ].filter(Boolean).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <span style={{ color: item.color, display: 'flex', flexShrink: 0 }}>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Main Grid */}
          <div className="event-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr min(340px, 35%)', gap: '2rem', marginTop: '2rem' }}>

            {/* Left: Description + Speakers + Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', minWidth: 0 }}>

              {/* About */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.15rem, 3vw, 1.4rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={16} color={VERMILION} /> About this Event
                </h2>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.92rem', margin: 0 }}>
                  {event.description}
                </p>
              </motion.section>

              {/* Highlights */}
              {event.highlights && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.15rem, 3vw, 1.4rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem' }}>
                    ✦ What to Expect
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {event.highlights.map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.07 }}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                          padding: '0.7rem 0.85rem',
                          background: 'rgba(22,140,131,0.05)',
                          borderRadius: '10px',
                          border: '1px solid rgba(22,140,131,0.15)',
                        }}
                      >
                        <CheckCircle size={16} color={TEAL} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{h}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Winners (if any) */}
              {winners.length > 0 && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.15rem, 3vw, 1.4rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={18} color={SAFFRON} /> Event Winners
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {winners.map((winner, idx) => (
                      <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                        background: 'rgba(229,169,0,0.05)', borderRadius: '12px', border: '1px solid rgba(229,169,0,0.2)'
                      }}>
                        <img 
                          src={winner.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${winner.id}`} 
                          alt={winner.full_name} 
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {winner.full_name || 'Anonymous'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {winner.college || 'Unknown College'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Speakers — hidden until announced */}
            </div>

            {/* Right: Countdown + Register */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="event-detail-sidebar"
              style={{ position: 'sticky', top: '5rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {/* Countdown Card — only shown when date is set */}
              {!dateUnknown && (
                <div style={{
                  ...card,
                  padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                  borderRadius: '18px',
                }}>
                  {event.status === 'ended' ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Event Ended</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Thank you for participating!</div>
                    </div>
                  ) : (isPast && event.status !== 'upcoming' && event.status !== 'postponed' && event.status !== 'preponed') || event.status === 'active' ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: TEAL, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80', display: 'inline-block' }} />
                        Event is Active!
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Happening right now — participate now</div>
                    </div>
                  ) : event.status === 'postponed' || event.status === 'preponed' || event.status === 'upcoming' && isPast ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', opacity: 0.8, marginBottom: '0.25rem' }}>
                        {event.status === 'postponed' ? 'Event Postponed' : event.status === 'preponed' ? 'Event Preponed' : 'Stay Tuned'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {event.status === 'postponed' ? 'New date will be announced soon' : event.status === 'preponed' ? 'Check back for updates' : 'More details coming soon'}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={13} /> {event.status === 'postponed' || event.status === 'preponed' ? 'Rescheduled to' : 'Event starts in'}
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <CountdownUnit value={days} label="Days" />
                        <CountdownUnit value={hours} label="Hrs" />
                        <CountdownUnit value={minutes} label="Min" />
                        <CountdownUnit value={seconds} label="Sec" />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Attendees */}
              <div style={{
                ...card,
                padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.85rem'
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'rgba(228,71,46,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Users size={18} color={VERMILION} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)', lineHeight: 1 }}>{count}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Registered</div>
                </div>
              </div>

              {/* Registrations notice */}
              {event.status === 'ended' ? (
                <div style={{
                  width: '100%', padding: '0.9rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  fontWeight: 700, fontSize: '0.9rem',
                  color: 'var(--text-secondary)', textAlign: 'center',
                }}>
                  Event Ended
                </div>
              ) : event.date ? (
                <motion.button
                  onClick={async () => {
                    if (!user) { navigate('/auth'); return; }
                    if (isCaseStudy) {
                      if (caseStudyTeam) {
                        navigate(`/events/case-study/dashboard/${caseStudyTeam.team_id}`);
                      } else {
                        setIsCaseStudyModalOpen(true);
                      }
                      return;
                    }
                    if (isRegistered) { await unregister(); } else { await register(); }
                  }}
                  disabled={regLoading || checking}
                  whileHover={{ scale: regLoading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: '12px',
                    border: 'none',
                    cursor: regLoading || checking ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    transition: 'all 0.25s ease',
                    background: (isRegistered || caseStudyTeam)
                      ? 'rgba(22,140,131,0.12)'
                      : '#E4472E',
                    color: (isRegistered || caseStudyTeam) ? '#168C83' : 'white',
                    border: (isRegistered || caseStudyTeam) ? '1px solid rgba(22,140,131,0.3)' : '1px solid transparent',
                    opacity: regLoading || checking ? 0.7 : 1,
                  }}
                >
                  {checking
                    ? 'Checking...'
                    : regLoading
                      ? 'Processing...'
                      : !user
                        ? '🔒 Sign in to Register'
                        : caseStudyTeam
                          ? 'Go to Team Dashboard →'
                          : isRegistered
                            ? '✓ Registered — Click to Cancel'
                            : isCaseStudy ? 'Register for Case Study →' : 'Reserve Your Spot →'}
                </motion.button>
              ) : (
                <div style={{
                  width: '100%', padding: '0.9rem',
                  background: 'rgba(229,169,0,0.08)',
                  border: '1px solid rgba(229,169,0,0.3)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  fontWeight: 700, fontSize: '0.9rem',
                  color: '#E5A900', textAlign: 'center',
                }}>
                  🕐 Registrations are yet to open
                </div>
              )}

              {/* Tags */}
              {event.tags && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {event.tags.map((tag, i) => (
                    <span key={i} style={{
                      padding: '0.25rem 0.7rem', borderRadius: '9999px',
                      background: `rgba(49,87,164,0.1)`, color: COBALT,
                      border: `1px solid rgba(49,87,164,0.2)`,
                      fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.03em'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Mini Dashboard for Case Study */}
      {isCaseStudy && caseStudyTeam && (
        <div style={{ maxWidth: '1000px', margin: '3rem auto 0 auto', padding: '0 clamp(1rem, 4vw, 2rem)' }}>
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: 'clamp(1.25rem, 4vw, 2rem)', backdropFilter: 'blur(16px)' }}>
            <h3 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 800, margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={24} color={TEAL} /> Your Case Study Team
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Team Name</div>
                <div style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)', fontWeight: 700, color: 'var(--text-primary)' }}>{caseStudyTeam.team_name}</div>
              </div>
              
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '16px', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Invite Code</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 'clamp(1.25rem, 5vw, 1.75rem)', fontWeight: 800, color: TEAL, letterSpacing: '0.1em' }}>{caseStudyTeam.team_code}</div>
                  <button onClick={() => { navigator.clipboard.writeText(caseStudyTeam.team_code); alert('Team Code copied!'); }} style={{ background: 'rgba(22,140,131,0.1)', border: `1px solid ${TEAL}`, padding: '0.5rem', borderRadius: '8px', color: TEAL, cursor: 'pointer' }} title="Copy Code">
                    <Copy size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => navigate(`/events/case-study/dashboard/${caseStudyTeam.team_id}`)}
                style={{ background: VERMILION, color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Open Full Dashboard <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <CaseStudyRegistrationModal 
        isOpen={isCaseStudyModalOpen} 
        onClose={() => setIsCaseStudyModalOpen(false)} 
      />
    </div>
  );
}
