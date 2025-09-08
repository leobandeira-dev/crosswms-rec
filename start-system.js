#!/usr/bin/env node

// Script para iniciar o sistema completo
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function startSystem() {
  try {
    console.log('🚀 Iniciando sistema CrossWMS...');
    
    // 1. Executar seed do banco de dados
    console.log('📊 Executando seed do banco de dados...');
    try {
      await execAsync('npx tsx server/seed.ts');
      console.log('✅ Seed do banco executado com sucesso');
    } catch (error) {
      console.log('⚠️ Erro no seed (pode ser que já exista):', error.message);
    }
    
    // 2. Iniciar o servidor
    console.log('🌐 Iniciando servidor na porta 8080...');
    const serverProcess = exec('npm run dev:client');
    
    serverProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    serverProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    console.log('✅ Sistema iniciado! Acesse: http://localhost:8080');
    console.log('\n📋 Credenciais de teste:');
    console.log('👨‍💼 Super Admin: admin@crosswms.com.br / 123456');
    console.log('🚛 Transportador: transportador@teste.com / 123456');
    
  } catch (error) {
    console.error('❌ Erro ao iniciar sistema:', error);
    process.exit(1);
  }
}

startSystem();
