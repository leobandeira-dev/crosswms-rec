import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MainLayout from '@/components/layout/MainLayout';
import ConfirmationDialog from '@/components/carregamento/enderecamento/ConfirmationDialog';
import AuditTrail from '@/components/common/AuditTrail';

// Import schema and types
import { cancelUnitizacaoSchema, defaultValues, CancelUnitizacaoSchemaType } from './schemas/cancelUnitizacaoSchema';

// Import services
import unitizacaoService from '@/services/unitizacaoService';
import etiquetaService from '@/services/etiquetaService';
import localizacaoService from '@/services/localizacaoService';
import { useAuth } from '@/hooks/useAuth';

const CancelarUnitizacao: React.FC = () => {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [selected, setSelected] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [localizacaoOptions, setLocalizacaoOptions] = useState<any[]>([]);
  
  const form = useForm<CancelUnitizacaoSchemaType>({
    resolver: zodResolver(cancelUnitizacaoSchema),
    defaultValues,
  });
  
  // Load unitizacao data on component mount
  useEffect(() => {
    const loadUnitizacao = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const unitizacao = await unitizacaoService.buscarUnitizacaoPorId(id);
          setSelected(unitizacao);
          
          // Set default values for the form
          form.setValue('codigo', unitizacao.codigo);
          form.setValue('tipo_unitizacao', unitizacao.tipo_unitizacao);
          form.setValue('localizacao_id', unitizacao.localizacao_id);
          form.setValue('observacoes', unitizacao.observacoes);
        } catch (error: any) {
          toast({
            title: "Erro ao carregar unitização",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadUnitizacao();
  }, [id, form]);
  
  // Load localizacao options on component mount
  useEffect(() => {
    const loadLocalizacaoOptions = async () => {
      try {
        const localizacoes = await localizacaoService.listarLocalizacoes({ ocupado: false });
        setLocalizacaoOptions(localizacoes);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar localizações",
          description: error.message,
          variant: "destructive",
        });
      }
    };
    
    loadLocalizacaoOptions();
  }, []);
  
  // Handler to cancel unitizacao
  const handleCancelUnitizacao = async (data: CancelUnitizacaoSchemaType) => {
    setIsLoading(true);
    try {
      // Update unitizacao status to 'cancelada'
      await unitizacaoService.cancelarUnitizacao(id as string);
      
      // Update etiquetas status to 'gerada' individually
      if (selected && selected.etiquetas_unitizacao) {
        const etiquetas = selected.etiquetas_unitizacao.map((etiqueta: any) => etiqueta.etiqueta_id);
        // Update each etiqueta individually
        for (const etiquetaId of etiquetas) {
          await etiquetaService.atualizarEtiqueta(etiquetaId, { status: 'gerada' });
        }
      }
      
      toast({
        title: "Unitização cancelada",
        description: "A unitização foi cancelada com sucesso.",
      });
      
      // Redirect to list page
      setLocation('/armazenagem/movimentacoes');
    } catch (error: any) {
      toast({
        title: "Erro ao cancelar unitização",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler to open cancel confirmation dialog
  const onOpenCancelDialog = () => {
    setIsCancelDialogOpen(true);
  };
  
  // Handler to close cancel confirmation dialog
  const onCloseCancelDialog = () => {
    setIsCancelDialogOpen(false);
  };
  
  return (
    <MainLayout title="Cancelar Unitização">
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Cancelar Unitização</CardTitle>
              <Button variant="outline" onClick={() => setLocation('/armazenagem/movimentacoes')}>
                Voltar
              </Button>
            </div>
            <CardDescription>
              Preencha o formulário abaixo para cancelar a unitização.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </div>
            ) : selected ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCancelUnitizacao)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="codigo">Código da Unitização</Label>
                      <Input id="codigo" defaultValue={selected.codigo} disabled />
                    </div>
                    <div>
                      <Label htmlFor="tipo_unitizacao">Tipo de Unitização</Label>
                      <Input id="tipo_unitizacao" defaultValue={selected.tipo_unitizacao} disabled />
                    </div>
                    <div>
                      <Label htmlFor="localizacao_id">Localização</Label>
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a localização" />
                        </SelectTrigger>
                        <SelectContent>
                          {localizacaoOptions.map((localizacao) => (
                            <SelectItem key={localizacao.id} value={localizacao.id}>
                              {localizacao.codigo} - {localizacao.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea id="observacoes" placeholder="Observações" {...form.register('observacoes')} />
                  </div>
                  <Separator />
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setLocation('/armazenagem/movimentacoes')}>
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      className="bg-red-500 hover:bg-red-700 text-white"
                      onClick={onOpenCancelDialog}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelando...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancelar Unitização
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <div className="text-center">Nenhuma unitização selecionada.</div>
            )}
          </CardContent>
        </Card>
        
        {/* Audit trail component */}
        <AuditTrail 
          moduleId="unitizacao" 
          entityId={selected?.id}
        />
      </div>
      
      {/* Cancel confirmation dialog */}
      <ConfirmationDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title="Cancelar Unitização"
        description="Tem certeza de que deseja cancelar esta unitização? Essa ação não pode ser desfeita."
        onConfirm={form.handleSubmit(handleCancelUnitizacao)}
      />
    </MainLayout>
  );
};

export default CancelarUnitizacao;
