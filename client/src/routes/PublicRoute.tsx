import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // For public routes, if user is already authenticated,
  // redirect them to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise render the public page
  return <>{children}</>;
};
