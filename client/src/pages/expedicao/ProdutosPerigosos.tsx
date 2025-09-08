import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ExcelService, DangerousGoodsRecord } from '@/services/excelService';
import { 
  Upload, 
  Download, 
  AlertTriangle, 
  Package,
  FileSpreadsheet,
  Search,
  Eye,
  Filter,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Building,
  User,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  BarChart3
} from 'lucide-react';

// Mock data for dangerous goods
const mockDangerousGoods = [
  {
    id: 1,
    numeroOnu: '1203',
    nomeShipping: 'GASOLINE',
    nomeTecnico: 'Gasolina',
    classeRisco: '3',
    numeroRisco: '33',
    grupoEmbalagem: 'II',
    quantidadeIsenta: '1L',
    categoria: 'Líquido Inflamável'
  },
  {
    id: 2,
    numeroOnu: '1170',
    nomeShipping: 'ETHANOL',
    nomeTecnico: 'Álcool Etílico',
    classeRisco: '3',
    numeroRisco: '33',
    grupoEmbalagem: 'II',
    quantidadeIsenta: '1L',
    categoria: 'Líquido Inflamável'
  },
  {
    id: 3,
    numeroOnu: '1789',
    nomeShipping: 'HYDROCHLORIC ACID',
    nomeTecnico: 'Ácido Clorídrico',
    classeRisco: '8',
    numeroRisco: '80',
    grupoEmbalagem: 'II',
    quantidadeIsenta: '30ml',
    categoria: 'Substância Corrosiva'
  }
];

export default function ProdutosPerigosos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [products, setProducts] = useState(mockDangerousGoods);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state for adding new product
  const [newProduct, setNewProduct] = useState({
    numeroOnu: '',
    nomeShipping: '',
    nomeTecnico: '',
    classeRisco: '',
    numeroRisco: '',
    grupoEmbalagem: '',
    quantidadeIsenta: '',
    categoria: ''
  });

  const filteredProducts = products.filter(product =>
    product.numeroOnu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.nomeShipping.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.nomeTecnico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo Excel para importar');
      return;
    }

    try {
      const records = await ExcelService.parseExcelFile(selectedFile);
      setProducts(prev => [...prev, ...records.map((record, index) => ({
        id: prev.length + index + 1,
        numeroOnu: record.numeroONU,
        nomeShipping: record.nomeShipping,
        nomeTecnico: record.nomeTecnico,
        classeRisco: record.classeRisco,
        numeroRisco: record.numeroRisco,
        grupoEmbalagem: record.grupoEmbalagem,
        quantidadeIsenta: record.quantidadeIsenta,
        categoria: record.categoria
      }))]);
      
      toast.success(`${records.length} produtos importados com sucesso!`);
      setShowUploadDialog(false);
      setSelectedFile(null);
    } catch (error) {
      toast.error('Erro ao importar arquivo. Verifique o formato.');
      console.error('Import error:', error);
    }
  };

  const downloadTemplate = () => {
    ExcelService.downloadTemplate();
    toast.success('Template baixado com sucesso!');
  };

  const handleAddProduct = () => {
    if (!newProduct.numeroOnu || !newProduct.nomeShipping) {
      toast.error('Preencha pelo menos o número ONU e nome shipping');
      return;
    }

    const product = {
      id: products.length + 1,
      ...newProduct
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      numeroOnu: '',
      nomeShipping: '',
      nomeTecnico: '',
      classeRisco: '',
      numeroRisco: '',
      grupoEmbalagem: '',
      quantidadeIsenta: '',
      categoria: ''
    });
    setShowAddDialog(false);
    toast.success('Produto adicionado com sucesso!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            Produtos Perigosos
          </h1>
          <p className="text-gray-600">Gestão completa de produtos perigosos e embarques</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
          >
            <Download className="w-4 h-4 mr-2" />
            Template
          </Button>
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Importar Base
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importar Base de Produtos Perigosos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file">Arquivo Excel (.xlsx)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".xlsx,.xls"
                    ref={fileInputRef}
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleFileUpload}>
                    Importar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Produto Perigoso</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numeroOnu">Número ONU *</Label>
                  <Input
                    id="numeroOnu"
                    value={newProduct.numeroOnu}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, numeroOnu: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="nomeShipping">Nome Shipping *</Label>
                  <Input
                    id="nomeShipping"
                    value={newProduct.nomeShipping}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, nomeShipping: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="nomeTecnico">Nome Técnico</Label>
                  <Input
                    id="nomeTecnico"
                    value={newProduct.nomeTecnico}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, nomeTecnico: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="classeRisco">Classe de Risco</Label>
                  <Input
                    id="classeRisco"
                    value={newProduct.classeRisco}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, classeRisco: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="numeroRisco">Número de Risco</Label>
                  <Input
                    id="numeroRisco"
                    value={newProduct.numeroRisco}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, numeroRisco: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="grupoEmbalagem">Grupo Embalagem</Label>
                  <Input
                    id="grupoEmbalagem"
                    value={newProduct.grupoEmbalagem}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, grupoEmbalagem: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="quantidadeIsenta">Quantidade Isenta</Label>
                  <Input
                    id="quantidadeIsenta"
                    value={newProduct.quantidadeIsenta}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, quantidadeIsenta: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input
                    id="categoria"
                    value={newProduct.categoria}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, categoria: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddProduct}>
                  Adicionar Produto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 desde o último mês
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classe 3 (Inflamáveis)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.classeRisco === '3').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Líquidos inflamáveis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classe 8 (Corrosivos)</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.classeRisco === '8').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Substâncias corrosivas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grupo II</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.grupoEmbalagem === 'II').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Perigo médio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="database" className="space-y-6">
        <TabsList>
          <TabsTrigger value="database">Base de Dados</TabsTrigger>
          <TabsTrigger value="shipping">Embarques</TabsTrigger>
          <TabsTrigger value="tracking">Rastreamento</TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Base de Produtos Perigosos</CardTitle>
                <Button>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por ONU, nome shipping ou nome técnico..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ONU</TableHead>
                      <TableHead>Nome Shipping</TableHead>
                      <TableHead>Nome Técnico</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Nº Risco</TableHead>
                      <TableHead>Grupo Emb.</TableHead>
                      <TableHead>Qtd. Isenta</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.numeroOnu}</TableCell>
                        <TableCell>{product.nomeShipping}</TableCell>
                        <TableCell>{product.nomeTecnico}</TableCell>
                        <TableCell>
                          <Badge variant={product.classeRisco === '3' ? 'destructive' : 'secondary'}>
                            {product.classeRisco}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.numeroRisco}</TableCell>
                        <TableCell>{product.grupoEmbalagem}</TableCell>
                        <TableCell>{product.quantidadeIsenta}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.categoria}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
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

        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Embarques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Truck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhum embarque registrado</p>
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Embarque
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rastreamento de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Sistema de rastreamento em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}