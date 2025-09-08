import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { 
  PublicRoute, 
  AdminRoute, 
  TransportadorRoute, 
  ClienteRoute, 
  FornecedorRoute,
  ProtectedRoute 
} from '@/components/ProtectedRoute';

// Main Pages
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import ModernAuthPage from '@/pages/ModernAuthPage';
import LandingPage from '@/pages/LandingPage';
import LandingPageClient from '@/pages/LandingPageClient';
import LandingPrincipalAtualizada from '@/pages/LandingPrincipalAtualizada';
import LandingSegmentada from '@/pages/LandingSegmentada';
import LandingPrincipalLimpa from '@/pages/LandingPrincipalLimpa';
import Home from '@/pages/Home';
import TestPage from '@/pages/TestPage';
import LoginPage from '@/pages/LoginPage';
import LoginPageClient from '@/pages/LoginPageClient';
import CrossWMSAuthPage from '@/pages/CrossWMSAuthPage';
import AuthPageClient from '@/pages/AuthPageClient';
import DashboardOtimizado from '@/pages/DashboardOtimizado';
import UserProfilePage from '@/pages/UserProfilePage';
import ResetPassword from '@/pages/ResetPassword';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import NotFound from '@/pages/NotFound';
import OrientacaoSistema from '@/pages/OrientacaoSistema';

// User-specific Dashboards
import ClienteDashboard from '@/pages/cliente/ClienteDashboard';
import FornecedorDashboard from '@/pages/fornecedor/FornecedorDashboard';
import UserRedirect from '@/components/UserRedirect';

// Gamification Pages
import { AchievementDashboard } from '@/pages/gamification/AchievementDashboard';

// Admin Pages

import GestaoCobrancas from '@/pages/admin/GestaoCobrancas';
import GestaoDados from '@/pages/admin/GestaoDados';
import LogsAuditoria from '@/pages/admin/LogsAuditoria';
import GestaoClientes from '@/pages/admin/GestaoClientes';
import NotasFiscaisServico from '@/pages/admin/NotasFiscaisServico';
import VisualizacaoAmpla from '@/pages/admin/VisualizacaoAmpla';
import GestaoSeguranca from '@/pages/admin/GestaoSeguranca';
import GestaoNotificacoes from '@/pages/admin/GestaoNotificacoes';
import FinanceiroDashboard from '@/pages/admin/FinanceiroDashboard';
import Recebimentos from '@/pages/admin/Recebimentos';
import NotasFiscais from '@/pages/admin/NotasFiscais';

// Super Admin Pages
import SuperAdminDashboard from '@/pages/admin/SuperAdminDashboard';
import GestaoEmpresas from '@/pages/admin/GestaoEmpresas';
import PacotesAdmin from '@/pages/admin/produtos/PacotesAdmin';
import AprovacaoTransportadores from '@/pages/admin/AprovacaoTransportadores';
import AdminClientes from '@/pages/admin/AdminClientes';
import AdminFinanceiroRecebimentos from '@/pages/admin/AdminFinanceiroRecebimentos';
import AdminFinanceiroNotasFiscais from '@/pages/admin/AdminFinanceiroNotasFiscais';
import AdminSuporte from '@/pages/admin/AdminSuporte';
import Relatorios from '@/pages/admin/Relatorios';
import ApresentacaoComercial from '@/pages/admin/ApresentacaoComercial';
import Configuracoes from '@/pages/admin/Configuracoes';
import EmailConfigPage from '@/pages/EmailConfigPage';
import Logs from '@/pages/admin/Logs';
import TesteAcessoControl from '@/pages/admin/TesteAcessoControl';

// Configuration Pages
import NovaConfiguracao from '@/pages/configuracoes/NovaConfiguracao';
import InformacoesEmpresa from '@/pages/configuracoes/InformacoesEmpresa';
// AprovacaoPage foi consolidado em ConfiguracaoMatriz

// SAC Pages
import SACDashboard from '@/pages/sac/SACDashboard';
import Atendimentos from '@/pages/sac/Atendimentos';
import Chamados from '@/pages/sac/Chamados';
import Ocorrencias from '@/pages/sac/Ocorrencias';

// Coletas Pages
import ColetasWorkflow from '@/pages/coletas/ColetasWorkflow';
import SolicitacoesColeta from '@/pages/coletas/SolicitacoesColeta';
import AprovacoesColeta from '@/pages/coletas/AprovacoesColeta';
import AlocacaoVeiculos from '@/pages/coletas/AlocacaoVeiculos';
import ExecucaoColetas from '@/pages/coletas/ExecucaoColetas';
import OrdemCarregamentoColetas from '@/pages/coletas/OrdemCarregamento';
import FluxoTrabalho from '@/pages/coletas/FluxoTrabalho';
import Aprovacoes from '@/pages/coletas/Aprovacoes';
import Alocacao from '@/pages/coletas/Alocacao';
import Execucao from '@/pages/coletas/Execucao';

// Armazenagem Pages
import Armazenagem from '@/pages/armazenagem/Armazenagem';
import ArmazenagemDashboard from '@/pages/armazenagem/Dashboard';
import ArmazenagemConferencia from '@/pages/armazenagem/Conferencia';
import ArmazenagemChecklist from '@/pages/armazenagem/Checklist';
import RecebimentoOverview from '@/pages/armazenagem/RecebimentoOverview';
import NotasFiscaisEntrada from '@/pages/armazenagem/NotasFiscaisEntrada';
import EntradaNotasRefatorada from '@/pages/armazenagem/recebimento/EntradaNotasRefatorada';
import GeracaoEtiquetas from '@/pages/armazenagem/GeracaoEtiquetas';
import MovimentacoesInternas from '@/pages/armazenagem/MovimentacoesInternas';
import Carregamento from '@/pages/armazenagem/Carregamento';
import Enderecamento from '@/pages/armazenagem/movimentacoes/Enderecamento';
import Unitizacao from '@/pages/armazenagem/movimentacoes/Unitizacao';
import Rastreamento from '@/pages/armazenagem/Rastreamento';
import EditarNotaFiscal from '@/pages/armazenagem/EditarNotaFiscal';
import RecebimentoRecebimento from '@/pages/armazenagem/recebimento/RecebimentoRecebimento';

// Carregamento Pages
import CarregamentoIndex from '@/pages/armazenagem/CarregamentoIndex';
import OrdemCarregamento from '@/pages/armazenagem/OrdemCarregamento';
import SeparacaoCarregamento from '@/pages/armazenagem/carregamento/SeparacaoCarregamento';
import ConferenciaCarregamento from '@/pages/armazenagem/ConferenciaCarregamento';
import EnderecamentoCaminhao from '@/pages/armazenagem/carregamento/EnderecamentoCaminhao';
import ChecklistCarregamento from '@/pages/armazenagem/ChecklistCarregamento';
import ExpedicaoCarregamento from '@/pages/armazenagem/carregamento/ExpedicaoCarregamento';
import FilaX from '@/components/armazenagem/FilaX';

// Marketplace Pages
import MarketplaceDashboard from '@/pages/marketplace/MarketplaceDashboard';
import CriacaoOrdem from '@/pages/marketplace/CriacaoOrdem';
import MonitoramentoRotas from '@/pages/marketplace/MonitoramentoRotas';
import VehicleAllocation from '@/pages/marketplace/VehicleAllocation';

// Motoristas Pages
import CadastroMotoristas from '@/pages/motoristas/CadastroMotoristas';
import CargasMotoristas from '@/pages/motoristas/CargasMotoristas';

// Expedição Pages
import Remessas from '@/pages/expedicao/Remessas';
import Faturamento from '@/pages/expedicao/Faturamento';
import EmissaoDocumentos from '@/pages/expedicao/EmissaoDocumentos';
import ProdutosPerigosos from '@/pages/expedicao/ProdutosPerigosos';

// Empresas Pages
import CadastroEmpresas from '@/pages/empresas/CadastroEmpresas';

// Usuários Pages
import CadastroUsuarios from '@/pages/usuarios/CadastroUsuarios';
import { UserManagement } from '@/pages/admin/UserManagement';

// Configurações Pages
import ConfiguracoesPage from '@/pages/configuracoes/ConfiguracoesPage';

// Relatórios Pages
import ReportsDashboard from '@/pages/relatorios/ReportsDashboard';

export const SimpleRouter = () => {
  const [location] = useLocation();
  const { user } = useAuth();

  // Simple path matching
  const path = location.split('?')[0]; // Remove query params for matching

  switch (path) {
    // Rotas públicas (não requerem autenticação)
    case '/':
      return <LandingPrincipalAtualizada />;
    case '/home':
      return <Home />;
    case '/sistema':
      return <PublicRoute><Index /></PublicRoute>;
    case '/landing':
      return <PublicRoute><LandingSegmentada /></PublicRoute>;
    case '/landing-antiga':
      return <PublicRoute><LandingPage /></PublicRoute>;
    case '/login':
      return <LoginPageClient />;
    case '/auth':
      return <LoginPageClient />;
    case '/reset-password':
      return <PublicRoute><ResetPasswordPage /></PublicRoute>;
    
    // Rotas protegidas (requerem autenticação)
    case '/dashboard':
      return <ProtectedRoute><DashboardOtimizado /></ProtectedRoute>;
    case '/profile':
      return <ProtectedRoute><UserProfilePage /></ProtectedRoute>;
    case '/orientacao':
      return <ProtectedRoute><OrientacaoSistema /></ProtectedRoute>;
    
    // Cliente Routes
    case '/cliente/dashboard':
      return <ClienteRoute><ClienteDashboard /></ClienteRoute>;
    
    // Fornecedor Routes
    case '/fornecedor/dashboard':
      return <FornecedorRoute><FornecedorDashboard /></FornecedorRoute>;
    
    // Admin Routes (somente super_admin)
    case '/admin':
      return <AdminRoute><SuperAdminDashboard /></AdminRoute>;
    case '/admin/dashboard':
      return <AdminRoute><SuperAdminDashboard /></AdminRoute>;
    case '/admin/cobrancas':
      return <AdminRoute><GestaoCobrancas /></AdminRoute>;
    case '/admin/dados':
      return <AdminRoute><GestaoDados /></AdminRoute>;
    case '/admin/logs-auditoria':
      return <AdminRoute><LogsAuditoria /></AdminRoute>;
    case '/admin/suporte':
      return <AdminRoute><Chamados /></AdminRoute>;
    case '/admin/clientes':
      return <AdminRoute><AdminClientes /></AdminRoute>;
    case '/admin/notas-fiscais-servico':
      return <AdminRoute><NotasFiscaisServico /></AdminRoute>;
    case '/admin/visualizacao-ampla':
      return <AdminRoute><VisualizacaoAmpla /></AdminRoute>;
    case '/admin/seguranca':
      return <AdminRoute><GestaoSeguranca /></AdminRoute>;
    case '/admin/notificacoes':
      return <AdminRoute><GestaoNotificacoes /></AdminRoute>;
    case '/admin/financeiro':
      return <AdminRoute><FinanceiroDashboard /></AdminRoute>;
    case '/admin/financeiro/recebimentos':
      return <Recebimentos />;
    case '/admin/financeiro/notas-fiscais':
      return <NotasFiscais />;
    
    // Super Admin Routes (somente super_admin)
    case '/admin/empresas':
      return <AdminRoute><GestaoEmpresas /></AdminRoute>;
    case '/admin/pacotes':
      return <AdminRoute><PacotesAdmin /></AdminRoute>;
    case '/admin/aprovacao-transportadores':
      return <AdminRoute><AprovacaoTransportadores /></AdminRoute>;
    case '/admin/relatorios':
      return <AdminRoute><Relatorios /></AdminRoute>;
    case '/admin/configuracoes':
      return <AdminRoute><Configuracoes /></AdminRoute>;
    case '/admin/email-config':
      return <AdminRoute><EmailConfigPage /></AdminRoute>;
    case '/admin/logs':
      return <AdminRoute><Logs /></AdminRoute>;
    case '/admin/apresentacao-comercial':
      return <AdminRoute><ApresentacaoComercial /></AdminRoute>;
    case '/admin/teste-acesso':
      return <AdminRoute><TesteAcessoControl /></AdminRoute>;
    case '/admin/usuarios':
      return <AdminRoute><UserManagement /></AdminRoute>;
    
    // Configuration Routes (Transportador ou superior)
    case '/configuracao':
      return <TransportadorRoute><NovaConfiguracao /></TransportadorRoute>;
    case '/configuracao/matriz':
      return <TransportadorRoute><NovaConfiguracao /></TransportadorRoute>;
    
    // Gamification Routes (requer autenticação)
    case '/conquistas':
      return <ProtectedRoute><AchievementDashboard /></ProtectedRoute>;
    case '/gamification':
      return <ProtectedRoute><AchievementDashboard /></ProtectedRoute>;
    
    // SAC Routes (requer autenticação)
    case '/sac':
      return <ProtectedRoute><SACDashboard /></ProtectedRoute>;
    case '/sac/atendimentos':
      return <ProtectedRoute><Atendimentos /></ProtectedRoute>;
    case '/sac/chamados':
      return <ProtectedRoute><Chamados /></ProtectedRoute>;
    case '/sac/ocorrencias':
      return <ProtectedRoute><Ocorrencias /></ProtectedRoute>;
    
    // Coletas Routes (Transportador ou superior)
    case '/coletas':
      return <TransportadorRoute><ColetasWorkflow /></TransportadorRoute>;
    case '/coletas/fluxo-trabalho':
      return <TransportadorRoute><FluxoTrabalho /></TransportadorRoute>;
    case '/coletas/solicitacoes':
      return <TransportadorRoute><SolicitacoesColeta /></TransportadorRoute>;
    case '/coletas/nova-ordem':
      return <TransportadorRoute><OrdemCarregamentoColetas /></TransportadorRoute>;
    case '/coletas/aprovacoes':
      return <TransportadorRoute><Aprovacoes /></TransportadorRoute>;
    case '/coletas/alocacao':
      return <TransportadorRoute><Alocacao /></TransportadorRoute>;
    case '/coletas/alocacao-veiculos':
      return <TransportadorRoute><AlocacaoVeiculos /></TransportadorRoute>;
    case '/coletas/execucao':
      return <TransportadorRoute><Execucao /></TransportadorRoute>;
    case '/coletas/historico-aprovacoes':
      return <TransportadorRoute><Aprovacoes /></TransportadorRoute>;
    case '/coletas/frota':
      return <TransportadorRoute><Alocacao /></TransportadorRoute>;
    case '/coletas/rastreamento':
      return <TransportadorRoute><Execucao /></TransportadorRoute>;
    
    // Armazenagem Routes (Transportador ou superior)
    case '/armazenagem':
      return <TransportadorRoute><RecebimentoOverview /></TransportadorRoute>;
    case '/armazenagem/dashboard':
      return <TransportadorRoute><RecebimentoOverview /></TransportadorRoute>;
    case '/armazenagem/conferencia':
      return <TransportadorRoute><ArmazenagemConferencia /></TransportadorRoute>;
    case '/armazenagem/checklist':
      return <TransportadorRoute><ArmazenagemChecklist /></TransportadorRoute>;
    case '/armazenagem/recebimento':
      return <TransportadorRoute><RecebimentoOverview /></TransportadorRoute>;
    case '/armazenagem/recebimento/notas':
      return <TransportadorRoute><NotasFiscaisEntrada /></TransportadorRoute>;
    case '/armazenagem/recebimento/ordemrecebimento':
      return <TransportadorRoute><RecebimentoRecebimento /></TransportadorRoute>;
    case '/armazenagem/recebimento/ordens-recebimento':
      // Redirecionamento para a rota correta
      window.location.replace('/armazenagem/recebimento/ordemrecebimento');
      return <TransportadorRoute><RecebimentoRecebimento /></TransportadorRoute>;
    case '/armazenagem/recebimento/notas-reutilizavel':
      return <TransportadorRoute><EntradaNotasRefatorada /></TransportadorRoute>;
    case '/armazenagem/notas-fiscais-entrada':
      return <TransportadorRoute><NotasFiscaisEntrada /></TransportadorRoute>;
    case '/armazenagem/editar-nota-fiscal':
      return <TransportadorRoute><EditarNotaFiscal /></TransportadorRoute>;
    case '/armazenagem/recebimento/etiquetas':
      return <TransportadorRoute><GeracaoEtiquetas /></TransportadorRoute>;
    case '/armazenagem/geracao-etiquetas':
      return <TransportadorRoute><GeracaoEtiquetas /></TransportadorRoute>;
    case '/armazenagem/movimentacoes':
      return <TransportadorRoute><MovimentacoesInternas /></TransportadorRoute>;
    case '/armazenagem/movimentacoes/enderecamento':
      return <TransportadorRoute><Enderecamento /></TransportadorRoute>;
    case '/armazenagem/movimentacoes/unitizacao':
      return <TransportadorRoute><Unitizacao /></TransportadorRoute>;
    case '/armazenagem/rastreamento':
      return <TransportadorRoute><Rastreamento /></TransportadorRoute>;
    case '/armazenagem/carregamento':
      return <TransportadorRoute><CarregamentoIndex /></TransportadorRoute>;
    case '/armazenagem/ordem-carregamento':
      return <TransportadorRoute><OrdemCarregamento /></TransportadorRoute>;
    case '/armazenagem/carregamento/ordem':
      return <TransportadorRoute><OrdemCarregamento /></TransportadorRoute>;
    case '/armazenagem/carregamento/separacao':
      return <SeparacaoCarregamento />;
    case '/armazenagem/carregamento/conferencia':
      return <ConferenciaCarregamento />;
    case '/armazenagem/carregamento/enderecamento':
      return <EnderecamentoCaminhao />;
    case '/armazenagem/posicionamento':
      return <Enderecamento />;
    case '/armazenagem/carregamento/checklist':
      return <ChecklistCarregamento />;
    case '/armazenagem/carregamento/expedicao':
      return <ExpedicaoCarregamento />;
    case '/armazenagem/fila-x':
      return <FilaX />;
    
    // Carregamento Routes (standalone module)
    case '/carregamento':
      return <CarregamentoIndex />;
    
    // Marketplace Routes (Transportador ou superior)
    case '/marketplace':
      return <TransportadorRoute><MarketplaceDashboard /></TransportadorRoute>;
    case '/marketplace/nova-ordem':
      return <TransportadorRoute><CriacaoOrdem /></TransportadorRoute>;
    case '/marketplace/criacao-ordem':
      return <TransportadorRoute><CriacaoOrdem /></TransportadorRoute>;
    case '/marketplace/monitoramento':
      return <TransportadorRoute><MonitoramentoRotas /></TransportadorRoute>;
    case '/marketplace/alocacao-veiculos':
      return <TransportadorRoute><VehicleAllocation /></TransportadorRoute>;
    
    // Motoristas Routes
    case '/motoristas':
      return <CadastroMotoristas />;
    case '/motoristas/cargas':
      return <CargasMotoristas />;
    
    // Expedição Routes
    case '/expedicao/remessas':
      return <Remessas />;
    case '/expedicao/faturamento':
      return <Faturamento />;
    case '/expedicao/documentos':
      return <EmissaoDocumentos />;
    case '/expedicao/emissao-documentos':
      return <EmissaoDocumentos />;
    case '/expedicao/produtos-perigosos':
      return <ProdutosPerigosos />;
    
    // Empresas Routes (Transportador ou superior)
    case '/empresas':
      return <TransportadorRoute><CadastroEmpresas /></TransportadorRoute>;
    
    // Usuários Routes (Transportador ou superior)
    case '/usuarios':
      return <TransportadorRoute><CadastroUsuarios /></TransportadorRoute>;
    
    // Configurações Routes (Transportador ou superior)
    case '/configuracoes':
      return <TransportadorRoute><NovaConfiguracao /></TransportadorRoute>;
    case '/configuracoes/informacoes-empresa':
      return <TransportadorRoute><InformacoesEmpresa /></TransportadorRoute>;
    
    // Relatórios Routes (requer autenticação)
    case '/relatorios':
      return <ProtectedRoute><ReportsDashboard /></ProtectedRoute>;
    
    // Super Admin Routes - removed duplicate /admin route
    
    // User Redirect (for authenticated users without specific route)
    case '/redirect':
      return <UserRedirect />;
    

    
    default:
      return <NotFound />;
  }
};