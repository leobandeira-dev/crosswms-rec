
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Usuario } from '@/types/supabase.types';
import { Session } from '@supabase/supabase-js';

export const useAuthState = () => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  useEffect(() => {
    console.log('Inicializando estado de autenticação');
    
    // Primeiro configuramos o listener de mudanças de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Evento de autenticação:', event);
        setSession(currentSession);
        
        // Convertemos o User do Supabase para nosso tipo Usuario
        if (currentSession?.user) {
          const userData = currentSession.user;
          const usuarioData: Usuario = {
            id: userData.id,
            email: userData.email || '',
            nome: userData.user_metadata?.nome || userData.user_metadata?.name || userData.email || '',
            telefone: userData.user_metadata?.telefone,
            avatar_url: userData.user_metadata?.avatar_url,
            empresa_id: userData.user_metadata?.empresa_id,
            perfil_id: userData.user_metadata?.perfil_id,
            status: userData.user_metadata?.status,
            created_at: userData.created_at || new Date().toISOString(),
            updated_at: userData.updated_at || new Date().toISOString(),
            funcao: userData.user_metadata?.funcao
          };
          setUser(usuarioData);
        } else {
          setUser(null);
        }
      }
    );
    
    // Depois verificamos a sessão atual
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      // Convertemos o User do Supabase para nosso tipo Usuario
      if (currentSession?.user) {
        const userData = currentSession.user;
        const usuarioData: Usuario = {
          id: userData.id,
          email: userData.email || '',
          nome: userData.user_metadata?.nome || userData.user_metadata?.name || userData.email || '',
          telefone: userData.user_metadata?.telefone,
          avatar_url: userData.user_metadata?.avatar_url,
          empresa_id: userData.user_metadata?.empresa_id,
          perfil_id: userData.user_metadata?.perfil_id,
          status: userData.user_metadata?.status,
          created_at: userData.created_at || new Date().toISOString(),
          updated_at: userData.updated_at || new Date().toISOString(),
          funcao: userData.user_metadata?.funcao
        };
        setUser(usuarioData);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    }).catch(error => {
      console.error('Erro ao verificar sessão:', error);
      setConnectionError(true);
      setLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { 
    user, 
    session, 
    setUser, 
    loading, 
    setLoading, 
    connectionError 
  };
};
