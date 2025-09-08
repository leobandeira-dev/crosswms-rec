
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClienteDataSectionProps {
  formData: {
    cliente: string;
    origem: string;
    destino: string;
    dataColeta: string;
    [key: string]: any;
  };
  handleInputChange: (field: string, value: any) => void;
}

const ClienteDataSection: React.FC<ClienteDataSectionProps> = ({ formData, handleInputChange }) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cliente">Cliente</Label>
          <Select
            value={formData.cliente}
            onValueChange={(value) => handleInputChange('cliente', value)}
          >
            <SelectTrigger id="cliente">
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="abc">Indústria ABC Ltda</SelectItem>
                <SelectItem value="xyz">Distribuidora XYZ</SelectItem>
                <SelectItem value="rapidos">Transportes Rápidos</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="data">Data da Coleta</Label>
          <Input 
            id="data" 
            type="date" 
            value={formData.dataColeta}
            onChange={(e) => handleInputChange('dataColeta', e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="origem">Origem</Label>
          <Input 
            id="origem" 
            placeholder="Endereço de origem" 
            value={formData.origem}
            onChange={(e) => handleInputChange('origem', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="destino">Destino</Label>
          <Input 
            id="destino" 
            placeholder="Endereço de destino" 
            value={formData.destino}
            onChange={(e) => handleInputChange('destino', e.target.value)}
          />
        </div>
      </div>
    </>
  );
};

export default ClienteDataSection;
