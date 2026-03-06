import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DataProvider } from '../contexts/DataContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from './admin/components/shared/ProtectedRoute';
import { AuthLayout } from './admin/layouts/AuthLayout';

const TravelerPage = lazy(() => import('./pages/TravelerPage').then(m => ({ default: m.TravelerPage })));
const LoginPage = lazy(() => import('./admin/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const EditorPage = lazy(() => import('./admin/pages/EditorPage'));
const AnalyticsPage = lazy(() => import('./admin/pages/AnalyticsPage'));

function Loading() {
  return <div className="flex items-center justify-center min-h-screen text-gray-400">読み込み中...</div>;
}

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<Loading />}>
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
          </Suspense>
        </Router>
      </AuthProvider>
    </DataProvider>
  );
}
