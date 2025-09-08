import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Link as LinkIcon, Package, Truck } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import SearchFilter from '@/components/common/SearchFilter';
import VinculoEtiquetaMaeDialog from './VinculoEtiquetaMaeDialog';
import EtiquetaMaeFormPanel from './EtiquetaMaeFormPanel';
import EtiquetaPreview from './EtiquetaPreview';
import { UseFormReturn } from 'react-hook-form';
import { Volume } from './VolumesTable';

interface EtiquetaMae {
  id: string;
  notaFiscal: string;
  quantidadeVolumes: number;
  remetente: string;
  destinatario: string;
  cidade: string;
  uf: string;
  dataCriacao: string;
  status: string;
  tipo?: 'geral' | 'palete';
  descricao?: string;
}

interface EtiquetasMaeTabProps {
  etiquetasMae: EtiquetaMae[];
  volumes: Volume[];
  handlePrintEtiquetaMae: (etiquetaMae: EtiquetaMae) => void;
  handleVincularVolumes?: (etiquetaMaeId: string, volumeIds: string[]) => void;
  handleCreateEtiquetaMae?: () => void;
  form?: UseFormReturn<any>;
  returnUrl?: string; // New prop for return URL
}

const EtiquetasMaeTab: React.FC<EtiquetasMaeTabProps> = ({
  etiquetasMae,
  volumes,
  handlePrintEtiquetaMae,
  handleVincularVolumes,
  handleCreateEtiquetaMae,
  form,
  returnUrl
}) => {
  const [location, setLocation] = useLocation();
  const [vinculoDialogOpen, setVinculoDialogOpen] = useState(false);
  const [selectedEtiquetaMae, setSelectedEtiquetaMae] = useState<EtiquetaMae | null>(null);

  const handleOpenVinculoDialog = (etiquetaMae: EtiquetaMae) => {
    setSelectedEtiquetaMae(etiquetaMae);
    setVinculoDialogOpen(true);
  };

  const handleVincularVolumesSave = (etiquetaMaeId: string, volumeIds: string[]) => {
    if (handleVincularVolumes) {
      handleVincularVolumes(etiquetaMaeId, volumeIds);
    }
  };
  
  const handleCreateAndReturn = () => {
    if (handleCreateEtiquetaMae) {
      const result = handleCreateEtiquetaMae();
      
      // If we have a return URL, navigate back after creating the etiqueta mãe
      if (returnUrl) {
        setTimeout(() => {
          setLocation(returnUrl);
        }, 1000);
      }
    }
  };
  
  const handleSelectAndReturn = (etiqueta: EtiquetaMae) => {
    if (returnUrl) {
      // Pass selected etiqueta back to unitização page
      setLocation(returnUrl);
    }
  };
  
  return (
    <div className="space-y-6">
      {returnUrl && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-4">
          <p className="font-medium">Modo de seleção</p>
          <p className="text-sm">Crie uma nova etiqueta mãe ou selecione uma existente para retornar à unitização de paletes.</p>
        </div>
      )}

      {form && handleCreateEtiquetaMae && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EtiquetaMaeFormPanel 
              form={form}
              handleCreateEtiquetaMae={returnUrl ? handleCreateAndReturn : handleCreateEtiquetaMae}
              isUnitizacaoMode={Boolean(returnUrl)}
            />
          </div>
          <div>
            <EtiquetaPreview 
              tipoEtiqueta="mae"
              isQuimico={false}
            />
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Etiquetas Mãe</CardTitle>
        </CardHeader>
        <CardContent>
          <SearchFilter 
            placeholder="Buscar por ID ou descrição..." 
            filters={[
              {
                name: "Status",
                options: [
                  { label: "Ativo", value: "ativo" },
                  { label: "Inativo", value: "inativo" }
                ]
              },
              {
                name: "Tipo",
                options: [
                  { label: "Geral", value: "geral" },
                  { label: "Palete", value: "palete" }
                ]
              },
              {
                name: "Período",
                options: [
                  { label: "Hoje", value: "today" },
                  { label: "Esta semana", value: "thisWeek" },
                  { label: "Este mês", value: "thisMonth" }
                ]
              }
            ]}
          />
          
          <DataTable
            columns={[
              { header: 'ID', accessor: 'id' },
              { header: 'Descrição', accessor: 'descricao', 
                cell: (row) => (
                  <div>{row.descricao || 'Etiqueta Mãe'}</div>
                )
              },
              { 
                header: 'Tipo', 
                accessor: 'tipo',
                cell: (row) => (
                  <div className="flex items-center">
                    {row.tipo === 'palete' ? (
                      <>
                        <Truck size={16} className="mr-1 text-orange-500" />
                        Palete
                      </>
                    ) : (
                      <>
                        <Package size={16} className="mr-1 text-blue-500" />
                        Geral
                      </>
                    )}
                  </div>
                )
              },
              { header: 'Volumes', accessor: 'quantidadeVolumes',
                cell: (row) => (
                  <div>{row.quantidadeVolumes || '0'}</div>
                )
              },
              { header: 'Data Criação', accessor: 'dataCriacao' },
              { header: 'Status', accessor: 'status' },
              {
                header: 'Ações',
                accessor: 'actions',
                cell: (row) => (
                  <div className="flex gap-2">
                    {returnUrl && row.tipo === 'palete' && (
                      <Button 
                        variant="default" 
                        size="sm"
                        className="bg-cross-blue hover:bg-cross-blue/90"
                        onClick={() => handleSelectAndReturn(row)}
                      >
                        <Package size={16} className="mr-1" />
                        Selecionar
                      </Button>
                    )}

                    <Button variant="outline" size="sm">
                      <FileText size={16} className="mr-1" />
                      Detalhes
                    </Button>
                    
                    {handleVincularVolumes && !returnUrl && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenVinculoDialog(row)}
                      >
                        <LinkIcon size={16} className="mr-1" />
                        Vincular
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePrintEtiquetaMae(row)}
                    >
                      <Printer size={16} className="mr-1" />
                      Imprimir
                    </Button>
                  </div>
                )
              }
            ]}
            data={etiquetasMae}
          />

          {/* Dialog for linking volumes to master label */}
          <VinculoEtiquetaMaeDialog
            open={vinculoDialogOpen}
            onClose={() => setVinculoDialogOpen(false)}
            etiquetaMae={selectedEtiquetaMae}
            volumes={volumes}
            onSave={handleVincularVolumesSave}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EtiquetasMaeTab;
