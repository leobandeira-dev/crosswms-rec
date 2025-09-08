import { useState } from 'react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ListaOrdensCarregamento from '@/components/comum/OrdemCarregamento/ListaOrdensCarregamento';
import NovaOrdemIntegrada from '@/components/comum/OrdemCarregamento/NovaOrdemIntegrada';
import { useToast } from '@/hooks/use-toast';

interface OrdemCarregamento {
  id: string;
  numero_ordem: string;
  tipo_movimentacao?: string;
  subtipo_operacao?: string;
  status: string;
  data_criacao?: string;
  data_programada?: string;
  created_at: string;
  prioridade?: string;
  modulo?: string;
  notasFiscais?: any[];
  volumes?: any[];
  totalNotas: number;
  totalValor: number;
  totalPeso: number;
  totalVolumes: number;
  observacoes?: string;
  created_by?: string;
}

const VisualizacaoOrdensRecebimento = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('lista');
  const [ordemParaEditar, setOrdemParaEditar] = useState<OrdemCarregamento | null>(null);
  const { toast } = useToast();

  const handleNovaOrdem = () => {
    setOrdemParaEditar(null);
    setActiveTab('nova');
  };

  const handleVisualizarOrdem = (ordem: OrdemCarregamento) => {
    // Por enquanto, vamos para a visualização detalhada (pode ser expandido futuramente)
    toast({
      title: "Visualização de Ordem",
      description: `Ordem ${ordem.numero_ordem} - ${ordem.subtipo_operacao}`,
    });
    
    // Aqui pode ser implementada uma modal ou página específica para visualização
    console.log('Visualizando ordem:', ordem);
  };

  const handleEditarOrdem = async (ordem: OrdemCarregamento) => {
    try {
      // Buscar dados completos da ordem via API
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ordens-carga/${ordem.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar ordem: ${response.status}`);
      }

      const ordemCompleta = await response.json();
      
      // Definir ordem para edição com dados completos
      console.log('VisualizacaoOrdensRecebimento: Ordem completa da API:', ordemCompleta);
      console.log('VisualizacaoOrdensRecebimento: Notas fiscais encontradas:', ordemCompleta.notasFiscais);
      console.log('VisualizacaoOrdensRecebimento: Volumes encontrados:', ordemCompleta.volumes);
      console.log('VisualizacaoOrdensRecebimento: remetente_razao_social da API:', ordemCompleta.remetente_razao_social);
      console.log('VisualizacaoOrdensRecebimento: destinatario_razao_social da API:', ordemCompleta.destinatario_razao_social);
      console.log('VisualizacaoOrdensRecebimento: TODOS os campos da API:', Object.keys(ordemCompleta));
      
      // Usar TODOS os dados da API, não sobrescrever com dados da ordem original
      const ordemCompleta_temp = {
        ...ordemCompleta,  // ← DADOS COMPLETOS DA API PRIMEIRO
        ...ordem,          // ← Dados básicos da lista (se necessário)
        // Mas garantir que os dados importantes da API não sejam sobrescritos
        ...ordemCompleta,  // ← PRIORIZAR DADOS DA API NOVAMENTE
        notasFiscais: ordemCompleta.notasFiscais || [],
        volumes: ordemCompleta.volumes || []
      };
      console.log('VisualizacaoOrdensRecebimento: ordemCompleta_temp final:', ordemCompleta_temp);
      console.log('VisualizacaoOrdensRecebimento: remetente_razao_social final:', ordemCompleta_temp.remetente_razao_social);
      setOrdemParaEditar(ordemCompleta_temp as any);
      setActiveTab('nova');
      
      toast({
        title: "Ordem carregada para edição",
        description: `Ordem ${ordem.numero_ordem} com ${ordemCompleta.notasFiscais?.length || 0} nota(s) fiscal(is).`,
      });
    } catch (error) {
      console.error('Erro ao carregar ordem para edição:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados da ordem para edição.",
        variant: "destructive"
      });
    }
  };

  const handleSubmitOrdem = async (data: any) => {
    console.log('Ordem de recebimento criada/editada:', data);
    
    // Como o NovaOrdemIntegrada já lida com salvamento, aqui só fazemos ações pós-salvamento
    if (data) {
      // Voltar para a lista após o salvamento
      setActiveTab('lista');
      setOrdemParaEditar(null);
      
      console.log('VisualizacaoOrdensRecebimento: Ordem processada com sucesso, retornando para lista');
    }
  };

  const handleCancelar = () => {
    setActiveTab('lista');
    setOrdemParaEditar(null);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lista">Lista de Ordens</TabsTrigger>
          <TabsTrigger value="nova">
            {ordemParaEditar ? 'Editar Ordem' : 'Nova Ordem'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4">
          <ListaOrdensCarregamento
            titulo="Ordens de Recebimento"
            modulo="armazenagem_recebimento"
            onNovaOrdem={handleNovaOrdem}
            onVisualizarOrdem={handleVisualizarOrdem as any}
            onEditarOrdem={handleEditarOrdem as any}
            showActions={true}
            showFilter={true}
          />
        </TabsContent>

        <TabsContent value="nova" className="space-y-4">
          <NovaOrdemIntegrada
            title={ordemParaEditar ? "Editar Ordem de Carga" : "Nova Ordem de Carga"}
            onSubmit={handleSubmitOrdem}
            onCancel={handleCancelar}
            mode={ordemParaEditar ? "edit" : "create"}
            showBackButton={false}
            initialData={(() => {
              if (ordemParaEditar) {
                console.log('VisualizacaoOrdensRecebimento: ordemParaEditar completo:', ordemParaEditar);
                console.log('VisualizacaoOrdensRecebimento: remetente_razao_social:', (ordemParaEditar as any).remetente_razao_social);
                console.log('VisualizacaoOrdensRecebimento: destinatario_razao_social:', (ordemParaEditar as any).destinatario_razao_social);
                
                return {
                  id: ordemParaEditar.id,
                  numero_ordem: (ordemParaEditar as any).numero_ordem,
                  tipo_movimentacao: ordemParaEditar.tipo_movimentacao,
                  subtipo_operacao: ordemParaEditar.subtipo_operacao,
                  prioridade: ordemParaEditar.prioridade,
                  data_programada: ordemParaEditar.data_programada || ordemParaEditar.created_at,
                  observacoes: ordemParaEditar.observacoes,
                  notasFiscais: ordemParaEditar.notasFiscais,
                  volumes: ordemParaEditar.volumes,
                  // Dados das datas do pipeline logístico
                  data_prevista_coleta: (ordemParaEditar as any).data_prevista_coleta,
                  data_coleta: (ordemParaEditar as any).data_coleta,
                  data_prevista_entrada_armazem: (ordemParaEditar as any).data_prevista_entrada_armazem,
                  data_entrada_armazem: (ordemParaEditar as any).data_entrada_armazem,
                  data_carregamento: (ordemParaEditar as any).data_carregamento,
                  data_prevista_entrega: (ordemParaEditar as any).data_prevista_entrega,
                  data_chegada_filial_entrega: (ordemParaEditar as any).data_chegada_filial_entrega,
                  data_saida_entrega: (ordemParaEditar as any).data_saida_entrega,
                  data_chegada_na_entrega: (ordemParaEditar as any).data_chegada_na_entrega,
                  data_entrega: (ordemParaEditar as any).data_entrega,
                  // Dados do Remetente
                  remetente_razao_social: (ordemParaEditar as any).remetente_razao_social,
                  remetente_cnpj: (ordemParaEditar as any).remetente_cnpj,
                  remetente_telefone: (ordemParaEditar as any).remetente_telefone,
                  remetente_endereco: (ordemParaEditar as any).remetente_endereco,
                  remetente_numero: (ordemParaEditar as any).remetente_numero,
                  remetente_complemento: (ordemParaEditar as any).remetente_complemento,
                  remetente_bairro: (ordemParaEditar as any).remetente_bairro,
                  remetente_cidade: (ordemParaEditar as any).remetente_cidade,
                  remetente_uf: (ordemParaEditar as any).remetente_uf,
                  remetente_cep: (ordemParaEditar as any).remetente_cep,
                  // Dados do Destinatário
                  destinatario_razao_social: (ordemParaEditar as any).destinatario_razao_social,
                  destinatario_cnpj: (ordemParaEditar as any).destinatario_cnpj,
                  destinatario_telefone: (ordemParaEditar as any).destinatario_telefone,
                  destinatario_endereco: (ordemParaEditar as any).destinatario_endereco,
                  destinatario_numero: (ordemParaEditar as any).destinatario_numero,
                  destinatario_complemento: (ordemParaEditar as any).destinatario_complemento,
                  destinatario_bairro: (ordemParaEditar as any).destinatario_bairro,
                  destinatario_cidade: (ordemParaEditar as any).destinatario_cidade,
                  destinatario_uf: (ordemParaEditar as any).destinatario_uf,
                  destinatario_cep: (ordemParaEditar as any).destinatario_cep
                };
              } else {
                return {
                  tipo_movimentacao: "Entrada",
                  subtipo_operacao: "Recebimento"
                };
              }
            })()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VisualizacaoOrdensRecebimento;