
import React from 'react';
import { toast } from "@/hooks/use-toast";
import { generateDANFEFromXML, createPDFDataUrl, base64ToBlob } from '@/pages/armazenagem/recebimento/utils/danfeAPI';

interface DANFEGeneratorProps {
  xmlData?: any;
  danfePdfBase64: string | null;
  setDanfePdfBase64: (base64: string | null) => void;
  documentId: string;
  layoutType: 'danfe' | 'simplified';
}

/**
 * Component for handling DANFE generation and operations
 */
const useDANFEGenerator = ({
  xmlData,
  danfePdfBase64,
  setDanfePdfBase64,
  documentId,
  layoutType
}: DANFEGeneratorProps) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  
  const getXmlString = (): string | null => {
    // This function extracts the XML string from xmlData
    if (!xmlData) {
      return null;
    }
    
    // In a real scenario, this would extract the XML from xmlData
    return xmlData.xmlContent || null;
  };

  const generateDANFE = async (): Promise<string | null> => {
    setIsGenerating(true);
    
    try {
      // Get the XML content
      const xmlContent = getXmlString();
      
      if (!xmlContent) {
        toast({
          title: "Erro",
          description: "XML da nota fiscal não encontrado.",
          variant: "destructive"
        });
        return null;
      }
      
      // Generate DANFE from XML if not already generated
      let pdfBase64 = danfePdfBase64;
      if (!pdfBase64) {
        pdfBase64 = await generateDANFEFromXML(xmlContent);
        setDanfePdfBase64(pdfBase64);
      }
      
      return pdfBase64;
    } catch (error) {
      console.error("Erro ao gerar DANFE:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o DANFE. Tente novamente.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    const pdfBase64 = await generateDANFE();
    
    if (pdfBase64) {
      const dataUrl = createPDFDataUrl(pdfBase64);
      window.open(dataUrl, '_blank');
      
      toast({
        title: "DANFE gerado",
        description: `O DANFE foi aberto em uma nova janela para impressão no formato ${layoutType === 'danfe' ? 'DANFE padrão' : 'DANFE simplificado'}.`,
      });
    }
  };

  const handleSave = async () => {
    const pdfBase64 = await generateDANFE();
    
    if (pdfBase64) {
      // Create a blob and download it
      const blob = base64ToBlob(pdfBase64);
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `danfe_${documentId.replace(/\s/g, '_')}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "DANFE salvo",
        description: `O DANFE foi salvo com sucesso no formato ${layoutType === 'danfe' ? 'DANFE padrão' : 'DANFE simplificado'}.`,
      });
    }
  };

  return {
    handlePrint,
    handleSave,
    isGenerating,
    generateDANFE
  };
};

export default useDANFEGenerator;
