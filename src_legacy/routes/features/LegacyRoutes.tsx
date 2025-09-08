import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Legacy Pages Imports
import Dashboard from '../../pages/dashboard/Dashboard';

const LegacyRoutes = () => {
  return [
    // Legacy Dashboard (Versão Anterior)
    <Route key="legacy-dashboard" path="/legacy" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />,
  ];
};

export default LegacyRoutes;
