import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, GraduationCap, CalendarCheck, Bookmark,
  Settings, LogOut, ChevronRight, Award, Star, TrendingUp, ArrowLeft,
  Phone, Calendar as CalendarIcon
} from 'lucide-react';
import { SparklesCore } from '../components/UI/Sparkles';
import EditProfileModal from '../components/UI/EditProfileModal';
import { supabase } from '../lib/supabase';

function StatCard({ icon, value, label, color }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.1)' }}
      style={{
        background: 'var(--nav-bg)', borderRadius: '14px', padding: 'clamp(1rem, 2vw, 1.5rem)',
        border: '1px solid var(--glass-border)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem',
        cursor: 'default', transition: 'box-shadow 0.25s ease',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '50%',
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'center' }}>{label}</div>
    </motion.div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('events');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [savedEvents, setSavedEvents] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchUserEvents = async () => {
      const { data: eventsData } = await supabase.from('events').select('*');
      const allEvents = eventsData || [];

      const { data: regData } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', user.id);
      if (regData) {
        const registered = regData.map(r => allEvents.find(e => e.id === r.event_id)).filter(Boolean);
        // Sort by date descending (closest first)
        setRegisteredEvents(registered.sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0)));
      }

      const { data: saveData } = await supabase
        .from('saved_events')
        .select('event_id')
        .eq('user_id', user.id);
      if (saveData) {
        const saved = saveData.map(r => allEvents.find(e => e.id === r.event_id)).filter(Boolean);
        setSavedEvents(saved);
      }
    };
    fetchUserEvents();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null; // Or a loading spinner
  }

  // Generate a numeric ID from UUID for privacy
  const getUserNumber = (uuid) => {
    if (!uuid) return "1";
    let hash = 0;
    for (let i = 0; i < uuid.length; i++) {
      hash = uuid.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 10000;
  };

  const displayName = profile?.full_name || `User ${getUserNumber(user?.id)}`;
  const displayEmail = user?.email || 'Hidden for privacy';
  const avatarInitials = displayName.substring(0, 2).toUpperCase();
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const joinedDate = profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

  const profileData = {
    name: displayName,
    email: displayEmail,
    role: profile?.role || "Member",
    department: profile?.college || "Not Specified",
    phone: profile?.phone || "Not Provided",
    dob: profile?.dob || "Not Provided",
    year: "Not Specified",
    joinedDate: joinedDate,
    eventsAttended: registeredEvents.filter(e => new Date(e.date) < new Date()).length,
    upcomingEvents: registeredEvents.filter(e => new Date(e.date) >= new Date()).length,
    savedEventsCount: savedEvents.length,
    avatarInitials: avatarInitials,
    avatarUrl: avatarUrl,
    bannerUrl: profile?.banner_url
  };

  return (
    <>
    <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <SparklesCore
          id="tsparticles-profile"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={80}
          className="w-full h-full"
          particleColor="#168C83"
          speed={0.8}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1, paddingTop: 'clamp(5rem, 12vw, 7rem)', paddingBottom: '4rem', paddingLeft: 'clamp(1rem, 5vw, 5vw)', paddingRight: 'clamp(1rem, 5vw, 5vw)', maxWidth: '1000px', margin: '0 auto' }}>

        {/* Back link */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
            marginBottom: '1.5rem'
          }}>
            <ArrowLeft size={15} /> Back to Home
          </Link>
        </motion.div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'var(--nav-bg)', borderRadius: '20px', overflow: 'hidden',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
            marginBottom: '1.5rem'
          }}
        >
          {/* Cover banner */}
          <div style={{
            height: 'clamp(80px, 15vw, 120px)',
            background: profileData.bannerUrl ? `url(${profileData.bannerUrl}) center/cover no-repeat` : 'linear-gradient(135deg, var(--ecell-vermilion) 0%, var(--ecell-cobalt) 60%, var(--ecell-teal) 100%)',
            position: 'relative',
          }}>
            {!profileData.bannerUrl && (
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)'
              }} />
            )}
          </div>

          <div style={{ padding: '0 clamp(1rem, 3vw, 2rem) clamp(1.25rem, 3vw, 2rem)' }}>
            {/* Avatar + Actions */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '-30px', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <motion.div
                whileHover={{ scale: 1.06 }}
                style={{
                  width: 'clamp(60px, 12vw, 80px)', height: 'clamp(60px, 12vw, 80px)', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--ecell-vermilion), var(--ecell-cobalt))',
                  border: '3px solid var(--nav-bg)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 800, fontSize: 'clamp(1.1rem, 3vw, 1.6rem)',
                  fontFamily: 'var(--font-heading)', cursor: 'default', flexShrink: 0,
                  overflow: 'hidden'
                }}
              >
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  profileData.avatarInitials
                )}
              </motion.div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <motion.button
                  onClick={() => setIsEditModalOpen(true)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  style={{
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    borderRadius: '9999px', padding: '0.4rem 0.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem',
                    color: 'var(--text-primary)', fontFamily: 'var(--font-body)'
                  }}
                >
                  <Settings size={13} /> Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                  style={{
                    background: 'rgba(22,140,131,0.08)', border: '1px solid rgba(22,140,131,0.2)',
                    borderRadius: '9999px', padding: '0.4rem 0.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem',
                    color: 'var(--brand-primary)', fontFamily: 'var(--font-body)'
                  }}
                >
                  <LogOut size={13} /> Sign Out
                </motion.button>
              </div>
            </div>

            {/* Name & Details */}
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.25rem, 4vw, 1.7rem)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {profileData.name}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.4rem', alignItems: 'center' }}>
                <span style={{
                  padding: '0.15rem 0.65rem', borderRadius: '9999px',
                  background: 'linear-gradient(135deg, var(--ecell-vermilion), var(--ecell-cobalt))',
                  color: 'white', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em'
                }}>
                  {profileData.role}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.72rem, 2vw, 0.88rem)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <GraduationCap size={13} /> {profileData.department} · {profileData.year}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Mail size={13} /> {profileData.email}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CalendarCheck size={13} /> Since {profileData.joinedDate}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(130px, 45%), 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}
        >
          <StatCard icon={<Award size={20} />} value={profileData.eventsAttended} label="Events Attended" color="var(--brand-primary)" />
          <StatCard icon={<CalendarCheck size={20} />} value={profileData.upcomingEvents} label="Upcoming Events" color="var(--ecell-teal)" />
          <StatCard icon={<Star size={20} />} value={profileData.savedEventsCount} label="Events Saved" color="var(--ecell-saffron)" />
          <StatCard icon={<TrendingUp size={20} />} value="New" label="Engagement" color="var(--ecell-cobalt)" />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            background: 'var(--nav-bg)', borderRadius: '18px', overflow: 'hidden',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          {/* Tab Headers */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', padding: '0 clamp(0.75rem, 2vw, 1.5rem)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {[
              { key: 'events', label: 'My Events', icon: <CalendarCheck size={15} /> },
              { key: 'saved', label: 'Saved', icon: <Bookmark size={15} /> },
              { key: 'about', label: 'About', icon: <User size={15} /> },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '0.85rem clamp(0.6rem, 2vw, 1.25rem)', fontWeight: 600, fontSize: '0.82rem',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  color: activeTab === tab.key ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  borderBottom: activeTab === tab.key ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  transition: 'all 0.2s ease', fontFamily: 'var(--font-body)',
                  marginBottom: '-1px', whiteSpace: 'nowrap', flexShrink: 0
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>

            {activeTab === 'events' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: '0 0 0.35rem' }}>
                  {registeredEvents.length > 0 ? "Events you're registered for:" : "You haven't registered for any events yet."}
                </p>
                {registeredEvents.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => navigate(`/events/${ev.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem', borderRadius: '12px',
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      background: 'var(--glass-bg)'
                    }}
                    whileHover={{ x: 4, background: 'rgba(22,140,131,0.04)', borderColor: 'rgba(22,140,131,0.2)' }}
                  >
                    <img
                      src={ev.image}
                      alt={ev.title}
                      loading="lazy"
                      decoding="async"
                      style={{ width: 'clamp(40px, 10vw, 56px)', height: 'clamp(40px, 10vw, 56px)', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}</div>
                    </div>
                    <span className="event-status-badge" style={{
                      padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700,
                      background: new Date(ev.date) > new Date() ? 'rgba(22,140,131,0.1)' : 'var(--glass-bg)',
                      color: new Date(ev.date) > new Date() ? 'var(--ecell-teal)' : 'var(--text-muted)',
                      flexShrink: 0, whiteSpace: 'nowrap'
                    }}>
                      {new Date(ev.date) > new Date() ? 'Upcoming' : 'Attended'}
                    </span>
                    <ChevronRight size={14} color="#ccc" style={{ flexShrink: 0 }} className="chevron-desktop" />
                  </motion.div>
                ))}
                <Link to="/events" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.75rem', borderRadius: '10px',
                  border: '1.5px dashed rgba(22,140,131,0.35)',
                  color: 'var(--brand-primary)', fontWeight: 600, fontSize: '0.85rem',
                  textDecoration: 'none', marginTop: '0.15rem',
                  transition: 'all 0.2s ease'
                }}>
                  + Browse events
                </Link>
              </div>
            )}

            {activeTab === 'saved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {savedEvents.length > 0 ? (
                  savedEvents.map((ev, i) => (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      onClick={() => navigate(`/events/${ev.id}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem 1rem', borderRadius: '12px',
                        border: '1px solid var(--glass-border)',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        background: 'var(--glass-bg)'
                      }}
                      whileHover={{ x: 4, background: 'rgba(229,169,0,0.04)', borderColor: 'rgba(229,169,0,0.2)' }}
                    >
                      <img
                        src={ev.image}
                        alt={ev.title}
                        loading="lazy"
                        style={{ width: 'clamp(40px, 10vw, 56px)', height: 'clamp(40px, 10vw, 56px)', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}</div>
                      </div>
                      <ChevronRight size={14} color="#ccc" style={{ flexShrink: 0 }} className="chevron-desktop" />
                    </motion.div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    <Bookmark size={36} style={{ marginBottom: '0.75rem', opacity: 0.4, margin: '0 auto' }} />
                    <p style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>No saved events yet</p>
                    <p style={{ fontSize: '0.8rem' }}>Bookmark events from the events page to see them here.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {[
                  { label: 'Full Name', value: profileData.name, icon: <User size={15} /> },
                  { label: 'Email Address', value: profileData.email, icon: <Mail size={15} /> },
                  { label: 'College / University', value: profileData.department, icon: <GraduationCap size={15} /> },
                  { label: 'Phone Number', value: profileData.phone, icon: <Phone size={15} /> },
                  { label: 'Date of Birth', value: profileData.dob, icon: <CalendarIcon size={15} /> },
                  { label: 'Member Since', value: profileData.joinedDate, icon: <CalendarCheck size={15} /> },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.75rem 1rem', borderRadius: '10px',
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)'
                  }}>
                    <span style={{ color: 'var(--brand-primary)', flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{item.label}</div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
    </>
  );
}
