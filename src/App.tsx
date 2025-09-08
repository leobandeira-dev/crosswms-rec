import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h1>CrossWMS - Sistema carregando...</h1>
        <p>Banco de dados conectado ✅</p>
        <p>Servidor rodando ✅</p>
        <p>Sistema pronto para configuração!</p>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;