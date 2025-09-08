
import React, { useState, useRef } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import TopNavbar from '../../../components/layout/TopNavbar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Package, 
  MapPin, 
  QrCode, 
  Printer, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Truck,
  Warehouse,
  BarChart3,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  Building,
  Navigation,
  Home,
  Layers,
  DoorOpen
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

interface Volume {
  id: string;
  tipo: 'Volume' | 'Palete' | 'Container';
  descricao: string;
  notaFiscal: string;
  endereco: string | null;
  etiquetaMae?: string | null;
  remetente: string;
  destinatario: string;
  cidade: string;
  uf: string;
  pesoTotal: string;
  dimensoes?: string;
  status: 'Aguardando' | 'Endereçado' | 'Movimentado';
  dataRecebimento: string;
  dataEndereçamento?: string;
  operador?: string;
  observacoes?: string;
}

interface Endereco {
  codigo: string;
  setor: string;
  corredor: string;
  prateleira: string;
  posicao: string;
  tipo: 'Piso' | 'Prateleira' | 'Mezanino' | 'Docas';
  capacidade: 'Baixa' | 'Média' | 'Alta';
  ocupacao: number;
  disponivel: boolean;
  restricoes?: string[];
  ultimaMovimentacao?: string;
  // Hierarchical structure
  filial?: string;
  rota?: string;
  rua?: string;
  bloco?: string;
  andar?: string;
  apartamento?: string;
}

interface Filial {
  id: string;
  nome: string;
  codigo: string;
  endereco: string;
  cidade: string;
  uf: string;
  ativa: boolean;
  rotas: Rota[];
  ruas: Rua[];
}

interface Rota {
  id: string;
  nome: string;
  codigo: string;
  descricao: string;
  ativa: boolean;
}

interface Rua {
  id: string;
  nome: string;
  codigo: string;
  blocos: Bloco[];
}

interface Bloco {
  id: string;
  nome: string;
  codigo: string;
  andares: Andar[];
}

interface Andar {
  id: string;
  numero: number;
  apartamentos: Apartamento[];
}

interface Apartamento {
  id: string;
  numero: string;
  codigo: string;
  tipo: 'Piso' | 'Prateleira' | 'Mezanino' | 'Docas';
  capacidade: 'Baixa' | 'Média' | 'Alta';
  restricoes?: string[];
  ativo: boolean;
}

const Enderecamento: React.FC = () => {
  const { toast } = useToast();
  
  // Estados principais
  const [activeTab, setActiveTab] = useState('enderecamento');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'volume' | 'notaFiscal' | 'endereco'>('volume');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [selectedVolumes, setSelectedVolumes] = useState<Volume[]>([]);
  const [selectedEndereco, setSelectedEndereco] = useState<Endereco | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedVolumeDetails, setSelectedVolumeDetails] = useState<Volume | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showBulkMoveDialog, setShowBulkMoveDialog] = useState(false);

  // Address management states
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showBulkApartmentDialog, setShowBulkApartmentDialog] = useState(false);
  const [addressDialogMode, setAddressDialogMode] = useState<'filial' | 'rota' | 'rua' | 'bloco' | 'andar' | 'apartamento'>('filial');
  const [selectedFilial, setSelectedFilial] = useState<Filial | null>(null);
  const [selectedRua, setSelectedRua] = useState<Rua | null>(null);
  const [selectedBloco, setSelectedBloco] = useState<Bloco | null>(null);
  const [selectedAndar, setSelectedAndar] = useState<Andar | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [newAddressForm, setNewAddressForm] = useState({
    nome: '',
    codigo: '',
    descricao: '',
    tipo: 'Prateleira' as 'Piso' | 'Prateleira' | 'Mezanino' | 'Docas',
    capacidade: 'Média' as 'Baixa' | 'Média' | 'Alta',
    restricoes: [] as string[],
    endereco: '',
    cidade: '',
    uf: '',
    numero: 1
  });
  
  // Bulk apartment creation
  const [bulkApartmentForm, setBulkApartmentForm] = useState({
    startNumber: 1,
    endNumber: 10,
    prefix: '',
    tipo: 'Prateleira' as 'Piso' | 'Prateleira' | 'Mezanino' | 'Docas',
    capacidade: 'Média' as 'Baixa' | 'Média' | 'Alta',
    restricoes: [] as string[]
  });

  // Dados mockados para demonstração
  const [volumes, setVolumes] = useState<Volume[]>([
    {
      id: 'VOL-001-2024',
      tipo: 'Volume',
      descricao: 'Caixa papelão 40x30x25cm',
      notaFiscal: 'NF-12345',
      endereco: null,
      etiquetaMae: 'ETM-001',
      remetente: 'Fornecedor ABC Ltda',
      destinatario: 'Cliente XYZ',
      cidade: 'São Paulo',
      uf: 'SP',
      pesoTotal: '15.5 kg',
      dimensoes: '40x30x25cm',
      status: 'Aguardando',
      dataRecebimento: '2024-06-10T10:30:00',
      observacoes: 'Material frágil'
    },
    {
      id: 'VOL-002-2024',
      tipo: 'Volume',
      descricao: 'Caixa papelão 30x20x15cm',
      notaFiscal: 'NF-12345',
      endereco: 'A-01-02-03',
      etiquetaMae: 'ETM-001',
      remetente: 'Fornecedor ABC Ltda',
      destinatario: 'Cliente XYZ',
      cidade: 'São Paulo',
      uf: 'SP',
      pesoTotal: '8.2 kg',
      dimensoes: '30x20x15cm',
      status: 'Endereçado',
      dataRecebimento: '2024-06-10T10:30:00',
      dataEndereçamento: '2024-06-10T14:15:00',
      operador: 'João Silva'
    },
    {
      id: 'PAL-001-2024',
      tipo: 'Palete',
      descricao: 'Palete PBR 1,20x1,00m',
      notaFiscal: 'Múltiplas',
      endereco: 'B-02-01-01',
      remetente: 'Múltiplos fornecedores',
      destinatario: 'Múltiplos clientes',
      cidade: 'Rio de Janeiro',
      uf: 'RJ',
      pesoTotal: '245.8 kg',
      dimensoes: '120x100x180cm',
      status: 'Endereçado',
      dataRecebimento: '2024-06-10T08:00:00',
      dataEndereçamento: '2024-06-10T09:45:00',
      operador: 'Maria Santos'
    }
  ]);

  // Hierarchical address data
  const [filiais, setFiliais] = useState<Filial[]>([
    {
      id: '1',
      nome: 'Transul Guarulhos',
      codigo: 'TG001',
      endereco: 'Rua das Indústrias, 1000',
      cidade: 'Guarulhos',
      uf: 'SP',
      ativa: true,
      rotas: [
        { id: 'r1', nome: 'Rota A', codigo: 'RA', descricao: 'Rota principal centro', ativa: true },
        { id: 'r2', nome: 'Rota B', codigo: 'RB', descricao: 'Rota secundária norte', ativa: true },
        { id: 'r3', nome: 'Rota C', codigo: 'RC', descricao: 'Rota oeste', ativa: true },
        { id: 'r4', nome: 'Rota D', codigo: 'RD', descricao: 'Rota sul', ativa: true },
        { id: 'r5', nome: 'Rota E', codigo: 'RE', descricao: 'Rota especial', ativa: true }
      ],
      ruas: [
        {
          id: 'ru1',
          nome: 'Rua 1',
          codigo: 'R1',
          blocos: [
            {
              id: 'b1',
              nome: 'Bloco A',
              codigo: 'BA',
              andares: [
                {
                  id: 'a1',
                  numero: 1,
                  apartamentos: [
                    { id: 'ap1', numero: '001', codigo: 'TG001-R1-BA-1-001', tipo: 'Prateleira', capacidade: 'Média', restricoes: ['Peso máximo: 50kg'], ativo: true },
                    { id: 'ap2', numero: '002', codigo: 'TG001-R1-BA-1-002', tipo: 'Prateleira', capacidade: 'Média', restricoes: ['Peso máximo: 50kg'], ativo: true },
                    { id: 'ap3', numero: '003', codigo: 'TG001-R1-BA-1-003', tipo: 'Piso', capacidade: 'Alta', restricoes: ['Paletes apenas'], ativo: true }
                  ]
                },
                {
                  id: 'a2',
                  numero: 2,
                  apartamentos: [
                    { id: 'ap4', numero: '001', codigo: 'TG001-R1-BA-2-001', tipo: 'Prateleira', capacidade: 'Baixa', restricoes: ['Peso máximo: 25kg'], ativo: true },
                    { id: 'ap5', numero: '002', codigo: 'TG001-R1-BA-2-002', tipo: 'Mezanino', capacidade: 'Baixa', restricoes: ['Peso máximo: 25kg', 'Sem empilhadeira'], ativo: true }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'ru2',
          nome: 'Rua 2',
          codigo: 'R2',
          blocos: [
            {
              id: 'b2',
              nome: 'Bloco A',
              codigo: 'BA',
              andares: [
                {
                  id: 'a3',
                  numero: 1,
                  apartamentos: [
                    { id: 'ap6', numero: '001', codigo: 'TG001-R2-BA-1-001', tipo: 'Piso', capacidade: 'Alta', restricoes: ['Containers'], ativo: true },
                    { id: 'ap7', numero: '002', codigo: 'TG001-R2-BA-1-002', tipo: 'Docas', capacidade: 'Alta', restricoes: ['Carga/Descarga'], ativo: true }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]);

  const [enderecos, setEnderecos] = useState<Endereco[]>([
    {
      codigo: 'TG001-R1-BA-1-001',
      setor: 'R1',
      corredor: 'BA',
      prateleira: '1',
      posicao: '001',
      tipo: 'Prateleira',
      capacidade: 'Média',
      ocupacao: 0,
      disponivel: true,
      restricoes: ['Peso máximo: 50kg'],
      filial: 'Transul Guarulhos',
      rua: 'Rua 1',
      bloco: 'Bloco A',
      andar: '1',
      apartamento: '001'
    },
    {
      codigo: 'TG001-R1-BA-1-002',
      setor: 'R1',
      corredor: 'BA',
      prateleira: '1',
      posicao: '002',
      tipo: 'Prateleira',
      capacidade: 'Média',
      ocupacao: 80,
      disponivel: false,
      restricoes: ['Peso máximo: 50kg'],
      ultimaMovimentacao: '2024-06-10T14:15:00',
      filial: 'Transul Guarulhos',
      rua: 'Rua 1',
      bloco: 'Bloco A',
      andar: '1',
      apartamento: '002'
    },
    {
      codigo: 'TG001-R1-BA-1-003',
      setor: 'R1',
      corredor: 'BA',
      prateleira: '1',
      posicao: '003',
      tipo: 'Piso',
      capacidade: 'Alta',
      ocupacao: 65,
      disponivel: false,
      restricoes: ['Paletes apenas'],
      ultimaMovimentacao: '2024-06-10T09:45:00',
      filial: 'Transul Guarulhos',
      rua: 'Rua 1',
      bloco: 'Bloco A',
      andar: '1',
      apartamento: '003'
    },
    {
      codigo: 'TG001-R2-BA-1-001',
      setor: 'R2',
      corredor: 'BA',
      prateleira: '1',
      posicao: '001',
      tipo: 'Piso',
      capacidade: 'Alta',
      ocupacao: 0,
      disponivel: true,
      restricoes: ['Containers'],
      filial: 'Transul Guarulhos',
      rua: 'Rua 2',
      bloco: 'Bloco A',
      andar: '1',
      apartamento: '001'
    }
  ]);

  // Funções auxiliares
  const filteredVolumes = volumes.filter(volume => {
    const matchesSearch = searchTerm === '' || (
      searchType === 'volume' && volume.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchType === 'notaFiscal' && volume.notaFiscal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchType === 'endereco' && volume.endereco?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesStatus = filterStatus === 'todos' || volume.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const availableEnderecos = enderecos.filter(endereco => endereco.disponivel);

  const handleVolumeSelect = (volume: Volume) => {
    const isSelected = selectedVolumes.some(v => v.id === volume.id);
    if (isSelected) {
      setSelectedVolumes(selectedVolumes.filter(v => v.id !== volume.id));
    } else {
      setSelectedVolumes([...selectedVolumes, volume]);
    }
  };

  const handleEnderecarVolumes = async () => {
    if (!selectedEndereco || selectedVolumes.length === 0) {
      toast({
        title: "Seleção incompleta",
        description: "Selecione volumes e um endereço para continuar",
        variant: "destructive"
      });
      return;
    }

    try {
      const updatedVolumes = volumes.map(volume => {
        if (selectedVolumes.some(sv => sv.id === volume.id)) {
          return {
            ...volume,
            endereco: selectedEndereco.codigo,
            status: 'Endereçado' as const,
            dataEndereçamento: new Date().toISOString(),
            operador: 'Sistema'
          };
        }
        return volume;
      });

      const updatedEnderecos = enderecos.map(endereco => {
        if (endereco.codigo === selectedEndereco.codigo) {
          return {
            ...endereco,
            ocupacao: Math.min(100, endereco.ocupacao + (selectedVolumes.length * 20)),
            disponivel: endereco.ocupacao + (selectedVolumes.length * 20) < 100,
            ultimaMovimentacao: new Date().toISOString()
          };
        }
        return endereco;
      });

      setVolumes(updatedVolumes);
      setEnderecos(updatedEnderecos);
      setSelectedVolumes([]);
      setSelectedEndereco(null);

      toast({
        title: "Endereçamento realizado",
        description: `${selectedVolumes.length} volume(s) endereçado(s) com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro no endereçamento",
        description: "Não foi possível realizar o endereçamento",
        variant: "destructive"
      });
    }
  };

  const handleViewDetails = (volume: Volume) => {
    setSelectedVolumeDetails(volume);
    setShowDetailsDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Aguardando': 'secondary',
      'Endereçado': 'default',
      'Movimentado': 'outline'
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  const getCapacidadeBadge = (capacidade: string) => {
    const variants = {
      'Baixa': 'secondary',
      'Média': 'default',
      'Alta': 'destructive'
    } as const;
    
    return <Badge variant={variants[capacidade as keyof typeof variants] || 'secondary'}>{capacidade}</Badge>;
  };

  // Address management functions
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleAddAddress = (type: 'filial' | 'rota' | 'rua' | 'bloco' | 'andar' | 'apartamento') => {
    setAddressDialogMode(type);
    setNewAddressForm({
      nome: '',
      codigo: '',
      descricao: '',
      tipo: 'Prateleira',
      capacidade: 'Média',
      restricoes: [],
      endereco: '',
      cidade: '',
      uf: '',
      numero: 1
    });
    setShowAddressDialog(true);
  };

  const handleSaveAddress = () => {
    try {
      switch (addressDialogMode) {
        case 'filial':
          const newFilial: Filial = {
            id: Date.now().toString(),
            nome: newAddressForm.nome,
            codigo: newAddressForm.codigo,
            endereco: newAddressForm.endereco,
            cidade: newAddressForm.cidade,
            uf: newAddressForm.uf,
            ativa: true,
            rotas: [],
            ruas: []
          };
          setFiliais([...filiais, newFilial]);
          break;

        case 'rota':
          if (selectedFilial) {
            const updatedFiliais = filiais.map(filial => {
              if (filial.id === selectedFilial.id) {
                return {
                  ...filial,
                  rotas: [...filial.rotas, {
                    id: Date.now().toString(),
                    nome: newAddressForm.nome,
                    codigo: newAddressForm.codigo,
                    descricao: newAddressForm.descricao,
                    ativa: true
                  }]
                };
              }
              return filial;
            });
            setFiliais(updatedFiliais);
          }
          break;

        case 'rua':
          if (selectedFilial) {
            const updatedFiliais = filiais.map(filial => {
              if (filial.id === selectedFilial.id) {
                return {
                  ...filial,
                  ruas: [...filial.ruas, {
                    id: Date.now().toString(),
                    nome: newAddressForm.nome,
                    codigo: newAddressForm.codigo,
                    blocos: []
                  }]
                };
              }
              return filial;
            });
            setFiliais(updatedFiliais);
          }
          break;

        case 'bloco':
          if (selectedFilial && selectedRua) {
            const updatedFiliais = filiais.map(filial => {
              if (filial.id === selectedFilial.id) {
                return {
                  ...filial,
                  ruas: filial.ruas.map(rua => {
                    if (rua.id === selectedRua.id) {
                      return {
                        ...rua,
                        blocos: [...rua.blocos, {
                          id: Date.now().toString(),
                          nome: newAddressForm.nome,
                          codigo: newAddressForm.codigo,
                          andares: []
                        }]
                      };
                    }
                    return rua;
                  })
                };
              }
              return filial;
            });
            setFiliais(updatedFiliais);
          }
          break;

        case 'andar':
          if (selectedFilial && selectedRua && selectedBloco) {
            const updatedFiliais = filiais.map(filial => {
              if (filial.id === selectedFilial.id) {
                return {
                  ...filial,
                  ruas: filial.ruas.map(rua => {
                    if (rua.id === selectedRua.id) {
                      return {
                        ...rua,
                        blocos: rua.blocos.map(bloco => {
                          if (bloco.id === selectedBloco.id) {
                            return {
                              ...bloco,
                              andares: [...bloco.andares, {
                                id: Date.now().toString(),
                                numero: newAddressForm.numero,
                                apartamentos: []
                              }]
                            };
                          }
                          return bloco;
                        })
                      };
                    }
                    return rua;
                  })
                };
              }
              return filial;
            });
            setFiliais(updatedFiliais);
          }
          break;

        case 'apartamento':
          if (selectedFilial && selectedRua && selectedBloco && selectedAndar) {
            const apartamentoCodigo = `${selectedFilial.codigo}-${selectedRua.codigo}-${selectedBloco.codigo}-${selectedAndar.numero}-${newAddressForm.codigo}`;
            
            // Add to filial structure
            const updatedFiliais = filiais.map(filial => {
              if (filial.id === selectedFilial.id) {
                return {
                  ...filial,
                  ruas: filial.ruas.map(rua => {
                    if (rua.id === selectedRua.id) {
                      return {
                        ...rua,
                        blocos: rua.blocos.map(bloco => {
                          if (bloco.id === selectedBloco.id) {
                            return {
                              ...bloco,
                              andares: bloco.andares.map(andar => {
                                if (andar.id === selectedAndar.id) {
                                  return {
                                    ...andar,
                                    apartamentos: [...andar.apartamentos, {
                                      id: Date.now().toString(),
                                      numero: newAddressForm.codigo,
                                      codigo: apartamentoCodigo,
                                      tipo: newAddressForm.tipo,
                                      capacidade: newAddressForm.capacidade,
                                      restricoes: newAddressForm.restricoes,
                                      ativo: true
                                    }]
                                  };
                                }
                                return andar;
                              })
                            };
                          }
                          return bloco;
                        })
                      };
                    }
                    return rua;
                  })
                };
              }
              return filial;
            });
            setFiliais(updatedFiliais);

            // Add to enderecos list
            const newEndereco: Endereco = {
              codigo: apartamentoCodigo,
              setor: selectedRua.codigo,
              corredor: selectedBloco.codigo,
              prateleira: selectedAndar.numero.toString(),
              posicao: newAddressForm.codigo,
              tipo: newAddressForm.tipo,
              capacidade: newAddressForm.capacidade,
              ocupacao: 0,
              disponivel: true,
              restricoes: newAddressForm.restricoes,
              filial: selectedFilial.nome,
              rua: selectedRua.nome,
              bloco: selectedBloco.nome,
              andar: selectedAndar.numero.toString(),
              apartamento: newAddressForm.codigo
            };
            setEnderecos([...enderecos, newEndereco]);
          }
          break;
      }

      setShowAddressDialog(false);
      toast({
        title: "Endereço cadastrado",
        description: `${addressDialogMode} cadastrado(a) com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Não foi possível cadastrar o endereço",
        variant: "destructive"
      });
    }
  };

  const handleBulkCreateApartments = () => {
    if (!selectedFilial || !selectedRua || !selectedBloco || !selectedAndar) return;

    try {
      const newApartments: Apartamento[] = [];
      const newEnderecos: Endereco[] = [];

      for (let i = bulkApartmentForm.startNumber; i <= bulkApartmentForm.endNumber; i++) {
        const numero = bulkApartmentForm.prefix + i.toString().padStart(3, '0');
        const apartamentoCodigo = `${selectedFilial.codigo}-${selectedRua.codigo}-${selectedBloco.codigo}-${selectedAndar.numero}-${numero}`;
        
        const apartamento: Apartamento = {
          id: Date.now().toString() + i,
          numero,
          codigo: apartamentoCodigo,
          tipo: bulkApartmentForm.tipo,
          capacidade: bulkApartmentForm.capacidade,
          restricoes: bulkApartmentForm.restricoes,
          ativo: true
        };

        const endereco: Endereco = {
          codigo: apartamentoCodigo,
          setor: selectedRua.codigo,
          corredor: selectedBloco.codigo,
          prateleira: selectedAndar.numero.toString(),
          posicao: numero,
          tipo: bulkApartmentForm.tipo,
          capacidade: bulkApartmentForm.capacidade,
          ocupacao: 0,
          disponivel: true,
          restricoes: bulkApartmentForm.restricoes,
          filial: selectedFilial.nome,
          rua: selectedRua.nome,
          bloco: selectedBloco.nome,
          andar: selectedAndar.numero.toString(),
          apartamento: numero
        };

        newApartments.push(apartamento);
        newEnderecos.push(endereco);
      }

      // Update filiais with new apartments
      const updatedFiliais = filiais.map(filial => {
        if (filial.id === selectedFilial.id) {
          return {
            ...filial,
            ruas: filial.ruas.map(rua => {
              if (rua.id === selectedRua.id) {
                return {
                  ...rua,
                  blocos: rua.blocos.map(bloco => {
                    if (bloco.id === selectedBloco.id) {
                      return {
                        ...bloco,
                        andares: bloco.andares.map(andar => {
                          if (andar.id === selectedAndar.id) {
                            return {
                              ...andar,
                              apartamentos: [...andar.apartamentos, ...newApartments]
                            };
                          }
                          return andar;
                        })
                      };
                    }
                    return bloco;
                  })
                };
              }
              return rua;
            })
          };
        }
        return filial;
      });

      setFiliais(updatedFiliais);
      setEnderecos([...enderecos, ...newEnderecos]);
      setShowBulkApartmentDialog(false);

      toast({
        title: "Apartamentos criados",
        description: `${newApartments.length} apartamentos cadastrados com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro na criação em lote",
        description: "Não foi possível criar os apartamentos",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Endereçamento de Volumes</h1>
          <p className="text-gray-600">Gerencie a localização e movimentação de volumes no armazém</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Aguardando</p>
                  <p className="text-xl font-bold">{volumes.filter(v => v.status === 'Aguardando').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Endereçados</p>
                  <p className="text-xl font-bold">{volumes.filter(v => v.status === 'Endereçado').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Warehouse className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Endereços Livres</p>
                  <p className="text-xl font-bold">{enderecos.filter(e => e.disponivel).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ocupação Média</p>
                  <p className="text-xl font-bold">{Math.round(enderecos.reduce((acc, e) => acc + e.ocupacao, 0) / enderecos.length)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="enderecamento">Endereçamento</TabsTrigger>
            <TabsTrigger value="consulta">Consulta</TabsTrigger>
            <TabsTrigger value="cadastro">Cadastro de Endereços</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>

          {/* Endereçamento Tab */}
          <TabsContent value="enderecamento" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Busca e Filtros */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Buscar Volumes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Digite para buscar..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="volume">Volume</SelectItem>
                          <SelectItem value="notaFiscal">Nota Fiscal</SelectItem>
                          <SelectItem value="endereco">Endereço</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-4">
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os Status</SelectItem>
                          <SelectItem value="aguardando">Aguardando</SelectItem>
                          <SelectItem value="endereçado">Endereçado</SelectItem>
                          <SelectItem value="movimentado">Movimentado</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button variant="outline" onClick={() => {
                        setSearchTerm('');
                        setFilterStatus('todos');
                        setSelectedVolumes([]);
                      }}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Limpar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Volumes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Volumes Encontrados ({filteredVolumes.length})</span>
                      {selectedVolumes.length > 0 && (
                        <Button onClick={() => setShowBulkMoveDialog(true)}>
                          Endereçar Selecionados ({selectedVolumes.length})
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedVolumes(filteredVolumes);
                                  } else {
                                    setSelectedVolumes([]);
                                  }
                                }}
                                checked={selectedVolumes.length === filteredVolumes.length && filteredVolumes.length > 0}
                              />
                            </TableHead>
                            <TableHead>Volume</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Nota Fiscal</TableHead>
                            <TableHead>Endereço</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Destino</TableHead>
                            <TableHead>Peso</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredVolumes.map((volume) => (
                            <TableRow key={volume.id}>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedVolumes.some(v => v.id === volume.id)}
                                  onChange={() => handleVolumeSelect(volume)}
                                />
                              </TableCell>
                              <TableCell className="font-mono text-sm">{volume.id}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{volume.tipo}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{volume.notaFiscal}</TableCell>
                              <TableCell>
                                {volume.endereco ? (
                                  <span className="font-mono text-sm bg-green-100 px-2 py-1 rounded">
                                    {volume.endereco}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">Não endereçado</span>
                                )}
                              </TableCell>
                              <TableCell>{getStatusBadge(volume.status)}</TableCell>
                              <TableCell>{volume.cidade}/{volume.uf}</TableCell>
                              <TableCell>{volume.pesoTotal}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewDetails(volume)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {volume.status === 'Aguardando' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedVolumes([volume]);
                                        setShowMoveDialog(true);
                                      }}
                                    >
                                      <MapPin className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Endereços Disponíveis */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Warehouse className="h-5 w-5" />
                      Endereços Disponíveis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {availableEnderecos.map((endereco) => (
                        <div
                          key={endereco.codigo}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedEndereco?.codigo === endereco.codigo
                              ? 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedEndereco(endereco)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-medium">{endereco.codigo}</span>
                            {getCapacidadeBadge(endereco.capacidade)}
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{endereco.tipo} • Setor {endereco.setor}</p>
                            <p>Ocupação: {endereco.ocupacao}%</p>
                          </div>
                          {endereco.restricoes && endereco.restricoes.length > 0 && (
                            <div className="mt-2">
                              {endereco.restricoes.map((restricao, index) => (
                                <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded mr-1">
                                  {restricao}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {selectedEndereco && selectedVolumes.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <Button onClick={handleEnderecarVolumes} className="w-full">
                          <MapPin className="h-4 w-4 mr-2" />
                          Endereçar {selectedVolumes.length} volume(s)
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Cadastro de Endereços Tab */}
          <TabsContent value="cadastro" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hierarchical Tree */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Estrutura de Endereços</span>
                    <Button onClick={() => handleAddAddress('filial')} size="sm">
                      <Warehouse className="h-4 w-4 mr-2" />
                      Nova Filial
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filiais.map((filial) => (
                      <div key={filial.id} className="border rounded-lg p-3">
                        {/* Filial Level */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExpanded(`filial-${filial.id}`)}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              {expandedItems.has(`filial-${filial.id}`) ? 
                                <ChevronDown className="h-4 w-4 text-blue-600" /> : 
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                              }
                            </button>
                            <Building className="h-4 w-4 text-blue-600" />
                            <div>
                              <span className="font-medium">{filial.nome}</span>
                              <p className="text-sm text-gray-500">{filial.codigo} • {filial.cidade}/{filial.uf}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedFilial(filial);
                                handleAddAddress('rota');
                              }}
                            >
                              + Rota
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedFilial(filial);
                                handleAddAddress('rua');
                              }}
                            >
                              + Rua
                            </Button>
                          </div>
                        </div>

                        {expandedItems.has(`filial-${filial.id}`) && (
                          <div className="ml-6 space-y-3">
                            {/* Rotas */}
                            {filial.rotas.length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm text-blue-600 mb-2">Rotas</h4>
                                <div className="space-y-1">
                                  {filial.rotas.map((rota) => (
                                    <div key={rota.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                                      <div>
                                        <span className="font-medium text-sm">{rota.nome}</span>
                                        <p className="text-xs text-gray-600">{rota.descricao}</p>
                                      </div>
                                      <Badge variant="outline">{rota.codigo}</Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Ruas */}
                            {filial.ruas.map((rua) => (
                              <div key={rua.id} className="border-l-2 border-gray-200 pl-4">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleExpanded(`rua-${rua.id}`)}
                                      className="p-1 hover:bg-gray-100 rounded"
                                    >
                                      {expandedItems.has(`rua-${rua.id}`) ? 
                                        <ChevronDown className="h-3 w-3 text-green-600" /> : 
                                        <ChevronRight className="h-3 w-3 text-gray-400" />
                                      }
                                    </button>
                                    <Navigation className="h-3 w-3 text-green-600" />
                                    <span className="font-medium text-sm">{rua.nome}</span>
                                    <Badge variant="secondary" className="text-xs">{rua.codigo}</Badge>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setSelectedFilial(filial);
                                      setSelectedRua(rua);
                                      handleAddAddress('bloco');
                                    }}
                                  >
                                    + Bloco
                                  </Button>
                                </div>

                                {expandedItems.has(`rua-${rua.id}`) && (
                                  <div className="ml-4 space-y-2">
                                    {rua.blocos.map((bloco) => (
                                      <div key={bloco.id} className="border-l-2 border-gray-300 pl-3">
                                        <div className="flex items-center justify-between mb-1">
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => toggleExpanded(`bloco-${bloco.id}`)}
                                              className="p-1 hover:bg-gray-100 rounded"
                                            >
                                              {expandedItems.has(`bloco-${bloco.id}`) ? 
                                                <ChevronDown className="h-3 w-3 text-purple-600" /> : 
                                                <ChevronRight className="h-3 w-3 text-gray-400" />
                                              }
                                            </button>
                                            <Home className="h-3 w-3 text-purple-600" />
                                            <span className="text-sm font-medium">{bloco.nome}</span>
                                            <Badge variant="outline" className="text-xs">{bloco.codigo}</Badge>
                                          </div>
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => {
                                              setSelectedFilial(filial);
                                              setSelectedRua(rua);
                                              setSelectedBloco(bloco);
                                              handleAddAddress('andar');
                                            }}
                                          >
                                            + Andar
                                          </Button>
                                        </div>

                                        {expandedItems.has(`bloco-${bloco.id}`) && (
                                          <div className="ml-3 space-y-1">
                                            {bloco.andares.map((andar) => (
                                              <div key={andar.id} className="border-l-2 border-gray-400 pl-2">
                                                <div className="flex items-center justify-between mb-1">
                                                  <div className="flex items-center gap-2">
                                                    <button
                                                      onClick={() => toggleExpanded(`andar-${andar.id}`)}
                                                      className="p-1 hover:bg-gray-100 rounded"
                                                    >
                                                      {expandedItems.has(`andar-${andar.id}`) ? 
                                                        <ChevronDown className="h-3 w-3 text-orange-600" /> : 
                                                        <ChevronRight className="h-3 w-3 text-gray-400" />
                                                      }
                                                    </button>
                                                    <Layers className="h-3 w-3 text-orange-600" />
                                                    <span className="text-xs font-medium">Andar {andar.numero}</span>
                                                    <Badge variant="secondary" className="text-xs">{andar.apartamentos.length} aptos</Badge>
                                                  </div>
                                                  <div className="flex gap-1">
                                                    <Button 
                                                      variant="outline" 
                                                      size="sm"
                                                      onClick={() => {
                                                        setSelectedFilial(filial);
                                                        setSelectedRua(rua);
                                                        setSelectedBloco(bloco);
                                                        setSelectedAndar(andar);
                                                        handleAddAddress('apartamento');
                                                      }}
                                                    >
                                                      + Apto
                                                    </Button>
                                                    <Button 
                                                      variant="outline" 
                                                      size="sm"
                                                      onClick={() => {
                                                        setSelectedFilial(filial);
                                                        setSelectedRua(rua);
                                                        setSelectedBloco(bloco);
                                                        setSelectedAndar(andar);
                                                        setBulkApartmentForm({
                                                          startNumber: 1,
                                                          endNumber: 10,
                                                          prefix: '',
                                                          tipo: 'Prateleira',
                                                          capacidade: 'Média',
                                                          restricoes: []
                                                        });
                                                        setShowBulkApartmentDialog(true);
                                                      }}
                                                      title="Criar apartamentos em lote"
                                                    >
                                                      <Package className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                </div>

                                                {expandedItems.has(`andar-${andar.id}`) && (
                                                  <div className="ml-2 space-y-1">
                                                    {andar.apartamentos.map((apartamento) => (
                                                      <div key={apartamento.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs border-l-2 border-gray-500">
                                                        <div className="flex items-center gap-2">
                                                          <DoorOpen className="h-3 w-3 text-red-600" />
                                                          <span className="font-mono font-medium">{apartamento.codigo}</span>
                                                          <Badge variant="outline" className="text-xs">{apartamento.tipo}</Badge>
                                                          {getCapacidadeBadge(apartamento.capacidade)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                          {apartamento.ativo ? 
                                                            <CheckCircle className="h-3 w-3 text-green-500" /> : 
                                                            <AlertCircle className="h-3 w-3 text-red-500" />
                                                          }
                                                          <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-6 w-6 p-0"
                                                            onClick={() => {
                                                              // Edit apartment functionality
                                                              setSelectedFilial(filial);
                                                              setSelectedRua(rua);
                                                              setSelectedBloco(bloco);
                                                              setSelectedAndar(andar);
                                                              setNewAddressForm({
                                                                ...newAddressForm,
                                                                nome: apartamento.numero,
                                                                codigo: apartamento.numero,
                                                                tipo: apartamento.tipo,
                                                                capacidade: apartamento.capacidade,
                                                                restricoes: apartamento.restricoes || []
                                                              });
                                                              setAddressDialogMode('apartamento');
                                                              setShowAddressDialog(true);
                                                            }}
                                                          >
                                                            <Edit className="h-3 w-3" />
                                                          </Button>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Address Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas da Estrutura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{filiais.length}</div>
                      <div className="text-sm text-gray-600">Filiais</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {filiais.reduce((acc, f) => acc + f.rotas.length, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Rotas</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {filiais.reduce((acc, f) => acc + f.ruas.length, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Ruas</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {enderecos.length}
                      </div>
                      <div className="text-sm text-gray-600">Endereços Ativos</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-3">Últimos Endereços Cadastrados</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {enderecos.slice(-5).reverse().map((endereco) => (
                        <div key={endereco.codigo} className="p-2 border rounded-lg text-sm">
                          <div className="font-mono font-medium">{endereco.codigo}</div>
                          <div className="text-gray-600">
                            {endereco.filial} • {endereco.rua} • {endereco.bloco} • Andar {endereco.andar}
                          </div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{endereco.tipo}</Badge>
                            {getCapacidadeBadge(endereco.capacidade)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Consulta Tab */}
          <TabsContent value="consulta" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Endereços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {enderecos.map((endereco) => (
                    <div
                      key={endereco.codigo}
                      className={`p-4 border rounded-lg ${
                        endereco.disponivel ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono font-bold">{endereco.codigo}</span>
                        <div className="flex items-center gap-1">
                          {endereco.disponivel ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          {getCapacidadeBadge(endereco.capacidade)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <p><strong>Tipo:</strong> {endereco.tipo}</p>
                        <p><strong>Ocupação:</strong> {endereco.ocupacao}%</p>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              endereco.ocupacao < 50 ? 'bg-green-500' :
                              endereco.ocupacao < 80 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${endereco.ocupacao}%` }}
                          />
                        </div>

                        {endereco.ultimaMovimentacao && (
                          <p className="text-xs text-gray-500">
                            Última movimentação: {format(new Date(endereco.ultimaMovimentacao), 'dd/MM/yyyy HH:mm')}
                          </p>
                        )}
                      </div>

                      {/* Volumes neste endereço */}
                      {volumes.filter(v => v.endereco === endereco.codigo).length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium mb-2">Volumes:</p>
                          <div className="space-y-1">
                            {volumes.filter(v => v.endereco === endereco.codigo).map((volume) => (
                              <div key={volume.id} className="text-xs bg-white p-2 rounded border">
                                <p className="font-mono">{volume.id}</p>
                                <p className="text-gray-600">{volume.descricao}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relatórios Tab */}
          <TabsContent value="relatorios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Disponíveis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Relatório de Ocupação
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Movimentações do Dia
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Análise de Capacidade
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Printer className="h-4 w-4 mr-2" />
                    Etiquetas de Endereço
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total de Endereços:</span>
                    <span className="font-bold">{enderecos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Endereços Ocupados:</span>
                    <span className="font-bold">{enderecos.filter(e => !e.disponivel).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volumes Endereçados Hoje:</span>
                    <span className="font-bold">{volumes.filter(v => v.dataEndereçamento && 
                      new Date(v.dataEndereçamento).toDateString() === new Date().toDateString()).length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Eficiência do Armazém:</span>
                    <span className="font-bold text-green-600">
                      {Math.round((enderecos.filter(e => !e.disponivel).length / enderecos.length) * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        
        {/* Volume Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Volume</DialogTitle>
            </DialogHeader>
            {selectedVolumeDetails && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">ID do Volume</Label>
                    <p className="text-lg font-mono">{selectedVolumeDetails.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo</Label>
                    <Badge variant="outline">{selectedVolumeDetails.tipo}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Descrição</Label>
                    <p>{selectedVolumeDetails.descricao}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    {getStatusBadge(selectedVolumeDetails.status)}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Nota Fiscal</Label>
                    <p className="font-mono">{selectedVolumeDetails.notaFiscal}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Peso Total</Label>
                    <p className="font-bold">{selectedVolumeDetails.pesoTotal}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Remetente</Label>
                    <p>{selectedVolumeDetails.remetente}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Destinatário</Label>
                    <p>{selectedVolumeDetails.destinatario}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Destino</Label>
                    <p>{selectedVolumeDetails.cidade}/{selectedVolumeDetails.uf}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Data Recebimento</Label>
                    <p>{format(new Date(selectedVolumeDetails.dataRecebimento), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  {selectedVolumeDetails.endereco && (
                    <div>
                      <Label className="text-sm font-medium">Endereço</Label>
                      <p className="font-mono bg-green-100 px-2 py-1 rounded">{selectedVolumeDetails.endereco}</p>
                    </div>
                  )}
                  {selectedVolumeDetails.dataEndereçamento && (
                    <div>
                      <Label className="text-sm font-medium">Data Endereçamento</Label>
                      <p>{format(new Date(selectedVolumeDetails.dataEndereçamento), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  )}
                </div>

                {selectedVolumeDetails.observacoes && (
                  <div>
                    <Label className="text-sm font-medium">Observações</Label>
                    <p className="text-sm bg-yellow-50 p-3 rounded border">{selectedVolumeDetails.observacoes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="flex-1">
                    Fechar
                  </Button>
                  <Button className="flex-1">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Etiqueta
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Address Creation Dialog */}
        <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {addressDialogMode === 'filial' && 'Nova Filial'}
                {addressDialogMode === 'rota' && `Nova Rota - ${selectedFilial?.nome}`}
                {addressDialogMode === 'rua' && `Nova Rua - ${selectedFilial?.nome}`}
                {addressDialogMode === 'bloco' && `Novo Bloco - ${selectedRua?.nome}`}
                {addressDialogMode === 'andar' && `Novo Andar - ${selectedBloco?.nome}`}
                {addressDialogMode === 'apartamento' && `Novo Apartamento - Andar ${selectedAndar?.numero}`}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Hierarchy Context */}
              {addressDialogMode !== 'filial' && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Contexto:</strong>
                    {selectedFilial?.nome}
                    {selectedRua && ` > ${selectedRua.nome}`}
                    {selectedBloco && ` > ${selectedBloco.nome}`}
                    {selectedAndar && ` > Andar ${selectedAndar.numero}`}
                  </p>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    value={newAddressForm.nome}
                    onChange={(e) => setNewAddressForm({...newAddressForm, nome: e.target.value})}
                    placeholder={
                      addressDialogMode === 'filial' ? 'Ex: Transul Guarulhos' :
                      addressDialogMode === 'rota' ? 'Ex: Rota A' :
                      addressDialogMode === 'rua' ? 'Ex: Rua 1' :
                      addressDialogMode === 'bloco' ? 'Ex: Bloco A' :
                      addressDialogMode === 'andar' ? 'Andar' :
                      'Ex: 001'
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    value={newAddressForm.codigo}
                    onChange={(e) => setNewAddressForm({...newAddressForm, codigo: e.target.value})}
                    placeholder={
                      addressDialogMode === 'filial' ? 'Ex: TG001' :
                      addressDialogMode === 'rota' ? 'Ex: RA' :
                      addressDialogMode === 'rua' ? 'Ex: R1' :
                      addressDialogMode === 'bloco' ? 'Ex: BA' :
                      addressDialogMode === 'andar' ? 'Ex: 1' :
                      'Ex: 001'
                    }
                  />
                </div>

                {/* Filial specific fields */}
                {addressDialogMode === 'filial' && (
                  <>
                    <div>
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={newAddressForm.endereco}
                        onChange={(e) => setNewAddressForm({...newAddressForm, endereco: e.target.value})}
                        placeholder="Ex: Rua das Indústrias, 1000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={newAddressForm.cidade}
                        onChange={(e) => setNewAddressForm({...newAddressForm, cidade: e.target.value})}
                        placeholder="Ex: Guarulhos"
                      />
                    </div>
                    <div>
                      <Label htmlFor="uf">UF</Label>
                      <Select value={newAddressForm.uf} onValueChange={(value) => setNewAddressForm({...newAddressForm, uf: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Rota specific fields */}
                {addressDialogMode === 'rota' && (
                  <div className="md:col-span-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      value={newAddressForm.descricao}
                      onChange={(e) => setNewAddressForm({...newAddressForm, descricao: e.target.value})}
                      placeholder="Ex: Rota principal centro"
                    />
                  </div>
                )}

                {/* Andar specific fields */}
                {addressDialogMode === 'andar' && (
                  <div>
                    <Label htmlFor="numero">Número do Andar</Label>
                    <Input
                      id="numero"
                      type="number"
                      value={newAddressForm.numero}
                      onChange={(e) => setNewAddressForm({...newAddressForm, numero: parseInt(e.target.value) || 1})}
                      min="1"
                      max="20"
                    />
                  </div>
                )}

                {/* Apartamento specific fields */}
                {addressDialogMode === 'apartamento' && (
                  <>
                    <div>
                      <Label htmlFor="tipo">Tipo</Label>
                      <Select value={newAddressForm.tipo} onValueChange={(value: any) => setNewAddressForm({...newAddressForm, tipo: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Piso">Piso</SelectItem>
                          <SelectItem value="Prateleira">Prateleira</SelectItem>
                          <SelectItem value="Mezanino">Mezanino</SelectItem>
                          <SelectItem value="Docas">Docas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="capacidade">Capacidade</Label>
                      <Select value={newAddressForm.capacidade} onValueChange={(value: any) => setNewAddressForm({...newAddressForm, capacidade: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                          <SelectItem value="Média">Média</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label>Restrições</Label>
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant={newAddressForm.restricoes.includes('Peso máximo: 25kg') ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const restricao = 'Peso máximo: 25kg';
                            const restricoes = newAddressForm.restricoes.includes(restricao)
                              ? newAddressForm.restricoes.filter(r => r !== restricao)
                              : [...newAddressForm.restricoes, restricao];
                            setNewAddressForm({...newAddressForm, restricoes});
                          }}
                        >
                          Peso máx: 25kg
                        </Button>
                        <Button
                          type="button"
                          variant={newAddressForm.restricoes.includes('Peso máximo: 50kg') ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const restricao = 'Peso máximo: 50kg';
                            const restricoes = newAddressForm.restricoes.includes(restricao)
                              ? newAddressForm.restricoes.filter(r => r !== restricao)
                              : [...newAddressForm.restricoes, restricao];
                            setNewAddressForm({...newAddressForm, restricoes});
                          }}
                        >
                          Peso máx: 50kg
                        </Button>
                        <Button
                          type="button"
                          variant={newAddressForm.restricoes.includes('Paletes apenas') ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const restricao = 'Paletes apenas';
                            const restricoes = newAddressForm.restricoes.includes(restricao)
                              ? newAddressForm.restricoes.filter(r => r !== restricao)
                              : [...newAddressForm.restricoes, restricao];
                            setNewAddressForm({...newAddressForm, restricoes});
                          }}
                        >
                          Paletes apenas
                        </Button>
                        <Button
                          type="button"
                          variant={newAddressForm.restricoes.includes('Sem empilhadeira') ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const restricao = 'Sem empilhadeira';
                            const restricoes = newAddressForm.restricoes.includes(restricao)
                              ? newAddressForm.restricoes.filter(r => r !== restricao)
                              : [...newAddressForm.restricoes, restricao];
                            setNewAddressForm({...newAddressForm, restricoes});
                          }}
                        >
                          Sem empilhadeira
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Preview */}
              {addressDialogMode === 'apartamento' && selectedFilial && selectedRua && selectedBloco && selectedAndar && (
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-sm font-medium mb-1">Código do Apartamento:</p>
                  <p className="font-mono text-lg">
                    {selectedFilial.codigo}-{selectedRua.codigo}-{selectedBloco.codigo}-{selectedAndar.numero}-{newAddressForm.codigo || '___'}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddressDialog(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveAddress} 
                  disabled={!newAddressForm.nome || !newAddressForm.codigo}
                  className="flex-1"
                >
                  Cadastrar {addressDialogMode === 'filial' ? 'Filial' : 
                           addressDialogMode === 'rota' ? 'Rota' :
                           addressDialogMode === 'rua' ? 'Rua' :
                           addressDialogMode === 'bloco' ? 'Bloco' :
                           addressDialogMode === 'andar' ? 'Andar' : 'Apartamento'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Apartment Creation Dialog */}
        <Dialog open={showBulkApartmentDialog} onOpenChange={setShowBulkApartmentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Apartamentos em Lote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Context */}
              {selectedFilial && selectedRua && selectedBloco && selectedAndar && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Contexto:</strong> {selectedFilial.nome} {' > '} {selectedRua.nome} {' > '} {selectedBloco.nome} {' > '} Andar {selectedAndar.numero}
                  </p>
                </div>
              )}

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startNumber">Número Inicial</Label>
                  <Input
                    id="startNumber"
                    type="number"
                    value={bulkApartmentForm.startNumber}
                    onChange={(e) => setBulkApartmentForm({...bulkApartmentForm, startNumber: parseInt(e.target.value) || 1})}
                    min="1"
                    max="999"
                  />
                </div>

                <div>
                  <Label htmlFor="endNumber">Número Final</Label>
                  <Input
                    id="endNumber"
                    type="number"
                    value={bulkApartmentForm.endNumber}
                    onChange={(e) => setBulkApartmentForm({...bulkApartmentForm, endNumber: parseInt(e.target.value) || 10})}
                    min="1"
                    max="999"
                  />
                </div>

                <div>
                  <Label htmlFor="prefix">Prefixo (opcional)</Label>
                  <Input
                    id="prefix"
                    value={bulkApartmentForm.prefix}
                    onChange={(e) => setBulkApartmentForm({...bulkApartmentForm, prefix: e.target.value})}
                    placeholder="Ex: A, B, C..."
                    maxLength={3}
                  />
                </div>

                <div>
                  <Label htmlFor="bulkTipo">Tipo</Label>
                  <Select value={bulkApartmentForm.tipo} onValueChange={(value: any) => setBulkApartmentForm({...bulkApartmentForm, tipo: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Piso">Piso</SelectItem>
                      <SelectItem value="Prateleira">Prateleira</SelectItem>
                      <SelectItem value="Mezanino">Mezanino</SelectItem>
                      <SelectItem value="Docas">Docas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bulkCapacidade">Capacidade</Label>
                  <Select value={bulkApartmentForm.capacidade} onValueChange={(value: any) => setBulkApartmentForm({...bulkApartmentForm, capacidade: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baixa">Baixa</SelectItem>
                      <SelectItem value="Média">Média</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label>Restrições</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button
                      type="button"
                      variant={bulkApartmentForm.restricoes.includes('Peso máximo: 25kg') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const restricao = 'Peso máximo: 25kg';
                        const restricoes = bulkApartmentForm.restricoes.includes(restricao)
                          ? bulkApartmentForm.restricoes.filter(r => r !== restricao)
                          : [...bulkApartmentForm.restricoes, restricao];
                        setBulkApartmentForm({...bulkApartmentForm, restricoes});
                      }}
                    >
                      Peso máx: 25kg
                    </Button>
                    <Button
                      type="button"
                      variant={bulkApartmentForm.restricoes.includes('Peso máximo: 50kg') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const restricao = 'Peso máximo: 50kg';
                        const restricoes = bulkApartmentForm.restricoes.includes(restricao)
                          ? bulkApartmentForm.restricoes.filter(r => r !== restricao)
                          : [...bulkApartmentForm.restricoes, restricao];
                        setBulkApartmentForm({...bulkApartmentForm, restricoes});
                      }}
                    >
                      Peso máx: 50kg
                    </Button>
                    <Button
                      type="button"
                      variant={bulkApartmentForm.restricoes.includes('Paletes apenas') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const restricao = 'Paletes apenas';
                        const restricoes = bulkApartmentForm.restricoes.includes(restricao)
                          ? bulkApartmentForm.restricoes.filter(r => r !== restricao)
                          : [...bulkApartmentForm.restricoes, restricao];
                        setBulkApartmentForm({...bulkApartmentForm, restricoes});
                      }}
                    >
                      Paletes apenas
                    </Button>
                    <Button
                      type="button"
                      variant={bulkApartmentForm.restricoes.includes('Sem empilhadeira') ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const restricao = 'Sem empilhadeira';
                        const restricoes = bulkApartmentForm.restricoes.includes(restricao)
                          ? bulkApartmentForm.restricoes.filter(r => r !== restricao)
                          : [...bulkApartmentForm.restricoes, restricao];
                        setBulkApartmentForm({...bulkApartmentForm, restricoes});
                      }}
                    >
                      Sem empilhadeira
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 p-3 rounded-lg border">
                <p className="text-sm font-medium mb-2">Prévia dos Códigos:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {Array.from({ length: Math.min(bulkApartmentForm.endNumber - bulkApartmentForm.startNumber + 1, 20) }, (_, i) => {
                    const numero = bulkApartmentForm.prefix + (bulkApartmentForm.startNumber + i).toString().padStart(3, '0');
                    const codigo = selectedFilial && selectedRua && selectedBloco && selectedAndar 
                      ? `${selectedFilial.codigo}-${selectedRua.codigo}-${selectedBloco.codigo}-${selectedAndar.numero}-${numero}`
                      : numero;
                    return (
                      <div key={i} className="font-mono text-xs bg-white p-2 rounded border">
                        {codigo}
                      </div>
                    );
                  })}
                  {bulkApartmentForm.endNumber - bulkApartmentForm.startNumber + 1 > 20 && (
                    <div className="font-mono text-xs bg-white p-2 rounded border text-gray-500">
                      ... e mais {bulkApartmentForm.endNumber - bulkApartmentForm.startNumber + 1 - 20}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Total: {bulkApartmentForm.endNumber - bulkApartmentForm.startNumber + 1} apartamentos
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowBulkApartmentDialog(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleBulkCreateApartments}
                  disabled={bulkApartmentForm.startNumber > bulkApartmentForm.endNumber}
                  className="flex-1"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Criar {bulkApartmentForm.endNumber - bulkApartmentForm.startNumber + 1} Apartamentos
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Move Dialog */}
        <Dialog open={showBulkMoveDialog} onOpenChange={setShowBulkMoveDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Endereçamento em Lote</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium">Volumes Selecionados: {selectedVolumes.length}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {selectedVolumes.map((volume) => (
                    <div key={volume.id} className="text-sm bg-white p-2 rounded border">
                      <span className="font-mono">{volume.id}</span> - {volume.descricao}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Selecionar Endereço</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {availableEnderecos.map((endereco) => (
                    <div
                      key={endereco.codigo}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedEndereco?.codigo === endereco.codigo
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedEndereco(endereco)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-medium">{endereco.codigo}</span>
                        {getCapacidadeBadge(endereco.capacidade)}
                      </div>
                      <p className="text-sm text-gray-600">{endereco.tipo} • {endereco.ocupacao}% ocupado</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowBulkMoveDialog(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={() => {
                  handleEnderecarVolumes();
                  setShowBulkMoveDialog(false);
                }} disabled={!selectedEndereco} className="flex-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  Confirmar Endereçamento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Enderecamento;
