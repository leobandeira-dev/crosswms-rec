
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImportTabContent from '../ImportTabContent';
import BatchImportTabContent from '../BatchImportTabContent';
import ManualTabContent from '../ManualTabContent';
import ExcelImportTabContent from '../ExcelImportTabContent';

interface ImportTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  handleSingleXmlUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleBatchXmlUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDownloadTemplate: () => void;
}

const ImportTabs: React.FC<ImportTabsProps> = ({
  activeTab,
  setActiveTab,
  isLoading,
  handleSingleXmlUpload,
  handleBatchXmlUpload,
  handleExcelUpload,
  handleDownloadTemplate
}) => {
  return (
    <Tabs defaultValue="unica" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="unica">NF Única</TabsTrigger>
        <TabsTrigger value="lote">NF em Lote</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
        <TabsTrigger value="excel">Importar Excel</TabsTrigger>
      </TabsList>
      
      <TabsContent value="unica" className="space-y-4 py-4">
        <ImportTabContent isLoading={isLoading} handleUpload={handleSingleXmlUpload} />
      </TabsContent>
      
      <TabsContent value="lote" className="py-4">
        <BatchImportTabContent isLoading={isLoading} handleUpload={handleBatchXmlUpload} />
      </TabsContent>
      
      <TabsContent value="manual" className="py-4">
        <ManualTabContent />
      </TabsContent>
      
      <TabsContent value="excel" className="py-4">
        <ExcelImportTabContent 
          isLoading={isLoading} 
          handleUpload={handleExcelUpload} 
          handleDownloadTemplate={handleDownloadTemplate} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default ImportTabs;
