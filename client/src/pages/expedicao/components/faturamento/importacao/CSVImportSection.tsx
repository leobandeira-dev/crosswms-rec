
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { NotaFiscal } from '../../../Faturamento';

interface CSVImportSectionProps {
  onImportCSV: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onAddLine: () => void;
}

const CSVImportSection: React.FC<CSVImportSectionProps> = ({ onImportCSV, onAddLine }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="csvImport">Importar de CSV (separado por ponto e vírgula)</Label>
        <Textarea 
          id="csvImport" 
          placeholder="Cole aqui seu CSV (cabeçalho na primeira linha)"
          className="h-40 mt-2"
          onChange={onImportCSV}
        />
        <p className="text-sm text-muted-foreground mt-2">
          O CSV deve conter cabeçalho com nomes das colunas. Ex: Data;Cliente;Peso Nota;Frete por Tonelada;...
        </p>
      </div>
      
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Instruções</h3>
        </div>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>Separe as colunas com ponto e vírgula (;)</li>
          <li>A primeira linha deve conter os nomes das colunas</li>
          <li>Datas no formato DD/MM/AAAA</li>
          <li>Valores decimais com ponto (.)</li>
          <li>Campos obrigatórios: Data, Cliente, Peso Nota, Frete por Tonelada, Peso Mínimo, Alíquota ICMS e Alíquota Expresso</li>
        </ul>
        <Button className="mt-auto" onClick={onAddLine}>
          Adicionar Linha Manualmente
        </Button>
      </div>
    </div>
  );
};

export default CSVImportSection;
