import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SparklesCore } from '../components/UI/Sparkles';

function getTimeAgo(dateString) {
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
}

const announcementsData = [
  {
    id: 1,
    title: 'Welcome Freshers! 🚀 Your Journey Starts Here',
    date: 'August 21, 2026',
    description: 'A massive welcome to all the freshers joining the college today! E-Cell is your launchpad to turn crazy ideas into reality. Whether you want to build the next big startup, learn cutting-edge tech, or just meet incredibly driven people — you are in the right place. Don\'t be afraid to dream big. Let\'s innovate together!',
    tag: 'Welcome',
    important: true
  }
];

export default function Announcements() {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <SparklesCore
          id="tsparticles-announcements"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={80}
          className="w-full h-full"
          particleColor="#E4472E"
          speed={0.8}
        />
      </div>
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: 'clamp(5.5rem, 15vw, 120px) clamp(1rem, 5vw, 5%) clamp(3rem, 8vw, 80px)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '4rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ 
              background: 'rgba(235, 94, 40, 0.1)', 
              padding: '0.5rem', 
              borderRadius: '50%',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BellRing size={24} />
            </div>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.75rem, 5vw, 3rem)',
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.1
            }}>
              Announcements
            </h1>
          </div>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            opacity: 0.8
          }}>
            Stay up to date with the latest news, events, and opportunities from E-Cell UCEOU.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {announcementsData.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(36, 36, 36, 0.08)' }}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid rgba(36, 36, 36, 0.05)',
                borderRadius: '16px',
                padding: 'clamp(1.25rem, 3vw, 2rem)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                cursor: 'pointer'
              }}
            >
              {/* Highlight bar for important announcements */}
              {announcement.important && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: 'var(--brand-primary)'
                }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{
                    background: announcement.important ? 'var(--brand-primary)' : 'rgba(36, 36, 36, 0.05)',
                    color: announcement.important ? 'var(--text-inverse)' : 'var(--text-primary)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {announcement.tag}
                  </span>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontSize: '0.85rem', 
                    color: 'var(--text-secondary)',
                    opacity: 0.8
                  }}>
                    <Calendar size={14} />
                    <span>{announcement.date}</span>
                    <span>•</span>
                    <span>{announcement.time || getTimeAgo(announcement.date)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  margin: '0 0 0.5rem 0',
                  color: 'var(--text-primary)'
                }}>
                  {announcement.title}
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  opacity: 0.9
                }}>
                  {announcement.description}
                </p>
              </div>

            </motion.div>
          ))}
        </div>
        
        <div style={{ 
          marginTop: '4rem', 
          textAlign: 'center',
          padding: '2rem',
          borderTop: '1px solid rgba(36, 36, 36, 0.05)'
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            You've reached the end of recent announcements.
          </p>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem 2rem',
            background: 'var(--text-primary)',
            color: 'var(--text-inverse)',
            textDecoration: 'none',
            borderRadius: '9999px',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'opacity 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.9'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
