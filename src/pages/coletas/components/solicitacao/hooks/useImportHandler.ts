
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { NotaFiscalVolume } from '../../../utils/volumes/types';
import { VolumeItem, generateVolumeId } from '../../../utils/volumes/types';
import { InternalFormData } from './solicitacaoFormTypes';
import { convertVolumesToVolumeItems } from '../../../utils/volumes/converters';
import { extractEmpresaInfoFromXML } from '../empresa/empresaUtils';
import { parseXmlFile } from '@/pages/armazenagem/recebimento/utils/xmlParser';
import { extractDataFromXml } from '@/pages/armazenagem/recebimento/utils/notaFiscalExtractor';
import { processMultipleXMLFiles } from '../../../utils/xmlImportHelper';

export const useImportHandler = (
  setFormData: React.Dispatch<React.SetStateAction<InternalFormData>>
) => {
  const [isImporting, setIsImporting] = useState(false);

  const handleImportSuccess = (notasFiscais: NotaFiscalVolume[] | any[], remetenteInfo?: any, destinatarioInfo?: any) => {
    setIsImporting(true);
    try {
      // Ensure all notasFiscais have the required properties
      const validatedNotasFiscais: NotaFiscalVolume[] = notasFiscais.map(nf => {
        return {
          numeroNF: nf.numeroNF || '',
          chaveNF: nf.chaveNF || '',
          dataEmissao: nf.dataEmissao || '',
          volumes: Array.isArray(nf.volumes) ? convertVolumesToVolumeItems(nf.volumes) : [],
          remetente: nf.remetente || (remetenteInfo?.nome || ''),
          destinatario: nf.destinatario || (destinatarioInfo?.nome || ''),
          valorTotal: nf.valorTotal || 0,
          pesoTotal: nf.pesoTotal || 0,
          emitenteCNPJ: nf.emitenteCNPJ || (remetenteInfo?.cnpj || '')
        };
      });
      
      toast({
        title: "Notas fiscais importadas",
        description: `${validatedNotasFiscais.length} notas fiscais importadas com sucesso.`
      });
      
      // Update all form fields with XML data
      setFormData(prev => {
        // First, update the notasFiscais array
        const updatedData = {
          ...prev,
          notasFiscais: validatedNotasFiscais
        };
        
        // If there's info about the sender/recipient, populate the header fields too
        if (remetenteInfo) {
          updatedData.remetenteInfo = remetenteInfo;
          
          // Convert to proper EmpresaInfo format if needed
          if (remetenteInfo.endereco) {
            updatedData.remetente = extractEmpresaInfoFromXML(remetenteInfo);
          }
          
          // Set origin address fields
          updatedData.origem = `${remetenteInfo.endereco?.cidade || ''} - ${remetenteInfo.endereco?.uf || ''}`;
          updatedData.origemEndereco = remetenteInfo.endereco?.logradouro 
            ? `${remetenteInfo.endereco.logradouro}, ${remetenteInfo.endereco.numero || ''}`
            : '';
          updatedData.origemCEP = remetenteInfo.endereco?.cep || '';
          
          // Set tipoFrete field (default to FOB) instead of cliente
          updatedData.tipoFrete = updatedData.tipoFrete || 'FOB';
        }
        
        if (destinatarioInfo) {
          updatedData.destinatarioInfo = destinatarioInfo;
          
          // Convert to proper EmpresaInfo format if needed
          if (destinatarioInfo.endereco) {
            updatedData.destinatario = extractEmpresaInfoFromXML(destinatarioInfo);
          }
          
          // Set destination address fields
          updatedData.destino = `${destinatarioInfo.endereco?.cidade || ''} - ${destinatarioInfo.endereco?.uf || ''}`;
          updatedData.destinoEndereco = destinatarioInfo.endereco?.logradouro 
            ? `${destinatarioInfo.endereco.logradouro}, ${destinatarioInfo.endereco.numero || ''}`
            : '';
          updatedData.destinoCEP = destinatarioInfo.endereco?.cep || '';
        }
        
        return updatedData;
      });
    } catch (error) {
      console.error("Erro ao processar notas fiscais importadas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar as notas fiscais importadas.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Function to handle batch import of XML files
  const handleBatchImport = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione pelo menos um arquivo XML para importar.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    
    try {
      // Use the existing xmlImportHelper for batch processing
      const processedData = await processMultipleXMLFiles(Array.from(files));
      
      if (processedData && processedData.notasFiscais && processedData.notasFiscais.length > 0) {
        // Process the imported data
        console.log("Dados processados:", processedData);
        
        // Convert to expected format
        const notasFiscais = processedData.notasFiscais.map((nf: any) => ({
          numeroNF: nf.numeroNF || '',
          chaveNF: nf.chaveNF || '',
          dataEmissao: nf.dataEmissao || new Date().toISOString().split('T')[0],
          volumes: convertVolumesToVolumeItems(nf.volumes || []),
          remetente: nf.remetente || processedData.remetente?.razaoSocial || '',
          destinatario: nf.destinatario || processedData.destinatario?.razaoSocial || '',
          valorTotal: nf.valorTotal || 0,
          pesoTotal: nf.pesoTotal || 0,
          emitenteCNPJ: nf.emitenteCNPJ || processedData.remetente?.cnpj || ''
        }));
        
        console.log("Notas fiscais a serem importadas:", notasFiscais);
        console.log("Remetente:", processedData.remetente);
        console.log("Destinatário:", processedData.destinatario);
        
        handleImportSuccess(notasFiscais, processedData.remetente, processedData.destinatario);
        
        toast({
          title: "XMLs importados",
          description: `${notasFiscais.length} notas fiscais importadas com sucesso.`
        });
      } else {
        // Fallback to the direct XML parsing approach
        console.log("Tentando processamento direto dos XMLs...");
        const notasFiscais: NotaFiscalVolume[] = [];
        let remetenteInfo: any = null;
        let destinatarioInfo: any = null;
        
        // Process each XML file
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          try {
            console.log(`Processando arquivo XML: ${file.name}`);
            
            // Parse XML file
            const xmlData = await parseXmlFile(file);
            if (!xmlData) {
              console.log(`Arquivo ${file.name} não pôde ser parseado`);
              continue;
            }
            
            console.log(`XML parseado com sucesso: ${file.name}`);
            
            // Extract data from XML
            const extractedData = extractDataFromXml(xmlData);
            console.log('Dados extraídos:', extractedData);
            
            if (!extractedData.numeroNF) {
              console.log(`Não foi possível extrair o número da NF do arquivo ${file.name}`);
              continue;
            }
            
            // Create volume with extracted data and default dimensions
            const volume: VolumeItem = {
              id: generateVolumeId(),
              altura: 30, // Default height in cm
              largura: 30, // Default width in cm
              comprimento: 30, // Default length in cm
              quantidade: parseInt(extractedData.volumesTotal) || 1,
              peso: parseFloat((extractedData.pesoTotalBruto || '0').replace(',', '.')),
            };
            
            console.log('Volume criado:', volume);
            
            // Create nota fiscal object
            const notaFiscal: NotaFiscalVolume = {
              numeroNF: extractedData.numeroNF || '',
              chaveNF: extractedData.chaveNF || '',
              dataEmissao: extractedData.dataHoraEmissao?.split('T')[0] || '',
              volumes: [volume],
              remetente: extractedData.emitenteRazaoSocial || '',
              destinatario: extractedData.destinatarioRazaoSocial || '',
              valorTotal: parseFloat((extractedData.valorTotal || '0').replace(',', '.')),
              pesoTotal: parseFloat((extractedData.pesoTotalBruto || '0').replace(',', '.')),
              emitenteCNPJ: extractedData.emitenteCNPJ || ''
            };
            
            console.log('Nota fiscal criada:', notaFiscal);
            
            // Add to notasFiscais array
            notasFiscais.push(notaFiscal);
            
            // Store remetente and destinatario info from the first valid XML
            if (!remetenteInfo && extractedData.emitenteRazaoSocial) {
              remetenteInfo = {
                nome: extractedData.emitenteRazaoSocial,
                cnpj: extractedData.emitenteCNPJ,
                endereco: {
                  logradouro: extractedData.emitenteEndereco,
                  numero: extractedData.emitenteNumero,
                  complemento: extractedData.emitenteComplemento,
                  bairro: extractedData.emitenteBairro,
                  cidade: extractedData.emitenteCidade,
                  uf: extractedData.emitenteUF,
                  cep: extractedData.emitenteCEP
                }
              };
            }
            
            if (!destinatarioInfo && extractedData.destinatarioRazaoSocial) {
              destinatarioInfo = {
                nome: extractedData.destinatarioRazaoSocial,
                cnpj: extractedData.destinatarioCNPJ,
                endereco: {
                  logradouro: extractedData.destinatarioEndereco,
                  numero: extractedData.destinatarioNumero,
                  complemento: extractedData.destinatarioComplemento,
                  bairro: extractedData.destinatarioBairro,
                  cidade: extractedData.destinatarioCidade,
                  uf: extractedData.destinatarioUF,
                  cep: extractedData.destinatarioCEP
                }
              };
            }
          } catch (error) {
            console.error(`Erro ao processar arquivo ${file.name}:`, error);
          }
        }
        
        // Check if we found any valid nota fiscal data
        if (notasFiscais.length === 0) {
          toast({
            title: "Erro",
            description: "Não foi possível extrair dados dos arquivos XML.",
            variant: "destructive"
          });
          setIsImporting(false);
          return;
        }
        
        console.log(`Processamento concluído. ${notasFiscais.length} notas fiscais encontradas.`);
        console.log('Remetente info:', remetenteInfo);
        console.log('Destinatario info:', destinatarioInfo);
        
        // Process imported notas fiscais
        handleImportSuccess(notasFiscais, remetenteInfo, destinatarioInfo);
      }
    } catch (error) {
      console.error("Erro ao importar XMLs em lote:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao importar os arquivos XML em lote.",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return {
    isImporting,
    handleImportSuccess,
    handleBatchImport
  };
};
