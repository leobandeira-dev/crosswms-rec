
import React from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useAuthState } from '../hooks/useAuthState';
import { useAuthActions } from '../hooks/useAuthActions';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authState = useAuthState();
  const { user, session, loading, setUser, connectionError } = authState;
  const { signIn, signUp, signOut, forgotPassword, updatePassword } = useAuthActions(
    (loadingState: boolean) => {}, // Mock setLoading function
    setUser
  );

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
