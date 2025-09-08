import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

export interface PrintLayout {
  id: string;
  name: string;
  description: string;
  icon: string;
  component: React.ComponentType<any>;
}

export interface UniversalPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  data: any;
  layouts: PrintLayout[];
  defaultLayout?: string;
  className?: string;
}

const UniversalPrintDialog: React.FC<UniversalPrintDialogProps> = ({
  open,
  onOpenChange,
  title = "Impressão de Documentos",
  data,
  layouts,
  defaultLayout,
  className = "max-w-7xl max-h-[90vh] overflow-y-auto"
}) => {
  const [selectedLayout, setSelectedLayout] = useState<string>(defaultLayout || layouts[0]?.id || '');
  const printRef = useRef<HTMLDivElement>(null);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  // Atualizar layout selecionado quando defaultLayout mudar
  useEffect(() => {
    if (defaultLayout && layouts.find(l => l.id === defaultLayout)) {
      setSelectedLayout(defaultLayout);
    }
  }, [defaultLayout, layouts]);

  const handlePrint = useCallback(async () => {
    if (!printRef.current) return;

    setIsPreparingPrint(true);
    
    try {
      // Aguardar um frame para garantir que o conteúdo está renderizado
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Criar uma nova janela para impressão
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Popup bloqueado! Por favor, permita popups para imprimir.');
        return;
      }

      // Copiar estilos da página atual
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('');
          } catch (e) {
            return '';
          }
        })
        .join('');

      // Obter HTML do conteúdo a ser impresso
      const printContent = printRef.current.innerHTML;

      // Configurar documento da janela de impressão
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Impressão - ${title}</title>
            <style>
              ${styles}
              @media print {
                body { margin: 0; }
                .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);

      printWindow.document.close();

      // Aguardar carregamento e imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };

    } catch (error) {
      console.error('Erro ao imprimir:', error);
      alert('Erro ao preparar impressão. Tente novamente.');
    } finally {
      setIsPreparingPrint(false);
    }
  }, [title]);

  const handleForceClose = () => {
    onOpenChange(false);
  };

  const selectedLayoutConfig = layouts.find(l => l.id === selectedLayout);
  const SelectedLayoutComponent = selectedLayoutConfig?.component;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className} aria-describedby="universal-print-dialog-description">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleForceClose}
              className="no-print h-8 w-8 p-0"
            >
              ✕
            </Button>
          </div>
          <div id="universal-print-dialog-description" className="sr-only">
            Modal para seleção e impressão de documentos com diferentes layouts
          </div>
          
          {/* Seletor de Layout */}
          {layouts.length > 1 && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 no-print">
              <p className="text-base font-bold text-blue-800 mb-3">📋 SELECIONE O TIPO DE DOCUMENTO:</p>
              <div className="flex gap-4 flex-wrap">
                {layouts.map((layout) => (
                  <Button
                    key={layout.id}
                    variant={selectedLayout === layout.id ? 'default' : 'outline'}
                    size="lg"
                    onClick={() => setSelectedLayout(layout.id)}
                    className="flex-1 min-w-[200px] h-14 text-base font-semibold"
                  >
                    {layout.icon} {layout.name}
                  </Button>
                ))}
              </div>
              {selectedLayout && selectedLayoutConfig && (
                <div className="mt-4 p-3 bg-white rounded border flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-600">
                      ✅ Documento selecionado: <strong>{selectedLayoutConfig.name}</strong>
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{selectedLayoutConfig.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handlePrint} 
                      className="bg-blue-600 hover:bg-blue-700 px-6"
                      disabled={isPreparingPrint}
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      {isPreparingPrint ? 'Preparando...' : 'Imprimir'}
                    </Button>
                    <Button onClick={handleForceClose} variant="outline" className="px-4">
                      <X className="w-4 h-4 mr-2" />
                      Fechar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botão de impressão quando há apenas um layout */}
          {layouts.length === 1 && selectedLayoutConfig && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 no-print">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-base font-bold text-blue-800">{selectedLayoutConfig.name}</p>
                  <p className="text-sm text-gray-600">{selectedLayoutConfig.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePrint} 
                    className="bg-blue-600 hover:bg-blue-700 px-6"
                    disabled={isPreparingPrint}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    {isPreparingPrint ? 'Preparando...' : 'Imprimir'}
                  </Button>
                  <Button onClick={handleForceClose} variant="outline" className="px-4">
                    <X className="w-4 h-4 mr-2" />
                    Fechar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Conteúdo do Layout Selecionado */}
        <div ref={printRef} className="print-content" style={{ minHeight: '400px' }}>
          {SelectedLayoutComponent && (
            <SelectedLayoutComponent data={data} />
          )}
          
          {!SelectedLayoutComponent && (
            <div className="text-center py-12 text-gray-500">
              <p>Selecione um tipo de documento para visualizar o layout de impressão</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UniversalPrintDialog;