
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Admin Pages Imports
import SuperAdminDashboard from '@/pages/admin/SuperAdminDashboard';
import GestaoClientes from '@/pages/admin/GestaoClientes';
import GestaoCobrancas from '@/pages/admin/GestaoCobrancas';
import GestaoDados from '@/pages/admin/GestaoDados';
import GestaoSeguranca from '@/pages/admin/GestaoSeguranca';
import LogsAuditoria from '@/pages/admin/LogsAuditoria';
import NotasFiscaisServico from '@/pages/admin/NotasFiscaisServico';
import VisualizacaoAmpla from '@/pages/admin/VisualizacaoAmpla';
import GestaoNotificacoes from '@/pages/admin/GestaoNotificacoes';
import ClientesAdmin from '@/pages/admin/clientes/ClientesAdmin';
import RecebimentosAdmin from '@/pages/admin/financeiro/RecebimentosAdmin';
import NotasFiscaisAdmin from '@/pages/admin/financeiro/NotasFiscaisAdmin';
import PacotesAdmin from '@/pages/admin/produtos/PacotesAdmin';
import AcessosAdmin from '@/pages/admin/acessos/AcessosAdmin';
import SuporteAdmin from '@/pages/admin/suporte/SuporteAdmin';
import LeadsAdmin from '@/pages/admin/leads/LeadsAdmin';
import ResetSenhasAdmin from '@/pages/admin/acessos/ResetSenhasAdmin';

const AdminRoutes = () => {
  return [
    // Admin Dashboard
    <Route key="admin-dashboard" path="/admin" element={
      <ProtectedRoute>
        <SuperAdminDashboard />
      </ProtectedRoute>
    } />,
    
    // Main Admin Pages
    <Route key="gestao-clientes" path="/admin/clientes" element={
      <ProtectedRoute>
        <GestaoClientes />
      </ProtectedRoute>
    } />,
    
    <Route key="gestao-cobrancas" path="/admin/cobrancas" element={
      <ProtectedRoute>
        <GestaoCobrancas />
      </ProtectedRoute>
    } />,
    
    <Route key="gestao-dados" path="/admin/dados" element={
      <ProtectedRoute>
        <GestaoDados />
      </ProtectedRoute>
    } />,
    
    <Route key="gestao-seguranca" path="/admin/seguranca" element={
      <ProtectedRoute>
        <GestaoSeguranca />
      </ProtectedRoute>
    } />,
    
    <Route key="logs-auditoria" path="/admin/logs-auditoria" element={
      <ProtectedRoute>
        <LogsAuditoria />
      </ProtectedRoute>
    } />,
    
    <Route key="notas-fiscais-servico" path="/admin/notas-fiscais-servico" element={
      <ProtectedRoute>
        <NotasFiscaisServico />
      </ProtectedRoute>
    } />,
    
    <Route key="visualizacao-ampla" path="/admin/visualizacao-ampla" element={
      <ProtectedRoute>
        <VisualizacaoAmpla />
      </ProtectedRoute>
    } />,
    
    <Route key="gestao-notificacoes" path="/admin/notificacoes" element={
      <ProtectedRoute>
        <GestaoNotificacoes />
      </ProtectedRoute>
    } />,
    
    // Financeiro
    <Route key="recebimentos-admin" path="/admin/financeiro" element={
      <ProtectedRoute>
        <RecebimentosAdmin />
      </ProtectedRoute>
    } />,
    
    <Route key="recebimentos-admin-path" path="/admin/financeiro/recebimentos" element={
      <ProtectedRoute>
        <RecebimentosAdmin />
      </ProtectedRoute>
    } />,
    
    <Route key="notas-fiscais-admin" path="/admin/financeiro/notas-fiscais" element={
      <ProtectedRoute>
        <NotasFiscaisAdmin />
      </ProtectedRoute>
    } />,
    
    // Produtos/Pacotes
    <Route key="pacotes-admin" path="/admin/produtos/pacotes" element={
      <ProtectedRoute>
        <PacotesAdmin />
      </ProtectedRoute>
    } />,
    
    // Acessos
    <Route key="acessos-admin" path="/admin/acessos" element={
      <ProtectedRoute>
        <AcessosAdmin />
      </ProtectedRoute>
    } />,
    
    <Route key="reset-senhas-admin" path="/admin/acessos/reset-senhas" element={
      <ProtectedRoute>
        <ResetSenhasAdmin />
      </ProtectedRoute>
    } />,
    
    // Suporte
    <Route key="suporte-admin" path="/admin/suporte" element={
      <ProtectedRoute>
        <SuporteAdmin />
      </ProtectedRoute>
    } />,
    
    // Leads
    <Route key="leads-admin" path="/admin/leads" element={
      <ProtectedRoute>
        <LeadsAdmin />
      </ProtectedRoute>
    } />,
  ];
};

export default AdminRoutes;
