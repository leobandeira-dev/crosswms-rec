
import React, { useCallback, useState } from 'react';
import { Upload, Loader2, FileText } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/hooks/use-toast';
import { extractNFInfoFromXML, processMultipleXMLFiles, processExcelFile } from '../../utils/xmlImportHelper';
import { NotaFiscalVolume } from '../../utils/volumes/types';
import { convertVolumesToVolumeItems } from '../../utils/volumes/converters';
import { parseXmlFile } from '../../../armazenagem/recebimento/utils/xmlParser';
import { extractDataFromXml } from '../../../armazenagem/recebimento/utils/notaFiscalExtractor';
import { generateVolumeId } from '../../utils/volumes/types';

interface XmlImportFormProps {
  onImportSuccess: (notasFiscais: NotaFiscalVolume[], remetenteInfo?: any, destinatarioInfo?: any) => void;
  isSingleFile?: boolean;
  acceptExcel?: boolean;
  isLoading?: boolean;
}

const XmlImportForm: React.FC<XmlImportFormProps> = ({ 
  onImportSuccess, 
  isSingleFile = true,
  acceptExcel = false,
  isLoading: externalLoading = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const loading = isLoading || externalLoading;
  const [fileCount, setFileCount] = useState(0);

  // Check if all XMLs have the same sender (remetente)
  const validateSenderConsistency = (notasFiscais: any[]): boolean => {
    if (notasFiscais.length <= 1) return true;
    
    const firstSenderCNPJ = notasFiscais[0].emitenteCNPJ;
    
    for (let i = 1; i < notasFiscais.length; i++) {
      if (notasFiscais[i].emitenteCNPJ !== firstSenderCNPJ) {
        return false;
      }
    }
    
    return true;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (loading) return;
    if (acceptedFiles.length === 0) return;
    
    setIsLoading(true);
    setFileCount(acceptedFiles.length);
    
    try {
      // Handle Excel file
      if (acceptExcel && acceptedFiles[0].name.match(/\.(xlsx|xls|csv)$/i)) {
        const result = await processExcelFile(acceptedFiles[0]);
        
        if (result && result.notasFiscais && result.notasFiscais.length > 0) {
          // Validate that all senders are the same
          const notasWithSenderInfo = result.notasFiscais.filter((nf: any) => nf.emitenteCNPJ);
          
          if (notasWithSenderInfo.length > 1) {
            // Check if all have the same emitenteCNPJ
            const firstCNPJ = notasWithSenderInfo[0].emitenteCNPJ;
            const allSameSender = notasWithSenderInfo.every((nf: any) => nf.emitenteCNPJ === firstCNPJ);
            
            if (!allSameSender) {
              toast({
                title: "Erro na importação",
                description: "Você deve cadastrar uma coleta por remetente",
                variant: "destructive"
              });
              setIsLoading(false);
              return;
            }
          }
          
          // Convert to the expected format
          const completeNotasFiscais: NotaFiscalVolume[] = result.notasFiscais.map((nf: any) => ({
            numeroNF: nf.numeroNF || '',
            chaveNF: nf.chaveNF || '',
            dataEmissao: nf.dataEmissao || new Date().toISOString().split('T')[0],
            volumes: convertVolumesToVolumeItems(nf.volumes || []),
            remetente: nf.remetente || result.remetente?.razaoSocial || '',
            emitenteCNPJ: nf.emitenteCNPJ || result.remetente?.cnpj || '',
            destinatario: nf.destinatario || result.destinatario?.razaoSocial || '',
            valorTotal: nf.valorTotal || 0,
            pesoTotal: nf.pesoTotal || 0
          }));
          
          onImportSuccess(completeNotasFiscais, result.remetente, result.destinatario);
          
          toast({
            title: "Excel importado",
            description: `${completeNotasFiscais.length} notas fiscais importadas com sucesso.`
          });
        }
      } else if (isSingleFile) {
        // Handle single XML file using the armazenagem/recebimento extractor
        const file = acceptedFiles[0];
        
        try {
          const xmlData = await parseXmlFile(file);
          if (xmlData) {
            const extractedData = extractDataFromXml(xmlData);
            
            // Create nota fiscal with extracted data
            const notaFiscal: NotaFiscalVolume = {
              numeroNF: extractedData.numeroNF || '',
              chaveNF: extractedData.chaveNF || '',
              dataEmissao: extractedData.dataHoraEmissao || new Date().toISOString().split('T')[0],
              volumes: [],
              remetente: extractedData.emitenteRazaoSocial || '',
              emitenteCNPJ: extractedData.emitenteCNPJ || '',
              destinatario: extractedData.destinatarioRazaoSocial || '',
              valorTotal: parseFloat(extractedData.valorTotal || '0'),
              pesoTotal: parseFloat(extractedData.pesoTotalBruto || '0')
            };
            
            // Add volume if volumesTotal is present
            if (extractedData.volumesTotal && !isNaN(parseInt(extractedData.volumesTotal))) {
              const quantidade = parseInt(extractedData.volumesTotal);
              
              // Create a default volume with quantity from XML
              notaFiscal.volumes = [{
                id: generateVolumeId(),
                altura: 30, // Default height
                largura: 30, // Default width
                comprimento: 30, // Default length
                quantidade: quantidade,
                peso: parseFloat(extractedData.pesoTotalBruto || '0') / quantidade, // Divide total weight by quantity
              }];
            } else {
              // Create at least one default volume if no volume information
              notaFiscal.volumes = [{
                id: generateVolumeId(),
                altura: 30,
                largura: 30,
                comprimento: 30,
                quantidade: 1,
                peso: parseFloat(extractedData.pesoTotalBruto || '0'),
              }];
            }
            
            // Create remetente info
            const remetenteInfo = {
              cnpj: extractedData.emitenteCNPJ || '',
              razaoSocial: extractedData.emitenteRazaoSocial || '',
              nome: extractedData.emitenteRazaoSocial || '',
              enderecoFormatado: `${extractedData.emitenteEndereco || ''}, ${extractedData.emitenteNumero || ''} - ${extractedData.emitenteBairro || ''}, ${extractedData.emitenteCidade || ''} - ${extractedData.emitenteUF || ''}`,
              endereco: {
                logradouro: extractedData.emitenteEndereco || '',
                numero: extractedData.emitenteNumero || '',
                complemento: extractedData.emitenteComplemento || '',
                bairro: extractedData.emitenteBairro || '',
                cidade: extractedData.emitenteCidade || '',
                uf: extractedData.emitenteUF || '',
                cep: extractedData.emitenteCEP || '',
              }
            };
            
            // Create destinatario info
            const destinatarioInfo = {
              cnpj: extractedData.destinatarioCNPJ || '',
              razaoSocial: extractedData.destinatarioRazaoSocial || '',
              nome: extractedData.destinatarioRazaoSocial || '',
              enderecoFormatado: `${extractedData.destinatarioEndereco || ''}, ${extractedData.destinatarioNumero || ''} - ${extractedData.destinatarioBairro || ''}, ${extractedData.destinatarioCidade || ''} - ${extractedData.destinatarioUF || ''}`,
              endereco: {
                logradouro: extractedData.destinatarioEndereco || '',
                numero: extractedData.destinatarioNumero || '',
                complemento: extractedData.destinatarioComplemento || '',
                bairro: extractedData.destinatarioBairro || '',
                cidade: extractedData.destinatarioCidade || '',
                uf: extractedData.destinatarioUF || '',
                cep: extractedData.destinatarioCEP || '',
              }
            };
            
            onImportSuccess([notaFiscal], remetenteInfo, destinatarioInfo);
            
            toast({
              title: "XML importado",
              description: `Nota fiscal ${notaFiscal.numeroNF} importada com sucesso.`
            });
          }
        } catch (error) {
          console.error("Erro ao processar XML:", error);
          // Try with the old method as fallback
          const result = await extractNFInfoFromXML(file);
          
          if (result && result.nfInfo) {
            const notaFiscal: NotaFiscalVolume = {
              numeroNF: result.nfInfo.numeroNF || '',
              chaveNF: result.nfInfo.chaveNF || '',
              dataEmissao: result.nfInfo.dataEmissao || new Date().toISOString().split('T')[0],
              volumes: convertVolumesToVolumeItems(result.nfInfo.volumes || []),
              remetente: result.remetente?.razaoSocial || '',
              emitenteCNPJ: result.remetente?.cnpj || '',
              destinatario: result.destinatario?.razaoSocial || '',
              valorTotal: result.nfInfo.valorTotal || 0,
              pesoTotal: result.nfInfo.pesoTotal || 0
            };
            
            onImportSuccess([notaFiscal], result.remetente, result.destinatario);
            
            toast({
              title: "XML importado",
              description: `Nota fiscal ${result.nfInfo.numeroNF} importada com sucesso.`
            });
          }
        }
      } else {
        // Handle multiple XML files
        const extractedDataList = [];
        let firstEmitenteCNPJ = "";
        let hasMultipleRemetentes = false;
        
        // Process each XML file with the extractor from armazenagem/recebimento
        for (const file of acceptedFiles) {
          try {
            const xmlData = await parseXmlFile(file);
            if (xmlData) {
              const extractedData = extractDataFromXml(xmlData);
              
              // Check if we already have a sender to compare
              if (firstEmitenteCNPJ === "") {
                firstEmitenteCNPJ = extractedData.emitenteCNPJ || "";
              } else if (extractedData.emitenteCNPJ && extractedData.emitenteCNPJ !== firstEmitenteCNPJ) {
                // Found different sender
                hasMultipleRemetentes = true;
                break;
              }
              
              extractedDataList.push(extractedData);
            }
          } catch (error) {
            console.error(`Error processing XML file ${file.name}:`, error);
          }
        }
        
        // Check if multiple remetentes were found
        if (hasMultipleRemetentes) {
          toast({
            title: "Erro na importação",
            description: "Você deve cadastrar uma coleta por remetente",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        
        // Check if any data was extracted
        if (extractedDataList.length > 0) {
          // Create notasFiscais
          const notasFiscais: NotaFiscalVolume[] = extractedDataList.map(data => {
            const nf: NotaFiscalVolume = {
              numeroNF: data.numeroNF || '',
              chaveNF: data.chaveNF || '',
              dataEmissao: data.dataHoraEmissao || new Date().toISOString().split('T')[0],
              volumes: [],
              remetente: data.emitenteRazaoSocial || '',
              emitenteCNPJ: data.emitenteCNPJ || '',
              destinatario: data.destinatarioRazaoSocial || '',
              valorTotal: parseFloat(data.valorTotal || '0'),
              pesoTotal: parseFloat(data.pesoTotalBruto || '0')
            };
            
            // Add volume if volumesTotal is present
            if (data.volumesTotal && !isNaN(parseInt(data.volumesTotal))) {
              const quantidade = parseInt(data.volumesTotal);
              
              // Create a default volume with quantity from XML
              nf.volumes = [{
                id: generateVolumeId(),
                altura: 30, // Default height
                largura: 30, // Default width
                comprimento: 30, // Default length
                quantidade: quantidade,
                peso: parseFloat(data.pesoTotalBruto || '0') / quantidade, // Divide total weight by quantity
                cubicVolume: 30 * 30 * 30 * quantidade // Calculate cubic volume
              }];
            } else {
              // Create at least one default volume if no volume information
              nf.volumes = [{
                id: generateVolumeId(),
                altura: 30,
                largura: 30,
                comprimento: 30,
                quantidade: 1,
                peso: parseFloat(data.pesoTotalBruto || '0'),
                cubicVolume: 30 * 30 * 30 // Calculate cubic volume
              }];
            }
            
            return nf;
          });
          
          // Get sender and recipient info from first note
          const firstData = extractedDataList[0];
          
          // Create remetente info
          const remetenteInfo = {
            cnpj: firstData.emitenteCNPJ || '',
            razaoSocial: firstData.emitenteRazaoSocial || '',
            nome: firstData.emitenteRazaoSocial || '',
            enderecoFormatado: `${firstData.emitenteEndereco || ''}, ${firstData.emitenteNumero || ''} - ${firstData.emitenteBairro || ''}, ${firstData.emitenteCidade || ''} - ${firstData.emitenteUF || ''}`,
            endereco: {
              logradouro: firstData.emitenteEndereco || '',
              numero: firstData.emitenteNumero || '',
              complemento: firstData.emitenteComplemento || '',
              bairro: firstData.emitenteBairro || '',
              cidade: firstData.emitenteCidade || '',
              uf: firstData.emitenteUF || '',
              cep: firstData.emitenteCEP || '',
            }
          };
          
          // Create destinatario info - this can vary
          const destinatarioInfo = {
            cnpj: firstData.destinatarioCNPJ || '',
            razaoSocial: firstData.destinatarioRazaoSocial || '',
            nome: firstData.destinatarioRazaoSocial || '',
            enderecoFormatado: `${firstData.destinatarioEndereco || ''}, ${firstData.destinatarioNumero || ''} - ${firstData.destinatarioBairro || ''}, ${firstData.destinatarioCidade || ''} - ${firstData.destinatarioUF || ''}`,
            endereco: {
              logradouro: firstData.destinatarioEndereco || '',
              numero: firstData.destinatarioNumero || '',
              complemento: firstData.destinatarioComplemento || '',
              bairro: firstData.destinatarioBairro || '',
              cidade: firstData.destinatarioCidade || '',
              uf: firstData.destinatarioUF || '',
              cep: firstData.destinatarioCEP || '',
            }
          };
          
          onImportSuccess(notasFiscais, remetenteInfo, destinatarioInfo);
          
          toast({
            title: "XMLs importados",
            description: `${notasFiscais.length} notas fiscais importadas com sucesso.`
          });
        } else {
          // Fallback to old method
          const result = await processMultipleXMLFiles(acceptedFiles);
          
          if (result.notasFiscais.length > 0) {
            // Check for multiple remetentes
            const senderCNPJs = new Set();
            result.notasFiscais.forEach((nf: any) => {
              if (nf.emitenteCNPJ) {
                senderCNPJs.add(nf.emitenteCNPJ);
              }
            });
            
            if (senderCNPJs.size > 1) {
              toast({
                title: "Erro na importação",
                description: "Você deve cadastrar uma coleta por remetente",
                variant: "destructive"
              });
              setIsLoading(false);
              return;
            }
            
            const completeNotasFiscais: NotaFiscalVolume[] = result.notasFiscais.map((nf: any) => ({
              numeroNF: nf.numeroNF || '',
              chaveNF: nf.chaveNF || '',
              dataEmissao: nf.dataEmissao || new Date().toISOString().split('T')[0],
              volumes: convertVolumesToVolumeItems(nf.volumes || []),
              remetente: nf.remetente || result.remetente?.razaoSocial || '',
              emitenteCNPJ: nf.emitenteCNPJ || result.remetente?.cnpj || '',
              destinatario: nf.destinatario || result.destinatario?.razaoSocial || '',
              valorTotal: nf.valorTotal || 0,
              pesoTotal: nf.pesoTotal || 0
            }));
            
            onImportSuccess(completeNotasFiscais, result.remetente, result.destinatario);
            
            toast({
              title: "XMLs importados",
              description: `${completeNotasFiscais.length} notas fiscais importadas com sucesso.`
            });
          } else {
            toast({
              title: "Atenção",
              description: "Nenhuma nota fiscal válida encontrada nos arquivos XML."
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao importar arquivo:", error);
      toast({
        title: "Erro",
        description: `Não foi possível importar o arquivo ${acceptExcel ? 'XML/Excel' : 'XML'}.`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setFileCount(0);
    }
  }, [isSingleFile, loading, onImportSuccess, acceptExcel]);

  const getAcceptTypes = () => {
    if (acceptExcel) {
      return {
        'text/xml': ['.xml'],
        'application/xml': ['.xml'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-excel': ['.xls', '.xlsx', '.csv'],
        'text/csv': ['.csv']
      };
    }
    return {
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    };
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: getAcceptTypes(),
    disabled: loading,
    maxFiles: isSingleFile ? 1 : undefined
  });

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-cross-blue bg-blue-50' : 'border-gray-300'}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center p-4">
          {loading ? (
            <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
          ) : (
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
          )}
          
          <p className="text-sm font-medium">
            {loading ? `Processando ${fileCount} arquivo(s)...` : 
              isDragActive ? "Solte os arquivos aqui..." : 
              `Clique ou arraste ${isSingleFile ? 'um arquivo' : 'arquivos'} ${acceptExcel ? 'XML ou Excel' : 'XML'}`
            }
          </p>
          
          <p className="text-xs text-gray-500 mt-1">
            {isSingleFile ? 
              `Arquivos ${acceptExcel ? 'XML, Excel (.xlsx, .xls) ou CSV' : 'XML'} apenas` :
              `Múltiplos arquivos ${acceptExcel ? 'XML, Excel (.xlsx, .xls) ou CSV' : 'XML'}`
            }
          </p>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 flex items-center">
        <FileText className="h-3 w-3 mr-1" />
        <span>
          {acceptExcel ? 
            "Importação de notas fiscais via arquivos XML, Excel (.xlsx, .xls) ou CSV" : 
            "Importação de notas fiscais via arquivo XML"
          }
        </span>
      </div>
    </div>
  );
};

export default XmlImportForm;
