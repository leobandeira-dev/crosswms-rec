#!/usr/bin/env node

// Script para configurar o banco de dados e criar usuário de teste
import { storage } from './server/storage.js';
import { v4 as uuidv4 } from 'uuid';

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados...');

    // 1. Criar empresa padrão
    console.log('📊 Criando empresa padrão...');
    const empresa = await storage.createEmpresa({
      id: uuidv4(),
      nome: "CrossWMS Demo",
      tipo_empresa: "matriz",
      cnpj: "00.000.000/0001-00",
      endereco: "Rua Demo, 123",
      cidade: "São Paulo",
      uf: "SP",
      cep: "01000-000",
      telefone: "(11) 99999-9999",
      email: "contato@crosswms.com.br",
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log('✅ Empresa criada:', empresa.nome);

    // 2. Criar perfil administrador
    console.log('👤 Criando perfil administrador...');
    const perfil = await storage.createPerfil({
      id: uuidv4(),
      nome: "Super Administrador",
      tipo_perfil: "super_admin",
      descricao: "Acesso total ao sistema",
      nivel_hierarquia: 1,
      empresa_id: empresa.id,
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log('✅ Perfil criado:', perfil.nome);

    // 3. Verificar se usuário já existe
    console.log('🔍 Verificando usuário existente...');
    const existingUser = await storage.getUserByEmail("admin@crosswms.com.br");
    
    if (!existingUser) {
      // 4. Criar usuário administrador
      console.log('👨‍💼 Criando usuário administrador...');
      const hashedPassword = await storage.hashPassword("123456");
      const user = await storage.createUser({
        id: uuidv4(),
        email: "admin@crosswms.com.br",
        password: hashedPassword,
        nome: "Administrador do Sistema",
        telefone: "(11) 99999-9999",
        empresa_id: empresa.id,
        perfil_id: perfil.id,
        tipo_usuario: "super_admin",
        status: "ativo",
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('✅ Usuário administrador criado:', user.email);
    } else {
      console.log('ℹ️ Usuário administrador já existe');
    }

    // 5. Criar usuário de teste para transportador
    console.log('🚛 Criando usuário transportador de teste...');
    const existingTransportador = await storage.getUserByEmail("transportador@teste.com");
    
    if (!existingTransportador) {
      const hashedPassword2 = await storage.hashPassword("123456");
      const transportador = await storage.createUser({
        id: uuidv4(),
        email: "transportador@teste.com",
        password: hashedPassword2,
        nome: "Transportador Teste",
        telefone: "(11) 88888-8888",
        empresa_id: empresa.id,
        perfil_id: perfil.id,
        tipo_usuario: "transportador",
        status: "ativo",
        created_at: new Date(),
        updated_at: new Date()
      });
      console.log('✅ Usuário transportador criado:', transportador.email);
    } else {
      console.log('ℹ️ Usuário transportador já existe');
    }

    console.log('\n🎉 Configuração do banco concluída!');
    console.log('\n📋 Credenciais de teste:');
    console.log('👨‍💼 Super Admin:');
    console.log('   Email: admin@crosswms.com.br');
    console.log('   Senha: 123456');
    console.log('\n🚛 Transportador:');
    console.log('   Email: transportador@teste.com');
    console.log('   Senha: 123456');

  } catch (error) {
    console.error('❌ Erro na configuração do banco:', error);
    process.exit(1);
  }
}

setupDatabase();
