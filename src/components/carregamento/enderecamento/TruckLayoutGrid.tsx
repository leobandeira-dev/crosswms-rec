
import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Printer, Package, FileText } from 'lucide-react';
import TruckCell from './TruckCell';
import LayoutPDFGenerator from './LayoutPDFGenerator';
import VolumeSelectionModal from './VolumeSelectionModal';

interface Volume {
  id: string;
  codigo: string;
  notaFiscal: string;
  produto: string;
  peso: string;
  dimensoes: string;
  fragil: boolean;
  posicaoAtual?: string;
  descricao: string;
  posicionado: boolean;
  etiquetaMae: string;
  fornecedor: string;
  quantidade: number;
  etiquetado: boolean;
}

interface CellLayout {
  id: string;
  coluna: 'esquerda' | 'centro' | 'direita';
  linha: number;
  volumes: Volume[];
}

interface TruckLayoutGridProps {
  orderNumber: string;
  layout: CellLayout[];
  totalVolumes: number;
  positionedVolumes: number;
  onCellClick: (cellId: string) => void;
  onRemoveVolume: (volumeId: string, cellId: string) => void;
  onAllocateVolumes: (volumeIds: string[], cellId: string) => void;
  hasSelectedVolumes: boolean;
  onSaveLayout: () => void;
  allVolumesPositioned: boolean;
  onPrintLayout: () => void;
  numeroLinhas: number;
  availableVolumes: Volume[];
}

const TruckLayoutGrid: React.FC<TruckLayoutGridProps> = ({
  orderNumber,
  layout,
  totalVolumes,
  positionedVolumes,
  onCellClick,
  onRemoveVolume,
  onAllocateVolumes,
  hasSelectedVolumes,
  onSaveLayout,
  allVolumesPositioned,
  onPrintLayout,
  numeroLinhas,
  availableVolumes
}) => {
  // Agrupar o layout por linhas para exibição
  const maxLinhas = Math.max(...layout.map(c => c.linha), 1);
  const layoutPorLinhas = Array.from({ length: maxLinhas }, (_, i) => {
    const linha = i + 1;
    return {
      linha,
      celulas: layout.filter(c => c.linha === linha)
    };
  });
  
  // Referência para o layout que será usado para impressão
  const layoutRef = useRef<HTMLDivElement>(null);
  const pdfGeneratorRef = useRef<any>(null);

  // Estado do modal de seleção de volumes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCellId, setSelectedCellId] = useState<string>('');
  const [selectedCellPosition, setSelectedCellPosition] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'layout' | 'notas'>('layout');

  // Função para agrupar volumes por nota fiscal
  const getNotasFiscaisData = () => {
    const notasMap = new Map();
    
    availableVolumes.forEach(volume => {
      const notaFiscal = volume.notaFiscal;
      if (!notasMap.has(notaFiscal)) {
        notasMap.set(notaFiscal, {
          notaFiscal,
          fornecedor: volume.fornecedor || 'N/A',
          volumes: [],
          totalVolumes: 0,
          volumesAlocados: 0,
          volumesNaoAlocados: 0
        });
      }
      
      const nota = notasMap.get(notaFiscal);
      nota.volumes.push(volume);
      nota.totalVolumes++;
      
      if (volume.posicao) {
        nota.volumesAlocados++;
      } else {
        nota.volumesNaoAlocados++;
      }
    });
    
    return Array.from(notasMap.values()).sort((a, b) => a.notaFiscal.localeCompare(b.notaFiscal));
  };

  // Função para gerar PDF
  const handlePrintPDF = () => {
    console.log('handlePrintPDF chamada');
    console.log('pdfGeneratorRef.current:', pdfGeneratorRef.current);
    if (pdfGeneratorRef.current) {
      pdfGeneratorRef.current.generatePDF();
    } else {
      console.error('pdfGeneratorRef.current é null');
    }
  };

  // Função para abrir modal de seleção de volumes
  const handleOpenVolumeSelection = (cellId: string, cellPosition: string) => {
    setSelectedCellId(cellId);
    setSelectedCellPosition(cellPosition);
    setIsModalOpen(true);
  };

  // Função para fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCellId('');
    setSelectedCellPosition('');
  };

  // Função para obter volumes alocados na célula selecionada
  const getAllocatedVolumes = (): Volume[] => {
    if (!selectedCellId) return [];
    const cell = layout.find(c => c.id === selectedCellId);
    return cell ? cell.volumes : [];
  };
  
  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg flex items-center">
            <Truck className="mr-2 text-cross-blue" size={20} />
            Layout do Caminhão
          </CardTitle>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('layout')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'layout'
                  ? 'bg-white text-cross-blue shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Package className="mr-2 h-4 w-4" />
              Visão por Células
            </button>
            <button
              onClick={() => setActiveTab('notas')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'notas'
                  ? 'bg-white text-cross-blue shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="mr-2 h-4 w-4" />
              Notas Fiscais
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'layout' ? (
          <div className="border rounded-md p-4 bg-gray-50" ref={layoutRef}>
            <div className="flex justify-between mb-4">
              <div>
                <span className="text-sm font-medium">OC: {orderNumber}</span>
              </div>
              <div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {positionedVolumes} / {totalVolumes} volumes posicionados
                </span>
              </div>
            </div>
            
            <div className="mb-2 overflow-x-auto">
              {/* Cabeçalho */}
              <div className="flex w-full min-w-[800px] mb-3 text-center font-bold text-lg border-b-2 border-gray-300 pb-3 bg-gray-50 rounded-t-lg">
                <div className="w-[80px] py-2">Linha</div>
                <div className="flex-1 py-2">Esquerda</div>
                <div className="flex-1 py-2">Centro</div>
                <div className="flex-1 py-2">Direita</div>
              </div>

              {/* Layout */}
              <div className="max-h-[70vh] overflow-y-auto">
                {layoutPorLinhas.map(linha => (
                  <div key={linha.linha} className="flex w-full min-w-[800px] mb-2 border-b pb-2">
                    <div className="w-[80px] flex items-center justify-center font-bold text-lg border-r bg-gray-50">
                      {linha.linha}
                    </div>
                    
                    {linha.celulas.map(celula => (
                      <TruckCell
                        key={celula.id}
                        id={celula.id}
                        volumes={celula.volumes}
                        hasSelectedVolumes={hasSelectedVolumes}
                        onClick={() => onCellClick(celula.id)}
                        onRemoveVolume={onRemoveVolume}
                        onOpenVolumeSelection={handleOpenVolumeSelection}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-md p-4 bg-gray-50">
            <div className="flex justify-between mb-4">
              <div>
                <span className="text-sm font-medium">OC: {orderNumber}</span>
              </div>
              <div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {positionedVolumes} / {totalVolumes} volumes posicionados
                </span>
              </div>
            </div>
            
            {/* Tabela de Notas Fiscais */}
            <div className="bg-white rounded-lg border overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Resumo por Nota Fiscal</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nota Fiscal</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fornecedor</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Total Volumes</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Alocados</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Não Alocados</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getNotasFiscaisData().map((nota, index) => (
                      <tr key={nota.notaFiscal} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-blue-600">
                          {nota.notaFiscal}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <div className="max-w-xs truncate" title={nota.fornecedor}>
                            {nota.fornecedor}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                          {nota.totalVolumes}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-green-600">
                          {nota.volumesAlocados}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-red-600">
                          {nota.volumesNaoAlocados}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {nota.volumesNaoAlocados === 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Completa
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              ⚠ Pendente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end gap-4">
          <Button 
            variant="outline"
            onClick={() => {
              console.log('Botão Imprimir clicado');
              handlePrintPDF();
            }}
            size="lg"
            className="h-12 px-6 text-base font-semibold"
          >
            <Printer className="mr-2 h-5 w-5" />
            Imprimir
          </Button>
          <Button 
            className="bg-cross-blue hover:bg-cross-blue/90"
            disabled={!allVolumesPositioned}
            onClick={onSaveLayout}
            size="lg"
            className="h-12 px-8 text-base font-semibold"
          >
            Salvar Layout
          </Button>
        </div>
      </CardContent>

    </Card>
    
      {/* Gerador de PDF */}
      <LayoutPDFGenerator
        ref={pdfGeneratorRef}
        orderNumber={orderNumber}
        layout={layout}
        numeroLinhas={numeroLinhas}
        onPrintComplete={() => {
          console.log('PDF gerado com sucesso');
        }}
      />

      {/* Modal de Seleção de Volumes */}
      <VolumeSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        cellId={selectedCellId}
        cellPosition={selectedCellPosition}
        availableVolumes={availableVolumes}
        allocatedVolumes={getAllocatedVolumes()}
        onAllocateVolumes={onAllocateVolumes}
        onRemoveVolume={onRemoveVolume}
      />
    </>
  );
};

export default TruckLayoutGrid;
