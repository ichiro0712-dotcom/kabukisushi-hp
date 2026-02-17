import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { TravelerPage } from './pages/TravelerPage';
import { LoginPage } from './admin/pages/LoginPage';
import EditorPage from './admin/pages/EditorPage';
import AnalyticsPage from './admin/pages/AnalyticsPage';
import { DataProvider } from '../contexts/DataContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from './admin/components/shared/ProtectedRoute';
import { AuthLayout } from './admin/layouts/AuthLayout';

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes - Honten (本店) */}
            <Route path="/" element={<LandingPage storeId="honten" />} />
            <Route path="/traveler" element={<TravelerPage storeId="honten" />} />

            {/* Public Routes - Ichiban-dori (1番通り店) */}
            <Route path="/ichiban-dori" element={<LandingPage storeId="ichiban" />} />
            <Route path="/ichiban-dori/traveler" element={<TravelerPage storeId="ichiban" />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
            <Route path="/admin/login" element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            } />
            <Route path="/admin/editor" element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </DataProvider>
  );
}
