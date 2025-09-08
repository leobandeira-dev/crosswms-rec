
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useOrdemCarregamento } from '@/hooks/carregamento';
import ImportarNotasDialog from '../ImportarNotasDialog';

const CriarOCTab: React.FC = () => {
  const [formData, setFormData] = useState({
    cliente: '',
    tipoCarregamento: '',
    dataCarregamento: '',
    transportadora: '',
    placaVeiculo: '',
    motorista: '',
    observacoes: ''
  });
  
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [ordemCriada, setOrdemCriada] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    createOrdemCarregamento, 
    notasFiscaisDisponiveis, 
    fetchNotasFiscaisDisponiveis,
    importarNotasFiscais 
  } = useOrdemCarregamento();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente || !formData.tipoCarregamento || !formData.dataCarregamento) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const novaOrdem = await createOrdemCarregamento(formData);
      if (novaOrdem) {
        setOrdemCriada(novaOrdem.id);
        toast({
          title: "Ordem criada com sucesso",
          description: `OC ${novaOrdem.id} foi criada. Agora você pode importar notas fiscais.`,
        });
      }
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      toast({
        title: "Erro ao criar ordem",
        description: "Ocorreu um erro ao criar a Ordem de Carregamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportarNotas = async () => {
    if (!ordemCriada) return;
    
    await fetchNotasFiscaisDisponiveis();
    setShowImportDialog(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Plus className="mr-2 text-cross-blue" size={20} />
            Nova Ordem de Carregamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <Input
                  id="cliente"
                  placeholder="Nome do cliente"
                  value={formData.cliente}
                  onChange={(e) => handleInputChange('cliente', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoCarregamento">Tipo de Carregamento *</Label>
                <Select value={formData.tipoCarregamento} onValueChange={(value) => handleInputChange('tipoCarregamento', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="express">Express</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataCarregamento">Data de Carregamento *</Label>
                <Input
                  id="dataCarregamento"
                  type="datetime-local"
                  value={formData.dataCarregamento}
                  onChange={(e) => handleInputChange('dataCarregamento', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transportadora">Transportadora</Label>
                <Input
                  id="transportadora"
                  placeholder="Nome da transportadora"
                  value={formData.transportadora}
                  onChange={(e) => handleInputChange('transportadora', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="placaVeiculo">Placa do Veículo</Label>
                <Input
                  id="placaVeiculo"
                  placeholder="ABC-1234"
                  value={formData.placaVeiculo}
                  onChange={(e) => handleInputChange('placaVeiculo', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motorista">Motorista</Label>
                <Input
                  id="motorista"
                  placeholder="Nome do motorista"
                  value={formData.motorista}
                  onChange={(e) => handleInputChange('motorista', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações adicionais..."
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-cross-blue hover:bg-cross-blue/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? 'Criando...' : 'Criar Ordem'}
              </Button>

              {ordemCriada && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImportarNotas}
                  className="border-cross-blue text-cross-blue hover:bg-cross-blue/10"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Importar Notas Fiscais
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <ImportarNotasDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={(notasIds: string[]) => {
          if (ordemCriada) {
            importarNotasFiscais(ordemCriada, notasIds);
          }
        }}
        notasFiscaisDisponiveis={notasFiscaisDisponiveis}
        isLoading={false}
      />
    </div>
  );
};

export default CriarOCTab;
