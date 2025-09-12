
import { useState } from 'react';
// Temporary simple toast replacement
const toast = (props: any) => {
  console.log('Toast:', props.title, props.description);
};
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

export const useAuthActions = (
  setLoading: (loading: boolean) => void,
  setUser: (user: Usuario | null) => void
) => {
  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      console.log('Tentativa de login com:', email);
      
      // Sistema simplificado - aceita qualquer email/senha
      const mockUser: Usuario = {
        id: 'demo-user-123',
        email: email || 'demo@exemplo.com',
        nome: email.split('@')[0] || 'Usuário Demo',
        telefone: '(11) 99999-9999',
        avatar_url: undefined,
        empresa_id: 'demo-empresa-123',
        perfil_id: 'admin',
        status: 'ativo',
        tipo_usuario: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        empresa: {
          id: 'demo-empresa-123',
          nome: 'Empresa Demo',
          cnpj: '12.345.678/0001-90',
          inscricao_estadual: '123456789',
          endereco: 'Rua Demo, 123',
          numero: '123',
          complemento: 'Sala 1',
          bairro: 'Centro',
          cidade: 'São Paulo',
          uf: 'SP',
          cep: '01234-567',
          telefone: '(11) 3333-4444',
          email: 'contato@empresademo.com',
          website: 'https://empresademo.com',
          tipo_empresa: 'logistica',
          empresa_matriz_id: null,
          status: 'ativa',
          plano_assinatura: 'premium',
          data_vencimento: '2024-12-31',
          configuracoes: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };

      // Salvar no localStorage para persistir
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      console.log('Usuário logado (dados mock):', mockUser);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema!",
      });
      
    } catch (error: any) {
      console.error('Erro de login:', error);
      toast({
        title: "Erro de login",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string, telefone?: string, cnpj?: string): Promise<void> => {
    setLoading(true);
    try {
      console.log('Tentativa de registro com:', email);
      
      // Sistema simplificado - aceita qualquer informação de cadastro
      const mockUser: Usuario = {
        id: 'demo-user-123',
        email: email || 'demo@exemplo.com',
        nome: nome || email.split('@')[0] || 'Usuário Demo',
        telefone: telefone || '(11) 99999-9999',
        avatar_url: undefined,
        empresa_id: 'demo-empresa-123',
        perfil_id: 'admin',
        status: 'ativo',
        tipo_usuario: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        empresa: {
          id: 'demo-empresa-123',
          nome: 'Empresa Demo',
          cnpj: cnpj || '12.345.678/0001-90',
          inscricao_estadual: '123456789',
          endereco: 'Rua Demo, 123',
          numero: '123',
          complemento: 'Sala 1',
          bairro: 'Centro',
          cidade: 'São Paulo',
          uf: 'SP',
          cep: '01234-567',
          telefone: telefone || '(11) 3333-4444',
          email: email || 'contato@empresademo.com',
          website: 'https://empresademo.com',
          tipo_empresa: 'logistica',
          empresa_matriz_id: null,
          status: 'ativa',
          plano_assinatura: 'premium',
          data_vencimento: '2024-12-31',
          configuracoes: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };

      // Salvar no localStorage para persistir
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setUser(mockUser);
      console.log('Usuário cadastrado (dados mock):', mockUser);
      
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Bem-vindo ao sistema!",
      });
      
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      console.log('Fazendo logout');
      
      // Limpar dados do localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema.",
      });
      
      console.log('Usuário deslogado');
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao desconectar.",
        variant: "destructive",
      });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      // Sistema simplificado - apenas simula o envio
      console.log('Solicitação de redefinição de senha para:', email);
      
      toast({
        title: "Email enviado",
        description: "Confira sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      toast({
        title: "Erro na solicitação",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      // Sistema simplificado - apenas simula a atualização
      console.log('Atualização de senha solicitada');
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      toast({
        title: "Erro ao atualizar senha",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  return {
    signIn,
    signUp,
    signOut,
    forgotPassword,
    updatePassword
  };
};
