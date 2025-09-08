import { XMLParser } from 'fast-xml-parser';
import jsPDF from 'jspdf';

interface NFe {
  NFe: {
    infNFe: {
      ide: {
        cUF: string;
        cNF: string;
        natOp: string;
        mod: string;
        serie: string;
        nNF: string;
        dhEmi: string;
        dhSaiEnt?: string;
        tpNF: string;
        idDest: string;
        cMunFG: string;
        tpImp: string;
        tpEmis: string;
        cDV: string;
        tpAmb: string;
        finNFe: string;
        indFinal: string;
        indPres: string;
        procEmi: string;
        verProc: string;
      };
      emit: {
        CNPJ?: string;
        CPF?: string;
        xNome: string;
        xFant?: string;
        enderEmit: {
          xLgr: string;
          nro: string;
          xCpl?: string;
          xBairro: string;
          cMun: string;
          xMun: string;
          UF: string;
          CEP: string;
          cPais: string;
          xPais: string;
          fone?: string;
        };
        IE: string;
        IM?: string;
        CRT: string;
      };
      dest: {
        CNPJ?: string;
        CPF?: string;
        idEstrangeiro?: string;
        xNome: string;
        enderDest: {
          xLgr: string;
          nro: string;
          xCpl?: string;
          xBairro: string;
          cMun: string;
          xMun: string;
          UF: string;
          CEP: string;
          cPais: string;
          xPais: string;
          fone?: string;
        };
        indIEDest: string;
        IE?: string;
      };
      det: any[] | any;
      total: {
        ICMSTot: {
          vBC: string;
          vICMS: string;
          vICMSDeson: string;
          vFCP?: string;
          vBCST: string;
          vST: string;
          vFCPST?: string;
          vFCPSTRet?: string;
          vProd: string;
          vFrete: string;
          vSeg: string;
          vDesc: string;
          vII: string;
          vIPI: string;
          vIPIDevol?: string;
          vPIS: string;
          vCOFINS: string;
          vOutro: string;
          vNF: string;
          vTotTrib?: string;
        };
      };
      transp?: {
        modFrete: string;
        transporta?: {
          CNPJ?: string;
          CPF?: string;
          xNome?: string;
          IE?: string;
          xEnder?: string;
          xMun?: string;
          UF?: string;
        };
        vol?: any[] | any;
      };
      cobr?: {
        fat?: {
          nFat?: string;
          vOrig?: string;
          vDesc?: string;
          vLiq?: string;
        };
        dup?: any[] | any;
      };
      pag?: {
        detPag: any[] | any;
      };
      infAdic?: {
        infCpl?: string;
        obsCont?: any[] | any;
        obsFisco?: any[] | any;
      };
    };
  };
  protNFe?: {
    infProt: {
      tpAmb: string;
      verAplic: string;
      chNFe: string;
      dhRecbto: string;
      nProt: string;
      digVal: string;
      cStat: string;
      xMotivo: string;
    };
  };
}

interface ProcessedNFeData {
  chaveAcesso: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  naturezaOperacao: string;
  emitente: {
    nome: string;
    cnpj?: string;
    cpf?: string;
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    ie: string;
    telefone?: string;
  };
  destinatario: {
    nome: string;
    cnpj?: string;
    cpf?: string;
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
    ie?: string;
    telefone?: string;
  };
  produtos: Array<{
    codigo: string;
    descricao: string;
    quantidade: string;
    unidade: string;
    valorUnitario: string;
    valorTotal: string;
    ncm?: string;
    cfop?: string;
  }>;
  totais: {
    baseCalculoICMS: string;
    valorICMS: string;
    baseCalculoICMSST: string;
    valorICMSST: string;
    valorProdutos: string;
    valorFrete: string;
    valorSeguro: string;
    valorDesconto: string;
    valorOutros: string;
    valorIPI: string;
    valorPIS: string;
    valorCOFINS: string;
    valorTotal: string;
  };
  protocolo?: {
    numero: string;
    dataAutorizacao: string;
    statusCode: string;
    statusDescricao: string;
  };
}

export class NFEProcessor {
  private xmlParser: XMLParser;

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      processEntities: true,
      parseAttributeValue: true,
      trimValues: true
    });
  }

  /**
   * Parse XML string and extract NFe data
   */
  parseXML(xmlContent: string): ProcessedNFeData | null {
    try {
      const jsonObj = this.xmlParser.parse(xmlContent);
      
      // Handle different XML root structures
      let nfeData: NFe;
      
      if (jsonObj.nfeProc) {
        nfeData = jsonObj.nfeProc;
      } else if (jsonObj.NFe) {
        nfeData = { NFe: jsonObj.NFe, protNFe: undefined };
      } else {
        throw new Error('Estrutura XML inválida - não encontrada NFe');
      }

      return this.extractNFeData(nfeData);
    } catch (error) {
      console.error('Erro ao processar XML da NFe:', error);
      return null;
    }
  }

  /**
   * Extract structured data from parsed NFe XML
   */
  private extractNFeData(nfeData: NFe): ProcessedNFeData {
    const infNFe = nfeData.NFe.infNFe;
    const ide = infNFe.ide;
    const emit = infNFe.emit;
    const dest = infNFe.dest;
    const total = infNFe.total.ICMSTot;

    // Ensure det is always an array
    const produtos = Array.isArray(infNFe.det) ? infNFe.det : [infNFe.det];

    // Extract key from infNFe Id attribute
    const chaveAcesso = (infNFe as any)['@_Id'] ? (infNFe as any)['@_Id'].replace('NFe', '') : '';

    return {
      chaveAcesso,
      numero: ide.nNF,
      serie: ide.serie,
      dataEmissao: ide.dhEmi,
      naturezaOperacao: ide.natOp,
      emitente: {
        nome: emit.xNome,
        cnpj: emit.CNPJ,
        cpf: emit.CPF,
        endereco: `${emit.enderEmit.xLgr}, ${emit.enderEmit.nro}${emit.enderEmit.xCpl ? ', ' + emit.enderEmit.xCpl : ''}`,
        bairro: emit.enderEmit.xBairro,
        cidade: emit.enderEmit.xMun,
        uf: emit.enderEmit.UF,
        cep: emit.enderEmit.CEP,
        ie: emit.IE,
        telefone: emit.enderEmit.fone
      },
      destinatario: {
        nome: dest.xNome,
        cnpj: dest.CNPJ,
        cpf: dest.CPF,
        endereco: `${dest.enderDest.xLgr}, ${dest.enderDest.nro}${dest.enderDest.xCpl ? ', ' + dest.enderDest.xCpl : ''}`,
        bairro: dest.enderDest.xBairro,
        cidade: dest.enderDest.xMun,
        uf: dest.enderDest.UF,
        cep: dest.enderDest.CEP,
        ie: dest.IE,
        telefone: dest.enderDest.fone
      },
      produtos: produtos.map((item: any) => ({
        codigo: item.prod.cProd,
        descricao: item.prod.xProd,
        quantidade: item.prod.qCom,
        unidade: item.prod.uCom,
        valorUnitario: item.prod.vUnCom,
        valorTotal: item.prod.vProd,
        ncm: item.prod.NCM,
        cfop: item.prod.CFOP
      })),
      totais: {
        baseCalculoICMS: total.vBC,
        valorICMS: total.vICMS,
        baseCalculoICMSST: total.vBCST,
        valorICMSST: total.vST,
        valorProdutos: total.vProd,
        valorFrete: total.vFrete,
        valorSeguro: total.vSeg,
        valorDesconto: total.vDesc,
        valorOutros: total.vOutro,
        valorIPI: total.vIPI,
        valorPIS: total.vPIS,
        valorCOFINS: total.vCOFINS,
        valorTotal: total.vNF
      },
      protocolo: nfeData.protNFe ? {
        numero: nfeData.protNFe.infProt.nProt,
        dataAutorizacao: nfeData.protNFe.infProt.dhRecbto,
        statusCode: nfeData.protNFe.infProt.cStat,
        statusDescricao: nfeData.protNFe.infProt.xMotivo
      } : undefined
    };
  }

  /**
   * Generate DANFE PDF from processed NFe data
   */
  generateDANFE(nfeData: ProcessedNFeData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm', 
          format: 'a4'
        });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 10;
        let yPosition = margin;

        // Header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;

        doc.setFontSize(12);
        doc.text('DANFE', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 12;

        // NFe Info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Número: ${nfeData.numero}-${nfeData.serie}`, margin, yPosition);
        doc.text(`Data Emissão: ${new Date(nfeData.dataEmissao).toLocaleDateString('pt-BR')}`, pageWidth - 60, yPosition);
        yPosition += 8;

        // Chave de acesso
        doc.text(`Chave de Acesso: ${nfeData.chaveAcesso}`, margin, yPosition);
        yPosition += 8;

        if (nfeData.protocolo) {
          doc.text(`Protocolo: ${nfeData.protocolo.numero}`, margin, yPosition);
          doc.text(`Autorizado em: ${new Date(nfeData.protocolo.dataAutorizacao).toLocaleString('pt-BR')}`, pageWidth - 80, yPosition);
          yPosition += 8;
        }

        yPosition += 5;

        // Emitente
        doc.setFont('helvetica', 'bold');
        doc.text('EMITENTE:', margin, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`${nfeData.emitente.nome}`, margin, yPosition);
        yPosition += 5;
        doc.text(`CNPJ/CPF: ${nfeData.emitente.cnpj || nfeData.emitente.cpf || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        doc.text(`${nfeData.emitente.endereco}`, margin, yPosition);
        yPosition += 5;
        doc.text(`${nfeData.emitente.bairro} - ${nfeData.emitente.cidade}/${nfeData.emitente.uf} - CEP: ${nfeData.emitente.cep}`, margin, yPosition);
        yPosition += 5;
        doc.text(`IE: ${nfeData.emitente.ie}`, margin, yPosition);
        if (nfeData.emitente.telefone) {
          doc.text(`Tel: ${nfeData.emitente.telefone}`, pageWidth - 50, yPosition);
        }
        yPosition += 10;

        // Destinatário
        doc.setFont('helvetica', 'bold');
        doc.text('DESTINATÁRIO:', margin, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(`${nfeData.destinatario.nome}`, margin, yPosition);
        yPosition += 5;
        doc.text(`CNPJ/CPF: ${nfeData.destinatario.cnpj || nfeData.destinatario.cpf || 'N/A'}`, margin, yPosition);
        yPosition += 5;
        doc.text(`${nfeData.destinatario.endereco}`, margin, yPosition);
        yPosition += 5;
        doc.text(`${nfeData.destinatario.bairro} - ${nfeData.destinatario.cidade}/${nfeData.destinatario.uf} - CEP: ${nfeData.destinatario.cep}`, margin, yPosition);
        yPosition += 5;
        if (nfeData.destinatario.ie) {
          doc.text(`IE: ${nfeData.destinatario.ie}`, margin, yPosition);
          yPosition += 5;
        }
        yPosition += 10;

        // Produtos
        doc.setFont('helvetica', 'bold');
        doc.text('PRODUTOS/SERVIÇOS:', margin, yPosition);
        yPosition += 8;

        // Table header
        doc.setFontSize(8);
        const colWidths = [15, 60, 15, 15, 20, 25, 25];
        const headers = ['Código', 'Descrição', 'NCM', 'CFOP', 'Unid.', 'Qtde', 'Vl Unit', 'Vl Total'];
        let xPos = margin;

        doc.setFont('helvetica', 'bold');
        headers.forEach((header, i) => {
          if (i < colWidths.length) {
            doc.text(header, xPos, yPosition);
            xPos += colWidths[i];
          }
        });
        yPosition += 6;

        // Table rows
        doc.setFont('helvetica', 'normal');
        nfeData.produtos.forEach((produto) => {
          if (yPosition > 250) { // New page if needed
            doc.addPage();
            yPosition = margin;
          }

          xPos = margin;
          const values = [
            produto.codigo,
            produto.descricao.length > 35 ? produto.descricao.substring(0, 32) + '...' : produto.descricao,
            produto.ncm || '',
            produto.cfop || '',
            produto.unidade,
            parseFloat(produto.quantidade).toFixed(2),
            parseFloat(produto.valorUnitario).toFixed(2),
            parseFloat(produto.valorTotal).toFixed(2)
          ];

          values.forEach((value, i) => {
            if (i < colWidths.length) {
              if (i >= 5) { // Right align numeric values
                doc.text(value, xPos + colWidths[i] - 2, yPosition, { align: 'right' });
              } else {
                doc.text(value, xPos, yPosition);
              }
              xPos += colWidths[i];
            }
          });
          yPosition += 5;
        });

        yPosition += 10;

        // Totals
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAIS:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');

        const totals = [
          ['Base Cálc. ICMS', parseFloat(nfeData.totais.baseCalculoICMS).toFixed(2)],
          ['Valor ICMS', parseFloat(nfeData.totais.valorICMS).toFixed(2)],
          ['Valor Produtos', parseFloat(nfeData.totais.valorProdutos).toFixed(2)],
          ['Valor Frete', parseFloat(nfeData.totais.valorFrete).toFixed(2)],
          ['Valor Desconto', parseFloat(nfeData.totais.valorDesconto).toFixed(2)],
          ['Valor Total da NFe', parseFloat(nfeData.totais.valorTotal).toFixed(2)]
        ];

        totals.forEach(([label, value]) => {
          doc.text(`${label}: R$ ${value}`, margin, yPosition);
          yPosition += 5;
        });

        // Generate QR Code representation (simplified)
        yPosition += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('Consulte pela Chave de Acesso em:', margin, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        doc.text('http://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx', margin, yPosition);

        // Convert to buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        resolve(pdfBuffer);

      } catch (error) {
        console.error('Erro ao gerar DANFE:', error);
        reject(error);
      }
    });
  }

  /**
   * Generate DANFE from XML string directly
   */
  async generateDANFEFromXML(xmlContent: string): Promise<Buffer | null> {
    try {
      const nfeData = this.parseXML(xmlContent);
      if (!nfeData) {
        throw new Error('Não foi possível processar o XML da NFe');
      }

      return await this.generateDANFE(nfeData);
    } catch (error) {
      console.error('Erro ao gerar DANFE do XML:', error);
      
      // Se falhar, gerar DANFE básico de fallback
      try {
        console.log('Gerando DANFE básico de fallback...');
        return this.generateBasicDANFE();
      } catch (fallbackError) {
        console.error('Fallback também falhou:', fallbackError);
        return null;
      }
    }
  }

  /**
   * Validate NFe XML structure
   */
  validateXML(xmlContent: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const nfeData = this.parseXML(xmlContent);
      
      if (!nfeData) {
        errors.push('XML inválido ou corrompido');
        return { valid: false, errors };
      }

      // Basic validations
      if (!nfeData.chaveAcesso || nfeData.chaveAcesso.length !== 44) {
        errors.push('Chave de acesso inválida');
      }

      if (!nfeData.numero) {
        errors.push('Número da NFe não encontrado');
      }

      if (!nfeData.emitente.nome) {
        errors.push('Nome do emitente não encontrado');
      }

      if (!nfeData.destinatario.nome) {
        errors.push('Nome do destinatário não encontrado');
      }

      if (!nfeData.produtos || nfeData.produtos.length === 0) {
        errors.push('Nenhum produto encontrado na NFe');
      }

      return { valid: errors.length === 0, errors };

    } catch (error) {
      errors.push(`Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return { valid: false, errors };
    }
  }

  /**
   * Generate basic DANFE when XML is not available
   */
  generateBasicDANFE(): Buffer {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text('DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA', 105, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('DANFE', 105, 40, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('0 - ENTRADA', 30, 60);
    doc.text('1 - SAÍDA', 120, 60);
    
    // Seção de identificação
    doc.setFontSize(14);
    doc.text('IDENTIFICAÇÃO DO EMITENTE', 30, 80);
    
    doc.setFontSize(10);
    doc.text('Razão Social: DADOS NÃO DISPONÍVEIS', 30, 95);
    doc.text('Nome Fantasia: -', 30, 105);
    doc.text('CNPJ: -', 30, 115);
    doc.text('Inscrição Estadual: -', 30, 125);
    
    // Endereço
    doc.text('Endereço: -', 30, 140);
    doc.text('Bairro: -', 30, 150);
    doc.text('CEP: -', 30, 160);
    doc.text('Município: -', 30, 170);
    doc.text('UF: -', 150, 170);
    doc.text('Telefone: -', 30, 180);
    
    // Destinatário
    doc.setFontSize(14);
    doc.text('DESTINATÁRIO/REMETENTE', 30, 200);
    
    doc.setFontSize(10);
    doc.text('Nome/Razão Social: DADOS NÃO DISPONÍVEIS', 30, 215);
    doc.text('CNPJ/CPF: -', 30, 225);
    doc.text('Inscrição Estadual: -', 30, 235);
    
    // Aviso
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0);
    doc.text('ATENÇÃO: DANFE gerado sem XML da NFe', 105, 260, { align: 'center' });
    doc.text('Para DANFE completo, forneça o XML da nota fiscal', 105, 270, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text('Consulte a autenticidade no site da SEFAZ', 105, 285, { align: 'center' });
    
    return Buffer.from(doc.output('arraybuffer'));
  }
}

export default NFEProcessor;