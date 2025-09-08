
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

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
      
      // Primeiro faz login para obter token
      const response = await authService.signIn(email, password);
      console.log('Login response:', response);
      
      // Depois busca dados completos do usuário incluindo empresa
      const currentUser = await authService.getCurrentUser();
      console.log('getCurrentUser response:', currentUser);
      
      if (currentUser && currentUser.user) {
        setUser(currentUser.user);
        console.log('Usuário logado com dados completos:', currentUser.user);
        console.log('Empresa carregada:', currentUser.user.empresa);
      } else {
        setUser(response.user);
        console.log('Fallback - usuário logado (dados básicos):', response.user);
      }
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      
    } catch (error: any) {
      console.error('Erro de login:', error);
      toast({
        title: "Erro de login",
        description: error?.message || "Verifique suas credenciais e tente novamente.",
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
      
      const response = await authService.signUp(email, password, nome, telefone, cnpj);
      setUser(response.user);
      
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Bem-vindo ao sistema!",
      });
      
      console.log('Usuário cadastrado:', response.user);
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error?.message || "Verifique as informações fornecidas e tente novamente.",
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
      
      await authService.signOut();
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
        description: error?.message || "Ocorreu um erro ao desconectar.",
        variant: "destructive",
      });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await authService.forgotPassword(email);
      
      toast({
        title: "Email enviado",
        description: "Confira sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição de senha:', error);
      toast({
        title: "Erro na solicitação",
        description: error?.message || "Verifique o email fornecido e tente novamente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      await authService.updatePassword(password);
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      toast({
        title: "Erro ao atualizar senha",
        description: error?.message || "Ocorreu um erro ao atualizar sua senha.",
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
