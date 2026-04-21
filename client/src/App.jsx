import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LiveSessionProvider, useLiveSession } from './context/LiveSessionContext';

import PageWrapper from './components/layout/PageWrapper';

import Home             from './pages/Home';
import ProjectGallery   from './pages/ProjectGallery';
import ProjectSpotlight from './pages/ProjectSpotlight';
import VotingPage       from './pages/VotingPage';
import Winners          from './pages/Winners';
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

function ComingSoon() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
      <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mb-6 shadow-lg">
        <span className="material-icon material-icon-filled text-3xl text-on-primary">lock</span>
      </div>
      <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface mb-3">
        Coming Soon
      </h1>
      <p className="text-on-surface-variant max-w-sm">
        The Soft Skills 2026 platform is almost ready. Check back soon!
      </p>
    </div>
  );
}

function PublicGate({ children }) {
  const { isPublic, loading } = useLiveSession();
  if (loading) return null;
  if (!isPublic) return <ComingSoon />;
  return children;
}

function AppRoutes() {
  return (
    <PageWrapper>
      <Routes>
        <Route path="/"             element={<PublicGate><Home /></PublicGate>} />
        <Route path="/projects"     element={<PublicGate><ProjectGallery /></PublicGate>} />
        <Route path="/projects/:id" element={<PublicGate><ProjectSpotlight /></PublicGate>} />
        <Route path="/vote"         element={<PublicGate><VotingPage /></PublicGate>} />
        <Route path="/winners"      element={<PublicGate><Winners /></PublicGate>} />

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
