
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from './useAuth';

export const useRequireAuth = (redirectUrl: string = '/login') => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation(redirectUrl);
    }
  }, [user, loading, setLocation, redirectUrl]);

  return { user, loading };
};
