
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, FileText, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { NotaFiscal } from '../../../Faturamento';
import { parseXmlFile } from '@/pages/armazenagem/recebimento/utils/xmlParser';
import { extractNotaFiscalData } from '@/utils/xmlExtractor';
import { extractDataFromXml } from '@/pages/armazenagem/recebimento/utils/notaFiscalExtractor';

interface ImportarViaXMLProps {
  onImportarNotas: (notas: Partial<NotaFiscal>[]) => void;
}

// Define an interface for the extracted data to ensure TypeScript recognizes all properties
interface ExtractedXmlData {
  numeroNF?: string;
  serieNF?: string;
  dataHoraEmissao?: string;
  valorTotal?: string;
  numeroPedido?: string;
  emitenteRazaoSocial?: string;
  emitenteCNPJ?: string;
  destinatarioRazaoSocial?: string;
  destinatarioCNPJ?: string;
  pesoTotalBruto?: string;
  volumesTotal?: string;
  informacoesComplementares?: string;
  [key: string]: any; // Allow for other properties
}

const ImportarViaXMLBatch: React.FC<ImportarViaXMLProps> = ({ onImportarNotas }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processXmlFile = async (file: File): Promise<Partial<NotaFiscal> | null> => {
    try {
      // Parse the XML file
      const xmlData = await parseXmlFile(file);
      if (!xmlData) return null;

      // Store the raw XML content for printing DANFE later
      const reader = new FileReader();
      const xmlContentPromise = new Promise<string>((resolve) => {
        reader.onload = (e) => {
          const content = e.target?.result as string || '';
          console.log(`XML Content Length: ${content.length} bytes`);
          resolve(content);
        };
        reader.readAsText(file);
      });
      
      const xmlContent = await xmlContentPromise;
      
      // Use the more advanced extractor from the recebimento module first
      const detailedData = extractDataFromXml(xmlData);
      
      // Fallback to the simpler extractor if needed
      const extractedData = extractNotaFiscalData(xmlData);
      
      // Merge data from both extractors, ensuring TypeScript recognizes all properties
      const mergedData: ExtractedXmlData = {
        ...extractedData,
        ...detailedData
      };
      
      // Ensure numeroPedido is prioritized properly
      mergedData.numeroPedido = detailedData.numeroPedido || extractedData.numeroPedido || '';
      
      // Debug the raw weight value from XML
      console.log('Peso bruto no XML:', mergedData.pesoTotalBruto);
      
      // Convert extracted data to NotaFiscal format
      const notaFiscal: Partial<NotaFiscal> = {
        data: new Date(),
        cliente: mergedData.destinatarioRazaoSocial || '',
        remetente: mergedData.emitenteRazaoSocial || '',
        notaFiscal: mergedData.numeroNF || '',
        pedido: mergedData.numeroPedido || '', 
        dataEmissao: mergedData.dataHoraEmissao ? new Date(mergedData.dataHoraEmissao) : new Date(),
        // Parse the weight correctly, handling both comma and dot as decimal separators
        pesoNota: mergedData.pesoTotalBruto ? 
          parseFloat(mergedData.pesoTotalBruto.toString().replace(',', '.')) : 0,
        valorNF: parseFloat(mergedData.valorTotal?.replace(',', '.') || '0') || 0,
        fretePorTonelada: 0,
        pesoMinimo: 0,
        aliquotaICMS: 0,
        aliquotaExpresso: 0,
        // Store the raw XML content with proper validation
        xmlContent: xmlContent || ''
      };

      console.log('Nota fiscal extraída do XML:', notaFiscal);
      return notaFiscal;
    } catch (error) {
      console.error(`Erro ao processar arquivo XML ${file.name}:`, error);
      return null;
    }
  };

  const importarXMLs = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione arquivos XML para importar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      toast({
        title: "Processando arquivos",
        description: `Importando ${selectedFiles.length} arquivo(s) XML...`,
      });

      // Process all files
      const notasPromises = selectedFiles.map(file => processXmlFile(file));
      const notasResults = await Promise.all(notasPromises);
      
      // Filter out nulls and transform to NotaFiscal array
      const notasValidas = notasResults.filter((nota): nota is Partial<NotaFiscal> => nota !== null);
      
      if (notasValidas.length > 0) {
        onImportarNotas(notasValidas);
        
        toast({
          title: "Importação concluída",
          description: `${notasValidas.length} nota(s) fiscal(is) importada(s) com sucesso.`,
        });
        
        // Clear files after successful import
        setSelectedFiles([]);
      } else {
        toast({
          title: "Nenhuma nota importada",
          description: "Não foi possível extrair dados dos arquivos XML selecionados.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao importar XMLs:", error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao processar os arquivos XML.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center w-full xml-upload-container">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-150">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isLoading ? (
                  <Loader2 className="w-10 h-10 mb-3 text-gray-400 animate-spin" />
                ) : (
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                )}
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Clique para selecionar</span> ou arraste e solte
                </p>
                <p className="text-xs text-gray-500">
                  XML (Múltiplos arquivos permitidos)
                </p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                className="hidden" 
                accept=".xml"
                onChange={handleFileChange}
                disabled={isLoading}
                multiple
              />
            </label>
          </div>
          
          {/* Lista de arquivos selecionados */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Arquivos selecionados ({selectedFiles.length})</h3>
              <div className="border rounded-md divide-y">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeFile(index)} 
                      className="h-6 w-6 p-0" 
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Botão para importar */}
          <div className="flex justify-center mt-4">
            <Button
              onClick={importarXMLs}
              disabled={isLoading || selectedFiles.length === 0}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Processando...
                </>
              ) : (
                <>
                  Importar {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportarViaXMLBatch;
