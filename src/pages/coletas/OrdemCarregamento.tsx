import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import NovaOrdemIntegrada from '@/components/comum/OrdemCarregamento/NovaOrdemIntegrada';

function OrdemCarregamento() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [preloadedNotes, setPreloadedNotes] = useState<any[]>([]);

  useEffect(() => {
    // Verificar se existem notas pré-carregadas do módulo de recebimento
    const processedInvoices = localStorage.getItem('processedInvoices');
    const orderData = localStorage.getItem('orderData');
    
    if (processedInvoices) {
      try {
        const notes = JSON.parse(processedInvoices);
        setPreloadedNotes(notes);
        console.log('Notas carregadas do recebimento:', notes.length);
      } catch (error) {
        console.error('Erro ao carregar notas:', error);
      }
    }
  }, []);

  const handleSubmitOrdem = (data: any) => {
    console.log('Ordem de carregamento criada no módulo de coletas:', data);
    
    // Criar ordem completa com dados de coletas
    const ordemColeta = {
      ...data,
      status: 'pendente_aprovacao',
      modulo: 'coletas',
      data_criacao: new Date().toISOString(),
      numero_ordem: `COL-${Date.now()}`,
      created_by: 'Sistema Coletas'
    };
    
    // Salvar ordem no localStorage para persistência
    const existingOrders = JSON.parse(localStorage.getItem('ordensColeta') || '[]');
    const updatedOrders = [...existingOrders, ordemColeta];
    localStorage.setItem('ordensColeta', JSON.stringify(updatedOrders));
    
    // Limpar dados processados após criar ordem
    localStorage.removeItem('processedInvoices');
    localStorage.removeItem('orderData');
    
    toast({
      title: "Ordem de Carregamento Criada!",
      description: `Ordem ${ordemColeta.numero_ordem} criada com ${data.totalNotas || 0} nota(s) fiscal(is).`,
    });

    // Redirecionar para lista de solicitações/ordens
    setLocation('/coletas/solicitacoes');
  };

  const handleCancelar = () => {
    setLocation('/coletas/solicitacoes');
  };

  return (
    <MainLayout title="Ordem de Carga">
      <NovaOrdemIntegrada
        title="Ordem de Carga"
        onSubmit={handleSubmitOrdem}
        onCancel={handleCancelar}
        mode="create"
        showBackButton={true}
        preloadedNotes={preloadedNotes}
      />
    </MainLayout>
  );
}

export default OrdemCarregamento;