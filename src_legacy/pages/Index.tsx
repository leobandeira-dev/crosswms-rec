
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Always redirect to dashboard without authentication checks
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null; // Will redirect to dashboard immediately
};

export default Index;
