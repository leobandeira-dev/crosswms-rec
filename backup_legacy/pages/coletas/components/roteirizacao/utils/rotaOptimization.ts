
import { Carga } from '../../../types/coleta.types';
import { toast } from '@/hooks/use-toast';
import { getOptimizedRoute } from '../../mapa/utils';

// Função para calcular a rota otimizada baseada nos CEPs
export const calcularRotaOtimizada = (cargas: Carga[]): Carga[] => {
  // Aqui teríamos uma lógica mais complexa com API de geocoding
  // Por agora, vamos simular ordenando por CEP
  return [...cargas].sort((a, b) => {
    const cepA = a.cep?.replace('-', '') || '99999999';
    const cepB = b.cep?.replace('-', '') || '99999999';
    return cepA.localeCompare(cepB);
  });
};

export const calcularRotaAvancada = async (cargas: Carga[]): Promise<Carga[]> => {
  if (cargas.length < 2) {
    toast({
      title: "Erro na otimização",
      description: "São necessários pelo menos 2 pontos para calcular uma rota.",
      variant: "destructive"
    });
    return cargas;
  }

  try {
    // Tenta usar a API do Google Maps para calcular a rota otimizada
    if (window.google && window.google.maps) {
      const optimizedCargas = await getOptimizedRoute(cargas);
      
      toast({
        title: "Rota otimizada calculada!",
        description: `${cargas.length} coletas foram organizadas na ordem mais eficiente.`,
      });
      
      return optimizedCargas;
    } else {
      // Fallback para o método simples se a API do Google não estiver disponível
      const rotaSimples = calcularRotaOtimizada(cargas);
      
      toast({
        title: "Rota calculada com método alternativo",
        description: `${cargas.length} coletas foram organizadas com base em proximidade de CEP.`,
      });
      
      return rotaSimples;
    }
  } catch (error) {
    console.error("Erro ao calcular rota:", error);
    // Fallback para o método simples se houver erro
    const rotaSimples = calcularRotaOtimizada(cargas);
    
    toast({
      title: "Rota calculada com método alternativo",
      description: `${cargas.length} coletas foram organizadas com base em proximidade de CEP.`,
    });
    
    return rotaSimples;
  }
};
