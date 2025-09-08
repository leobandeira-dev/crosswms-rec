import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Pages Import
import AchievementDashboard from '../../pages/gamification/AchievementDashboard';

const ConquistasRoutes = () => {
  return [
    <Route key="conquistas" path="/conquistas" element={
      <ProtectedRoute>
        <AchievementDashboard />
      </ProtectedRoute>
    } />,
  ];
};

export default ConquistasRoutes;
