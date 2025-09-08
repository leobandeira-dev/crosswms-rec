
import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import SearchFilter from '../../components/common/SearchFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '../../components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, User, Truck, FileText } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

// Mock data
const motoristas = [
  { 
    id: 1, 
    nome: 'José da Silva', 
    cpf: '123.456.789-00', 
    telefone: '(11) 98765-4321', 
    cnhCategoria: 'E', 
    cnhValidade: '15/10/2025',
    status: 'active'
  },
  { 
    id: 2, 
    nome: 'Carlos Santos', 
    cpf: '987.654.321-00', 
    telefone: '(11) 91234-5678', 
    cnhCategoria: 'E', 
    cnhValidade: '22/03/2024',
    status: 'active'
  },
  { 
    id: 3, 
    nome: 'Pedro Oliveira', 
    cpf: '456.789.123-00', 
    telefone: '(21) 99876-5432', 
    cnhCategoria: 'D', 
    cnhValidade: '05/07/2023',
    status: 'inactive'
  },
];

const veiculos = [
  {
    id: 1,
    placa: 'ABC-1234',
    tipo: 'Carreta',
    modelo: 'Mercedes-Benz Axor',
    ano: 2020,
    capacidade: '30 toneladas',
    renavam: '00123456789',
    status: 'active'
  },
  {
    id: 2,
    placa: 'DEF-5678',
    tipo: 'Van',
    modelo: 'Sprinter 415',
    ano: 2021,
    capacidade: '1.5 toneladas',
    renavam: '00987654321',
    status: 'maintenance'
  },
  {
    id: 3,
    placa: 'GHI-9012',
    tipo: 'Truck',
    modelo: 'Volkswagen Delivery',
    ano: 2019,
    capacidade: '8 toneladas',
    renavam: '00456789123',
    status: 'active'
  }
];

const CadastroMotoristas = () => {
  const [isMotoristaDialogOpen, setIsMotoristaDialogOpen] = useState(false);
  const [isVeiculoDialogOpen, setIsVeiculoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('motoristas');
  const [currentPage, setCurrentPage] = useState(1);
  
  const filters = [
    {
      name: 'Status',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Ativo', value: 'active' },
        { label: 'Inativo', value: 'inactive' },
      ]
    }
  ];
  
  const veiculoFilters = [
    {
      name: 'Status',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Ativo', value: 'active' },
        { label: 'Em Manutenção', value: 'maintenance' },
        { label: 'Inativo', value: 'inactive' },
      ]
    },
    {
      name: 'Tipo',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Carreta', value: 'carreta' },
        { label: 'Van', value: 'van' },
        { label: 'Truck', value: 'truck' },
      ]
    }
  ];
  
  const handleSearch = (value: string) => {
    console.log('Search:', value);
    // Implementar lógica de busca
  };
  
  const handleFilterChange = (filter: string, value: string) => {
    console.log(`Filter ${filter} changed to ${value}`);
    // Implementar lógica de filtro
  };

  return (
    <MainLayout title="Cadastro de Motoristas e Veículos">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-heading">Gestão de Cadastros</h2>
          <p className="text-gray-500">Gerencie motoristas e veículos no sistema</p>
        </div>
      </div>
      
      <Tabs defaultValue="motoristas" className="w-full mb-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="motoristas" className="flex items-center">
            <User className="mr-2 h-4 w-4" /> Motoristas
          </TabsTrigger>
          <TabsTrigger value="veiculos" className="flex items-center">
            <Truck className="mr-2 h-4 w-4" /> Veículos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="motoristas">
          <div className="flex justify-end mb-4">
            <Dialog open={isMotoristaDialogOpen} onOpenChange={setIsMotoristaDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cross-blue hover:bg-cross-blueDark">
                  <Plus className="mr-2 h-4 w-4" /> Novo Motorista
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Cadastro de Motorista</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do motorista. Todos os campos marcados com * são obrigatórios.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input id="nome" placeholder="Nome do motorista" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input id="cpf" placeholder="000.000.000-00" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input id="telefone" placeholder="(00) 00000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" placeholder="email@exemplo.com" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="data-nascimento">Data de Nascimento *</Label>
                      <Input id="data-nascimento" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnh">Número CNH *</Label>
                      <Input id="cnh" placeholder="00000000000" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cnh-categoria">Categoria CNH *</Label>
                      <Select>
                        <SelectTrigger id="cnh-categoria">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                          <SelectItem value="E">E</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnh-validade">Validade CNH *</Label>
                      <Input id="cnh-validade" type="date" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cnh-file">Upload CNH (Frente e Verso)</Label>
                    <Input id="cnh-file" type="file" accept="image/*,application/pdf" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço Completo *</Label>
                    <Input id="endereco" placeholder="Rua, número, complemento" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade *</Label>
                      <Input id="cidade" placeholder="Cidade" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado *</Label>
                      <Select>
                        <SelectTrigger id="estado">
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SP">SP</SelectItem>
                          <SelectItem value="RJ">RJ</SelectItem>
                          <SelectItem value="MG">MG</SelectItem>
                          <SelectItem value="ES">ES</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP *</Label>
                      <Input id="cep" placeholder="00000-000" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsMotoristaDialogOpen(false)}>Cancelar</Button>
                  <Button className="bg-cross-blue hover:bg-cross-blueDark">Salvar Motorista</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <SearchFilter 
            placeholder="Buscar por nome, CPF ou telefone..."
            filters={filters}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Motoristas Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { header: 'ID', accessor: 'id' },
                  { header: 'Nome', accessor: 'nome' },
                  { header: 'CPF', accessor: 'cpf' },
                  { header: 'Telefone', accessor: 'telefone' },
                  { header: 'Categoria CNH', accessor: 'cnhCategoria' },
                  { header: 'Validade CNH', accessor: 'cnhValidade' },
                  { 
                    header: 'Status', 
                    accessor: 'status',
                    cell: (row) => {
                      const statusMap: any = {
                        'active': { type: 'success', text: 'Ativo' },
                        'inactive': { type: 'error', text: 'Inativo' },
                      };
                      const status = statusMap[row.status];
                      return <StatusBadge status={status.type} text={status.text} />;
                    }
                  },
                  { 
                    header: 'Ações', 
                    accessor: '',
                    cell: (row) => (
                      <div className="flex space-x-2 justify-end">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" /> Documentos
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Editar:', row);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  }
                ]}
                data={motoristas}
                pagination={{
                  totalPages: Math.ceil(motoristas.length / 10),
                  currentPage: currentPage,
                  onPageChange: setCurrentPage
                }}
                onRowClick={(row) => console.log('Row clicked:', row)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="veiculos">
          <div className="flex justify-end mb-4">
            <Dialog open={isVeiculoDialogOpen} onOpenChange={setIsVeiculoDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cross-blue hover:bg-cross-blueDark">
                  <Plus className="mr-2 h-4 w-4" /> Novo Veículo
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Cadastro de Veículo</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do veículo. Todos os campos marcados com * são obrigatórios.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="placa">Placa *</Label>
                      <Input id="placa" placeholder="AAA-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="renavam">RENAVAM *</Label>
                      <Input id="renavam" placeholder="00000000000" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Veículo *</Label>
                      <Select>
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="carreta">Carreta</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="utilitario">Utilitário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacidade">Capacidade de Carga *</Label>
                      <Input id="capacidade" placeholder="Peso em toneladas" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marca">Marca *</Label>
                      <Input id="marca" placeholder="Marca do veículo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="modelo">Modelo *</Label>
                      <Input id="modelo" placeholder="Modelo do veículo" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ano">Ano *</Label>
                      <Input id="ano" type="number" placeholder="Ano do veículo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cor">Cor</Label>
                      <Input id="cor" placeholder="Cor do veículo" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="documento-veiculo">Documento do Veículo</Label>
                    <Input id="documento-veiculo" type="file" accept="image/*,application/pdf" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="antt">Número ANTT</Label>
                      <Input id="antt" placeholder="ANTT se aplicável" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status-veiculo">Status</Label>
                      <Select>
                        <SelectTrigger id="status-veiculo">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="maintenance">Em Manutenção</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input id="observacoes" placeholder="Informações adicionais" />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsVeiculoDialogOpen(false)}>Cancelar</Button>
                  <Button className="bg-cross-blue hover:bg-cross-blueDark">Salvar Veículo</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <SearchFilter 
            placeholder="Buscar por placa, modelo ou RENAVAM..."
            filters={veiculoFilters}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Veículos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { header: 'Placa', accessor: 'placa' },
                  { header: 'Tipo', accessor: 'tipo' },
                  { header: 'Modelo', accessor: 'modelo' },
                  { header: 'Ano', accessor: 'ano' },
                  { header: 'Capacidade', accessor: 'capacidade' },
                  { header: 'RENAVAM', accessor: 'renavam' },
                  { 
                    header: 'Status', 
                    accessor: 'status',
                    cell: (row) => {
                      const statusMap: any = {
                        'active': { type: 'success', text: 'Ativo' },
                        'maintenance': { type: 'warning', text: 'Em Manutenção' },
                        'inactive': { type: 'error', text: 'Inativo' },
                      };
                      const status = statusMap[row.status];
                      return <StatusBadge status={status.type} text={status.text} />;
                    }
                  },
                  { 
                    header: 'Ações', 
                    accessor: '',
                    cell: (row) => (
                      <div className="flex space-x-2 justify-end">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" /> Documentos
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Editar:', row);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  }
                ]}
                data={veiculos}
                pagination={{
                  totalPages: Math.ceil(veiculos.length / 10),
                  currentPage: currentPage,
                  onPageChange: setCurrentPage
                }}
                onRowClick={(row) => console.log('Row clicked:', row)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default CadastroMotoristas;
