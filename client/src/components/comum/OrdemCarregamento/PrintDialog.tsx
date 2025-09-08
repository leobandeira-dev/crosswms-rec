import React, { useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import JsBarcode from 'jsbarcode';

interface NFe {
  id: string;
  chaveAcesso: string;
  numero: string;
  valorDeclarado: number;
  peso: number;
  volume: number;
  emitente?: {
    razaoSocial: string;
    cnpj: string;
    uf: string;
    cidade?: string;
    nomeFantasia?: string;
    endereco?: string;
    numero?: string;
    bairro?: string;
    cep?: string;
    telefone?: string;
  };
  remetente?: {
    razaoSocial: string;
    cnpj: string;
    uf: string;
    cidade?: string;
    nomeFantasia?: string;
    endereco?: string;
    numero?: string;
    bairro?: string;
    cep?: string;
    telefone?: string;
  };
  destinatario?: {
    razaoSocial: string;
    cnpj: string;
    uf: string;
    cidade?: string;
    nomeFantasia?: string;
    endereco?: string;
    numero?: string;
    bairro?: string;
    cep?: string;
    telefone?: string;
  };
}

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  notasFiscais?: any[];
  volumeData?: any[];
  formData?: any;
  nfes?: NFe[];
}

const PrintDialog: React.FC<PrintDialogProps> = ({ open, onClose, formData, nfes, notasFiscais, volumeData }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const barcodeRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const [documentType, setDocumentType] = React.useState<'ordem' | 'expedicao' | null>(null);

  // Handler para forçar fechamento
  const handleForceClose = () => {
    console.log('handleForceClose chamado');
    setDocumentType(null);
    onClose();
  };

  // Adiciona listener para a tecla ESC e garantir fechamento
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        handleForceClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open]);

  // Log estado quando dialog abre (sem resetar documentType)
  React.useEffect(() => {
    console.log('PrintDialog useEffect - open:', open, 'documentType atual:', documentType);
  }, [open]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Obter o conteúdo e garantir que os códigos de barras sejam incluídos
        let content = printRef.current.innerHTML;
        
        // Regenerar códigos de barras na nova janela
        const canvases = printRef.current.querySelectorAll('canvas');
        const canvasData: { [key: string]: string } = {};
        
        canvases.forEach((canvas, index) => {
          try {
            const dataURL = canvas.toDataURL('image/png');
            canvasData[`canvas_${index}`] = dataURL;
            // Substituir canvas por imagem no conteúdo
            const canvasHTML = canvas.outerHTML;
            const imgHTML = `<img src="${dataURL}" style="max-width: 100%; height: auto; border: none; background: white;" class="barcode-image" />`;
            content = content.replace(canvasHTML, imgHTML);
          } catch (e) {
            console.warn('Erro ao converter canvas para imagem:', e);
          }
        });
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>Impressão - ${documentType === 'ordem' ? 'Ordem de Carga' : 'Romaneio Expedição'}</title>
              <style>
                * { box-sizing: border-box; }
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  background: white;
                  color: black;
                  line-height: 1.4;
                }
                
                /* Tabelas */
                table { 
                  border-collapse: collapse; 
                  width: 100%; 
                  margin-bottom: 20px;
                }
                th, td { 
                  border: 1px solid #000; 
                  padding: 6px; 
                  text-align: left; 
                  vertical-align: top;
                }
                th { 
                  background-color: #f0f0f0 !important; 
                  font-weight: bold; 
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                
                /* Tipografia */
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .font-medium { font-weight: 500; }
                .font-semibold { font-weight: 600; }
                .text-xs { font-size: 11px; }
                .text-sm { font-size: 13px; }
                .text-base { font-size: 14px; }
                .text-lg { font-size: 16px; }
                .text-xl { font-size: 18px; }
                
                /* Espaçamentos */
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-3 { margin-bottom: 12px; }
                .mb-4 { margin-bottom: 16px; }
                .mb-6 { margin-bottom: 24px; }
                .mt-2 { margin-top: 8px; }
                .mt-4 { margin-top: 16px; }
                .mt-8 { margin-top: 32px; }
                .p-1 { padding: 4px; }
                .p-2 { padding: 8px; }
                .p-3 { padding: 12px; }
                .pr-2 { padding-right: 8px; }
                .pr-4 { padding-right: 16px; }
                .pl-4 { padding-left: 16px; }
                
                /* Bordas e fundos */
                .border { border: 1px solid #000; }
                .border-r { border-right: 1px solid #ccc; }
                .border-t { border-top: 1px solid #ccc; }
                .border-gray-300 { border-color: #d1d5db; }
                .border-gray-400 { border-color: #9ca3af; }
                .bg-gray-50 { 
                  background-color: #f9fafb !important; 
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                .bg-gray-100 { 
                  background-color: #f3f4f6 !important; 
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                .bg-blue-100 { 
                  background-color: #dbeafe !important; 
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                .bg-green-100 { 
                  background-color: #dcfce7 !important; 
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                .bg-white { 
                  background-color: white !important; 
                  -webkit-print-color-adjust: exact;
                  color-adjust: exact;
                }
                
                /* Cores de texto */
                .text-blue-800 { color: #1e40af; }
                .text-green-800 { color: #166534; }
                .text-gray-600 { color: #4b5563; }
                
                /* Layout */
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: 1fr 1fr; }
                .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
                .gap-6 { gap: 24px; }
                .gap-8 { gap: 32px; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .justify-center { justify-content: center; }
                .items-center { align-items: center; }
                .items-start { align-items: flex-start; }
                .space-y-2 > * + * { margin-top: 8px; }
                .rounded { border-radius: 4px; }
                
                /* Canvas para códigos de barras */
                canvas {
                  max-width: 100%;
                  height: auto;
                  border: none;
                  background: white;
                }
                
                /* Configurações de página */
                @page { 
                  margin: 2cm 1.5cm; 
                  size: A4;
                }
                
                /* Quebras de página */
                .page-break-inside-avoid {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
                
                /* Remover elementos que não devem ser impressos */
                .no-print {
                  display: none !important;
                }
                
                /* Garantir que códigos de barras sejam impressos */
                .barcode-container {
                  page-break-inside: avoid;
                  min-height: 60px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
              </style>
            </head>
            <body>
              ${content}
            </body>
          </html>
        `);
        
        printWindow.document.close();
        
        // Aguardar o carregamento e renderização completa
        printWindow.onload = function() {
          setTimeout(function() {
            // Como convertemos canvas para imagens, verificar se todas as imagens foram carregadas
            const barcodeImages = printWindow.document.querySelectorAll('.barcode-image');
            let imagesLoaded = 0;
            
            if (barcodeImages.length === 0) {
              // Se não há imagens de códigos de barras, imprimir normalmente
              printWindow.focus();
              printWindow.print();
              setTimeout(() => printWindow.close(), 1000);
            } else {
              const checkImagesReady = () => {
                imagesLoaded++;
                if (imagesLoaded >= barcodeImages.length) {
                  setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                    setTimeout(() => printWindow.close(), 1000);
                  }, 500);
                }
              };
              
              // Para cada imagem, aguardar seu carregamento
              barcodeImages.forEach((img: any) => {
                if (img.complete && img.naturalHeight !== 0) {
                  checkImagesReady();
                } else {
                  img.onload = checkImagesReady;
                  img.onerror = checkImagesReady; // Continuar mesmo se houver erro
                }
              });
            }
          }, 800); // Tempo reduzido já que usamos imagens
        };
        
        // Fallback caso onload não funcione
        setTimeout(function() {
          if (!printWindow.closed) {
            printWindow.focus();
            printWindow.print();
            setTimeout(function() {
              printWindow.close();
            }, 1000);
          }
        }, 4000); // Tempo maior para o fallback
        
        // Perguntar se deseja fechar o modal após impressão
        setTimeout(() => {
          if (window.confirm('Impressão enviada! Deseja fechar esta janela de impressão?')) {
            handleForceClose();
          }
        }, 2000);
      }
    }
  };

  // Processar dados reais das NFEs da ordem
  const nfesToDisplay = React.useMemo(() => {
    console.log('PrintDialog: Processando dados das NFEs');
    console.log('PrintDialog: formData:', formData);
    console.log('PrintDialog: notasFiscais:', notasFiscais);
    console.log('PrintDialog: nfes prop:', nfes);
    
    // Se há NFEs vindas como prop, usar elas
    if (nfes && nfes.length > 0) {
      console.log('PrintDialog: Usando NFEs da prop:', nfes.length);
      return nfes;
    }
    
    // Se há notasFiscais vindas do formData, converter para formato de exibição
    if (notasFiscais && notasFiscais.length > 0) {
      console.log('PrintDialog: Convertendo notasFiscais para exibição:', notasFiscais.length);
      console.log('PrintDialog: Dados da primeira NFE:', notasFiscais[0]);
      return notasFiscais.map((nf: any) => {
        const nfeData = {
          id: nf.id,
          chaveAcesso: nf.chave_nota || nf.chave_acesso || nf.chaveAcesso || '',
          numero: nf.numero_nota || nf.numero || nf.numero_nfe || '',
          valorDeclarado: parseFloat(nf.valor_nota_fiscal || nf.valorDeclarado || '0'),
          peso: parseFloat(nf.peso_bruto || nf.peso || '0'),
          volume: parseInt(nf.quantidade_volumes || nf.volume || '1'),
          m3: parseFloat(nf.volume_m3 || nf.m3 || '0'),
          remetente: {
            razaoSocial: nf.emitente_razao_social || nf.remetente_razao_social || nf.remetente?.razaoSocial || formData?.remetente_razao_social || '',
            cnpj: nf.emitente_cnpj || nf.remetente_cnpj || nf.remetente?.cnpj || formData?.remetente_cnpj || '',
            uf: nf.emitente_uf || nf.remetente_uf || nf.remetente?.uf || formData?.remetente_uf || '',
            cidade: nf.emitente_cidade || nf.remetente_cidade || nf.remetente?.cidade || formData?.remetente_cidade || ''
          },
          destinatario: {
            razaoSocial: nf.destinatario_razao_social || nf.destinatario?.razaoSocial || formData?.destinatario_razao_social || '',
            cnpj: nf.destinatario_cnpj || nf.destinatario?.cnpj || formData?.destinatario_cnpj || '',
            uf: nf.destinatario_uf || nf.destinatario?.uf || formData?.destinatario_uf || '',
            cidade: nf.destinatario_cidade || nf.destinatario?.cidade || formData?.destinatario_cidade || ''
          }
        };
        console.log('PrintDialog: NFE processada:', nfeData);
        return nfeData;
      });
    }
    
    // Se há notas fiscais no formData
    if (formData?.notasFiscais && formData.notasFiscais.length > 0) {
      console.log('PrintDialog: Usando notasFiscais do formData:', formData.notasFiscais.length);
      return formData.notasFiscais.map((nf: any) => ({
        id: nf.id,
        chaveAcesso: nf.chave_nota_fiscal || nf.chave_nota || nf.chave_acesso || nf.chaveAcesso || '',
        numero: nf.numero_nota || nf.numero || nf.numero_nfe || '',
        valorDeclarado: parseFloat(nf.valor_nota_fiscal || nf.valorDeclarado || '0'),
        peso: parseFloat(nf.peso_bruto || nf.peso || '0'),
        volume: parseInt(nf.quantidade_volumes || nf.volume || '1'),
        m3: parseFloat(nf.volume_m3 || nf.m3 || '0'),
        remetente: {
          razaoSocial: nf.emitente_razao_social || nf.remetente_razao_social || formData?.remetente_razao_social || '',
          cnpj: nf.emitente_cnpj || nf.remetente_cnpj || formData?.remetente_cnpj || '',
          uf: nf.emitente_uf || nf.remetente_uf || formData?.remetente_uf || '',
          cidade: nf.emitente_cidade || nf.remetente_cidade || formData?.remetente_cidade || ''
        },
        destinatario: {
          razaoSocial: nf.destinatario_razao_social || formData?.destinatario_razao_social || '',
          cnpj: nf.destinatario_cnpj || formData?.destinatario_cnpj || '',
          uf: nf.destinatario_uf || formData?.destinatario_uf || '',
          cidade: nf.destinatario_cidade || formData?.destinatario_cidade || ''
        }
      }));
    }
    
    console.log('PrintDialog: Nenhuma NFE encontrada nos dados - retornando array vazio');
    return [];
  }, [nfes, notasFiscais, formData]);

  return (
    <Dialog open={open} onOpenChange={handleForceClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto" aria-describedby="print-dialog-description">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-bold">Impressão de Documentos</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleForceClose}
              className="no-print h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>
          <div id="print-dialog-description" className="sr-only">
            Modal para seleção e impressão de documentos de ordem de carga
          </div>
          
          {/* Botões de seleção de layout - Sempre visíveis */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 no-print">
            <p className="text-base font-bold text-blue-800 mb-3">📋 SELECIONE O TIPO DE DOCUMENTO:</p>
            <div className="flex gap-4">
              <Button
                variant={documentType === 'ordem' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setDocumentType('ordem')}
                className="flex-1 h-14 text-base font-semibold"
              >
                📋 Ordem de Carga (Tabular)
              </Button>
              <Button
                variant={documentType === 'expedicao' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setDocumentType('expedicao')}
                className="flex-1 h-14 text-base font-semibold"
              >
                📊 Romaneio Expedição (Códigos de Barras)
              </Button>
            </div>
            {documentType && (
              <div className="mt-4 p-3 bg-white rounded border flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  ✅ Documento selecionado: <strong>{documentType === 'ordem' ? 'Ordem de Carga' : 'Romaneio Expedição'}</strong>
                </span>
                <div className="flex gap-2">
                  <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 px-6">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir
                  </Button>
                  <Button onClick={handleForceClose} variant="outline" className="px-4">
                    <X className="w-4 h-4 mr-2" />
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <div ref={printRef} className="print-content" style={{ minHeight: '400px' }}>
          <style dangerouslySetInnerHTML={{
            __html: `
              @media print {
                /* Ocultar elementos que não devem ser impressos */
                .no-print, .no-print * {
                  display: none !important;
                }
                
                /* Configurar página */
                @page {
                  margin: 2cm 1.5cm;
                  size: A4;
                }
                
                /* Reset geral para impressão */
                * {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                  color: black !important;
                  font-family: Arial, sans-serif !important;
                  font-size: 12pt !important;
                  line-height: 1.4 !important;
                }
                
                /* Container principal */
                .print-content {
                  margin: 0 !important;
                  padding: 0 !important;
                  background: white !important;
                  width: 100% !important;
                }
                
                /* Tabelas - estilo aprimorado para Ordem de Carga */
                table {
                  border-collapse: collapse !important;
                  width: 100% !important;
                  margin: 8px 0 15px 0 !important;
                  page-break-inside: avoid !important;
                  font-size: 8pt !important;
                  background: white !important;
                }
                
                th, td {
                  border: 1px solid #666 !important;
                  padding: 2px 3px !important;
                  text-align: left !important;
                  vertical-align: top !important;
                  font-size: 8pt !important;
                  line-height: 1.1 !important;
                }
                
                th {
                  background-color: #e8e8e8 !important;
                  font-weight: bold !important;
                  font-size: 7pt !important;
                  text-align: center !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                /* Larguras específicas para colunas da Ordem de Carga */
                table th:nth-child(1), table td:nth-child(1) { width: 8% !important; } /* NFe */
                table th:nth-child(2), table td:nth-child(2) { width: 15% !important; } /* Remetente */
                table th:nth-child(3), table td:nth-child(3) { width: 10% !important; } /* Cidade-UF */
                table th:nth-child(4), table td:nth-child(4) { width: 15% !important; } /* Destinatário */
                table th:nth-child(5), table td:nth-child(5) { width: 10% !important; } /* Cidade-UF */
                table th:nth-child(6), table td:nth-child(6) { width: 25% !important; } /* Chave */
                table th:nth-child(7), table td:nth-child(7) { width: 6% !important; text-align: center !important; } /* Vol */
                table th:nth-child(8), table td:nth-child(8) { width: 7% !important; text-align: center !important; } /* Peso */
                table th:nth-child(9), table td:nth-child(9) { width: 9% !important; text-align: center !important; } /* Valor */
                
                tbody td {
                  font-size: 7pt !important;
                  word-wrap: break-word !important;
                  overflow-wrap: break-word !important;
                }
                
                tfoot td {
                  background-color: #f0f0f0 !important;
                  font-weight: bold !important;
                  font-size: 8pt !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                /* Chaves de acesso com fonte mono */
                .font-mono {
                  font-family: 'Courier New', monospace !important;
                  font-size: 6pt !important;
                  letter-spacing: 0.2px !important;
                }
                
                /* Cabeçalhos e textos */
                h1, h2, h3 {
                  color: black !important;
                  margin: 10px 0 !important;
                }
                
                .text-xl {
                  font-size: 16pt !important;
                  font-weight: bold !important;
                }
                
                .text-lg {
                  font-size: 14pt !important;
                }
                
                .text-base {
                  font-size: 12pt !important;
                }
                
                .text-sm {
                  font-size: 11pt !important;
                }
                
                .text-xs {
                  font-size: 10pt !important;
                }
                
                .font-bold {
                  font-weight: bold !important;
                }
                
                .font-medium {
                  font-weight: 500 !important;
                }
                
                .font-semibold {
                  font-weight: 600 !important;
                }
                
                /* Layout grid */
                .grid {
                  display: grid !important;
                }
                
                .grid-cols-2 {
                  grid-template-columns: 1fr 1fr !important;
                }
                
                .grid-cols-4 {
                  grid-template-columns: repeat(4, 1fr) !important;
                }
                
                .gap-6 {
                  gap: 20px !important;
                }
                
                .gap-8 {
                  gap: 25px !important;
                }
                
                /* Flexbox */
                .flex {
                  display: flex !important;
                }
                
                .justify-between {
                  justify-content: space-between !important;
                }
                
                .justify-center {
                  justify-content: center !important;
                }
                
                .items-center {
                  align-items: center !important;
                }
                
                .items-start {
                  align-items: flex-start !important;
                }
                
                /* Espaçamentos */
                .mb-1 { margin-bottom: 5px !important; }
                .mb-2 { margin-bottom: 8px !important; }
                .mb-3 { margin-bottom: 12px !important; }
                .mb-4 { margin-bottom: 15px !important; }
                .mb-6 { margin-bottom: 20px !important; }
                .mt-2 { margin-top: 8px !important; }
                .mt-4 { margin-top: 15px !important; }
                .mt-8 { margin-top: 25px !important; }
                .p-1 { padding: 3px !important; }
                .p-2 { padding: 6px !important; }
                .p-3 { padding: 10px !important; }
                .pr-2 { padding-right: 6px !important; }
                .pr-4 { padding-right: 15px !important; }
                .pl-4 { padding-left: 15px !important; }
                
                /* Bordas */
                .border {
                  border: 1px solid #000 !important;
                }
                
                .border-r {
                  border-right: 1px solid #ccc !important;
                }
                
                .border-t {
                  border-top: 1px solid #ccc !important;
                }
                
                .border-gray-300 {
                  border-color: #d1d5db !important;
                }
                
                .border-gray-400 {
                  border-color: #9ca3af !important;
                }
                
                /* Backgrounds */
                .bg-gray-50 {
                  background-color: #f9fafb !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                .bg-gray-100 {
                  background-color: #f3f4f6 !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                .bg-blue-100 {
                  background-color: #dbeafe !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                .bg-green-100 {
                  background-color: #dcfce7 !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                .bg-white {
                  background-color: white !important;
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                }
                
                /* Cores de texto */
                .text-blue-800 {
                  color: #1e40af !important;
                }
                
                .text-green-800 {
                  color: #166534 !important;
                }
                
                .text-gray-600 {
                  color: #4b5563 !important;
                }
                
                .text-center {
                  text-align: center !important;
                }
                
                .text-right {
                  text-align: right !important;
                }
                
                /* Canvas e imagens de códigos de barras */
                canvas, .barcode-image {
                  max-width: 100% !important;
                  height: auto !important;
                  border: none !important;
                  background: white !important;
                  page-break-inside: avoid !important;
                  display: block !important;
                  margin: 0 auto !important;
                }
                
                .barcode-image {
                  -webkit-print-color-adjust: exact !important;
                  color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                
                /* Evitar quebras de página em elementos importantes */
                .page-break-inside-avoid,
                .space-y-2 > *,
                .rounded {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
                }
                
                /* Espaçamentos automáticos */
                .space-y-2 > * + * {
                  margin-top: 8px !important;
                }
                
                .rounded {
                  border-radius: 3px !important;
                }
              }
            `
          }} />
          
          {/* Layout Ordem de Carga (Tabular) */}
          {documentType === 'ordem' && (
            <>
              {/* Cabeçalho */}
              <div className="text-center mb-4">
                <h1 className="text-xl font-bold">ROMANEIO</h1>
                <div className="flex justify-between items-center mt-2">
                  <div>
                    <span className="font-medium">Tipo:</span> {formData?.subtipo_operacao || 'Coleta'}
                  </div>
                  <div>
                    <span className="font-medium">Data de Emissão:</span> {formatDate(new Date())}
                  </div>
                </div>
              </div>

              {/* Informações de Remetente e Destinatário */}
              <div className="grid grid-cols-2 gap-6 mb-6 text-sm border border-gray-300 p-3 bg-gray-50">
                <div className="border-r border-gray-300 pr-4">
                  <h3 className="font-bold text-base mb-3 text-blue-800 bg-blue-100 p-2 rounded">REMETENTES</h3>
                  <div className="space-y-2">
                    <div className="font-bold">
                      {formData?.remetente_razao_social || 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA'}
                    </div>
                    <div>
                      <span className="font-medium">CNPJ:</span> {formData?.remetente_cnpj ? 
                        `${formData.remetente_cnpj.slice(0,2)}.${formData.remetente_cnpj.slice(2,5)}.${formData.remetente_cnpj.slice(5,8)}/${formData.remetente_cnpj.slice(8,12)}-${formData.remetente_cnpj.slice(12)}` : 
                        '85.179.240/0002-39'}
                    </div>
                    <div>
                      <span className="font-medium">UF:</span> {formData?.remetente_uf || 'SC'}
                    </div>
                    <div>
                      <span className="font-medium">Telefone:</span> {formData?.remetente_telefone ? 
                        `(${formData.remetente_telefone.slice(0,2)}) ${formData.remetente_telefone.slice(2,7)}-${formData.remetente_telefone.slice(7)}` : 
                        'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Endereço:</span> {formData?.remetente_endereco ? 
                        `${formData.remetente_endereco}, ${formData.remetente_numero || 'S/N'}` : 
                        'Endereço não informado'}
                    </div>
                    <div>
                      <span className="font-medium">Bairro:</span> {formData?.remetente_bairro || 'N/A'} - {formData?.remetente_cidade || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">CEP:</span> {formData?.remetente_cep ? 
                        `${formData.remetente_cep.slice(0,5)}-${formData.remetente_cep.slice(5)}` : 
                        'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="pl-4">
                  <h3 className="font-bold text-base mb-3 text-green-800 bg-green-100 p-2 rounded">DESTINATÁRIOS</h3>
                  <div className="space-y-2">
                    <div className="font-bold">
                      {formData?.destinatario_razao_social || 'CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR'}
                    </div>
                    <div>
                      <span className="font-medium">CNPJ:</span> {formData?.destinatario_cnpj ? 
                        `${formData.destinatario_cnpj.slice(0,2)}.${formData.destinatario_cnpj.slice(2,5)}.${formData.destinatario_cnpj.slice(5,8)}/${formData.destinatario_cnpj.slice(8,12)}-${formData.destinatario_cnpj.slice(12)}` : 
                        '00.655.209/0001-93'}
                    </div>
                    <div>
                      <span className="font-medium">UF:</span> {formData?.destinatario_uf || 'MA'}
                    </div>
                    <div>
                      <span className="font-medium">Telefone:</span> {formData?.destinatario_telefone ? 
                        `(${formData.destinatario_telefone.slice(0,2)}) ${formData.destinatario_telefone.slice(2,7)}-${formData.destinatario_telefone.slice(7)}` : 
                        'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Endereço:</span> {formData?.destinatario_endereco ? 
                        `${formData.destinatario_endereco}, ${formData.destinatario_numero || 'S/N'}` : 
                        'Endereço não informado'}
                    </div>
                    <div>
                      <span className="font-medium">Bairro:</span> {formData?.destinatario_bairro || 'N/A'} - {formData?.destinatario_cidade || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">CEP:</span> {formData?.destinatario_cep ? 
                        `${formData.destinatario_cep.slice(0,5)}-${formData.destinatario_cep.slice(5)}` : 
                        'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela de NFes */}
              <div className="mb-4">
                <table className="w-full border-collapse border border-gray-400 text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-400 p-1 text-left">NFe</th>
                      <th className="border border-gray-400 p-1 text-left">Remetente</th>
                      <th className="border border-gray-400 p-1 text-left">Cidade-UF</th>
                      <th className="border border-gray-400 p-1 text-left">Destinatário</th>
                      <th className="border border-gray-400 p-1 text-left">Cidade-UF</th>
                      <th className="border border-gray-400 p-1 text-left">Chave de Acesso</th>
                      <th className="border border-gray-400 p-1 text-center">Vol</th>
                      <th className="border border-gray-400 p-1 text-center">Peso</th>
                      <th className="border border-gray-400 p-1 text-center">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nfesToDisplay.map((nfe) => (
                      <tr key={nfe.id}>
                        <td className="border border-gray-400 p-1">{nfe.numero}</td>
                        <td className="border border-gray-400 p-1">
                          {((nfe.remetente?.razaoSocial) || 'CORSUL COMERCIO E RE').substring(0, 18)}
                        </td>
                        <td className="border border-gray-400 p-1">
                          {(nfe.remetente?.cidade || 'JOINVILLE')}-{(nfe.remetente?.uf || 'SC')}
                        </td>
                        <td className="border border-gray-400 p-1">
                          {(nfe.destinatario?.razaoSocial || 'CONSORCIO DE ALUMINI').substring(0, 20)}
                        </td>
                        <td className="border border-gray-400 p-1">
                          {(nfe.destinatario?.cidade || 'SAO LUIS')}-{(nfe.destinatario?.uf || 'MA')}
                        </td>
                        <td className="border border-gray-400 p-1 font-mono text-xs">
                          {nfe.chaveAcesso}
                        </td>
                        <td className="border border-gray-400 p-1 text-center">{nfe.volume}</td>
                        <td className="border border-gray-400 p-1 text-center">
                          {nfe.peso.toFixed(1)} kg
                        </td>
                        <td className="border border-gray-400 p-1 text-center">
                          R$ {nfe.valorDeclarado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan={6} className="border border-gray-400 p-1 text-right">TOTAIS</td>
                      <td className="border border-gray-400 p-1 text-center">
                        {nfesToDisplay.reduce((sum, nfe) => sum + nfe.volume, 0)}
                      </td>
                      <td className="border border-gray-400 p-1 text-center">
                        {nfesToDisplay.reduce((sum, nfe) => sum + nfe.peso, 0).toFixed(1)}
                      </td>
                      <td className="border border-gray-400 p-1 text-center">
                        R$ {nfesToDisplay.reduce((sum, nfe) => sum + nfe.valorDeclarado, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Rodapé */}
              <div className="mt-4 text-xs text-center text-gray-600">
                <p>CrossWMS - Sistema de Gestão Logística | www.crosswms.com.br</p>
                <p>Gerado em {formatDate(new Date())}</p>
              </div>
            </>
          )}

          {/* Layout Romaneio Expedição com códigos de barras */}
          {documentType === 'expedicao' && (
            <>
              {/* Cabeçalho */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-xl font-bold">ROMANEIO</h1>
                  <p className="text-sm">Tipo: Coleta</p>
                </div>
                <div className="text-right text-sm">
                  <p>Data de Emissão:</p>
                  <p className="font-bold">{formatDate(new Date())}</p>
                  <p className="text-xs">15UNITFOR</p>
                </div>
              </div>

              {/* Remetente e Destinatário com dados completos */}
              <div className="grid grid-cols-2 gap-6 mb-4 text-xs">
                <div>
                  <h3 className="font-bold text-sm mb-2">REMETENTES</h3>
                  <div className="mb-1">
                    <span className="font-semibold">{formData?.remetente_razao_social || 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA'}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">CNPJ:</span> {formData?.remetente_cnpj ? 
                      `${formData.remetente_cnpj.slice(0,2)}.${formData.remetente_cnpj.slice(2,5)}.${formData.remetente_cnpj.slice(5,8)}/${formData.remetente_cnpj.slice(8,12)}-${formData.remetente_cnpj.slice(12)}` : 
                      '85.179.240/0002-39'}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">UF:</span> {formData?.remetente_uf || 'SC'}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Telefone:</span> {formData?.remetente_telefone ? 
                      `(${formData.remetente_telefone.slice(0,2)}) ${formData.remetente_telefone.slice(2,7)}-${formData.remetente_telefone.slice(7)}` : 
                      'N/A'}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Endereço:</span> {formData?.remetente_endereco || 'Endereço não informado'}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-sm mb-2">DESTINATÁRIOS</h3>
                  <div className="mb-1">
                    <span className="font-semibold">{formData?.destinatario_razao_social || 'CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR'}</span>
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">CNPJ:</span> {formData?.destinatario_cnpj ? 
                      `${formData.destinatario_cnpj.slice(0,2)}.${formData.destinatario_cnpj.slice(2,5)}.${formData.destinatario_cnpj.slice(5,8)}/${formData.destinatario_cnpj.slice(8,12)}-${formData.destinatario_cnpj.slice(12)}` : 
                      '00.655.209/0001-93'}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">UF:</span> {formData?.destinatario_uf || 'MA'}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Telefone:</span> {formData?.destinatario_telefone ? 
                      `(${formData.destinatario_telefone.slice(0,2)}) ${formData.destinatario_telefone.slice(2,7)}-${formData.destinatario_telefone.slice(7)}` : 
                      'N/A'}
                  </div>
                  <div className="mb-1">
                    <span className="font-medium">Endereço:</span> {formData?.destinatario_endereco || 'Endereço não informado'}
                  </div>
                </div>
              </div>

              <h2 className="text-sm font-bold border-b pb-1 mb-2">NOTAS FISCAIS COM CÓDIGOS DE BARRAS</h2>
              
              {nfesToDisplay.map((nfe) => (
                <div key={nfe.id} className="border p-1 mb-1" style={{pageBreakInside: 'avoid', minHeight: '50px'}}>
                  <div className="flex justify-between items-center">
                    {/* Informações da NFe à esquerda */}
                    <div style={{width: '55%'}} className="pr-2">
                      <div className="flex justify-between items-start">
                        <div className="font-bold" style={{fontSize: '11px'}}>NFe: {nfe.numero}</div>
                        <div className="text-right font-mono" style={{fontSize: '9px'}}>
                          {nfe.numero.toString().padStart(8, '0')}
                        </div>
                      </div>
                      <div className="font-mono" style={{fontSize: '8px', lineHeight: '1.1'}}>{nfe.chaveAcesso}</div>
                      <div style={{fontSize: '9px', lineHeight: '1.2'}}>
                        <span className="font-semibold">Rem:</span> {((nfe.remetente?.razaoSocial) || 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA').substring(0, 30)}...
                      </div>
                      <div style={{fontSize: '9px', lineHeight: '1.2'}}>
                        <span className="font-semibold">Dest:</span> {(nfe.destinatario?.razaoSocial || 'CONSORCIO DE ALUMINIO DO MARANHAO').substring(0, 30)}...
                      </div>
                      <div style={{fontSize: '9px', lineHeight: '1.2'}}>
                        <span className="font-semibold">Vol:</span> {nfe.volume} | <span className="font-semibold">Peso:</span> {nfe.peso.toFixed(1)}kg | <span className="font-semibold">Valor:</span> R$ {nfe.valorDeclarado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </div>
                    </div>
                    
                    {/* Código de barras à direita */}
                    <div style={{width: '45%'}} className="flex justify-center">
                      <canvas
                        ref={(el) => {
                          if (el) {
                            const chave = nfe.chaveAcesso;
                            console.log('Gerando código de barras para chave:', chave);
                            
                            if (chave && documentType === 'expedicao') {
                              barcodeRefs.current[chave] = el;
                              
                              setTimeout(() => {
                                try {
                                  // Configurações compactas para máximo aproveitamento do espaço
                                  const scaleFactor = 4; // Resolução 4x para qualidade
                                  el.width = 400 * scaleFactor;
                                  el.height = 40 * scaleFactor;
                                  el.style.width = '400px';
                                  el.style.height = '40px';
                                  el.style.border = 'none'; // Remove bordas para otimizar espaço
                                  el.style.backgroundColor = '#fff';
                                  el.style.imageRendering = 'crisp-edges';
                                  
                                  const ctx = el.getContext('2d');
                                  if (ctx) {
                                    // Desabilita anti-aliasing para bordas nítidas
                                    ctx.imageSmoothingEnabled = false;
                                  }
                                  
                                  // Usar CODE128 compacto sem bordas
                                  JsBarcode(el, chave, {
                                    format: "CODE128",
                                    width: 4.0, // Largura máxima das barras - ideal para coletores
                                    height: 25 * scaleFactor, // Altura mínima para leitura
                                    displayValue: false,
                                    background: "#ffffff",
                                    lineColor: "#000000",
                                    margin: 5 * scaleFactor, // Margens mínimas
                                    fontSize: 0,
                                    flat: true, // Remove gradientes
                                    textMargin: 0,
                                    valid: function(valid) {
                                      if (!valid) {
                                        console.error('Código de barras inválido para chave:', chave);
                                      }
                                    }
                                  });
                                } catch (error) {
                                  console.error('Erro ao gerar código de barras:', error);
                                }
                              }, 100);
                            }
                          }
                        }}
                        style={{ 
                          maxWidth: '100%', 
                          height: '40px',
                          imageRendering: 'crisp-edges'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-8 grid grid-cols-4 gap-8 text-center text-sm border-t pt-4">
                <div>
                  <p className="font-bold">Volumes</p>
                  <p className="text-lg">{nfesToDisplay.reduce((acc, nfe) => acc + nfe.volume, 0)}</p>
                </div>
                <div>
                  <p className="font-bold">Peso Total</p>
                  <p className="text-lg">{nfesToDisplay.reduce((acc, nfe) => acc + nfe.peso, 0).toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="font-bold">Valor Total</p>
                  <p className="text-lg">R$ {nfesToDisplay.reduce((acc, nfe) => acc + nfe.valorDeclarado, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                </div>
                <div>
                  <p className="font-bold">Quantidade NFes</p>
                  <p className="text-lg">{nfesToDisplay.length}</p>
                </div>
              </div>

              <div className="mt-4 text-xs text-center text-gray-600">
                <p>CrossWMS - Sistema de Gestão Logística | www.crosswms.com.br</p>
                <p>Gerado em {formatDate(new Date())}</p>
              </div>
            </>
          )}

          {/* Resumo */}
          {!documentType && (
            <div className="text-center text-gray-600">
              <p>Selecione um tipo de documento para visualizar o layout de impressão</p>
            </div>
          )}
        </div>


      </DialogContent>
    </Dialog>
  );
};

export default PrintDialog;