import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './layouts/AppShell';
import AdminDashboard from './pages/AdminDashboard';
import AdminRequestsPage from './pages/AdminRequestsPage';
import AdminReturnsPage from './pages/AdminReturnsPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentScanPage from './pages/StudentScanPage';

const App = () => (
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    <Route
      path="/admin"
      element={
        <ProtectedRoute roles={['admin']}>
          <AppShell>
            <AdminDashboard />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/requests"
      element={
        <ProtectedRoute roles={['admin']}>
          <AppShell>
            <AdminRequestsPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/returns"
      element={
        <ProtectedRoute roles={['admin']}>
          <AppShell>
            <AdminReturnsPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/student"
      element={
        <ProtectedRoute roles={['student']}>
          <AppShell>
            <StudentDashboard />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route
      path="/student/scan"
      element={
        <ProtectedRoute roles={['student']}>
          <AppShell>
            <StudentScanPage />
          </AppShell>
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<Navigate to="/auth" replace />} />
  </Routes>
);

export default App;
