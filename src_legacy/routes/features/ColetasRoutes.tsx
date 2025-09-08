
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Pages Import
import SolicitacoesColeta from '../../pages/coletas/SolicitacoesColeta';
import AprovacoesColeta from '../../pages/coletas/AprovacoesColeta';
import CargasAlocacao from '../../pages/coletas/CargasAlocacao';

const ColetasRoutes = () => {
  return [
    <Route key="coletas-solicitacoes" path="/coletas/solicitacoes" element={
      <ProtectedRoute>
        <SolicitacoesColeta />
      </ProtectedRoute>
    } />,
    
    <Route key="coletas-aprovacoes" path="/coletas/aprovacoes" element={
      <ProtectedRoute>
        <AprovacoesColeta />
      </ProtectedRoute>
    } />,
    
    <Route key="coletas-cargas" path="/coletas/cargas" element={
      <ProtectedRoute>
        <CargasAlocacao />
      </ProtectedRoute>
    } />,
    
    <Route key="coletas-alocacao" path="/coletas/alocacao" element={
      <ProtectedRoute>
        <CargasAlocacao />
      </ProtectedRoute>
    } />
  ];
};

export default ColetasRoutes;
