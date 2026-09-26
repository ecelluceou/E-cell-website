import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

import { RadialBackground } from '../components/UI/RadialBackground';
import { SparklesCore } from '../components/UI/Sparkles';

export default function Initiatives() {
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInitiatives() {
      const { data, error } = await supabase.from('initiatives').select('*').order('created_at', { ascending: false });
      if (!error) {
        setInitiatives(data || []);
      } else {
        console.error('Error fetching initiatives:', error);
      }
      setLoading(false);
    }
    fetchInitiatives();
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: 'var(--text-primary)', overflow: 'hidden' }}>
      <RadialBackground />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <SparklesCore
          id="tsparticles-initiatives"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={80}
          className="w-full h-full"
          particleColor="#E4472E"
          speed={0.8}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1, padding: 'clamp(5.5rem, 12vw, 8rem) clamp(1rem, 5vw, 5vw) 4rem', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)', color: 'var(--ecell-vermilion)', borderBottom: '1px solid rgba(228,71,46,0.2)', paddingBottom: '0.75rem', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}
      >
        Our Initiatives
      </motion.h1>
      
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>Loading initiatives...</div>
      ) : initiatives.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-panel"
          style={{ padding: '4rem 2rem', textAlign: 'center' }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Coming Soon</h2>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            We are currently working on exciting new initiatives. Stay tuned!
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {initiatives.map(initiative => (
            <motion.div 
              key={initiative.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="glass-panel"
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: '16px' }}
            >
              {initiative.image && (
                <img src={initiative.image} alt={initiative.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              )}
              <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--brand-primary)' }}>{initiative.title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', flex: 1, whiteSpace: 'pre-line' }}>{initiative.description}</p>
                {initiative.link && (
                  <a href={initiative.link} target="_blank" rel="noreferrer" style={{ display: 'inline-block', padding: '0.8rem 1.5rem', background: 'var(--brand-primary)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center' }}>
                    Learn More
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
