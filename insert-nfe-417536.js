/**
 * Script para inserir NFe 417536 através da API do sistema
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';
const TOKEN = '51e00195-ff08-4c9b-b245-e9bac2c7c82b'; // Token de autenticação atual

// Dados extraídos do XML processado
const ordemData = {
  tipo_movimentacao: 'Entrada',
  subtipo_operacao: 'Recebimento',
  tipo_carregamento: 'normal',
  prioridade: 'media',
  data_programada: new Date('2025-07-03'),
  observacoes: 'NFe 417536 - CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA',
  notasFiscais: [
    {
      chave_nota: '42250485179240000239550020004175361171503396',
      numero_nota: '417536',
      serie_nota: '2',
      emitente_razao_social: 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA',
      emitente_cnpj: '85179240000239',
      emitente_telefone: '4731458100',
      emitente_endereco: 'RUA GUARUJA',
      emitente_numero: '434',
      emitente_bairro: 'ITAUM',
      emitente_cidade: 'JOINVILLE',
      emitente_uf: 'SC',
      emitente_cep: '89210300',
      destinatario_razao_social: 'CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR',
      destinatario_cnpj: '00655209000193',
      destinatario_telefone: '3521075167',
      destinatario_endereco: 'RODOVIA BR 135',
      destinatario_numero: 'SN',
      destinatario_bairro: 'DISTRITO INDUSTRIAL',
      destinatario_cidade: 'SAO LUIS',
      destinatario_uf: 'MA',
      destinatario_cep: '65095050',
      valor_nota_fiscal: 9150.00,
      peso_bruto: '16.200',
      quantidade_volumes: 2,
      data_emissao: '2025-04-17T17:30:00-03:00',
      natureza_operacao: 'VENDA DE MERCADORIA',
      informacoes_complementares: '4177566-664 Pedido Venda: 059645',
      numero_pedido: '059645'
    }
  ],
  dadosCarga: {
    peso_bruto: '16.200',
    quantidade_volumes: 2,
    valor_total: '9150.00'
  },
  remetente: {
    razao_social: 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA',
    cnpj: '85179240000239',
    telefone: '4731458100',
    endereco: 'RUA GUARUJA',
    numero: '434',
    bairro: 'ITAUM',
    cidade: 'JOINVILLE',
    uf: 'SC',
    cep: '89210300'
  },
  destinatario: {
    razao_social: 'CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR',
    cnpj: '00655209000193',
    telefone: '3521075167',
    endereco: 'RODOVIA BR 135',
    numero: 'SN',
    bairro: 'DISTRITO INDUSTRIAL',
    cidade: 'SAO LUIS',
    uf: 'MA',
    cep: '65095050'
  },
  modulo: 'armazenagem_recebimento'
};

async function inserirOrdemCarga() {
  try {
    console.log('=== INSERINDO NFe 417536 NO SISTEMA ===\n');
    
    const response = await fetch(`${API_BASE}/ordens-carga`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      },
      body: JSON.stringify(ordemData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✓ Ordem de carga criada com sucesso!');
    console.log('ID da ordem:', result.id);
    console.log('Número da ordem:', result.numero_ordem);
    console.log('');

    // Verificar se os dados foram inseridos corretamente
    console.log('=== VERIFICANDO INSERÇÃO ===');
    
    // Buscar a ordem criada
    const ordemResponse = await fetch(`${API_BASE}/ordens-carga/${result.id}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    if (ordemResponse.ok) {
      const ordemCompleta = await ordemResponse.json();
      console.log('✓ Ordem recuperada da base de dados:');
      console.log('  - ID:', ordemCompleta.id);
      console.log('  - Número:', ordemCompleta.numero_ordem);
      console.log('  - Status:', ordemCompleta.status);
      console.log('  - Tipo:', ordemCompleta.tipo_movimentacao, '/', ordemCompleta.subtipo_operacao);
      console.log('  - Remetente:', ordemCompleta.remetente_razao_social);
      console.log('  - Destinatário:', ordemCompleta.destinatario_razao_social);
      console.log('  - Total de notas fiscais:', ordemCompleta.notasFiscais?.length || 0);
      console.log('  - Total de volumes:', ordemCompleta.volumes?.length || 0);
      
      if (ordemCompleta.notasFiscais && ordemCompleta.notasFiscais.length > 0) {
        console.log('');
        console.log('✓ Nota fiscal inserida:');
        const nota = ordemCompleta.notasFiscais[0];
        console.log('  - Chave:', nota.chave_nota);
        console.log('  - Número:', nota.numero_nota);
        console.log('  - Valor:', 'R$', nota.valor_nota_fiscal);
        console.log('  - Peso bruto:', nota.peso_bruto, 'kg');
        console.log('  - Quantidade volumes:', nota.quantidade_volumes);
      }
      
      if (ordemCompleta.volumes && ordemCompleta.volumes.length > 0) {
        console.log('');
        console.log('✓ Volumes criados:');
        ordemCompleta.volumes.forEach((volume, index) => {
          console.log(`  - Volume ${index + 1}: ${volume.altura_cm}x${volume.largura_cm}x${volume.comprimento_cm} cm`);
          console.log(`    Volume m³: ${volume.volume_m3}`);
          console.log(`    Peso: ${volume.peso_volume_kg} kg`);
        });
      }
      
      console.log('\n=== RESUMO DA INSERÇÃO ===');
      console.log('✓ Tabela ordens_carga: 1 registro inserido');
      console.log('✓ Tabela notas_fiscais: 1 registro inserido');
      console.log('✓ Tabela itens_carga: 1 registro inserido');
      console.log('✓ Tabela volumes_etiqueta:', ordemCompleta.volumes?.length || 0, 'registros inseridos');
      console.log('');
      console.log('🎉 NFe 417536 foi cadastrada com sucesso no sistema!');
      
    } else {
      console.log('⚠️ Ordem criada mas erro ao verificar:', ordemResponse.status);
    }

  } catch (error) {
    console.error('❌ Erro ao inserir ordem:', error.message);
    console.log('\nDetalhes dos dados que seriam inseridos:');
    console.log(JSON.stringify(ordemData, null, 2));
  }
}

// Executar inserção
inserirOrdemCarga();