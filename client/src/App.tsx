import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import FilaX from '@/components/armazenagem/FilaX';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/armazenagem/fila-x" element={<FilaX />} />
        <Route path="*" element={<Navigate to="/armazenagem/fila-x" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from './components/ui/sonner';
import { queryClient } from './lib/queryClient';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import AppRoutes from './routes/AppRoutes';

function App() {
  // Sistema de verificação de versão desabilitado temporariamente
  // useVersionCheck();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
