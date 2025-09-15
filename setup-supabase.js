import { supabaseClient, db } from './server/supabase.js';
import { schema } from './shared/schema-supabase.js';
import bcrypt from 'bcrypt';

async function setupDatabase() {
  console.log('Iniciando configuração do banco de dados no Supabase usando Drizzle...');

  try {
    // Criar empresa padrão usando Drizzle
    const [empresa] = await db.insert(schema.empresas)
      .values({
        cnpj: '00000000000000',
        razao_social: 'Empresa Padrão',
        nome_fantasia: 'Empresa Padrão',
        tipo: 'administradora',
        status: 'ativo'
      })
      .returning();

    console.log('Empresa padrão criada com sucesso:', empresa.id);

    // Criar perfil de administrador usando Drizzle
    const [perfil] = await db.insert(schema.perfis)
      .values({
        nome: 'Administrador',
        descricao: 'Perfil com acesso total ao sistema',
        ativo: true
      })
      .returning();

    console.log('Perfil de administrador criado com sucesso:', perfil.id);

    // Criar usuário super admin usando Drizzle
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const [user] = await db.insert(schema.users)
      .values({
        email: 'admin@crosswms.com',
        password: hashedPassword,
        nome: 'Administrador',
        empresa_id: empresa.id,
        perfil_id: perfil.id,
        status: 'ativo'
      })
      .returning();

    console.log('Usuário administrador criado com sucesso:', user.id);

    // Criar usuário transportador para testes usando Drizzle
    const hashedPasswordTransp = await bcrypt.hash('transporte123', 10);
    const [userTransp] = await db.insert(schema.users)
      .values({
        email: 'transporte@teste.com',
        password: hashedPasswordTransp,
        nome: 'Usuário Transportador',
        empresa_id: empresa.id,
        perfil_id: perfil.id,
        status: 'ativo'
      })
      .returning();

    console.log('Usuário transportador criado com sucesso:', userTransp.id);

    console.log('Configuração inicial do banco de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar o banco de dados:', error);
  }
}

setupDatabase();