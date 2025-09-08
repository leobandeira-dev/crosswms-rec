
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Always render children without any authentication checks
  return <>{children}</>;
};
