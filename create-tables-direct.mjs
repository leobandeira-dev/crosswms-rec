#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

console.log('🚀 Configurando tabelas e dados no Supabase via API');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente ausentes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('📝 Criando dados de exemplo diretamente via Supabase API...');
  
  try {
    // Test 1: Create empresa (if table exists)
    console.log('Testando inserção em empresas...');
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .upsert([{
        id: 'empresa-1',
        cnpj: '12345678901234',
        razao_social: 'TechCorp Transportes LTDA',
        nome_fantasia: 'TechCorp',
        tipo: 'cliente'
      }])
      .select();
    
    if (empresaError) {
      console.log('⚠️ Tabela empresas não existe ou precisa ser criada:', empresaError.code);
    } else {
      console.log('✅ Empresa inserida:', empresa?.length);
    }

    // Test 2: Create ordem de carga (if table exists)  
    console.log('Testando inserção em ordens_carga...');
    const { data: ordem, error: ordemError } = await supabase
      .from('ordens_carga')
      .upsert([{
        numero_ordem: 'ORD-2025-001',
        tipo_carregamento: 'Normal',
        empresa_cliente_id: 'empresa-1',
        data_prevista: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'ativa',
        usuario_responsavel_id: crypto.randomUUID()
      }])
      .select();
    
    if (ordemError) {
      console.log('⚠️ Tabela ordens_carga não existe ou precisa ser criada:', ordemError.code);
    } else {
      console.log('✅ Ordem criada:', ordem?.length);
    }

    // Test 3: Create nota fiscal
    console.log('Testando inserção em notas_fiscais...');
    const { data: nota, error: notaError } = await supabase
      .from('notas_fiscais')
      .upsert([{
        numero: '12345', // Using 'numero' not 'numero_nf' as per schema
        empresa_id: 'empresa-1',
        valor_total: 1250.00
      }])
      .select();
      
    if (notaError) {
      console.log('⚠️ Tabela notas_fiscais não existe ou precisa ser criada:', notaError.code);
    } else {
      console.log('✅ Nota fiscal criada:', nota?.length);
    }

    // Test 4: Create volume
    console.log('Testando inserção em volumes_etiqueta...');
    const { data: volume, error: volumeError } = await supabase
      .from('volumes_etiqueta')
      .upsert([{
        codigo_etiqueta: 'VOL-001-2025',
        nota_fiscal_id: nota?.[0]?.id || 'dummy-nota-id',
        peso: 5.2, // Using 'peso' not 'peso_kg' as per schema  
        empresa_id: 'empresa-1'
      }])
      .select();
      
    if (volumeError) {
      console.log('⚠️ Tabela volumes_etiqueta não existe ou precisa ser criada:', volumeError.code);
    } else {
      console.log('✅ Volume criado:', volume?.length);
    }

    // Test 5: Create item de carga to link ordem and nota fiscal
    console.log('Testando inserção em itens_carga...');
    const { data: item, error: itemError } = await supabase
      .from('itens_carga')
      .upsert([{
        ordem_carga_id: ordem?.[0]?.id || 'dummy-ordem-id',
        nota_fiscal_id: nota?.[0]?.id || 'dummy-nota-id',
        quantidade: 1
      }])
      .select();
      
    if (itemError) {
      console.log('⚠️ Tabela itens_carga não existe ou precisa ser criada:', itemError.code);
    } else {
      console.log('✅ Item de carga criado:', item?.length);
    }

    console.log('\n🎯 Resultado do teste:');
    console.log('Se todas as tabelas existissem, os dados estariam prontos!');
    console.log('Se algumas tabelas não existem, elas precisam ser criadas no SQL Editor do Supabase.');

  } catch (error) {
    console.error('❌ Erro durante setup:', error);
  }
}

setupDatabase();