import React, { useState, useEffect } from 'react';
import { Bell, Menu, X, Home, Lightbulb, Users, CalendarDays, UserCircle, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navLinks = [
  {
    name: 'Home',
    path: '/',
    icon: <Home size={18} />,
    gradient: "radial-gradient(circle, rgba(228,71,46,0.15) 0%, rgba(228,71,46,0.06) 50%, rgba(228,71,46,0) 100%)",
    iconColor: "var(--brand-primary)",
  },
  {
    name: 'Initiatives',
    path: '/initiatives',
    icon: <Lightbulb size={18} />,
    gradient: "radial-gradient(circle, rgba(49,87,164,0.15) 0%, rgba(49,87,164,0.06) 50%, rgba(49,87,164,0) 100%)",
    iconColor: "var(--brand-secondary)",
  },
  {
    name: 'Team',
    path: '/team',
    icon: <Users size={18} />,
    gradient: "radial-gradient(circle, rgba(22,140,131,0.15) 0%, rgba(22,140,131,0.06) 50%, rgba(22,140,131,0) 100%)",
    iconColor: "var(--ecell-teal)",
  },
  {
    name: 'Events',
    path: '/events',
    icon: <CalendarDays size={18} />,
    gradient: "radial-gradient(circle, rgba(232,111,97,0.15) 0%, rgba(232,111,97,0.06) 50%, rgba(232,111,97,0) 100%)",
    iconColor: "var(--ecell-coral)",
  },
  {
    name: 'Leaderboard',
    path: '/leaderboard',
    icon: <Users size={18} />,
    gradient: "radial-gradient(circle, rgba(229,169,0,0.15) 0%, rgba(229,169,0,0.06) 50%, rgba(229,169,0,0) 100%)",
    iconColor: "#E5A900",
  },
  {
    name: 'Join Us',
    path: '/join-us',
    icon: <UserPlus size={18} />,
    gradient: "radial-gradient(circle, rgba(228,71,46,0.15) 0%, rgba(228,71,46,0.06) 50%, rgba(228,71,46,0) 100%)",
    iconColor: "var(--brand-primary)",
  }
];

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
};

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
};

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: "spring", stiffness: 300, damping: 25 },
    },
  },
};

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

const sharedTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  duration: 0.5,
};

export default function Navbar() {
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowAnnouncements(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    
    if (diffTime < 0) return 'Just now';
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} mins ago`;
      }
      return `${diffHours} hours ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const announcements = [
    { id: 1, title: 'Welcome Freshers! 🚀 Your journey to build the future starts today. E-Cell is here to help you turn your ideas into reality. Let\'s innovate together!', time: getTimeAgo('August 21, 2026') },
  ];

  return (
    <>
      <nav className="main-navbar" role="navigation" aria-label="Main navigation" style={{
        position: 'sticky',
        top: '0.75rem',
        left: 'clamp(0.75rem, 3vw, 3rem)',
        right: 'clamp(0.75rem, 3vw, 3rem)',
        padding: '0.6rem clamp(0.75rem, 2vw, 2rem)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 50,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--nav-border)',
        borderRadius: '20px',
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Brand */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
          <motion.div
            initial={{ opacity: 0, rotate: -10, scale: 0.85 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            whileHover={{ 
              scale: 1.08, 
              rotate: 3,
              filter: 'drop-shadow(0 0 14px rgba(228,71,46,0.65)) drop-shadow(0 0 28px rgba(228,71,46,0.25))' 
            }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            style={{
              width: 'clamp(1.31rem, 3.12vw, 1.75rem)',
              height: 'clamp(1.31rem, 3.12vw, 1.75rem)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              filter: 'drop-shadow(0 3px 10px rgba(0, 0, 0, 0.45))',
              transition: 'filter 0.3s ease'
            }}
          >
            {/* Transparent Logo Image */}
            <img 
              src="/logo.png" 
              alt="E-Cell UCEOU Logo" 
              style={{ 
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                display: 'block'
              }} 
            />
          </motion.div>

          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'clamp(1.05rem, 2.5vw, 1.4rem)',
            color: 'var(--brand-primary, #E4472E)',
            letterSpacing: '0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}>
            -CELL <span style={{ 
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.9em'
            }}>UCEOU</span>
          </div>
        </Link>

        {/* Desktop Links (3D Rotating Glow Menu) */}
        <div style={{ display: 'none' }} className="desktop-nav">
          <motion.ul 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              listStyle: 'none', 
              margin: 0, 
              padding: 0,
              position: 'relative'
            }}
            initial="initial"
            whileHover="hover"
          >
            {/* Nav Background Glow */}
            <motion.div
              style={{
                position: 'absolute',
                inset: '-10px',
                background: 'radial-gradient(circle at center, rgba(57,136,184,0.15) 0%, rgba(228,71,46,0.1) 50%, transparent 100%)',
                borderRadius: '24px',
                zIndex: 0,
                pointerEvents: 'none'
              }}
              variants={navGlowVariants}
            />

            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <motion.li key={link.name} style={{ position: 'relative', zIndex: 10 }}>
                  <motion.div
                    style={{ perspective: '600px', display: 'block', borderRadius: '12px' }}
                    whileHover="hover"
                    initial="initial"
                  >
                    <motion.div
                      variants={glowVariants}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        pointerEvents: 'none',
                        background: link.gradient,
                        borderRadius: '12px',
                      }}
                    />
                    
                    <Link to={link.path} style={{ textDecoration: 'none' }}>
                      <motion.div
                        variants={itemVariants}
                        transition={sharedTransition}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          position: 'relative',
                          zIndex: 10,
                          color: isActive ? link.iconColor : 'var(--text-secondary)',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.95rem',
                          transformStyle: 'preserve-3d',
                          transformOrigin: 'center bottom',
                        }}
                      >
                        <span style={{ 
                          color: isActive ? link.iconColor : 'inherit', 
                          display: 'flex', 
                          alignItems: 'center' 
                        }}>
                          {link.icon}
                        </span>
                        <span>{link.name}</span>
                      </motion.div>
                    </Link>

                    <Link to={link.path} style={{ textDecoration: 'none' }}>
                      <motion.div
                        variants={backVariants}
                        transition={sharedTransition}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          position: 'absolute',
                          inset: 0,
                          zIndex: 10,
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          transformStyle: 'preserve-3d',
                          transformOrigin: 'center top',
                          rotateX: 90,
                        }}
                      >
                        <span style={{ 
                          color: link.iconColor, 
                          display: 'flex', 
                          alignItems: 'center' 
                        }}>
                          {link.icon}
                        </span>
                        <span>{link.name}</span>
                      </motion.div>
                    </Link>
                  </motion.div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        {/* Icons / Actions */}
        <div style={{ display: 'flex', gap: 'clamp(0.4rem, 1.5vw, 1rem)', alignItems: 'center' }}>

          {/* Profile Link */}
          {user && (
            <Link
              to="/profile"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                textDecoration: 'none',
                color: location.pathname === '/profile' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.9rem',
                padding: '0.4rem 0.65rem',
                borderRadius: '9999px',
                background: location.pathname === '/profile' ? 'rgba(228,71,46,0.1)' : 'transparent',
                border: location.pathname === '/profile' ? '1px solid rgba(228,71,46,0.25)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                <img 
                  src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
                  alt="Profile" 
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
                />
              ) : (
                <UserCircle size={24} />
              )}
              <span className="profile-label">Profile</span>
            </Link>
          )}

          {!user && (
            <Link
              to="/auth"
              className="login-btn-label"
              style={{
                textDecoration: 'none',
                background: 'var(--brand-primary)',
                color: 'var(--text-inverse)',
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.85rem',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(228, 71, 46, 0.3)',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Login
            </Link>
          )}
          <button
            onClick={() => setShowAnnouncements(!showAnnouncements)}
            aria-label={showAnnouncements ? 'Close announcements' : 'Open announcements'}
            aria-expanded={showAnnouncements}
            aria-controls="announcements-panel"
            style={{
              background: 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'var(--glass-bg-hover)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Bell size={16} />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              display: 'none', // Handled via CSS
              padding: '0.25rem',
              flexShrink: 0
            }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ===== Mobile Menu Drawer ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 45,
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />
            {/* Drawer */}
              <motion.div
              id="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                top: 0, right: 0, bottom: 0,
                width: 'min(300px, 80vw)',
                zIndex: 55,
                background: 'var(--nav-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: '-10px 0 40px rgba(0,0,0,0.4)',
                padding: '5rem 1.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                overflowY: 'auto',
                borderLeft: '1px solid var(--nav-border)'
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  position: 'absolute', top: '1.25rem', right: '1.25rem',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-primary)', padding: '0.5rem'
                }}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>

              {navLinks.map((link, i) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '14px',
                        textDecoration: 'none',
                        color: isActive ? link.iconColor : 'var(--text-primary)',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '1rem',
                        background: isActive ? `${link.iconColor}12` : 'transparent',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ color: isActive ? link.iconColor : '#888', display: 'flex' }}>
                        {link.icon}
                      </span>
                      {link.name}
                    </Link>
                  </motion.div>
                );
              })}

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--glass-border)', margin: '0.5rem 0' }} />

              {user && (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.85rem 1rem', borderRadius: '14px',
                    textDecoration: 'none',
                    color: location.pathname === '/profile' ? 'var(--brand-primary)' : 'var(--text-primary)',
                    fontWeight: 600, fontSize: '1rem',
                    background: location.pathname === '/profile' ? 'rgba(228,71,46,0.08)' : 'transparent',
                  }}
                >
                  {profile?.avatar_url || user?.user_metadata?.avatar_url ? (
                    <img 
                      src={profile?.avatar_url || user?.user_metadata?.avatar_url} 
                      alt="Profile" 
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} 
                    />
                  ) : (
                    <UserCircle size={24} />
                  )}
                  Profile
                </Link>
              )}

              {!user && (
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.85rem', borderRadius: '14px',
                    textDecoration: 'none',
                    background: 'var(--brand-primary)', color: 'var(--text-inverse)',
                    fontWeight: 700, fontSize: '0.95rem',
                    marginTop: '0.5rem',
                    boxShadow: '0 4px 14px rgba(228,71,46,0.3)'
                  }}
                >
                  Login / Sign Up
                </Link>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Announcements Pop-up */}
      <AnimatePresence>
        {showAnnouncements && (
          <motion.div
            id="announcements-panel"
            role="region"
            aria-label="Recent announcements"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => {
              setShowAnnouncements(false);
              navigate('/announcements');
            }}
            style={{
              position: 'fixed',
              top: '70px',
              right: 'clamp(0.75rem, 3vw, 3rem)',
              width: 'min(320px, calc(100vw - 1.5rem))',
              background: 'var(--nav-bg)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--nav-border)',
              borderRadius: '12px',
              padding: '1.25rem',
              zIndex: 50,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
              cursor: 'pointer',
            }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1rem', color: 'var(--text-primary)' }}>
              Recent Updates
              <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--brand-primary)' }}>View All &rarr;</span>
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {announcements.map(ann => (
                <li key={ann.id}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ann.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{ann.time}</div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
