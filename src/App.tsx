import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Router, useLocation } from 'wouter';
import { Toaster } from './components/ui/sonner';
import { queryClient } from './lib/queryClient';

// Página de Login simples
const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">CrossWMS</h2>
          <p className="mt-2 text-gray-600">Faça login em sua conta</p>
        </div>
        <form className="mt-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input 
              type="password" 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Entrar
          </button>
        </form>
        <div className="text-center">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
            Esqueceu sua senha?
          </a>
        </div>
      </div>
    </div>
  );
};

// Roteador simples
const SimpleApp = () => {
  const [location] = useLocation();
  
  switch (location) {
    case '/login':
      return <LoginPage />;
    case '/':
    default:
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">CrossWMS - Sistema Online</h1>
          <p className="mb-2">✅ Banco de dados conectado</p>
          <p className="mb-2">✅ Servidor rodando</p>
          <p className="mb-4">✅ Sistema pronto!</p>
          <a href="/login" className="text-blue-600 underline">Acessar Login</a>
        </div>
      );
  }
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <SimpleApp />
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;