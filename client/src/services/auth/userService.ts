
import { supabase } from "@/integrations/supabase/client";
import { Usuario } from "@/types/supabase.types";

/**
 * Service for user-related operations - frontend only mock
 */
const userService = {
  /**
   * Retorna o usuário atual
   */
  async getCurrentUser(): Promise<Usuario | null> {
    console.log('UserService: Checking current user in frontend-only mode');
    
    // Check if there's a stored user in localStorage
    const storedUser = localStorage.getItem('mockUser');
    if (!storedUser) {
      console.log('UserService: No authenticated user found');
      return null;
    }
    
    try {
      const userData = JSON.parse(storedUser);
      console.log('UserService: User found in localStorage:', userData);
      return userData as Usuario;
    } catch (error) {
      console.error('UserService: Error parsing stored user:', error);
      localStorage.removeItem('mockUser');
      return null;
    }
  },
};

export default userService;
