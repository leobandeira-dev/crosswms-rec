
import { Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Pages Import
import Faturamento from '../../pages/expedicao/Faturamento';
import EmissaoDocumentos from '../../pages/expedicao/EmissaoDocumentos';
import Remessas from '../../pages/expedicao/Remessas';

const ExpedicaoRoutes = () => {
  return [
    <Route key="expedicao" path="/expedicao" element={
      <ProtectedRoute>
        <Navigate to="/expedicao/faturamento" replace />
      </ProtectedRoute>
    } />,
    
    <Route key="expedicao-faturamento" path="/expedicao/faturamento" element={
      <ProtectedRoute>
        <Faturamento />
      </ProtectedRoute>
    } />,
    
    <Route key="expedicao-documentos" path="/expedicao/documentos" element={
      <ProtectedRoute>
        <EmissaoDocumentos />
      </ProtectedRoute>
    } />,
    
    <Route key="expedicao-remessas" path="/expedicao/remessas" element={
      <ProtectedRoute>
        <Remessas />
      </ProtectedRoute>
    } />
  ];
};

export default ExpedicaoRoutes;
