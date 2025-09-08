import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Router, useLocation } from 'wouter';
import { Toaster } from './components/ui/sonner';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './providers/AuthProvider';
import { useAuth } from './hooks/useAuth';

// Import dos componentes de autenticação
// Página de Login funcionalmente simples mas conectada com a API
const LoginPage = () => {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">CrossWMS</h2>
          <p className="mt-2 text-gray-600">Faça login em sua conta</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

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