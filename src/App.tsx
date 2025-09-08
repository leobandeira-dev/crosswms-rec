import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { queryClient } from './lib/queryClient';
import CrossWMSAuthPage from './pages/CrossWMSAuthPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CrossWMSAuthPage />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;