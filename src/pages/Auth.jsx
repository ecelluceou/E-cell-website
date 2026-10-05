import React from 'react';
import { AuthUI } from '../components/UI/AuthUI';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Auth() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'relative', width: '100%', minHeight: '100vh' }}
    >
      {/* Back to Home — shown instead of Navbar */}
      <Link
        to="/"
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '2rem',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: 'var(--text-primary)',
          fontWeight: 600,
          fontSize: '0.9rem',
          padding: '0.5rem 1.1rem',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
          outlineOffset: '2px'
        }}
        onMouseOver={(e) => { 
          e.currentTarget.style.transform = 'translateY(-2px)'; 
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; 
          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        }}
        onMouseOut={(e) => { 
          e.currentTarget.style.transform = 'translateY(0)'; 
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
        }}
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <AuthUI />
    </motion.div>
  );
}
