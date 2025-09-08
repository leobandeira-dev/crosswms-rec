import React, { useState, useEffect } from 'react';
import TopNavbar from '../../components/layout/TopNavbar';
import NotasFiscaisTracker from '../../components/tracking/NotasFiscaisTracker';
import type { NotaFiscalRastreamento } from '../../components/tracking/NotasFiscaisTracker';
import { useToast } from '../../hooks/use-toast';

const Rastreamento = () => {
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalRastreamento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Função para buscar dados reais das notas fiscais
  const fetchNotasFiscais = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "❌ Erro de autenticação",
          description: "Token de acesso não encontrado",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/rastreamento/notas-fiscais', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Dados reais carregados:', data);
      
      setNotasFiscais(data);
      
      toast({
        title: "✅ Dados carregados",
        description: `${data.length} notas fiscais encontradas`
      });

    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
      toast({
        title: "❌ Erro ao carregar dados",
        description: "Não foi possível carregar as notas fiscais",
        variant: "destructive"
      });
      
      // Fallback para dados mock em caso de erro
      setNotasFiscais(mockNotasFiscais);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotasFiscais();
  }, []);

  // Mock data como fallback (dados existentes mantidos)
  const mockNotasFiscais: NotaFiscalRastreamento[] = [
    {
      id: '1',
      numero: '123456',
      serie: '001',
      remetente: 'ACME Indústria LTDA',
      destinatario: 'Beta Comércio S/A',
      cidadeOrigem: 'São Paulo - SP',
      cidadeDestino: 'Rio de Janeiro - RJ',
      statusAtual: 'em_transito',
      statusNota: 'disponivel',
      prioridade: 'expressa',
      aprovacao: 'aprovado',
      dataEmissao: '2024-01-15',
      previsaoEntrega: '2024-01-17',
      pesoTotal: 150.5,
      valorTotal: 25000.00,
      volumes: 3,
      ultimaAtualizacao: '2024-01-16 14:30',
      tipoEntrada: 'Coleta',
      numeroColeta: 'COL-2024-001',
      numeroOR: 'OR-2024-002',
      dataSolicitacao: '2024-01-14',
      dataAprovacao: '2024-01-15',
      dataEntrada: '2024-01-15',
      dataCarregamento: '2024-01-16',
      dataPrevisaoEntrega: '2024-01-17',
      dataEntrega: undefined,
      localizacaoAtual: 'Presidente Dutra - RJ',
      kmFaltantes: 120,
      peso: 150.5,
      motorista: 'Carlos Silva',
      tipoFrete: 'CIF',
      tipoTransporte: 'Fracionado',
      ordemCarregamento: 'OC-2024-001',
      numeroCteColeta: 'CTE-COL-001',
      numeroCteViagem: 'CTE-VIA-001',
      historicoEventos: [
        {
          id: '1',
          dataHora: '2024-01-15 08:00',
          status: 'pendente_coleta',
          local: 'São Paulo - SP',
          responsavel: 'Sistema',
          observacoes: 'Nota fiscal emitida'
        },
        {
          id: '2',
          dataHora: '2024-01-15 14:30',
          status: 'coletado',
          local: 'São Paulo - SP',
          responsavel: 'João Silva',
          observacoes: 'Coleta realizada na origem'
        },
        {
          id: '3',
          dataHora: '2024-01-15 18:00',
          status: 'armazenado',
          local: 'CD São Paulo',
          responsavel: 'Maria Santos',
          observacoes: 'Mercadoria armazenada no CD'
        },
        {
          id: '4',
          dataHora: '2024-01-16 06:00',
          status: 'em_transito',
          local: 'Rodovia Presidente Dutra',
          responsavel: 'Carlos Oliveira',
          observacoes: 'Veículo em trânsito para RJ'
        }
      ]
    },
    {
      id: '2',
      numero: '789012',
      serie: '002',
      remetente: 'Gamma Tecnologia',
      destinatario: 'Delta Soluções',
      cidadeOrigem: 'Belo Horizonte - MG',
      cidadeDestino: 'Salvador - BA',
      statusAtual: 'armazenado',
      statusNota: 'disponivel',
      prioridade: 'normal',
      aprovacao: 'pendente',
      dataEmissao: '2024-01-01',
      previsaoEntrega: '2024-01-20',
      pesoTotal: 75.2,
      valorTotal: 15000.00,
      volumes: 2,
      ultimaAtualizacao: '2024-01-15 16:45',
      tipoEntrada: 'Recebimento',
      numeroColeta: undefined,
      numeroOR: 'OR-2024-003',
      dataSolicitacao: '2023-12-30',
      dataAprovacao: '2024-01-01',
      dataEntrada: '2024-01-02',
      dataCarregamento: undefined,
      dataPrevisaoEntrega: '2024-01-20',
      dataEntrega: undefined,
      localizacaoAtual: 'CD Belo Horizonte',
      kmFaltantes: 950,
      peso: 75.2,
      motorista: 'Ana Costa',
      tipoFrete: 'FOB',
      tipoTransporte: 'Lotação',
      ordemCarregamento: 'OC-2024-002',
      numeroCteColeta: 'CTE-COL-002',
      numeroCteViagem: 'CTE-VIA-002',
      historicoEventos: [
        {
          id: '1',
          dataHora: '2024-01-01 10:00',
          status: 'pendente_coleta',
          local: 'Belo Horizonte - MG',
          responsavel: 'Sistema',
          observacoes: 'Aguardando coleta'
        },
        {
          id: '2',
          dataHora: '2024-01-02 09:30',
          status: 'coletado',
          local: 'Belo Horizonte - MG',
          responsavel: 'Ana Costa',
          observacoes: 'Coleta concluída'
        },
        {
          id: '3',
          dataHora: '2024-01-08 16:45',
          status: 'armazenado',
          local: 'CD Belo Horizonte',
          responsavel: 'Pedro Lima',
          observacoes: 'Armazenado no CD'
        }
      ]
    },
    {
      id: '3',
      numero: '456789',
      serie: '001',
      remetente: 'Epsilon Materiais',
      destinatario: 'Zeta Construções',
      cidadeOrigem: 'Curitiba - PR',
      cidadeDestino: 'Florianópolis - SC',
      statusAtual: 'entregue',
      statusNota: 'disponivel',
      prioridade: 'normal',
      aprovacao: 'aprovado',
      dataEmissao: '2024-01-10',
      previsaoEntrega: '2024-01-14',
      pesoTotal: 200.0,
      valorTotal: 18000.00,
      volumes: 5,
      ultimaAtualizacao: '2024-01-14 15:20',
      tipoEntrada: 'Direto',
      numeroColeta: undefined,
      numeroOR: 'OR-2024-004',
      dataSolicitacao: '2024-01-09',
      dataAprovacao: '2024-01-10',
      dataEntrada: '2024-01-10',
      dataCarregamento: '2024-01-12',
      dataPrevisaoEntrega: '2024-01-14',
      dataEntrega: '2024-01-14',
      localizacaoAtual: 'Entregue',
      kmFaltantes: 0,
      peso: 200.0,
      motorista: 'Roberto Santos',
      tipoFrete: 'CIF',
      tipoTransporte: 'Fracionado',
      ordemCarregamento: 'OC-2024-003',
      numeroCteColeta: undefined,
      numeroCteViagem: 'CTE-VIA-003',
      historicoEventos: [
        {
          id: '1',
          dataHora: '2024-01-10 08:00',
          status: 'pendente_coleta',
          local: 'Curitiba - PR',
          responsavel: 'Sistema',
          observacoes: 'Nota fiscal emitida'
        },
        {
          id: '2',
          dataHora: '2024-01-10 14:00',
          status: 'coletado',
          local: 'Curitiba - PR',
          responsavel: 'Roberto Santos',
          observacoes: 'Coleta realizada'
        },
        {
          id: '3',
          dataHora: '2024-01-11 10:00',
          status: 'em_transito',
          local: 'BR-101',
          responsavel: 'Roberto Santos',
          observacoes: 'Em rota para Florianópolis'
        },
        {
          id: '4',
          dataHora: '2024-01-13 16:00',
          status: 'filial_destino',
          local: 'CD Florianópolis',
          responsavel: 'Luciana Melo',
          observacoes: 'Chegada na filial destino'
        },
        {
          id: '5',
          dataHora: '2024-01-14 15:20',
          status: 'entregue',
          local: 'Florianópolis - SC',
          responsavel: 'Roberto Santos',
          observacoes: 'Entrega realizada com sucesso'
        }
      ]
    },
    {
      id: '4',
      numero: '321654',
      serie: '003',
      remetente: 'Theta Equipamentos',
      destinatario: 'Iota Serviços',
      cidadeOrigem: 'Fortaleza - CE',
      cidadeDestino: 'Recife - PE',
      statusAtual: 'pendente_coleta',
      statusNota: 'disponivel',
      prioridade: 'prioridade',
      aprovacao: 'recusado',
      dataEmissao: '2024-01-16',
      previsaoEntrega: '2024-01-19',
      pesoTotal: 80.5,
      valorTotal: 12000.00,
      volumes: 1,
      ultimaAtualizacao: '2024-01-16 09:00',
      tipoEntrada: 'Coleta',
      numeroColeta: 'COL-2024-004',
      numeroOR: 'OR-2024-005',
      dataSolicitacao: '2024-01-15',
      dataAprovacao: undefined,
      dataEntrada: undefined,
      dataCarregamento: undefined,
      dataPrevisaoEntrega: '2024-01-19',
      dataEntrega: undefined,
      localizacaoAtual: 'Aguardando aprovação',
      kmFaltantes: 800,
      peso: 80.5,
      motorista: undefined,
      tipoFrete: 'FOB',
      tipoTransporte: 'Consolidação',
      ordemCarregamento: undefined,
      numeroCteColeta: undefined,
      numeroCteViagem: undefined,
      historicoEventos: [
        {
          id: '1',
          dataHora: '2024-01-16 09:00',
          status: 'pendente_coleta',
          local: 'Fortaleza - CE',
          responsavel: 'Sistema',
          observacoes: 'Aguardando aprovação para coleta'
        }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNavbar />
        <div className="flex-1 p-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados das notas fiscais...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      <div className="flex-1 p-6">
        <NotasFiscaisTracker
          title="Rastreamento de Notas Fiscais - Dados Reais"
          initialData={notasFiscais}
          showFilters={true}
          showTabs={true}
          onNotaSelect={(nota) => {
            console.log('Nota selecionada:', nota);
          }}
          onStatusUpdate={(notaId, newStatus) => {
            console.log('Status atualizado:', notaId, newStatus);
            // Implementar atualização de status no backend se necessário
          }}
        />
      </div>
    </div>
  );
};

export default Rastreamento;