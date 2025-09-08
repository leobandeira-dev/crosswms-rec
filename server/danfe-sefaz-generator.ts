import PDFDocument from 'pdfkit';

export interface NotaFiscalData {
  id?: string;
  chave_acesso?: string;
  numero_nf?: string;
  serie?: string;
  emitente_razao_social?: string;
  emitente_cnpj?: string;
  emitente_endereco?: string;
  emitente_cidade?: string;
  emitente_uf?: string;
  emitente_cep?: string;
  destinatario_razao_social?: string;
  destinatario_cnpj?: string;
  destinatario_endereco?: string;
  destinatario_cidade?: string;
  destinatario_uf?: string;
  destinatario_cep?: string;
  valor_total?: number;
  data_emissao?: string;
}

export class DANFESefazGenerator {
  
  static async generateSefazCompliantDANFE(notaData: NotaFiscalData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4',
          margins: { top: 20, bottom: 20, left: 20, right: 20 }
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Configurações gerais
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // Layout SEFAZ padrão - Header com divisões
        const headerHeight = 80;
        
        // Coluna 1: Recibo do destinatário
        const col1Width = 200;
        doc.rect(margin, margin, col1Width, headerHeight).stroke();
        doc.fontSize(8).font('Helvetica');
        doc.text('RECEBEMOS DE', margin + 5, margin + 5);
        doc.text(notaData.emitente_razao_social || 'DADOS NÃO DISPONÍVEIS', margin + 5, margin + 15, {
          width: col1Width - 10
        });
        doc.text('OS PRODUTOS/SERVIÇOS CONSTANTES DA NOTA FISCAL INDICADA AO LADO', margin + 5, margin + 30, {
          width: col1Width - 10
        });
        
        const dataEmissao = new Date().toISOString().split('T')[0];
        doc.text('EMISSÃO: ' + dataEmissao, margin + 5, margin + 50);
        doc.text('DEST./REM.: ' + (notaData.destinatario_razao_social || 'N/A'), margin + 5, margin + 62, {
          width: col1Width - 10
        });
        
        // Coluna 2: Número e série
        const col2Width = 120;
        doc.rect(margin + col1Width, margin, col2Width, headerHeight).stroke();
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('NF-e', margin + col1Width + 40, margin + 5);
        doc.text('Nº ' + (notaData.numero_nf || 'N/A'), margin + col1Width + 5, margin + 20);
        doc.text('SÉRIE ' + (notaData.serie || '1'), margin + col1Width + 5, margin + 35);
        
        // Coluna 3: Entrada/Saída
        const col3Width = contentWidth - col1Width - col2Width;
        doc.rect(margin + col1Width + col2Width, margin, col3Width, headerHeight).stroke();
        doc.fontSize(8).font('Helvetica');
        doc.text('0 - ENTRADA', margin + col1Width + col2Width + 5, margin + 5);
        doc.text('1 - SAÍDA', margin + col1Width + col2Width + 5, margin + 20);
        doc.rect(margin + col1Width + col2Width + 70, margin + 15, 10, 10).stroke();
        doc.text('X', margin + col1Width + col2Width + 72, margin + 17);

        // Título DANFE
        let currentY = margin + headerHeight + 10;
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA', margin, currentY, {
          width: contentWidth,
          align: 'center'
        });

        currentY += 20;
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('DANFE', margin, currentY, {
          width: contentWidth,
          align: 'center'
        });

        currentY += 30;

        // Chave de acesso
        if (notaData.chave_acesso) {
          doc.fontSize(8).font('Helvetica');
          doc.text('CHAVE DE ACESSO', margin, currentY);
          currentY += 12;
          doc.fontSize(10).font('Helvetica-Bold');
          doc.text(this.formatChaveAcesso(notaData.chave_acesso), margin, currentY);
          currentY += 20;
        }

        currentY += 10;

        // Seção IDENTIFICAÇÃO DO EMITENTE
        doc.rect(margin, currentY, contentWidth, 80).stroke();
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('IDENTIFICAÇÃO DO EMITENTE', margin + 5, currentY + 5);
        
        doc.fontSize(9).font('Helvetica');
        doc.text('NOME/RAZÃO SOCIAL', margin + 5, currentY + 20);
        doc.text(notaData.emitente_razao_social || 'DADOS NÃO DISPONÍVEIS', margin + 5, currentY + 32);
        
        doc.text('CNPJ/CPF', margin + 5, currentY + 45);
        doc.text(this.formatCNPJ(notaData.emitente_cnpj) || '00.000.000/0000-00', margin + 5, currentY + 57);

        doc.text('INSCRIÇÃO ESTADUAL', margin + 200, currentY + 45);
        doc.text('ISENTO', margin + 200, currentY + 57);

        doc.text('ENDEREÇO', margin + 350, currentY + 20);
        doc.text(notaData.emitente_endereco || 'Endereço não disponível', margin + 350, currentY + 32, {
          width: 200
        });

        currentY += 90;

        // Seção DESTINATÁRIO/REMETENTE
        doc.rect(margin, currentY, contentWidth, 80).stroke();
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('DESTINATÁRIO/REMETENTE', margin + 5, currentY + 5);
        
        doc.fontSize(9).font('Helvetica');
        doc.text('NOME/RAZÃO SOCIAL', margin + 5, currentY + 20);
        doc.text(notaData.destinatario_razao_social || 'DADOS NÃO DISPONÍVEIS', margin + 5, currentY + 32);
        
        doc.text('CNPJ/CPF', margin + 5, currentY + 45);
        doc.text(this.formatCNPJ(notaData.destinatario_cnpj) || '00.000.000/0000-00', margin + 5, currentY + 57);

        doc.text('ENDEREÇO', margin + 350, currentY + 20);
        doc.text(notaData.destinatario_endereco || 'Endereço não disponível', margin + 350, currentY + 32, {
          width: 200
        });

        currentY += 90;

        // Seção DADOS DOS PRODUTOS/SERVIÇOS
        doc.rect(margin, currentY, contentWidth, 120).stroke();
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('DADOS DOS PRODUTOS/SERVIÇOS', margin + 5, currentY + 5);

        // Cabeçalho da tabela
        const tableY = currentY + 25;
        const colWidths = [40, 200, 50, 40, 80, 80];
        let colX = margin + 5;

        doc.fontSize(8).font('Helvetica-Bold');
        doc.text('CÓDIGO', colX, tableY);
        colX += colWidths[0];
        doc.text('DESCRIÇÃO DO PRODUTO/SERVIÇO', colX, tableY);
        colX += colWidths[1];
        doc.text('QTD', colX, tableY);
        colX += colWidths[2];
        doc.text('UN', colX, tableY);
        colX += colWidths[3];
        doc.text('VL.UNIT', colX, tableY);
        colX += colWidths[4];
        doc.text('VL.TOTAL', colX, tableY);

        // Linha da tabela
        const rowY = tableY + 15;
        colX = margin + 5;
        doc.fontSize(8).font('Helvetica');
        doc.text('001', colX, rowY);
        colX += colWidths[0];
        doc.text('SERVIÇO DE TRANSPORTE - DADOS LIMITADOS', colX, rowY);
        colX += colWidths[1];
        doc.text('1', colX, rowY);
        colX += colWidths[2];
        doc.text('UN', colX, rowY);
        colX += colWidths[3];
        doc.text('0,00', colX, rowY);
        colX += colWidths[4];
        doc.text('0,00', colX, rowY);

        currentY += 130;

        // Seção CÁLCULO DO IMPOSTO
        doc.rect(margin, currentY, contentWidth, 50).stroke();
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('CÁLCULO DO IMPOSTO', margin + 5, currentY + 5);

        doc.fontSize(9).font('Helvetica');
        const impostoY = currentY + 20;
        doc.text('BASE CÁLC. ICMS', margin + 5, impostoY);
        doc.text('0,00', margin + 5, impostoY + 12);

        doc.text('VALOR ICMS', margin + 100, impostoY);
        doc.text('0,00', margin + 100, impostoY + 12);

        doc.text('VL. TOTAL PROD.', margin + 200, impostoY);
        doc.text('0,00', margin + 200, impostoY + 12);

        doc.text('VL. TOTAL NF', margin + 350, impostoY);
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`R$ ${(notaData.valor_total || 0).toFixed(2)}`, margin + 350, impostoY + 12);

        currentY += 60;

        // Seção DADOS ADICIONAIS
        doc.rect(margin, currentY, contentWidth, 100).stroke();
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('DADOS ADICIONAIS', margin + 5, currentY + 5);

        doc.fontSize(8).font('Helvetica');
        doc.text('Nota Fiscal de Serviços de Transporte - Sistema CrossWMS', margin + 5, currentY + 20);
        
        if (notaData.chave_acesso) {
          doc.text(`Chave de Acesso: ${this.formatChaveAcesso(notaData.chave_acesso)}`, margin + 5, currentY + 35);
        }

        doc.text('Consulte a autenticidade no site da SEFAZ ou através do aplicativo "De olho na nota", disponível na AppStore (Apple) e PlayStore (Android)', margin + 5, currentY + 55, {
          width: contentWidth - 10,
          align: 'justify'
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private static formatCNPJ(cnpj?: string): string {
    if (!cnpj) return '';
    const cleaned = cnpj.replace(/\D/g, '');
    if (cleaned.length === 14) {
      return `${cleaned.substr(0, 2)}.${cleaned.substr(2, 3)}.${cleaned.substr(5, 3)}/${cleaned.substr(8, 4)}-${cleaned.substr(12, 2)}`;
    }
    return cnpj;
  }

  private static formatChaveAcesso(chave?: string): string {
    if (!chave) return '';
    const cleaned = chave.replace(/\D/g, '');
    if (cleaned.length === 44) {
      return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    return chave;
  }
}
