#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

console.log('🚀 Executando schema SQL no Supabase');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read the SQL file
const sqlContent = fs.readFileSync('create-supabase-schema.sql', 'utf8');

// Split into individual statements
const statements = sqlContent
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt && !stmt.startsWith('--'));

console.log(`Executando ${statements.length} comandos SQL...`);

async function executeSQL() {
  let successCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    if (!statement) continue;
    
    try {
      console.log(`[${i+1}/${statements.length}] Executando: ${statement.substring(0, 50)}...`);
      
      // Use RPC to execute raw SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        query: statement + ';'
      });
      
      if (error) {
        console.warn(`⚠️ Aviso no comando ${i+1}: ${error.message}`);
      } else {
        successCount++;
        console.log(`✅ Comando ${i+1} executado com sucesso`);
      }
      
    } catch (err) {
      console.error(`❌ Erro no comando ${i+1}: ${err.message}`);
    }
  }
  
  console.log(`\n🎉 Schema criado! ${successCount}/${statements.length} comandos executados`);
  
  // Test the tables
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('ordens_carga')
      .select('*');
      
    if (!ordersError) {
      console.log(`✅ Tabela ordens_carga: ${orders.length} registros`);
    }

    const { data: volumes, error: volumesError } = await supabase
      .from('volumes_etiqueta')
      .select('*');
      
    if (!volumesError) {
      console.log(`✅ Tabela volumes_etiqueta: ${volumes.length} registros`);
    }
    
  } catch (err) {
    console.log('💡 Para testar as tabelas, verifique no dashboard do Supabase');
  }
}

executeSQL();