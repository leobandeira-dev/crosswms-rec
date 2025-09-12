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