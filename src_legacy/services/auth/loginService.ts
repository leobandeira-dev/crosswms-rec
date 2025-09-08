
import { supabase } from "@/integrations/supabase/client";
import { SignInCredentials, AuthSession } from "./authTypes";

/**
 * Serviço para operações de login
 */
const loginService = {
  /**
   * Faz login do usuário
   */
  async signIn(credentials: SignInCredentials): Promise<AuthSession> {
    console.log('LoginService: Tentando fazer login com:', credentials.email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('LoginService: Erro ao fazer login:', error);
      throw error;
    }

    return {
      user: data.user,
      session: data.session,
    };
  },
};

export default loginService;
