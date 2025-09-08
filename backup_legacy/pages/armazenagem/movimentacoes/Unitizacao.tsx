import React, { useState, useRef, useEffect } from 'react';
import TopNavbar from '../../../components/layout/TopNavbar';
import TransulLogo from '../../../components/TransulLogo';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Package, 
  Plus,
  Trash2,
  Eye,
  Printer,
  PackageCheck,
  PackageX,
  BarChart3,
  Calendar,
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Download,
  Link,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface VolumeData {
  codigo: string;
  notaFiscal: string;
  volume: string;
  tipo: string;
  area: string;
  quantidade: number;
  status: 'Pendente' | 'Selecionado' | 'Gerada' | 'Impressa' | 'Processada' | 'Unitizado';
  dataGeracao: string;
  peso?: string;
  dimensoes?: string;
  remetente?: string;
  destinatario?: string;
  cidade?: string;
  uf?: string;
  endereco?: string;
  etiquetaMae?: string;
}

interface EtiquetaMaePalete {
  id: string;
  descricao: string;
  tipo: string;
  volumes: number;
  pesoTotal: string;
  cidadeDestino: string;
  ufDestino: string;
  volumesVinculados: string[];
  dataCriacao: string;
  status: 'Ativa' | 'Finalizada' | 'Cancelada';
  numeroEtiqueta: string;
  layout: string;
  formato: string;
  endereco?: string;
  operador?: string;
}

const Unitizacao: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('criar');
  
  // Estados principais usando a mesma base do Mix
  const [selectedEtiquetaMae, setSelectedEtiquetaMae] = useState<EtiquetaMaePalete | null>(null);
  const [etiquetaConfig, setEtiquetaConfig] = useState({
    descricao: 'Palete de Unitização',
    tipo: 'Palete',
    layout: 'Etiqueta 50x100mm',
    formato: 'Etiqueta 50x100mm',
    numeroEtiqueta: '',
    endereco: '',
    pesoTotal: '0',
    volumes: 0
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [volumesSelecionados, setVolumesSelecionados] = useState<VolumeData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');

  // Dados de etiquetas mãe palete - usando a mesma estrutura do Mix
  const [etiquetasPalete, setEtiquetasPalete] = useState<EtiquetaMaePalete[]>([
    {
      id: 'PALETE-174960020959',
      descricao: 'Palete Setor A',
      tipo: 'Palete',
      volumes: 8,
      pesoTotal: '156.750',
      cidadeDestino: 'SÃO PAULO',
      ufDestino: 'SP',
      volumesVinculados: ['NF001-001-001', 'NF001-002-001', 'NF001-003-001', 'NF002-001-001', 'NF002-002-001', 'NF003-001-001', 'NF003-002-001', 'NF003-003-001'],
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      status: 'Ativa',
      numeroEtiqueta: 'PALETE-174960020959',
      layout: 'Etiqueta 50x100mm',
      formato: 'Etiqueta 50x100mm',
      endereco: 'A-01-02-01',
      operador: 'João Silva'
    },
    {
      id: 'PALETE-174960020958',
      descricao: 'Palete Exportação',
      tipo: 'Palete',
      volumes: 12,
      pesoTotal: '245.280',
      cidadeDestino: 'RIO DE JANEIRO',
      ufDestino: 'RJ',
      volumesVinculados: ['NF004-001-001', 'NF004-002-001', 'NF004-003-001', 'NF005-001-001', 'NF005-002-001', 'NF005-003-001', 'NF005-004-001', 'NF006-001-001', 'NF006-002-001', 'NF006-003-001', 'NF006-004-001', 'NF006-005-001'],
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      status: 'Ativa',
      numeroEtiqueta: 'PALETE-174960020958',
      layout: 'Etiqueta 50x100mm',
      formato: 'Etiqueta 50x100mm',
      endereco: 'B-02-01-02',
      operador: 'Maria Santos'
    },
    {
      id: 'PALETE-174960020957',
      descricao: 'Palete Produtos Químicos',
      tipo: 'Palete',
      volumes: 6,
      pesoTotal: '189.450',
      cidadeDestino: 'BELO HORIZONTE',
      ufDestino: 'MG',
      volumesVinculados: ['NF007-001-001', 'NF007-002-001', 'NF008-001-001', 'NF008-002-001', 'NF009-001-001', 'NF009-002-001'],
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      status: 'Finalizada',
      numeroEtiqueta: 'PALETE-174960020957',
      layout: 'Etiqueta 50x100mm',
      formato: 'Etiqueta 50x100mm',
      endereco: 'C-03-01-01',
      operador: 'Carlos Oliveira'
    }
  ]);

  // Volumes disponíveis para unitização
  const [volumesDisponiveis, setVolumesDisponiveis] = useState<VolumeData[]>([
    {
      codigo: 'NF010-001-001',
      notaFiscal: 'NF-123456',
      volume: '1/5',
      tipo: 'Carga Geral',
      area: '01',
      quantidade: 1,
      status: 'Pendente',
      dataGeracao: new Date().toLocaleDateString('pt-BR'),
      peso: '15.5',
      dimensoes: '30x20x15cm',
      remetente: 'Fornecedor ABC',
      destinatario: 'Cliente XYZ',
      cidade: 'São Paulo',
      uf: 'SP'
    },
    {
      codigo: 'NF010-002-001',
      notaFiscal: 'NF-123456',
      volume: '2/5',
      tipo: 'Carga Geral',
      area: '01',
      quantidade: 1,
      status: 'Pendente',
      dataGeracao: new Date().toLocaleDateString('pt-BR'),
      peso: '18.2',
      dimensoes: '35x25x20cm',
      remetente: 'Fornecedor ABC',
      destinatario: 'Cliente XYZ',
      cidade: 'São Paulo',
      uf: 'SP'
    },
    {
      codigo: 'NF010-003-001',
      notaFiscal: 'NF-123456',
      volume: '3/5',
      tipo: 'Carga Geral',
      area: '01',
      quantidade: 1,
      status: 'Pendente',
      dataGeracao: new Date().toLocaleDateString('pt-BR'),
      peso: '22.8',
      dimensoes: '40x30x25cm',
      remetente: 'Fornecedor ABC',
      destinatario: 'Cliente XYZ',
      cidade: 'São Paulo',
      uf: 'SP'
    },
    {
      codigo: 'NF011-001-001',
      notaFiscal: 'NF-789012',
      volume: '1/3',
      tipo: 'Produtos Químicos',
      area: '02',
      quantidade: 1,
      status: 'Pendente',
      dataGeracao: new Date().toLocaleDateString('pt-BR'),
      peso: '25.0',
      dimensoes: '25x25x30cm',
      remetente: 'Fornecedor DEF',
      destinatario: 'Cliente ABC',
      cidade: 'Rio de Janeiro',
      uf: 'RJ'
    },
    {
      codigo: 'NF011-002-001',
      notaFiscal: 'NF-789012',
      volume: '2/3',
      tipo: 'Produtos Químicos',
      area: '02',
      quantidade: 1,
      status: 'Pendente',
      dataGeracao: new Date().toLocaleDateString('pt-BR'),
      peso: '25.0',
      dimensoes: '25x25x30cm',
      remetente: 'Fornecedor DEF',
      destinatario: 'Cliente ABC',
      cidade: 'Rio de Janeiro',
      uf: 'RJ'
    },
    {
      codigo: 'NF012-001-001',
      notaFiscal: 'NF-345678',
      volume: '1/2',
      tipo: 'Eletrônicos',
      area: '03',
      quantidade: 1,
      status: 'Pendente',
      dataGeracao: new Date().toLocaleDateString('pt-BR'),
      peso: '12.5',
      dimensoes: '50x30x10cm',
      remetente: 'Fornecedor GHI',
      destinatario: 'Cliente DEF',
      cidade: 'Brasília',
      uf: 'DF'
    }
  ]);

  // Gerar QR Code para etiqueta
  const generateQRCode = async (data: string) => {
    try {
      const qrCodeUrl = await QRCode.toDataURL(data, {
        width: 128,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataURL(qrCodeUrl);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
    }
  };

  // Filtros de volumes - mostrar apenas volumes disponíveis (Pendente)
  const volumesFiltrados = volumesDisponiveis.filter(volume => {
    const searchLower = searchTerm.toLowerCase();
    return volume.status === 'Pendente' && (
      volume.codigo.toLowerCase().includes(searchLower) ||
      volume.notaFiscal.toLowerCase().includes(searchLower) ||
      volume.tipo.toLowerCase().includes(searchLower) ||
      (volume.remetente && volume.remetente.toLowerCase().includes(searchLower))
    );
  });

  // Gerar número da etiqueta
  const generateEtiquetaNumber = () => {
    const timestamp = Date.now();
    return `PALETE-${timestamp}`;
  };

  // Função para gerar e imprimir etiqueta do palete usando a mesma base do Mix
  const handleGenerateAndPrintPaletLabel = async (palete: EtiquetaMaePalete) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: palete.formato === 'Etiqueta 50x100mm' ? [50, 100] : [100, 150]
      });

      const qrCodeUrl = await QRCode.toDataURL(palete.numeroEtiqueta, {
        width: 128,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' }
      });

      await addPaleteLabelToPDF(pdf, palete, qrCodeUrl);

      const fileName = `etiqueta_palete_${palete.numeroEtiqueta}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      toast.success('Etiqueta do palete gerada e baixada com sucesso');
    } catch (error) {
      console.error('Erro ao gerar etiqueta do palete:', error);
      toast.error('Erro ao gerar etiqueta do palete');
    }
  };

  const addPaleteLabelToPDF = async (pdf: jsPDF, palete: EtiquetaMaePalete, qrCodeDataURL: string) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const isSmallFormat = palete.formato === 'Etiqueta 50x100mm';
    const margin = isSmallFormat ? 2 : 3;
    let currentY = margin + 2;

    // Header Transul
    const headerHeight = isSmallFormat ? 8 : 12;
    const logoX = pageWidth / 2;
    const logoY = margin + (headerHeight / 2);
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(isSmallFormat ? 12 : 16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Transul', logoX, logoY, { align: 'center' });
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(isSmallFormat ? 5 : 7);
    pdf.text('TRANSPORTE', logoX, logoY + 3, { align: 'center' });
    
    currentY = margin + headerHeight + 3;

    // QR Code
    const qrSize = isSmallFormat ? 12 : 16;
    const qrX = pageWidth - margin - qrSize - 2;
    
    if (qrCodeDataURL) {
      pdf.addImage(qrCodeDataURL, 'PNG', qrX, currentY, qrSize, qrSize);
    }

    // Título ETIQUETA MÃE
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(isSmallFormat ? 8 : 12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ETIQUETA MÃE', pageWidth / 2, currentY + 3, { align: 'center' });
    currentY += isSmallFormat ? 8 : 10;

    // Número da etiqueta - fundo amarelo
    const etiquetaHeight = isSmallFormat ? 6 : 8;
    pdf.setFillColor(255, 193, 7);
    pdf.rect(margin + 2, currentY, pageWidth - (margin * 2) - 4, etiquetaHeight, 'F');
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(isSmallFormat ? 10 : 14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`NF: ${palete.numeroEtiqueta}`, margin + 4, currentY + (etiquetaHeight * 0.65));
    currentY += etiquetaHeight + 2;

    // Destino - fundo verde
    const destinoHeight = isSmallFormat ? 6 : 8;
    pdf.setFillColor(34, 197, 94);
    pdf.rect(margin + 2, currentY, pageWidth - (margin * 2) - 4, destinoHeight, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(isSmallFormat ? 8 : 12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Destino: ${palete.cidadeDestino}`, margin + 4, currentY + (destinoHeight * 0.65));
    currentY += destinoHeight + 3;

    // Informações do palete
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(isSmallFormat ? 7 : 9);
    pdf.setFont('helvetica', 'normal');
    
    const infoItems = [
      `Código: ${palete.numeroEtiqueta}`,
      `Volumes: ${palete.volumes}`,
      `Peso Total: ${palete.pesoTotal} kg`,
      `Data: ${palete.dataCriacao}`,
      `Endereço: ${palete.endereco}`,
      `Transportadora: TRANSUL TRANSPORTE`
    ];

    infoItems.forEach(item => {
      pdf.text(`• ${item}`, margin + 2, currentY);
      currentY += isSmallFormat ? 3.5 : 4.5;
    });
  };

  // Funções de manipulação
  const handleAdicionarVolume = (volume: VolumeData) => {
    if (volumesSelecionados.find(v => v.codigo === volume.codigo)) {
      toast.error('Volume já foi adicionado à unitização');
      return;
    }

    // Atualizar status do volume para "Selecionado"
    const volumesAtualizados = volumesDisponiveis.map(v => 
      v.codigo === volume.codigo 
        ? { ...v, status: 'Selecionado' as const }
        : v
    );
    setVolumesDisponiveis(volumesAtualizados);

    // Adicionar volume à seleção
    const volumeSelecionado = { ...volume, status: 'Selecionado' as const };
    const novosVolumes = [...volumesSelecionados, volumeSelecionado];
    setVolumesSelecionados(novosVolumes);
    
    // Atualizar peso total
    const pesoTotal = novosVolumes.reduce((acc, v) => {
      const peso = parseFloat(v.peso || '0');
      return acc + peso;
    }, 0);
    
    setEtiquetaConfig(prev => ({
      ...prev,
      pesoTotal: pesoTotal.toFixed(1),
      volumes: novosVolumes.length
    }));

    toast.success(`Volume ${volume.codigo} selecionado para o palete`);
  };

  const handleRemoverVolume = (volumeCodigo: string) => {
    // Retornar volume para status "Pendente"
    const volumesAtualizados = volumesDisponiveis.map(v => 
      v.codigo === volumeCodigo 
        ? { ...v, status: 'Pendente' as const }
        : v
    );
    setVolumesDisponiveis(volumesAtualizados);

    // Remover da seleção
    const novosVolumes = volumesSelecionados.filter(v => v.codigo !== volumeCodigo);
    setVolumesSelecionados(novosVolumes);
    
    // Atualizar peso total
    const pesoTotal = novosVolumes.reduce((acc, v) => {
      const peso = parseFloat(v.peso || '0');
      return acc + peso;
    }, 0);
    
    setEtiquetaConfig(prev => ({
      ...prev,
      pesoTotal: pesoTotal.toFixed(1),
      volumes: novosVolumes.length
    }));

    toast.success('Volume removido do palete e retornado para disponíveis');
  };

  const handleCriarPalete = async () => {
    if (volumesSelecionados.length === 0) {
      toast.error('Adicione pelo menos um volume ao palete');
      return;
    }

    if (!etiquetaConfig.endereco) {
      toast.error('Informe o endereço de destino do palete');
      return;
    }

    const numeroEtiqueta = generateEtiquetaNumber();
    
    // Criar etiqueta mãe palete usando a mesma estrutura do Mix
    const novoPalete: EtiquetaMaePalete = {
      id: numeroEtiqueta,
      descricao: etiquetaConfig.descricao,
      tipo: 'Palete',
      volumes: volumesSelecionados.length,
      pesoTotal: etiquetaConfig.pesoTotal,
      cidadeDestino: volumesSelecionados[0]?.cidade || 'SÃO PAULO',
      ufDestino: volumesSelecionados[0]?.uf || 'SP',
      volumesVinculados: volumesSelecionados.map(v => v.codigo),
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
      status: 'Ativa',
      numeroEtiqueta,
      layout: etiquetaConfig.layout,
      formato: etiquetaConfig.formato,
      endereco: etiquetaConfig.endereco,
      operador: 'Sistema'
    };

    // Gerar QR Code usando os mesmos parâmetros do Mix
    await generateQRCode(numeroEtiqueta);

    // Gerar etiqueta automaticamente usando o mesmo sistema do Mix
    await handleGenerateAndPrintPaletLabel(novoPalete);

    // Atualizar volumes para status unitizado
    const volumesAtualizados = volumesDisponiveis.map(volume => {
      if (volumesSelecionados.some(v => v.codigo === volume.codigo)) {
        return { ...volume, status: 'Unitizado' as const, etiquetaMae: numeroEtiqueta };
      }
      return volume;
    });

    setVolumesDisponiveis(volumesAtualizados);
    setEtiquetasPalete([novoPalete, ...etiquetasPalete]);
    setSelectedEtiquetaMae(novoPalete);
    
    // Limpar seleções
    setVolumesSelecionados([]);
    setEtiquetaConfig(prev => ({
      ...prev,
      pesoTotal: '0',
      volumes: 0,
      endereco: '',
      descricao: 'Palete de Unitização'
    }));

    toast.success(`Palete ${numeroEtiqueta} criado e etiqueta gerada com sucesso`);
    setShowPreview(true);
  };



  const handleViewDetails = (palete: EtiquetaMaePalete) => {
    setSelectedEtiquetaMae(palete);
    setShowDetailsDialog(true);
  };

  const handlePrintEtiqueta = async () => {
    if (!printRef.current || !selectedEtiquetaMae) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [50, 100]
      });

      const imgWidth = 50;
      const imgHeight = 100;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`palete-${selectedEtiquetaMae.numeroEtiqueta}.pdf`);
      
      toast.success('Etiqueta enviada para impressão');
    } catch (error) {
      console.error('Erro ao imprimir:', error);
      toast.error('Erro ao gerar etiqueta para impressão');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Pendente': 'outline',
      'Selecionado': 'default',
      'Gerada': 'secondary',
      'Impressa': 'default',
      'Processada': 'default',
      'Unitizado': 'secondary',
      'Ativa': 'default',
      'Finalizada': 'secondary',
      'Cancelada': 'destructive'
    } as const;
    
    const colors = {
      'Pendente': 'text-gray-600 bg-gray-100',
      'Selecionado': 'text-blue-600 bg-blue-100',
      'Gerada': 'text-green-600 bg-green-100',
      'Impressa': 'text-purple-600 bg-purple-100',
      'Processada': 'text-indigo-600 bg-indigo-100',
      'Unitizado': 'text-orange-600 bg-orange-100',
      'Ativa': 'text-emerald-600 bg-emerald-100',
      'Finalizada': 'text-slate-600 bg-slate-100',
      'Cancelada': 'text-red-600 bg-red-100'
    } as const;
    
    return (
      <Badge 
        variant={variants[status as keyof typeof variants] || 'secondary'}
        className={colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100'}
      >
        {status}
      </Badge>
    );
  };

  // Gerar QR Code inicial
  useEffect(() => {
    if (selectedEtiquetaMae) {
      generateQRCode(selectedEtiquetaMae.numeroEtiqueta);
    }
  }, [selectedEtiquetaMae]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Unitização de Paletes</h1>
          <p className="text-gray-600">
            Organize e agrupe volumes em paletes utilizando etiquetas mãe para facilitar o armazenamento e movimentação
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Package className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-xl font-bold">{volumesDisponiveis.filter(v => v.status === 'Pendente').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PackageCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Selecionados</p>
                  <p className="text-xl font-bold">{volumesDisponiveis.filter(v => v.status === 'Selecionado').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <PackageX className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unitizados</p>
                  <p className="text-xl font-bold">{volumesDisponiveis.filter(v => v.status === 'Unitizado').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paletes Ativos</p>
                  <p className="text-xl font-bold">{etiquetasPalete.filter(p => p.status === 'Ativa').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Paletes Finalizados</p>
                  <p className="text-xl font-bold">{etiquetasPalete.filter(p => p.status === 'Finalizada').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="criar">Criar Palete</TabsTrigger>
            <TabsTrigger value="gerenciar">Gerenciar Paletes</TabsTrigger>
          </TabsList>

          {/* Criar Palete Tab */}
          <TabsContent value="criar" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Configuração do Palete */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PackageCheck className="h-5 w-5" />
                      Configuração do Palete
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Descrição do Palete</Label>
                      <Input
                        value={etiquetaConfig.descricao}
                        onChange={(e) => setEtiquetaConfig(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Ex: Palete Setor A, Palete Exportação..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Tipo</Label>
                        <Select 
                          value={etiquetaConfig.tipo} 
                          onValueChange={(value) => setEtiquetaConfig(prev => ({ ...prev, tipo: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Palete">Palete</SelectItem>
                            <SelectItem value="Container">Container</SelectItem>
                            <SelectItem value="Carga Geral">Carga Geral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Layout</Label>
                        <Select 
                          value={etiquetaConfig.layout} 
                          onValueChange={(value) => setEtiquetaConfig(prev => ({ ...prev, layout: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Etiqueta 50x100mm">Etiqueta 50x100mm</SelectItem>
                            <SelectItem value="Etiqueta 80x120mm">Etiqueta 80x120mm</SelectItem>
                            <SelectItem value="Etiqueta A4">Etiqueta A4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Endereço de Destino</Label>
                      <Input
                        value={etiquetaConfig.endereco}
                        onChange={(e) => setEtiquetaConfig(prev => ({ ...prev, endereco: e.target.value }))}
                        placeholder="Ex: A-01-02-01"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Volumes Selecionados</Label>
                        <Input
                          value={etiquetaConfig.volumes}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <Label>Peso Total (kg)</Label>
                        <Input
                          value={etiquetaConfig.pesoTotal}
                          readOnly
                          className="bg-gray-50"
                        />
                      </div>
                    </div>

                    {/* Volumes Selecionados */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Volumes no Palete</Label>
                      {volumesSelecionados.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum volume selecionado</p>
                          <p className="text-sm">Busque e adicione volumes da lista ao lado</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-3">
                          {volumesSelecionados.map((volume) => (
                            <div key={volume.codigo} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                              <div className="flex-1">
                                <p className="font-mono text-sm font-medium">{volume.codigo}</p>
                                <p className="text-xs text-gray-600">{volume.notaFiscal} - {volume.volume}</p>
                                <p className="text-xs text-gray-500">Peso: {volume.peso}kg - {volume.tipo}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoverVolume(volume.codigo)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleCriarPalete}
                        disabled={volumesSelecionados.length === 0}
                        className="flex-1"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Palete e Gerar Etiqueta
                      </Button>
                      
                      {/* Botão de Teste para Demonstração */}
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Teste: Selecionar primeiro volume disponível
                          const primeiroVolume = volumesDisponiveis.find(v => v.status === 'Pendente');
                          if (primeiroVolume) {
                            handleAdicionarVolume(primeiroVolume);
                            toast.success('Teste: Volume selecionado automaticamente');
                          } else {
                            toast.error('Nenhum volume pendente disponível para teste');
                          }
                        }}
                        className="px-3"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Teste
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Volumes Disponíveis */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Volumes Disponíveis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Busca */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                        <Input
                          placeholder="Buscar por código, nota fiscal, tipo..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Lista de Volumes */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {volumesFiltrados.map((volume) => (
                        <div
                          key={volume.codigo}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleAdicionarVolume(volume)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono font-medium">{volume.codigo}</span>
                              {getStatusBadge(volume.status)}
                            </div>
                            <p className="text-sm text-gray-600">{volume.notaFiscal} - {volume.volume}</p>
                            <div className="flex gap-4 text-xs text-gray-500 mt-1">
                              <span>Peso: {volume.peso}kg</span>
                              <span>Tipo: {volume.tipo}</span>
                              <span>Destino: {volume.cidade}/{volume.uf}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {volumesFiltrados.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <PackageX className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhum volume encontrado</p>
                          <p className="text-sm">Ajuste os filtros de busca</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Gerenciar Paletes Tab */}
          <TabsContent value="gerenciar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paletes Criados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número do Palete</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Volumes</TableHead>
                        <TableHead>Peso Total</TableHead>
                        <TableHead>Destino</TableHead>
                        <TableHead>Endereço</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {etiquetasPalete.map((palete) => (
                        <TableRow key={palete.id}>
                          <TableCell className="font-mono">{palete.numeroEtiqueta}</TableCell>
                          <TableCell>{palete.descricao}</TableCell>
                          <TableCell>{palete.volumes}</TableCell>
                          <TableCell>{palete.pesoTotal} kg</TableCell>
                          <TableCell>{palete.cidadeDestino}/{palete.ufDestino}</TableCell>
                          <TableCell>{palete.endereco}</TableCell>
                          <TableCell>{palete.dataCriacao}</TableCell>
                          <TableCell>{getStatusBadge(palete.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(palete)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedEtiquetaMae(palete);
                                  setShowPreview(true);
                                }}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Preview Dialog - usando o mesmo layout do Mix */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Preview da Etiqueta Palete</DialogTitle>
            </DialogHeader>
            {selectedEtiquetaMae && (
              <div className="space-y-4">
                <div 
                  ref={printRef}
                  className="bg-white border-2 border-gray-300 p-4 rounded-lg shadow-lg"
                  style={{ width: '200px', height: '400px', margin: '0 auto' }}
                >
                  {/* Logo Transul centralizado no topo */}
                  <div className="flex justify-center mb-3">
                    <TransulLogo width={80} height={24} />
                  </div>
                  
                  {/* Título */}
                  <div className="text-center mb-3">
                    <h3 className="text-sm font-bold uppercase">PALETE</h3>
                  </div>
                  
                  {/* Número da Etiqueta */}
                  <div className="text-center mb-3">
                    <div className="text-xs font-bold bg-black text-white px-2 py-1 rounded">
                      {selectedEtiquetaMae.numeroEtiqueta}
                    </div>
                  </div>
                  
                  {/* QR Code */}
                  {qrCodeDataURL && (
                    <div className="flex justify-center mb-3">
                      <img src={qrCodeDataURL} alt="QR Code" className="w-16 h-16" />
                    </div>
                  )}
                  
                  {/* Informações principais */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong>Descrição:</strong><br />
                      {selectedEtiquetaMae.descricao}
                    </div>
                    
                    <div>
                      <strong>Volumes:</strong> {selectedEtiquetaMae.volumes}<br />
                      <strong>Peso:</strong> {selectedEtiquetaMae.pesoTotal} kg
                    </div>
                    
                    <div>
                      <strong>Destino:</strong><br />
                      {selectedEtiquetaMae.cidadeDestino}/{selectedEtiquetaMae.ufDestino}
                    </div>
                    
                    {selectedEtiquetaMae.endereco && (
                      <div>
                        <strong>Endereço:</strong><br />
                        {selectedEtiquetaMae.endereco}
                      </div>
                    )}
                    
                    <div>
                      <strong>Data:</strong> {selectedEtiquetaMae.dataCriacao}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowPreview(false)} className="flex-1">
                    Fechar
                  </Button>
                  <Button onClick={handlePrintEtiqueta} className="flex-1">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Palete</DialogTitle>
            </DialogHeader>
            {selectedEtiquetaMae && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Número do Palete</Label>
                    <p className="text-lg font-mono">{selectedEtiquetaMae.numeroEtiqueta}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    {getStatusBadge(selectedEtiquetaMae.status)}
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Descrição</Label>
                    <p>{selectedEtiquetaMae.descricao}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo</Label>
                    <p>{selectedEtiquetaMae.tipo}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Data de Criação</Label>
                    <p>{selectedEtiquetaMae.dataCriacao}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Operador</Label>
                    <p>{selectedEtiquetaMae.operador}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Destino</Label>
                    <p>{selectedEtiquetaMae.cidadeDestino}/{selectedEtiquetaMae.ufDestino}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Endereço</Label>
                    <p>{selectedEtiquetaMae.endereco}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Quantidade de Volumes</Label>
                    <p className="text-lg font-bold">{selectedEtiquetaMae.volumes}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Peso Total</Label>
                    <p className="text-lg font-bold">{selectedEtiquetaMae.pesoTotal} kg</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    Volumes Vinculados ({selectedEtiquetaMae.volumesVinculados.length})
                  </Label>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código</TableHead>
                          <TableHead>Nota Fiscal</TableHead>
                          <TableHead>Volume</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedEtiquetaMae.volumesVinculados.map((volumeCodigo) => {
                          const volume = volumesDisponiveis.find(v => v.codigo === volumeCodigo);
                          return (
                            <TableRow key={volumeCodigo}>
                              <TableCell className="font-mono">{volumeCodigo}</TableCell>
                              <TableCell>{volume?.notaFiscal || '-'}</TableCell>
                              <TableCell>{volume?.volume || '-'}</TableCell>
                              <TableCell>{volume ? getStatusBadge(volume.status) : '-'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)} className="flex-1">
                    Fechar
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setShowDetailsDialog(false);
                      setShowPreview(true);
                    }}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Etiqueta
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Unitizacao;