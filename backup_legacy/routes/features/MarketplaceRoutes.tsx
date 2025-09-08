import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Pages Import
import MarketplaceDashboard from '../../pages/marketplace/MarketplaceDashboard';
import CriacaoOrdem from '../../pages/marketplace/CriacaoOrdem';
import MonitoramentoRotas from '../../pages/marketplace/MonitoramentoRotas';
import VehicleAllocation from '../../pages/marketplace/VehicleAllocation';

const MarketplaceRoutes = () => {
  return [
    <Route key="marketplace" path="/marketplace" element={
      <ProtectedRoute>
        <MarketplaceDashboard />
      </ProtectedRoute>
    } />,
    
    <Route key="marketplace-nova-ordem" path="/marketplace/nova-ordem" element={
      <ProtectedRoute>
        <CriacaoOrdem />
      </ProtectedRoute>
    } />,
    
    <Route key="marketplace-monitoramento" path="/marketplace/monitoramento" element={
      <ProtectedRoute>
        <MonitoramentoRotas />
      </ProtectedRoute>
    } />,
    
    <Route key="marketplace-alocacao" path="/marketplace/alocacao-veiculos" element={
      <ProtectedRoute>
        <VehicleAllocation />
      </ProtectedRoute>
    } />,
  ];
};

export default MarketplaceRoutes;
