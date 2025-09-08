
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Usuario } from '@/types/supabase.types';
import { supabase } from '@/integrations/supabase/client';

export const useAuthActions = (
  setLoading: (loading: boolean) => void,
  setUser: (user: Usuario | null) => void
) => {
  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      console.log('Tentativa de login com:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        // Tratamento específico para diferentes tipos de erro
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Email não confirmado. Por favor, verifique sua caixa de entrada e confirme seu cadastro.');
        } else {
          throw error;
        }
      }
      
      // O onAuthStateChange irá atualizar o estado do usuário
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      
      console.log('Usuário logado:', data.user);
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
      
      if (!cnpj) {
        throw new Error("CNPJ é obrigatório para cadastro");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            telefone,
            cnpj,
            funcao: 'operador', // Função padrão para novos usuários
          },
          emailRedirectTo: window.location.origin + '/auth?confirmed=true'
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Enviamos um email de confirmação para você. Por favor, verifique sua caixa de entrada e confirme seu cadastro para acessar o sistema.",
      });
      
      console.log('Usuário cadastrado:', data.user);
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
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // Limpar estado do usuário
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      
      if (error) throw error;
      
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
      const { error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) throw error;
      
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
