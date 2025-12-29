import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { TravelerPage } from './pages/TravelerPage';
import { LoginPage } from './admin/pages/LoginPage';
import EditorPage from './admin/pages/EditorPage';
import { DataProvider } from '../contexts/DataContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from './admin/components/shared/ProtectedRoute';

export default function App() {
  return (
    <DataProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/traveler" element={<TravelerPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/editor" element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </DataProvider>
  );
}
