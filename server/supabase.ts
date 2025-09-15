import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from '../shared/schema-supabase';

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL não está definido nas variáveis de ambiente');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY não está definido nas variáveis de ambiente');
}

// Criar cliente Supabase
export const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

// Criar instância do Drizzle com o cliente Supabase
// Precisamos usar o postgres-js para conectar ao Supabase
import postgres from 'postgres';

// Criar conexão postgres-js usando a URL do Supabase
const connectionString = process.env.SUPABASE_URL?.replace('supabase', 'supabase-db');
const sql = postgres(connectionString || '', {
  max: 10,
  prepare: false,
});

// Criar instância do Drizzle com a conexão postgres-js
export const db = drizzle(sql, { schema });

// Exportar o schema para tipagem e validação
export { schema };

// Para operações que precisam do Drizzle, podemos usar o cliente Neon que já está configurado
// no arquivo db.ts quando necessário

// Função para testar a conexão com o Supabase
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseClient.from('empresas').select('*').limit(1);
    
    if (error) {
      console.error('Erro ao conectar com o Supabase:', error.message);
      return false;
    }
    
    console.log('Conexão com o Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão com o Supabase:', error);
    return false;
  }
}