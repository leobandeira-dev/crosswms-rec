import { useState, useCallback, useEffect } from 'react';
import { StatusType } from '@/components/common/StatusIndicator';

export interface InventoryItem {
  id: string;
  codigo: string;
  descricao: string;
  area: string;
  status: StatusType;
  prioridade: StatusType;
  tipo: StatusType;
  quantidade: number;
  dataUltimaAtualizacao: Date;
  temperaturaRequired?: boolean;
  dataVencimento?: Date;
  observacoes?: string;
}

export interface AreaStatus {
  id: string;
  nome: string;
  status: StatusType;
  capacidadeTotal: number;
  capacidadeUtilizada: number;
  temperaturaAtual?: number;
  temperaturaIdeal?: { min: number; max: number };
  itensArmazenados: number;
  ultimaMovimentacao: Date;
}

export const useInventoryStatus = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [areas, setAreas] = useState<AreaStatus[]>([]);
  const [filters, setFilters] = useState({
    status: [] as StatusType[],
    prioridade: [] as StatusType[],
    tipo: [] as StatusType[],
    area: ''
  });

  // Initialize sample data for demonstration
  useEffect(() => {
    const sampleAreas: AreaStatus[] = [
      {
        id: '01',
        nome: 'Área 01',
        status: 'disponivel',
        capacidadeTotal: 100,
        capacidadeUtilizada: 75,
        itensArmazenados: 45,
        ultimaMovimentacao: new Date('2025-06-10T08:30:00')
      },
      {
        id: '02',
        nome: 'Área 02',
        status: 'ocupado',
        capacidadeTotal: 80,
        capacidadeUtilizada: 80,
        itensArmazenados: 32,
        ultimaMovimentacao: new Date('2025-06-10T09:15:00')
      },
      {
        id: '03',
        nome: 'Área 03',
        status: 'manutencao',
        capacidadeTotal: 120,
        capacidadeUtilizada: 0,
        itensArmazenados: 0,
        ultimaMovimentacao: new Date('2025-06-09T14:20:00')
      },
      {
        id: '04',
        nome: 'Área 04 - Produtos Perigosos',
        status: 'disponivel',
        capacidadeTotal: 50,
        capacidadeUtilizada: 20,
        itensArmazenados: 8,
        ultimaMovimentacao: new Date('2025-06-10T07:45:00')
      },
      {
        id: '05',
        nome: 'Área 05 - Refrigerada',
        status: 'disponivel',
        capacidadeTotal: 60,
        capacidadeUtilizada: 35,
        temperaturaAtual: 4,
        temperaturaIdeal: { min: 2, max: 8 },
        itensArmazenados: 15,
        ultimaMovimentacao: new Date('2025-06-10T06:30:00')
      }
    ];

    const sampleItems: InventoryItem[] = [
      {
        id: '1',
        codigo: '11340-001-001',
        descricao: 'Volume 1/62 - NF 11340',
        area: '01',
        status: 'armazenada',
        prioridade: 'normal',
        tipo: 'normal',
        quantidade: 1,
        dataUltimaAtualizacao: new Date('2025-06-10T08:30:00')
      },
      {
        id: '2',
        codigo: '11340-001-002',
        descricao: 'Volume 2/62 - NF 11340 (Produto Químico)',
        area: '04',
        status: 'armazenada',
        prioridade: 'urgente',
        tipo: 'produto_perigoso',
        quantidade: 1,
        dataUltimaAtualizacao: new Date('2025-06-10T07:45:00'),
        observacoes: 'Produto químico - Classe 3'
      },
      {
        id: '3',
        codigo: '11341-001-001',
        descricao: 'Volume 1/15 - Material Frágil',
        area: '01',
        status: 'em_transito',
        prioridade: 'urgente',
        tipo: 'fragil',
        quantidade: 1,
        dataUltimaAtualizacao: new Date('2025-06-10T09:15:00')
      },
      {
        id: '4',
        codigo: '11342-001-001',
        descricao: 'Volume 1/8 - Produtos Perecíveis',
        area: '05',
        status: 'armazenada',
        prioridade: 'critico',
        tipo: 'perecivel',
        quantidade: 1,
        temperaturaRequired: true,
        dataVencimento: new Date('2025-06-15'),
        dataUltimaAtualizacao: new Date('2025-06-10T06:30:00')
      },
      {
        id: '5',
        codigo: '11343-001-001',
        descricao: 'Volume 1/25 - Expedição Pendente',
        area: '02',
        status: 'pendente',
        prioridade: 'normal',
        tipo: 'normal',
        quantidade: 1,
        dataUltimaAtualizacao: new Date('2025-06-10T08:00:00')
      }
    ];

    setAreas(sampleAreas);
    setInventoryItems(sampleItems);
  }, []);

  const updateItemStatus = useCallback((itemId: string, newStatus: StatusType) => {
    setInventoryItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: newStatus, dataUltimaAtualizacao: new Date() }
        : item
    ));
  }, []);

  const updateItemPriority = useCallback((itemId: string, newPriority: StatusType) => {
    setInventoryItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, prioridade: newPriority, dataUltimaAtualizacao: new Date() }
        : item
    ));
  }, []);

  const updateAreaStatus = useCallback((areaId: string, newStatus: StatusType) => {
    setAreas(prev => prev.map(area => 
      area.id === areaId 
        ? { ...area, status: newStatus, ultimaMovimentacao: new Date() }
        : area
    ));
  }, []);

  const getFilteredItems = useCallback(() => {
    return inventoryItems.filter(item => {
      const statusMatch = filters.status.length === 0 || filters.status.includes(item.status);
      const prioridadeMatch = filters.prioridade.length === 0 || filters.prioridade.includes(item.prioridade);
      const tipoMatch = filters.tipo.length === 0 || filters.tipo.includes(item.tipo);
      const areaMatch = !filters.area || item.area === filters.area;
      
      return statusMatch && prioridadeMatch && tipoMatch && areaMatch;
    });
  }, [inventoryItems, filters]);

  const getAreaById = useCallback((areaId: string) => {
    return areas.find(area => area.id === areaId);
  }, [areas]);

  const getItemsByArea = useCallback((areaId: string) => {
    return inventoryItems.filter(item => item.area === areaId);
  }, [inventoryItems]);

  const getCriticalItems = useCallback(() => {
    return inventoryItems.filter(item => 
      item.prioridade === 'critico' || 
      item.prioridade === 'urgente' ||
      item.tipo === 'produto_perigoso' ||
      (item.dataVencimento && new Date(item.dataVencimento) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days
    );
  }, [inventoryItems]);

  const getAreaUtilization = useCallback((areaId: string) => {
    const area = getAreaById(areaId);
    if (!area) return 0;
    return (area.capacidadeUtilizada / area.capacidadeTotal) * 100;
  }, [getAreaById]);

  const getStatusSummary = useCallback(() => {
    const summary = {
      total: inventoryItems.length,
      pendentes: inventoryItems.filter(item => item.status === 'pendente').length,
      em_transito: inventoryItems.filter(item => item.status === 'em_transito').length,
      armazenadas: inventoryItems.filter(item => item.status === 'armazenada').length,
      criticos: getCriticalItems().length,
      produtos_perigosos: inventoryItems.filter(item => item.tipo === 'produto_perigoso').length,
      areas_disponiveis: areas.filter(area => area.status === 'disponivel').length,
      areas_ocupadas: areas.filter(area => area.status === 'ocupado').length,
      areas_manutencao: areas.filter(area => area.status === 'manutencao').length
    };
    return summary;
  }, [inventoryItems, areas, getCriticalItems]);

  return {
    inventoryItems,
    areas,
    filters,
    setFilters,
    updateItemStatus,
    updateItemPriority,
    updateAreaStatus,
    getFilteredItems,
    getAreaById,
    getItemsByArea,
    getCriticalItems,
    getAreaUtilization,
    getStatusSummary
  };
};