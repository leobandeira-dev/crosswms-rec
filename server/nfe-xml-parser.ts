import { parseString } from 'xml2js';
import { XMLParser } from 'fast-xml-parser';

export interface NFEData {
  // Identificação
  numeroNF: string;
  serie: string;
  dataEmissao: string;
  dataEntrada?: string;
  horaEntrada?: string;
  tipoOperacao: '0' | '1'; // 0=entrada, 1=saída
  chaveAcesso: string;
  protocoloAutorizacao?: string;
  naturezaOperacao: string;
  
  // Emitente
  emitente: {
    razaoSocial: string;
    cnpj: string;
    inscricaoEstadual?: string;
    inscricaoMunicipal?: string;
    endereco: string;
    bairro?: string;
    cidade: string;
    uf: string;
    cep: string;
    telefone?: string;
  };
  
  // Destinatário
  destinatario: {
    razaoSocial: string;
    cnpj: string;
    inscricaoEstadual?: string;
    endereco: string;
    bairro?: string;
    cidade: string;
    uf: string;
    cep: string;
    telefone?: string;
  };
  
  // Produtos/Serviços
  produtos: Array<{
    codigo: string;
    descricao: string;
    ncm?: string;
    cst?: string;
    cfop?: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    valorDesconto?: number;
    baseCalculoICMS?: number;
    valorICMS?: number;
    valorIPI?: number;
    aliquotaICMS?: number;
    aliquotaIPI?: number;
  }>;
  
  // Totais
  totais: {
    baseCalculoICMS: number;
    valorICMS: number;
    baseCalculoICMSST?: number;
    valorICMSST?: number;
    valorImportacao?: number;
    valorTotalProdutos: number;
    valorFrete: number;
    valorSeguro: number;
    valorDesconto: number;
    outrasDespresas: number;
    valorTotalIPI: number;
    valorTotalNota: number;
    valorTotalTributos?: number;
  };
  
  // Transporte
  transporte?: {
    modalidadeFrete: string;
    transportador?: {
      razaoSocial: string;
      cnpj?: string;
      inscricaoEstadual?: string;
      endereco?: string;
      cidade?: string;
      uf?: string;
      codigoANTT?: string;
    };
    veiculo?: {
      placa?: string;
      uf?: string;
    };
    volumes?: Array<{
      quantidade: number;
      especie?: string;
      marca?: string;
      numeracao?: string;
      pesoLiquido?: number;
      pesoBruto?: number;
    }>;
  };
  
  // Cobrança
  cobranca?: {
    duplicatas?: Array<{
      numero: string;
      vencimento: string;
      valor: number;
    }>;
  };
  
  // Informações Adicionais
  informacoesAdicionais?: {
    informacoesContribuinte?: string;
    informacoesFisco?: string;
  };
}

export class NFEXMLParser {
  
  static async parseXMLToNFEData(xmlContent: string): Promise<NFEData> {
    try {
      // Tentar com fast-xml-parser primeiro (mais rápido)
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@',
        textNodeName: '#text',
        parseAttributeValue: true
      });
      
      const jsonObj = parser.parse(xmlContent);
      return this.extractNFEDataFromParsedXML(jsonObj);
      
    } catch (error) {
      console.log('Erro com fast-xml-parser, tentando xml2js:', error);
      
      // Fallback para xml2js
      return new Promise((resolve, reject) => {
        parseString(xmlContent, { explicitArray: false }, (err, result) => {
          if (err) {
            reject(err);
            return;
          }
          
          try {
            const nfeData = this.extractNFEDataFromParsedXML(result);
            resolve(nfeData);
          } catch (parseError) {
            reject(parseError);
          }
        });
      });
    }
  }
  
  private static extractNFEDataFromParsedXML(parsedXML: any): NFEData {
    // Navegar pela estrutura do XML NFe
    let nfeRoot = parsedXML;
    
    // Buscar a estrutura NFe dentro do XML
    if (parsedXML.nfeProc) {
      nfeRoot = parsedXML.nfeProc.NFe || parsedXML.nfeProc;
    } else if (parsedXML.NFe) {
      nfeRoot = parsedXML.NFe;
    }
    
    const infNFe = nfeRoot.infNFe || nfeRoot;
    const ide = infNFe.ide || {};
    const emit = infNFe.emit || {};
    const dest = infNFe.dest || {};
    const det = infNFe.det || [];
    const total = infNFe.total?.ICMSTot || {};
    const transp = infNFe.transp || {};
    const cobr = infNFe.cobr || {};
    const infAdic = infNFe.infAdic || {};
    
    // Protocolo de autorização
    let protocoloAutorizacao = '';
    if (parsedXML.nfeProc?.protNFe?.infProt) {
      const prot = parsedXML.nfeProc.protNFe.infProt;
      protocoloAutorizacao = `${prot.nProt} - ${this.formatDate(prot.dhRecbto)}`;
    }
    
    // Processar produtos (det pode ser array ou objeto único)
    const produtos = Array.isArray(det) ? det : [det];
    const produtosProcessados = produtos.map((item: any) => {
      const prod = item.prod || {};
      const imposto = item.imposto || {};
      const icms = imposto.ICMS || {};
      const ipi = imposto.IPI || {};
      
      // Extrair dados do ICMS (pode estar em diferentes estruturas)
      let icmsData: any = {};
      Object.keys(icms).forEach(key => {
        if (typeof icms[key] === 'object') {
          icmsData = icms[key];
        }
      });
      
      return {
        codigo: prod.cProd || '',
        descricao: prod.xProd || '',
        ncm: prod.NCM || '',
        cst: icmsData.CST || icmsData.CSOSN || '',
        cfop: prod.CFOP || '',
        unidade: prod.uCom || '',
        quantidade: parseFloat(prod.qCom || '0'),
        valorUnitario: parseFloat(prod.vUnCom || '0'),
        valorTotal: parseFloat(prod.vProd || '0'),
        valorDesconto: parseFloat(prod.vDesc || '0'),
        baseCalculoICMS: parseFloat(icmsData.vBC || '0'),
        valorICMS: parseFloat(icmsData.vICMS || '0'),
        aliquotaICMS: parseFloat(icmsData.pICMS || '0'),
        valorIPI: parseFloat(ipi.IPITrib?.vIPI || '0'),
        aliquotaIPI: parseFloat(ipi.IPITrib?.pIPI || '0')
      };
    });
    
    // Processar duplicatas
    const duplicatas: any[] = [];
    if (cobr.dup) {
      const dups = Array.isArray(cobr.dup) ? cobr.dup : [cobr.dup];
      dups.forEach((dup: any) => {
        duplicatas.push({
          numero: dup.nDup || '',
          vencimento: this.formatDate(dup.dVenc),
          valor: parseFloat(dup.vDup || '0')
        });
      });
    }
    
    // Processar volumes
    const volumes: any[] = [];
    if (transp.vol) {
      const vols = Array.isArray(transp.vol) ? transp.vol : [transp.vol];
      vols.forEach((vol: any) => {
        volumes.push({
          quantidade: parseInt(vol.qVol || '0'),
          especie: vol.esp || '',
          marca: vol.marca || '',
          numeracao: vol.nVol || '',
          pesoLiquido: parseFloat(vol.pesoL || '0'),
          pesoBruto: parseFloat(vol.pesoB || '0')
        });
      });
    }
    
    return {
      numeroNF: ide.nNF || '',
      serie: ide.serie || '',
      dataEmissao: this.formatDate(ide.dhEmi),
      dataEntrada: this.formatDate(ide.dhSaiEnt),
      horaEntrada: this.formatTime(ide.dhSaiEnt),
      tipoOperacao: ide.tpNF || '1',
      chaveAcesso: infNFe['@Id']?.replace('NFe', '') || '',
      protocoloAutorizacao,
      naturezaOperacao: ide.natOp || '',
      
      emitente: {
        razaoSocial: emit.xNome || '',
        cnpj: emit.CNPJ || '',
        inscricaoEstadual: emit.IE || '',
        inscricaoMunicipal: emit.IM || '',
        endereco: `${emit.enderEmit?.xLgr || ''}, ${emit.enderEmit?.nro || ''}`,
        bairro: emit.enderEmit?.xBairro || '',
        cidade: emit.enderEmit?.xMun || '',
        uf: emit.enderEmit?.UF || '',
        cep: emit.enderEmit?.CEP || '',
        telefone: emit.enderEmit?.fone || ''
      },
      
      destinatario: {
        razaoSocial: dest.xNome || '',
        cnpj: dest.CNPJ || dest.CPF || '',
        inscricaoEstadual: dest.IE || '',
        endereco: `${dest.enderDest?.xLgr || ''}, ${dest.enderDest?.nro || ''}`,
        bairro: dest.enderDest?.xBairro || '',
        cidade: dest.enderDest?.xMun || '',
        uf: dest.enderDest?.UF || '',
        cep: dest.enderDest?.CEP || '',
        telefone: dest.enderDest?.fone || ''
      },
      
      produtos: produtosProcessados,
      
      totais: {
        baseCalculoICMS: parseFloat(total.vBC || '0'),
        valorICMS: parseFloat(total.vICMS || '0'),
        baseCalculoICMSST: parseFloat(total.vBCST || '0'),
        valorICMSST: parseFloat(total.vST || '0'),
        valorImportacao: parseFloat(total.vII || '0'),
        valorTotalProdutos: parseFloat(total.vProd || '0'),
        valorFrete: parseFloat(total.vFrete || '0'),
        valorSeguro: parseFloat(total.vSeg || '0'),
        valorDesconto: parseFloat(total.vDesc || '0'),
        outrasDespresas: parseFloat(total.vOutro || '0'),
        valorTotalIPI: parseFloat(total.vIPI || '0'),
        valorTotalNota: parseFloat(total.vNF || '0'),
        valorTotalTributos: parseFloat(total.vTotTrib || '0')
      },
      
      transporte: {
        modalidadeFrete: this.getModalidadeFrete(transp.modFrete),
        transportador: transp.transporta ? {
          razaoSocial: transp.transporta.xNome || '',
          cnpj: transp.transporta.CNPJ || '',
          inscricaoEstadual: transp.transporta.IE || '',
          endereco: transp.transporta.xEnder || '',
          cidade: transp.transporta.xMun || '',
          uf: transp.transporta.UF || '',
          codigoANTT: transp.transporta.RNTRC || ''
        } : undefined,
        veiculo: transp.veicTransp ? {
          placa: transp.veicTransp.placa || '',
          uf: transp.veicTransp.UF || ''
        } : undefined,
        volumes: volumes.length > 0 ? volumes : undefined
      },
      
      cobranca: duplicatas.length > 0 ? { duplicatas } : undefined,
      
      informacoesAdicionais: {
        informacoesContribuinte: infAdic.infCpl || '',
        informacoesFisco: infAdic.infAdFisco || ''
      }
    };
  }
  
  private static formatDate(dateString?: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  }
  
  private static formatTime(dateString?: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  }
  
  private static getModalidadeFrete(codigo?: string): string {
    const modalidades: { [key: string]: string } = {
      '0': '0-Por conta do Emit',
      '1': '1-Por conta do Dest',
      '2': '2-Por conta de Terceiros',
      '3': '3-Próprio por conta do Rem',
      '4': '4-Próprio por conta do Dest',
      '9': '9-Sem Ocorrência de Transporte'
    };
    
    return modalidades[codigo || ''] || '';
  }
}