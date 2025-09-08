
import React from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading, setLoading, setUser, connectionError } = useAuthState();
  const { signIn, signUp, signOut, forgotPassword, updatePassword } = useAuthActions(setLoading, setUser);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        connectionError,
        signIn,
        signUp,
        signOut,
        forgotPassword,
        updatePassword,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
