import PDFDocument from 'pdfkit';
import { NFEData } from './nfe-xml-parser';

export class DANFEOficialGenerator {
  
  static async generateOfficialDANFE(nfeData: NFEData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4',
          margins: { top: 15, bottom: 15, left: 15, right: 15 }
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // Configurações
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        let currentY = margin;

        // === SEÇÃO 1: RECIBO DO DESTINATÁRIO ===
        this.drawReciboDestinatario(doc, nfeData, margin, currentY, contentWidth);
        currentY += 60;

        // === SEÇÃO 2: CABEÇALHO PRINCIPAL ===
        currentY = this.drawCabecalhoPrincipal(doc, nfeData, margin, currentY, contentWidth);
        currentY += 10;

        // === SEÇÃO 3: IDENTIFICAÇÃO DO EMITENTE ===
        currentY = this.drawIdentificacaoEmitente(doc, nfeData, margin, currentY, contentWidth);
        currentY += 10;

        // === SEÇÃO 4: DESTINATÁRIO/REMETENTE ===
        currentY = this.drawDestinatario(doc, nfeData, margin, currentY, contentWidth);
        currentY += 10;

        // === SEÇÃO 5: FATURA/DUPLICATA ===
        if (nfeData.cobranca?.duplicatas?.length) {
          currentY = this.drawFaturaDuplicata(doc, nfeData, margin, currentY, contentWidth);
          currentY += 10;
        }

        // === SEÇÃO 6: CÁLCULO DO IMPOSTO ===
        currentY = this.drawCalculoImposto(doc, nfeData, margin, currentY, contentWidth);
        currentY += 10;

        // === SEÇÃO 7: TRANSPORTADOR ===
        if (nfeData.transporte) {
          currentY = this.drawTransportador(doc, nfeData, margin, currentY, contentWidth);
          currentY += 10;
        }

        // === SEÇÃO 8: DADOS DOS PRODUTOS/SERVIÇOS ===
        currentY = this.drawProdutosServicos(doc, nfeData, margin, currentY, contentWidth);
        currentY += 10;

        // === SEÇÃO 9: DADOS ADICIONAIS ===
        this.drawDadosAdicionais(doc, nfeData, margin, currentY, contentWidth);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private static drawReciboDestinatario(doc: any, nfeData: NFEData, x: number, y: number, width: number) {
    const height = 50;
    
    // Caixa principal
    doc.rect(x, y, width * 0.65, height).stroke();
    
    doc.fontSize(8).font('Helvetica');
    doc.text(`RECEBEMOS DE ${nfeData.emitente.razaoSocial} OS PRODUTOS E/OU SERVIÇOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA`, 
      x + 3, y + 3, { width: width * 0.6 });
    
    doc.text(`ABAIXO. EMISSÃO: ${nfeData.dataEmissao} VALOR TOTAL: R$ ${Number(nfeData.totais.valorTotalNota).toFixed(2).replace('.', ',')} DESTINATÁRIO: ${nfeData.destinatario.razaoSocial}`, 
      x + 3, y + 18, { width: width * 0.6 });
    
    // Seção direita - NF-e
    const rightX = x + width * 0.65;
    const rightWidth = width * 0.35;
    
    doc.rect(rightX, y, rightWidth, height).stroke();
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text('NF-e', rightX + rightWidth/2 - 15, y + 5);
    doc.fontSize(10);
    doc.text(`Nº. ${String(nfeData.numeroNF || '').padStart(9, '0')}`, rightX + 5, y + 20);
    doc.text(`Série ${String(nfeData.serie || '')}`, rightX + 5, y + 35);
    
    // Campos para assinatura
    doc.fontSize(7).font('Helvetica');
    doc.text('DATA DE RECEBIMENTO', x + 3, y + height + 3);
    doc.text('IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR', x + width/2, y + height + 3);
  }

  private static drawCabecalhoPrincipal(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 100;
    
    // Coluna 1: Dados do emitente
    const col1Width = width * 0.45;
    doc.rect(x, y, col1Width, height).stroke();
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(nfeData.emitente.razaoSocial, x + 5, y + 5, { width: col1Width - 10 });
    
    doc.fontSize(8).font('Helvetica');
    doc.text(nfeData.emitente.endereco, x + 5, y + 20, { width: col1Width - 10 });
    doc.text(`${nfeData.emitente.bairro} - ${nfeData.emitente.cep}`, x + 5, y + 35, { width: col1Width - 10 });
    doc.text(`${nfeData.emitente.cidade} - ${nfeData.emitente.uf} Fone/Fax: ${nfeData.emitente.telefone}`, x + 5, y + 50, { width: col1Width - 10 });
    
    // Coluna 2: DANFE
    const col2Width = width * 0.25;
    const col2X = x + col1Width;
    doc.rect(col2X, y, col2Width, height).stroke();
    
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('DANFE', col2X + col2Width/2 - 25, y + 10);
    doc.fontSize(9).font('Helvetica');
    doc.text('Documento Auxiliar da Nota', col2X + 5, y + 30, { width: col2Width - 10, align: 'center' });
    doc.text('Fiscal Eletrônica', col2X + 5, y + 42, { width: col2Width - 10, align: 'center' });
    
    doc.fontSize(8);
    doc.text(`${String(nfeData.tipoOperacao)} - ${String(nfeData.tipoOperacao) === '0' ? 'ENTRADA' : 'SAÍDA'}`, col2X + 5, y + 60);
    
    // Checkbox
    const checkX = col2X + 80;
    doc.rect(checkX, y + 58, 8, 8).stroke();
    if (nfeData.tipoOperacao === '1') {
      doc.text('X', checkX + 1, y + 59);
    }
    
    doc.text(`Nº. ${String(nfeData.numeroNF).padStart(9, '0')}`, col2X + 5, y + 75);
    doc.text(`Série ${String(nfeData.serie || '')}`, col2X + 5, y + 85);
    doc.text('Folha 1/1', col2X + 5, y + 95);
    
    // Coluna 3: Chave de acesso
    const col3Width = width * 0.3;
    const col3X = col2X + col2Width;
    doc.rect(col3X, y, col3Width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('CHAVE DE ACESSO', col3X + 5, y + 5);
    
    doc.fontSize(10).font('Helvetica');
    const chaveFormatada = this.formatChaveAcesso(nfeData.chaveAcesso);
    doc.text(chaveFormatada, col3X + 5, y + 18, { width: col3Width - 10 });
    
    doc.fontSize(7);
    doc.text('Consulta de autenticidade no portal nacional da NF-e', col3X + 5, y + 35, { width: col3Width - 10 });
    doc.text('www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora', col3X + 5, y + 47, { width: col3Width - 10 });
    
    if (nfeData.protocoloAutorizacao) {
      doc.fontSize(8).font('Helvetica-Bold');
      doc.text('PROTOCOLO DE AUTORIZAÇÃO DE USO', col3X + 5, y + 65);
      doc.fontSize(7).font('Helvetica');
      doc.text(nfeData.protocoloAutorizacao, col3X + 5, y + 77, { width: col3Width - 10 });
    }
    
    return y + height;
  }

  private static drawIdentificacaoEmitente(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 60;
    
    doc.rect(x, y, width, height).stroke();
    
    // Linha superior
    doc.fontSize(8).font('Helvetica');
    doc.text('NATUREZA DA OPERAÇÃO', x + 5, y + 5);
    doc.text('PROTOCOLO DE AUTORIZAÇÃO DE USO', x + width * 0.7, y + 5);
    
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text(nfeData.naturezaOperacao, x + 5, y + 18);
    doc.fontSize(8).font('Helvetica');
    doc.text(nfeData.protocoloAutorizacao || '', x + width * 0.7, y + 18, { width: width * 0.25 });
    
    // Linha inferior
    doc.text('INSCRIÇÃO ESTADUAL', x + 5, y + 35);
    doc.text('INSCRIÇÃO MUNICIPAL', x + width * 0.25, y + 35);
    doc.text('INSCRIÇÃO ESTADUAL DO SUBST. TRIBUT.', x + width * 0.5, y + 35);
    doc.text('CNPJ / CPF', x + width * 0.75, y + 35);
    
    doc.fontSize(9);
    doc.text(nfeData.emitente.inscricaoEstadual || '', x + 5, y + 48);
    doc.text(nfeData.emitente.inscricaoMunicipal || '', x + width * 0.25, y + 48);
    doc.text('', x + width * 0.5, y + 48); // SUBST. TRIBUT.
    doc.text(this.formatCNPJ(nfeData.emitente.cnpj), x + width * 0.75, y + 48);
    
    return y + height;
  }

  private static drawDestinatario(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 80;
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('DESTINATÁRIO / REMETENTE', x + 5, y + 5);
    
    // Linha 1
    doc.fontSize(8).font('Helvetica');
    doc.text('NOME / RAZÃO SOCIAL', x + 5, y + 18);
    doc.text('CNPJ / CPF', x + width * 0.65, y + 18);
    doc.text('DATA DA EMISSÃO', x + width * 0.85, y + 18);
    
    doc.fontSize(9);
    doc.text(nfeData.destinatario.razaoSocial, x + 5, y + 30, { width: width * 0.55 });
    doc.text(this.formatCNPJ(nfeData.destinatario.cnpj), x + width * 0.65, y + 30);
    doc.text(nfeData.dataEmissao, x + width * 0.85, y + 30);
    
    // Linha 2
    doc.fontSize(8).font('Helvetica');
    doc.text('ENDEREÇO', x + 5, y + 45);
    doc.text('BAIRRO / DISTRITO', x + width * 0.5, y + 45);
    doc.text('CEP', x + width * 0.7, y + 45);
    doc.text('DATA DA SAÍDA/ENTRADA', x + width * 0.85, y + 45);
    
    doc.fontSize(9);
    doc.text(nfeData.destinatario.endereco, x + 5, y + 57, { width: width * 0.4 });
    doc.text(nfeData.destinatario.bairro || '', x + width * 0.5, y + 57);
    doc.text(nfeData.destinatario.cep, x + width * 0.7, y + 57);
    doc.text(nfeData.dataEntrada || '', x + width * 0.85, y + 57);
    
    // Linha 3
    doc.fontSize(8).font('Helvetica');
    doc.text('MUNICÍPIO', x + 5, y + 72);
    doc.text('UF', x + width * 0.3, y + 72);
    doc.text('FONE / FAX', x + width * 0.4, y + 72);
    doc.text('INSCRIÇÃO ESTADUAL', x + width * 0.65, y + 72);
    doc.text('HORA DA SAÍDA/ENTRADA', x + width * 0.85, y + 72);
    
    doc.fontSize(9);
    doc.text(nfeData.destinatario.cidade, x + 5, y + 84);
    doc.text(nfeData.destinatario.uf, x + width * 0.3, y + 84);
    doc.text(nfeData.destinatario.telefone || '', x + width * 0.4, y + 84);
    doc.text(nfeData.destinatario.inscricaoEstadual || '', x + width * 0.65, y + 84);
    doc.text(nfeData.horaEntrada || '', x + width * 0.85, y + 84);
    
    return y + height + 5;
  }

  private static drawFaturaDuplicata(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 50;
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('FATURA / DUPLICATA', x + 5, y + 5);
    
    const duplicatas = nfeData.cobranca?.duplicatas || [];
    const colWidth = width / Math.max(duplicatas.length, 2);
    
    duplicatas.forEach((dup, index) => {
      const colX = x + (index * colWidth);
      
      if (index > 0) {
        doc.moveTo(colX, y + 15).lineTo(colX, y + height).stroke();
      }
      
      doc.fontSize(8).font('Helvetica');
      doc.text(`Num. ${dup.numero}`, colX + 5, y + 18);
      doc.text(`Venc. ${dup.vencimento}`, colX + 5, y + 30);
      doc.text(`Valor R$ ${dup.valor.toFixed(2).replace('.', ',')}`, colX + 5, y + 42);
    });
    
    return y + height;
  }

  private static drawCalculoImposto(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 50;
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('CÁLCULO DO IMPOSTO', x + 5, y + 5);
    
    const totals = nfeData.totais;
    const colWidth = width / 8;
    
    // Linha de labels
    const labels = [
      'BASE DE CÁLC. DO ICMS', 'VALOR DO ICMS', 'BASE DE CÁLC. ICMS S.T.', 'VALOR DO ICMS SUBST.',
      'V. IMP. IMPORTAÇÃO', 'V. ICMS UF REMET.', 'V. FCP UF DEST.', 'V. TOTAL PRODUTOS'
    ];
    
    labels.forEach((label, index) => {
      const colX = x + (index * colWidth);
      if (index > 0) {
        doc.moveTo(colX, y + 15).lineTo(colX, y + height).stroke();
      }
      
      doc.fontSize(7).font('Helvetica');
      doc.text(label, colX + 2, y + 18, { width: colWidth - 4 });
    });
    
    // Linha de valores
    const valores = [
      totals.baseCalculoICMS, totals.valorICMS, totals.baseCalculoICMSST || 0, totals.valorICMSST || 0,
      totals.valorImportacao || 0, 0, 0, totals.valorTotalProdutos
    ];
    
    valores.forEach((valor, index) => {
      const colX = x + (index * colWidth);
      doc.fontSize(8).font('Helvetica');
      doc.text(valor.toFixed(2).replace('.', ','), colX + 2, y + 35, { width: colWidth - 4 });
    });
    
    // Segunda linha
    doc.moveTo(x, y + height).lineTo(x + width, y + height).stroke();
    
    const height2 = 25;
    doc.rect(x, y + height, width, height2).stroke();
    
    const labels2 = [
      'VALOR DO FRETE', 'VALOR DO SEGURO', 'DESCONTO', 'OUTRAS DESPESAS',
      'VALOR TOTAL IPI', 'V. ICMS UF DEST.', 'V. TOT. TRIB.', 'V. TOTAL DA NOTA'
    ];
    
    const valores2 = [
      totals.valorFrete, totals.valorSeguro, totals.valorDesconto, totals.outrasDespresas,
      totals.valorTotalIPI, 0, totals.valorTotalTributos || 0, totals.valorTotalNota
    ];
    
    labels2.forEach((label, index) => {
      const colX = x + (index * colWidth);
      if (index > 0) {
        doc.moveTo(colX, y + height).lineTo(colX, y + height + height2).stroke();
      }
      
      doc.fontSize(7).font('Helvetica');
      doc.text(label, colX + 2, y + height + 3, { width: colWidth - 4 });
      doc.fontSize(8);
      doc.text(valores2[index].toFixed(2).replace('.', ','), colX + 2, y + height + 15, { width: colWidth - 4 });
    });
    
    return y + height + height2;
  }

  private static drawTransportador(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 80;
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('TRANSPORTADOR / VOLUMES TRANSPORTADOS', x + 5, y + 5);
    
    const transp = nfeData.transporte!;
    
    // Linha 1
    doc.fontSize(8).font('Helvetica');
    doc.text('NOME / RAZÃO SOCIAL', x + 5, y + 18);
    doc.text('FRETE', x + width * 0.5, y + 18);
    doc.text('CÓDIGO ANTT', x + width * 0.65, y + 18);
    doc.text('PLACA DO VEÍCULO', x + width * 0.8, y + 18);
    doc.text('UF', x + width * 0.9, y + 18);
    doc.text('CNPJ / CPF', x + width * 0.95, y + 18);
    
    doc.fontSize(9);
    doc.text(transp.transportador?.razaoSocial || '', x + 5, y + 30, { width: width * 0.4 });
    doc.text(transp.modalidadeFrete || '', x + width * 0.5, y + 30);
    doc.text(transp.transportador?.codigoANTT || '', x + width * 0.65, y + 30);
    doc.text(transp.veiculo?.placa || '', x + width * 0.8, y + 30);
    doc.text(transp.veiculo?.uf || '', x + width * 0.9, y + 30);
    doc.text(this.formatCNPJ(transp.transportador?.cnpj || ''), x + width * 0.95, y + 30);
    
    // Linha 2
    doc.fontSize(8).font('Helvetica');
    doc.text('ENDEREÇO', x + 5, y + 45);
    doc.text('MUNICÍPIO', x + width * 0.5, y + 45);
    doc.text('UF', x + width * 0.75, y + 45);
    doc.text('INSCRIÇÃO ESTADUAL', x + width * 0.85, y + 45);
    
    doc.fontSize(9);
    doc.text(transp.transportador?.endereco || '', x + 5, y + 57, { width: width * 0.4 });
    doc.text(transp.transportador?.cidade || '', x + width * 0.5, y + 57);
    doc.text(transp.transportador?.uf || '', x + width * 0.75, y + 57);
    doc.text(transp.transportador?.inscricaoEstadual || '', x + width * 0.85, y + 57);
    
    // Linha 3 - Volumes
    if (transp.volumes?.length) {
      const vol = transp.volumes[0];
      doc.fontSize(8).font('Helvetica');
      doc.text('QUANTIDADE', x + 5, y + 72);
      doc.text('ESPÉCIE', x + width * 0.2, y + 72);
      doc.text('MARCA', x + width * 0.4, y + 72);
      doc.text('NUMERAÇÃO', x + width * 0.6, y + 72);
      doc.text('PESO BRUTO', x + width * 0.75, y + 72);
      doc.text('PESO LÍQUIDO', x + width * 0.9, y + 72);
      
      doc.fontSize(9);
      doc.text(vol.quantidade.toString(), x + 5, y + 84);
      doc.text(vol.especie || '', x + width * 0.2, y + 84);
      doc.text(vol.marca || '', x + width * 0.4, y + 84);
      doc.text(vol.numeracao || '', x + width * 0.6, y + 84);
      doc.text(vol.pesoBruto?.toFixed(3).replace('.', ',') || '', x + width * 0.75, y + 84);
      doc.text(vol.pesoLiquido?.toFixed(3).replace('.', ',') || '', x + width * 0.9, y + 84);
    }
    
    return y + height;
  }

  private static drawProdutosServicos(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const baseHeight = 50;
    const rowHeight = 12;
    const numProducts = nfeData.produtos.length;
    const height = baseHeight + (numProducts * rowHeight);
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('DADOS DOS PRODUTOS / SERVIÇOS', x + 5, y + 5);
    
    // Cabeçalhos
    const headers = [
      { text: 'CÓDIGO PRODUTO', x: 0, width: 0.08 },
      { text: 'DESCRIÇÃO DO PRODUTO / SERVIÇO', x: 0.08, width: 0.25 },
      { text: 'NCM/SH', x: 0.33, width: 0.06 },
      { text: 'O/CST', x: 0.39, width: 0.04 },
      { text: 'CFOP', x: 0.43, width: 0.04 },
      { text: 'UN', x: 0.47, width: 0.03 },
      { text: 'QUANT', x: 0.50, width: 0.06 },
      { text: 'VALOR UNIT', x: 0.56, width: 0.07 },
      { text: 'VALOR TOTAL', x: 0.63, width: 0.07 },
      { text: 'DESC', x: 0.70, width: 0.05 },
      { text: 'B.CÁLC ICMS', x: 0.75, width: 0.06 },
      { text: 'VALOR ICMS', x: 0.81, width: 0.06 },
      { text: 'VALOR IPI', x: 0.87, width: 0.05 },
      { text: 'ALÍQ. ICMS', x: 0.92, width: 0.04 },
      { text: 'ALÍQ. IPI', x: 0.96, width: 0.04 }
    ];
    
    doc.fontSize(6).font('Helvetica');
    headers.forEach(header => {
      const headerX = x + (header.x * width);
      const headerWidth = header.width * width;
      doc.text(header.text, headerX + 2, y + 18, { width: headerWidth - 4 });
      
      if (header.x > 0) {
        doc.moveTo(headerX, y + 15).lineTo(headerX, y + height).stroke();
      }
    });
    
    // Linha separadora do cabeçalho
    doc.moveTo(x, y + 30).lineTo(x + width, y + 30).stroke();
    
    // Dados dos produtos
    nfeData.produtos.forEach((produto, index) => {
      const rowY = y + 32 + (index * rowHeight);
      
      doc.fontSize(6).font('Helvetica');
      
      const values = [
        produto.codigo,
        produto.descricao,
        produto.ncm || '',
        produto.cst || '',
        produto.cfop || '',
        produto.unidade,
        produto.quantidade.toFixed(4).replace('.', ','),
        produto.valorUnitario.toFixed(4).replace('.', ','),
        produto.valorTotal.toFixed(2).replace('.', ','),
        (produto.valorDesconto || 0).toFixed(2).replace('.', ','),
        (produto.baseCalculoICMS || 0).toFixed(2).replace('.', ','),
        (produto.valorICMS || 0).toFixed(2).replace('.', ','),
        (produto.valorIPI || 0).toFixed(2).replace('.', ','),
        (produto.aliquotaICMS || 0).toFixed(2).replace('.', ','),
        (produto.aliquotaIPI || 0).toFixed(2).replace('.', ',')
      ];
      
      headers.forEach((header, headerIndex) => {
        const cellX = x + (header.x * width);
        const cellWidth = header.width * width;
        doc.text(values[headerIndex] || '', cellX + 2, rowY, { width: cellWidth - 4 });
      });
    });
    
    return y + height;
  }

  private static drawDadosAdicionais(doc: any, nfeData: NFEData, x: number, y: number, width: number) {
    const height = 80;
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('DADOS ADICIONAIS', x + 5, y + 5);
    
    // Dividir em duas colunas
    const col1Width = width * 0.7;
    const col2Width = width * 0.3;
    
    doc.moveTo(x + col1Width, y + 15).lineTo(x + col1Width, y + height).stroke();
    
    doc.fontSize(8).font('Helvetica');
    doc.text('INFORMAÇÕES COMPLEMENTARES', x + 5, y + 18);
    doc.text('RESERVADO AO FISCO', x + col1Width + 5, y + 18);
    
    doc.fontSize(7);
    doc.text(nfeData.informacoesAdicionais?.informacoesContribuinte || '', 
      x + 5, y + 30, { width: col1Width - 10 });
    
    doc.text(nfeData.informacoesAdicionais?.informacoesFisco || '', 
      x + col1Width + 5, y + 30, { width: col2Width - 10 });
    
    // Rodapé
    doc.fontSize(6);
    const agora = new Date();
    const dataHora = `${agora.toLocaleDateString('pt-BR')} as ${agora.toLocaleTimeString('pt-BR')}`;
    doc.text(`Impresso em ${dataHora}`, x + 5, y + height + 5);
    doc.text('Powered by CrossWMS®', x + width - 80, y + height + 5);
  }

  private static formatChaveAcesso(chave: string): string {
    if (!chave || chave.length !== 44) return chave;
    
    return chave.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  private static formatCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    
    const cleaned = cnpj.replace(/\D/g, '');
    
    if (cleaned.length === 14) {
      return `${cleaned.substr(0, 2)}.${cleaned.substr(2, 3)}.${cleaned.substr(5, 3)}/${cleaned.substr(8, 4)}-${cleaned.substr(12, 2)}`;
    } else if (cleaned.length === 11) {
      return `${cleaned.substr(0, 3)}.${cleaned.substr(3, 3)}.${cleaned.substr(6, 3)}-${cleaned.substr(9, 2)}`;
    }
    
    return cnpj;
  }
}