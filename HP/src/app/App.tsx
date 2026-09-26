import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DataProvider } from '../contexts/DataContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from './admin/components/shared/ProtectedRoute';
import { AuthLayout } from './admin/layouts/AuthLayout';
import { STORE_CONFIGS } from '../utils/storeConfig';

const TravelerPage = lazy(() => import('./pages/TravelerPage').then(m => ({ default: m.TravelerPage })));
const LoginPage = lazy(() => import('./admin/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const EditorPage = lazy(() => import('./admin/pages/EditorPage'));
const AnalyticsPage = lazy(() => import('./admin/pages/AnalyticsPage'));

function Loading() {
  return <div className="flex items-center justify-center min-h-screen text-gray-400">読み込み中...</div>;
}

// index.html の <title>（全ページ共通の既定値。LINE のプレビューなど JS を動かさない読み手にはこれが出る）
const DEFAULT_TITLE = document.title;
const ADMIN_TITLE = 'KABUKI寿司 管理画面';

/** URL に合わせてタブ名を切り替える。店舗ページの題名は storeConfig で管理 */
function PageTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.replace(/\/+$/, '') || '/';
    if (path.startsWith('/admin')) {
      document.title = ADMIN_TITLE;
      return;
    }
    const store = Object.values(STORE_CONFIGS).find(s => s.basePath === path || s.travelerPath === path);
    if (!store) {
      document.title = DEFAULT_TITLE;
      return;
    }
    document.title = store.travelerPath === path ? store.travelerPageTitle : store.pageTitle;
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <Router>
          <PageTitle />
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
