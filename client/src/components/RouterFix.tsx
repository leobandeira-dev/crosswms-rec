import React from 'react';
import { useLocation } from 'wouter';

// Simple navigation hook to replace React Router usage
export const useNavigate = () => {
  const [, setLocation] = useLocation();
  return setLocation;
};

// Router fix component to resolve context errors
export const RouterFix: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default RouterFix;