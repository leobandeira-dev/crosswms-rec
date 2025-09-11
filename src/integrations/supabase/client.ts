
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase.types';

// Usando variáveis de ambiente para maior segurança
// Note: Use import.meta.env no frontend do Vite
const SUPABASE_URL = import.meta.env.SUPABASE_URL || "https://lxxslzdxzjoiptacurgn.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4eHNsemR4empvaXB0YWN1cmduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MDQ0MDgsImV4cCI6MjA2MzA4MDQwOH0.WwtwUP862S8yMKglJ93wzCCyPT0Cp_5ZD0dMxJYmas8";

// Validação das variáveis de ambiente
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Variáveis de ambiente SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias');
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
