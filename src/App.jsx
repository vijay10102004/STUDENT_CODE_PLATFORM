import { useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import MainLayout from './layout/MainLayout';
import AdminPanel from './pages/AdminPanel';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

function App() {
  const { user } = useAuth();

  if (!user) return <AuthPage />;

  return (
    <Router>
      <h1 style={{ textAlign: 'center', color: '#4fc3f7' }}>Student Code Platform</h1>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
