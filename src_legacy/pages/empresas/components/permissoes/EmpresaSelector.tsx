
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmpresaMock } from './types';
import { Skeleton } from '@/components/ui/skeleton';

interface EmpresaSelectorProps {
  selectedEmpresa: string;
  handleEmpresaChange: (value: string) => void;
  filteredEmpresas: EmpresaMock[];
  isLoading?: boolean;
}

const EmpresaSelector: React.FC<EmpresaSelectorProps> = ({
  selectedEmpresa,
  handleEmpresaChange,
  filteredEmpresas,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="mb-6">
        <Label htmlFor="empresa-select" className="mb-2 block">Selecione uma Empresa</Label>
        <Skeleton className="h-10 w-full md:w-[400px]" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Label htmlFor="empresa-select" className="mb-2 block">Selecione uma Empresa</Label>
      <Select value={selectedEmpresa} onValueChange={handleEmpresaChange}>
        <SelectTrigger id="empresa-select" className="w-full md:w-[400px]">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          {filteredEmpresas.length === 0 ? (
            <SelectItem value="no-empresas" disabled>Nenhuma empresa encontrada</SelectItem>
          ) : (
            filteredEmpresas.map(empresa => (
              <SelectItem key={empresa.id} value={empresa.id}>
                {empresa.nome} - {empresa.cnpj} ({empresa.perfil})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {filteredEmpresas.length > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          Total de {filteredEmpresas.length} empresa(s) encontrada(s)
        </div>
      )}
    </div>
  );
};

export default EmpresaSelector;
