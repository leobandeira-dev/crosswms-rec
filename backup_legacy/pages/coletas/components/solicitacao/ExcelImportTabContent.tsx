
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, Download, Loader2 } from 'lucide-react';

interface ExcelImportTabContentProps {
  isLoading: boolean;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDownloadTemplate: () => void;
}

const ExcelImportTabContent: React.FC<ExcelImportTabContentProps> = ({ 
  isLoading, 
  handleUpload, 
  handleDownloadTemplate 
}) => {
  return (
    <div className="border rounded-md p-4 space-y-4">
      <div className="flex justify-between items-center">
        <Label>Arquivo Excel/CSV</Label>
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
      
      <div className="flex flex-col items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isLoading ? (
              <Loader2 className="w-10 h-10 mb-3 text-gray-400 animate-spin" />
            ) : (
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
            )}
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
            </p>
            <p className="text-xs text-gray-500">Arquivos Excel (.xlsx, .xls) ou CSV (.csv)</p>
          </div>
          <input 
            id="excel-upload" 
            type="file" 
            className="hidden" 
            accept=".xlsx,.xls,.csv"
            onChange={handleUpload}
            disabled={isLoading}
          />
        </label>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>Faça download do modelo acima e preencha conforme as instruções:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Mantenha a estrutura do arquivo sem alterar as colunas</li>
          <li>Para volumes da mesma nota fiscal, repita o número da NF em linhas diferentes</li>
          <li>Salve o arquivo como Excel (.xlsx) ou CSV (.csv) antes de fazer o upload</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelImportTabContent;
