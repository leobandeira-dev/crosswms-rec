
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import XmlImportForm from '../importacao/XmlImportForm';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { generateExcelTemplate } from '../../utils/xmlImportHelper';

interface ImportacaoTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onImportSuccess: (notasFiscais: any[], remetenteInfo?: any, destinatarioInfo?: any) => void;
  isLoading?: boolean;
}

const ImportacaoTabs: React.FC<ImportacaoTabsProps> = ({
  activeTab,
  setActiveTab,
  onImportSuccess,
  isLoading = false
}) => {
  // Function to download Excel template
  const handleDownloadTemplate = () => {
    generateExcelTemplate();
  };

  return (
    <Tabs defaultValue="unica" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="unica">NF Única</TabsTrigger>
        <TabsTrigger value="lote">NF em Lote</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
        <TabsTrigger value="excel">Importar Excel</TabsTrigger>
      </TabsList>
      
      <TabsContent value="unica" className="space-y-4 py-4">
        <XmlImportForm 
          onImportSuccess={onImportSuccess}
          isSingleFile={true}
        />
      </TabsContent>
      
      <TabsContent value="lote" className="py-4">
        <XmlImportForm 
          onImportSuccess={onImportSuccess}
          isSingleFile={false}
        />
        <div className="text-xs text-gray-500 mt-4">
          <p>Dicas para importação em lote:</p>
          <ul className="list-disc list-inside ml-2 mt-1">
            <li>Selecione múltiplos arquivos XML (um por nota fiscal)</li>
            <li>Arquivos devem estar no formato padrão SEFAZ</li>
            <li>O sistema identificará automaticamente remetente e destinatário</li>
          </ul>
        </div>
      </TabsContent>
      
      <TabsContent value="manual" className="py-4">
        <div className="text-sm text-gray-500 mb-4">
          Cadastre manualmente as notas fiscais e volumes na seção abaixo.
        </div>
      </TabsContent>
      
      <TabsContent value="excel" className="py-4">
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm">Use nosso modelo para importar notas fiscais via planilha.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1"
              type="button"
            >
              <Download className="h-4 w-4" /> Baixar Modelo
            </Button>
          </div>
          
          <XmlImportForm 
            onImportSuccess={onImportSuccess}
            isSingleFile={true}
            acceptExcel={true}
          />
          
          <div className="text-xs text-gray-500">
            <p>Faça download do modelo acima e preencha conforme as instruções:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Mantenha a estrutura do arquivo sem alterar as colunas</li>
              <li>Para volumes da mesma nota fiscal, repita o número da NF em linhas diferentes</li>
              <li>Preencha as dimensões (altura, largura, comprimento) e peso de cada volume</li>
              <li>Salve o arquivo como Excel (.xlsx) ou CSV (.csv) antes de fazer o upload</li>
            </ul>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ImportacaoTabs;
