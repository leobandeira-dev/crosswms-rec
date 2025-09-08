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
    console.log('Inicializando estado de autenticação');
    
    const initializeAuth = async () => {
      try {
        console.log('initializeAuth: Iniciando...');
        const token = authService.getToken();
        console.log('initializeAuth: Token encontrado:', !!token);
        
        if (token) {
          console.log('initializeAuth: Buscando usuário atual...');
          const currentUser = await authService.getCurrentUser();
          console.log('initializeAuth: Resposta getCurrentUser:', currentUser);
          
          if (currentUser) {
            console.log('initializeAuth: Definindo usuário:', currentUser.user);
            console.log('initializeAuth: Dados da empresa:', currentUser.user.empresa);
            setUser(currentUser.user);
            setSession({ access_token: token });
          } else {
            console.log('initializeAuth: Nenhum usuário retornado');
            setUser(null);
            setSession(null);
          }
        } else {
          console.log('initializeAuth: Nenhum token encontrado');
          setUser(null);
          setSession(null);
        }
        setConnectionError(false);
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        setConnectionError(true);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return {
    user,
    session,
    loading,
    connectionError,
    setUser,
  };
};