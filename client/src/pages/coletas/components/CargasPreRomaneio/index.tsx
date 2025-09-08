
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Carga } from '../../types/coleta.types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Archive, Package, Calculator, MapPin, SortDesc, Trash2, Truck, Route, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchFilter from '@/components/common/SearchFilter';
import { filterConfig } from './filterConfig';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AlocacaoModal from '../AlocacaoModal';
import RoteirizacaoModal from '../RoteirizacaoModal';
import MapaRotaModal from '../MapaRotaModal';
import { toast } from '@/hooks/use-toast';

interface CargasPreRomaneioProps {
  cargas: Carga[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onAlocar?: (cargasIds: string[], motoristaId: string, motoristaName: string, veiculoId: string, veiculoName: string) => void;
  onRemoverDoPreRomaneio?: (cargasIds: string[]) => void;
}

const CargasPreRomaneio: React.FC<CargasPreRomaneioProps> = ({ 
  cargas, 
  currentPage, 
  setCurrentPage,
  onAlocar,
  onRemoverDoPreRomaneio
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCargasIds, setSelectedCargasIds] = useState<string[]>([]);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isAlocacaoModalOpen, setIsAlocacaoModalOpen] = useState(false);
  const [isRoteirizacaoModalOpen, setIsRoteirizacaoModalOpen] = useState(false);
  const [isMapaRotaModalOpen, setIsMapaRotaModalOpen] = useState(false);
  
  // Filter cargas by search value
  const filteredCargas = useMemo(() => {
    if (!searchValue) return cargas;
    
    const searchLower = searchValue.toLowerCase();
    return cargas.filter(carga => 
      carga.id.toLowerCase().includes(searchLower) || 
      carga.destino.toLowerCase().includes(searchLower) ||
      carga.origem?.toLowerCase().includes(searchLower)
    );
  }, [cargas, searchValue]);
  
  // Group cargas by grupoRota
  const groupedCargas = useMemo(() => {
    const groups: Record<string, Carga[]> = {};
    
    filteredCargas.forEach(carga => {
      if (!carga.grupoRota) {
        // Se não tiver grupo, cria um grupo baseado no CEP
        if (!carga.cep) return;
        
        const cepRegion = carga.cep.substring(0, 3);
        const groupName = `Região ${cepRegion}xx-xxx`;
        
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        
        groups[groupName].push(carga);
      } else {
        // Se tiver grupo, usa o grupo existente
        if (!groups[carga.grupoRota]) {
          groups[carga.grupoRota] = [];
        }
        
        groups[carga.grupoRota].push(carga);
      }
    });
    
    return groups;
  }, [filteredCargas]);
  
  // Calculate total volume and weight for each group
  const groupTotals = useMemo(() => {
    const totals: Record<string, { totalVolumes: number, totalPeso: number, totalM3: number }> = {};
    
    Object.entries(groupedCargas).forEach(([groupName, cargas]) => {
      totals[groupName] = cargas.reduce((acc, carga) => {
        return {
          totalVolumes: acc.totalVolumes + carga.volumes,
          totalPeso: acc.totalPeso + parseFloat(carga.peso.replace('kg', '').trim()),
          totalM3: acc.totalM3 + (carga.volumeM3 || 0)
        };
      }, { totalVolumes: 0, totalPeso: 0, totalM3: 0 });
    });
    
    return totals;
  }, [groupedCargas]);
  
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };
  
  const toggleSelectCargasInGroup = (groupName: string, select: boolean) => {
    const cargasIdsInGroup = groupedCargas[groupName].map(carga => carga.id);
    
    if (select) {
      // Adicionar todas as cargas do grupo à seleção
      setSelectedCargasIds(prev => {
        const newSelection = [...prev];
        cargasIdsInGroup.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    } else {
      // Remover todas as cargas do grupo da seleção
      setSelectedCargasIds(prev => 
        prev.filter(id => !cargasIdsInGroup.includes(id))
      );
    }
  };
  
  const isGroupSelected = (groupName: string) => {
    const cargasIdsInGroup = groupedCargas[groupName].map(carga => carga.id);
    return cargasIdsInGroup.every(id => selectedCargasIds.includes(id));
  };
  
  const toggleSelectCarga = (cargaId: string) => {
    setSelectedCargasIds(prev => 
      prev.includes(cargaId) 
        ? prev.filter(id => id !== cargaId) 
        : [...prev, cargaId]
    );
  };
  
  const handleRemoverDoPreRomaneio = () => {
    if (onRemoverDoPreRomaneio && selectedCargasIds.length > 0) {
      onRemoverDoPreRomaneio(selectedCargasIds);
      setSelectedCargasIds([]);
      setIsRemoveDialogOpen(false);
    }
  };
  
  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <SearchFilter
            placeholder="Buscar por destino, origem ou número da coleta..."
            onSearch={handleSearch}
            filters={filterConfig}
          />
          
          <div className="flex gap-2">
            {selectedCargasIds.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsRemoveDialogOpen(true)}
                  className="text-red-500 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remover do Pré-Romaneio
                </Button>
                
                <Button 
                  size="sm"
                  onClick={() => setIsAlocacaoModalOpen(true)}
                >
                  <Truck className="h-4 w-4 mr-2" /> Alocar Motorista
                </Button>
              </>
            )}
          </div>
        </div>
      
        {Object.keys(groupedCargas).length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <Archive className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p>Nenhuma carga encontrada para pré-romaneio</p>
              <p className="text-sm text-muted-foreground mt-2">As cargas aparecerão aqui quando forem agrupadas em pré-romaneio.</p>
            </CardContent>
          </Card>
        )}
        
        {Object.entries(groupedCargas).map(([groupName, groupCargas]) => (
          <Card key={groupName} className="mb-4">
            <CardHeader className="py-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={isGroupSelected(groupName)}
                  onCheckedChange={(checked) => toggleSelectCargasInGroup(groupName, !!checked)}
                  className="mr-1"
                />
                <Archive className="h-5 w-5" />
                <CardTitle className="text-lg">
                  {groupName.startsWith('PR-') ? `Pré-Romaneio #${groupName.substring(3)}` : groupName}
                </CardTitle>
                <Badge variant="outline" className="ml-2">
                  {groupCargas.length} cargas
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-1" />
                  <span>{groupTotals[groupName].totalVolumes} volumes</span>
                </div>
                <div className="flex items-center">
                  <Calculator className="h-4 w-4 mr-1" />
                  <span>{groupTotals[groupName].totalM3.toFixed(2)} m³</span>
                </div>
                <div>
                  {groupTotals[groupName].totalPeso.toFixed(2)} kg
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-muted-foreground bg-muted/50">
                    <tr>
                      <th className="p-2 text-left w-[40px]"></th>
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Destino</th>
                      <th className="p-2 text-left">CEP</th>
                      <th className="p-2 text-center">Volumes</th>
                      <th className="p-2 text-center">Peso</th>
                      <th className="p-2 text-center">M³</th>
                      <th className="p-2 text-left">Veículo Sugerido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {groupCargas.map((carga) => (
                      <tr key={carga.id} className="hover:bg-muted/30">
                        <td className="p-2">
                          <Checkbox 
                            checked={selectedCargasIds.includes(carga.id)}
                            onCheckedChange={() => toggleSelectCarga(carga.id)}
                          />
                        </td>
                        <td className="p-2 font-medium">{carga.id}</td>
                        <td className="p-2">{carga.destino}</td>
                        <td className="p-2">{carga.cep || "—"}</td>
                        <td className="p-2 text-center">{carga.volumes}</td>
                        <td className="p-2 text-center">{carga.peso}</td>
                        <td className="p-2 text-center">{carga.volumeM3?.toFixed(2) || "—"} m³</td>
                        <td className="p-2">
                          {carga.tipoVeiculo ? (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <Truck className="h-3 w-3" />
                              {carga.tipoVeiculo}
                            </Badge>
                          ) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">Total: </span>
                  <span className="text-sm">{groupCargas.length} cargas • {groupTotals[groupName].totalVolumes} volumes • {groupTotals[groupName].totalM3.toFixed(2)} m³ • {groupTotals[groupName].totalPeso.toFixed(2)} kg</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toggleSelectCargasInGroup(groupName, true);
                      setIsRoteirizacaoModalOpen(true);
                    }}
                    className="flex items-center"
                  >
                    <Route className="h-4 w-4 mr-2" /> Roteirizar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toggleSelectCargasInGroup(groupName, true);
                      setIsMapaRotaModalOpen(true);
                    }}
                  >
                    <Map className="h-4 w-4 mr-2" /> Ver no Mapa
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Impressão iniciada",
                        description: "Pré-Romaneio enviado para impressão."
                      });
                    }}
                  >
                    Imprimir Pré-Romaneio
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover do Pré-Romaneio?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a remover {selectedCargasIds.length} carga(s) do pré-romaneio. 
              Elas voltarão para a lista de cargas pendentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleRemoverDoPreRomaneio}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlocacaoModal
        isOpen={isAlocacaoModalOpen}
        onClose={() => setIsAlocacaoModalOpen(false)}
        cargas={cargas.filter(carga => selectedCargasIds.includes(carga.id))}
        onConfirm={(cargasIds, motoristaId, motoristaName, veiculoId, veiculoName) => {
          if (onAlocar) {
            onAlocar(selectedCargasIds, motoristaId, motoristaName, veiculoId, veiculoName);
          }
          setIsAlocacaoModalOpen(false);
          setSelectedCargasIds([]);
        }}
      />
      
      <RoteirizacaoModal
        isOpen={isRoteirizacaoModalOpen}
        onClose={() => setIsRoteirizacaoModalOpen(false)}
        cargas={cargas.filter(carga => selectedCargasIds.includes(carga.id))}
      />
      
      <MapaRotaModal
        isOpen={isMapaRotaModalOpen}
        onClose={() => setIsMapaRotaModalOpen(false)}
        motorista={null}
        cargas={cargas.filter(carga => selectedCargasIds.includes(carga.id))}
      />
    </>
  );
};

export default CargasPreRomaneio;
