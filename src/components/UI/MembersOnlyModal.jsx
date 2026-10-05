import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, X } from 'lucide-react';

export default function MembersOnlyModal({ isOpen, onClose, itemName }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', width: '100%', maxWidth: '420px', textAlign: 'center', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '2rem 1.5rem' }}
          >
            <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(229,169,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Crown size={28} color="#E5A900" />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Members Only</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
              {itemName ? `"${itemName}" is` : 'This is'} exclusive to E-Cell UCEOU members. Take membership to register.
            </p>
            <Link to="/join-us" onClick={onClose} style={{ display: 'block', padding: '0.85rem', borderRadius: '12px', background: '#E4472E', color: 'white', fontWeight: 700, textDecoration: 'none' }}>
              Get Membership →
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
