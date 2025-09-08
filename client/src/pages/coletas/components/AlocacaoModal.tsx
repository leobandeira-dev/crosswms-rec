
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Carga } from '../types/coleta.types';

// Schema for form validation
const alocacaoSchema = z.object({
  motoristaId: z.string({ required_error: 'Selecione um motorista' }),
  veiculoId: z.string({ required_error: 'Selecione um veículo' }),
});

type AlocacaoFormData = z.infer<typeof alocacaoSchema>;

// Mock data for motoristas and veículos
const motoristasData = [
  { id: 'm1', nome: 'José da Silva' },
  { id: 'm2', nome: 'Carlos Santos' },
  { id: 'm3', nome: 'Pedro Oliveira' },
  { id: 'm4', nome: 'Antônio Ferreira' },
  { id: 'm5', nome: 'Manuel Costa' },
];

const veiculosData = [
  { id: 'v1', placa: 'ABC-1234', modelo: 'Fiorino' },
  { id: 'v2', placa: 'DEF-5678', modelo: 'Van' },
  { id: 'v3', placa: 'GHI-9012', modelo: 'HR' },
  { id: 'v4', placa: 'JKL-3456', modelo: 'Baú 3/4' },
  { id: 'v5', placa: 'MNO-7890', modelo: 'Truck' },
];

export interface AlocacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargas: Carga[];
  cargasIds?: string[]; // Make cargasIds optional to maintain compatibility
  onConfirm: (cargasIds: string[], motoristaId: string, motoristaName: string, veiculoId: string, veiculoName: string) => void;
}

const AlocacaoModal: React.FC<AlocacaoModalProps> = ({
  isOpen,
  onClose,
  cargas,
  cargasIds,
  onConfirm
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<AlocacaoFormData>({
    resolver: zodResolver(alocacaoSchema),
    defaultValues: {
      motoristaId: '',
      veiculoId: '',
    },
  });

  const handleSubmit = (data: AlocacaoFormData) => {
    setIsLoading(true);
    
    // Find the selected motorista and veículo
    const motorista = motoristasData.find(m => m.id === data.motoristaId);
    const veiculo = veiculosData.find(v => v.id === data.veiculoId);
    
    if (!motorista || !veiculo) {
      setIsLoading(false);
      return;
    }
    
    // Get carga IDs - use the provided cargasIds if available, otherwise extract from cargas
    const actualCargasIds = cargasIds || cargas.map(carga => carga.id);
    
    // Call the onConfirm callback
    onConfirm(
      actualCargasIds,
      motorista.id,
      motorista.nome,
      veiculo.id,
      `${veiculo.modelo} - ${veiculo.placa}`
    );
    
    // Reset form and close modal
    form.reset();
    setIsLoading(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Alocar Motorista e Veículo</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="motoristaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motorista</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um motorista" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {motoristasData.map((motorista) => (
                        <SelectItem key={motorista.id} value={motorista.id}>
                          {motorista.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="veiculoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Veículo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um veículo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {veiculosData.map((veiculo) => (
                        <SelectItem key={veiculo.id} value={veiculo.id}>
                          {veiculo.modelo} - {veiculo.placa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Alocando...' : 'Confirmar Alocação'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AlocacaoModal;
