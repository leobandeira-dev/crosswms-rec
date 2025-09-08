
import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço para gerenciamento de sessões de autenticação
 */
const sessionService = {
  /**
   * Verifica se o usuário está autenticado
   */
  async isAuthenticated() {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('SessionService: Verificação de autenticação retornou', !!session);
    return !!session;
  },

  /**
   * Faz logout do usuário
   */
  async signOut() {
    console.log('Tentando fazer logout');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erro no logout:', error);
      throw new Error(error.message);
    }

    console.log('Logout realizado com sucesso');
    return true;
  },
};

export default sessionService;
