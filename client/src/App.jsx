import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LiveSessionProvider } from './context/LiveSessionContext';

import PageWrapper from './components/layout/PageWrapper';

import Home             from './pages/Home';
import ProjectGallery   from './pages/ProjectGallery';
import ProjectSpotlight from './pages/ProjectSpotlight';
import VotingPage       from './pages/VotingPage';
// import Schedule      from './pages/Schedule'; // removed: single-day event, timeline on home page is enough
import NotFound         from './pages/NotFound';

import JudgeLogin       from './pages/judge/JudgeLogin';
import JudgeDashboard   from './pages/judge/JudgeDashboard';
import GradingInterface from './pages/judge/GradingInterface';

function ProtectedRoute({ children }) {
  const { judge, loading } = useAuth();
  if (loading) return null;
  if (!judge) return <Navigate to="/judge/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <PageWrapper>
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/projects"     element={<ProjectGallery />} />
        <Route path="/projects/:id" element={<ProjectSpotlight />} />
        <Route path="/vote"         element={<VotingPage />} />
        {/* <Route path="/schedule" element={<Schedule />} /> */}

        <Route path="/judge/login"     element={<JudgeLogin />} />
        <Route path="/judge/dashboard" element={<ProtectedRoute><JudgeDashboard /></ProtectedRoute>} />
        <Route path="/judge/grade/:projectId" element={<ProtectedRoute><GradingInterface /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageWrapper>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <LiveSessionProvider>
          <AppRoutes />
        </LiveSessionProvider>
      </AuthProvider>
    </HashRouter>
  );
}
