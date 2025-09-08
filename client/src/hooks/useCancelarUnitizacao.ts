
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

// Define types for the palete data
export interface PaleteUnitizado {
  id: string;
  volumes: number;
  produtos: string;
  dataUnitizacao: string;
  responsavel: string;
  itens?: {
    codigo: string;
    descricao: string;
    quantidade: number;
  }[];
}

export const useCancelarUnitizacao = () => {
  // State for the paletes data
  const [paletesUnitizados, setPaletesUnitizados] = useState<PaleteUnitizado[]>([
    { 
      id: 'PAL-2023-001', 
      volumes: 12, 
      produtos: 'Diversos', 
      dataUnitizacao: '12/05/2023', 
      responsavel: 'João Silva',
      itens: [
        { codigo: 'VOL-001', descricao: 'Caixa Eletrônicos', quantidade: 3 },
        { codigo: 'VOL-002', descricao: 'Caixa Acessórios', quantidade: 5 },
        { codigo: 'VOL-003', descricao: 'Caixa Material Escritório', quantidade: 4 },
      ]
    },
    { 
      id: 'PAL-2023-002', 
      volumes: 8, 
      produtos: 'Eletrônicos', 
      dataUnitizacao: '11/05/2023', 
      responsavel: 'Maria Oliveira',
      itens: [
        { codigo: 'VOL-004', descricao: 'Notebook Dell', quantidade: 2 },
        { codigo: 'VOL-005', descricao: 'Monitor Samsung', quantidade: 4 },
        { codigo: 'VOL-006', descricao: 'Teclado sem fio', quantidade: 2 },
      ]
    },
    { 
      id: 'PAL-2023-003', 
      volumes: 15, 
      produtos: 'Material de Escritório', 
      dataUnitizacao: '10/05/2023', 
      responsavel: 'Carlos Santos',
      itens: [
        { codigo: 'VOL-007', descricao: 'Resma de Papel A4', quantidade: 10 },
        { codigo: 'VOL-008', descricao: 'Canetas Esferográficas', quantidade: 3 },
        { codigo: 'VOL-009', descricao: 'Grampeadores', quantidade: 2 },
      ]
    },
  ]);

  // State for selected palete details
  const [selectedPalete, setSelectedPalete] = useState<PaleteUnitizado | null>(null);
  
  // Dialogs open states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Filter state
  const [filterValue, setFilterValue] = useState("");

  // Handler for showing details
  const handleShowDetails = (paleteId: string) => {
    const palete = paletesUnitizados.find(p => p.id === paleteId);
    if (palete) {
      setSelectedPalete(palete);
      setDetailsDialogOpen(true);
    }
  };

  // Handler for cancel operation
  const handleCancelUnitizacao = (paleteId: string) => {
    const palete = paletesUnitizados.find(p => p.id === paleteId);
    if (palete) {
      setSelectedPalete(palete);
      setCancelDialogOpen(true);
    }
  };

  // Handler to confirm cancellation
  const confirmCancelUnitizacao = () => {
    if (selectedPalete) {
      setPaletesUnitizados(paletesUnitizados.filter(p => p.id !== selectedPalete.id));
      toast({
        title: "Unitização cancelada",
        description: `A unitização do palete ${selectedPalete.id} foi cancelada com sucesso.`,
      });
      setCancelDialogOpen(false);
      setSelectedPalete(null);
    }
  };

  // Filter paletes based on search value
  const filteredPaletes = filterValue.trim() === "" 
    ? paletesUnitizados 
    : paletesUnitizados.filter(p => 
        p.id.toLowerCase().includes(filterValue.toLowerCase()) || 
        p.responsavel.toLowerCase().includes(filterValue.toLowerCase())
      );

  // Handler for search input changes
  const handleFilterChange = (value: string) => {
    setFilterValue(value);
  };

  // Handler for search by ID
  const handleSearchById = (id: string) => {
    if (!id.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, digite o ID do palete para buscar.",
        variant: "destructive",
      });
      return;
    }

    const palete = paletesUnitizados.find(p => p.id.toLowerCase() === id.toLowerCase());
    if (palete) {
      setFilterValue(id);
      toast({
        title: "Palete encontrado",
        description: `O palete ${id} foi encontrado.`,
      });
    } else {
      toast({
        title: "Palete não encontrado",
        description: `Não foi possível encontrar um palete com o ID: ${id}`,
        variant: "destructive",
      });
    }
  };

  return {
    paletesUnitizados,
    filteredPaletes,
    selectedPalete,
    detailsDialogOpen,
    setDetailsDialogOpen,
    cancelDialogOpen,
    setCancelDialogOpen,
    filterValue,
    handleFilterChange,
    handleShowDetails,
    handleCancelUnitizacao,
    confirmCancelUnitizacao,
    handleSearchById,
  };
};
