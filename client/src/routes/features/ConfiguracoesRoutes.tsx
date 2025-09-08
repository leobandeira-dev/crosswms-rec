
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Pages Import
import ConfiguracoesPage from '../../pages/configuracoes/ConfiguracoesPage';

const ConfiguracoesRoutes = () => {
  return [
    <Route key="configuracoes" path="/configuracoes" element={
      <ProtectedRoute>
        <ConfiguracoesPage />
      </ProtectedRoute>
    } />
  ];
};

export default ConfiguracoesRoutes;
