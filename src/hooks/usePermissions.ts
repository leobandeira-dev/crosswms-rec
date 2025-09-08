import { useAuth } from '@/hooks/useAuth';

export type UserType = 'super_admin' | 'transportador' | 'cliente' | 'fornecedor';

export interface PermissionConfig {
  allowedUserTypes: UserType[];
}

// Configuração de permissões por rota
export const routePermissions: Record<string, PermissionConfig> = {
  // Super Admin - acesso total
  '/admin': { allowedUserTypes: ['super_admin'] },
  '/admin/empresas': { allowedUserTypes: ['super_admin'] },
  '/admin/pacotes': { allowedUserTypes: ['super_admin'] },
  '/admin/aprovacao-transportadores': { allowedUserTypes: ['super_admin'] },
  
  // Transportador - operações logísticas
  '/dashboard': { allowedUserTypes: ['transportador'] },
  '/armazenagem': { allowedUserTypes: ['transportador'] },
  '/coletas': { allowedUserTypes: ['transportador'] },
  '/carregamento': { allowedUserTypes: ['transportador'] },
  '/configuracoes': { allowedUserTypes: ['transportador'] },
  '/relatorios': { allowedUserTypes: ['transportador'] },
  
  // Cliente - portal do cliente
  '/cliente/dashboard': { allowedUserTypes: ['cliente'] },
  '/cliente/solicitacoes': { allowedUserTypes: ['cliente'] },
  '/cliente/acompanhamento': { allowedUserTypes: ['cliente'] },
  '/cliente/documentos': { allowedUserTypes: ['cliente'] },
  
  // Fornecedor - portal do fornecedor
  '/fornecedor/dashboard': { allowedUserTypes: ['fornecedor'] },
  '/fornecedor/solicitacoes': { allowedUserTypes: ['fornecedor'] },
  '/fornecedor/documentacao': { allowedUserTypes: ['fornecedor'] },
  '/fornecedor/comunicacao': { allowedUserTypes: ['fornecedor'] },
  
  // Páginas comuns
  '/orientacoes': { allowedUserTypes: ['super_admin', 'transportador', 'cliente', 'fornecedor'] },
  '/perfil': { allowedUserTypes: ['super_admin', 'transportador', 'cliente', 'fornecedor'] },
};

export const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (route: string): boolean => {
    if (!user || !user.funcao) return false;
    
    const permission = routePermissions[route];
    if (!permission) return false;
    
    return permission.allowedUserTypes.includes(user.funcao as UserType);
  };

  const getDefaultRoute = (): string => {
    if (!user || !user.funcao) return '/login';
    
    switch (user.funcao) {
      case 'super_admin':
        return '/admin';
      case 'transportador':
        return '/dashboard';
      case 'cliente':
        return '/cliente/dashboard';
      case 'fornecedor':
        return '/fornecedor/dashboard';
      default:
        return '/login';
    }
  };

  const getUserTypeDisplay = (): string => {
    if (!user || !user.funcao) return '';
    
    switch (user.funcao) {
      case 'super_admin':
        return 'Super Admin';
      case 'transportador':
        return 'Transportador';
      case 'cliente':
        return 'Cliente';
      case 'fornecedor':
        return 'Fornecedor';
      default:
        return '';
    }
  };

  return {
    hasPermission,
    getDefaultRoute,
    getUserTypeDisplay,
    userType: user?.funcao as UserType,
  };
};