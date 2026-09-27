import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Utensils } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const VERMILION = '#E4472E';
const CASE_STUDY_EVENT_ID = 'Case-Study';

export default function AnnouncementPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Only trigger on the home page
    if (location.pathname !== '/') return;

    // Only show once per session
    const hasSeen = sessionStorage.getItem('hasSeenCaseStudyAnnouncement');
    if (hasSeen) return;

    async function checkAndShow() {
      if (user) {
        // Check regular event_registrations
        const { data: reg } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('event_id', CASE_STUDY_EVENT_ID)
          .eq('user_id', user.id)
          .maybeSingle();

        // Check case_study_members (team-based registration)
        const { data: member } = await supabase
          .from('case_study_members')
          .select('id')
          .eq('email', user.email)
          .maybeSingle();

        if (reg || member) {
          // Already registered — mark as seen, don't show
          sessionStorage.setItem('hasSeenCaseStudyAnnouncement', 'true');
          return;
        }
      }

      // Not registered (or not logged in) → show after short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('hasSeenCaseStudyAnnouncement', 'true');
      }, 1200);
      return () => clearTimeout(timer);
    }

    checkAndShow();
  }, [location.pathname, user]);

  const handleClose = () => setIsOpen(false);

  const handleCheckOut = () => {
    setIsOpen(false);
    navigate(`/events/${CASE_STUDY_EVENT_ID}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
              color: 'white',
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
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: VERMILION }}>
              <Utensils size={28} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                The Current Dish in E-CELL
              </h2>
            </div>
            
            <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              We've just launched a new <strong>Case Study Event</strong>! Gather your team, put on your thinking caps, and get ready to solve real-world problems.
            </p>

            <button
              onClick={handleCheckOut}
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
              Check it out <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
