
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Pages Import
import LandingPage from '../../pages/LandingPage';
import Dashboard from '../../pages/dashboard/Dashboard';
import Index from '../../pages/Index';
import UserProfilePage from '../../pages/UserProfilePage';

const CoreRoutes = () => {
  return [
    <Route key="landing" path="/" element={<LandingPage />} />,
    
    <Route key="profile" path="/profile" element={
      <ProtectedRoute>
        <UserProfilePage />
      </ProtectedRoute>
    } />,
    
    <Route key="dashboard" path="/dashboard" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />,

    <Route key="index" path="/index" element={<Index />} />
  ];
};

export default CoreRoutes;
