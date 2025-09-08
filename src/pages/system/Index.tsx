
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log('Index page - bypassing authentication checks');
    
    if (!loading) {
      // Always redirect to dashboard regardless of authentication status
      setLocation('/dashboard');
    }
  }, [loading, setLocation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null; // Will redirect to dashboard via useEffect
};

export default Index;
