
import React from 'react';
import { DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';

interface EmpresaDetailsHeaderProps {
  empresa: any;
  editMode: boolean;
  isLoading: boolean;
  toggleEditMode: () => void;
}

const EmpresaDetailsHeader: React.FC<EmpresaDetailsHeaderProps> = ({ 
  empresa, 
  editMode, 
  isLoading, 
  toggleEditMode 
}) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <DialogTitle>
          {empresa.nomeFantasia || empresa.nome_fantasia || empresa.razaoSocial || empresa.razao_social}
        </DialogTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={toggleEditMode}
          disabled={isLoading}
        >
          <Pencil size={14} />
          {editMode ? 'Cancelar Edição' : 'Editar'}
        </Button>
      </div>
      <DialogDescription>
        CNPJ: {empresa.cnpj} | Status: {' '}
        <Badge variant={empresa.status === 'ativo' ? 'default' : 'destructive'}>
          {empresa.status === 'ativo' ? 'Ativo' : 'Inativo'}
        </Badge>
      </DialogDescription>
    </>
  );
};

export default EmpresaDetailsHeader;
