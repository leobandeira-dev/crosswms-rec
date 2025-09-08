import React, { forwardRef, useImperativeHandle } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface Volume {
  id: string;
  codigo: string;
  notaFiscal: string;
  produto: string;
  peso: string;
  dimensoes: string;
  fragil: boolean;
  posicaoAtual?: string;
  descricao: string;
  posicionado: boolean;
  etiquetaMae: string;
  fornecedor: string;
  quantidade: number;
  etiquetado: boolean;
}

interface CellLayout {
  id: string;
  coluna: 'esquerda' | 'centro' | 'direita';
  linha: number;
  volumes: Volume[];
}

interface LayoutPDFGeneratorProps {
  orderNumber: string;
  layout: CellLayout[];
  numeroLinhas: number;
  onPrintComplete?: () => void;
}

const LayoutPDFGenerator = forwardRef<any, LayoutPDFGeneratorProps>(({
  orderNumber,
  layout,
  numeroLinhas,
  onPrintComplete
}, ref) => {
  const generatePDF = async () => {
    try {
      console.log('Iniciando geração de PDF...');
      // Criar novo documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // Configurações de fonte
      pdf.setFont('helvetica');

      // Cabeçalho
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('LAYOUT DO CARREGAMENTO', margin, 20);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`OC: ${orderNumber}`, margin, 30);
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, 35);
      pdf.text(`Layout: ${orderNumber}-${Date.now()}`, margin, 40);

      // Dados do veículo e motorista
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DADOS DO VEÍCULO E MOTORISTA', margin, 50);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Motorista: ________________________', margin, 60);
      pdf.text('Placa Cavalo: _____________________', margin, 65);
      pdf.text('Placa Carreta 1: _________________', margin, 70);
      pdf.text('Placa Carreta 2: _________________', margin, 75);
      pdf.text('Destino: _________________________', margin, 80);

      // Linha separadora
      pdf.line(margin, 85, pageWidth - margin, 85);

      // Layout do caminhão
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('LAYOUT DO CAMINHÃO', margin, 95);

      // Configurações da tabela
      const cellWidth = (contentWidth - 20) / 4; // 4 colunas: Linha + Esquerda + Centro + Direita
      const cellHeight = 8;
      const startY = 105;

      // Cabeçalho da tabela
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.rect(margin, startY, cellWidth, cellHeight);
      pdf.text('LINHA', margin + 2, startY + 5);
      
      pdf.rect(margin + cellWidth, startY, cellWidth, cellHeight);
      pdf.text('ESQUERDA', margin + cellWidth + 2, startY + 5);
      
      pdf.rect(margin + cellWidth * 2, startY, cellWidth, cellHeight);
      pdf.text('CENTRO', margin + cellWidth * 2 + 2, startY + 5);
      
      pdf.rect(margin + cellWidth * 3, startY, cellWidth, cellHeight);
      pdf.text('DIREITA', margin + cellWidth * 3 + 2, startY + 5);

      // Gerar linhas do layout
      let currentY = startY + cellHeight;
      let pageCount = 1;
      const maxRowsPerPage = Math.floor((pageHeight - currentY - 50) / cellHeight);

      for (let linha = 1; linha <= numeroLinhas; linha++) {
        // Verificar se precisa de nova página
        if (linha > 1 && (linha - 1) % maxRowsPerPage === 0) {
          pdf.addPage();
          currentY = 20;
          pageCount++;
        }

        // Encontrar células da linha
        const celulasLinha = layout.filter(c => c.linha === linha);
        const celulaEsquerda = celulasLinha.find(c => c.coluna === 'esquerda');
        const celulaCentro = celulasLinha.find(c => c.coluna === 'centro');
        const celulaDireita = celulasLinha.find(c => c.coluna === 'direita');

        // Número da linha
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.rect(margin, currentY, cellWidth, cellHeight);
        pdf.text(linha.toString(), margin + 2, currentY + 5);

        // Célula Esquerda
        pdf.rect(margin + cellWidth, currentY, cellWidth, cellHeight);
        if (celulaEsquerda && celulaEsquerda.volumes.length > 0) {
          const volumesInfo = groupVolumesByNF(celulaEsquerda.volumes);
          let textY = currentY + 2;
          volumesInfo.forEach((info, idx) => {
            if (textY < currentY + cellHeight - 1) {
              pdf.setFontSize(6);
              pdf.text(`${info.nf} - ${info.fornecedor.substring(0, 15)}... (${info.count})`, 
                       margin + cellWidth + 1, textY);
              textY += 2;
            }
          });
        } else {
          pdf.text('Vazio', margin + cellWidth + 2, currentY + 5);
        }

        // Célula Centro
        pdf.rect(margin + cellWidth * 2, currentY, cellWidth, cellHeight);
        if (celulaCentro && celulaCentro.volumes.length > 0) {
          const volumesInfo = groupVolumesByNF(celulaCentro.volumes);
          let textY = currentY + 2;
          volumesInfo.forEach((info, idx) => {
            if (textY < currentY + cellHeight - 1) {
              pdf.setFontSize(6);
              pdf.text(`${info.nf} - ${info.fornecedor.substring(0, 15)}... (${info.count})`, 
                       margin + cellWidth * 2 + 1, textY);
              textY += 2;
            }
          });
        } else {
          pdf.text('Vazio', margin + cellWidth * 2 + 2, currentY + 5);
        }

        // Célula Direita
        pdf.rect(margin + cellWidth * 3, currentY, cellWidth, cellHeight);
        if (celulaDireita && celulaDireita.volumes.length > 0) {
          const volumesInfo = groupVolumesByNF(celulaDireita.volumes);
          let textY = currentY + 2;
          volumesInfo.forEach((info, idx) => {
            if (textY < currentY + cellHeight - 1) {
              pdf.setFontSize(6);
              pdf.text(`${info.nf} - ${info.fornecedor.substring(0, 15)}... (${info.count})`, 
                       margin + cellWidth * 3 + 1, textY);
              textY += 2;
            }
          });
        } else {
          pdf.text('Vazio', margin + cellWidth * 3 + 2, currentY + 5);
        }

        currentY += cellHeight;
      }

      // Rodapé com assinaturas
      const footerY = pageHeight - 40;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ASSINATURAS', margin, footerY);
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Conferente: _________________________ Data: ___/___/___', margin, footerY + 10);
      pdf.text('Motorista: __________________________ Data: ___/___/___', margin, footerY + 20);
      
      // Dados do usuário que imprimiu
      pdf.setFontSize(6);
      pdf.text(`Impresso por: Usuário do Sistema`, margin, pageHeight - 10);
      pdf.text(`Data/Hora: ${new Date().toLocaleString('pt-BR')}`, pageWidth - 60, pageHeight - 10);

      // Salvar PDF
      pdf.save(`layout-carregamento-${orderNumber}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      if (onPrintComplete) {
        onPrintComplete();
      }

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  // Função para agrupar volumes por nota fiscal
  const groupVolumesByNF = (volumes: Volume[]) => {
    const notasCount: Record<string, { fornecedor: string, count: number }> = {};
    
    volumes.forEach(v => {
      const nf = v.notaFiscal || 'N/A';
      const fornecedor = v.fornecedor || 'Fornecedor não informado';
      
      if (!notasCount[nf]) {
        notasCount[nf] = { fornecedor, count: 0 };
      }
      notasCount[nf].count += 1;
    });

    return Object.entries(notasCount).map(([nf, info]) => ({
      nf,
      fornecedor: info.fornecedor,
      count: info.count
    }));
  };

  // Expor função generatePDF através da ref
  useImperativeHandle(ref, () => ({
    generatePDF
  }));

  // Log para debug
  React.useEffect(() => {
    console.log('LayoutPDFGenerator montado');
  }, []);

  return (
    <div style={{ display: 'none' }}>
      {/* Este componente não renderiza nada visível */}
    </div>
  );
});

export default LayoutPDFGenerator;
