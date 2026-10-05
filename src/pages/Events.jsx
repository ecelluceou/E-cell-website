import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { EventCountdownCard } from '../components/UI/EventCountdownCard';
import { supabase } from '../lib/supabase';
import { Loader } from '../components/UI/Loader';
import { useAuth } from '../contexts/AuthContext';

import { RadialBackground } from '../components/UI/RadialBackground';
import { SparklesCore } from '../components/UI/Sparkles';

const categorizeEvent = (ev) => {
  if (ev.status === 'ended') return 'ended';
  if (ev.status === 'active') return 'active';
  if (ev.status === 'postponed' || ev.status === 'upcoming' || ev.status === 'preponed') return 'upcoming';
  
  const isPast = ev.date && new Date(ev.date) <= new Date();
  if (isPast) return 'active';
  return 'upcoming';
};

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filter, setFilter] = useState('all');
  const [userRegistrations, setUserRegistrations] = useState(new Set());
  const { user } = useAuth();

  React.useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error } = await supabase.from('events').select('*');
        if (error) {
          console.error('Supabase error fetching events:', error);
          setErrorMsg(error.message);
          return;
        }

        const eventsWithCounts = await Promise.all(
          (data || []).map(async (ev) => {
            // Use SECURITY DEFINER RPC for count — works for ALL users
            const { data: rpcCount, error: rpcError } = await supabase
              .rpc('get_event_participant_count', { p_event_id: ev.id });

            let finalCount = 0;
            if (!rpcError && rpcCount !== null) {
              finalCount = rpcCount;
            } else {
              // Fallback if RPC not yet deployed
              const { count } = await supabase
                .from('event_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('event_id', ev.id);
              finalCount = count || 0;
            }
            return { ...ev, attendees: finalCount };
          })
        );
        
        let userRegSet = new Set();
        if (user) {
          const { data: regData } = await supabase
            .from('event_registrations')
            .select('event_id')
            .eq('user_id', user.id);
          if (regData) {
            userRegSet = new Set(regData.map(r => r.event_id));
          }
        }
        setUserRegistrations(userRegSet);
        setEvents(eventsWithCounts);
      } catch (err) {
        console.error('Unexpected error fetching events:', err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  const filteredEvents = events.filter(ev => {
    if (filter === 'all') return true;
    return categorizeEvent(ev) === filter;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const catA = categorizeEvent(a);
    const catB = categorizeEvent(b);
    
    if (filter === 'all') {
      const order = { 'active': 1, 'upcoming': 2, 'ended': 3 };
      if (order[catA] !== order[catB]) {
        return order[catA] - order[catB];
      }
    }
    
    const dateA = new Date(a.date).getTime() || 0;
    const dateB = new Date(b.date).getTime() || 0;
    
    if (catA === 'ended') {
      return dateB - dateA;
    }
    return dateA - dateB;
  });

  const tabs = [
    { id: 'all', label: 'All Events' },
    { id: 'active', label: 'Active' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'ended', label: 'Ended' }
  ];

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
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(228,71,46,0.2)', paddingBottom: '0.75rem', marginBottom: 'clamp(1.5rem, 4vw, 3rem)' }}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 'clamp(1.75rem, 5vw, 3rem)',
              color: '#E4472E',
              margin: 0,
              fontFamily: 'var(--font-heading)'
            }}
          >
            What's Cookin' at E-Cell
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}
          >
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className="events-filter-tab"
                style={{
                  background: filter === tab.id ? 'rgba(228,71,46,0.15)' : 'transparent',
                  border: filter === tab.id ? '1px solid rgba(228,71,46,0.3)' : '1px solid transparent',
                  color: filter === tab.id ? '#E4472E' : 'var(--text-secondary)',
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, transform 0.2s ease',
                  outlineOffset: '2px'
                }}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>
        </div>
        
        {errorMsg ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#E4472E' }}>
            Error loading events: {errorMsg}. Please ensure Supabase Row Level Security (RLS) allows anonymous reads for the 'events' table.
          </div>
        ) : sortedEvents.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No events found for this category.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: '2rem 1.5rem', placeItems: 'center' }}>
            {sortedEvents.map((event) => (
              <EventCountdownCard 
                key={event.id}
                title={event.title}
                date={event.date}
                image={event.image}
                attendees={event.attendees || 0}
                status={event.status}
                isRegistered={userRegistrations.has(event.id)}
                registrationStatus={event.registration_status}
                showParticipantCount={event.show_participant_count !== false}
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
