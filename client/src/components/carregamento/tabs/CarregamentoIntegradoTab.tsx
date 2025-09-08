import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { useOrdemCarregamento } from '@/hooks/carregamento';
import { useNotasRecebimento } from '@/hooks/carregamento';
import { Table } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { NotaFiscal } from '@/hooks/carregamento/types';

const tiposCarregamento = [
  { value: 'entrega', label: 'Entrega' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'devolucao', label: 'Devolução' }
];

const CarregamentoIntegradoTab: React.FC = () => {
  const [step, setStep] = useState<'form' | 'notas'>('form');
  const [ocCriada, setOcCriada] = useState<any>(null);
  const [selectedNotas, setSelectedNotas] = useState<string[]>([]);
  
  // Get the necessary functions and state from our hooks
  const { createOrdemCarregamento } = useOrdemCarregamento();
  const { isLoading: loadingNotas, notasRecebimento, fetchNotasRecebimento } = useNotasRecebimento();

  // Setup form
  const form = useForm({
    defaultValues: {
      cliente: '',
      tipoCarregamento: 'entrega',
      dataCarregamento: new Date().toISOString().substring(0, 10),
      transportadora: '',
      placaVeiculo: '',
      motorista: '',
      observacoes: ''
    }
  });

  // Fetch notes from receipt system when step changes to 'notas'
  useEffect(() => {
    if (step === 'notas') {
      fetchNotasRecebimento();
    }
  }, [step, fetchNotasRecebimento]);

  // Handle form submission to create a new order
  const onSubmit = async (data: any) => {
    try {
      const novaPO = await createOrdemCarregamento(data);
      if (novaPO) {
        toast({
          title: "Ordem de Carregamento criada",
          description: `OC ${novaPO.id} criada com sucesso.`
        });
        setOcCriada(novaPO);
        setStep('notas'); // Move to next step for selecting notes
      }
    } catch (error) {
      console.error("Erro ao criar OC:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a ordem de carregamento.",
        variant: "destructive"
      });
    }
  };

  // Toggle nota selection
  const toggleNotaSelection = (notaId: string) => {
    setSelectedNotas(prev => {
      if (prev.includes(notaId)) {
        return prev.filter(id => id !== notaId);
      } else {
        return [...prev, notaId];
      }
    });
  };

  // Import selected notes to the order
  const handleImportarNotas = async () => {
    if (!ocCriada || selectedNotas.length === 0) {
      toast({
        title: "Seleção necessária",
        description: "Selecione pelo menos uma nota fiscal para importar.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Find the selected notas objects
      const notasSelecionadas = notasRecebimento.filter(nota => 
        selectedNotas.includes(nota.id)
      );
      
      toast({
        title: "Notas importadas com sucesso",
        description: `${selectedNotas.length} notas foram importadas para a OC ${ocCriada.id}.`
      });
      
      // Reset and return to first step to create a new order
      form.reset();
      setOcCriada(null);
      setSelectedNotas([]);
      setStep('form');
    } catch (error) {
      console.error("Erro ao importar notas:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao importar as notas.",
        variant: "destructive"
      });
    }
  };

  // Function to reset the process
  const handleCancelar = () => {
    form.reset();
    setOcCriada(null);
    setSelectedNotas([]);
    setStep('form');
  };

  return (
    <>
      {step === 'form' ? (
        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Ordem de Carregamento Integrada</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="cliente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do Cliente" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tipoCarregamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Carregamento</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tiposCarregamento.map(tipo => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                
                  <FormField
                    control={form.control}
                    name="dataCarregamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Carregamento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="transportadora"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transportadora</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da Transportadora" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="placaVeiculo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placa do Veículo</FormLabel>
                        <FormControl>
                          <Input placeholder="AAA-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="motorista"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motorista</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do Motorista" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Informações adicionais sobre o carregamento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={handleCancelar}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Continuar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Selecionar Notas Fiscais para OC {ocCriada?.id}</span>
              <Button variant="outline" onClick={() => setStep('form')}>
                Voltar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-4 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Dados da Ordem de Carregamento</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Cliente: <span className="font-medium">{ocCriada?.cliente}</span></div>
                <div>Tipo: <span className="font-medium">{
                  tiposCarregamento.find(t => t.value === ocCriada?.tipoCarregamento)?.label || ocCriada?.tipoCarregamento
                }</span></div>
                <div>Data: <span className="font-medium">{ocCriada?.dataCarregamento}</span></div>
                <div>Transportadora: <span className="font-medium">{ocCriada?.transportadora}</span></div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-2">Notas Fiscais Disponíveis para Importação</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Estas são as notas fiscais registradas no sistema de recebimento. Selecione as que deseja incluir nesta ordem de carregamento.
              </p>
              
              {loadingNotas ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : notasRecebimento.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <thead className="bg-muted">
                      <tr>
                        <th className="w-[50px]"></th>
                        <th className="text-left p-2">Número NF</th>
                        <th className="text-left p-2">Remetente</th>
                        <th className="text-left p-2">Destinatário</th>
                        <th className="text-left p-2">Pedido</th>
                        <th className="text-right p-2">Valor</th>
                        <th className="text-right p-2">Peso (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notasRecebimento.map((nota) => (
                        <tr key={nota.id} className="border-t hover:bg-muted/50">
                          <td className="p-2 text-center">
                            <Checkbox 
                              checked={selectedNotas.includes(nota.id)} 
                              onCheckedChange={() => toggleNotaSelection(nota.id)}
                            />
                          </td>
                          <td className="p-2">{nota.numero}</td>
                          <td className="p-2">{nota.remetente}</td>
                          <td className="p-2">{nota.cliente}</td>
                          <td className="p-2">{nota.pedido || '-'}</td>
                          <td className="p-2 text-right">
                            {typeof nota.valor === 'number' 
                              ? `R$ ${nota.valor.toFixed(2)}` 
                              : nota.valor}
                          </td>
                          <td className="p-2 text-right">
                            {typeof nota.pesoBruto === 'number' 
                              ? `${nota.pesoBruto.toFixed(2)}` 
                              : nota.pesoBruto}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma nota fiscal disponível para importação.
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button type="button" variant="outline" onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleImportarNotas}
                disabled={selectedNotas.length === 0}
              >
                Importar {selectedNotas.length} Nota(s)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default CarregamentoIntegradoTab;
