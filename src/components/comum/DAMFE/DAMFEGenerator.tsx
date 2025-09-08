import React from 'react';
import JsBarcode from 'jsbarcode';
import { NotaFiscalRastreamento } from '../../tracking/NotasFiscaisTracker';

interface DAMFEData {
  // Dados da NFe - Seguindo padrões SEFAZ
  chave: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  dataEntradaSaida?: string;
  horaEntradaSaida?: string;
  tipoOperacao: 'entrada' | 'saida';
  codigoMunicipio: string;
  tipoEmissao: string;
  digitoVerificador: string;
  ambiente: 'producao' | 'homologacao';
  finalidade: string;
  consumidorFinal: 'sim' | 'nao';
  presencaComprador: string;
  protocolo?: string;
  dataAutorizacao?: string;
  
  // Dados do emitente
  emitente: {
    razaoSocial: string;
    nomeFantasia?: string;
    cnpj: string;
    inscricaoEstadual: string;
    inscricaoMunicipal?: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      codigoMunicipio: string;
      nomeMunicipio: string;
      uf: string;
      cep: string;
      codigoPais: string;
      nomePais: string;
      telefone?: string;
    };
    email?: string;
    regimeTributario: string;
  };
  
  // Dados do destinatário
  destinatario: {
    razaoSocial: string;
    nomeFantasia?: string;
    cnpjCpf: string;
    inscricaoEstadual?: string;
    inscricaoMunicipal?: string;
    endereco: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      codigoMunicipio: string;
      nomeMunicipio: string;
      uf: string;
      cep: string;
      codigoPais: string;
      nomePais: string;
      telefone?: string;
    };
    email?: string;
    indicadorIEDestinatario?: string;
  };
  
  // Dados do transporte
  transporte?: {
    modalidadeFrete: '0' | '1' | '2' | '3' | '4' | '9'; // 0=Emitente, 1=Destinatário, 2=Terceiros, etc
    transportadora?: {
      razaoSocial: string;
      cnpjCpf: string;
      inscricaoEstadual?: string;
      endereco?: {
        logradouro: string;
        nomeMunicipio: string;
        uf: string;
      };
    };
    veiculo?: {
      placa: string;
      uf: string;
      rntc?: string;
    };
    volumes?: Array<{
      quantidade: number;
      especie: string;
      marca?: string;
      numeracao?: string;
      pesoLiquido: number;
      pesoBruto: number;
    }>;
  };
  
  // Produtos/Itens - Conforme especificação SEFAZ
  itens: Array<{
    numeroItem: number;
    codigoProduto: string;
    codigoEAN?: string;
    descricao: string;
    ncm: string;
    cest?: string;
    cfop: string;
    unidadeComercial: string;
    quantidadeComercial: number;
    valorUnitarioComercial: number;
    valorTotalBruto: number;
    codigoEANTributavel?: string;
    unidadeTributavel: string;
    quantidadeTributavel: number;
    valorUnitarioTributavel: number;
    valorFrete?: number;
    valorSeguro?: number;
    valorDesconto?: number;
    valorOutrasDespesas?: number;
    indicadorComposicaoValor: string;
    
    // Impostos
    impostos: {
      icms?: {
        origem: string;
        cst: string;
        modalidadeBC?: string;
        baseCalculo?: number;
        aliquota?: number;
        valor?: number;
      };
      ipi?: {
        cst: string;
        baseCalculo?: number;
        aliquota?: number;
        valor?: number;
      };
      pis?: {
        cst: string;
        baseCalculo?: number;
        aliquota?: number;
        valor?: number;
      };
      cofins?: {
        cst: string;
        baseCalculo?: number;
        aliquota?: number;
        valor?: number;
      };
    };
  }>;
  
  // Totais - Conforme padrões SEFAZ
  totais: {
    baseCalculoICMS: number;
    valorICMS: number;
    valorICMSDesonerado?: number;
    baseCalculoICMSST?: number;
    valorICMSST?: number;
    valorTotalProdutos: number;
    valorFrete?: number;
    valorSeguro?: number;
    valorDesconto?: number;
    valorII?: number;
    valorIPI?: number;
    valorPIS?: number;
    valorCOFINS?: number;
    valorOutrasDespesas?: number;
    valorTotalNF: number;
    valorTributosTotais?: number;
  };
  
  // Informações adicionais
  informacoesAdicionais?: {
    informacoesComplementares?: string;
    informacoesFisco?: string;
  };
  
  // Informações de pagamento
  pagamento?: {
    indicadorPagamento?: string;
    meiosPagamento?: Array<{
      indicadorPagamento: string;
      meioPagamento: string;
      valor: number;
    }>;
  };
}

export interface DAMFEProps {
  nota: NotaFiscalRastreamento;
  xmlContent?: string;
}

// Função para gerar código de barras da chave de acesso NFe
const generateBarcodeDataURL = (chaveAcesso: string): string => {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, chaveAcesso, {
    format: 'CODE128',
    width: 1,
    height: 30,
    displayValue: false,
    margin: 0,
  });
  return canvas.toDataURL();
};

// Função para formatar CNPJ/CPF
const formatCnpjCpf = (documento: string): string => {
  if (!documento) return '';
  
  const clean = documento.replace(/\D/g, '');
  
  if (clean.length === 11) {
    // CPF
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (clean.length === 14) {
    // CNPJ
    return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return documento;
};

// Função para formatar CEP
const formatCep = (cep: string): string => {
  if (!cep) return '';
  const clean = cep.replace(/\D/g, '');
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2');
};

// Função para formatar chave de acesso para exibição
const formatChaveAcesso = (chave: string): string => {
  if (!chave || chave.length !== 44) return chave;
  return chave.replace(/(\d{4})/g, '$1 ').trim();
};

// Função para converter dados da nota em dados DAMFE
const convertNotaToDAMFE = (nota: NotaFiscalRastreamento, xmlContent?: string): DAMFEData => {
  // Aqui devemos fazer o parsing do XML se disponível
  // Por enquanto, vou criar dados de exemplo baseados na nota
  
  return {
    // Dados básicos da NFe
    chave: '35250485179240002395500100010000' + nota.numero.padStart(8, '0') + '1',
    numero: nota.numero,
    serie: nota.serie,
    dataEmissao: new Date(nota.dataEmissao).toLocaleDateString('pt-BR'),
    dataEntradaSaida: new Date().toLocaleDateString('pt-BR'),
    horaEntradaSaida: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    tipoOperacao: 'saida',
    codigoMunicipio: '3550308', // São Paulo
    tipoEmissao: '1',
    digitoVerificador: '1',
    ambiente: 'producao',
    finalidade: '1',
    consumidorFinal: 'nao',
    presencaComprador: '0',
    protocolo: '135250000001234567890',
    dataAutorizacao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
    
    // Dados do emitente (dados da empresa logística)
    emitente: {
      razaoSocial: nota.remetente,
      nomeFantasia: nota.remetente,
      cnpj: '85179240000239', // CNPJ fictício
      inscricaoEstadual: '123456789012',
      endereco: {
        logradouro: 'Rua das Empresas',
        numero: '123',
        bairro: 'Centro',
        codigoMunicipio: '3550308',
        nomeMunicipio: nota.cidadeOrigem.split(' - ')[0] || 'São Paulo',
        uf: nota.cidadeOrigem.split(' - ')[1] || 'SP',
        cep: '01010000',
        codigoPais: '1058',
        nomePais: 'Brasil',
        telefone: '(11) 1234-5678',
      },
      regimeTributario: '3', // Regime Normal
    },
    
    // Dados do destinatário
    destinatario: {
      razaoSocial: nota.destinatario,
      cnpjCpf: '12345678000195', // CNPJ fictício
      inscricaoEstadual: 'ISENTO',
      endereco: {
        logradouro: 'Avenida Principal',
        numero: '456',
        bairro: 'Centro',
        codigoMunicipio: '2111300',
        nomeMunicipio: nota.cidadeDestino.split(' - ')[0] || 'São Luís',
        uf: nota.cidadeDestino.split(' - ')[1] || 'MA',
        cep: '65000000',
        codigoPais: '1058',
        nomePais: 'Brasil',
      },
      indicadorIEDestinatario: '9',
    },
    
    // Dados do transporte
    transporte: {
      modalidadeFrete: '0', // Por conta do emitente
      transportadora: {
        razaoSocial: 'CROSSWMS TRANSPORTES LTDA',
        cnpjCpf: '34579341000185',
        inscricaoEstadual: '123456789',
        endereco: {
          logradouro: 'Avenida Logística',
          nomeMunicipio: 'São Paulo',
          uf: 'SP',
        },
      },
      veiculo: {
        placa: 'ABC1234',
        uf: 'SP',
      },
      volumes: [{
        quantidade: nota.volumes,
        especie: 'VOLUMES',
        pesoLiquido: nota.peso,
        pesoBruto: nota.peso,
      }],
    },
    
    // Itens/Produtos
    itens: [{
      numeroItem: 1,
      codigoProduto: '001',
      descricao: `Frete referente NF ${nota.numero}`,
      ncm: '49019900',
      cfop: '5353',
      unidadeComercial: 'UN',
      quantidadeComercial: 1,
      valorUnitarioComercial: nota.valorTotal,
      valorTotalBruto: nota.valorTotal,
      unidadeTributavel: 'UN',
      quantidadeTributavel: 1,
      valorUnitarioTributavel: nota.valorTotal,
      indicadorComposicaoValor: '0',
      impostos: {
        icms: {
          origem: '0',
          cst: '00',
          modalidadeBC: '0',
          baseCalculo: nota.valorTotal,
          aliquota: 12,
          valor: nota.valorTotal * 0.12,
        },
        pis: {
          cst: '01',
          baseCalculo: nota.valorTotal,
          aliquota: 1.65,
          valor: nota.valorTotal * 0.0165,
        },
        cofins: {
          cst: '01',
          baseCalculo: nota.valorTotal,
          aliquota: 7.6,
          valor: nota.valorTotal * 0.076,
        },
      },
    }],
    
    // Totais
    totais: {
      baseCalculoICMS: nota.valorTotal,
      valorICMS: nota.valorTotal * 0.12,
      valorTotalProdutos: nota.valorTotal,
      valorTotalNF: nota.valorTotal,
      valorTributosTotais: nota.valorTotal * 0.2125, // ICMS + PIS + COFINS
    },
    
    // Informações adicionais
    informacoesAdicionais: {
      informacoesComplementares: `Nota Fiscal de Serviço de Transporte. Ordem de Carregamento: ${nota.ordemCarregamento || 'N/A'}`,
    },
  };
};

// Componente principal do DAMFE
const DAMFEGenerator: React.FC<DAMFEProps> = ({ nota, xmlContent }) => {
  const damfeData = convertNotaToDAMFE(nota, xmlContent);
  const barcodeDataURL = generateBarcodeDataURL(damfeData.chave);

  return (
    <div className="damfe-container bg-white p-4 max-w-4xl mx-auto" style={{ fontSize: '11px', fontFamily: 'Arial, sans-serif' }}>
      {/* Cabeçalho */}
      <div className="border-2 border-black mb-2">
        {/* Linha 1 - Identificação e Chave */}
        <div className="flex border-b border-black">
          <div className="flex-1 p-2 text-center">
            <div className="font-bold text-lg">DANFE</div>
            <div>Documento Auxiliar da Nota Fiscal Eletrônica</div>
            <div className="text-xs">0 - ENTRADA | 1 - SAÍDA</div>
            <div className="font-bold text-lg border border-black inline-block px-2">
              {damfeData.tipoOperacao === 'entrada' ? '0' : '1'}
            </div>
            <div className="text-xs mt-1">Nº {damfeData.numero.padStart(9, '0')}</div>
            <div className="text-xs">SÉRIE {damfeData.serie.padStart(3, '0')}</div>
            <div className="text-xs">FOLHA 01/01</div>
          </div>
          
          <div className="w-32 p-2 border-l border-black text-center">
            <div className="text-xs mb-1">CHAVE DE ACESSO</div>
            <div className="text-xs font-mono break-all">
              {formatChaveAcesso(damfeData.chave)}
            </div>
            <div className="mt-2">
              <img src={barcodeDataURL} alt="Código de barras" className="w-full" />
            </div>
            <div className="text-xs mt-1">
              Consulta de autenticidade no portal nacional da NF-e
              <br />
              www.nfe.fazenda.gov.br/portal
              <br />
              ou no site da Sefaz Autorizadora
            </div>
          </div>
        </div>
        
        {/* Linha 2 - Dados do Emitente */}
        <div className="flex border-b border-black">
          <div className="flex-1 p-2">
            <div className="font-bold text-xs mb-1">EMITENTE</div>
            <div className="font-bold">{damfeData.emitente.razaoSocial}</div>
            {damfeData.emitente.nomeFantasia && (
              <div className="text-xs">{damfeData.emitente.nomeFantasia}</div>
            )}
            <div className="text-xs">
              {damfeData.emitente.endereco.logradouro}, {damfeData.emitente.endereco.numero}
              {damfeData.emitente.endereco.complemento && `, ${damfeData.emitente.endereco.complemento}`}
              <br />
              {damfeData.emitente.endereco.bairro} - {damfeData.emitente.endereco.nomeMunicipio}/{damfeData.emitente.endereco.uf}
              <br />
              CEP: {formatCep(damfeData.emitente.endereco.cep)}
              {damfeData.emitente.endereco.telefone && ` | Fone: ${damfeData.emitente.endereco.telefone}`}
            </div>
          </div>
          
          <div className="w-48 p-2 border-l border-black">
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>
                <div className="font-bold">CNPJ</div>
                <div>{formatCnpjCpf(damfeData.emitente.cnpj)}</div>
              </div>
              <div>
                <div className="font-bold">INSCRIÇÃO ESTADUAL</div>
                <div>{damfeData.emitente.inscricaoEstadual}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Linha 3 - Dados da NFe */}
        <div className="p-2 border-b border-black">
          <div className="grid grid-cols-6 gap-2 text-xs">
            <div>
              <div className="font-bold">NATUREZA DA OPERAÇÃO</div>
              <div>Prestação de Serviço de Transporte</div>
            </div>
            <div>
              <div className="font-bold">PROTOCOLO DE AUTORIZAÇÃO DE USO</div>
              <div>{damfeData.protocolo} - {damfeData.dataAutorizacao}</div>
            </div>
            <div>
              <div className="font-bold">INSCRIÇÃO ESTADUAL SUBST. TRIBUT.</div>
              <div>-</div>
            </div>
            <div>
              <div className="font-bold">DATA/HORA DE EMISSÃO</div>
              <div>{damfeData.dataEmissao}</div>
            </div>
            <div>
              <div className="font-bold">DATA/HORA ENTR./SAÍDA</div>
              <div>{damfeData.dataEntradaSaida} {damfeData.horaEntradaSaida}</div>
            </div>
            <div>
              <div className="font-bold">MUNICÍPIO DA OCORRÊNCIA</div>
              <div>{damfeData.emitente.endereco.nomeMunicipio}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Destinatário/Remetente */}
      <div className="border-2 border-black mb-2">
        <div className="p-2 bg-gray-100 font-bold text-xs">
          DESTINATÁRIO / REMETENTE
        </div>
        <div className="flex">
          <div className="flex-1 p-2">
            <div className="font-bold">{damfeData.destinatario.razaoSocial}</div>
            <div className="text-xs">
              {damfeData.destinatario.endereco.logradouro}, {damfeData.destinatario.endereco.numero}
              {damfeData.destinatario.endereco.complemento && `, ${damfeData.destinatario.endereco.complemento}`}
              <br />
              {damfeData.destinatario.endereco.bairro} - {damfeData.destinatario.endereco.nomeMunicipio}/{damfeData.destinatario.endereco.uf}
              <br />
              CEP: {formatCep(damfeData.destinatario.endereco.cep)}
              {damfeData.destinatario.endereco.telefone && ` | Fone: ${damfeData.destinatario.endereco.telefone}`}
            </div>
          </div>
          
          <div className="w-48 p-2 border-l border-black">
            <div className="grid grid-cols-2 gap-1 text-xs">
              <div>
                <div className="font-bold">CNPJ/CPF</div>
                <div>{formatCnpjCpf(damfeData.destinatario.cnpjCpf)}</div>
              </div>
              <div>
                <div className="font-bold">INSCRIÇÃO ESTADUAL</div>
                <div>{damfeData.destinatario.inscricaoEstadual || 'ISENTO'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Duplicatas/Cobrança */}
      <div className="border-2 border-black mb-2">
        <div className="p-2 bg-gray-100 font-bold text-xs">
          FATURA / DUPLICATAS
        </div>
        <div className="p-2">
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <div className="font-bold">NÚMERO</div>
              <div>{damfeData.numero}</div>
            </div>
            <div>
              <div className="font-bold">VALOR ORIGINAL R$</div>
              <div>{damfeData.totais.valorTotalNF.toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <div className="font-bold">VALOR DO DESCONTO R$</div>
              <div>{(damfeData.totais.valorDesconto || 0).toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <div className="font-bold">VALOR LÍQUIDO R$</div>
              <div>{damfeData.totais.valorTotalNF.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cálculo do Imposto */}
      <div className="border-2 border-black mb-2">
        <div className="p-2 bg-gray-100 font-bold text-xs">
          CÁLCULO DO IMPOSTO
        </div>
        <div className="p-2">
          <div className="grid grid-cols-6 gap-1 text-xs">
            <div>
              <div className="font-bold">BASE DE CÁLC. DO ICMS</div>
              <div>{damfeData.totais.baseCalculoICMS.toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <div className="font-bold">VALOR DO ICMS</div>
              <div>{damfeData.totais.valorICMS.toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <div className="font-bold">VALOR TOTAL DOS PRODUTOS</div>
              <div>{damfeData.totais.valorTotalProdutos.toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <div className="font-bold">VALOR DO FRETE</div>
              <div>{(damfeData.totais.valorFrete || 0).toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <div className="font-bold">VALOR DO SEGURO</div>
              <div>{(damfeData.totais.valorSeguro || 0).toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <div className="font-bold">OUTRAS DESPESAS</div>
              <div>{(damfeData.totais.valorOutrasDespesas || 0).toFixed(2).replace('.', ',')}</div>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1 text-xs mt-2">
            <div>
              <div className="font-bold">VALOR TOTAL DO IPI</div>
              <div>{(damfeData.totais.valorIPI || 0).toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <div className="font-bold">VALOR DO DESCONTO</div>
              <div>{(damfeData.totais.valorDesconto || 0).toFixed(2).replace('.', ',')}</div>
            </div>
            <div>
              <div className="font-bold">VALOR TOTAL DA NF</div>
              <div className="font-bold text-base">
                {damfeData.totais.valorTotalNF.toFixed(2).replace('.', ',')}
              </div>
            </div>
            <div>
              <div className="font-bold">VALOR APROX. TRIBUTOS</div>
              <div>{(damfeData.totais.valorTributosTotais || 0).toFixed(2).replace('.', ',')}</div>
            </div>
            <div></div>
            <div></div>
          </div>
        </div>
      </div>

      {/* Transportador/Volumes */}
      {damfeData.transporte && (
        <div className="border-2 border-black mb-2">
          <div className="p-2 bg-gray-100 font-bold text-xs">
            TRANSPORTADOR / VOLUMES TRANSPORTADOS
          </div>
          <div className="p-2">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="font-bold">RAZÃO SOCIAL</div>
                <div>{damfeData.transporte.transportadora?.razaoSocial}</div>
                <div className="font-bold mt-1">CNPJ/CPF</div>
                <div>{formatCnpjCpf(damfeData.transporte.transportadora?.cnpjCpf || '')}</div>
                <div className="font-bold mt-1">INSCRIÇÃO ESTADUAL</div>
                <div>{damfeData.transporte.transportadora?.inscricaoEstadual}</div>
              </div>
              <div>
                <div className="font-bold">CÓDIGO ANTT</div>
                <div>-</div>
                <div className="font-bold mt-1">PLACA DO VEÍCULO</div>
                <div>{damfeData.transporte.veiculo?.placa}</div>
                <div className="font-bold mt-1">UF</div>
                <div>{damfeData.transporte.veiculo?.uf}</div>
              </div>
            </div>
            
            {damfeData.transporte.volumes && (
              <div className="mt-2">
                <div className="grid grid-cols-5 gap-1 text-xs">
                  <div>
                    <div className="font-bold">QUANTIDADE</div>
                    <div>{damfeData.transporte.volumes[0]?.quantidade}</div>
                  </div>
                  <div>
                    <div className="font-bold">ESPÉCIE</div>
                    <div>{damfeData.transporte.volumes[0]?.especie}</div>
                  </div>
                  <div>
                    <div className="font-bold">MARCA</div>
                    <div>{damfeData.transporte.volumes[0]?.marca || '-'}</div>
                  </div>
                  <div>
                    <div className="font-bold">PESO LÍQUIDO</div>
                    <div>{damfeData.transporte.volumes[0]?.pesoLiquido.toFixed(3).replace('.', ',')}</div>
                  </div>
                  <div>
                    <div className="font-bold">PESO BRUTO</div>
                    <div>{damfeData.transporte.volumes[0]?.pesoBruto.toFixed(3).replace('.', ',')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dados dos Produtos/Serviços */}
      <div className="border-2 border-black mb-2">
        <div className="p-2 bg-gray-100 font-bold text-xs">
          DADOS DOS PRODUTOS / SERVIÇOS
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-black">
                <th className="border-r border-black p-1 w-8">CÓDIGO</th>
                <th className="border-r border-black p-1">DESCRIÇÃO DO PRODUTO / SERVIÇO</th>
                <th className="border-r border-black p-1 w-12">NCM/SH</th>
                <th className="border-r border-black p-1 w-8">CST</th>
                <th className="border-r border-black p-1 w-8">CFOP</th>
                <th className="border-r border-black p-1 w-8">UN</th>
                <th className="border-r border-black p-1 w-12">QUANT.</th>
                <th className="border-r border-black p-1 w-16">VALOR UNIT.</th>
                <th className="border-r border-black p-1 w-16">VALOR TOTAL</th>
                <th className="border-r border-black p-1 w-16">BC ICMS</th>
                <th className="border-r border-black p-1 w-12">ICMS</th>
                <th className="border-r border-black p-1 w-12">ALIQ</th>
                <th className="p-1 w-12">IPI</th>
              </tr>
            </thead>
            <tbody>
              {damfeData.itens.map((item, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="border-r border-black p-1 text-center">{item.codigoProduto}</td>
                  <td className="border-r border-black p-1">{item.descricao}</td>
                  <td className="border-r border-black p-1 text-center">{item.ncm}</td>
                  <td className="border-r border-black p-1 text-center">{item.impostos.icms?.cst}</td>
                  <td className="border-r border-black p-1 text-center">{item.cfop}</td>
                  <td className="border-r border-black p-1 text-center">{item.unidadeComercial}</td>
                  <td className="border-r border-black p-1 text-right">{item.quantidadeComercial.toFixed(0)}</td>
                  <td className="border-r border-black p-1 text-right">{item.valorUnitarioComercial.toFixed(2).replace('.', ',')}</td>
                  <td className="border-r border-black p-1 text-right">{item.valorTotalBruto.toFixed(2).replace('.', ',')}</td>
                  <td className="border-r border-black p-1 text-right">{(item.impostos.icms?.baseCalculo || 0).toFixed(2).replace('.', ',')}</td>
                  <td className="border-r border-black p-1 text-right">{(item.impostos.icms?.valor || 0).toFixed(2).replace('.', ',')}</td>
                  <td className="border-r border-black p-1 text-right">{(item.impostos.icms?.aliquota || 0).toFixed(0)}%</td>
                  <td className="p-1 text-right">{(item.impostos.ipi?.valor || 0).toFixed(2).replace('.', ',')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informações Complementares */}
      {damfeData.informacoesAdicionais?.informacoesComplementares && (
        <div className="border-2 border-black mb-2">
          <div className="p-2 bg-gray-100 font-bold text-xs">
            INFORMAÇÕES COMPLEMENTARES
          </div>
          <div className="p-2 text-xs">
            {damfeData.informacoesAdicionais.informacoesComplementares}
          </div>
        </div>
      )}

      {/* Rodapé */}
      <div className="text-center text-xs mt-4">
        <div>DANFE - Documento Auxiliar da Nota Fiscal Eletrônica</div>
        <div>Esta impressão da Nota Fiscal Eletrônica foi processada pelo sistema CROSSWMS</div>
        <div>Data e hora da impressão: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</div>
      </div>
    </div>
  );
};

export default DAMFEGenerator;
export type { DAMFEData, DAMFEProps };

/**
 * Componente para geração de DAMFE (Documento Auxiliar da Nota Fiscal Eletrônica)
