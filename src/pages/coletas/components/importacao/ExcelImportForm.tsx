
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, Download, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { NotaFiscalVolume } from '../../utils/volumes/types';
import { generateExcelTemplate, processExcelFile } from '../../utils/xmlImportHelper';
import { DadosEmpresa } from '../../types/coleta.types';

interface ExcelImportFormProps {
  onImportSuccess: (notasFiscais: NotaFiscalVolume[], remetenteInfo?: DadosEmpresa, destinatarioInfo?: DadosEmpresa) => void;
}

const ExcelImportForm: React.FC<ExcelImportFormProps> = ({ onImportSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      const result = await processExcelFile(file);
      
      if (result.notasFiscais.length > 0) {
        onImportSuccess(
          result.notasFiscais,
          result.remetente || undefined,
          result.destinatario || undefined
        );
        
        toast({
          title: "Planilha importada",
          description: `${result.notasFiscais.length} notas fiscais importadas com sucesso.`
        });
      } else {
        toast({
          title: "Atenção",
          description: "Nenhuma nota fiscal válida encontrada na planilha."
        });
      }
    } catch (error) {
      console.error("Erro ao importar Excel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível importar o arquivo. Verifique se está no formato correto.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to download Excel template
  const handleDownloadTemplate = () => {
    generateExcelTemplate();
  };

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
            onChange={handleExcelUpload}
            disabled={isLoading}
          />
        </label>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>Faça download do modelo acima e preencha conforme as instruções:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Mantenha a estrutura do arquivo sem alterar as colunas</li>
          <li>Inclua dados do remetente e destinatário</li>
          <li>Para volumes da mesma nota fiscal, repita o número da NF em linhas diferentes</li>
          <li>Salve o arquivo como Excel (.xlsx) ou CSV (.csv) antes de fazer o upload</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelImportForm;
