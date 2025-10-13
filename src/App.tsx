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
import { UserList } from './pages/users/UserList';
import { SyncDashboard } from './pages/sync/SyncDashboard';
import { WebhookDashboard } from './pages/webhooks/WebhookDashboard';
import { Settings } from './pages/settings/Settings';
import { Layout } from './components/layout/Layout';
import { PublicLandingPage } from './pages/public/PublicLandingPage';
import { LandingPageList } from './pages/landing/LandingPageList';
import { LandingPageBuilder } from './pages/landing/LandingPageBuilder';
import { InboxList } from './pages/inbox/InboxList';
import { ThreadView } from './pages/inbox/ThreadView';
import { IMAPSettings } from './pages/inbox/IMAPSettings';
import { ProjectsDashboard } from './pages/projects/ProjectsDashboard';
import { ProjectDetail } from './pages/projects/ProjectDetail';
import { ChatLayout } from './pages/chat/ChatLayout';
import { ProjectEventList, ProjectEventDetail, ProjectEventEdit } from './pages/project-events';

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

        {/* Public Landing Page - No Auth Required */}
        <Route path="/landing/:slug" element={<PublicLandingPage />} />

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
          path="/users"
          element={
            <ProtectedRoute>
              <UserList />
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

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/landing-pages"
          element={
            <ProtectedRoute>
              <LandingPageList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/landing-pages/new"
          element={
            <ProtectedRoute>
              <LandingPageBuilder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/landing-pages/:id/edit"
          element={
            <ProtectedRoute>
              <LandingPageBuilder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <InboxList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inbox/thread/:threadId"
          element={
            <ProtectedRoute>
              <ThreadView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inbox/settings"
          element={
            <ProtectedRoute>
              <IMAPSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project-events"
          element={
            <ProtectedRoute>
              <ProjectEventList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project-events/new"
          element={
            <ProtectedRoute>
              <ProjectEventEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project-events/:id"
          element={
            <ProtectedRoute>
              <ProjectEventDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/project-events/:id/edit"
          element={
            <ProtectedRoute>
              <ProjectEventEdit />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
