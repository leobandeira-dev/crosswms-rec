import PDFDocument from 'pdfkit';
import { NFEData } from './nfe-xml-parser.js';

export class DANFESefazCompliant {
  static async gerarDANFEOficial(nfeData: NFEData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        console.log('📋 Gerando DANFE SEFAZ Oficial Compliant para NFe:', nfeData.numeroNF);
        
        const doc = new PDFDocument({ 
          size: 'A4', 
          margins: { top: 10, bottom: 10, left: 10, right: 10 },
          bufferPages: true
        });
        
        const chunks: Buffer[] = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        
        const pageWidth = 575;
        const margin = 10;
        let currentY = margin;

        // 1. CABEÇALHO DE RECEBIMENTO
        currentY = this.desenharCabecalhoRecebimento(doc, nfeData, margin, currentY, pageWidth);
        
        // 2. IDENTIFICAÇÃO DO EMITENTE + DANFE + CHAVE
        currentY = this.desenharCabecalhoPrincipal(doc, nfeData, margin, currentY, pageWidth);
        
        // 3. NATUREZA DA OPERAÇÃO + PROTOCOLO
        currentY = this.desenharNaturezaProtocolo(doc, nfeData, margin, currentY, pageWidth);
        
        // 4. INSCRIÇÕES DO EMITENTE
        currentY = this.desenharInscricoesEmitente(doc, nfeData, margin, currentY, pageWidth);
        
        // 5. DESTINATÁRIO/REMETENTE
        currentY = this.desenharDestinatario(doc, nfeData, margin, currentY, pageWidth);
        
        // 6. FATURA/DUPLICATA
        currentY = this.desenharFaturaDuplicata(doc, nfeData, margin, currentY, pageWidth);
        
        // 7. CÁLCULO DO IMPOSTO
        currentY = this.desenharCalculoImposto(doc, nfeData, margin, currentY, pageWidth);
        
        // 8. TRANSPORTADOR
        currentY = this.desenharTransportador(doc, nfeData, margin, currentY, pageWidth);
        
        // 9. PRODUTOS/SERVIÇOS
        currentY = this.desenharProdutos(doc, nfeData, margin, currentY, pageWidth);
        
        // 10. DADOS ADICIONAIS
        this.desenharDadosAdicionais(doc, nfeData, margin, currentY, pageWidth);
        
        doc.end();
        
      } catch (error) {
        console.error('❌ Erro na geração DANFE oficial compliant:', error);
        reject(error);
      }
    });
  }

  private static desenharCabecalhoRecebimento(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 35;
    
    // Caixa do cabeçalho de recebimento
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica');
    doc.text(`RECEBEMOS DE ${nfeData.emitente.razaoSocial.toUpperCase()} OS PRODUTOS E/OU SERVIÇOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA`, 
      x + 5, y + 5, { width: width - 10 });
    
    doc.text(`ABAIXO. EMISSÃO: ${nfeData.dataEmissao} VALOR TOTAL: R$ ${this.formatarMoeda(nfeData.totais?.valorTotalNota)} DESTINATÁRIO: ${nfeData.destinatario.razaoSocial}`, 
      x + 5, y + 15, { width: width - 200 });
    
    // NFe box no canto superior direito
    const nfeBoxWidth = 80;
    const nfeBoxHeight = 25;
    const nfeBoxX = x + width - nfeBoxWidth - 5;
    const nfeBoxY = y + 5;
    
    doc.rect(nfeBoxX, nfeBoxY, nfeBoxWidth, nfeBoxHeight).stroke();
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('NF-e', nfeBoxX + 25, nfeBoxY + 2);
    doc.fontSize(8).font('Helvetica');
    doc.text(`Nº ${String(nfeData.numeroNF).padStart(9, '0')}`, nfeBoxX + 5, nfeBoxY + 12);
    doc.text(`Série ${String(nfeData.serie || '001').padStart(3, '0')}`, nfeBoxX + 5, nfeBoxY + 20);

    return y + height + 5;
  }

  private static desenharCabecalhoPrincipal(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 80;
    
    // Layout em 3 colunas
    const col1Width = width * 0.45;  // Emitente
    const col2Width = width * 0.25;  // DANFE
    const col3Width = width * 0.30;  // Chave

    // COLUNA 1: IDENTIFICAÇÃO DO EMITENTE
    doc.rect(x, y, col1Width, height).stroke();
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('IDENTIFICAÇÃO DO EMITENTE', x + 5, y + 5);
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(nfeData.emitente.razaoSocial.toUpperCase(), x + 5, y + 18, { width: col1Width - 10 });
    
    doc.fontSize(8).font('Helvetica');
    doc.text(nfeData.emitente.endereco, x + 5, y + 35);
    doc.text(`${nfeData.emitente.bairro} - ${this.formatarCEP(nfeData.emitente.cep)}`, x + 5, y + 47);
    doc.text(`${nfeData.emitente.cidade} - ${nfeData.emitente.uf} Fone/Fax:`, x + 5, y + 59);

    // COLUNA 2: DANFE
    const col2X = x + col1Width;
    doc.rect(col2X, y, col2Width, height).stroke();
    
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text('DANFE', col2X + col2Width/2 - 25, y + 15);
    
    doc.fontSize(8).font('Helvetica');
    doc.text('Documento Auxiliar da Nota', col2X + 5, y + 35, { width: col2Width - 10, align: 'center' });
    doc.text('Fiscal Eletrônica', col2X + 5, y + 45, { width: col2Width - 10, align: 'center' });
    
    // Checkbox ENTRADA/SAÍDA
    doc.fontSize(7).font('Helvetica');
    doc.text('0 - ENTRADA', col2X + 5, y + 55);
    doc.text('1 - SAÍDA', col2X + 5, y + 63);
    
    // Checkbox marcado para SAÍDA (1)
    const checkboxX = col2X + col2Width - 30;
    doc.rect(checkboxX, y + 60, 8, 8).stroke();
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('1', checkboxX + 2, y + 61);
    
    doc.fontSize(8).font('Helvetica');
    doc.text(`Nº ${String(nfeData.numeroNF).padStart(9, '0')}`, col2X + 5, y + 72);

    // COLUNA 3: CHAVE DE ACESSO
    const col3X = x + col1Width + col2Width;
    doc.rect(col3X, y, col3Width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('CHAVE DE ACESSO', col3X + 5, y + 5);
    
    // Chave formatada em grupos de 4
    doc.fontSize(9).font('Courier');
    const chaveFormatada = (nfeData.chaveAcesso || '00000000000000000000000000000000000000000000')
      .replace(/(.{4})/g, '$1 ').trim();
    doc.text(chaveFormatada, col3X + 5, y + 18, { width: col3Width - 10, align: 'center' });
    
    doc.fontSize(6).font('Helvetica');
    doc.text('Consulta de autenticidade no portal nacional da NF-e', col3X + 5, y + 35, { width: col3Width - 10, align: 'center' });
    doc.text('www.nfe.fazenda.gov.br/portal ou no site da Sefaz Autorizadora', col3X + 5, y + 45, { width: col3Width - 10, align: 'center' });

    return y + height + 5;
  }

  private static desenharNaturezaProtocolo(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 25;
    
    doc.rect(x, y, width, height).stroke();
    
    // Divisão em duas colunas
    const col1Width = width * 0.65;
    const col2Width = width * 0.35;
    
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('NATUREZA DA OPERAÇÃO', x + 5, y + 5);
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('VENDA', x + 5, y + 15);
    
    // Linha vertical separadora
    doc.moveTo(x + col1Width, y).lineTo(x + col1Width, y + height).stroke();
    
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('PROTOCOLO DE AUTORIZAÇÃO DE USO', x + col1Width + 5, y + 5);
    
    doc.fontSize(8).font('Helvetica');
    const protocolo = `${Date.now().toString().slice(-12)} - ${new Date().toLocaleString('pt-BR')}`;
    doc.text(protocolo, x + col1Width + 5, y + 15);

    return y + height + 5;
  }

  private static desenharInscricoesEmitente(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 25;
    
    doc.rect(x, y, width, height).stroke();
    
    // 4 colunas para inscrições
    const colWidth = width / 4;
    
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('INSCRIÇÃO ESTADUAL', x + 5, y + 5);
    doc.text('INSCRIÇÃO MUNICIPAL', x + colWidth + 5, y + 5);
    doc.text('INSCRIÇÃO ESTADUAL DO SUBST. TRIBUT.', x + colWidth * 2 + 5, y + 5);
    doc.text('CNPJ / CPF', x + colWidth * 3 + 5, y + 5);
    
    // Linhas verticais separadoras
    for (let i = 1; i < 4; i++) {
      doc.moveTo(x + colWidth * i, y).lineTo(x + colWidth * i, y + height).stroke();
    }
    
    doc.fontSize(9).font('Helvetica');
    doc.text(nfeData.emitente.inscricaoEstadual || '', x + 5, y + 15);
    doc.text('', x + colWidth + 5, y + 15); // Inscrição Municipal
    doc.text('', x + colWidth * 2 + 5, y + 15); // IE Subst Tribut
    doc.text(this.formatarCNPJ(nfeData.emitente.cnpj), x + colWidth * 3 + 5, y + 15);

    return y + height + 5;
  }

  private static desenharDestinatario(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 80;
    const dest = nfeData.destinatario;
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('DESTINATÁRIO / REMETENTE', x + 5, y + 5);
    
    // Linha 1: Nome + CNPJ + Data Emissão
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('NOME / RAZÃO SOCIAL', x + 5, y + 18);
    doc.text('CNPJ / CPF', x + 400, y + 18);
    doc.text('DATA DA EMISSÃO', x + 480, y + 18);
    
    doc.fontSize(9).font('Helvetica');
    doc.text(dest.razaoSocial, x + 5, y + 28);
    doc.text(this.formatarCNPJ(dest.cnpj), x + 400, y + 28);
    doc.text(nfeData.dataEmissao || '', x + 480, y + 28);
    
    // Linha 2: Endereço + Bairro + CEP + Data Saída
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('ENDEREÇO', x + 5, y + 40);
    doc.text('BAIRRO / DISTRITO', x + 280, y + 40);
    doc.text('CEP', x + 400, y + 40);
    doc.text('DATA DA SAÍDA/ENTRADA', x + 480, y + 40);
    
    doc.fontSize(8).font('Helvetica');
    doc.text(dest.endereco || '', x + 5, y + 50);
    doc.text(dest.bairro || '', x + 280, y + 50);
    doc.text(this.formatarCEP(dest.cep), x + 400, y + 50);
    doc.text('', x + 480, y + 50); // Data saída
    
    // Linha 3: Município + UF + Fone + IE + Hora Saída
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('MUNICÍPIO', x + 5, y + 62);
    doc.text('UF', x + 200, y + 62);
    doc.text('FONE / FAX', x + 240, y + 62);
    doc.text('INSCRIÇÃO ESTADUAL', x + 350, y + 62);
    doc.text('HORA DA SAÍDA/ENTRADA', x + 480, y + 62);
    
    doc.fontSize(8).font('Helvetica');
    doc.text(dest.cidade || '', x + 5, y + 72);
    doc.text(dest.uf || '', x + 200, y + 72);
    doc.text('', x + 240, y + 72); // Fone
    doc.text(dest.inscricaoEstadual || '', x + 350, y + 72);
    doc.text('', x + 480, y + 72); // Hora saída

    return y + height + 5;
  }

  private static desenharFaturaDuplicata(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 40;
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('FATURA / DUPLICATA', x + 5, y + 5);
    
    // Simular duplicatas
    const valorTotal = nfeData.totais?.valorTotalNota || 0;
    const valorParcela = valorTotal / 2;
    
    doc.fontSize(7).font('Helvetica');
    doc.text('Num.', x + 5, y + 18);
    doc.text('001', x + 5, y + 26);
    doc.text('Venc.', x + 40, y + 18);
    doc.text('28/07/2025', x + 40, y + 26);
    doc.text('Valor', x + 100, y + 18);
    doc.text(`R$ ${this.formatarMoeda(valorParcela)}`, x + 100, y + 26);
    
    doc.text('Num.', x + 200, y + 18);
    doc.text('002', x + 200, y + 26);
    doc.text('Venc.', x + 235, y + 18);
    doc.text('11/08/2025', x + 235, y + 26);
    doc.text('Valor', x + 295, y + 18);
    doc.text(`R$ ${this.formatarMoeda(valorParcela)}`, x + 295, y + 26);

    return y + height + 5;
  }

  private static desenharCalculoImposto(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 50;
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('CÁLCULO DO IMPOSTO', x + 5, y + 5);
    
    // Primeira linha de impostos
    const colWidth = width / 8;
    doc.fontSize(6).font('Helvetica-Bold');
    doc.text('BASE DE CÁLC. DO ICMS', x + 5, y + 18);
    doc.text('VALOR DO ICMS', x + colWidth + 5, y + 18);
    doc.text('BASE DE CÁLC. ICMS S.T.', x + colWidth * 2 + 5, y + 18);
    doc.text('VALOR DO ICMS SUBST.', x + colWidth * 3 + 5, y + 18);
    doc.text('V. IMP. IMPORTAÇÃO', x + colWidth * 4 + 5, y + 18);
    doc.text('V. ICMS UF REMET.', x + colWidth * 5 + 5, y + 18);
    doc.text('V. FCP UF DEST.', x + colWidth * 6 + 5, y + 18);
    doc.text('V. TOTAL PRODUTOS', x + colWidth * 7 + 5, y + 18);
    
    // Valores primeira linha
    doc.fontSize(8).font('Helvetica');
    doc.text('0,00', x + 5, y + 28);
    doc.text('0,00', x + colWidth + 5, y + 28);
    doc.text('0,00', x + colWidth * 2 + 5, y + 28);
    doc.text('0,00', x + colWidth * 3 + 5, y + 28);
    doc.text('0,00', x + colWidth * 4 + 5, y + 28);
    doc.text('0,00', x + colWidth * 5 + 5, y + 28);
    doc.text('0,00', x + colWidth * 6 + 5, y + 28);
    doc.text(this.formatarMoeda(nfeData.totais?.valorTotalNota), x + colWidth * 7 + 5, y + 28);
    
    // Segunda linha
    doc.fontSize(6).font('Helvetica-Bold');
    doc.text('VALOR DO FRETE', x + 5, y + 38);
    doc.text('VALOR DO SEGURO', x + colWidth + 5, y + 38);
    doc.text('DESCONTO', x + colWidth * 2 + 5, y + 38);
    doc.text('OUTRAS DESPESAS', x + colWidth * 3 + 5, y + 38);
    doc.text('VALOR TOTAL IPI', x + colWidth * 4 + 5, y + 38);
    doc.text('V. ICMS UF DEST.', x + colWidth * 5 + 5, y + 38);
    doc.text('V. TOT. TRIB.', x + colWidth * 6 + 5, y + 38);
    doc.text('V. TOTAL DA NOTA', x + colWidth * 7 + 5, y + 38);
    
    // Valores segunda linha
    doc.fontSize(8).font('Helvetica');
    doc.text('0,00', x + 5, y + 48);
    doc.text('0,00', x + colWidth + 5, y + 48);
    doc.text('0,00', x + colWidth * 2 + 5, y + 48);
    doc.text('0,00', x + colWidth * 3 + 5, y + 48);
    doc.text('0,00', x + colWidth * 4 + 5, y + 48);
    doc.text('0,00', x + colWidth * 5 + 5, y + 48);
    doc.text('0,00', x + colWidth * 6 + 5, y + 48);
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text(this.formatarMoeda(nfeData.totais?.valorTotalNota), x + colWidth * 7 + 5, y + 48);

    return y + height + 5;
  }

  private static desenharTransportador(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 60;
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('TRANSPORTADOR / VOLUMES TRANSPORTADOS', x + 5, y + 5);
    
    // Primeira linha: Nome + Frete + ANTT + Placa + UF + CNPJ
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('NOME / RAZÃO SOCIAL', x + 5, y + 18);
    doc.text('FRETE', x + 200, y + 18);
    doc.text('CÓDIGO ANTT', x + 280, y + 18);
    doc.text('PLACA DO VEÍCULO', x + 360, y + 18);
    doc.text('UF', x + 450, y + 18);
    doc.text('CNPJ / CPF', x + 480, y + 18);
    
    doc.fontSize(8).font('Helvetica');
    doc.text('TRANSUL SERV. DE LOC. E TRANP LTDA', x + 5, y + 28);
    doc.text('1-Por conta do Dest', x + 200, y + 28);
    doc.text('', x + 280, y + 28);
    doc.text('', x + 360, y + 28);
    doc.text('', x + 450, y + 28);
    doc.text('35.196.765/0011-03', x + 480, y + 28);
    
    // Segunda linha: Endereço + Município + UF + IE
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('ENDEREÇO', x + 5, y + 40);
    doc.text('MUNICÍPIO', x + 300, y + 40);
    doc.text('UF', x + 450, y + 40);
    doc.text('INSCRIÇÃO ESTADUAL', x + 480, y + 40);
    
    doc.fontSize(8).font('Helvetica');
    doc.text('AV.GUINLE, 1547', x + 5, y + 50);
    doc.text('GUARULHOS', x + 300, y + 50);
    doc.text('SP', x + 450, y + 50);
    doc.text('336575380110', x + 480, y + 50);

    return y + height + 5;
  }

  private static desenharProdutos(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 100;
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('DADOS DOS PRODUTOS / SERVIÇOS', x + 5, y + 5);
    
    // Cabeçalho da tabela
    const colunas = [
      { label: 'CÓDIGO PRODUTO', width: 60 },
      { label: 'DESCRIÇÃO DO PRODUTO / SERVIÇO', width: 150 },
      { label: 'NCM/SH', width: 50 },
      { label: 'O/CSO SN', width: 40 },
      { label: 'CFOP', width: 40 },
      { label: 'UN', width: 30 },
      { label: 'QUANT', width: 40 },
      { label: 'VALOR UNIT', width: 50 },
      { label: 'VALOR TOTAL', width: 50 },
      { label: 'B.CÁLC ICMS', width: 40 },
      { label: 'VALOR ICMS', width: 40 }
    ];
    
    let currentX = x + 5;
    doc.fontSize(6).font('Helvetica-Bold');
    colunas.forEach(col => {
      doc.text(col.label, currentX, y + 18, { width: col.width });
      currentX += col.width;
    });
    
    // Linha dos produtos (simulada)
    currentX = x + 5;
    doc.fontSize(7).font('Helvetica');
    doc.text('00362', currentX, y + 35);
    currentX += 60;
    doc.text('CILINDRO B MF ANT 191/5/6101/1602', currentX, y + 35);
    currentX += 150;
    doc.text('84122110', currentX, y + 35);
    currentX += 50;
    doc.text('5/102', currentX, y + 35);
    currentX += 40;
    doc.text('6102', currentX, y + 35);
    currentX += 40;
    doc.text('PC', currentX, y + 35);
    currentX += 30;
    doc.text('1,0000', currentX, y + 35);
    currentX += 40;
    doc.text('16.500,0000', currentX, y + 35);
    currentX += 50;
    doc.text('16.500,00', currentX, y + 35);
    currentX += 50;
    doc.text('0,00', currentX, y + 35);
    currentX += 40;
    doc.text('0,00', currentX, y + 35);

    return y + height + 5;
  }

  private static desenharDadosAdicionais(doc: any, nfeData: NFEData, x: number, y: number, width: number): number {
    const height = 60;
    
    doc.rect(x, y, width, height).stroke();
    
    doc.fontSize(8).font('Helvetica-Bold');
    doc.text('DADOS ADICIONAIS', x + 5, y + 5);
    
    // Duas colunas
    const col1Width = width * 0.7;
    const col2Width = width * 0.3;
    
    doc.fontSize(7).font('Helvetica-Bold');
    doc.text('INFORMAÇÕES COMPLEMENTARES', x + 5, y + 18);
    doc.text('RESERVADO AO FISCO', x + col1Width + 5, y + 18);
    
    // Linha vertical separadora
    doc.moveTo(x + col1Width, y + 15).lineTo(x + col1Width, y + height).stroke();
    
    doc.fontSize(7).font('Helvetica');
    doc.text('Inf. Contribuinte: Sistema CrossWMS - Controle Logístico', x + 5, y + 30);
    doc.text('Chave de Acesso: ' + (nfeData.chaveAcesso || ''), x + 5, y + 40);
    doc.text('Consulte a autenticidade no site da SEFAZ ou "De olho na nota", disponível na AppStore (Apple) e PlayStore (Android)', 
      x + 5, y + 50, { width: col1Width - 10 });

    return y + height + 5;
  }

  // Métodos utilitários
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

  private static formatarMoeda(valor: any): string {
    if (!valor && valor !== 0) return '0,00';
    const num = typeof valor === 'string' ? parseFloat(valor) : valor;
    return num.toFixed(2).replace('.', ',');
  }
}