import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Biohazard, LinkIcon, AlertTriangle, Trash2, Edit } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import SearchFilter from '@/components/common/SearchFilter';
import InutilizarEtiquetaDialog from '@/components/etiquetas/InutilizarEtiquetaDialog';
import EtiquetaDetalhesDialog from '@/components/etiquetas/EtiquetaDetalhesDialog';
import { toast } from '@/hooks/use-toast';
import { useEtiquetasDatabase } from '@/hooks/useEtiquetasDatabase';
import { Etiqueta } from '@/types/supabase/armazem.types';

interface ConsultaEtiquetasTabProps {
  volumes: any[];
  handleReimprimirEtiquetas: (volume: any) => void;
}

const ConsultaEtiquetasTab: React.FC<ConsultaEtiquetasTabProps> = ({
  volumes,
  handleReimprimirEtiquetas
}) => {
  const { 
    etiquetas, 
    isLoading, 
    buscarEtiquetas, 
    inutilizarEtiqueta, 
    marcarComoEtiquetada, 
    excluirEtiqueta 
  } = useEtiquetasDatabase();
  
  const [filteredEtiquetas, setFilteredEtiquetas] = useState<Etiqueta[]>([]);
  const [inutilizarDialogOpen, setInutilizarDialogOpen] = useState(false);
  const [detalhesDialogOpen, setDetalhesDialogOpen] = useState(false);
  const [etiquetaSelecionada, setEtiquetaSelecionada] = useState<Etiqueta | null>(null);

  // Carregar etiquetas do banco ao montar o componente
  useEffect(() => {
    buscarEtiquetas();
  }, [buscarEtiquetas]);

  // Atualizar etiquetas filtradas quando as etiquetas mudarem
  useEffect(() => {
    setFilteredEtiquetas(etiquetas);
  }, [etiquetas]);
  
  const handleSearch = (searchTerm: string, activeFilters?: Record<string, string[]>) => {
    if (!searchTerm && (!activeFilters || Object.keys(activeFilters).length === 0)) {
      setFilteredEtiquetas(etiquetas);
      return;
    }
    
    let filtered = etiquetas.filter(etiqueta => {
      // Apply text search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          etiqueta.codigo?.toLowerCase().includes(searchLower) ||
          etiqueta.descricao?.toLowerCase().includes(searchLower) ||
          etiqueta.chave_nf?.toLowerCase().includes(searchLower) ||
          etiqueta.remetente?.toLowerCase().includes(searchLower) ||
          etiqueta.destinatario?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Apply filters if any
      if (activeFilters && Object.keys(activeFilters).length > 0) {
        // Status filter
        if (activeFilters.Status && activeFilters.Status.length > 0) {
          const statusMatch = activeFilters.Status.some(status => etiqueta.status === status);
          if (!statusMatch) return false;
        }
        
        // Type filter
        if (activeFilters.Tipo && activeFilters.Tipo.length > 0) {
          const typeMatch = activeFilters.Tipo.some(tipo => {
            if (tipo === 'quimico') return !!etiqueta.codigo_onu;
            if (tipo === 'geral') return !etiqueta.codigo_onu;
            return false;
          });
          if (!typeMatch) return false;
        }
      }
      
      return true;
    });
    
    setFilteredEtiquetas(filtered);
  };

  const handleDetalhesClick = (etiqueta: Etiqueta) => {
    setEtiquetaSelecionada(etiqueta);
    setDetalhesDialogOpen(true);
  };

  const handleReimprimirClick = async (etiqueta: Etiqueta) => {
    if (etiqueta.etiquetado) {
      toast({
        title: "Aviso",
        description: "Esta etiqueta já foi impressa. Será gerada uma cópia de segurança.",
        variant: "default"
      });
    }
    
    // Marcar como etiquetada ao imprimir
    try {
      await marcarComoEtiquetada(etiqueta.id);
    } catch (error) {
      console.error('Erro ao marcar como etiquetada:', error);
    }
    
    // Converter etiqueta do banco para o formato esperado pelo handleReimprimirEtiquetas
    // IMPORTANTE: Criar apenas UM volume específico para reimpressão
    const volumeFormatted = {
      id: etiqueta.codigo,
      notaFiscal: etiqueta.chave_nf || 'N/A',
      descricao: `Volume ${etiqueta.volume_numero || 1}/${etiqueta.total_volumes || 1}`,
      tipoVolume: etiqueta.codigo_onu ? 'quimico' : 'geral',
      quantidade: etiqueta.quantidade || 1,
      etiquetado: etiqueta.etiquetado || false,
      area: etiqueta.area,
      remetente: etiqueta.remetente,
      destinatario: etiqueta.destinatario,
      endereco: etiqueta.endereco,
      cidade: etiqueta.cidade,
      uf: etiqueta.uf,
      transportadora: etiqueta.transportadora,
      pesoTotal: etiqueta.peso_total_bruto,
      codigoONU: etiqueta.codigo_onu,
      codigoRisco: etiqueta.codigo_risco,
      classificacaoQuimica: etiqueta.classificacao_quimica,
      volumeNumber: etiqueta.volume_numero || 1,
      totalVolumes: etiqueta.total_volumes || 1
    };
    
    // Passar apenas este volume específico para reimpressão
    handleReimprimirEtiquetas(volumeFormatted);
  };

  const handleInutilizarClick = (etiqueta: Etiqueta) => {
    if (etiqueta.status === 'inutilizada') {
      toast({
        title: "Aviso",
        description: "Esta etiqueta já foi inutilizada.",
        variant: "default"
      });
      return;
    }
    
    setEtiquetaSelecionada(etiqueta);
    setInutilizarDialogOpen(true);
  };

  const handleConfirmInutilizar = async (motivo: string) => {
    if (!etiquetaSelecionada) return;
    
    try {
      await inutilizarEtiqueta(etiquetaSelecionada.id, {
        motivo_inutilizacao: motivo
      });
    } catch (error) {
      console.error('Erro ao inutilizar etiqueta:', error);
    }
  };

  const handleExcluirEtiqueta = async (etiqueta: Etiqueta) => {
    if (etiqueta.etiquetado) {
      toast({
        title: "Erro",
        description: "Não é possível excluir uma etiqueta que já foi impressa. Use a função de inutilizar.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir a etiqueta ${etiqueta.codigo}? Esta ação não pode ser desfeita.`)) {
      try {
        await excluirEtiqueta(etiqueta.id);
      } catch (error) {
        console.error('Erro ao excluir etiqueta:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'etiquetada':
        return <StatusBadge status="success" text="Etiquetada" />;
      case 'gerada':
        return <StatusBadge status="pending" text="Gerada" />;
      case 'inutilizada':
        return <StatusBadge status="error" text="Inutilizada" />;
      case 'unitizada':
        return <StatusBadge status="info" text="Unitizada" />;
      default:
        return <StatusBadge status="pending" text={status} />;
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Etiquetas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchFilter 
            placeholder="Buscar por código, descrição, chave NF, remetente ou destinatário..." 
            filters={[
              {
                name: "Status",
                options: [
                  { label: "Gerada", value: "gerada" },
                  { label: "Etiquetada", value: "etiquetada" },
                  { label: "Inutilizada", value: "inutilizada" },
                  { label: "Unitizada", value: "unitizada" }
                ]
              },
              {
                name: "Tipo",
                options: [
                  { label: "Carga Geral", value: "geral" },
                  { label: "Produto Químico", value: "quimico" }
                ]
              }
            ]}
            onSearch={handleSearch}
          />
          
          <DataTable
            columns={[
              { header: 'Código', accessor: 'codigo' },
              { header: 'Descrição', accessor: 'descricao' },
              { 
                header: 'Tipo', 
                accessor: 'codigo_onu',
                cell: (row) => {
                  return row.codigo_onu ? 
                    <div className="flex items-center">
                      <Biohazard size={16} className="text-red-500 mr-1" />
                      <span>Químico</span>
                    </div> : 
                    <span>Carga Geral</span>;
                }
              },
              { 
                header: 'Área', 
                accessor: 'area',
                cell: (row) => {
                  return row.area ? 
                    <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-bold text-center">
                      {row.area}
                    </div> : 
                    <span>-</span>;
                }
              },
              { 
                header: 'Quantidade', 
                accessor: 'quantidade',
                cell: (row) => {
                  return (
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-center">
                      {row.quantidade || 1}
                    </div>
                  );
                }
              },
              { 
                header: 'Volume', 
                accessor: 'volume_numero',
                cell: (row) => {
                  // Aplicar a mesma lógica da descrição para mostrar Volume X/Y
                  const volumeNumber = row.volume_numero || 1;
                  const totalVolumes = row.total_volumes || 1;
                  return (
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded font-bold text-center">
                      {volumeNumber}/{totalVolumes}
                    </div>
                  );
                }
              },
              { 
                header: 'Status', 
                accessor: 'status',
                cell: (row) => getStatusBadge(row.status)
              },
              { 
                header: 'Data Geração', 
                accessor: 'data_geracao',
                cell: (row) => {
                  return row.data_geracao ? 
                    new Date(row.data_geracao).toLocaleDateString('pt-BR') : 
                    '-';
                }
              },
              {
                header: 'Ações',
                accessor: 'actions',
                cell: (row) => (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDetalhesClick(row)}
                    >
                      <FileText size={16} className="mr-1" />
                      Detalhes
                    </Button>
                    {row.status !== 'inutilizada' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReimprimirClick(row)}
                          className={row.etiquetado ? "border-yellow-500 text-yellow-600 hover:bg-yellow-50" : ""}
                        >
                          {row.etiquetado && <AlertTriangle size={16} className="mr-1 text-yellow-600" />}
                          {!row.etiquetado && <Printer size={16} className="mr-1" />}
                          {row.etiquetado ? "Reimprimir" : "Imprimir"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleInutilizarClick(row)}
                          className="border-orange-500 text-orange-600 hover:bg-orange-50"
                        >
                          <Edit size={16} className="mr-1" />
                          Inutilizar
                        </Button>
                        {!row.etiquetado && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleExcluirEtiqueta(row)}
                            className="border-red-500 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Excluir
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )
              }
            ]}
            data={filteredEtiquetas}
          />
          
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Carregando etiquetas...</div>
            </div>
          )}
        </CardContent>
      </Card>

      <InutilizarEtiquetaDialog
        open={inutilizarDialogOpen}
        onOpenChange={setInutilizarDialogOpen}
        etiqueta={etiquetaSelecionada}
        onConfirm={handleConfirmInutilizar}
        isLoading={isLoading}
      />

      <EtiquetaDetalhesDialog
        open={detalhesDialogOpen}
        onOpenChange={setDetalhesDialogOpen}
        etiqueta={etiquetaSelecionada}
      />
    </>
  );
};

export default ConsultaEtiquetasTab;
