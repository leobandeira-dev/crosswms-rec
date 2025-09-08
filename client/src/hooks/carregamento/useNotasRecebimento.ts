
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { notasFiscais as mockNotasFiscaisRecebimento } from "@/pages/armazenagem/recebimento/data/mockData";
import { NotaFiscal } from "./types";

export const useNotasRecebimento = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notasRecebimento, setNotasRecebimento] = useState<NotaFiscal[]>([]);

  // Function to fetch all registered notes from the receipt system
  const fetchNotasRecebimento = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real implementation, you would fetch from an API
      // For now we'll use the mock data from the receitas module
      const notasFormatadas = mockNotasFiscaisRecebimento.map(nota => ({
        id: nota.id,
        numero: nota.id,
        remetente: nota.fornecedor || nota.emitenteRazaoSocial || '',
        cliente: nota.destinatarioRazaoSocial || '',
        pedido: nota.numero || '',
        dataEmissao: nota.data || nota.dataHoraEmissao || '',
        valor: parseFloat(nota.valor || '0'),
        pesoBruto: parseFloat(nota.pesoTotalBruto || '0')
      }));
      
      setNotasRecebimento(notasFormatadas);
      return notasFormatadas;
    } catch (error) {
      console.error('Error fetching notas fiscais from recebimento:', error);
      toast({
        title: "Erro ao buscar Notas Fiscais",
        description: "Ocorreu um erro ao buscar as notas fiscais do sistema de recebimento.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Function to import notes to an ordem carregamento
  const importarNotasRecebimento = (selectedNotas: NotaFiscal[]) => {
    // This would typically involve some sort of mapping or transformation
    return selectedNotas;
  };

  return {
    isLoading,
    notasRecebimento,
    fetchNotasRecebimento,
    importarNotasRecebimento
  };
};
