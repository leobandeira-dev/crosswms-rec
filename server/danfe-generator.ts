import PDFDocument from 'pdfkit';
import { XMLParser } from 'fast-xml-parser';

interface DanfeData {
  chaveAcesso: string;
  numero: string;
  serie: string;
  dataEmissao: string;
  emitente: {
    nome: string;
    cnpj: string;
    ie: string;
    endereco: string;
    cidade: string;
    uf: string;
    cep: string;
    telefone?: string;
  };
  destinatario: {
    nome: string;
    cnpj: string;
    endereco: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  produtos: Array<{
    codigo: string;
    descricao: string;
    quantidade: string;
    unidade: string;
    valorUnitario: string;
    valorTotal: string;
  }>;
  totais: {
    valorProdutos: string;
    valorTotal: string;
    baseCalculoICMS: string;
    valorICMS: string;
  };
  protocolo?: {
    numero: string;
    dataAutorizacao: string;
  };
}

export class DANFEGenerator {
  private doc: PDFDocument;
  private pageWidth: number = 595;
  private pageHeight: number = 842;
  private margin: number = 20;
  private currentY: number = 20;

  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: this.margin,
        bottom: this.margin,
        left: this.margin,
        right: this.margin
      }
    });
  }

  async generateDANFE(data: DanfeData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      
      this.doc.on('data', (chunk: any) => chunks.push(chunk));
      this.doc.on('end', () => resolve(Buffer.concat(chunks)));
      this.doc.on('error', reject);

      try {
        this.drawHeader(data);
        this.drawEmitente(data.emitente);
        this.drawDestinatario(data.destinatario);
        this.drawProdutos(data.produtos);
        this.drawTotais(data.totais);
        this.drawFooter(data);
        
        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private drawHeader(data: DanfeData) {
    // Título principal
    this.doc.fontSize(18)
      .font('Helvetica-Bold')
      .text('DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA', this.margin, this.currentY, {
        width: this.pageWidth - 2 * this.margin,
        align: 'center'
      });
    
    this.currentY += 25;
    
    // DANFE
    this.doc.fontSize(16)
      .text('DANFE', this.margin, this.currentY, {
        width: this.pageWidth - 2 * this.margin,
        align: 'center'
      });
    
    this.currentY += 20;
    
    // Caixa principal do cabeçalho
    const boxHeight = 80;
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight)
      .stroke();
    
    // Divisões internas
    const col1Width = 200;
    const col2Width = 100;
    const col3Width = this.pageWidth - 2 * this.margin - col1Width - col2Width;
    
    // Linha vertical 1
    this.doc.moveTo(this.margin + col1Width, this.currentY)
      .lineTo(this.margin + col1Width, this.currentY + boxHeight)
      .stroke();
    
    // Linha vertical 2
    this.doc.moveTo(this.margin + col1Width + col2Width, this.currentY)
      .lineTo(this.margin + col1Width + col2Width, this.currentY + boxHeight)
      .stroke();
    
    // Entrada/Saída
    this.doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('0 - ENTRADA', this.margin + col1Width + 10, this.currentY + 15);
    this.doc.text('1 - SAÍDA', this.margin + col1Width + 10, this.currentY + 35);
    
    // Número da NFe
    this.doc.fontSize(10)
      .font('Helvetica')
      .text('Nº', this.margin + col1Width + col2Width + 10, this.currentY + 10);
    this.doc.fontSize(14)
      .font('Helvetica-Bold')
      .text(data.numero, this.margin + col1Width + col2Width + 10, this.currentY + 25);
    
    // Série
    this.doc.fontSize(10)
      .font('Helvetica')
      .text('SÉRIE', this.margin + col1Width + col2Width + 10, this.currentY + 45);
    this.doc.fontSize(12)
      .font('Helvetica-Bold')
      .text(data.serie, this.margin + col1Width + col2Width + 10, this.currentY + 60);
    
    this.currentY += boxHeight + 10;
  }

  private drawEmitente(emitente: DanfeData['emitente']) {
    // Título da seção
    this.doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('IDENTIFICAÇÃO DO EMITENTE', this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Caixa do emitente
    const boxHeight = 100;
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight)
      .stroke();
    
    // Conteúdo
    let yPos = this.currentY + 10;
    
    this.doc.fontSize(10)
      .font('Helvetica')
      .text('NOME/RAZÃO SOCIAL', this.margin + 5, yPos);
    yPos += 12;
    this.doc.fontSize(10)
      .font('Helvetica-Bold')
      .text(emitente.nome, this.margin + 5, yPos);
    yPos += 15;
    
    this.doc.fontSize(10)
      .font('Helvetica')
      .text('CNPJ/CPF', this.margin + 5, yPos);
    this.doc.text('INSCRIÇÃO ESTADUAL', this.margin + 200, yPos);
    yPos += 12;
    this.doc.font('Helvetica-Bold')
      .text(this.formatCNPJ(emitente.cnpj), this.margin + 5, yPos);
    this.doc.text(emitente.ie, this.margin + 200, yPos);
    yPos += 15;
    
    this.doc.fontSize(10)
      .font('Helvetica')
      .text('ENDEREÇO', this.margin + 5, yPos);
    yPos += 12;
    this.doc.font('Helvetica-Bold')
      .text(`${emitente.endereco}, ${emitente.cidade} - ${emitente.uf}, CEP: ${emitente.cep}`, 
            this.margin + 5, yPos, { width: this.pageWidth - 2 * this.margin - 10 });
    
    this.currentY += boxHeight + 10;
  }

  private drawDestinatario(destinatario: DanfeData['destinatario']) {
    // Título da seção
    this.doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('DESTINATÁRIO/REMETENTE', this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Caixa do destinatário
    const boxHeight = 80;
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight)
      .stroke();
    
    // Conteúdo
    let yPos = this.currentY + 10;
    
    this.doc.fontSize(10)
      .font('Helvetica')
      .text('NOME/RAZÃO SOCIAL', this.margin + 5, yPos);
    this.doc.text('CNPJ/CPF', this.margin + 350, yPos);
    yPos += 12;
    this.doc.fontSize(10)
      .font('Helvetica-Bold')
      .text(destinatario.nome, this.margin + 5, yPos, { width: 340 });
    this.doc.text(this.formatCNPJ(destinatario.cnpj), this.margin + 350, yPos);
    yPos += 15;
    
    this.doc.fontSize(10)
      .font('Helvetica')
      .text('ENDEREÇO', this.margin + 5, yPos);
    yPos += 12;
    this.doc.font('Helvetica-Bold')
      .text(`${destinatario.endereco}, ${destinatario.cidade} - ${destinatario.uf}, CEP: ${destinatario.cep}`, 
            this.margin + 5, yPos, { width: this.pageWidth - 2 * this.margin - 10 });
    
    this.currentY += boxHeight + 10;
  }

  private drawProdutos(produtos: DanfeData['produtos']) {
    // Título da seção
    this.doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('DADOS DOS PRODUTOS/SERVIÇOS', this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Cabeçalho da tabela
    const tableHeaders = ['CÓDIGO', 'DESCRIÇÃO DO PRODUTO/SERVIÇO', 'QTD', 'UN', 'VL UNIT', 'VL TOTAL'];
    const colWidths = [60, 250, 40, 30, 80, 80];
    const tableHeight = 20;
    
    // Desenhar cabeçalho
    let xPos = this.margin;
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, tableHeight)
      .fillAndStroke('#f0f0f0', '#000000');
    
    this.doc.fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('black');
    
    for (let i = 0; i < tableHeaders.length; i++) {
      if (i > 0) {
        this.doc.moveTo(xPos, this.currentY)
          .lineTo(xPos, this.currentY + tableHeight)
          .stroke();
      }
      
      this.doc.text(tableHeaders[i], xPos + 2, this.currentY + 6, {
        width: colWidths[i] - 4,
        align: 'center'
      });
      
      xPos += colWidths[i];
    }
    
    this.currentY += tableHeight;
    
    // Linhas dos produtos
    produtos.forEach((produto) => {
      xPos = this.margin;
      
      this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, tableHeight)
        .stroke();
      
      const values = [
        produto.codigo,
        produto.descricao.length > 45 ? produto.descricao.substring(0, 42) + '...' : produto.descricao,
        parseFloat(produto.quantidade).toFixed(2),
        produto.unidade,
        parseFloat(produto.valorUnitario).toFixed(2),
        parseFloat(produto.valorTotal).toFixed(2)
      ];
      
      this.doc.fontSize(8)
        .font('Helvetica');
      
      for (let i = 0; i < values.length; i++) {
        if (i > 0) {
          this.doc.moveTo(xPos, this.currentY)
            .lineTo(xPos, this.currentY + tableHeight)
            .stroke();
        }
        
        const align = i >= 2 ? 'right' : 'left';
        const textX = align === 'right' ? xPos + colWidths[i] - 4 : xPos + 2;
        
        this.doc.text(values[i], textX, this.currentY + 6, {
          width: colWidths[i] - 4,
          align: align
        });
        
        xPos += colWidths[i];
      }
      
      this.currentY += tableHeight;
    });
    
    this.currentY += 10;
  }

  private drawTotais(totais: DanfeData['totais']) {
    // Título da seção
    this.doc.fontSize(12)
      .font('Helvetica-Bold')
      .text('CÁLCULO DO IMPOSTO', this.margin, this.currentY);
    
    this.currentY += 15;
    
    // Caixa dos totais
    const boxHeight = 60;
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight)
      .stroke();
    
    // Conteúdo
    let yPos = this.currentY + 10;
    
    this.doc.fontSize(10)
      .font('Helvetica')
      .text('BASE CÁLC. ICMS', this.margin + 5, yPos);
    this.doc.text('VALOR ICMS', this.margin + 150, yPos);
    this.doc.text('VL. TOTAL PROD.', this.margin + 300, yPos);
    this.doc.text('VL. TOTAL NF', this.margin + 450, yPos);
    yPos += 12;
    
    this.doc.fontSize(12)
      .font('Helvetica-Bold')
      .text(parseFloat(totais.baseCalculoICMS).toFixed(2), this.margin + 5, yPos);
    this.doc.text(parseFloat(totais.valorICMS).toFixed(2), this.margin + 150, yPos);
    this.doc.text(parseFloat(totais.valorProdutos).toFixed(2), this.margin + 300, yPos);
    this.doc.text(`R$ ${parseFloat(totais.valorTotal).toFixed(2)}`, this.margin + 450, yPos);
    
    this.currentY += boxHeight + 20;
  }

  private drawFooter(data: DanfeData) {
    // Informações adicionais
    this.doc.fontSize(10)
      .font('Helvetica-Bold')
      .text('DADOS ADICIONAIS', this.margin, this.currentY);
    
    this.currentY += 15;
    
    this.doc.fontSize(8)
      .font('Helvetica')
      .text('Nota Fiscal de Serviço de Transporte - Sistema CrossWMS', this.margin, this.currentY);
    this.currentY += 10;
    this.doc.text(`Chave de Acesso: ${data.chaveAcesso}`, this.margin, this.currentY);
    this.currentY += 10;
    
    if (data.protocolo) {
      this.doc.text(`Protocolo de Autorização: ${data.protocolo.numero}`, this.margin, this.currentY);
      this.currentY += 10;
      this.doc.text(`Data/Hora da Autorização: ${new Date(data.protocolo.dataAutorizacao).toLocaleString('pt-BR')}`, this.margin, this.currentY);
      this.currentY += 10;
    }
    
    // Rodapé
    this.currentY += 20;
    this.doc.fontSize(8)
      .font('Helvetica')
      .text('Consulte a autenticidade no site da SEFAZ ou através do aplicativo "De olho na nota", disponível na AppStore (Apple) e PlayStore (Android)', 
            this.margin, this.currentY, {
              width: this.pageWidth - 2 * this.margin,
              align: 'center'
            });
  }

  private formatCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length === 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  }

  // Método para gerar DANFE a partir de XML
  static parseXMLToDANFE(xmlContent: string): DanfeData | null {
    try {
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        textNodeName: "#text"
      });
      
      const result = parser.parse(xmlContent);
      const nfe = result.nfeProc?.NFe || result.NFe;
      
      if (!nfe) {
        throw new Error('NFe não encontrada no XML');
      }
      
      const infNFe = nfe.infNFe;
      const ide = infNFe.ide;
      const emit = infNFe.emit;
      const dest = infNFe.dest;
      const det = Array.isArray(infNFe.det) ? infNFe.det : [infNFe.det];
      const total = infNFe.total.ICMSTot;
      
      // Construir chave de acesso
      const chaveAcesso = infNFe["@_Id"]?.replace('NFe', '') || '';
      
      return {
        chaveAcesso,
        numero: ide.nNF,
        serie: ide.serie,
        dataEmissao: ide.dhEmi,
        emitente: {
          nome: emit.xNome,
          cnpj: emit.CNPJ || emit.CPF,
          ie: emit.IE,
          endereco: `${emit.enderEmit.xLgr}, ${emit.enderEmit.nro}${emit.enderEmit.xCpl ? ', ' + emit.enderEmit.xCpl : ''}`,
          cidade: emit.enderEmit.xMun,
          uf: emit.enderEmit.UF,
          cep: emit.enderEmit.CEP,
          telefone: emit.enderEmit.fone
        },
        destinatario: {
          nome: dest.xNome,
          cnpj: dest.CNPJ || dest.CPF,
          endereco: `${dest.enderDest.xLgr}, ${dest.enderDest.nro}${dest.enderDest.xCpl ? ', ' + dest.enderDest.xCpl : ''}`,
          cidade: dest.enderDest.xMun,
          uf: dest.enderDest.UF,
          cep: dest.enderDest.CEP
        },
        produtos: det.map((item: any) => ({
          codigo: item.prod.cProd,
          descricao: item.prod.xProd,
          quantidade: item.prod.qCom,
          unidade: item.prod.uCom,
          valorUnitario: item.prod.vUnCom,
          valorTotal: item.prod.vProd
        })),
        totais: {
          valorProdutos: total.vProd,
          valorTotal: total.vNF,
          baseCalculoICMS: total.vBC,
          valorICMS: total.vICMS
        },
        protocolo: result.nfeProc?.protNFe ? {
          numero: result.nfeProc.protNFe.infProt.nProt,
          dataAutorizacao: result.nfeProc.protNFe.infProt.dhRecbto
        } : undefined
      };
    } catch (error) {
      console.error('Erro ao processar XML:', error);
      return null;
    }
  }

  // Método para gerar DANFE básico quando não há XML
  static generateBasicDANFE(notaData: any): Promise<Buffer> {
    const generator = new DANFEGenerator();
    
    const basicData: DanfeData = {
      chaveAcesso: notaData.chave_acesso || '00000000000000000000000000000000000000000000',
      numero: notaData.numero || 'N/A',
      serie: notaData.serie || '001',
      dataEmissao: notaData.dataEmissao || new Date().toISOString(),
      emitente: {
        nome: notaData.remetente || 'DADOS NÃO DISPONÍVEIS',
        cnpj: '00.000.000/0000-00',
        ie: 'ISENTO',
        endereco: 'Endereço não disponível',
        cidade: 'Cidade',
        uf: 'UF',
        cep: '00000-000'
      },
      destinatario: {
        nome: notaData.destinatario || 'DADOS NÃO DISPONÍVEIS',
        cnpj: '00.000.000/0000-00',
        endereco: 'Endereço não disponível',
        cidade: 'Cidade',
        uf: 'UF',
        cep: '00000-000'
      },
      produtos: [
        {
          codigo: '001',
          descricao: 'SERVIÇO DE TRANSPORTE - DADOS LIMITADOS',
          quantidade: '1',
          unidade: 'UN',
          valorUnitario: notaData.valorTotal?.toString() || '0.00',
          valorTotal: notaData.valorTotal?.toString() || '0.00'
        }
      ],
      totais: {
        valorProdutos: notaData.valorTotal?.toString() || '0.00',
        valorTotal: notaData.valorTotal?.toString() || '0.00',
        baseCalculoICMS: '0.00',
        valorICMS: '0.00'
      }
    };
    
    return generator.generateDANFE(basicData);
  }
}