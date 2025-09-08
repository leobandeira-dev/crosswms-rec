
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Carga } from '../../types/coleta.types';

export const useAlocacaoModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCarga, setSelectedCarga] = useState<Carga | null>(null);

  const handleAlocarMotorista = (carga: Carga) => {
    setSelectedCarga(carga);
    setIsModalOpen(true);
  };

  const handleAlocacaoConfirmada = (cargaId: string, motorista: string, veiculo: string) => {
    // Implementar lógica para alocar motorista e veículo
    toast({
      title: "Motorista alocado com sucesso",
      description: `A carga ${cargaId} foi alocada para ${motorista} com o veículo ${veiculo}.`,
    });
    setIsModalOpen(false);
    console.log('Carga alocada:', cargaId, 'Motorista:', motorista, 'Veículo:', veiculo);
  };

  return {
    isModalOpen,
    setIsModalOpen,
    selectedCarga,
    setSelectedCarga,
    handleAlocarMotorista,
    handleAlocacaoConfirmada
  };
};
