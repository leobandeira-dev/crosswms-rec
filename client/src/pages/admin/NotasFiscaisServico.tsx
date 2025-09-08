import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Calculator, 
  TrendingUp, 
  AlertCircle,
  Search,
  Download,
  Eye,
  Plus,
  Calendar,
  Printer
} from 'lucide-react';

const NotasFiscaisServico = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('mes');
  const [selectedNota, setSelectedNota] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { toast } = useToast();

  const notasServico = [
    {
      id: '1',
      numero: 'NFS-2024-001',
      cliente: 'TRANSUL Logística',
      cnpj: '12.345.678/0001-90',
      servico: 'Armazenagem e Movimentação',
      valor: 2500.00,
      impostos: 375.00,
      dataEmissao: '2024-01-25',
      status: 'emitida',
      operador: 'Sistema'
    },
    {
      id: '2',
      numero: 'NFS-2024-002',
      cliente: 'LogiMax Transportes',
      cnpj: '98.765.432/0001-10',
      servico: 'Gestão de Estoque',
      valor: 1800.00,
      impostos: 270.00,
      dataEmissao: '2024-01-24',
      status: 'emitida',
      operador: 'Sistema'
    },
    {
      id: '3',
      numero: 'NFS-2024-003',
      cliente: 'Distribuidora Sul',
      cnpj: '33.444.555/0001-66',
      servico: 'Serviços de Expedição',
      valor: 3200.00,
      impostos: 480.00,
      dataEmissao: '2024-01-23',
      status: 'pendente',
      operador: 'Admin'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emitida':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalMensal = notasServico
    .filter(nota => nota.status === 'emitida')
    .reduce((sum, nota) => sum + nota.valor, 0);

  const totalImpostos = notasServico
    .filter(nota => nota.status === 'emitida')
    .reduce((sum, nota) => sum + nota.impostos, 0);

  const handleViewNota = (nota: any) => {
    setSelectedNota(nota);
    setIsViewModalOpen(true);
  };

  const handleDownloadNota = (notaId: string) => {
    toast({
      title: "Download Iniciado",
      description: `Download da nota fiscal ${notaId} foi iniciado`,
    });
  };

  const handleCreateNota = () => {
    toast({
      title: "Nova Nota Fiscal",
      description: "Abrindo formulário para criação de nova nota fiscal",
    });
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8 text-purple-600" />
            Notas Fiscais de Serviço
          </h1>
          <p className="text-gray-600">
            Gestão e emissão de notas fiscais de serviços prestados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">NFS Este Mês</p>
                  <p className="text-2xl font-bold text-blue-600">47</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Faturamento Total</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Impostos</p>
                  <p className="text-2xl font-bold text-orange-600">
                    R$ {totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">NFS Pendentes</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Notas Fiscais de Serviço</CardTitle>
                <CardDescription>
                  Gestão completa das notas fiscais de serviços prestados
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semana">Esta Semana</SelectItem>
                    <SelectItem value="mes">Este Mês</SelectItem>
                    <SelectItem value="trimestre">Trimestre</SelectItem>
                    <SelectItem value="ano">Este Ano</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Buscar por número ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova NFS
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Impostos</TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notasServico
                  .filter(nota => 
                    nota.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    nota.cliente.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((nota) => (
                  <TableRow key={nota.id}>
                    <TableCell className="font-mono font-medium">{nota.numero}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{nota.cliente}</p>
                        <p className="text-sm text-gray-600">{nota.cnpj}</p>
                      </div>
                    </TableCell>
                    <TableCell>{nota.servico}</TableCell>
                    <TableCell className="font-medium">
                      R$ {nota.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      R$ {nota.impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {nota.dataEmissao}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(nota.status)}>
                        {nota.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleViewNota(nota)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDownloadNota(nota.numero)}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Invoice Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes da Nota Fiscal de Serviço</DialogTitle>
              <DialogDescription>
                Informações completas da nota fiscal selecionada
              </DialogDescription>
            </DialogHeader>
            {selectedNota && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Número da Nota</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedNota?.numero}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Cliente</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedNota?.cliente}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">CNPJ</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedNota?.cnpj}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Serviço</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedNota?.servico}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Valor</label>
                  <p className="text-sm text-gray-600 mt-1">
                    R$ {selectedNota?.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Impostos</label>
                  <p className="text-sm text-gray-600 mt-1">
                    R$ {selectedNota?.impostos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Data de Emissão</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedNota?.dataEmissao}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm text-gray-600 mt-1">{selectedNota?.status}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default NotasFiscaisServico;