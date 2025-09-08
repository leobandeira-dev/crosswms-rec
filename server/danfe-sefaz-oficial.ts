import PDFDocument from 'pdfkit';
import { NFEData } from './nfe-xml-parser.js';

export class DANFESefazOficial {
  static async gerarDANFEOficial(nfeData: NFEData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        console.log('📋 Gerando DANFE oficial SEFAZ para NFe:', nfeData.numeroNF);
        
        const doc = new PDFDocument({ 
          size: 'A4', 
          margin: 15,
          font: 'Helvetica'
        });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          console.log('✅ DANFE oficial gerado:', pdfBuffer.length, 'bytes');
          resolve(pdfBuffer);
        });
        doc.on('error', reject);

        const pageWidth = 570; // A4 width minus margins
        const margin = 15;
        let currentY = margin;

        // 1. CABEÇALHO COM IDENTIFICAÇÃO
        currentY = this.desenharCabecalhoCompleto(doc, nfeData, margin, currentY, pageWidth);
        
        // 2. DESTINATÁRIO/REMETENTE
        currentY = this.desenharDadosDestinatario(doc, nfeData, margin, currentY, pageWidth);
        
        // 3. DADOS DO PRODUTO/SERVIÇO
        currentY = this.desenharTabelaProdutos(doc, nfeData, margin, currentY, pageWidth);
        
        // 4. CÁLCULO DO IMPOSTO
        currentY = this.desenharCalculoImposto(doc, nfeData, margin, currentY, pageWidth);
        
        // 5. TRANSPORTADOR/VOLUMES
        currentY = this.desenharDadosTransporte(doc, nfeData, margin, currentY, pageWidth);
        
        // 6. DADOS ADICIONAIS
        currentY = this.desenharDadosAdicionais(doc, nfeData, margin, currentY, pageWidth);
        
        // 7. CÓDIGO DE BARRAS
        this.desenharCodigoBarras(doc, nfeData, margin, currentY, pageWidth);

        doc.end();
        
      } catch (error) {
        console.error('❌ Erro na geração DANFE oficial:', error);
        reject(error);
      }
    });
  }

  private static desenharCabecalhoCompleto(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 120;
    
    // Layout padrão SEFAZ: 3 colunas
    const col1Width = width * 0.4;   // Emitente
    const col2Width = width * 0.3;   // DANFE
    const col3Width = width * 0.3;   // Chave/QR

    // COLUNA 1: DADOS DO EMITENTE
    doc.rect(x, y, col1Width, height).stroke();
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text(nfeData.emitente.razaoSocial.toUpperCase(), x + 5, y + 5, { width: col1Width - 10 });
    
    doc.fontSize(8).font('Helvetica');
    const enderecoCompleto = `${nfeData.emitente.endereco}, ${nfeData.emitente.bairro || ''}`;
    doc.text(enderecoCompleto, x + 5, y + 25, { width: col1Width - 10 });
    doc.text(`${nfeData.emitente.cidade} - ${nfeData.emitente.uf}  CEP: ${this.formatarCEP(String(nfeData.emitente.cep || ''))}`, x + 5, y + 40);
    doc.text(`Fone/Fax: ${nfeData.emitente.telefone || 'N/I'}`, x + 5, y + 55);
    doc.text(`CNPJ: ${this.formatarCNPJ(String(nfeData.emitente.cnpj))}`, x + 5, y + 70);
    doc.text(`IE: ${nfeData.emitente.inscricaoEstadual || 'N/I'}`, x + 5, y + 85);

    // COLUNA 2: DANFE
    const col2X = x + col1Width;
    doc.rect(col2X, y, col2Width, height).stroke();
    
    doc.fontSize(18).font('Helvetica-Bold');
    doc.text('DANFE', col2X + col2Width/2 - 25, y + 15);
    
    doc.fontSize(8).font('Helvetica');
    doc.text('Documento Auxiliar da Nota', col2X + 5, y + 35, { width: col2Width - 10, align: 'center' });
    doc.text('Fiscal Eletrônica', col2X + 5, y + 45, { width: col2Width - 10, align: 'center' });
    
    // Tipo de operação
    doc.fontSize(10).font('Helvetica-Bold');
    const tipoText = nfeData.tipoOperacao === '1' ? 'SAÍDA' : 'ENTRADA';
    doc.text(`${tipoText} Nº`, col2X + 5, y + 60);
    doc.text(String(nfeData.numeroNF || '').padStart(9, '0'), col2X + 5, y + 75);
    doc.text(`Série ${String(nfeData.serie || '')}`, col2X + 5, y + 90);
    doc.text('Folha 01/01', col2X + 5, y + 105);

    // COLUNA 3: CHAVE DE ACESSO
    const col3X = x + col1Width + col2Width;
    doc.rect(col3X, y, col3Width, height).stroke();
    
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('CHAVE DE ACESSO', col3X + 5, y + 5);
    
    if (nfeData.chaveAcesso) {
      // Formatar chave em grupos de 4 dígitos
      const chaveFormatada = nfeData.chaveAcesso.replace(/(.{4})/g, '$1 ').trim();
      doc.fontSize(8).font('Helvetica');
      doc.text(chaveFormatada, col3X + 5, y + 20, { width: col3Width - 10 });
    }
    
    // Consulta pela chave
    doc.fontSize(7).font('Helvetica');
    doc.text('Consulta de autenticidade no portal', col3X + 5, y + 70, { width: col3Width - 10 });
    doc.text('nacional da NF-e', col3X + 5, y + 80, { width: col3Width - 10 });
    doc.text('www.nfe.fazenda.gov.br/portal', col3X + 5, y + 90, { width: col3Width - 10 });
    doc.text('ou no site da Sefaz Autorizadora', col3X + 5, y + 100, { width: col3Width - 10 });

    return y + height + 5;
  }

  private static desenharDadosDestinatario(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 50;
    
    // Cabeçalho
    doc.rect(x, y, width, 15).stroke();
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('DESTINATÁRIO / REMETENTE', x + 5, y + 5);
    
    // Dados
    doc.rect(x, y + 15, width, height - 15).stroke();
    doc.fontSize(8).font('Helvetica');
    
    const dest = nfeData.destinatario;
    doc.text(`Nome/Razão Social: ${dest.razaoSocial || 'N/I'}`, x + 5, y + 20);
    doc.text(`CNPJ/CPF: ${this.formatarDocumento(dest.cnpj)}`, x + 5, y + 32);
    doc.text(`Data de Emissão: ${nfeData.dataEmissao || 'N/I'}`, x + 300, y + 32);
    
    const endDest = `${dest.endereco || ''}, ${dest.cidade || ''} - ${dest.uf || ''}`;
    doc.text(`Endereço: ${endDest}`, x + 5, y + 44);
    doc.text(`CEP: ${this.formatarCEP(String(dest.cep || ''))}`, x + 450, y + 44);

    return y + height + 5;
  }

  private static desenharTabelaProdutos(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const headerHeight = 25;
    const rowHeight = 15;
    
    // Cabeçalho da tabela
    doc.rect(x, y, width, headerHeight).stroke();
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('DADOS DOS PRODUTOS / SERVIÇOS', x + 5, y + 5);
    
    // Headers das colunas
    const startY = y + headerHeight;
    doc.rect(x, startY, width, 15).stroke();
    
    // Definir larguras das colunas
    const colWidths = [40, 40, 180, 30, 40, 40, 50, 40, 50, 50];
    let currentX = x;
    const headers = ['CÓD. PROD', 'QTDE', 'DESCRIÇÃO DOS PRODUTOS/SERVIÇOS', 'UN', 'VL UNIT', 'VL TOTAL', 'BC ICMS', 'VL ICMS', 'ALÍQ', 'CFOP'];
    
    headers.forEach((header, index) => {
      doc.text(header, currentX + 2, startY + 3, { width: colWidths[index] - 4, fontSize: 6 });
      doc.rect(currentX, startY, colWidths[index], 15).stroke();
      currentX += colWidths[index];
    });
    
    // Dados dos produtos
    let rowY = startY + 15;
    const produtos = nfeData.produtos || [];
    
    produtos.forEach((produto, index) => {
      doc.rect(x, rowY, width, rowHeight).stroke();
      
      currentX = x;
      const values = [
        produto.codigo || '',
        String(produto.quantidade || ''),
        produto.descricao || '',
        produto.unidade || '',
        this.formatarMoeda(produto.valorUnitario),
        this.formatarMoeda(produto.valorTotal),
        this.formatarMoeda(produto.baseCalculoICMS),
        this.formatarMoeda(produto.valorICMS),
        produto.aliquotaICMS ? `${produto.aliquotaICMS}%` : '',
        produto.cfop || ''
      ];
      
      values.forEach((value, colIndex) => {
        doc.fontSize(7).font('Helvetica');
        doc.text(value, currentX + 2, rowY + 3, { width: colWidths[colIndex] - 4 });
        doc.rect(currentX, rowY, colWidths[colIndex], rowHeight).stroke();
        currentX += colWidths[colIndex];
      });
      
      rowY += rowHeight;
    });

    return rowY + 5;
  }

  private static desenharCalculoImposto(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 40;
    
    // Cabeçalho
    doc.rect(x, y, width, 15).stroke();
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('CÁLCULO DO IMPOSTO', x + 5, y + 5);
    
    // Valores
    doc.rect(x, y + 15, width, height - 15).stroke();
    doc.fontSize(8).font('Helvetica');
    
    const totais = nfeData.totais || {};
    const col1X = x + 5;
    const col2X = x + width * 0.33;
    const col3X = x + width * 0.66;
    
    doc.text(`Base Cálc. ICMS: ${this.formatarMoeda(totais.baseCalculoICMS)}`, col1X, y + 20);
    doc.text(`Valor do ICMS: ${this.formatarMoeda(totais.valorICMS)}`, col2X, y + 20);
    doc.text(`Valor Total dos Produtos: ${this.formatarMoeda(totais.valorTotalProdutos)}`, col3X, y + 20);
    
    doc.text(`Valor do Frete: ${this.formatarMoeda(totais.valorFrete)}`, col1X, y + 35);
    doc.text(`Valor do Seguro: ${this.formatarMoeda(totais.valorSeguro)}`, col2X, y + 35);
    doc.text(`Valor Total da NF: ${this.formatarMoeda(totais.valorTotalNota)}`, col3X, y + 35);

    return y + height + 5;
  }

  private static desenharDadosTransporte(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 35;
    
    // Cabeçalho
    doc.rect(x, y, width, 15).stroke();
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('TRANSPORTADOR / VOLUMES TRANSPORTADOS', x + 5, y + 5);
    
    // Dados
    doc.rect(x, y + 15, width, height - 15).stroke();
    doc.fontSize(8).font('Helvetica');
    
    const transp = nfeData.transporte?.transportador;
    if (transp) {
      doc.text(`Razão Social: ${transp.razaoSocial || 'N/I'}`, x + 5, y + 20);
      doc.text(`CNPJ/CPF: ${this.formatarDocumento(transp.cnpj)}`, x + 300, y + 20);
    }

    return y + height + 5;
  }

  private static desenharDadosAdicionais(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 50;
    
    // Cabeçalho
    doc.rect(x, y, width, 15).stroke();
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('DADOS ADICIONAIS', x + 5, y + 5);
    
    // Conteúdo
    doc.rect(x, y + 15, width, height - 15).stroke();
    doc.fontSize(7).font('Helvetica');
    
    // Informações complementares
    let infoY = y + 20;
    doc.text('INFORMAÇÕES COMPLEMENTARES:', x + 5, infoY);
    infoY += 10;
    
    // Protocolo de autorização (simulado)
    doc.text(`Protocolo de autorização: ${nfeData.chaveAcesso || 'N/I'}`, x + 5, infoY);
    infoY += 8;
    doc.text(`Data/Hora de Autorização: ${nfeData.dataEmissao || 'N/I'}`, x + 5, infoY);

    return y + height + 5;
  }

  private static desenharCodigoBarras(doc: any, nfeData: NFEData, x: number, y: number, width: number): void {
    if (!nfeData.chaveAcesso) return;

    // Simulação de código de barras com texto formatado
    doc.fontSize(8).font('Helvetica');
    doc.text('CÓDIGO DE BARRAS (CHAVE DE ACESSO):', x + 5, y + 5);
    
    // Desenhar retângulo representando código de barras
    doc.rect(x + width/2 - 150, y + 20, 300, 30).stroke();
    
    // Chave formatada em barras simuladas
    doc.fontSize(10).font('Courier');
    const chaveFormatada = nfeData.chaveAcesso.replace(/(.{4})/g, '| $1 ').trim() + ' |';
    doc.text(chaveFormatada, x + width/2 - 140, y + 30, { width: 280, align: 'center' });
  }

  // Métodos utilitários de formatação
  private static formatarCNPJ(cnpj: string | undefined): string {
    if (!cnpj) return 'N/I';
    const digits = String(cnpj).replace(/\D/g, '');
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  private static formatarCEP(cep: string | number | undefined): string {
    if (!cep) return 'N/I';
    const digits = String(cep).replace(/\D/g, '');
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  private static formatarDocumento(doc: string | undefined): string {
    if (!doc) return 'N/I';
    const digits = String(doc).replace(/\D/g, '');
    
    if (digits.length === 14) {
      return this.formatarCNPJ(digits);
    } else if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return String(doc);
  }

  private static formatarMoeda(valor: any): string {
    if (!valor && valor !== 0) return '0,00';
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return num.toFixed(2).replace('.', ',');
  }
}