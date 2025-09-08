/**
 * Script para processar XML da NF-e 417536 e inserir dados nas tabelas
 */

import fs from 'fs';
import { DOMParser } from '@xmldom/xmldom';

// Função para extrair dados do XML
function extractNFeData(xmlContent) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  
  // Função auxiliar para extrair valor de XML
  const getXMLValue = (tagName) => {
    const elements = xmlDoc.getElementsByTagName(tagName);
    return elements.length > 0 ? elements[0].textContent.trim() : '';
  };

  // Extrair chave da NFe
  const chaveNota = getXMLValue('chNFe') || '';
  if (!chaveNota) {
    const infNFe = xmlDoc.getElementsByTagName('infNFe')[0];
    if (infNFe && infNFe.getAttribute('Id')) {
      const chaveNota2 = infNFe.getAttribute('Id').replace('NFe', '');
    }
  }
  
  // Dados básicos da NFe
  const numeroNota = getXMLValue('nNF');
  const serieNota = getXMLValue('serie');
  const naturezaOperacao = getXMLValue('natOp');
  const dataEmissao = getXMLValue('dhEmi');
  const valorNota = parseFloat(getXMLValue('vNF')) || 0;
  
  // Dados do emitente
  const emitenteRazaoSocial = getXMLValue('emit xNome');
  const emitenteCnpj = getXMLValue('emit CNPJ');
  const emitenteTelefone = getXMLValue('emit enderEmit fone');
  const emitenteEndereco = getXMLValue('emit enderEmit xLgr');
  const emitenteNumero = getXMLValue('emit enderEmit nro');
  const emitenteBairro = getXMLValue('emit enderEmit xBairro');
  const emitenteCidade = getXMLValue('emit enderEmit xMun');
  const emitenteUf = getXMLValue('emit enderEmit UF');
  const emitenteCep = getXMLValue('emit enderEmit CEP');
  
  // Dados do destinatário
  const destinatarioRazaoSocial = getXMLValue('dest xNome');
  const destinatarioCnpj = getXMLValue('dest CNPJ');
  const destinatarioTelefone = getXMLValue('dest enderDest fone');
  const destinatarioEndereco = getXMLValue('dest enderDest xLgr');
  const destinatarioNumero = getXMLValue('dest enderDest nro');
  const destinatarioBairro = getXMLValue('dest enderDest xBairro');
  const destinatarioCidade = getXMLValue('dest enderDest xMun');
  const destinatarioUf = getXMLValue('dest enderDest UF');
  const destinatarioCep = getXMLValue('dest enderDest CEP');
  
  // Dados de transporte
  const pesoBruto = getXMLValue('vol pesoB');
  const quantidadeVolumes = parseInt(getXMLValue('vol qVol')) || 1;
  
  // Informações complementares
  const informacoesComplementares = getXMLValue('infCpl');
  
  // Extrair número do pedido das informações complementares
  const numeroPedidoMatch = informacoesComplementares.match(/Pedido.*?(\d+)/i);
  const numeroPedido = numeroPedidoMatch ? numeroPedidoMatch[1] : '';

  return {
    chaveNota,
    numeroNota,
    serieNota,
    naturezaOperacao,
    dataEmissao,
    valorNota,
    emitenteRazaoSocial,
    emitenteCnpj,
    emitenteTelefone,
    emitenteEndereco,
    emitenteNumero,
    emitenteBairro,
    emitenteCidade,
    emitenteUf,
    emitenteCep,
    destinatarioRazaoSocial,
    destinatarioCnpj,
    destinatarioTelefone,
    destinatarioEndereco,
    destinatarioNumero,
    destinatarioBairro,
    destinatarioCidade,
    destinatarioUf,
    destinatarioCep,
    pesoBruto,
    quantidadeVolumes,
    informacoesComplementares,
    numeroPedido
  };
}

// Ler o arquivo XML
const xmlContent = fs.readFileSync('test_nf_417536.xml', 'utf8');
const nfeData = extractNFeData(xmlContent);

console.log('=== DADOS EXTRAÍDOS DO XML ===');
console.log('Chave NFe:', nfeData.chaveNota);
console.log('Número:', nfeData.numeroNota);
console.log('Série:', nfeData.serieNota);
console.log('Valor:', nfeData.valorNota);
console.log('Emitente:', nfeData.emitenteRazaoSocial);
console.log('CNPJ Emitente:', nfeData.emitenteCnpj);
console.log('Destinatário:', nfeData.destinatarioRazaoSocial);
console.log('CNPJ Destinatário:', nfeData.destinatarioCnpj);
console.log('Peso Bruto:', nfeData.pesoBruto);
console.log('Quantidade Volumes:', nfeData.quantidadeVolumes);
console.log('Número Pedido:', nfeData.numeroPedido);

console.log('\n=== DADOS PARA INSERÇÃO ===');

// Gerar dados para inserção nas tabelas
const ordemCarga = {
  id: 'novo-id-gerado',
  numero_ordem: `REC-${Date.now()}`,
  tipo_movimentacao: 'Entrada',
  subtipo_operacao: 'Recebimento',
  status: 'ativo',
  prioridade: 'media',
  data_programada: new Date().toISOString(),
  modulo: 'armazenagem_recebimento',
  observacoes: `Importação XML NF-e ${nfeData.numeroNota}`,
  // Dados do remetente (emitente)
  remetente_razao_social: nfeData.emitenteRazaoSocial,
  remetente_cnpj: nfeData.emitenteCnpj,
  remetente_telefone: nfeData.emitenteTelefone,
  remetente_endereco: nfeData.emitenteEndereco,
  remetente_numero: nfeData.emitenteNumero,
  remetente_bairro: nfeData.emitenteBairro,
  remetente_cidade: nfeData.emitenteCidade,
  remetente_uf: nfeData.emitenteUf,
  remetente_cep: nfeData.emitenteCep,
  // Dados do destinatário
  destinatario_razao_social: nfeData.destinatarioRazaoSocial,
  destinatario_cnpj: nfeData.destinatarioCnpj,
  destinatario_telefone: nfeData.destinatarioTelefone,
  destinatario_endereco: nfeData.destinatarioEndereco,
  destinatario_numero: nfeData.destinatarioNumero,
  destinatario_bairro: nfeData.destinatarioBairro,
  destinatario_cidade: nfeData.destinatarioCidade,
  destinatario_uf: nfeData.destinatarioUf,
  destinatario_cep: nfeData.destinatarioCep
};

const notaFiscal = {
  id: 'novo-id-nota-gerado',
  chave_nota: nfeData.chaveNota,
  numero_nota: nfeData.numeroNota,
  serie_nota: nfeData.serieNota,
  emitente_razao_social: nfeData.emitenteRazaoSocial,
  emitente_cnpj: nfeData.emitenteCnpj,
  emitente_telefone: nfeData.emitenteTelefone,
  emitente_endereco: nfeData.emitenteEndereco,
  emitente_cidade: nfeData.emitenteCidade,
  emitente_uf: nfeData.emitenteUf,
  destinatario_razao_social: nfeData.destinatarioRazaoSocial,
  destinatario_cnpj: nfeData.destinatarioCnpj,
  destinatario_telefone: nfeData.destinatarioTelefone,
  destinatario_endereco: nfeData.destinatarioEndereco,
  destinatario_cidade: nfeData.destinatarioCidade,
  destinatario_uf: nfeData.destinatarioUf,
  valor_nota_fiscal: nfeData.valorNota,
  peso_bruto: nfeData.pesoBruto,
  quantidade_volumes: nfeData.quantidadeVolumes,
  data_emissao: nfeData.dataEmissao,
  natureza_operacao: nfeData.naturezaOperacao,
  informacoes_complementares: nfeData.informacoesComplementares,
  numero_pedido: nfeData.numeroPedido
};

console.log('ORDEM CARGA:', JSON.stringify(ordemCarga, null, 2));
console.log('\nNOTA FISCAL:', JSON.stringify(notaFiscal, null, 2));

// Dados para volumes_etiqueta (baseado na quantidade de volumes)
const volumes = [];
for (let i = 1; i <= nfeData.quantidadeVolumes; i++) {
  volumes.push({
    id: `volume-${i}-id`,
    nota_fiscal_id: 'novo-id-nota-gerado',
    numero_volume: i,
    altura_cm: 30, // Padrão - será atualizado via cubagem
    largura_cm: 40,
    comprimento_cm: 50,
    volume_m3: 0.06, // 30x40x50 cm = 0.06 m³
    peso_volume_kg: parseFloat(nfeData.pesoBruto) / nfeData.quantidadeVolumes
  });
}

console.log('\nVOLUMES:', JSON.stringify(volumes, null, 2));