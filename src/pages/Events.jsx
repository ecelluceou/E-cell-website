import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EventCountdownCard } from '../components/UI/EventCountdownCard';
import { supabase } from '../lib/supabase';
import { Loader } from '../components/UI/Loader';

import { RadialBackground } from '../components/UI/RadialBackground';
import { SparklesCore } from '../components/UI/Sparkles';
export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState(null);

  React.useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
        if (error) {
          console.error('Supabase error fetching events:', error);
          setErrorMsg(error.message);
        }
        setEvents(data || []);
      } catch (err) {
        console.error('Unexpected error fetching events:', err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', color: 'var(--text-primary)', overflow: 'hidden' }}>
      <RadialBackground />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <SparklesCore
          id="tsparticles-events"
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
        padding: 'clamp(5.5rem, 12vw, 8rem) clamp(1rem, 5vw, 5vw) 4rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: 'clamp(1.75rem, 5vw, 3rem)',
          color: '#E4472E',
          borderBottom: '1px solid rgba(228,71,46,0.2)',
          paddingBottom: '0.75rem',
          marginBottom: 'clamp(1.5rem, 4vw, 3rem)',
          fontFamily: 'var(--font-heading)'
        }}
      >
        Upcoming Events
      </motion.h1>
      
      {errorMsg ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#E4472E' }}>
          Error loading events: {errorMsg}. Please ensure Supabase Row Level Security (RLS) allows anonymous reads for the 'events' table.
        </div>
      ) : events.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No upcoming events scheduled.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '2rem 1.5rem', placeItems: 'center' }}>
          {events.map((event) => (
            <EventCountdownCard 
              key={event.id}
              title={event.title}
              date={event.date}
              image={event.image}
              attendees={event.attendees || 0}
              status={event.status}
              onJoin={() => navigate(`/events/${event.id}`)}
              onClick={() => navigate(`/events/${event.id}`)}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
