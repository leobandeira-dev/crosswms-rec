#!/usr/bin/env node

/**
 * Script para configurar Cloudflare automaticamente
 * Uso: node setup-cloudflare.js [API_TOKEN]
 */

import fetch from 'node-fetch';

const ZONE_ID = 'f8ce25942bf1b428e2f50fa66617a9ba';
const REPLIT_DOMAIN = 'd7b15c31-81fe-4823-bdd9-7694ae6b8d2c-00-ochrue1p6370.riker.replit.dev';

async function cloudflareAPI(endpoint, method = 'GET', data = null, token) {
  const url = `https://api.cloudflare.com/client/v4${endpoint}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(`API Error: ${result.errors?.map(e => e.message).join(', ')}`);
  }
  
  return result;
}

async function setupCloudflare(token) {
  console.log('Configurando Cloudflare...');

  try {
    // 1. Configurar SSL para Flexible
    console.log('1. Configurando SSL...');
    await cloudflareAPI(`/zones/${ZONE_ID}/settings/ssl`, 'PATCH', { value: 'flexible' }, token);
    console.log('   SSL configurado para Flexible');

    // 2. Listar registros DNS existentes
    console.log('2. Configurando DNS...');
    const dnsRecords = await cloudflareAPI(`/zones/${ZONE_ID}/dns_records`, 'GET', null, token);
    
    // Configurar registro WWW
    const wwwRecord = dnsRecords.result.find(r => r.name === 'www.crosswms.com.br');
    const wwwData = {
      type: 'CNAME',
      name: 'www',
      content: REPLIT_DOMAIN,
      proxied: true
    };

    if (wwwRecord) {
      await cloudflareAPI(`/zones/${ZONE_ID}/dns_records/${wwwRecord.id}`, 'PUT', wwwData, token);
      console.log('   Registro WWW atualizado');
    } else {
      await cloudflareAPI(`/zones/${ZONE_ID}/dns_records`, 'POST', wwwData, token);
      console.log('   Registro WWW criado');
    }

    // Configurar registro raiz (@)
    const rootRecord = dnsRecords.result.find(r => r.name === 'crosswms.com.br');
    const rootData = {
      type: 'CNAME',
      name: '@',
      content: REPLIT_DOMAIN,
      proxied: true
    };

    if (rootRecord) {
      await cloudflareAPI(`/zones/${ZONE_ID}/dns_records/${rootRecord.id}`, 'PUT', rootData, token);
      console.log('   Registro raiz atualizado');
    } else {
      await cloudflareAPI(`/zones/${ZONE_ID}/dns_records`, 'POST', rootData, token);
      console.log('   Registro raiz criado');
    }

    // 3. Configurar Page Rule
    console.log('3. Configurando redirecionamento...');
    const pageRules = await cloudflareAPI(`/zones/${ZONE_ID}/pagerules`, 'GET', null, token);
    
    const redirectRule = pageRules.result.find(rule => 
      rule.targets?.[0]?.constraint?.value?.includes('crosswms.com.br')
    );

    const ruleData = {
      targets: [{
        target: 'url',
        constraint: {
          operator: 'matches',
          value: 'crosswms.com.br/*'
        }
      }],
      actions: [{
        id: 'forwarding_url',
        value: {
          url: 'https://www.crosswms.com.br/$1',
          status_code: 301
        }
      }],
      status: 'active'
    };

    if (redirectRule) {
      await cloudflareAPI(`/zones/${ZONE_ID}/pagerules/${redirectRule.id}`, 'PUT', ruleData, token);
      console.log('   Page Rule atualizada');
    } else {
      await cloudflareAPI(`/zones/${ZONE_ID}/pagerules`, 'POST', ruleData, token);
      console.log('   Page Rule criada');
    }

    // 4. Limpar cache (opcional - pode falhar se não tiver permissão)
    console.log('4. Tentando limpar cache...');
    try {
      await cloudflareAPI(`/zones/${ZONE_ID}/purge_cache`, 'POST', { purge_everything: true }, token);
      console.log('   Cache limpo');
    } catch (error) {
      console.log('   Cache não foi limpo (permissão não disponível - normal)');
    }

    console.log('\nConfiguração concluída com sucesso!');
    console.log('Aguarde 5-10 minutos para propagação.');
    console.log('Teste: https://www.crosswms.com.br');

  } catch (error) {
    console.error('Erro:', error.message);
    process.exit(1);
  }
}

// Executar
const token = process.argv[2];
if (!token) {
  console.log('Uso: node setup-cloudflare.js [API_TOKEN]');
  console.log('\nPara obter API Token:');
  console.log('1. Acesse: https://dash.cloudflare.com/profile/api-tokens');
  console.log('2. Criar token > Token personalizado');
  console.log('3. Permissões necessárias:');
  console.log('   - Zona:Configurações da zona:Editar');
  console.log('   - Zona:DNS:Editar');
  console.log('   - Zona:Regras de página:Editar');
  console.log('   - Zona:Limpeza de cache:Limpar');
  console.log('4. Recursos da zona: Incluir todas as zonas');
  process.exit(1);
}

setupCloudflare(token);