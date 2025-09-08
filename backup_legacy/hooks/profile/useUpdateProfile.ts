
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface UpdateProfileData {
  nome?: string;
  telefone?: string;
  avatar_url?: string;
}

export const useUpdateProfile = () => {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const updateProfile = async (data: UpdateProfileData) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    setIsLoading(true);
    try {
      // In frontend-only mode, just update the local user object
      const updatedUser = {
        ...user,
        nome: data.nome || user.nome,
        telefone: data.telefone || user.telefone,
        avatar_url: data.avatar_url || user.avatar_url,
        updated_at: new Date().toISOString()
      };
      
      // Update localStorage to persist the changes
      localStorage.setItem('mockUser', JSON.stringify(updatedUser));
      
      // Update the user in the auth context
      setUser(updatedUser);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: "Ocorreu um erro ao atualizar suas informações.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    isLoading
  };
};
