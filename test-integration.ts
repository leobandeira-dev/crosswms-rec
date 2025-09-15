// Precisamos usar ts-node para executar este script
// Execute com: npx ts-node test-integration.js

import { supabaseClient, db } from './server/supabase';
import { schema } from './shared/schema-supabase';
import { getAll, getById, insert, update, remove } from './server/supabase-db';

async function testIntegration() {
  console.log('Iniciando testes de integração Drizzle-Supabase...');

  try {
    // Teste 1: Buscar todos os usuários usando a função genérica
    console.log('\nTeste 1: Buscar todos os usuários');
    const usersResult = await getAll('users');
    console.log(`Usuários encontrados: ${usersResult.data?.length || 0}`);

    // Teste 2: Buscar empresa por ID
    console.log('\nTeste 2: Buscar empresa por ID');
    if (usersResult.data && usersResult.data.length > 0) {
      const empresaId = usersResult.data[0].empresa_id;
      const empresaResult = await getById('empresas', empresaId);
      console.log('Empresa encontrada:', empresaResult.data ? 'Sim' : 'Não');
    }

    // Teste 3: Inserir um novo registro usando Drizzle
    console.log('\nTeste 3: Inserir um novo perfil');
    const insertResult = await insert('perfis', {
      nome: 'Perfil de Teste',
      descricao: 'Perfil criado para teste de integração',
      ativo: true
    });
    console.log('Perfil inserido:', insertResult.data ? 'Sim' : 'Não');
    
    // Guardar o ID do perfil inserido para os próximos testes
    const perfilId = insertResult.data?.[0]?.id;

    if (perfilId) {
      // Teste 4: Atualizar o registro inserido
      console.log('\nTeste 4: Atualizar perfil');
      const updateResult = await update('perfis', perfilId, {
        descricao: 'Perfil atualizado pelo teste de integração'
      });
      console.log('Perfil atualizado:', updateResult.data ? 'Sim' : 'Não');

      // Teste 5: Remover o registro
      console.log('\nTeste 5: Remover perfil');
      const removeResult = await remove('perfis', perfilId);
      console.log('Perfil removido:', removeResult.success ? 'Sim' : 'Não');
    }

    // Teste 6: Verificar conexão direta com Supabase
    console.log('\nTeste 6: Verificar conexão direta com Supabase');
    const { data: supabaseData, error: supabaseError } = await supabaseClient
      .from('users')
      .select('*')
      .limit(1);
    console.log('Conexão direta com Supabase:', supabaseError ? 'Falhou' : 'Sucesso');

    // Teste 7: Verificar consulta direta com Drizzle
    console.log('\nTeste 7: Verificar consulta direta com Drizzle');
    const drizzleUsers = await db.query.users.findMany({
      limit: 1
    });
    console.log('Consulta direta com Drizzle:', drizzleUsers.length > 0 ? 'Sucesso' : 'Falhou');

    console.log('\nTestes de integração concluídos com sucesso!');
  } catch (error) {
    console.error('Erro durante os testes de integração:', error);
  } finally {
    // Encerrar conexões
    process.exit(0);
  }
}

testIntegration();