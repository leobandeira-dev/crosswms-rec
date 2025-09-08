/**
 * Script para extrair dados reais da NFe 42250485179240000239550020004175361171503396
 */

import fs from 'fs';
import { DOMParser } from '@xmldom/xmldom';

function extractRealNFeData() {
  try {
    // Lê o arquivo XML
    const xmlContent = fs.readFileSync('attached_assets/42250485179240000239550020004175361171503396 (2)_1751669067855.xml', 'utf8');
    
    // Parse do XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    
    // Função helper para extrair valor de um elemento
    function getElementValue(xpath) {
      try {
        const element = xmlDoc.getElementsByTagName(xpath)[0];
        return element ? element.textContent : '';
      } catch (error) {
        console.log(`Erro ao extrair ${xpath}:`, error.message);
        return '';
      }
    }

    // Extração dos dados
    const nfeData = {
      // Informações básicas da NFe
      chave_nota_fiscal: getElementValue('chNFe'),
      numero_nota: getElementValue('nNF'),
      serie_nota: getElementValue('serie'),
      data_hora_emissao: getElementValue('dhEmi'),
      natureza_operacao: getElementValue('natOp'),
      
      // Emitente (CORSUL)
      emitente_cnpj: getElementValue('CNPJ').replace(/[^\d]/g, ''),
      emitente_razao_social: getElementValue('xNome'),
      emitente_nome_fantasia: getElementValue('xFant'),
      emitente_telefone: getElementValue('fone'),
      emitente_uf: xmlDoc.getElementsByTagName('enderEmit')[0]?.getElementsByTagName('UF')[0]?.textContent || '',
      emitente_cidade: xmlDoc.getElementsByTagName('enderEmit')[0]?.getElementsByTagName('xMun')[0]?.textContent || '',
      emitente_bairro: xmlDoc.getElementsByTagName('enderEmit')[0]?.getElementsByTagName('xBairro')[0]?.textContent || '',
      emitente_endereco: xmlDoc.getElementsByTagName('enderEmit')[0]?.getElementsByTagName('xLgr')[0]?.textContent || '',
      emitente_numero: xmlDoc.getElementsByTagName('enderEmit')[0]?.getElementsByTagName('nro')[0]?.textContent || '',
      emitente_cep: xmlDoc.getElementsByTagName('enderEmit')[0]?.getElementsByTagName('CEP')[0]?.textContent || '',
      emitente_ie: xmlDoc.getElementsByTagName('emit')[0]?.getElementsByTagName('IE')[0]?.textContent || '',
      
      // Destinatário (CONSORCIO ALUMAR)
      destinatario_cnpj: xmlDoc.getElementsByTagName('dest')[0]?.getElementsByTagName('CNPJ')[0]?.textContent?.replace(/[^\d]/g, '') || '',
      destinatario_razao_social: xmlDoc.getElementsByTagName('dest')[0]?.getElementsByTagName('xNome')[0]?.textContent || '',
      destinatario_telefone: xmlDoc.getElementsByTagName('enderDest')[0]?.getElementsByTagName('fone')[0]?.textContent || '',
      destinatario_uf: xmlDoc.getElementsByTagName('enderDest')[0]?.getElementsByTagName('UF')[0]?.textContent || '',
      destinatario_cidade: xmlDoc.getElementsByTagName('enderDest')[0]?.getElementsByTagName('xMun')[0]?.textContent || '',
      destinatario_bairro: xmlDoc.getElementsByTagName('enderDest')[0]?.getElementsByTagName('xBairro')[0]?.textContent || '',
      destinatario_endereco: xmlDoc.getElementsByTagName('enderDest')[0]?.getElementsByTagName('xLgr')[0]?.textContent || '',
      destinatario_numero: xmlDoc.getElementsByTagName('enderDest')[0]?.getElementsByTagName('nro')[0]?.textContent || '',
      destinatario_cep: xmlDoc.getElementsByTagName('enderDest')[0]?.getElementsByTagName('CEP')[0]?.textContent || '',
      destinatario_ie: xmlDoc.getElementsByTagName('dest')[0]?.getElementsByTagName('IE')[0]?.textContent || '',
      destinatario_email: xmlDoc.getElementsByTagName('dest')[0]?.getElementsByTagName('email')[0]?.textContent || '',
      
      // Transportadora
      transportadora_cnpj: xmlDoc.getElementsByTagName('transporta')[0]?.getElementsByTagName('CNPJ')[0]?.textContent?.replace(/[^\d]/g, '') || '',
      transportadora_razao_social: xmlDoc.getElementsByTagName('transporta')[0]?.getElementsByTagName('xNome')[0]?.textContent || '',
      transportadora_uf: xmlDoc.getElementsByTagName('transporta')[0]?.getElementsByTagName('UF')[0]?.textContent || '',
      transportadora_cidade: xmlDoc.getElementsByTagName('transporta')[0]?.getElementsByTagName('xMun')[0]?.textContent || '',
      transportadora_endereco: xmlDoc.getElementsByTagName('transporta')[0]?.getElementsByTagName('xEnder')[0]?.textContent || '',
      transportadora_ie: xmlDoc.getElementsByTagName('transporta')[0]?.getElementsByTagName('IE')[0]?.textContent || '',
      
      // Informações de transporte
      modalidade_frete: getElementValue('modFrete'),
      quantidade_volumes: getElementValue('qVol'),
      peso_liquido: getElementValue('pesoL'),
      peso_bruto: getElementValue('pesoB'),
      especie_volumes: getElementValue('esp'),
      
      // Valores financeiros
      valor_nota_fiscal: getElementValue('vNF'),
      valor_produtos: getElementValue('vProd'),
      valor_icms: getElementValue('vICMS'),
      valor_frete: getElementValue('vFrete'),
      valor_seguro: getElementValue('vSeg'),
      valor_desconto: getElementValue('vDesc'),
      valor_outras_despesas: getElementValue('vOutro'),
      
      // Informações dos produtos
      codigo_produto: getElementValue('cProd'),
      descricao_produto: getElementValue('xProd'),
      ncm: getElementValue('NCM'),
      cfop: getElementValue('CFOP'),
      quantidade_comercial: getElementValue('qCom'),
      unidade_comercial: getElementValue('uCom'),
      valor_unitario: getElementValue('vUnCom'),
      numero_pedido_item: getElementValue('nItemPed'),
      numero_pedido_cliente: getElementValue('xPed'),
      
      // Informações complementares
      informacoes_complementares: getElementValue('infCpl'),
      numero_protocolo: getElementValue('nProt'),
      data_autorizacao: getElementValue('dhRecbto'),
      
      // Cobrança
      numero_fatura: getElementValue('nFat'),
      valor_original_fatura: getElementValue('vOrig'),
      valor_liquido_fatura: getElementValue('vLiq'),
      numero_duplicata: getElementValue('nDup'),
      data_vencimento: getElementValue('dVenc'),
      valor_duplicata: getElementValue('vDup'),
      
      // Outros
      operacao: 'Entrada', // Baseado no tpNF = 1 (entrada)
      tipo_frete: getElementValue('modFrete') === '0' ? 'CIF' : 'FOB',
      cliente_retira: 'Não'
    };

    // Formatação de dados
    if (nfeData.emitente_cnpj) {
      nfeData.emitente_cnpj_formatado = nfeData.emitente_cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    if (nfeData.destinatario_cnpj) {
      nfeData.destinatario_cnpj_formatado = nfeData.destinatario_cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    if (nfeData.transportadora_cnpj) {
      nfeData.transportadora_cnpj_formatado = nfeData.transportadora_cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    // Extrair número do pedido das informações complementares
    const infComplMatch = nfeData.informacoes_complementares.match(/Pedido Venda:\s*(\d+)/);
    if (infComplMatch) {
      nfeData.numero_pedido = infComplMatch[1];
    }

    console.log('\n=== DADOS REAIS DA NFE 42250485179240000239550020004175361171503396 ===\n');
    console.log('INFORMAÇÕES BÁSICAS:');
    console.log(`Chave NFe: ${nfeData.chave_nota_fiscal}`);
    console.log(`Número: ${nfeData.numero_nota}`);
    console.log(`Série: ${nfeData.serie_nota}`);
    console.log(`Data/Hora Emissão: ${nfeData.data_hora_emissao}`);
    console.log(`Natureza da Operação: ${nfeData.natureza_operacao}`);
    console.log(`Número do Pedido: ${nfeData.numero_pedido || 'N/A'}`);
    
    console.log('\nEMITENTE:');
    console.log(`CNPJ: ${nfeData.emitente_cnpj_formatado || nfeData.emitente_cnpj}`);
    console.log(`Razão Social: ${nfeData.emitente_razao_social}`);
    console.log(`Nome Fantasia: ${nfeData.emitente_nome_fantasia}`);
    console.log(`Telefone: ${nfeData.emitente_telefone}`);
    console.log(`Endereço: ${nfeData.emitente_endereco}, ${nfeData.emitente_numero}`);
    console.log(`Bairro: ${nfeData.emitente_bairro}`);
    console.log(`Cidade: ${nfeData.emitente_cidade} - ${nfeData.emitente_uf}`);
    console.log(`CEP: ${nfeData.emitente_cep}`);
    console.log(`IE: ${nfeData.emitente_ie}`);
    
    console.log('\nDESTINATÁRIO:');
    console.log(`CNPJ: ${nfeData.destinatario_cnpj_formatado || nfeData.destinatario_cnpj}`);
    console.log(`Razão Social: ${nfeData.destinatario_razao_social}`);
    console.log(`Telefone: ${nfeData.destinatario_telefone}`);
    console.log(`Endereço: ${nfeData.destinatario_endereco}, ${nfeData.destinatario_numero}`);
    console.log(`Bairro: ${nfeData.destinatario_bairro}`);
    console.log(`Cidade: ${nfeData.destinatario_cidade} - ${nfeData.destinatario_uf}`);
    console.log(`CEP: ${nfeData.destinatario_cep}`);
    console.log(`IE: ${nfeData.destinatario_ie}`);
    console.log(`Email: ${nfeData.destinatario_email}`);
    
    console.log('\nTRANSPORTADORA:');
    console.log(`CNPJ: ${nfeData.transportadora_cnpj_formatado || nfeData.transportadora_cnpj}`);
    console.log(`Razão Social: ${nfeData.transportadora_razao_social}`);
    console.log(`Cidade: ${nfeData.transportadora_cidade} - ${nfeData.transportadora_uf}`);
    console.log(`Endereço: ${nfeData.transportadora_endereco}`);
    console.log(`IE: ${nfeData.transportadora_ie}`);
    
    console.log('\nINFORMAÇÕES DE TRANSPORTE:');
    console.log(`Modalidade Frete: ${nfeData.modalidade_frete} (${nfeData.tipo_frete})`);
    console.log(`Quantidade Volumes: ${nfeData.quantidade_volumes}`);
    console.log(`Peso Líquido: ${nfeData.peso_liquido} kg`);
    console.log(`Peso Bruto: ${nfeData.peso_bruto} kg`);
    console.log(`Espécie: ${nfeData.especie_volumes}`);
    
    console.log('\nVALORES FINANCEIROS:');
    console.log(`Valor da Nota Fiscal: R$ ${nfeData.valor_nota_fiscal}`);
    console.log(`Valor dos Produtos: R$ ${nfeData.valor_produtos}`);
    console.log(`Valor ICMS: R$ ${nfeData.valor_icms}`);
    console.log(`Valor Frete: R$ ${nfeData.valor_frete}`);
    
    console.log('\nPRODUTO:');
    console.log(`Código: ${nfeData.codigo_produto}`);
    console.log(`Descrição: ${nfeData.descricao_produto}`);
    console.log(`NCM: ${nfeData.ncm}`);
    console.log(`CFOP: ${nfeData.cfop}`);
    console.log(`Quantidade: ${nfeData.quantidade_comercial} ${nfeData.unidade_comercial}`);
    console.log(`Valor Unitário: R$ ${nfeData.valor_unitario}`);
    
    console.log('\nCOBRANÇA:');
    console.log(`Número da Fatura: ${nfeData.numero_fatura}`);
    console.log(`Data Vencimento: ${nfeData.data_vencimento}`);
    console.log(`Valor da Duplicata: R$ ${nfeData.valor_duplicata}`);
    
    console.log('\nINFORMAÇÕES COMPLEMENTARES:');
    console.log(`${nfeData.informacoes_complementares}`);
    
    console.log('\nAUTORIZAÇÃO:');
    console.log(`Protocolo: ${nfeData.numero_protocolo}`);
    console.log(`Data Autorização: ${nfeData.data_autorizacao}`);
    
    return nfeData;

  } catch (error) {
    console.error('Erro ao processar XML:', error);
    return null;
  }
}

// Executa a extração
const realData = extractRealNFeData();

if (realData) {
  console.log('\n=== PROCESSAMENTO CONCLUÍDO ===');
  console.log('Dados extraídos com sucesso do XML real da NFe!');
}