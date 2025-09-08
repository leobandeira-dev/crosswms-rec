import React, { useRef, useEffect, useCallback } from 'react';
import JsBarcode from 'jsbarcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface NFe {
  id: string;
  chaveAcesso: string;
  numero: string;
  valorDeclarado: number;
  peso: number;
  volume: number;
  m3: number;
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
  formData: any;
  nfes: NFe[];
}

const PrintDialog: React.FC<PrintDialogProps> = ({ open, onClose, formData, nfes }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const barcodeRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
  const [documentType, setDocumentType] = React.useState<'romaneio' | 'expedicao' | null>(null);

  // Dados de exemplo para demonstração quando não há NFes reais
  const demoNfes = [
    {
      id: 'demo1',
      chaveAcesso: '42250485179240000239550020004175491355349509',
      numero: '417549',
      valorDeclarado: 6100.00,
      peso: 16.0,
      volume: 10,
      m3: 0,
      remetente: {
        razaoSocial: 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA',
        cnpj: '85.179.240/0002-39',
        uf: 'SC',
        cidade: 'JOINVILLE'
      },
      destinatario: {
        razaoSocial: 'CONSORCIO DE ALUMINIO DO MARANHAO',
        cnpj: '00.655.209/0001-93',
        uf: 'MA',
        cidade: 'SAO LUIS'
      }
    },
    {
      id: 'demo2', 
      chaveAcesso: '42250485179240000239550020004175341622314954',
      numero: '417534',
      valorDeclarado: 619.32,
      peso: 8.0,
      volume: 6,
      m3: 0,
      remetente: {
        razaoSocial: 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA',
        cnpj: '85.179.240/0002-39',
        uf: 'SC',
        cidade: 'JOINVILLE'
      },
      destinatario: {
        razaoSocial: 'CONSORCIO DE ALUMINIO DO MARANHAO',
        cnpj: '00.655.209/0001-93',
        uf: 'MA',
        cidade: 'SAO LUIS'
      }
    }
  ];

  const nfesToDisplay = nfes.length > 0 ? nfes : demoNfes;

  // Função para gerar códigos de barras
  const generateBarcodes = useCallback(() => {
    if (documentType === 'expedicao') {
      nfesToDisplay.forEach((nfe) => {
        const chaveParaBarcode = nfe.chaveAcesso || '42250485179240000239550020004175491355349509';
        const canvas = barcodeRefs.current[chaveParaBarcode];
        if (canvas) {
          try {
            // Limpar o canvas primeiro
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            // Configurar tamanho do canvas
            canvas.width = 240;
            canvas.height = 50;
            canvas.style.border = '1px solid #ddd';
            canvas.style.backgroundColor = '#fff';
            canvas.style.display = 'block';
            
            JsBarcode(canvas, chaveParaBarcode, {
              format: "CODE128",
              width: 1.5,
              height: 35,
              displayValue: false,
              background: "#ffffff",
              lineColor: "#000000",
              margin: 3,
              fontSize: 0
            });
            console.log(`Código de barras gerado para NFe: ${nfe.numero}`);
          } catch (error) {
            console.error('Erro ao gerar código de barras para NFe:', nfe.numero, error);
          }
        }
      });
    }
  }, [documentType, nfesToDisplay]);

  useEffect(() => {
    if (documentType === 'expedicao') {
      const timer = setTimeout(generateBarcodes, 300);
      return () => clearTimeout(timer);
    }
  }, [documentType, generateBarcodes]);

  const handlePrint = (type: 'romaneio' | 'expedicao') => {
    setDocumentType(type);
    
    setTimeout(() => {
      if (type === 'expedicao') {
        generateBarcodes();
        setTimeout(() => {
          performPrint(type);
        }, 600);
      } else {
        performPrint(type);
      }
    }, 200);
  };

  const performPrint = (type: 'romaneio' | 'expedicao') => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        let printContent = printRef.current.innerHTML;
        
        // Converter canvas para imagem de alta qualidade para impressão
        if (type === 'expedicao') {
          const canvases = printRef.current.querySelectorAll('canvas');
          const textDivs = printRef.current.querySelectorAll('.select-text');
          
          canvases.forEach((canvas, index) => {
            try {
              // Garantir máxima qualidade na conversão
              const dataURL = canvas.toDataURL('image/png', 1.0);
              const textDiv = textDivs[index];
              const chaveText = textDiv ? textDiv.textContent : '';
              
              const completeElement = `
                <div style="text-align: center;">
                  <img src="${dataURL}" alt="Código de Barras" style="width: 420px; height: 55px; display: block; margin: 0 auto 2px auto; border: 1px solid #000; background-color: #fff; image-rendering: crisp-edges; image-rendering: -webkit-crisp-edges; image-rendering: pixelated; print-color-adjust: exact;">
                  <div style="font-family: monospace; font-size: 7px; color: #000; text-align: center; word-break: break-all; line-height: 1.2; user-select: text; margin-top: 1px;">${chaveText}</div>
                </div>
              `;
              
              // Substituir o canvas e o div de texto pelo elemento completo
              const parentDiv = canvas.closest('.flex.flex-col.items-center');
              if (parentDiv) {
                printContent = printContent.replace(parentDiv.outerHTML, completeElement);
              } else {
                printContent = printContent.replace(canvas.outerHTML, completeElement);
              }
              
              console.log(`Canvas convertido para imagem: ${index}`);
            } catch (error) {
              console.error(`Erro ao converter canvas ${index}:`, error);
            }
          });
        }
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${type === 'romaneio' ? 'Romaneio' : 'Romaneio Expedição'}</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                  font-family: Arial, sans-serif; 
                  font-size: ${type === 'romaneio' ? '12px' : '10px'}; 
                  line-height: 1.0; 
                  color: #000; 
                  margin: ${type === 'expedicao' ? '3mm' : '5mm'};
                }
                @page { 
                  size: A4 landscape; 
                  margin: ${type === 'expedicao' ? '4mm' : '5mm'};
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin-bottom: ${type === 'expedicao' ? '2px' : '4px'}; 
                  table-layout: fixed; 
                }
                th, td { 
                  border: 1px solid #000; 
                  padding: ${type === 'romaneio' ? '2px' : type === 'expedicao' ? '2px' : '3px'}; 
                  text-align: left; 
                  font-size: ${type === 'romaneio' ? '12px' : type === 'expedicao' ? '8px' : '10px'}; 
                  line-height: ${type === 'expedicao' ? '1.1' : '1.0'};
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: ${type === 'romaneio' ? 'nowrap' : 'normal'};
                  vertical-align: ${type === 'expedicao' ? 'middle' : 'top'};
                }
                th { background-color: #f0f0f0; font-weight: bold; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .text-xs { font-size: ${type === 'romaneio' ? '12px' : '9px'}; }
                .text-sm { font-size: ${type === 'romaneio' ? '12px' : '10px'}; }
                .border-b { border-bottom: 1px solid #333; }
                .border-t { border-top: 1px solid #333; }
                .mb-1 { margin-bottom: 1px; }
                .mb-2 { margin-bottom: 2px; }
                .mb-3 { margin-bottom: 3px; }
                .p-1 { padding: 1px; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .grid { display: grid; }
                .grid-cols-2 { grid-template-columns: 1fr 1fr; }
                .grid-cols-3 { grid-template-columns: 1fr 1fr 1fr; }
                .grid-cols-4 { grid-template-columns: 1fr 1fr 1fr 1fr; }
                .bg-gray-50 { background-color: #f9f9f9; }
                .bg-gray-100 { background-color: #f3f3f3; }
                .bg-gray-200 { background-color: #e8e8e8; }
                .gap-2 { gap: 2px; }
                .gap-4 { gap: 4px; }
                .font-mono { font-family: 'Courier New', monospace; }
                .font-semibold { font-weight: 600; }
                .text-gray-600 { color: #666; }
                .text-gray-800 { color: #333; }
                .h-8 { height: 20px; }
                .mt-4 { margin-top: 8px; }
                .pt-2 { padding-top: 4px; }
                
                .page-break-inside-avoid { page-break-inside: avoid; }
                .nfe-barcode-container { 
                  page-break-inside: avoid;
                  height: ${type === 'expedicao' ? '45px' : 'auto'};
                }
                .flex { display: flex !important; }
                .flex-col { display: flex !important; flex-direction: column !important; }
                .flex-1 { flex: 1 !important; }
                .items-center { align-items: center !important; }
                .justify-center { justify-content: center !important; }
                .justify-between { justify-content: space-between !important; }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .font-semibold { font-weight: 600 !important; }
                .text-gray-600 { color: #666 !important; }
                .bg-gray-100 { background-color: #f5f5f5 !important; }
                .bg-gray-200 { background-color: #e5e5e5 !important; }
                canvas { 
                  display: block !important;
                  border: 1px solid #000 !important;
                  background-color: #fff !important;
                  margin: 0 auto !important;
                }
                /* Otimizações específicas para Expedição em Paisagem */
                ${type === 'expedicao' ? `
                  h2 { font-size: 14px !important; margin-bottom: 3px !important; }
                  tbody tr { height: 75px; }
                  tbody td { 
                    padding: 2px !important;
                    font-size: 9px !important;
                    vertical-align: middle !important;
                  }
                  thead th {
                    padding: 2px !important;
                    font-size: 10px !important;
                    font-weight: bold !important;
                    background-color: #f0f0f0 !important;
                    height: 18px !important;
                  }
                  .nfe-barcode-container { 
                    page-break-inside: avoid;
                    height: 75px !important;
                  }
                  img[alt="Código de Barras"] {
                    width: 420px !important;
                    height: 55px !important;
                    display: block !important;
                    margin: 0 auto 2px auto !important;
                    border: 1px solid #000 !important;
                    background-color: #fff !important;
                    image-rendering: crisp-edges !important;
                    image-rendering: -webkit-crisp-edges !important;
                    image-rendering: pixelated !important;
                  }
                  .select-text { 
                    user-select: text !important;
                    cursor: text !important;
                    font-family: monospace !important;
                    font-size: 8px !important;
                    color: #000 !important;
                    text-align: center !important;
                    word-break: break-all !important;
                    line-height: 1.2 !important;
                  }
                  .font-semibold { font-weight: 600 !important; font-size: 10px !important; }
                  .text-gray-600 { color: #666 !important; font-size: 9px !important; }
                  .font-mono { font-family: monospace !important; font-size: 9px !important; }
                  .text-xs { font-size: 10px !important; }
                ` : ''}
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      }
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5" />
            Demonstração dos Layouts de Impressão
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 mb-4">
          <Button 
            onClick={(e) => {
              e.preventDefault();
              handlePrint('romaneio');
            }} 
            variant="outline"
            className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Printer className="w-4 h-4 mr-2" />
            Romaneio (Tabela Compacta)
          </Button>
          <Button 
            onClick={(e) => {
              e.preventDefault();
              handlePrint('expedicao');
            }} 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Romaneio Expedição (Com Códigos de Barras)
          </Button>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>

        {/* Conteúdo para impressão */}
        <div ref={printRef} className="bg-white p-4 text-black border">
          {/* Cabeçalho */}
          <div className="border-b-2 border-gray-800 pb-2 mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {documentType === 'romaneio' ? 'ROMANEIO' : documentType === 'expedicao' ? 'ROMANEIO EXPEDIÇÃO' : 'SOLICITAÇÃO DE CARREGAMENTO'}
                </h1>
                <p className="text-sm text-gray-600">Tipo: {formData.tipo || 'Coleta'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">Data de Emissão</p>
                <p className="text-sm font-semibold">{formatDate(new Date())}</p>
                <p className="text-xs text-gray-600 mt-1">Documento Nº</p>
                <p className="text-sm font-semibold">{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Layout Romaneio - Tabela Compacta */}
          {documentType === 'romaneio' && (
            <>
              {/* Dados condensados */}
              <div className="mb-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-1 bg-gray-50 border">
                    <p className="font-bold">REMETENTE</p>
                    <p className="font-semibold">{formData.remetente?.razaoSocial || 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA'}</p>
                    <p>CNPJ: {formData.remetente?.cnpj || '85.179.240/0002-39'}</p>
                    <p>{formData.remetente?.cidade || 'JOINVILLE'} - {formData.remetente?.uf || 'SC'}</p>
                  </div>
                  <div className="p-1 bg-gray-50 border">
                    <p className="font-bold">DESTINATÁRIO</p>
                    <p className="font-semibold">{formData.destinatario?.razaoSocial || 'CONSORCIO DE ALUMINIO DO MARANHAO'}</p>
                    <p>CNPJ: {formData.destinatario?.cnpj || '00.655.209/0001-93'}</p>
                    <p>{formData.destinatario?.cidade || 'SAO LUIS'} - {formData.destinatario?.uf || 'MA'}</p>
                  </div>
                </div>
              </div>

              {/* Tabela ultra-compacta com todas as colunas solicitadas */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-1 text-left" style={{width: '6%'}}>NFe</th>
                    <th className="p-1 text-left" style={{width: '18%'}}>Remetente</th>
                    <th className="p-1 text-left" style={{width: '8%'}}>Cidade-UF</th>
                    <th className="p-1 text-left" style={{width: '18%'}}>Destinatário</th>
                    <th className="p-1 text-left" style={{width: '8%'}}>Cidade-UF</th>
                    <th className="p-1 text-left" style={{width: '25%'}}>Chave de Acesso</th>
                    <th className="p-1 text-center" style={{width: '3%'}}>Vol</th>
                    <th className="p-1 text-center" style={{width: '6%'}}>Peso</th>
                    <th className="p-1 text-right" style={{width: '8%'}}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {nfesToDisplay.map((nfe, index) => (
                    <tr key={nfe.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-1 font-mono text-xs">{nfe.numero}</td>
                      <td className="p-1 text-xs">{(nfe.remetente?.razaoSocial || 'CORSUL COMERCIO E REPRE...').substring(0, 20)}</td>
                      <td className="p-1 text-xs">{(nfe.remetente?.cidade || 'JOINVILLE')}-{nfe.remetente?.uf || 'SC'}</td>
                      <td className="p-1 text-xs">{(nfe.destinatario?.razaoSocial || 'CONSORCIO DE ALUMINIO...').substring(0, 20)}</td>
                      <td className="p-1 text-xs">{(nfe.destinatario?.cidade || 'SAO LUIS')}-{nfe.destinatario?.uf || 'MA'}</td>
                      <td className="p-1 font-mono text-xs">{nfe.chaveAcesso || ''}</td>
                      <td className="p-1 text-center">{nfe.volume}</td>
                      <td className="p-1 text-center">{nfe.peso.toFixed(1)} kg</td>
                      <td className="p-1 text-right">R$ {nfe.valorDeclarado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-200 font-bold">
                    <td className="p-1" colSpan={6}>TOTAIS</td>
                    <td className="p-1 text-center">{nfesToDisplay.reduce((acc, nfe) => acc + nfe.volume, 0)}</td>
                    <td className="p-1 text-center">{nfesToDisplay.reduce((acc, nfe) => acc + nfe.peso, 0).toFixed(1)}</td>
                    <td className="p-1 text-right">R$ {nfesToDisplay.reduce((acc, nfe) => acc + nfe.valorDeclarado, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  </tr>
                </tbody>
              </table>

              {/* Assinaturas */}
              <div className="mt-4 border-t pt-2">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="text-center">
                    <div className="border-b h-8 mb-1"></div>
                    <p className="font-semibold">CONFERENTE</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b h-8 mb-1"></div>
                    <p className="font-semibold">MOTORISTA</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b h-8 mb-1"></div>
                    <p className="font-semibold">RESPONSÁVEL</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Layout Romaneio Expedição - Layout em blocos conforme exemplo */}
          {documentType === 'expedicao' && (
            <div>
              <h2 className="text-sm font-bold border-b pb-1 mb-2">NOTAS FISCAIS COM CÓDIGOS DE BARRAS</h2>
              
              {nfesToDisplay.map((nfe) => (
                <div key={nfe.id} className="border p-3 mb-3" style={{pageBreakInside: 'avoid'}}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-bold text-sm">NFe: {nfe.numero}</div>
                      <div className="text-xs font-mono mb-1">{nfe.chaveAcesso}</div>
                      <div className="text-xs">
                        <span className="font-semibold">Remetente:</span> {(nfe.remetente?.razaoSocial || 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA')}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold">Destinatário:</span> {(nfe.destinatario?.razaoSocial || 'CONSORCIO DE ALUMINIO DO MARANHAO')}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold">Volumes:</span> {nfe.volume} | <span className="font-semibold">Peso:</span> {nfe.peso.toFixed(1)} kg | <span className="font-semibold">Valor:</span> R$ {nfe.valorDeclarado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </div>
                    </div>
                    <div className="ml-4 text-right text-xs font-mono">
                      {nfe.numero.toString().padStart(8, '0')}
                    </div>
                  </div>
                  
                  {/* Código de barras centralizado e otimizado */}
                  <div className="flex justify-center mt-3">
                    <canvas
                      ref={(el) => {
                        if (el) {
                          const chave = nfe.chaveAcesso;
                          console.log('Gerando código de barras para chave:', chave);
                          
                          if (chave && documentType === 'expedicao') {
                            barcodeRefs.current[chave] = el;
                            
                            setTimeout(() => {
                              try {
                                // Configurações otimizadas para máxima legibilidade
                                el.width = 700;
                                el.height = 100;
                                el.style.border = '2px solid #000';
                                el.style.backgroundColor = '#fff';
                                el.style.imageRendering = 'crisp-edges';
                                
                                // Usar CODE128 com configurações ideais para NFe
                                JsBarcode(el, chave, {
                                  format: "CODE128",
                                  width: 2.5,
                                  height: 80,
                                  displayValue: false,
                                  background: "#ffffff",
                                  lineColor: "#000000",
                                  margin: 15,
                                  fontSize: 0,
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
                        border: '2px solid #000',
                        backgroundColor: '#fff',
                        display: 'block'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
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