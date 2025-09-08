
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmpresaForm from './EmpresaForm';
import { useEmpresaOperations } from '@/hooks/useEmpresaOperations';
import { Empresa } from '../types/empresa.types';
import EmpresaInfoTab from './details/EmpresaInfoTab';
import EmpresaAddressTab from './details/EmpresaAddressTab';
import EmpresaContactTab from './details/EmpresaContactTab';
import EmpresaDetailsHeader from './details/EmpresaDetailsHeader';
import { mapEmpresaToFormData } from './details/mapEmpresaData';

interface EmpresaDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: any;
  onSubmit?: (data: Partial<Empresa>) => void;
}

const EmpresaDetailsDialog: React.FC<EmpresaDetailsDialogProps> = ({
  open,
  onOpenChange,
  empresa,
  onSubmit,
}) => {
  const [editMode, setEditMode] = useState(false);
  const { atualizarEmpresa, isLoading } = useEmpresaOperations();

  if (!empresa) {
    return null;
  }

  // Mapear os dados da empresa para o formato esperado pelo formulário
  const empresaFormData = mapEmpresaToFormData(empresa);

  const handleSubmit = async (data: any) => {
    const success = await atualizarEmpresa(empresa.id, data);
    if (success) {
      setEditMode(false);
      // If there's an onSubmit callback, call it
      if (onSubmit) {
        onSubmit(data);
      }
    }
  };

  const toggleEditMode = () => setEditMode(!editMode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <EmpresaDetailsHeader 
            empresa={empresa} 
            editMode={editMode} 
            isLoading={isLoading} 
            toggleEditMode={toggleEditMode} 
          />
        </DialogHeader>

        {editMode ? (
          <EmpresaForm empresa={empresaFormData} onSubmit={handleSubmit} />
        ) : (
          <Tabs defaultValue="info">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informações Gerais</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
            </TabsList>
            <TabsContent value="info" className="p-1">
              <EmpresaInfoTab empresa={empresa} />
            </TabsContent>
            <TabsContent value="address" className="p-1">
              <EmpresaAddressTab empresa={empresa} />
            </TabsContent>
            <TabsContent value="contact" className="p-1">
              <EmpresaContactTab empresa={empresa} />
            </TabsContent>
          </Tabs>
        )}

        {!editMode && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmpresaDetailsDialog;
