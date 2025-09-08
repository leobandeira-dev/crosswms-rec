
import React from 'react';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';

interface ImportTabContentProps {
  isLoading: boolean;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const ImportTabContent: React.FC<ImportTabContentProps> = ({ isLoading, handleUpload }) => {
  return (
    <div className="border rounded-md p-4">
      <Label className="mb-2 block">Importar Nota Fiscal via XML</Label>
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
            <p className="text-xs text-gray-500">Arquivo XML da nota fiscal</p>
          </div>
          <input 
            id="xml-upload" 
            type="file" 
            className="hidden" 
            accept=".xml"
            onChange={handleUpload}
            disabled={isLoading}
          />
        </label>
      </div>
    </div>
  );
};

export default ImportTabContent;
