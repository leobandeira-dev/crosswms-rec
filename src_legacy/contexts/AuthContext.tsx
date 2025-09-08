
import React, { createContext, useContext } from 'react';
import { Usuario } from "@/types/supabase.types";
import { Session } from '@supabase/supabase-js';

type AuthContextType = {
  user: Usuario | null;
  session: Session | null;
  loading: boolean;
  connectionError: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string, telefone?: string, cnpj?: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  setUser: (user: Usuario | null) => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
  }
  return context;
};
