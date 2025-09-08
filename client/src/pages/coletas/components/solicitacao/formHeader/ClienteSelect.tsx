
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ClienteSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

const ClienteSelect: React.FC<ClienteSelectProps> = ({ 
  value = '',
  onValueChange = () => {}
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="cliente">Cliente</Label>
      <Select
        value={value}
        onValueChange={onValueChange}
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
  );
};

export default ClienteSelect;
