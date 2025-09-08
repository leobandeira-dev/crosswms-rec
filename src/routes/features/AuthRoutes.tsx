
import { Route } from 'react-router-dom';
import { PublicRoute } from '../PublicRoute';

// Pages Import
import AuthPage from '../../pages/AuthPage';
import ResetPassword from '../../pages/ResetPassword';

const AuthRoutes = () => {
  return [
    <Route key="auth-wildcard" path="/auth/*" element={
      <PublicRoute>
        <AuthPage />
      </PublicRoute>
    } />,
    
    <Route key="auth" path="/auth" element={
      <PublicRoute>
        <AuthPage />
      </PublicRoute>
    } />,
    
    <Route key="reset-password" path="/reset-password" element={
      <PublicRoute>
        <ResetPassword />
      </PublicRoute>
    } />
  ];
};

export default AuthRoutes;
