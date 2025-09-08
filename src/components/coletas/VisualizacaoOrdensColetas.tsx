import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ListaOrdensCarregamento from '@/components/comum/OrdemCarregamento/ListaOrdensCarregamento';
import NovaOrdemIntegrada from '@/components/comum/OrdemCarregamento/NovaOrdemIntegrada';
import { useToast } from '@/hooks/use-toast';

interface OrdemCarregamento {
  id: string;
  numero_ordem: string;
  tipo_movimentacao: string;
  subtipo_operacao: string;
  status: string;
  data_criacao: string;
  data_operacao: string;
  prioridade: string;
  modulo: string;
  notasFiscais: any[];
  totalNotas: number;
  totalValor: number;
  totalPeso: number;
  totalVolumes: number;
  observacoes?: string;
  created_by?: string;
}

const VisualizacaoOrdensColetas = () => {
  const [activeTab, setActiveTab] = useState('lista');
  const [ordemParaEditar, setOrdemParaEditar] = useState<OrdemCarregamento | null>(null);
  const { toast } = useToast();

  const handleNovaOrdem = () => {
    setOrdemParaEditar(null);
    setActiveTab('nova');
  };

  const handleVisualizarOrdem = (ordem: OrdemCarregamento) => {
    toast({
      title: "Visualização de Ordem de Coleta",
      description: `Ordem ${ordem.numero_ordem} - ${ordem.subtipo_operacao}`,
    });
    console.log('Visualizando ordem de coleta:', ordem);
  };

  const handleEditarOrdem = (ordem: OrdemCarregamento) => {
    setOrdemParaEditar(ordem);
    setActiveTab('nova');
  };

  const handleSubmitOrdem = (data: any) => {
    console.log('Ordem de coleta criada/editada:', data);
    
    if (ordemParaEditar) {
      // Editando ordem existente
      const existingOrders = JSON.parse(localStorage.getItem('ordensColetas') || '[]');
      const updatedOrders = existingOrders.map((ordem: OrdemCarregamento) => 
        ordem.id === ordemParaEditar.id 
          ? {
              ...ordem,
              ...data,
              data_modificacao: new Date().toISOString(),
              modified_by: 'Sistema Coletas'
            }
          : ordem
      );
      localStorage.setItem('ordensColetas', JSON.stringify(updatedOrders));
      
      toast({
        title: "Ordem de Coleta Atualizada!",
        description: `Ordem ${ordemParaEditar.numero_ordem} foi atualizada com sucesso.`,
      });
    } else {
      // Criando nova ordem
      const ordemColeta = {
        ...data,
        id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pendente_processamento',
        modulo: 'coletas',
        data_criacao: new Date().toISOString(),
        numero_ordem: `COL-${Date.now()}`,
        created_by: 'Sistema Coletas'
      };
      
      const existingOrders = JSON.parse(localStorage.getItem('ordensColetas') || '[]');
      const updatedOrders = [...existingOrders, ordemColeta];
      localStorage.setItem('ordensColetas', JSON.stringify(updatedOrders));
      
      toast({
        title: "Ordem de Coleta Criada!",
        description: `Ordem ${ordemColeta.numero_ordem} criada com ${data.totalNotas || 0} nota(s) fiscal(is).`,
      });
    }

    // Voltar para a lista
    setActiveTab('lista');
    setOrdemParaEditar(null);
  };

  const handleCancelar = () => {
    setActiveTab('lista');
    setOrdemParaEditar(null);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lista">Lista de Coletas</TabsTrigger>
          <TabsTrigger value="nova">
            {ordemParaEditar ? 'Editar Coleta' : 'Nova Coleta'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <ListaOrdensCarregamento
            titulo="Ordens de Coleta"
            modulo="coletas"
            onNovaOrdem={handleNovaOrdem}
            onVisualizarOrdem={handleVisualizarOrdem}
            onEditarOrdem={handleEditarOrdem}
            showActions={true}
            showFilter={true}
          />
        </TabsContent>

        <TabsContent value="nova" className="space-y-4">
          <NovaOrdemIntegrada
            title={ordemParaEditar ? "Editar Ordem de Coleta" : "Nova Ordem de Coleta"}
            onSubmit={handleSubmitOrdem}
            onCancel={handleCancelar}
            mode={ordemParaEditar ? "edit" : "create"}
            showBackButton={false}
            initialData={ordemParaEditar ? {
              tipo_movimentacao: ordemParaEditar.tipo_movimentacao,
              subtipo_operacao: ordemParaEditar.subtipo_operacao,
              prioridade: ordemParaEditar.prioridade,
              data_operacao: ordemParaEditar.data_operacao,
              observacoes: ordemParaEditar.observacoes,
              notasFiscais: ordemParaEditar.notasFiscais
            } : {
              tipo_movimentacao: "Entrada",
              subtipo_operacao: "Coleta"
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VisualizacaoOrdensColetas;