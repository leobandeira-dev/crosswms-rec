import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  telefone?: string;
  avatar_url?: string;
  empresa_id?: string;
  perfil_id?: string;
  status?: string;
  tipo_usuario?: string;
  created_at: string;
  updated_at: string;
  empresa?: {
    id: string;
    nome: string;
    cnpj: string;
    inscricao_estadual?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
    telefone?: string;
    email?: string;
    website?: string;
    tipo_empresa?: string;
    empresa_matriz_id?: string;
    status?: string;
    plano_assinatura?: string;
    data_vencimento?: string;
    configuracoes?: any;
    created_at?: string;
    updated_at?: string;
  };
}

interface Session {
  access_token: string;
}

export const useAuthState = () => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  useEffect(() => {
    // Simplificar auth state para evitar erros - sistema sem autenticação
    setLoading(false);
    setConnectionError(false);
    
    // Verificar se há token mock
    const token = localStorage.getItem('token');
    if (token === 'demo-token') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setSession({ access_token: token });
        } catch (error) {
          console.log('Erro ao parsear usuário do localStorage');
        }
      }
    }
  }, []);

  return {
    user,
    session,
    loading,
    connectionError,
    setUser,
  };
};