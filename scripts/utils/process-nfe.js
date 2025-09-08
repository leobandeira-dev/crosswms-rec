/**
 * Script simplificado para extrair dados da NFe 417536
 */

import fs from 'fs';

// Ler o arquivo XML
const xmlContent = fs.readFileSync('test_nf_417536.xml', 'utf8');

// Extrair dados usando regex (mais simples para este caso)
const extractValue = (pattern) => {
  const match = xmlContent.match(pattern);
  return match ? match[1].trim() : '';
};

console.log('=== PROCESSANDO XML NFE-417536 ===\n');

// Extrair dados principais
const chaveNota = extractValue(/<chNFe>([^<]+)<\/chNFe>/);
const numeroNota = extractValue(/<nNF>([^<]+)<\/nNF>/);
const serieNota = extractValue(/<serie>([^<]+)<\/serie>/);
const valorNota = extractValue(/<vNF>([^<]+)<\/vNF>/);
const dataEmissao = extractValue(/<dhEmi>([^<]+)<\/dhEmi>/);
const naturezaOperacao = extractValue(/<natOp>([^<]+)<\/natOp>/);

// Dados do emitente
const emitenteNome = extractValue(/<emit>[\s\S]*?<xNome>([^<]+)<\/xNome>/);
const emitenteCnpj = extractValue(/<emit>[\s\S]*?<CNPJ>([^<]+)<\/CNPJ>/);
const emitenteTelefone = extractValue(/<emit>[\s\S]*?<fone>([^<]+)<\/fone>/);
const emitenteEndereco = extractValue(/<emit>[\s\S]*?<xLgr>([^<]+)<\/xLgr>/);
const emitenteNumero = extractValue(/<emit>[\s\S]*?<nro>([^<]+)<\/nro>/);
const emitenteBairro = extractValue(/<emit>[\s\S]*?<xBairro>([^<]+)<\/xBairro>/);
const emitenteCidade = extractValue(/<emit>[\s\S]*?<xMun>([^<]+)<\/xMun>/);
const emitenteUf = extractValue(/<emit>[\s\S]*?<UF>([^<]+)<\/UF>/);
const emitenteCep = extractValue(/<emit>[\s\S]*?<CEP>([^<]+)<\/CEP>/);

// Dados do destinatário
const destinatarioNome = extractValue(/<dest>[\s\S]*?<xNome>([^<]+)<\/xNome>/);
const destinatarioCnpj = extractValue(/<dest>[\s\S]*?<CNPJ>([^<]+)<\/CNPJ>/);
const destinatarioTelefone = extractValue(/<dest>[\s\S]*?<fone>([^<]+)<\/fone>/);
const destinatarioEndereco = extractValue(/<dest>[\s\S]*?<xLgr>([^<]+)<\/xLgr>/);
const destinatarioNumero = extractValue(/<dest>[\s\S]*?<nro>([^<]+)<\/nro>/);
const destinatarioBairro = extractValue(/<dest>[\s\S]*?<xBairro>([^<]+)<\/xBairro>/);
const destinatarioCidade = extractValue(/<dest>[\s\S]*?<xMun>([^<]+)<\/xMun>/);
const destinatarioUf = extractValue(/<dest>[\s\S]*?<UF>([^<]+)<\/UF>/);
const destinatarioCep = extractValue(/<dest>[\s\S]*?<CEP>([^<]+)<\/CEP>/);

// Dados de transporte
const pesoBruto = extractValue(/<pesoB>([^<]+)<\/pesoB>/);
const quantidadeVolumes = extractValue(/<qVol>([^<]+)<\/qVol>/);

// Informações complementares
const infComplementares = extractValue(/<infCpl>([^<]+)<\/infCpl>/);
const numeroPedido = infComplementares.match(/Pedido.*?(\d+)/i)?.[1] || '';

console.log('DADOS EXTRAÍDOS:');
console.log('Chave NFe:', chaveNota);
console.log('Número:', numeroNota);
console.log('Série:', serieNota);
console.log('Valor:', valorNota);
console.log('Data Emissão:', dataEmissao);
console.log('Natureza Operação:', naturezaOperacao);
console.log('');
console.log('EMITENTE:');
console.log('Nome:', emitenteNome);
console.log('CNPJ:', emitenteCnpj);
console.log('Telefone:', emitenteTelefone);
console.log('Endereço:', emitenteEndereco + ', ' + emitenteNumero);
console.log('Bairro:', emitenteBairro);
console.log('Cidade/UF:', emitenteCidade + '/' + emitenteUf);
console.log('CEP:', emitenteCep);
console.log('');
console.log('DESTINATÁRIO:');
console.log('Nome:', destinatarioNome);
console.log('CNPJ:', destinatarioCnpj);
console.log('Telefone:', destinatarioTelefone);
console.log('Endereço:', destinatarioEndereco + ', ' + destinatarioNumero);
console.log('Bairro:', destinatarioBairro);
console.log('Cidade/UF:', destinatarioCidade + '/' + destinatarioUf);
console.log('CEP:', destinatarioCep);
console.log('');
console.log('TRANSPORTE:');
console.log('Peso Bruto:', pesoBruto, 'kg');
console.log('Quantidade Volumes:', quantidadeVolumes);
console.log('Número Pedido:', numeroPedido);

// Gerar IDs únicos para inserção
const generateId = () => 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
const ordemId = generateId();
const notaId = generateId();

console.log('\n=== ESTRUTURA PARA INSERÇÃO ===');

// 1. Tabela ordens_carga
const ordemCarga = {
  id: ordemId,
  numero_ordem: `REC-${Date.now()}`,
  tipo_movimentacao: 'Entrada',
  subtipo_operacao: 'Recebimento',
  status: 'ativo',
  prioridade: 'media',
  data_programada: new Date().toISOString().split('T')[0],
  modulo: 'armazenagem_recebimento',
  observacoes: `NFe ${numeroNota} - ${emitenteNome}`,
  remetente_razao_social: emitenteNome,
  remetente_cnpj: emitenteCnpj,
  remetente_telefone: emitenteTelefone,
  remetente_endereco: emitenteEndereco,
  remetente_numero: emitenteNumero,
  remetente_bairro: emitenteBairro,
  remetente_cidade: emitenteCidade,
  remetente_uf: emitenteUf,
  remetente_cep: emitenteCep,
  destinatario_razao_social: destinatarioNome,
  destinatario_cnpj: destinatarioCnpj,
  destinatario_telefone: destinatarioTelefone,
  destinatario_endereco: destinatarioEndereco,
  destinatario_numero: destinatarioNumero,
  destinatario_bairro: destinatarioBairro,
  destinatario_cidade: destinatarioCidade,
  destinatario_uf: destinatarioUf,
  destinatario_cep: destinatarioCep
};

// 2. Tabela notas_fiscais
const notaFiscal = {
  id: notaId,
  chave_nota: chaveNota,
  numero_nota: numeroNota,
  serie_nota: serieNota,
  emitente_razao_social: emitenteNome,
  emitente_cnpj: emitenteCnpj,
  emitente_telefone: emitenteTelefone,
  emitente_endereco: emitenteEndereco,
  emitente_cidade: emitenteCidade,
  emitente_uf: emitenteUf,
  destinatario_razao_social: destinatarioNome,
  destinatario_cnpj: destinatarioCnpj,
  destinatario_telefone: destinatarioTelefone,
  destinatario_endereco: destinatarioEndereco,
  destinatario_cidade: destinatarioCidade,
  destinatario_uf: destinatarioUf,
  valor_nota_fiscal: parseFloat(valorNota),
  peso_bruto: pesoBruto,
  quantidade_volumes: parseInt(quantidadeVolumes),
  data_emissao: dataEmissao,
  natureza_operacao: naturezaOperacao,
  informacoes_complementares: infComplementares,
  numero_pedido: numeroPedido
};

// 3. Tabela itens_carga (relacionamento)
const itemCarga = {
  id: generateId(),
  ordem_carga_id: ordemId,
  nota_fiscal_id: notaId
};

// 4. Tabela volumes_etiqueta
const volumes = [];
const qtdVolumes = parseInt(quantidadeVolumes) || 1;
const pesoPorVolume = parseFloat(pesoBruto) / qtdVolumes;

for (let i = 1; i <= qtdVolumes; i++) {
  volumes.push({
    id: generateId(),
    nota_fiscal_id: notaId,
    numero_volume: i,
    altura_cm: 30, // Padrão - será atualizado na cubagem
    largura_cm: 40,
    comprimento_cm: 50,
    volume_m3: 0.06, // 30x40x50 cm
    peso_volume_kg: pesoPorVolume.toFixed(2)
  });
}

console.log('\n1. ORDEM_CARGA:');
console.log(JSON.stringify(ordemCarga, null, 2));

console.log('\n2. NOTAS_FISCAIS:');
console.log(JSON.stringify(notaFiscal, null, 2));

console.log('\n3. ITENS_CARGA:');
console.log(JSON.stringify(itemCarga, null, 2));

console.log('\n4. VOLUMES_ETIQUETA:');
console.log(JSON.stringify(volumes, null, 2));

console.log('\n=== RESUMO ===');
console.log(`✓ 1 ordem de carga criada (${ordemCarga.numero_ordem})`);
console.log(`✓ 1 nota fiscal (${numeroNota}) com chave ${chaveNota}`);
console.log(`✓ 1 item de carga (relacionamento)`);
console.log(`✓ ${qtdVolumes} volume(s) criado(s)`);
console.log(`✓ Valor total: R$ ${valorNota}`);
console.log(`✓ Peso total: ${pesoBruto} kg`);