import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/UI/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

// Lazy-loaded routes — each page becomes its own chunk
// Three.js (513KB) only loads when Home is visited
const Home = React.lazy(() => import('./pages/Home'));
const Initiatives = React.lazy(() => import('./pages/Initiatives'));
const Team = React.lazy(() => import('./pages/Team'));
const Events = React.lazy(() => import('./pages/Events'));
const EventDetail = React.lazy(() => import('./pages/EventDetail'));
const CaseStudyDashboard = React.lazy(() => import('./pages/CaseStudyDashboard'));
const Announcements = React.lazy(() => import('./pages/Announcements'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Profile = React.lazy(() => import('./pages/Profile'));
const JoinUs = React.lazy(() => import('./pages/JoinUs'));
const AdminDashboard = React.lazy(() => import('./pages/Admin/AdminDashboard'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));

import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import { Loader as RouteLoader } from './components/UI/Loader';
import AnnouncementPopup from './components/UI/AnnouncementPopup';
// Paths where the Navbar should be hidden
const HIDE_NAVBAR_PATHS = ['/auth'];

function Layout() {
  const location = useLocation();
  const hideNavbar = HIDE_NAVBAR_PATHS.includes(location.pathname);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {!hideNavbar && <Navbar />}
      <AnnouncementPopup />

      {/* Main Content Area */}
      <main id="main-content" style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/initiatives" element={<Initiatives />} />
            <Route path="/team" element={<Team />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/events/case-study/dashboard/:teamId" element={<ProtectedRoute><CaseStudyDashboard /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Layout />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;