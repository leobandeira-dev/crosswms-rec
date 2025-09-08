
import React, { useState, useRef } from 'react';
import OrderSelectionForm from './OrderSelectionForm';
import VolumeFilterSection from './VolumeFilterSection';
import VolumeList from './VolumeList';
import TruckLayoutGrid from './TruckLayoutGrid';
import InstructionsCard from './InstructionsCard';
import PrintLayoutModal from './PrintLayoutModal';

interface CarregamentoLayoutProps {
  orderNumber: string | null;
  volumes: any[];
  volumesFiltrados: any[];
  selecionados: string[];
  caminhaoLayout: any[];
  numeroLinhas: number;
  onOrderFormSubmit: (data: any) => void;
  onFilter: (searchValue: string, searchType: 'volume' | 'etiquetaMae' | 'notaFiscal') => void;
  onSelectionToggle: (id: string) => void;
  onSelectAll: () => void;
  onCellClick: (cellId: string) => void;
  onRemoveVolume: (volumeId: string, cellId: string) => void;
  onSaveLayout: () => void;
  onUpdateLinhas: (numeroLinhas: number) => void;
  hasSelectedVolumes: boolean;
  allVolumesPositioned: boolean;
}

const CarregamentoLayout: React.FC<CarregamentoLayoutProps> = ({
  orderNumber,
  volumes,
  volumesFiltrados,
  selecionados,
  caminhaoLayout,
  numeroLinhas,
  onOrderFormSubmit,
  onFilter,
  onSelectionToggle,
  onSelectAll,
  onCellClick,
  onRemoveVolume,
  onSaveLayout,
  onUpdateLinhas,
  hasSelectedVolumes,
  allVolumesPositioned
}) => {
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  
  const handlePrintLayout = () => {
    setPrintModalOpen(true);
  };
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <OrderSelectionForm onSubmit={onOrderFormSubmit} />
      
      {(orderNumber || volumes.length > 0) && (
        <>
          {/* Configuração do Layout */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Configuração do Layout</h3>
                <p className="text-sm text-gray-600">Configure o número de linhas (paletes) do veículo</p>
              </div>
              <div className="flex items-center space-x-4">
                <label htmlFor="numeroLinhas" className="text-sm font-medium text-gray-700">
                  Número de Linhas:
                </label>
                <input
                  id="numeroLinhas"
                  type="number"
                  min="1"
                  max="50"
                  value={numeroLinhas}
                  onChange={(e) => onUpdateLinhas(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-500">linhas</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <VolumeFilterSection onFilter={onFilter} />
              <VolumeList 
                volumes={volumesFiltrados}
                selecionados={selecionados}
                onSelectionToggle={onSelectionToggle}
                onSelectAll={onSelectAll}
              />
            </div>
            
            <div className="lg:col-span-2">
              <TruckLayoutGrid 
                orderNumber={orderNumber || 'ORD-2025-001'}
                layout={caminhaoLayout}
                totalVolumes={volumes.length}
                positionedVolumes={volumes.filter(v => v.posicao).length}
                onCellClick={onCellClick}
                onRemoveVolume={onRemoveVolume}
                hasSelectedVolumes={hasSelectedVolumes}
                onSaveLayout={onSaveLayout}
                allVolumesPositioned={allVolumesPositioned}
                onPrintLayout={handlePrintLayout}
              />
              <InstructionsCard />
            </div>
          </div>
        </>
      )}
      
      {(orderNumber || volumes.length > 0) && (
        <PrintLayoutModal
          open={printModalOpen}
          onOpenChange={setPrintModalOpen}
          orderNumber={orderNumber || 'ORD-2025-001'}
          layoutRef={layoutRef}
        />
      )}
    </div>
  );
};

export default CarregamentoLayout;
