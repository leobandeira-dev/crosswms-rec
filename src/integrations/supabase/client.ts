
import { createClient } from '@supabase/supabase-js';

// CORREÇÃO: O projeto usa Neon (DATABASE_URL), não Supabase separado
// Por enquanto, vamos usar dados mock até configurar cliente PostgreSQL direto
console.warn('Cliente Supabase configurado mas projeto usa Neon. Usando dados mock por enquanto.');

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';  
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
