
export const useRequireAuth = (redirectUrl: string = '/dashboard') => {
  // Return mock user data without any authentication checks
  return { 
    user: { id: '1', email: 'user@example.com', nome: 'Usuário' }, 
    loading: false 
  };
};
