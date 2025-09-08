
import { useState } from "react";
import { CreateOCFormData, OrdemCarregamento } from "./types";
import { toast } from "@/hooks/use-toast";

export const useOrdemCarregamentoCreate = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Create a new ordem carregamento
  const createOrdemCarregamento = async (data: CreateOCFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a random ID
      const newOC: OrdemCarregamento = {
        id: `OC-${Math.floor(1000 + Math.random() * 9000)}`,
        ...data,
        status: 'pending',
        volumesTotal: 0,
        volumesVerificados: 0
      };
      
      toast({
        title: "Ordem de Carregamento criada",
        description: `OC ${newOC.id} criada com sucesso.`,
      });
      
      return newOC;
    } catch (error) {
      console.error('Error creating OC:', error);
      toast({
        title: "Erro ao criar Ordem de Carregamento",
        description: "Ocorreu um erro ao criar a OC. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createOrdemCarregamento,
  };
};
