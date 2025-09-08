import { useState } from 'react';
import { NotaFiscalSchemaType } from './notaFiscalSchema';
import { useToast } from "@/hooks/use-toast";
import { parseXmlFile } from '../../utils/xmlParser';
import { extractDataFromXml, searchNotaFiscalByChave } from '../../utils/notaFiscalExtractor';
import { useFormSubmission } from './hooks/useFormSubmission';

export const useNotaFiscalForm = (onNotaProcessed?: (nota: any) => void) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { handleSubmit: submitForm, handleUpdate: updateForm } = useFormSubmission();
  
  const handleSubmit = async (data: NotaFiscalSchemaType & { id?: string; isUpdate?: boolean }) => {
    try {
      console.log('=== HANDLE SUBMIT FORM ===');
      console.log('Dados recebidos do formulário:', data);
      
      let result;
      
      if (data.isUpdate && data.id) {
        // Update existing nota fiscal
        console.log('Atualizando nota fiscal existente com ID:', data.id);
        result = await updateForm(data.id, data);
        console.log('Resultado da atualização:', result);
        
        // Mostrar sucesso de atualização no toast
        toast({
          title: "✅ Atualização Concluída",
          description: `Nota fiscal atualizada com sucesso. ID: ${result.id}`,
        });
      } else {
        // Create new nota fiscal - Processar como lote de 1 item
        result = await submitForm(data);
        console.log('Resultado da criação:', result);
        
        // Aplicar lógica de lote para nota individual também
        if (onNotaProcessed && !data.isUpdate) {
          console.log('=== PROCESSANDO NOTA INDIVIDUAL COMO LOTE ===');
          console.log('Nota processada sendo enviada:', result);
          onNotaProcessed(result);
        }
        
        // Mostrar sucesso de criação no toast
        toast({
          title: "✅ Processamento Concluído",
          description: `Nota fiscal processada e salva no banco de dados com ID: ${result.id}`,
        });
      }
      
      return result;
    } catch (error) {
      console.error("=== ERRO NO HANDLE SUBMIT ===");
      console.error("Erro no formulário:", error);
      
      // Toast adicional para debug
      toast({
        title: "🔍 Debug - Erro Capturado",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setValue: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        console.log('Arquivo XML selecionado:', file.name);
        
        const xmlData = await parseXmlFile(file);
        if (xmlData) {
          console.log("XML processado com sucesso, extraindo dados...");
          const extractedData = extractDataFromXml(xmlData);
          console.log("Dados extraídos:", extractedData);
          
          // Set current tab
          setValue('currentTab', 'xml');
          
          // Fill form fields with extracted data
          Object.entries(extractedData).forEach(([field, value]) => {
            if (value) {
              console.log(`Preenchendo campo ${field} com valor:`, value);
              setValue(field, value);
            }
          });
          
          toast({
            title: "XML processado",
            description: "O arquivo XML foi carregado e processado com sucesso.",
          });
        }
      } catch (error) {
        console.error("Erro ao processar o arquivo XML:", error);
        toast({
          title: "Erro",
          description: "Não foi possível processar o arquivo XML. Verifique se o formato está correto.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeySearch = async (getValues: any, setValue: any) => {
    const chaveNF = getValues('chaveNF');
    
    if (!chaveNF) {
      toast({
        title: "Erro",
        description: "Por favor, informe a chave de acesso da nota fiscal.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Set current tab
      setValue('currentTab', 'chave');
      
      const notaFiscalData = await searchNotaFiscalByChave(chaveNF);
      
      // Fill form fields with found data
      Object.entries(notaFiscalData).forEach(([field, value]) => {
        setValue(field, value);
      });
      
      toast({
        title: "Nota fiscal encontrada",
        description: "A nota fiscal foi encontrada e os dados foram carregados.",
      });
    } catch (error) {
      console.error("Erro ao buscar nota fiscal:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao buscar a nota fiscal.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBatchImport = async (files: File[], setValue: any) => {
    if (!files || files.length === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione pelo menos um arquivo XML.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Set current tab
      setValue('currentTab', 'lote');
      
      console.log('=== INICIANDO IMPORTAÇÃO EM LOTE ===');
      console.log(`Processando ${files.length} arquivo(s) XML...`);
      
      let sucessos = 0;
      let erros = 0;
      
      // Processar cada arquivo individualmente
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          console.log(`Processando arquivo ${i + 1}/${files.length}: ${file.name}`);
          
          const xmlData = await parseXmlFile(file);
          if (xmlData) {
            const extractedData = extractDataFromXml(xmlData);
            
            // Validar se tem dados essenciais
            if (!extractedData.numeroNF) {
              console.warn(`Arquivo ${file.name} não contém número de NF válido`);
              erros++;
              continue;
            }
            
            // Criar nota fiscal diretamente
            const result = await submitForm(extractedData);
            console.log(`Nota fiscal ${extractedData.numeroNF} salva com sucesso:`, result.id);
            sucessos++;
            
          } else {
            console.warn(`Não foi possível processar o arquivo ${file.name}`);
            erros++;
          }
        } catch (error) {
          console.error(`Erro ao processar arquivo ${file.name}:`, error);
          erros++;
        }
      }
      
      console.log(`=== IMPORTAÇÃO CONCLUÍDA - Sucessos: ${sucessos}, Erros: ${erros} ===`);
      
      if (sucessos > 0) {
        toast({
          title: "Importação em lote concluída",
          description: `${sucessos} nota(s) fiscal(is) importada(s) com sucesso. ${erros > 0 ? `${erros} erro(s).` : ''}`,
        });
      } else {
        toast({
          title: "Erro na importação",
          description: "Nenhuma nota fiscal foi importada com sucesso.",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error("Erro ao importar em lote:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao importar os arquivos XML em lote.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    handleSubmit,
    handleFileUpload,
    handleKeySearch,
    handleBatchImport,
    isLoading
  };
};
