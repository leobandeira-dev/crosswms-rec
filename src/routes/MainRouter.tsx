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

// Auth Pages
import CrossWMSAuthPage from '@/pages/auth/CrossWMSAuthPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// System Pages
import Index from '@/pages/system/Index';
import Home from '@/pages/system/Home';
import NotFound from '@/pages/system/NotFound';
import OrientacaoSistema from '@/pages/system/OrientacaoSistema';

// Landing Pages
import LandingSegmentada from '@/pages/landing/LandingSegmentada';
import LandingPage from '@/pages/landing/LandingPage';

// Dashboard Pages
import DashboardOtimizado from '@/pages/dashboard/DashboardOtimizado';
import UserProfilePage from '@/pages/profile/UserProfilePage';

// User-specific Dashboards
import ClienteDashboard from '@/pages/cliente/ClienteDashboard';
import FornecedorDashboard from '@/pages/fornecedor/FornecedorDashboard';
import UserRedirect from '@/components/layout/UserRedirect';

// Gamification Pages
import { AchievementDashboard } from '@/pages/gamification/AchievementDashboard';

// Import feature routes
import AdminRoutes from './features/AdminRoutes';
import ColetasRoutes from './features/ColetasRoutes';
import ArmazenagemRoutes from './features/ArmazenagemRoutes';
import ExpedicaoRoutes from './features/ExpedicaoRoutes';
import SACRoutes from './features/SACRoutes';
import CadastrosRoutes from './features/CadastrosRoutes';
import ConfiguracoesRoutes from './features/ConfiguracoesRoutes';
import RelatoriosRoutes from './features/RelatoriosRoutes';

export const MainRouter = () => {
  const [location] = useLocation();
  const { user } = useAuth();

  // Simple path matching
  const path = location.split('?')[0]; // Remove query params for matching

  // Public routes (no authentication required)
  switch (path) {
    case '/':
      return <CrossWMSAuthPage />;
    case '/home':
      return <Home />;
    case '/sistema':
      return <PublicRoute><Index /></PublicRoute>;
    case '/landing':
      return <PublicRoute><LandingSegmentada /></PublicRoute>;
    case '/landing-antiga':
      return <PublicRoute><LandingPage /></PublicRoute>;
    case '/login':
      return <CrossWMSAuthPage />;
    case '/auth':
      return <CrossWMSAuthPage />;
    case '/reset-password':
      return <PublicRoute><ResetPasswordPage /></PublicRoute>;
  }

  // Protected routes (authentication required)
  switch (path) {
    case '/dashboard':
      return <ProtectedRoute><DashboardOtimizado /></ProtectedRoute>;
    case '/profile':
      return <ProtectedRoute><UserProfilePage /></ProtectedRoute>;
    case '/orientacao':
      return <ProtectedRoute><OrientacaoSistema /></ProtectedRoute>;
    
    // User-specific routes
    case '/cliente/dashboard':
      return <ClienteRoute><ClienteDashboard /></ClienteRoute>;
    case '/fornecedor/dashboard':
      return <FornecedorRoute><FornecedorDashboard /></FornecedorRoute>;
    
    // Gamification routes
    case '/conquistas':
      return <ProtectedRoute><AchievementDashboard /></ProtectedRoute>;
    case '/gamification':
      return <ProtectedRoute><AchievementDashboard /></ProtectedRoute>;
    
    // User redirect
    case '/redirect':
      return <UserRedirect />;
  }

  // Check feature routes
  const featureRoutes = [
    ...AdminRoutes(),
    ...ColetasRoutes(),
    ...ArmazenagemRoutes(),
    ...ExpedicaoRoutes(),
    ...SACRoutes(),
    ...CadastrosRoutes(),
    ...ConfiguracoesRoutes(),
    ...RelatoriosRoutes()
  ];

  // Find matching route in feature routes
  for (const route of featureRoutes) {
    if (route.props.path === path) {
      return route;
    }
  }

  // No route found
  return <NotFound />;
};
