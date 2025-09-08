
import { useState } from "react";
import { mockNotasFiscais } from "./mockData";
import { NotaFiscal, OrdemCarregamento } from "./types";
import { toast } from "@/hooks/use-toast";

export const useNotasFiscais = (
  setOrdensCarregamento: React.Dispatch<React.SetStateAction<OrdemCarregamento[]>>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notasFiscaisDisponiveis, setNotasFiscaisDisponiveis] = useState<NotaFiscal[]>([]);

  // Function to get available notas fiscais
  const fetchNotasFiscaisDisponiveis = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setNotasFiscaisDisponiveis(mockNotasFiscais);
      return mockNotasFiscais;
    } catch (error) {
      console.error('Error fetching notas fiscais:', error);
      toast({
        title: "Erro ao buscar Notas Fiscais",
        description: "Ocorreu um erro ao buscar as notas fiscais disponíveis.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Function to import notas fiscais to an ordem carregamento
  const importarNotasFiscais = async (ordemId: string, notasIds: string[]) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find the selected notas
      const notasSelecionadas = notasFiscaisDisponiveis.filter(nota => 
        notasIds.includes(nota.id)
      );
      
      // Update the ordem carregamento with the selected notas
      setOrdensCarregamento(prev => 
        prev.map(oc => {
          if (oc.id === ordemId) {
            return {
              ...oc,
              notasFiscais: [...(oc.notasFiscais || []), ...notasSelecionadas]
            };
          }
          return oc;
        })
      );
      
      toast({
        title: "Notas Fiscais importadas",
        description: `${notasSelecionadas.length} notas fiscais foram importadas com sucesso.`,
      });
      
      return notasSelecionadas;
    } catch (error) {
      console.error('Error importing notas fiscais:', error);
      toast({
        title: "Erro ao importar Notas Fiscais",
        description: "Ocorreu um erro ao importar as notas fiscais.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notasFiscaisDisponiveis,
    fetchNotasFiscaisDisponiveis,
    importarNotasFiscais,
    isLoading
  };
};
