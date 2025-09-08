
import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/types/supabase/usuario.types";

export interface UserWithProfile {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  avatar_url?: string;
}

/**
 * Fetches all users with their profiles from Supabase
 */
export const fetchUsers = async (): Promise<UserWithProfile[]> => {
  // Use the 'perfis' table which contains all user profiles
  const { data, error } = await supabase
    .from('perfis')
    .select(`
      id,
      nome,
      email,
      funcao,
      avatar_url
    `);

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  // Ensure we get data back
  if (!data) {
    console.log('No users found');
    return [];
  }

  console.log('Fetched users:', data.length);

  return data.map(user => {
    // Set user with leonardobandeir@gmail.com as administrator
    const perfil = user.email === 'leonardobandeir@gmail.com' 
      ? 'Administrador' 
      : user.funcao || 'N/A';
      
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      perfil: perfil,
      avatar_url: user.avatar_url
    };
  });
};

/**
 * Checks if the current user has permission to manage user permissions
 * Only admins and managers can manage permissions
 */
export const hasPermissionManagement = (userRole?: string): boolean => {
  const allowedRoles = ['Administrador', 'Gerente', 'admin', 'gerente', 'administrador'];
  return allowedRoles.includes(userRole || '');
};

/**
 * Fetches a comprehensive list of users with additional details
 */
export const fetchComprehensiveUsersList = async () => {
  try {
    const { data: profiles, error } = await supabase
      .from('perfis')
      .select(`
        id,
        nome,
        email,
        funcao,
        avatar_url,
        empresa_id,
        ultimo_login
      `);

    if (error) {
      console.error('Error fetching comprehensive users list:', error);
      throw error;
    }

    // Get companies info to match with users
    const { data: empresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nome_fantasia, cnpj');

    if (empresasError) {
      console.error('Error fetching companies:', empresasError);
    }

    // Map users with company information, ensuring leonardobandeir@gmail.com is an administrator
    return profiles.map(profile => {
      const empresa = empresas?.find(e => e.id === profile.empresa_id) || { nome_fantasia: 'N/A', cnpj: 'N/A' };
      // Set user with leonardobandeir@gmail.com as administrator
      const perfil = profile.email === 'leonardobandeir@gmail.com' ? 'Administrador' : profile.funcao;
      
      return {
        id: profile.id,
        nome: profile.nome,
        email: profile.email,
        empresa: empresa.nome_fantasia,
        cnpj: empresa.cnpj,
        perfil: perfil,
        status: profile.ultimo_login ? 'ativo' : 'pendente'
      };
    });
  } catch (error) {
    console.error('Failed to fetch comprehensive users list:', error);
    return [];
  }
};
