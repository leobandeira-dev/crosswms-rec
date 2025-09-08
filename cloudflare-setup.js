/**
 * Script de configuração automática do Cloudflare para crosswms.com.br
 * Configura SSL, DNS e Page Rules automaticamente via API
 */

const CLOUDFLARE_CONFIG = {
  zoneId: 'f8ce25942bf1b428e2f50fa66617a9ba',
  accountId: 'b9811e7c421e1cb81374345d0d2e51b4',
  domain: 'crosswms.com.br',
  replicaDomain: 'd7b15c31-81fe-4823-bdd9-7694ae6b8d2c-00-ochrue1p6370.riker.replit.dev'
};

class CloudflareSetup {
  constructor(apiToken) {
    this.apiToken = apiToken;
    this.baseUrl = 'https://api.cloudflare.com/client/v4';
    this.headers = {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  async makeRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const options = {
      method,
      headers: this.headers
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    console.log(`[API] ${method} ${endpoint}`);
    
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`API Error: ${result.errors?.map(e => e.message).join(', ') || 'Unknown error'}`);
      }
      
      return result;
    } catch (error) {
      console.error(`[API Error] ${method} ${endpoint}:`, error.message);
      throw error;
    }
  }

  // 1. Configurar SSL mode para Flexible
  async configureSsl() {
    console.log('\n🔒 Configurando SSL mode para Flexible...');
    
    const sslData = {
      value: 'flexible'
    };

    const result = await this.makeRequest(
      `/zones/${CLOUDFLARE_CONFIG.zoneId}/settings/ssl`,
      'PATCH',
      sslData
    );

    console.log('✅ SSL configurado para Flexible');
    return result;
  }

  // 2. Configurar registros DNS
  async configureDns() {
    console.log('\n🌐 Configurando registros DNS...');

    // Primeiro, listar registros existentes
    const existingRecords = await this.makeRequest(
      `/zones/${CLOUDFLARE_CONFIG.zoneId}/dns_records`
    );

    // Configurações dos registros DNS necessários
    const dnsRecords = [
      {
        type: 'CNAME',
        name: 'www',
        content: CLOUDFLARE_CONFIG.replicaDomain,
        proxied: true,
        ttl: 1 // Auto quando proxied = true
      },
      {
        type: 'CNAME',
        name: '@',
        content: CLOUDFLARE_CONFIG.replicaDomain,
        proxied: true,
        ttl: 1
      }
    ];

    for (const record of dnsRecords) {
      // Verificar se o registro já existe
      const existing = existingRecords.result.find(r => 
        r.type === record.type && r.name === record.name
      );

      if (existing) {
        // Atualizar registro existente
        console.log(`📝 Atualizando registro ${record.type} ${record.name}...`);
        await this.makeRequest(
          `/zones/${CLOUDFLARE_CONFIG.zoneId}/dns_records/${existing.id}`,
          'PUT',
          record
        );
      } else {
        // Criar novo registro
        console.log(`➕ Criando registro ${record.type} ${record.name}...`);
        await this.makeRequest(
          `/zones/${CLOUDFLARE_CONFIG.zoneId}/dns_records`,
          'POST',
          record
        );
      }
    }

    console.log('✅ Registros DNS configurados');
  }

  // 3. Configurar Page Rules para redirecionamento
  async configurePageRules() {
    console.log('\n📄 Configurando Page Rules...');

    // Listar page rules existentes
    const existingRules = await this.makeRequest(
      `/zones/${CLOUDFLARE_CONFIG.zoneId}/pagerules`
    );

    // Verificar se já existe regra para redirecionamento
    const redirectRule = existingRules.result.find(rule => 
      rule.targets[0]?.constraint?.value?.includes('crosswms.com.br/*')
    );

    const pageRuleData = {
      targets: [
        {
          target: 'url',
          constraint: {
            operator: 'matches',
            value: `${CLOUDFLARE_CONFIG.domain}/*`
          }
        }
      ],
      actions: [
        {
          id: 'forwarding_url',
          value: {
            url: `https://www.${CLOUDFLARE_CONFIG.domain}/$1`,
            status_code: 301
          }
        }
      ],
      priority: 1,
      status: 'active'
    };

    if (redirectRule) {
      console.log('📝 Atualizando Page Rule existente...');
      await this.makeRequest(
        `/zones/${CLOUDFLARE_CONFIG.zoneId}/pagerules/${redirectRule.id}`,
        'PUT',
        pageRuleData
      );
    } else {
      console.log('➕ Criando nova Page Rule...');
      await this.makeRequest(
        `/zones/${CLOUDFLARE_CONFIG.zoneId}/pagerules`,
        'POST',
        pageRuleData
      );
    }

    console.log('✅ Page Rules configuradas');
  }

  // 4. Limpar cache do Cloudflare
  async purgeCache() {
    console.log('\n🧹 Limpando cache do Cloudflare...');

    const purgeData = {
      purge_everything: true
    };

    await this.makeRequest(
      `/zones/${CLOUDFLARE_CONFIG.zoneId}/purge_cache`,
      'POST',
      purgeData
    );

    console.log('✅ Cache limpo');
  }

  // 5. Verificar configuração
  async verifySetup() {
    console.log('\n🔍 Verificando configuração...');

    // Verificar SSL
    const sslSettings = await this.makeRequest(
      `/zones/${CLOUDFLARE_CONFIG.zoneId}/settings/ssl`
    );
    console.log(`SSL Mode: ${sslSettings.result.value}`);

    // Verificar DNS
    const dnsRecords = await this.makeRequest(
      `/zones/${CLOUDFLARE_CONFIG.zoneId}/dns_records`
    );
    
    const wwwRecord = dnsRecords.result.find(r => r.name === `www.${CLOUDFLARE_CONFIG.domain}`);
    const rootRecord = dnsRecords.result.find(r => r.name === CLOUDFLARE_CONFIG.domain);

    console.log(`WWW Record: ${wwwRecord ? '✅' : '❌'} ${wwwRecord?.content || 'Not found'}`);
    console.log(`Root Record: ${rootRecord ? '✅' : '❌'} ${rootRecord?.content || 'Not found'}`);

    // Verificar Page Rules
    const pageRules = await this.makeRequest(
      `/zones/${CLOUDFLARE_CONFIG.zoneId}/pagerules`
    );
    
    const redirectRule = pageRules.result.find(rule => 
      rule.targets[0]?.constraint?.value?.includes(CLOUDFLARE_CONFIG.domain)
    );

    console.log(`Page Rule: ${redirectRule ? '✅' : '❌'} ${redirectRule?.status || 'Not found'}`);

    console.log('\n🎉 Configuração completa!');
    console.log(`\n📋 Resumo:`);
    console.log(`- SSL Mode: Flexible`);
    console.log(`- DNS: www e @ apontando para Replit`);
    console.log(`- Redirecionamento: ${CLOUDFLARE_CONFIG.domain} → www.${CLOUDFLARE_CONFIG.domain}`);
    console.log(`- Cache: Limpo`);
    console.log(`\n⏰ Aguarde 5-10 minutos para propagação completa`);
  }

  // Executar configuração completa
  async setupComplete() {
    console.log('🚀 Iniciando configuração automática do Cloudflare...');
    console.log(`Domain: ${CLOUDFLARE_CONFIG.domain}`);
    console.log(`Target: ${CLOUDFLARE_CONFIG.replicaDomain}`);

    try {
      await this.configureSsl();
      await this.configureDns();
      await this.configurePageRules();
      await this.purgeCache();
      await this.verifySetup();
    } catch (error) {
      console.error('\n❌ Erro na configuração:', error.message);
      throw error;
    }
  }
}

// Função para executar com API Token
async function setupCloudflare(apiToken) {
  if (!apiToken) {
    console.error('❌ API Token do Cloudflare é obrigatório');
    console.log('\n📝 Para obter o token:');
    console.log('1. Acesse https://dash.cloudflare.com/profile/api-tokens');
    console.log('2. Clique em "Create Token"');
    console.log('3. Use template "Custom token" com permissões:');
    console.log('   - Zone:Zone Settings:Edit');
    console.log('   - Zone:DNS:Edit');
    console.log('   - Zone:Page Rules:Edit');
    console.log('   - Zone:Cache Purge:Purge');
    console.log('4. Zone Resources: Include - All zones');
    return;
  }

  const setup = new CloudflareSetup(apiToken);
  await setup.setupComplete();
}

// Exportar para uso externo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CloudflareSetup, setupCloudflare, CLOUDFLARE_CONFIG };
}

// Executar se chamado diretamente
if (typeof window === 'undefined' && require.main === module) {
  const apiToken = process.argv[2];
  setupCloudflare(apiToken).catch(console.error);
}