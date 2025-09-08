
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Carga } from '../types/coleta.types';
import { toast } from '@/hooks/use-toast';
import { Truck, Archive, PackageCheck } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Schema para validação do formulário
const preAlocacaoSchema = z.object({
  tipoVeiculoId: z.string({ required_error: 'Selecione um tipo de veículo' }),
  gerarPreRomaneio: z.boolean().default(false),
});

type PreAlocacaoFormData = z.infer<typeof preAlocacaoSchema>;

// Dados mockados de tipos de veículos
const tiposVeiculosData = [
  { id: 'tv1', nome: 'Fiorino', capacidade: '650kg' },
  { id: 'tv2', nome: 'Van', capacidade: '1.5t' },
  { id: 'tv3', nome: 'HR', capacidade: '3.5t' },
  { id: 'tv4', nome: 'Baú 3/4', capacidade: '4t' },
  { id: 'tv5', nome: 'Truck', capacidade: '9t' },
  { id: 'tv6', nome: 'Carreta', capacidade: '27t' },
];

export interface PreAlocacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargas: Carga[];
  onPreAlocar: (cargasIds: string[], tipoVeiculoId: string, tipoVeiculoNome: string) => void;
  onGerarPreRomaneio?: (cargasIds: string[], tipoVeiculoId: string, tipoVeiculoNome: string) => void;
}

const PreAlocacaoModal: React.FC<PreAlocacaoModalProps> = ({
  isOpen,
  onClose,
  cargas,
  onPreAlocar,
  onGerarPreRomaneio
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreRomaneioConfirm, setShowPreRomaneioConfirm] = useState(false);
  const [formData, setFormData] = useState<PreAlocacaoFormData | null>(null);
  
  const form = useForm<PreAlocacaoFormData>({
    resolver: zodResolver(preAlocacaoSchema),
    defaultValues: {
      tipoVeiculoId: '',
      gerarPreRomaneio: false,
    },
  });

  const handleSubmit = (data: PreAlocacaoFormData) => {
    setFormData(data);
    setShowPreRomaneioConfirm(true);
  };
  
  const confirmarPreAlocacao = (gerarPreRomaneio: boolean = false) => {
    if (!formData) return;
    
    setIsLoading(true);
    
    // Encontrar o tipo de veículo selecionado
    const tipoVeiculo = tiposVeiculosData.find(tv => tv.id === formData.tipoVeiculoId);
    
    if (!tipoVeiculo) {
      setIsLoading(false);
      return;
    }
    
    const cargasIds = cargas.map(carga => carga.id);
    const tipoVeiculoNome = `${tipoVeiculo.nome} (${tipoVeiculo.capacidade})`;
    
    // Verificar se deve gerar pré-romaneio ou apenas pré-alocar
    if (gerarPreRomaneio && onGerarPreRomaneio) {
      onGerarPreRomaneio(cargasIds, tipoVeiculo.id, tipoVeiculoNome);
      toast({
        title: "Pré-romaneio gerado",
        description: `${cargas.length} carga(s) agrupada(s) em um pré-romaneio.`,
      });
    } else {
      onPreAlocar(cargasIds, tipoVeiculo.id, tipoVeiculoNome);
    }
    
    // Reset do formulário e fechamento do modal
    form.reset();
    setIsLoading(false);
    setShowPreRomaneioConfirm(false);
    onClose();
  };
  
  const cancelarConfirmacao = () => {
    setShowPreRomaneioConfirm(false);
  };
  
  // Calcular totais para exibir no modal
  const totalVolumes = cargas.reduce((acc, carga) => acc + carga.volumes, 0);
  const totalPeso = cargas.reduce((acc, carga) => {
    const peso = parseFloat(carga.peso.replace('kg', '').trim());
    return acc + (isNaN(peso) ? 0 : peso);
  }, 0);
  const totalM3 = cargas.reduce((acc, carga) => acc + (carga.volumeM3 || 0), 0);
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Truck className="mr-2 h-5 w-5" />
              Pré-Alocação de Veículo
            </DialogTitle>
            <DialogDescription>
              Defina o tipo de veículo necessário para esta carga antes de alocar um motorista específico.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  {cargas.length} carga{cargas.length !== 1 ? 's' : ''} selecionada{cargas.length !== 1 ? 's' : ''}
                </p>
                <ul className="text-sm">
                  {cargas.slice(0, 3).map((carga) => (
                    <li key={carga.id} className="mb-1">• {carga.id}: {carga.destino} ({carga.peso})</li>
                  ))}
                  {cargas.length > 3 && (
                    <li className="text-muted-foreground">• E mais {cargas.length - 3} carga(s)...</li>
                  )}
                </ul>
                
                {cargas.length > 1 && (
                  <div className="mt-3 p-2 bg-muted rounded-md text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Total volumes:</span>
                      <span className="font-medium">{totalVolumes}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Peso total:</span>
                      <span className="font-medium">{totalPeso.toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume total:</span>
                      <span className="font-medium">{totalM3.toFixed(2)} m³</span>
                    </div>
                  </div>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="tipoVeiculoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Veículo</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo de veículo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposVeiculosData.map((tipoVeiculo) => (
                          <SelectItem key={tipoVeiculo.id} value={tipoVeiculo.id}>
                            {tipoVeiculo.nome} ({tipoVeiculo.capacidade})
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
                  {isLoading ? 'Processando...' : 'Continuar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo de confirmação para criação do pré-romaneio */}
      <AlertDialog open={showPreRomaneioConfirm} onOpenChange={setShowPreRomaneioConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" /> Criar Pré-Romaneio?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você deseja apenas pré-alocar o veículo ou também gerar um pré-romaneio agrupando estas {cargas.length} cargas?
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <PackageCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Cargas selecionadas: {cargas.length}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Ao gerar um pré-romaneio, as cargas serão agrupadas para facilitar a logística de transporte.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelarConfirmacao}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmarPreAlocacao(false)} 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Apenas Pré-Alocar
            </AlertDialogAction>
            <AlertDialogAction onClick={() => confirmarPreAlocacao(true)}>
              Gerar Pré-Romaneio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PreAlocacaoModal;
