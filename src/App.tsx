import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/dashboard/Dashboard';
import { EventList } from './pages/events/EventList';
import { EventDetail } from './pages/events/EventDetail';
import { ParticipantList } from './pages/participants/ParticipantList';
import { ParticipantDetail } from './pages/participants/ParticipantDetail';
import ECMProgress from './pages/participants/ECMProgress';
import { SpeakerList } from './pages/speakers/SpeakerList';
import { SpeakerDetail } from './pages/speakers/SpeakerDetail';
import { SyncDashboard } from './pages/sync/SyncDashboard';
import { WebhookDashboard } from './pages/webhooks/WebhookDashboard';
import { Layout } from './components/layout/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/participants"
          element={
            <ProtectedRoute>
              <ParticipantList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/participants/:id"
          element={
            <ProtectedRoute>
              <ParticipantDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/speakers"
          element={
            <ProtectedRoute>
              <SpeakerList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/speakers/:id"
          element={
            <ProtectedRoute>
              <SpeakerDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ecm/:enrollmentId"
          element={
            <ProtectedRoute>
              <ECMProgress />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sync"
          element={
            <ProtectedRoute>
              <SyncDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/webhooks"
          element={
            <ProtectedRoute>
              <WebhookDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
