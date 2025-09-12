import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { Usuario } from '../types/supabase.types';

interface Session {
  access_token: string;
}

export const useAuthState = () => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  useEffect(() => {
    // Sistema simplificado - sempre tenta carregar usuário do localStorage
    setLoading(true);
    setConnectionError(false);
    
    // Verificar se há dados de usuário no localStorage
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setSession({ access_token: token });
        console.log('Usuário carregado do localStorage:', userData);
      } catch (error) {
        console.log('Erro ao parsear usuário do localStorage:', error);
        // Limpar dados inválidos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setLoading(false);
  }, []);

  return {
    user,
    session,
    loading,
    connectionError,
    setUser,
  };
};