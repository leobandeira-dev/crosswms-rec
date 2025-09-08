
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useVolumePreparation, VolumeData } from "@/hooks/etiquetas/useVolumePreparation";

// Interface for volume data - Let's make this compatible with VolumeData
export interface Volume extends VolumeData {
  id: string;
  tipo: string;
  descricao: string;
  peso?: string;
  dimensoes?: string;
  notaFiscal: string;
  endereco: string | null;
  etiquetaMae?: string | null;
}

// Interface for endereco data
export interface Endereco {
  endereco: string;
  tipo: string;
  capacidade: string;
  disponivel: boolean;
}

export const useEnderecamentoVolumes = () => {
  const { toast } = useToast();
  const { prepareVolume } = useVolumePreparation();
  
  // Mock data with all required fields from Volume type
  const initialVolumesParaEnderecar = [
    { 
      id: 'VOL-2023-001', 
      tipo: 'Volume', 
      descricao: 'Caixa 30x20x15', 
      notaFiscal: '12345', 
      endereco: null, 
      etiquetaMae: 'ETM-001', 
      quantidade: 1, 
      etiquetado: true,
      remetente: 'Fornecedor A',
      destinatario: 'Destinatário A',
      cidade: 'São Paulo',
      cidadeCompleta: 'São Paulo - SP',
      uf: 'SP',
      pesoTotal: '10 Kg',
      chaveNF: 'chave-nf-12345',
      tipoVolume: 'geral' as 'geral' | 'quimico',
      transportadora: 'Transportadora A'
    },
    { 
      id: 'VOL-2023-002', 
      tipo: 'Volume', 
      descricao: 'Caixa 40x30x25', 
      notaFiscal: '12345', 
      endereco: null, 
      etiquetaMae: 'ETM-001', 
      quantidade: 1, 
      etiquetado: true,
      remetente: 'Fornecedor A',
      destinatario: 'Destinatário A',
      cidade: 'São Paulo',
      cidadeCompleta: 'São Paulo - SP',
      uf: 'SP',
      pesoTotal: '15 Kg',
      chaveNF: 'chave-nf-12345',
      tipoVolume: 'geral' as 'geral' | 'quimico',
      transportadora: 'Transportadora A'
    },
    { 
      id: 'VOL-2023-003', 
      tipo: 'Volume', 
      descricao: 'Caixa 10x10x10', 
      notaFiscal: '54321', 
      endereco: null, 
      etiquetaMae: 'ETM-002', 
      quantidade: 1, 
      etiquetado: true,
      remetente: 'Fornecedor B',
      destinatario: 'Destinatário B',
      cidade: 'Rio de Janeiro',
      cidadeCompleta: 'Rio de Janeiro - RJ',
      uf: 'RJ',
      pesoTotal: '5 Kg',
      chaveNF: 'chave-nf-54321',
      tipoVolume: 'geral' as 'geral' | 'quimico',
      transportadora: 'Transportadora B'
    },
    { 
      id: 'PAL-2023-001', 
      tipo: 'Palete', 
      descricao: 'Palete Standard', 
      notaFiscal: 'Múltiplas', 
      endereco: 'A-01-02-03', 
      etiquetaMae: null, 
      quantidade: 1, 
      etiquetado: true,
      remetente: 'Múltiplos',
      destinatario: 'Múltiplos',
      cidade: 'São Paulo',
      cidadeCompleta: 'São Paulo - SP',
      uf: 'SP',
      pesoTotal: '100 Kg',
      chaveNF: 'multiplas',
      tipoVolume: 'geral' as 'geral' | 'quimico',
      transportadora: 'Transportadora C'
    },
  ];
  
  const enderecosDisponiveis = [
    { endereco: 'A-01-01-01', tipo: 'Prateleira', capacidade: 'Média', disponivel: true },
    { endereco: 'A-01-01-02', tipo: 'Prateleira', capacidade: 'Média', disponivel: true },
    { endereco: 'A-01-01-03', tipo: 'Prateleira', capacidade: 'Média', disponivel: false },
    { endereco: 'A-01-02-01', tipo: 'Piso', capacidade: 'Alta', disponivel: true },
    { endereco: 'A-01-02-02', tipo: 'Piso', capacidade: 'Alta', disponivel: true },
    { endereco: 'A-01-02-03', tipo: 'Piso', capacidade: 'Alta', disponivel: false },
  ];

  const [volumesParaEnderecar, setVolumesParaEnderecar] = useState<Volume[]>(initialVolumesParaEnderecar);
  const [volumesEndereçados, setVolumesEndereçados] = useState<Volume[]>(initialVolumesParaEnderecar.filter(v => v.endereco !== null));
  const [filteredVolumes, setFilteredVolumes] = useState<Volume[]>(initialVolumesParaEnderecar.filter(v => v.endereco === null));
  const [selectedVolumes, setSelectedVolumes] = useState<Volume[]>([]);
  const [selectedEndereco, setSelectedEndereco] = useState<string | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedVolumeForPrint, setSelectedVolumeForPrint] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'id' | 'notaFiscal' | 'etiquetaMae'>('id');
  const volumeRef = useRef<HTMLDivElement>(null);
  
  const handlePrintClick = (volumeId: string) => {
    setSelectedVolumeForPrint(volumeId);
    setPrintModalOpen(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredVolumes(volumesParaEnderecar.filter(v => v.endereco === null));
      return;
    }

    const lowerTerm = term.toLowerCase();
    let filtered;
    
    switch (searchType) {
      case 'id':
        filtered = volumesParaEnderecar.filter(v => 
          v.endereco === null && v.id.toLowerCase().includes(lowerTerm)
        );
        break;
      case 'notaFiscal':
        filtered = volumesParaEnderecar.filter(v => 
          v.endereco === null && v.notaFiscal.toLowerCase().includes(lowerTerm)
        );
        break;
      case 'etiquetaMae':
        filtered = volumesParaEnderecar.filter(v => 
          v.endereco === null && v.etiquetaMae && v.etiquetaMae.toLowerCase().includes(lowerTerm)
        );
        break;
      default:
        filtered = volumesParaEnderecar.filter(v => v.endereco === null);
    }
    
    setFilteredVolumes(filtered);
    // Auto-select volumes for batch processing if searching by nota fiscal or etiqueta mãe
    if (searchType !== 'id' && filtered.length > 0) {
      setSelectedVolumes(filtered);
    }
  };

  const handleVolumeSelect = (volume: Volume) => {
    // Select or deselect a volume
    if (selectedVolumes.find(v => v.id === volume.id)) {
      setSelectedVolumes(selectedVolumes.filter(v => v.id !== volume.id));
    } else {
      setSelectedVolumes([...selectedVolumes, volume]);
    }
  };

  const handleSearchTypeChange = (type: 'id' | 'notaFiscal' | 'etiquetaMae') => {
    setSearchType(type);
    if (searchTerm) {
      handleSearch(searchTerm); // Re-run search with new type
    }
  };

  const handleConfirmEndereçamento = async () => {
    if (!selectedEndereco || selectedVolumes.length === 0) return;

    try {
      // Process each volume through useVolumePreparation
      for (const volume of selectedVolumes) {
        // Convert Volume to VolumeData - no conversion needed now that Volume extends VolumeData
        await prepareVolume(volume);
      }
      
      // Update volumes with new endereco
      const updatedVolumes = volumesParaEnderecar.map(volume => {
        if (selectedVolumes.some(sv => sv.id === volume.id)) {
          return { ...volume, endereco: selectedEndereco };
        }
        return volume;
      });

      setVolumesParaEnderecar(updatedVolumes);
      
      // Update endereçados list
      const newlyEndereçados = selectedVolumes.map(sv => ({
        ...sv, endereco: selectedEndereco
      }));
      
      setVolumesEndereçados([...volumesEndereçados, ...newlyEndereçados]);
      
      // Update filtered list
      setFilteredVolumes(updatedVolumes.filter(v => v.endereco === null));
      
      // Clear selection
      setSelectedVolumes([]);
      setSelectedEndereco(null);
      
      // Show success message
      toast({
        title: "Endereçamento salvo",
        description: `${selectedVolumes.length} volume(s) endereçado(s) com sucesso em ${selectedEndereco}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao endereçar volume",
        description: "Ocorreu um erro ao endereçar os volumes. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return {
    volumesParaEnderecar,
    volumesEndereçados,
    filteredVolumes,
    selectedVolumes,
    selectedEndereco,
    printModalOpen,
    selectedVolumeForPrint,
    confirmDialogOpen,
    searchTerm,
    searchType,
    volumeRef,
    enderecosDisponiveis,
    
    setSelectedVolumes,
    setSelectedEndereco,
    setPrintModalOpen,
    setSelectedVolumeForPrint,
    setConfirmDialogOpen,
    setSearchTerm,
    
    handlePrintClick,
    handleSearch,
    handleVolumeSelect,
    handleSearchTypeChange,
    handleConfirmEndereçamento
  };
};
