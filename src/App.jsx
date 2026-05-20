import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './providers/AuthProvider.jsx';
import { ToastProvider } from './providers/ToastProvider.jsx';
import { ConfirmProvider } from './providers/ConfirmProvider.jsx';
import { TweaksProvider } from './providers/TweaksProvider.jsx';
import { WorkspaceProvider } from './providers/WorkspaceProvider.jsx';

import LoginPage from './pages/Login.jsx';
import ResetPasswordPage from './pages/ResetPassword.jsx';

const OnboardingPage = lazy(() => import('./pages/Onboarding.jsx'));
const AppShell = lazy(() => import('./components/AppShell.jsx'));
const DashboardPage = lazy(() => import('./pages/Dashboard.jsx'));
const AdminPage = lazy(() => import('./pages/Admin.jsx'));
const PlaygroundPage = lazy(() => import('./pages/Playground.jsx'));
const ModelsPage = lazy(() => import('./pages/Models.jsx'));
const AgentsPage = lazy(() => import('./pages/Agents.jsx'));
const VoiceAIPage = lazy(() => import('./pages/VoiceAI.jsx'));
const WorkflowsPage = lazy(() => import('./pages/Workflows.jsx'));
const ImageStudioPage = lazy(() => import('./pages/ImageStudio.jsx'));
const VideoStudioPage = lazy(() => import('./pages/VideoStudio.jsx'));
const APIKeysPage = lazy(() => import('./pages/APIKeys.jsx'));
const DeploymentsPage = lazy(() => import('./pages/Deployments.jsx'));
const LogsPage = lazy(() => import('./pages/Logs.jsx'));
const BillingPage = lazy(() => import('./pages/Billing.jsx'));
const TeamsPage = lazy(() => import('./pages/Teams.jsx'));
const MarketplacePage = lazy(() => import('./pages/Marketplace.jsx'));
const IntegrationsPage = lazy(() => import('./pages/Integrations.jsx'));
const ProfilePage = lazy(() => import('./pages/Profile.jsx'));
const SettingsPage = lazy(() => import('./pages/Settings.jsx'));

function FullPageLoader({ label = 'Loading...' }) {
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
          <Suspense fallback={<FullPageLoader />}>
            <AppShell>
              <Suspense fallback={<FullPageLoader />}>
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
              </Suspense>
            </AppShell>
          </Suspense>
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
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/onboarding" element={<RequireAuth><Suspense fallback={<FullPageLoader />}><OnboardingPage /></Suspense></RequireAuth>} />
            <Route path="/*" element={<RequireAuth><ProtectedRoutes /></RequireAuth>} />
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
