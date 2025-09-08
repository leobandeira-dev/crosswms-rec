import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

const UserRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && user) {
      // Redirecionar baseado no tipo de usuário
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
    } else if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0098DA] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default UserRedirect;