import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Router, useLocation } from 'wouter';
import { Toaster } from './components/ui/sonner';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from '../client/src/providers/AuthProvider';
import { useAuth } from '../client/src/hooks/useAuth';

// Import dos componentes de autenticação
const LoginPage = React.lazy(() => import('../client/src/pages/LoginPage'));

// Componente para verificar autenticação
const AuthCheck = () => {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, mostrar login
  if (!user) {
    return (
      <React.Suspense fallback={<div>Carregando...</div>}>
        <LoginPage />
      </React.Suspense>
    );
  }

  // Se está logado, mostrar dashboard
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">CrossWMS - Dashboard</h1>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800 font-medium">✅ Login realizado com sucesso!</p>
        <p className="text-green-700">Bem-vindo, {user.nome}!</p>
        {user.empresa && (
          <p className="text-green-700 text-sm">Empresa: {user.empresa.nome}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-900">Sistema</h3>
          <p className="text-sm text-gray-600">✅ Banco conectado</p>
          <p className="text-sm text-gray-600">✅ APIs funcionais</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-900">Usuário</h3>
          <p className="text-sm text-gray-600">Email: {user.email}</p>
          <p className="text-sm text-gray-600">Status: {user.status || 'Ativo'}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-900">Ações</h3>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 text-sm hover:underline"
          >
            Logout (Recarregar)
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AuthCheck />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;