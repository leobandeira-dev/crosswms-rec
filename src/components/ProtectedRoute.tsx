import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Usuario } from '@/types/supabase.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [],
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Se ainda está carregando, não fazer nada
    if (loading) return;

    // Se requer autenticação e não há usuário, redirecionar para login
    if (requireAuth && !user) {
      setLocation('/login');
      return;
    }

    // Se há roles específicas exigidas e o usuário não tem permissão
    if (user && allowedRoles.length > 0 && user.tipo_usuario && !allowedRoles.includes(user.tipo_usuario as string)) {
      // Redirecionar para dashboard apropriado do usuário
      switch (user.tipo_usuario) {
        case 'super_admin':
          setLocation('/admin/dashboard');
          break;
        case 'transportador':
          setLocation('/dashboard');
          break;
        case 'cliente':
          setLocation('/cliente/dashboard');
          break;
        case 'fornecedor':
          setLocation('/fornecedor/dashboard');
          break;
        default:
          setLocation('/login');
      }
      return;
    }
  }, [user, loading, setLocation, allowedRoles, requireAuth]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se requer autenticação e não há usuário, não renderizar nada (redirect já foi feito)
  if (requireAuth && !user) {
    return null;
  }

  // Se há roles específicas e usuário não tem permissão, não renderizar
  if (user && allowedRoles.length > 0 && user.tipo_usuario && !allowedRoles.includes(user.tipo_usuario)) {
    return null;
  }

  // Renderizar o componente protegido
  return <>{children}</>;
};

// Componente para rotas que NÃO requerem autenticação (landing, login, etc.)
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>;
};

// Componente para rotas administrativas
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute allowedRoles={['super_admin']}>{children}</ProtectedRoute>;
};

// Componente para rotas de transportador
export const TransportadorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute allowedRoles={['transportador', 'super_admin']}>{children}</ProtectedRoute>;
};

// Componente para rotas de cliente
export const ClienteRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute allowedRoles={['cliente']}>{children}</ProtectedRoute>;
};

// Componente para rotas de fornecedor
export const FornecedorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute allowedRoles={['fornecedor']}>{children}</ProtectedRoute>;
};