
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

// Interface para os dados das faturas no histórico
export interface FaturaHistorico {
  id: string;
  documentoNumero?: string;
  documentoTipo?: 'inbound' | 'outbound';
  data: Date;
  transportadora?: string;
  motorista?: string;
  notasCount?: number;
  valorTotal?: number;
}

// Mock data para o histórico de faturas
const faturasHistoricoMock: FaturaHistorico[] = [
  {
    id: '1',
    documentoNumero: '180523-1',
    documentoTipo: 'outbound',
    data: new Date(2023, 4, 18),
    transportadora: 'Transportes Rápidos Ltda',
    motorista: 'João Silva',
    notasCount: 5,
    valorTotal: 15250.75
  },
  {
    id: '2',
    documentoNumero: '180523-2',
    documentoTipo: 'inbound',
    data: new Date(2023, 4, 18),
    transportadora: 'Logística Express S.A.',
    motorista: 'Maria Oliveira',
    notasCount: 3,
    valorTotal: 8750.25
  },
  {
    id: '3',
    documentoNumero: '190523-1',
    documentoTipo: 'outbound',
    data: new Date(2023, 4, 19),
    transportadora: 'Transportadora Nacional Ltda',
    motorista: 'Carlos Santos',
    notasCount: 8,
    valorTotal: 23450.00
  },
  {
    id: '4',
    documentoNumero: '200523-1',
    documentoTipo: 'outbound',
    data: new Date(2023, 4, 20),
    transportadora: 'Transportes Seguros ME',
    motorista: 'Amanda Costa',
    notasCount: 2,
    valorTotal: 5680.50
  },
  {
    id: '5',
    documentoNumero: '200523-2',
    documentoTipo: 'inbound',
    data: new Date(2023, 4, 20),
    transportadora: 'Expressa Transportes Ltda',
    motorista: 'Roberto Almeida',
    notasCount: 4,
    valorTotal: 12340.75
  }
];

export const useHistoricoFaturas = () => {
  const [faturas, setFaturas] = useState<FaturaHistorico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFatura, setSelectedFatura] = useState<FaturaHistorico | null>(null);

  // Simula o carregamento de dados de um backend
  useEffect(() => {
    const fetchFaturas = async () => {
      try {
        // Simulação de chamada à API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFaturas(faturasHistoricoMock);
      } catch (error) {
        console.error('Erro ao carregar histórico de faturas:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar o histórico de faturas.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFaturas();
  }, []);

  const handleViewFatura = (faturaId: string) => {
    const fatura = faturas.find(f => f.id === faturaId);
    if (fatura) {
      setSelectedFatura(fatura);
      toast({
        title: 'Visualizar fatura',
        description: `Visualizando detalhes da fatura ${fatura.documentoNumero}.`
      });
      // Em uma implementação real, poderíamos abrir um modal ou navegar para uma página de detalhes
    }
  };

  const handlePrintFatura = (faturaId: string) => {
    const fatura = faturas.find(f => f.id === faturaId);
    if (fatura) {
      toast({
        title: 'Impressão solicitada',
        description: `Preparando impressão da fatura ${fatura.documentoNumero}.`
      });
      // Em uma implementação real, esta função abriria o modal de impressão
    }
  };

  return {
    faturas,
    loading,
    selectedFatura,
    handleViewFatura,
    handlePrintFatura
  };
};
