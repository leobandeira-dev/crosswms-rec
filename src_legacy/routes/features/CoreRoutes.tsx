
import { Route } from 'react-router-dom';

// Pages Import
import LandingPage from '../../pages/LandingPage';
import Dashboard from '../../pages/dashboard/Dashboard';
import Index from '../../pages/Index';
import Home from '../../pages/Home';
import UserProfilePage from '../../pages/UserProfilePage';

const CoreRoutes = () => {
  return [
    <Route key="home" path="/" element={<Home />} />,
    
    <Route key="profile" path="/profile" element={<UserProfilePage />} />,
    
    <Route key="dashboard" path="/dashboard" element={<Dashboard />} />,

    <Route key="index" path="/index" element={<Index />} />,
    
    <Route key="landing" path="/landing" element={<LandingPage />} />
  ];
};

export default CoreRoutes;
