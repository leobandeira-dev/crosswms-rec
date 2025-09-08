
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';

// Admin Pages Imports
import AdminDashboard from '@/pages/admin/AdminDashboard';
import SuperAdminDashboard from '@/pages/admin/SuperAdminDashboard';
import GestaoEmpresas from '@/pages/admin/GestaoEmpresas';
import ApresentacaoComercial from '@/pages/admin/ApresentacaoComercial';
import TesteAcessoControl from '@/pages/admin/TesteAcessoControl';
import Logs from '@/pages/admin/Logs';
import ClientesAdmin from '@/pages/admin/clientes/ClientesAdmin';
import RecebimentosAdmin from '@/pages/admin/financeiro/RecebimentosAdmin';
import NotasFiscaisAdmin from '@/pages/admin/financeiro/NotasFiscaisAdmin.tsx'; // Fixed extension
import PacotesAdmin from '@/pages/admin/produtos/PacotesAdmin';
import AcessosAdmin from '@/pages/admin/acessos/AcessosAdmin';
import SuporteAdmin from '@/pages/admin/suporte/SuporteAdmin';
import LeadsAdmin from '@/pages/admin/leads/LeadsAdmin';
import ResetSenhasAdmin from '@/pages/admin/acessos/ResetSenhasAdmin';

const AdminRoutes = () => {
  return [
    // Super Admin Dashboard (Nova Versão)
    <Route key="super-admin-dashboard" path="/admin" element={
      <ProtectedRoute>
        <SuperAdminDashboard />
      </ProtectedRoute>
    } />,
    
    // Admin Dashboard (Rotas administrativas)
    <Route key="admin-dashboard" path="/admin/dashboard" element={
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    } />,
    
    // Clientes
    <Route key="clientes-admin" path="/admin/clientes" element={
      <ProtectedRoute>
        <ClientesAdmin />
      </ProtectedRoute>
    } />,
    
    // Financeiro
    <Route key="recebimentos-admin" path="/admin/financeiro/recebimentos" element={
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
    
    // Gestão de Empresas
    <Route key="gestao-empresas" path="/admin/empresas" element={
      <ProtectedRoute>
        <GestaoEmpresas />
      </ProtectedRoute>
    } />,
    
    // Apresentação Comercial
    <Route key="apresentacao-comercial" path="/admin/apresentacao-comercial" element={
      <ProtectedRoute>
        <ApresentacaoComercial />
      </ProtectedRoute>
    } />,
    
    // Teste de Acesso
    <Route key="teste-acesso" path="/admin/teste-acesso" element={
      <ProtectedRoute>
        <TesteAcessoControl />
      </ProtectedRoute>
    } />,
    
    // Logs e Auditoria
    <Route key="logs-auditoria" path="/admin/logs" element={
      <ProtectedRoute>
        <Logs />
      </ProtectedRoute>
    } />,
  ];
};

export default AdminRoutes;
