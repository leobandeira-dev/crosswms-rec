
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Pages Import
import ReportsDashboard from '../../pages/relatorios/ReportsDashboard';
import SolicitacoesReport from '../../pages/relatorios/coletas/SolicitacoesReport';
import AprovacoesReport from '../../pages/relatorios/coletas/AprovacoesReport';
import VolumesReport from '../../pages/relatorios/armazenagem/VolumesReport';
import MovimentacoesReport from '../../pages/relatorios/armazenagem/MovimentacoesReport';
import OrdensReport from '../../pages/relatorios/carregamento/OrdensReport';
import FaturamentoReport from '../../pages/relatorios/expedicao/FaturamentoReport';
import PerformanceReport from '../../pages/relatorios/motoristas/PerformanceReport';
import OcorrenciasReport from '../../pages/relatorios/sac/OcorrenciasReport';

const RelatoriosRoutes = () => {
  return [
    <Route key="relatorios" path="/relatorios" element={
      <ProtectedRoute>
        <ReportsDashboard />
      </ProtectedRoute>
    } />,
    
    <Route key="relatorios-coletas-solicitacoes" path="/relatorios/coletas/solicitacoes" element={
      <ProtectedRoute>
        <SolicitacoesReport />
      </ProtectedRoute>
    } />,
    
    <Route key="relatorios-coletas-aprovacoes" path="/relatorios/coletas/aprovacoes" element={
      <ProtectedRoute>
        <AprovacoesReport />
      </ProtectedRoute>
    } />,
    
    <Route key="relatorios-armazenagem-volumes" path="/relatorios/armazenagem/volumes" element={
      <ProtectedRoute>
        <VolumesReport />
      </ProtectedRoute>
    } />,
    
    <Route key="relatorios-armazenagem-movimentacoes" path="/relatorios/armazenagem/movimentacoes" element={
      <ProtectedRoute>
        <MovimentacoesReport />
      </ProtectedRoute>
    } />,
    
    <Route key="relatorios-carregamento-ordens" path="/relatorios/carregamento/ordens" element={
      <ProtectedRoute>
        <OrdensReport />
      </ProtectedRoute>
    } />,
    
    <Route key="relatorios-expedicao-faturamento" path="/relatorios/expedicao/faturamento" element={
      <ProtectedRoute>
        <FaturamentoReport />
      </ProtectedRoute>
    } />,
    
    <Route key="relatorios-motoristas-performance" path="/relatorios/motoristas/performance" element={
      <ProtectedRoute>
        <PerformanceReport />
      </ProtectedRoute>
    } />,
    
    <Route key="relatorios-sac-ocorrencias" path="/relatorios/sac/ocorrencias" element={
      <ProtectedRoute>
        <OcorrenciasReport />
      </ProtectedRoute>
    } />
  ];
};

export default RelatoriosRoutes;
