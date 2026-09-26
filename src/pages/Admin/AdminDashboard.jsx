import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { Calendar, Award, Database, Users, Settings, ChevronRight } from 'lucide-react';
import ManageEvents from './ManageEvents';
import ManageInitiatives from './ManageInitiatives';
import EventData from './EventData';

export default function AdminDashboard() {
  const location = useLocation();

  const sidebarLinks = [
    { name: 'Dashboard Home', path: '/admin', icon: <Settings size={20} /> },
    { name: 'Manage Events', path: '/admin/events', icon: <Calendar size={20} /> },
    { name: 'Manage Initiatives', path: '/admin/initiatives', icon: <Award size={20} /> },
    { name: 'Event Data & Attendance', path: '/admin/data', icon: <Database size={20} /> },
    { name: 'User Leaderboards', path: '/admin/leaderboards', icon: <Users size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '80px', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: 'var(--glass-bg)',
        borderRight: '1px solid var(--glass-border)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <h2 style={{ paddingLeft: '1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>
          Admin Panel
        </h2>
        {sidebarLinks.map(link => {
          const isActive = location.pathname === link.path;
          return (
            <Link key={link.path} to={link.path} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ x: 5, background: 'rgba(255,255,255,0.05)' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(228,71,46,0.1)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s'
                }}
              >
                {link.icon}
                {link.name}
                {isActive && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={
            <div>
              <h1>Welcome to the E-Cell Admin Dashboard</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Select a tool from the sidebar to begin managing the platform.</p>
            </div>
          } />
          <Route path="/events" element={<ManageEvents />} />
          <Route path="/initiatives" element={<ManageInitiatives />} />
          <Route path="/data" element={<EventData />} />
          <Route path="/leaderboards" element={<div>Manage Leaderboards (Coming Soon)</div>} />
        </Routes>
      </div>
    </div>
  );
}
