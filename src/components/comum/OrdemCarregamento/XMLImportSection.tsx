import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Loader2, Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseXmlFile } from '@/pages/armazenagem/recebimento/utils/xmlParser';
import { extractDataFromXml } from '@/pages/armazenagem/recebimento/utils/notaFiscalExtractor';
// import { fetchNFeFromNSDocs } from '../../../nsdocs.api';

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

interface XMLImportSectionProps {
  onNFesImported: (nfes: NFe[]) => void;
  onRemetenteData?: (data: any) => void;
  onDestinatarioData?: (data: any) => void;
}

const XMLImportSection: React.FC<XMLImportSectionProps> = ({
  onNFesImported,
  onRemetenteData,
  onDestinatarioData
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [chaveNFe, setChaveNFe] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processXMLFile = async (file: File): Promise<NFe | null> => {
    try {
      const xmlData = await parseXmlFile(file);
      if (!xmlData) return null;

      const extractedData = extractDataFromXml(xmlData);
      
      // Extrair dados diretamente da estrutura XML
      const nfeProc = xmlData.nfeproc || xmlData.nfeProc || {};
      const nfeData = nfeProc.nfe || nfeProc.NFe;
      const infNFe = nfeData?.infnfe || nfeData?.infNFe;
      
      if (!infNFe) return null;
      
      const emit = infNFe.emit || {};
      const dest = infNFe.dest || {};
      const enderEmit = emit.enderemit || {};
      const enderDest = dest.enderdest || {};
      
      const nfe: NFe = {
        id: extractedData.chaveNF || `${Math.random()}`,
        chaveAcesso: extractedData.chaveNF || '',
        numero: extractedData.numeroNF || '',
        valorDeclarado: parseFloat(extractedData.valorTotal?.replace(',', '.') || '0'),
        peso: parseFloat(extractedData.pesoLiquido || extractedData.pesoBruto || '0'),
        volume: parseInt(extractedData.quantidadeVolumes || '1'),
        m3: 0,
        remetente: {
          razaoSocial: emit.xnome || '',
          cnpj: emit.cnpj || '',
          uf: enderEmit.uf || '',
          cidade: enderEmit.xmun || '',
          nomeFantasia: emit.xfant || '',
          endereco: enderEmit.xlgr || '',
          numero: enderEmit.nro || '',
          bairro: enderEmit.xbairro || '',
          cep: enderEmit.cep || '',
          telefone: enderEmit.fone || ''
        },
        destinatario: {
          razaoSocial: dest.xnome || '',
          cnpj: dest.cnpj || '',
          uf: enderDest.uf || '',
          cidade: enderDest.xmun || '',
          nomeFantasia: dest.xfant || '',
          endereco: enderDest.xlgr || '',
          numero: enderDest.nro || '',
          bairro: enderDest.xbairro || '',
          cep: enderDest.cep || '',
          telefone: enderDest.fone || ''
        }
      };
      
      return nfe;
    } catch (error) {
      console.error(`Erro ao processar arquivo XML ${file.name}:`, error);
      return null;
    }
  };

  const importXMLFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Selecione arquivos XML para importar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const importedNFes: NFe[] = [];
    let remetenteInfo: any = null;
    let destinatarioInfo: any = null;

    try {
      for (const file of selectedFiles) {
        const nfe = await processXMLFile(file);
        if (nfe) {
          importedNFes.push(nfe);

          // Capturar dados do primeiro remetente e destinatário
          if (!remetenteInfo && nfe.remetente) {
            remetenteInfo = nfe.remetente;
          }
          if (!destinatarioInfo && nfe.destinatario) {
            destinatarioInfo = nfe.destinatario;
          }
        }
      }

      if (importedNFes.length > 0) {
        onNFesImported(importedNFes);
        
        if (remetenteInfo && onRemetenteData) {
          onRemetenteData(remetenteInfo);
        }
        
        if (destinatarioInfo && onDestinatarioData) {
          onDestinatarioData(destinatarioInfo);
        }

        toast({
          title: "XMLs importados com sucesso",
          description: `${importedNFes.length} nota(s) fiscal(is) importada(s).`
        });
        
        setSelectedFiles([]);
      } else {
        toast({
          title: "Nenhuma NFe encontrada",
          description: "Não foi possível extrair dados dos arquivos XML.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao importar XMLs:', error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro ao processar os arquivos XML.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buscarNFePorChave = async () => {
    if (!chaveNFe || chaveNFe.length !== 44) {
      toast({
        title: "Chave inválida",
        description: "A chave da NFe deve ter 44 dígitos.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);

    try {
      // Simular busca por enquanto - implementar integração quando necessário
      toast({
        title: "Funcionalidade em desenvolvimento",
        description: "A busca por chave NFe será implementada em breve. Use o upload de XML."
      });
    } catch (error) {
      console.error('Erro ao buscar NFe:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar a NFe.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-500" />
          Importar NFes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload de XMLs */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="xml-upload" className="text-sm font-medium">
              Upload de Arquivos XML
            </Label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label
                htmlFor="xml-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Clique para enviar</span> ou arraste arquivos XML
                  </p>
                  <p className="text-xs text-gray-500">Múltiplos arquivos XML suportados</p>
                </div>
                <input
                  id="xml-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".xml"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Arquivos selecionados */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Arquivos selecionados:</Label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                onClick={importXMLFiles}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando XMLs...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Importar {selectedFiles.length} arquivo(s)
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Divisor */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground">Ou</span>
          </div>
        </div>

        {/* Busca por chave NFe */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="chave-nfe" className="text-sm font-medium">
              Chave da Nota Fiscal (ou múltiplas chaves separadas por vírgula)
            </Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="chave-nfe"
                placeholder="Digite uma ou múltiplas chaves de 44 dígitos separadas por vírgula"
                value={chaveNFe}
                onChange={(e) => setChaveNFe(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={buscarNFePorChave}
                disabled={isSearching || !chaveNFe}
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Insira a chave completa (44 dígitos) ou clique em "Importar NFe" para buscar e processar o XML automaticamente
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default XMLImportSection;