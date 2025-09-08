
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { InternalFormData } from '../solicitacao/hooks/solicitacaoFormTypes';
import { EmpresaInfo } from '../solicitacao/SolicitacaoTypes';
import { NotaFiscalVolume, VolumeItem, generateVolumeId } from '../../utils/volumes/types';
import { convertVolumesToVolumeItems, ensureCompleteNotaFiscal } from '../../utils/volumes/converters';

// Empty empresa info for initialization
const EMPTY_EMPRESA_INFO: EmpresaInfo = {
  razaoSocial: '',
  cnpj: '',
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: '',
  cep: ''
};

export const useImportForm = (setIsOpen: (isOpen: boolean) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<InternalFormData>({
    remetente: EMPTY_EMPRESA_INFO,
    destinatario: EMPTY_EMPRESA_INFO,
    dataColeta: '',
    horaColeta: '',
    observacoes: '',
    notasFiscais: [],
    tipoFrete: 'FOB', // Changed from cliente to tipoFrete with default FOB
    origem: '',
    destino: '',
    origemEndereco: '',
    origemCEP: '',
    destinoEndereco: '',
    destinoCEP: ''
  });

  // Handle form input changes
  const handleInputChange = <K extends keyof InternalFormData>(field: K, value: InternalFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de coleta foi enviada com sucesso."
      });
      setIsLoading(false);
      setIsOpen(false);
    }, 1500);
  };

  // Handle single XML file upload
  const handleSingleXmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      // Simulate processing XML
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "XML importado",
        description: "Nota fiscal importada com sucesso."
      });
      
      // Add dummy data for demonstration with proper volume item structure
      const dummyNF: NotaFiscalVolume = {
        numeroNF: '12345',
        chaveNF: '12345678901234567890123456789012345678901234',
        dataEmissao: new Date().toISOString().split('T')[0],
        volumes: [
          { 
            id: generateVolumeId(),
            altura: 10, 
            largura: 20, 
            comprimento: 30, 
            peso: 5,
            quantidade: 2
          }
        ],
        remetente: 'Empresa Remetente',
        destinatario: 'Empresa Destinatário',
        valorTotal: 1000,
        pesoTotal: 5
      };
      
      // Update with properly formatted data
      setFormData(prev => ({
        ...prev,
        notasFiscais: [...prev.notasFiscais, dummyNF]
      }));
      
    } catch (error) {
      console.error("Erro ao importar XML:", error);
      toast({
        title: "Erro",
        description: "Não foi possível importar o arquivo XML.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle batch XML files upload
  const handleBatchXmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsLoading(true);
    
    try {
      // Simulate processing XMLs
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "XMLs importados",
        description: `${files.length} notas fiscais importadas com sucesso.`
      });
      
      // Add dummy data for each file with proper volume item structure
      const dummyNFs: NotaFiscalVolume[] = Array.from({ length: files.length }, (_, i) => ({
        numeroNF: `${10000 + i}`,
        chaveNF: `000000000000000000000000000000000000000${i}`,
        dataEmissao: new Date().toISOString().split('T')[0],
        volumes: [
          { 
            id: generateVolumeId(),
            altura: 10, 
            largura: 20, 
            comprimento: 30, 
            peso: 5,
            quantidade: 1
          }
        ],
        remetente: 'Empresa Remetente',
        destinatario: 'Empresa Destinatário',
        valorTotal: 500 + (i * 100),
        pesoTotal: 5 + i
      }));
      
      // Update with properly formatted data
      setFormData(prev => ({
        ...prev,
        notasFiscais: [...prev.notasFiscais, ...dummyNFs]
      }));
      
    } catch (error) {
      console.error("Erro ao importar XMLs em lote:", error);
      toast({
        title: "Erro",
        description: "Não foi possível importar os arquivos XML.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Excel file upload
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      // Simulate processing Excel
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      toast({
        title: "Excel importado",
        description: "Planilha importada com sucesso."
      });
      
      // Add dummy data with proper volume item structure
      const dummyNFs: NotaFiscalVolume[] = Array.from({ length: 3 }, (_, i) => ({
        numeroNF: `${20000 + i}`,
        chaveNF: `111111111111111111111111111111111111111${i}`,
        dataEmissao: new Date().toISOString().split('T')[0],
        volumes: [
          { 
            id: generateVolumeId(),
            altura: 15, 
            largura: 25, 
            comprimento: 35, 
            peso: 7,
            quantidade: 2
          }
        ],
        remetente: 'Empresa Excel Remetente',
        destinatario: 'Empresa Excel Destinatário',
        valorTotal: 750 + (i * 150),
        pesoTotal: 7 + (i * 2)
      }));
      
      // Update with properly formatted data
      setFormData(prev => ({
        ...prev,
        notasFiscais: [...prev.notasFiscais, ...dummyNFs]
      }));
      
    } catch (error) {
      console.error("Erro ao importar Excel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível importar o arquivo Excel.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle downloading Excel template
  const handleDownloadTemplate = () => {
    // This would typically generate and download an Excel template
    toast({
      title: "Download iniciado",
      description: "O modelo de planilha está sendo baixado."
    });
  };

  return {
    isLoading,
    formData,
    handleInputChange,
    handleSubmit,
    handleSingleXmlUpload,
    handleBatchXmlUpload,
    handleExcelUpload,
    handleDownloadTemplate
  };
};
