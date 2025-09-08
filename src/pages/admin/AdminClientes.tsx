import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, UserPlus, Building, Phone, Mail, MapPin, Eye, Edit, Trash2, Save, X, Package, Loader2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import PackageSelection from '@/components/admin/PackageSelection';
import GerenciamentoPacotes from '@/components/admin/GerenciamentoPacotes';
import { toast } from '@/hooks/use-toast';

interface PackageOption {
  id: string;
  nome: string;
  tipo_pacote: string;
  preco_mensal: number;
  descricao?: string;
}

interface Cliente {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  cidade: string;
  uf: string;
  status: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  inscricao_estadual?: string;
  complemento?: string;
  website?: string;
  configuracoes?: any;
  created_at: string;
}

const clienteFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cnpj: z.string().min(14, "CNPJ deve ter 14 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 caracteres"),
  logradouro: z.string().min(2, "Logradouro deve ter pelo menos 2 caracteres"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
  cidade: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  uf: z.string().length(2, "UF deve ter 2 caracteres"),
  cep: z.string().min(8, "CEP deve ter pelo menos 8 caracteres"),
  status: z.enum(["ativo", "inativo", "pendente"]),
});

type ClienteFormData = z.infer<typeof clienteFormSchema>;

export default function AdminClientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [gerenciandoPacotesCliente, setGerenciandoPacotesCliente] = useState<Cliente | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>(['plataforma-wms']); // Obrigatório
  const [selectedProcessingPlan, setSelectedProcessingPlan] = useState<string>('');
  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);
  const queryClient = useQueryClient();

  const { data: clientes = [], isLoading } = useQuery<Cliente[]>({
    queryKey: ['/api/admin/clientes'],
  });

  const { data: packages = [] } = useQuery<PackageOption[]>({
    queryKey: ['/api/pacotes-disponiveis'],
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: ClienteFormData) => {
      const response = await fetch('/api/admin/clientes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Erro ao criar cliente transportador');
      }
      return response.json();
    },
    onSuccess: async (newCliente) => {
      // Criar assinaturas após criar o cliente
      if (selectedModules.length > 0 || selectedProcessingPlan) {
        await updateSubscriptionMutation.mutateAsync({
          empresaId: newCliente.id,
          modules: selectedModules,
          processingPlan: selectedProcessingPlan
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clientes'] });
      setIsCreateModalOpen(false);
      createForm.reset();
      setSelectedModules(['plataforma-wms']);
      setSelectedProcessingPlan('');
      toast({ title: "Sucesso", description: "Cliente criado com sucesso" });
    },
    onError: (error: any) => {
      const errorMessage = error.message || "Erro ao criar cliente";
      if (errorMessage.includes("duplicate") || errorMessage.includes("já existe")) {
        toast({ 
          title: "CNPJ já cadastrado", 
          description: "Este CNPJ já está cadastrado no sistema. Verifique se o cliente já existe.",
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Erro", 
          description: errorMessage, 
          variant: "destructive" 
        });
      }
    },
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ empresaId, modules, processingPlan }: { empresaId: string; modules: string[]; processingPlan: string }) => {
      const response = await fetch(`/api/empresas/${empresaId}/assinaturas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ modules, processingPlan }),
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar assinaturas');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Assinaturas atualizadas com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao atualizar assinaturas", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ClienteFormData }) => {
      const response = await fetch(`/api/admin/empresas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Erro ao atualizar cliente');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/clientes'] });
      setIsEditModalOpen(false);
      setEditingCliente(null);
      editForm.reset();
      toast({ title: "Sucesso", description: "Cliente atualizado com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Erro ao atualizar cliente", variant: "destructive" });
    },
  });

  // Forms
  const createForm = useForm<ClienteFormData>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      email: "",
      telefone: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
      status: "ativo",
    },
  });

  const editForm = useForm<ClienteFormData>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues: {
      nome: "",
      cnpj: "",
      email: "",
      telefone: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      cep: "",
      status: "ativo",
    },
  });

  // Handlers
  const handleModuleChange = (moduleId: string, checked: boolean) => {
    if (checked) {
      setSelectedModules(prev => [...prev, moduleId]);
    } else {
      if (moduleId !== 'plataforma-wms') { // Não permitir desmarcar obrigatório
        setSelectedModules(prev => prev.filter(id => id !== moduleId));
      }
    }
  };

  const handleProcessingPlanChange = (planId: string) => {
    setSelectedProcessingPlan(planId);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    editForm.reset({
      nome: cliente.nome,
      cnpj: cliente.cnpj,
      email: cliente.email || "",
      telefone: cliente.telefone || "",
      logradouro: cliente.logradouro || "",
      numero: cliente.numero || "",
      complemento: "", // não existe no tipo Cliente atual
      bairro: cliente.bairro || "",
      cidade: cliente.cidade || "",
      uf: cliente.uf || "",
      cep: cliente.cep || "",
      status: cliente.status as "ativo" | "inativo" | "pendente",
    });
    setIsEditModalOpen(true);
  };

  const onCreateSubmit = (data: ClienteFormData) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: ClienteFormData) => {
    if (editingCliente) {
      updateMutation.mutate({ id: editingCliente.id, data });
    }
  };

  // CNPJ Auto-fill function
  const buscarDadosCNPJ = async (cnpj: string) => {
    if (cnpj.length !== 14) return;
    
    setBuscandoCNPJ(true);
    try {
      const response = await fetch(`/api/lookup-cnpj/${cnpj}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const empresa = data.data;
        createForm.setValue('nome', empresa.razaoSocial || '');
        createForm.setValue('telefone', empresa.telefone || '');
        createForm.setValue('logradouro', empresa.endereco || '');
        createForm.setValue('numero', empresa.numero || '');
        createForm.setValue('complemento', empresa.complemento || '');
        createForm.setValue('bairro', empresa.bairro || '');
        createForm.setValue('cidade', empresa.cidade || '');
        createForm.setValue('uf', empresa.uf || '');
        createForm.setValue('cep', empresa.cep || '');
        
        toast({
          title: "Sucesso",
          description: `Dados preenchidos automaticamente via ${data.source}`,
        });
      } else {
        toast({
          title: "CNPJ não encontrado",
          description: data.message || "Não foi possível consultar o CNPJ",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      toast({
        title: "Erro na consulta",
        description: "Erro ao consultar CNPJ. Tente novamente",
        variant: "destructive"
      });
    } finally {
      setBuscandoCNPJ(false);
    }
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj.includes(searchTerm) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'inativo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Clientes</h1>
            <p className="text-gray-600 mt-1">Administre todos os clientes do sistema</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0098DA] hover:bg-[#0077B3]">
                <UserPlus size={20} className="mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
                <DialogDescription>
                  Cadastre um novo cliente no sistema e configure seus pacotes
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="dados" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dados">
                    <Building className="w-4 h-4 mr-2" />
                    Dados do Cliente
                  </TabsTrigger>
                  <TabsTrigger value="pacotes">
                    <Package className="w-4 h-4 mr-2" />
                    Seleção de Pacotes
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="dados" className="space-y-6">
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6" id="create-client-form">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome da Empresa</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Razão social" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="cnpj"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center">
                                <Search className="h-4 w-4 mr-2" />
                                CNPJ
                              </FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="00.000.000/0000-00"
                                    onChange={(e) => {
                                      const cnpj = e.target.value.replace(/\D/g, '');
                                      field.onChange(cnpj);
                                      if (cnpj.length === 14) {
                                        buscarDadosCNPJ(cnpj);
                                      }
                                    }}
                                    maxLength={14}
                                  />
                                </FormControl>
                                {buscandoCNPJ && (
                                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-[#0098DA]" />
                                  </div>
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="email@empresa.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="telefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="(11) 99999-9999" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={createForm.control}
                          name="logradouro"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Rua, Avenida..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="numero"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="123" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="complemento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complemento</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Apto, Sala..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <FormField
                          control={createForm.control}
                          name="bairro"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bairro</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Bairro" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="cidade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cidade</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Cidade" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="uf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>UF</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="SP" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name="cep"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="00000-000" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <FormField
                          control={createForm.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="ativo">Ativo</SelectItem>
                                  <SelectItem value="inativo">Inativo</SelectItem>
                                  <SelectItem value="pendente">Pendente</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateModalOpen(false)}
                        >
                          <X size={16} className="mr-2" />
                          Cancelar
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createMutation.isPending}
                          className="bg-[#0098DA] hover:bg-[#0077B3]"
                        >
                          <Save size={16} className="mr-2" />
                          {createMutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
                
                <TabsContent value="pacotes" className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Configuração de Pacotes
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Selecione os módulos e plano de processamento para este cliente.
                    </p>
                    
                    <PackageSelection
                      selectedModules={selectedModules}
                      selectedProcessingPlan={selectedProcessingPlan}
                      onModuleChange={handleModuleChange}
                      onProcessingPlanChange={handleProcessingPlanChange}
                      packages={packages}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{clientes?.length || 0}</p>
                </div>
                <Building className="h-8 w-8 text-[#0098DA]" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes Ativos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {clientes?.filter(c => c.status === 'ativo').length || 0}
                  </p>
                </div>
                <UserPlus className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {clientes?.filter(c => c.status === 'pendente').length || 0}
                  </p>
                </div>
                <Phone className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inativos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {clientes?.filter(c => c.status === 'inativo').length || 0}
                  </p>
                </div>
                <X className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Lista de Clientes</CardTitle>
            <CardDescription>
              Gerencie todos os clientes cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Buscar por nome, CNPJ ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando clientes...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredClientes.map((cliente) => (
                  <Card key={cliente.id} className="border border-gray-200 hover:border-[#0098DA] transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{cliente.nome}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <Building size={14} />
                                  {cliente.cnpj}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail size={14} />
                                  {cliente.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone size={14} />
                                  {cliente.telefone}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {cliente.cidade}, {cliente.uf}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={getStatusColor(cliente.status)}>
                                {cliente.status.charAt(0).toUpperCase() + cliente.status.slice(1)}
                              </Badge>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setGerenciandoPacotesCliente(cliente)}
                                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                                >
                                  <Package size={16} className="mr-1" />
                                  Pacotes
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCliente(cliente)}
                                >
                                  <Edit size={16} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Atualize as informações do cliente
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Razão social" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="00.000.000/0000-00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="email@empresa.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(11) 99999-9999" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={editForm.control}
                    name="logradouro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Rua, Avenida..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="123" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="complemento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complemento</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Apto, Sala..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField
                    control={editForm.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Bairro" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Cidade" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="uf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="SP" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="00000-000" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    <X size={16} className="mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending}
                    className="bg-[#0098DA] hover:bg-[#0077B3]"
                  >
                    <Save size={16} className="mr-2" />
                    {updateMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de Gerenciamento de Pacotes */}
        <Dialog open={!!gerenciandoPacotesCliente} onOpenChange={() => setGerenciandoPacotesCliente(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerenciar Pacotes - {gerenciandoPacotesCliente?.nome}</DialogTitle>
              <DialogDescription>
                Configure os pacotes ativos para este cliente transportador
              </DialogDescription>
            </DialogHeader>
            
            {gerenciandoPacotesCliente && (
              <GerenciamentoPacotes clienteId={gerenciandoPacotesCliente.id} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}