
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateDANFEFromXML, createPDFDataUrl } from '../../utils/danfeAPI';

interface DANFEPreviewButtonProps {
  xmlContent: string | null;
  fileName: string;
}

const DANFEPreviewButton: React.FC<DANFEPreviewButtonProps> = ({ xmlContent, fileName }) => {
  const [previewLoading, setPreviewLoading] = useState(false);

  const handlePrintDANFE = async () => {
    if (!xmlContent) {
      toast({
        title: "Erro",
        description: "Nenhum arquivo XML carregado.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setPreviewLoading(true);
      toast({
        title: "Gerando DANFE",
        description: "Aguarde enquanto o DANFE está sendo gerado...",
      });
      
      // Generate DANFE from XML
      const pdfBase64 = await generateDANFEFromXML(xmlContent);
      
      if (pdfBase64) {
        // Open PDF in new window
        const dataUrl = createPDFDataUrl(pdfBase64);
        window.open(dataUrl, '_blank');
        
        toast({
          title: "DANFE gerado",
          description: "O DANFE foi aberto em uma nova janela.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível gerar o DANFE a partir do XML.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao gerar DANFE:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o DANFE. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="flex justify-center mt-4">
      <Button 
        variant="default" 
        onClick={handlePrintDANFE}
        disabled={previewLoading}
        className="gap-2"
      >
        <Printer className="h-4 w-4" />
        Imprimir DANFE ({fileName})
      </Button>
    </div>
  );
};

export default DANFEPreviewButton;
