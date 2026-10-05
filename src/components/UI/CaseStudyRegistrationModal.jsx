import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, UserPlus, Shield, ChevronRight } from 'lucide-react';
import { useCaseStudy } from '../../hooks/useCaseStudy';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const VERMILION = '#E4472E';
const TEAL = '#168C83';

export default function CaseStudyRegistrationModal({ isOpen, onClose, eventId }) {
  const [mode, setMode] = useState('select'); // 'select', 'create', 'join'
  const { createTeam, joinTeam, loading, error, setError } = useCaseStudy();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    teamName: '',
    teamCode: '',
    name: '',
    email: user?.email || '',
    phone: '',
    college: '',
    rollNumber: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const res = await createTeam(formData.teamName, { ...formData, email: user?.email || formData.email }, eventId);
    if (res.success) {
      onClose();
      navigate(`/events/case-study/dashboard/${res.teamId}`);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    const res = await joinTeam(formData.teamCode, { ...formData, email: user?.email || formData.email });
    if (res.success) {
      onClose();
      navigate(`/events/case-study/dashboard/${res.teamId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)'
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
            borderRadius: '24px', width: '100%', maxWidth: '500px',
            overflow: 'hidden', position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Header */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {mode === 'select' ? 'Case Study Registration' : (
                <>
                  <button onClick={() => { setMode('select'); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>Back</button>
                  <ChevronRight size={16} color="var(--text-muted)" />
                  {mode === 'create' ? 'Create Team' : 'Join Team'}
                </>
              )}
            </h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '0.5rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: '2rem 1.5rem' }}>
            {error && (
              <div style={{ background: 'rgba(228,71,46,0.1)', color: VERMILION, padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', border: `1px solid rgba(228,71,46,0.3)` }}>
                {error}
              </div>
            )}

            {mode === 'select' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button
                  onClick={() => setMode('create')}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.2s, border-color 0.2s', outlineOffset: '2px' }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.background = 'rgba(22,140,131,0.05)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass-bg)'; }}
                >
                  <div style={{ background: 'rgba(22,140,131,0.2)', padding: '0.8rem', borderRadius: '12px', color: TEAL }}>
                    <Shield size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>Create Team (or Solo)</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Start a new group as the team leader.</div>
                  </div>
                </button>

                <button
                  onClick={() => setMode('join')}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.2s, border-color 0.2s', outlineOffset: '2px' }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = VERMILION; e.currentTarget.style.background = 'rgba(228,71,46,0.05)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass-bg)'; }}
                >
                  <div style={{ background: 'rgba(228,71,46,0.2)', padding: '0.8rem', borderRadius: '12px', color: VERMILION }}>
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>Join Existing Team</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Use the code provided by your leader (e.g. CS-9X2K).</div>
                  </div>
                </button>
              </div>
            )}

            {(mode === 'create' || mode === 'join') && (
              <form onSubmit={mode === 'create' ? handleCreateSubmit : handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {mode === 'join' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Team Code</label>
                    <input
                      required
                      name="teamCode"
                      value={formData.teamCode}
                      onChange={(e) => setFormData({ ...formData, teamCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. CS-9X2K"
                      style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', textTransform: 'uppercase' }}
                    />
                  </div>
                )}
                {mode === 'create' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Team Name</label>
                    <input
                      required
                      name="teamName"
                      value={formData.teamName}
                      onChange={handleChange}
                      placeholder="Enter a cool team name"
                      style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none' }}
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name</label>
                    <input required name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Phone</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>College</label>
                    <input required name="college" value={formData.college} onChange={handleChange} style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Roll Number</label>
                    <input required name="rollNumber" value={formData.rollNumber} onChange={handleChange} style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', outline: 'none' }} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '1rem', width: '100%', padding: '1rem',
                    background: loading ? 'var(--glass-bg)' : (mode === 'create' ? TEAL : VERMILION),
                    color: loading ? 'var(--text-muted)' : 'white',
                    border: 'none', borderRadius: '14px',
                    fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s, color 0.2s, transform 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    outlineOffset: '2px'
                  }}
                >
                  {loading ? 'Processing...' : (mode === 'create' ? 'Create Team' : 'Join Team')}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
