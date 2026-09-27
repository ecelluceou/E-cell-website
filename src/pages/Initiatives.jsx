import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

import { RadialBackground } from '../components/UI/RadialBackground';
import { SparklesCore } from '../components/UI/Sparkles';

const DEFAULT_INITIATIVES = [
  {
    id: 'startup-support',
    title: 'Building a Startup? E-Cell Wants to Help!',
    tag: 'Founder Support',
    description: `Working on an early idea, an MVP, or building a venture that's already generating revenue?

E-Cell UCEOU is here to support student founders with dedicated mentors, investor access, technical resources, and institutional backing.

📌 No idea is too early-stage. 

Fill out a quick form and tell us what you're building — we'll take it from there. Let's build something real.`,
    link: 'https://forms.gle/7yk9PFLKEtyVqPr98',
    status: 'active',
    image: ''
  }
];

export default function Initiatives() {
  const [initiatives, setInitiatives] = useState(DEFAULT_INITIATIVES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInitiatives() {
      try {
        const { data, error } = await supabase.from('initiatives').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          // Merge with DEFAULT_INITIATIVES so custom items and defaults coexist seamlessly
          const merged = [...data];
          DEFAULT_INITIATIVES.forEach(def => {
            if (!merged.some(item => item.id === def.id)) {
              merged.push(def);
            }
          });
          setInitiatives(merged);
        } else {
          setInitiatives(DEFAULT_INITIATIVES);
        }
      } catch (err) {
        console.error('Error fetching initiatives:', err);
        setInitiatives(DEFAULT_INITIATIVES);
      } finally {
        setLoading(false);
      }
    }
    fetchInitiatives();
  }, []);

  if (loading) {
    return <Loader />;
  }

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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '2rem' }}>
          {initiatives.map(initiative => (
              <motion.div
                key={initiative.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="glass-panel"
                style={{
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '20px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(16px)'
                }}
              >
                {initiative.image ? (
                  <img src={initiative.image} alt={initiative.title} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '180px',
                    background: 'linear-gradient(135deg, rgba(228,71,46,0.3) 0%, rgba(22,140,131,0.25) 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '1.5rem',
                    textAlign: 'center',
                    borderBottom: '1px solid var(--glass-border)',
                    position: 'relative'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      padding: '0.35rem 0.8rem',
                      borderRadius: '100px',
                      background: 'rgba(228,71,46,0.2)',
                      color: 'var(--brand-primary)',
                      border: '1px solid rgba(228,71,46,0.4)',
                      marginBottom: '0.5rem'
                    }}>
                      {initiative.tag || 'Official Initiative'}
                    </span>
                    <h3 style={{ fontSize: '1.3rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
                      E-Cell UCEOU
                    </h3>
                  </div>
                )}

                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem', color: 'var(--brand-primary)', lineHeight: 1.3 }}>
                    {initiative.title}
                  </h3>
                  <p style={{
                    color: 'var(--text-secondary)',
                    marginBottom: '1.75rem',
                    flex: 1,
                    whiteSpace: 'pre-line',
                    lineHeight: 1.6,
                    fontSize: '0.95rem'
                  }}>
                    {initiative.description}
                  </p>
                  {initiative.link && (
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={initiative.link}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.85rem 1.5rem',
                        background: 'var(--brand-primary)',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '10px',
                        fontWeight: 700,
                        textAlign: 'center',
                        boxShadow: '0 4px 14px rgba(228,71,46,0.3)'
                      }}
                    >
                      Fill Out Form & Connect →
                    </motion.a>
                  )}
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
}
