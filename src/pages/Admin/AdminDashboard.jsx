import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Routes, Route, useLocation } from 'react-router-dom';
import { Calendar, Award, Database, Users, Settings, ChevronRight, Megaphone, UserPlus, Crown } from 'lucide-react';
import ManageEvents from './ManageEvents';
import ManageInitiatives from './ManageInitiatives';
import ManagePopups from './ManagePopups';
import ManageTeam from './ManageTeam';
import EventData from './EventData';
import ManageMembers from './ManageMembers';
import ManageLeaderboard from './ManageLeaderboard';

export default function AdminDashboard() {
  const location = useLocation();

  const sidebarLinks = [
    { name: 'Dashboard Home', path: '/admin', icon: <Settings size={20} /> },
    { name: 'Manage Events', path: '/admin/events', icon: <Calendar size={20} /> },
    { name: 'Manage Initiatives', path: '/admin/initiatives', icon: <Award size={20} /> },
    { name: 'Popup Announcements', path: '/admin/popups', icon: <Megaphone size={20} /> },
    { name: 'Manage Team', path: '/admin/team', icon: <UserPlus size={20} /> },
    { name: 'Manage Members', path: '/admin/members', icon: <Crown size={20} /> },
    { name: 'Event Data & Attendance', path: '/admin/data', icon: <Database size={20} /> },
    { name: 'User Leaderboards', path: '/admin/leaderboards', icon: <Users size={20} /> },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <h2 style={{ paddingLeft: '1rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)' }}>
          Admin Panel
        </h2>
        {sidebarLinks.map(link => {
          const isActive = location.pathname === link.path;
          return (
            <Link 
              key={link.path} 
              to={link.path} 
              style={{ textDecoration: 'none', outline: 'none' }}
              className="admin-sidebar-link"
            >
              <motion.div
                whileHover={{ x: 5, background: 'rgba(255,255,255,0.05)' }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.8rem',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(228,71,46,0.1)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'background-color 0.2s, color 0.2s, box-shadow 0.2s'
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
      <div className="admin-main">
        <Routes>
          <Route path="/" element={
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', marginBottom: '0.5rem' }}>Welcome to the Admin Dashboard</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>Select a tool below or from the sidebar to begin managing the platform.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {sidebarLinks.slice(1).map(link => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    style={{ textDecoration: 'none', outline: 'none' }}
                    className="admin-grid-link"
                  >
                    <motion.div
                      whileHover={{ y: -5, scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        padding: '2rem',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1rem',
                        color: 'var(--text-primary)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.3s ease, border-color 0.3s ease'
                      }}
                    >
                      <div style={{ background: 'rgba(228,71,46,0.1)', color: 'var(--brand-primary)', padding: '1.2rem', borderRadius: '50%' }}>
                        {React.cloneElement(link.icon, { size: 32 })}
                      </div>
                      <h3 style={{ margin: 0, fontWeight: 600 }}>{link.name}</h3>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          } />
          <Route path="/events" element={<ManageEvents />} />
          <Route path="/initiatives" element={<ManageInitiatives />} />
          <Route path="/popups" element={<ManagePopups />} />
          <Route path="/team" element={<ManageTeam />} />
          <Route path="/members" element={<ManageMembers />} />
          <Route path="/data" element={<EventData />} />
          <Route path="/leaderboards" element={<ManageLeaderboard />} />
        </Routes>
      </div>
    </div>
  );
}
