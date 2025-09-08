
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, FileText, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseXmlFile } from '../../utils/xmlParser';
import { extractDataFromXml } from '../../utils/notaFiscalExtractor';
import { notasFiscais } from '../../data/mockData';

interface ImportarXMLEmLoteProps {
  onBatchImport: (files: File[]) => void;
  isLoading?: boolean;
}

const ImportarXMLEmLote: React.FC<ImportarXMLEmLoteProps> = ({ onBatchImport, isLoading = false }) => {
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const xmlFiles = filesArray.filter(file => file.type === 'text/xml');
      
      if (xmlFiles.length !== filesArray.length) {
        toast({
          title: "Arquivos incompatíveis",
          description: "Apenas arquivos XML são permitidos.",
          variant: "destructive"
        });
      }
      
      setSelectedFiles(prev => [...prev, ...xmlFiles]);
      
      // Processar automaticamente após adicionar arquivos
      if (xmlFiles.length > 0) {
        await processFilesAutomatically([...selectedFiles, ...xmlFiles]);
      }
    }
  };

  const processFilesAutomatically = async (filesToProcess: File[]) => {
    if (filesToProcess.length === 0) return;

    setPreviewLoading(true);
    
    try {
      await onBatchImport(filesToProcess);
      
      toast({
        title: "XMLs processados automaticamente",
        description: `${filesToProcess.length} arquivo(s) processado(s) com sucesso.`,
      });
      
      // Limpar arquivos após processamento
      setSelectedFiles([]);
    } catch (error) {
      console.error('Erro ao processar arquivos automaticamente:', error);
      toast({
        title: "Erro no processamento automático",
        description: "Alguns arquivos podem não ter sido processados corretamente.",
        variant: "destructive"
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImportBatch = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione pelo menos um arquivo XML para importar.",
        variant: "destructive"
      });
      return;
    }

    setPreviewLoading(true);
    
    try {
      // Process each XML file
      for (const file of selectedFiles) {
        try {
          const xmlData = await parseXmlFile(file);
          if (xmlData) {
            const extractedData = extractDataFromXml(xmlData);
            const notaId = extractedData.numeroNF || `NF-${Math.floor(Math.random() * 100000)}`;
            
            // Add to the existing notas fiscais array
            notasFiscais.unshift({
              id: notaId,
              numero: extractedData.numeroNF || "",
              fornecedor: extractedData.emitenteRazaoSocial || "Fornecedor do XML",
              data: extractedData.dataHoraEmissao 
                ? new Date(extractedData.dataHoraEmissao).toLocaleDateString('pt-BR') 
                : new Date().toLocaleDateString('pt-BR'),
              valor: extractedData.valorTotal || "0,00",
              status: 'pending',
              // Add other fields from extractedData
              destinatarioRazaoSocial: extractedData.destinatarioRazaoSocial || "",
              destinatarioEndereco: extractedData.destinatarioEndereco || "",
              destinatarioCidade: extractedData.destinatarioCidade || "",
              destinatarioUF: extractedData.destinatarioUF || "",
              destinatarioBairro: extractedData.destinatarioBairro || "",
              destinatarioCEP: extractedData.destinatarioCEP || "",
              emitenteRazaoSocial: extractedData.emitenteRazaoSocial || "",
              dataHoraEmissao: extractedData.dataHoraEmissao || "",
              pesoTotalBruto: extractedData.pesoTotalBruto || "",
              pesoTotal: extractedData.pesoTotalBruto || "",
              chaveNF: extractedData.chaveNF || "",
            });
          }
        } catch (error) {
          console.error(`Erro ao processar arquivo ${file.name}:`, error);
        }
      }

      toast({
        title: "Importação concluída",
        description: `${selectedFiles.length} arquivo(s) importado(s) com sucesso.`,
      });
      
      // Pass files to parent component
      onBatchImport(selectedFiles);
      
      // Clear selected files after successful import
      setSelectedFiles([]);
      
    } catch (error) {
      console.error("Erro na importação em lote:", error);
      toast({
        title: "Erro na importação",
        description: "Não foi possível processar os arquivos XML.",
        variant: "destructive"
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* File upload component */}
          <FormItem>
            <FormLabel>Upload de Arquivos XML em Lote</FormLabel>
            <div className="flex flex-col items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {isLoading || previewLoading ? (
                    <Loader2 className="w-10 h-10 mb-3 text-gray-400 animate-spin" />
                  ) : (
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  )}
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                  </p>
                  <p className="text-xs text-gray-500">XML (Múltiplos arquivos, MAX. 10MB por arquivo)</p>
                </div>
                <input 
                  id="dropzone-file-batch" 
                  type="file" 
                  className="hidden" 
                  accept=".xml"
                  multiple
                  onChange={handleFileChange}
                  disabled={isLoading || previewLoading}
                />
              </label>
            </div>
          </FormItem>

          {/* Selected files list */}
          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Arquivos selecionados ({selectedFiles.length})</h3>
              <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-white">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={isLoading || previewLoading}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common fields section */}
          <div className="mt-6 border rounded-md p-4 bg-gray-50">
            <h3 className="text-sm font-medium mb-4">Campos comuns (serão aplicados a todas as notas)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Responsável pela entrega</FormLabel>
                <Input placeholder="Nome do responsável" />
              </FormItem>
              
              <FormItem>
                <FormLabel>Motorista</FormLabel>
                <Input placeholder="Nome do motorista" />
              </FormItem>
              
              <FormItem>
                <FormLabel>Número da coleta</FormLabel>
                <Input placeholder="Nº da coleta" />
              </FormItem>
              
              <FormItem>
                <FormLabel>Data de entrada</FormLabel>
                <Input type="datetime-local" />
              </FormItem>
            </div>
          </div>

          {/* Status do processamento automático */}
          {(isLoading || previewLoading) && (
            <div className="flex items-center justify-center mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-600" />
              <span className="text-blue-700">Processando arquivos automaticamente...</span>
            </div>
          )}
          
          {selectedFiles.length === 0 && !isLoading && !previewLoading && (
            <div className="text-center mt-4 p-4 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Os arquivos XML serão processados automaticamente após o upload</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportarXMLEmLote;
