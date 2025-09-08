
import { useState } from "react";
import { mockOrdensCarregamento } from "./mockData";
import { OrdemCarregamento } from "./types";
import { toast } from "@/hooks/use-toast";

export const useOrdensCarregamentoQuery = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ordensCarregamento, setOrdensCarregamento] = useState<OrdemCarregamento[]>([]);

  // Function to get ordensCarregamento
  const fetchOrdensCarregamento = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setOrdensCarregamento(mockOrdensCarregamento);
      return mockOrdensCarregamento;
    } catch (error) {
      console.error('Error fetching ordens carregamento:', error);
      toast({
        title: "Erro ao buscar Ordens de Carregamento",
        description: "Ocorreu um erro ao buscar as ordens de carregamento.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Function to initiate carregamento
  const iniciarCarregamento = (ordemId: string) => {
    setOrdensCarregamento(prev => 
      prev.map(oc => {
        if (oc.id === ordemId) {
          return {
            ...oc,
            status: 'processing'
          };
        }
        return oc;
      })
    );
    
    toast({
      title: "Carregamento iniciado",
      description: `Carregamento da OC ${ordemId} iniciado com sucesso.`,
    });
  };

  return {
    isLoading,
    ordensCarregamento,
    setOrdensCarregamento,
    fetchOrdensCarregamento,
    iniciarCarregamento
  };
};
