
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Pages Import
import Ocorrencias from '../../pages/sac/Ocorrencias';
import SACDashboard from '../../pages/sac/SACDashboard';
import Atendimentos from '../../pages/sac/Atendimentos';
import Chamados from '../../pages/sac/Chamados';

const SACRoutes = () => {
  return [
    <Route key="sac" path="/sac" element={
      <ProtectedRoute>
        <SACDashboard />
      </ProtectedRoute>
    } />,
    
    <Route key="sac-ocorrencias" path="/sac/ocorrencias" element={
      <ProtectedRoute>
        <Ocorrencias />
      </ProtectedRoute>
    } />,
    
    <Route key="sac-atendimentos" path="/sac/atendimentos" element={
      <ProtectedRoute>
        <Atendimentos />
      </ProtectedRoute>
    } />,
    
    <Route key="sac-chamados" path="/sac/chamados" element={
      <ProtectedRoute>
        <Chamados />
      </ProtectedRoute>
    } />
  ];
};

export default SACRoutes;
