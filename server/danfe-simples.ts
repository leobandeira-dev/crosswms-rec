import PDFDocument from 'pdfkit';
import { NFEData } from './nfe-xml-parser.js';

export class DANFESimples {
  static async gerarDANFE(nfeData: NFEData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        console.log('📄 Iniciando geração DANFE simples');
        console.log('📋 Dados recebidos:', {
          numero: nfeData.numeroNF,
          serie: nfeData.serie,
          emitente: nfeData.emitente?.razaoSocial,
          destinatario: nfeData.destinatario?.razaoSocial
        });

        const doc = new PDFDocument({ size: 'A4', margin: 30 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          console.log('✅ PDF gerado com sucesso:', pdfBuffer.length, 'bytes');
          resolve(pdfBuffer);
        });
        doc.on('error', (error) => {
          console.error('❌ Erro no PDF:', error);
          reject(error);
        });

        // Cabeçalho principal
        doc.fontSize(20).font('Helvetica-Bold');
        doc.text('DANFE - Documento Auxiliar da NF-e', 50, 50, { align: 'center' });
        
        // Informações básicas
        doc.fontSize(12).font('Helvetica');
        let y = 100;
        
        doc.text(`Número da NF-e: ${nfeData.numeroNF || 'N/A'}`, 50, y);
        y += 20;
        doc.text(`Série: ${nfeData.serie || 'N/A'}`, 50, y);
        y += 20;
        doc.text(`Data de Emissão: ${nfeData.dataEmissao || 'N/A'}`, 50, y);
        y += 30;
        
        // Emitente
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('EMITENTE:', 50, y);
        y += 20;
        
        doc.fontSize(12).font('Helvetica');
        doc.text(`Razão Social: ${nfeData.emitente?.razaoSocial || 'N/A'}`, 50, y);
        y += 15;
        doc.text(`CNPJ: ${nfeData.emitente?.cnpj || 'N/A'}`, 50, y);
        y += 15;
        doc.text(`Endereço: ${nfeData.emitente?.endereco || 'N/A'}`, 50, y);
        y += 15;
        doc.text(`Cidade: ${nfeData.emitente?.cidade || 'N/A'} - ${nfeData.emitente?.uf || 'N/A'}`, 50, y);
        y += 30;
        
        // Destinatário
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('DESTINATÁRIO:', 50, y);
        y += 20;
        
        doc.fontSize(12).font('Helvetica');
        doc.text(`Razão Social: ${nfeData.destinatario?.razaoSocial || 'N/A'}`, 50, y);
        y += 15;
        doc.text(`CNPJ/CPF: ${nfeData.destinatario?.cnpj || 'N/A'}`, 50, y);
        y += 15;
        doc.text(`Endereço: ${nfeData.destinatario?.endereco || 'N/A'}`, 50, y);
        y += 15;
        doc.text(`Cidade: ${nfeData.destinatario?.cidade || 'N/A'} - ${nfeData.destinatario?.uf || 'N/A'}`, 50, y);
        y += 30;

        // Produtos
        if (nfeData.produtos && nfeData.produtos.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold');
          doc.text('PRODUTOS/SERVIÇOS:', 50, y);
          y += 20;
          
          doc.fontSize(10).font('Helvetica');
          nfeData.produtos.forEach((produto, index) => {
            if (y > 700) { // Nova página se necessário
              doc.addPage();
              y = 50;
            }
            
            doc.text(`${index + 1}. ${produto.descricao || 'N/A'}`, 50, y);
            y += 12;
            doc.text(`   Qtd: ${produto.quantidade || 'N/A'} | Valor Unit: R$ ${produto.valorUnitario || 'N/A'} | Total: R$ ${produto.valorTotal || 'N/A'}`, 70, y);
            y += 20;
          });
        }
        
        y += 20;
        
        // Totais
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('TOTAIS:', 50, y);
        y += 20;
        
        doc.fontSize(12).font('Helvetica');
        const valorTotal = nfeData.totais?.valorTotalNota || 0;
        doc.text(`Valor Total da Nota: R$ ${Number(valorTotal).toFixed(2).replace('.', ',')}`, 50, y);
        y += 15;
        
        // Chave de acesso
        if (nfeData.chaveAcesso) {
          y += 20;
          doc.fontSize(10).font('Helvetica');
          doc.text('Chave de Acesso:', 50, y);
          y += 15;
          doc.text(nfeData.chaveAcesso, 50, y, { width: 500 });
        }

        doc.end();
        
      } catch (error) {
        console.error('❌ Erro na geração do DANFE:', error);
        reject(error);
      }
    });
  }
}