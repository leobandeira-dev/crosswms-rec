import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import NovaOrdemIntegrada from '@/components/comum/OrdemCarregamento/NovaOrdemIntegrada';

function CriacaoOrdem() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [preloadedData, setPreloadedData] = useState<any>(null);

  useEffect(() => {
    // Check for pre-populated data from armazenagem workflow
    const orderData = localStorage.getItem('orderData');
    if (orderData) {
      try {
        const parsedData = JSON.parse(orderData);
        console.log('Pre-loaded data from armazenagem:', parsedData);
        setPreloadedData(parsedData);
        // Clear the data after loading to prevent reuse
        localStorage.removeItem('orderData');
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
  }, []);

  const handleSubmitOrdem = (data: any) => {
    console.log('Ordem criada:', data);
    
    toast({
      title: "Solicitação Criada!",
      description: "Solicitação de carregamento criada com sucesso.",
    });

    // Redirecionar para lista de ordens
    setLocation('/marketplace');
  };

  const handleCancelar = () => {
    setLocation('/marketplace');
  };

  return (
    <MainLayout title="Nova Solicitação de Carregamento">
      <NovaOrdemIntegrada
        title="Nova Solicitação de Carregamento"
        onSubmit={handleSubmitOrdem}
        onCancel={handleCancelar}
        mode="create"
        showBackButton={true}
        preloadedNotes={preloadedData?.processedInvoices || []}
      />
    </MainLayout>
  );
}

export default CriacaoOrdem;