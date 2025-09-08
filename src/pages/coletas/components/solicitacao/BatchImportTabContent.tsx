
import React from 'react';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';

interface BatchImportTabContentProps {
  isLoading: boolean;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

const BatchImportTabContent: React.FC<BatchImportTabContentProps> = ({ isLoading, handleUpload }) => {
  return (
    <div className="border rounded-md p-4">
      <Label className="mb-2 block">Importar Múltiplas Notas Fiscais via XML</Label>
      <div className="flex flex-col items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isLoading ? (
              <Loader2 className="w-10 h-10 mb-3 text-gray-400 animate-spin" />
            ) : (
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
            )}
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Selecione múltiplos arquivos XML</span>
            </p>
            <p className="text-xs text-gray-500">Um arquivo por nota fiscal</p>
          </div>
          <input 
            id="xml-multiple-upload" 
            type="file" 
            className="hidden" 
            accept=".xml"
            multiple
            onChange={handleUpload}
            disabled={isLoading}
          />
        </label>
      </div>
      <div className="text-xs text-gray-500 mt-4">
        <p>Dicas para importação em lote:</p>
        <ul className="list-disc list-inside ml-2 mt-1">
          <li>Selecione múltiplos arquivos XML (um por nota fiscal)</li>
          <li>Arquivos devem estar no formato padrão SEFAZ</li>
          <li>O sistema extrairá automaticamente dados do remetente e destinatário</li>
        </ul>
      </div>
    </div>
  );
};

export default BatchImportTabContent;
