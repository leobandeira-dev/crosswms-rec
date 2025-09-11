#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

console.log('🚀 Configurando Supabase como banco oficial');

// Configuration using environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Environment variables missing: VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupSupabase() {
  try {
    console.log('📡 Testando conexão com Supabase...');
    
    // Test the connection by trying to create a simple table
    const { data, error } = await supabase.rpc('version');
    
    if (error) {
      // Try alternative test
      console.log('Testando conexão alternativa...');
      const { error: testError } = await supabase
        .from('ordens_carga')
        .select('count')
        .limit(1);
        
      if (testError && testError.code !== 'PGRST116') { // PGRST116 = table not found, which is OK
        throw testError;
      }
    }
    
    console.log('✅ Conexão com Supabase estabelecida');

    // Insert sample data for testing
    console.log('📝 Inserindo dados de exemplo...');

    // Create sample ordem de carga
    const { data: ordem, error: ordemError } = await supabase
      .from('ordens_carga')
      .upsert([
        {
          numero_ordem: 'ORD-2025-001',
          tipo_carregamento: 'Normal',
          status: 'ativa',
          data_prevista: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          usuario_responsavel_id: crypto.randomUUID()
        },
        {
          numero_ordem: 'ORD-2025-002', 
          tipo_carregamento: 'Urgente',
          status: 'pendente',
          data_prevista: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          usuario_responsavel_id: crypto.randomUUID()
        }
      ])
      .select();

    if (ordemError) {
      console.warn('⚠️ Erro ao inserir ordens (tabela pode não existir ainda):', ordemError.message);
    } else {
      console.log('✅ Ordens de carga inseridas:', ordem?.length || 0);
    }

    // Insert sample notas fiscais
    const { data: notas, error: notasError } = await supabase
      .from('notas_fiscais')
      .upsert([
        { numero_nf: '12345', valor: 1250.00 },
        { numero_nf: '12346', valor: 890.50 },
        { numero_nf: '12347', valor: 1850.75 }
      ])
      .select();

    if (notasError) {
      console.warn('⚠️ Erro ao inserir notas fiscais (tabela pode não existir ainda):', notasError.message);
    } else {
      console.log('✅ Notas fiscais inseridas:', notas?.length || 0);
    }

    console.log('🎉 Setup do Supabase concluído!');
    console.log('📊 O sistema agora está configurado para usar Supabase como banco oficial');

  } catch (error) {
    console.error('❌ Erro durante setup:', error);
    console.log('💡 Verifique se as tabelas existem ou se RLS está configurado corretamente');
  }
}

// Run setup
setupSupabase();