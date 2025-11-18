
import { Router } from 'wouter';
import { SimpleRouter } from '@/components/SimpleRouter';

const AppRoutes = () => {
  // Garante que todas as navegações considerem o prefixo definido em Vite (BASE_URL)
  const base = import.meta.env.BASE_URL || '/';

  return (
    <Router base={base}>
      <SimpleRouter />
    </Router>
  );
};

export default AppRoutes;
