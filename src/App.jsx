import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider.jsx';
import { ToastProvider } from './providers/ToastProvider.jsx';
import { ConfirmProvider } from './providers/ConfirmProvider.jsx';
import { TweaksProvider } from './providers/TweaksProvider.jsx';
import { WorkspaceProvider } from './providers/WorkspaceProvider.jsx';

import LoginPage from './pages/Login.jsx';
import OnboardingPage from './pages/Onboarding.jsx';
import AppShell from './components/AppShell.jsx';
import DashboardPage from './pages/Dashboard.jsx';
import AdminPage from './pages/Admin.jsx';
import PlaygroundPage from './pages/Playground.jsx';
import ModelsPage from './pages/Models.jsx';
import AgentsPage from './pages/Agents.jsx';
import VoiceAIPage from './pages/VoiceAI.jsx';
import WorkflowsPage from './pages/Workflows.jsx';
import ImageStudioPage from './pages/ImageStudio.jsx';
import VideoStudioPage from './pages/VideoStudio.jsx';
import APIKeysPage from './pages/APIKeys.jsx';
import DeploymentsPage from './pages/Deployments.jsx';
import LogsPage from './pages/Logs.jsx';
import BillingPage from './pages/Billing.jsx';
import TeamsPage from './pages/Teams.jsx';
import MarketplacePage from './pages/Marketplace.jsx';
import IntegrationsPage from './pages/Integrations.jsx';
import ProfilePage from './pages/Profile.jsx';
import SettingsPage from './pages/Settings.jsx';

function FullPageLoader({ label }) {
  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-0)', color: 'var(--text-3)', fontSize: 13 }}>
      {label}
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader label="Loading session..." />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RequireOnboarded({ children }) {
  const { user } = useAuth();
  if (!user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function ProtectedRoutes() {
  return (
    <WorkspaceProvider>
      <TweaksProvider>
        <RequireOnboarded>
          <AppShell>
            <Routes>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="playground" element={<PlaygroundPage />} />
              <Route path="models" element={<ModelsPage />} />
              <Route path="agents" element={<AgentsPage />} />
              <Route path="voice" element={<VoiceAIPage />} />
              <Route path="workflows" element={<WorkflowsPage />} />
              <Route path="image-studio" element={<ImageStudioPage />} />
              <Route path="video-studio" element={<VideoStudioPage />} />
              <Route path="api-keys" element={<APIKeysPage />} />
              <Route path="deployments" element={<DeploymentsPage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="teams" element={<TeamsPage />} />
              <Route path="marketplace" element={<MarketplacePage />} />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppShell>
        </RequireOnboarded>
      </TweaksProvider>
    </WorkspaceProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <div className="ambient"></div>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
            <Route path="/*" element={<RequireAuth><ProtectedRoutes /></RequireAuth>} />
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
