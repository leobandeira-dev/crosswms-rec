
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Biohazard, Package, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';

interface Volume {
  id: string;
  notaFiscal: string;
  descricao: string;
  quantidade: number;
  etiquetado: boolean;
  tipoVolume?: 'geral' | 'quimico';
  codigoONU?: string;
  codigoRisco?: string;
  classificacaoQuimica?: 'nao_perigosa' | 'perigosa' | 'nao_classificada';
  area?: string;
  [key: string]: any;
}

interface ClassifyVolumeDialogProps {
  volume: Volume | null;
  open: boolean;
  onClose: () => void;
  onSave: (volume: Volume, formData: any) => void;
}

const ClassifyVolumeDialog: React.FC<ClassifyVolumeDialogProps> = ({
  volume,
  open,
  onClose,
  onSave
}) => {
  const form = useForm({
    defaultValues: {
      tipoVolume: volume?.tipoVolume || 'geral',
      codigoONU: volume?.codigoONU || '',
      codigoRisco: volume?.codigoRisco || '',
      classificacaoQuimica: volume?.classificacaoQuimica || 'nao_classificada',
      area: volume?.area || '01'
    }
  });

  React.useEffect(() => {
    if (volume) {
      // Reset form with current volume data whenever volume changes
      form.reset({
        tipoVolume: volume.tipoVolume || 'geral',
        codigoONU: volume.codigoONU || '',
        codigoRisco: volume.codigoRisco || '',
        classificacaoQuimica: volume.classificacaoQuimica || 'nao_classificada',
        area: volume.area || '01'
      });
    }
  }, [volume, form]);

  const watchTipoVolume = form.watch('tipoVolume');
  const isQuimico = watchTipoVolume === 'quimico';

  const areas = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'IMP', 'REC', 'SLZ', 'FOR', 'GYN'];

  const handleSubmit = (data: any) => {
    if (isQuimico && (!data.codigoONU || !data.codigoRisco)) {
      toast({
        title: "Campos obrigatórios",
        description: "Código ONU e Código de Risco são obrigatórios para produtos químicos.",
        variant: "destructive"
      });
      return;
    }

    if (volume) {
      onSave(volume, data);
      onClose();
    }
  };

  if (!volume) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg">Classificar Volume</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-md font-medium mb-2">Informações do Volume</h3>
              <p><strong>ID:</strong> {volume.id}</p>
              <p><strong>Nota Fiscal:</strong> {volume.notaFiscal}</p>
              <p><strong>Descrição:</strong> {volume.descricao}</p>
            </div>

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Área de Destino</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas.map((area) => (
                        <SelectItem key={area} value={area}>
                          <div className="flex items-center">
                            <MapPin size={16} className="text-blue-500 mr-2" />
                            <span className="font-medium">Área {area}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tipoVolume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Volume</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de volume" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="geral">
                        <div className="flex items-center">
                          <Package size={16} className="text-blue-500 mr-2" />
                          <span>Carga Geral</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="quimico">
                        <div className="flex items-center">
                          <Biohazard size={16} className="text-red-500 mr-2" />
                          <span>Produto Químico</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {isQuimico && (
              <div className="grid grid-cols-2 gap-4 p-3 border border-red-200 rounded-md bg-red-50">
                <FormField
                  control={form.control}
                  name="codigoONU"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código ONU</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 1203" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="codigoRisco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Risco</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 33" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="classificacaoQuimica"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Classificação</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a classificação" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="nao_perigosa">Cargas Não Perigosas</SelectItem>
                          <SelectItem value="perigosa">Cargas Perigosas</SelectItem>
                          <SelectItem value="nao_classificada">Cargas Não Classificadas</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            )}
          
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit">Salvar Classificação</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ClassifyVolumeDialog;
