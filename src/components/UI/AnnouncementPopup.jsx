import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Megaphone } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const VERMILION = '#E4472E';
const SEEN_KEY = 'seenPopupAnnouncements';

const getSeen = () => {
  try { return JSON.parse(sessionStorage.getItem(SEEN_KEY) || '[]'); } catch { return []; }
};

/**
 * Shows the latest active popup announcement (managed via Admin → Popup Announcements).
 * Each announcement is shown once per browser session, on the home page only.
 */
export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/') return;
    let cancelled = false;
    let timer;

    async function load() {
      const { data, error } = await supabase
        .from('popup_announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (cancelled || error || !data) return;
      const seen = getSeen();
      const next = data.find((a) => !seen.includes(a.id));
      if (!next) return;
      timer = setTimeout(() => {
        setAnnouncement(next);
        setIsOpen(true);
        sessionStorage.setItem(SEEN_KEY, JSON.stringify([...getSeen(), next.id]));
      }, 1200);
    }

    load();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [location.pathname]);

  const handleClose = () => setIsOpen(false);

  const handleAction = () => {
    setIsOpen(false);
    const link = announcement?.button_link;
    if (!link) return;
    if (/^https?:\/\//i.test(link)) window.open(link, '_blank', 'noopener,noreferrer');
    else navigate(link);
  };

  return (
    <AnimatePresence>
      {isOpen && announcement && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer'
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '450px',
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '24px',
              padding: '2rem',
              color: 'var(--text-primary)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden'
            }}
          >
            {/* Top Accent Line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${VERMILION}, transparent)`
            }} />

            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close announcement"
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'var(--text-primary)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: VERMILION, paddingRight: '2rem' }}>
              <Megaphone size={28} style={{ flexShrink: 0 }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                {announcement.title}
              </h2>
            </div>

            {announcement.message && (
              <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                {announcement.message}
              </p>
            )}

            {announcement.button_link && (
              <button
                onClick={handleAction}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: VERMILION,
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px 0 rgba(228,71,46,0.39)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(228,71,46,0.23)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(228,71,46,0.39)';
                }}
              >
                {announcement.button_text || 'Check it out'} <ArrowRight size={18} />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
