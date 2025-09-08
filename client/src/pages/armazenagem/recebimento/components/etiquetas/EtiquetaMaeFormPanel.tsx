
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { Package, Truck } from 'lucide-react';

interface EtiquetaMaeFormPanelProps {
  form: UseFormReturn<any>;
  handleCreateEtiquetaMae: () => void;
  isUnitizacaoMode?: boolean;
}

const EtiquetaMaeFormPanel: React.FC<EtiquetaMaeFormPanelProps> = ({
  form,
  handleCreateEtiquetaMae,
  isUnitizacaoMode = false
}) => {
  // Get values and register methods from the form
  const { register, watch, setValue } = form;
  
  // In unitização mode, force the type to be palete
  React.useEffect(() => {
    if (isUnitizacaoMode) {
      setValue('tipoEtiquetaMae', 'palete');
    }
  }, [isUnitizacaoMode, setValue]);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">
          {isUnitizacaoMode ? 'Gerar Etiqueta Mãe para Unitização' : 'Gerar Etiqueta Mãe'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="descricaoEtiquetaMae">Descrição</Label>
            <Input
              id="descricaoEtiquetaMae"
              {...register('descricaoEtiquetaMae')}
              placeholder="Descrição da etiqueta mãe"
              defaultValue={isUnitizacaoMode ? 'Novo Palete' : ''}
            />
          </div>
          
          <div>
            <Label htmlFor="tipoEtiquetaMae">Tipo de Etiqueta</Label>
            <Select 
              defaultValue={isUnitizacaoMode ? 'palete' : 'geral'}
              onValueChange={(value) => form.setValue('tipoEtiquetaMae', value)}
              value={watch('tipoEtiquetaMae', isUnitizacaoMode ? 'palete' : 'geral')}
              disabled={isUnitizacaoMode}
            >
              <SelectTrigger id="tipoEtiquetaMae">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral (Volumes)</SelectItem>
                <SelectItem value="palete">Palete (Unitização)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="formatoImpressao">Formato de Impressão</Label>
            <Select 
              defaultValue="50x100"
              onValueChange={(value) => form.setValue('formatoImpressao', value)}
              value={watch('formatoImpressao')}
            >
              <SelectTrigger id="formatoImpressao">
                <SelectValue placeholder="Selecione um formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50x100">Etiqueta 50x100mm</SelectItem>
                <SelectItem value="a4">Folha A4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Layout style selection */}
          <div>
            <Label htmlFor="layoutStyle">Layout da Etiqueta</Label>
            <Select 
              defaultValue="standard"
              onValueChange={(value) => form.setValue('layoutStyle', value)}
              value={watch('layoutStyle', 'standard')}
            >
              <SelectTrigger id="layoutStyle">
                <SelectValue placeholder="Selecione um layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Padrão (Sedex)</SelectItem>
                <SelectItem value="compact">Compacto (Braspress)</SelectItem>
                <SelectItem value="modern">Moderno (Jadlog/UPS)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button
          type="button"
          className={`w-full ${isUnitizacaoMode ? 'bg-cross-blue hover:bg-cross-blue/90' : ''}`}
          onClick={handleCreateEtiquetaMae}
        >
          {watch('tipoEtiquetaMae') === 'palete' ? (
            <Truck className="mr-2 h-4 w-4" />
          ) : (
            <Package className="mr-2 h-4 w-4" />
          )}
          {isUnitizacaoMode ? 'Gerar e Voltar para Unitização' : 'Gerar Etiqueta Mãe'}
        </Button>
        
        {isUnitizacaoMode && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Após gerar, você retornará automaticamente para a tela de unitização
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default EtiquetaMaeFormPanel;
