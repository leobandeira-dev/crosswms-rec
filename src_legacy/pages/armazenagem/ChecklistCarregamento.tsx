import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import {
  Package,
  CheckCircle,
  MapPin,
  Clipboard,
  ArrowRight,
  FileCheck,
  AlertTriangle,
  Camera,
  Upload,
  Search,
  Truck
} from "lucide-react";

function ChecklistCarregamento() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedOrdemId, setSelectedOrdemId] = useState<string>("");
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);

  // Sample data for demonstration
  const mockOrdens = [
    {
      id: "1",
      numero_ordem: "ORD-2025-001",
      motorista: "João Silva",
      veiculo: "Mercedes Sprinter - ABC-1234",
      status: "em_progresso",
      total_volumes: 15,
      volumes_carregados: 15,
      destino: "São Paulo - SP"
    },
    {
      id: "2", 
      numero_ordem: "ORD-2025-002",
      motorista: "Maria Santos",
      veiculo: "Iveco Daily - DEF-5678",
      status: "aguardando",
      total_volumes: 22,
      volumes_carregados: 0,
      destino: "Rio de Janeiro - RJ"
    }
  ];

  const defaultChecklistItems = [
    {
      id: "1",
      categoria: "Documentação",
      descricao: "Verificar se todas as notas fiscais estão presentes",
      obrigatorio: true,
      concluido: false
    },
    {
      id: "2",
      categoria: "Documentação",
      descricao: "Conferir assinatura do motorista nos documentos",
      obrigatorio: true,
      concluido: false
    },
    {
      id: "3",
      categoria: "Veículo",
      descricao: "Verificar condições do compartimento de carga",
      obrigatorio: true,
      concluido: false
    },
    {
      id: "4",
      categoria: "Veículo",
      descricao: "Conferir sistema de amarração e fixação",
      obrigatorio: true,
      concluido: false
    },
    {
      id: "5",
      categoria: "Segurança",
      descricao: "Verificar EPI do motorista",
      obrigatorio: true,
      concluido: false
    },
    {
      id: "6",
      categoria: "Segurança",
      descricao: "Conferir kit de primeiros socorros",
      obrigatorio: false,
      concluido: false
    },
    {
      id: "7",
      categoria: "Carga",
      descricao: "Verificar distribuição de peso no veículo",
      obrigatorio: true,
      concluido: false
    },
    {
      id: "8",
      categoria: "Carga",
      descricao: "Conferir se volumes frágeis estão protegidos",
      obrigatorio: false,
      concluido: false
    }
  ];

  const ordens = mockOrdens;

  useEffect(() => {
    if (selectedOrdemId) {
      setChecklistItems(defaultChecklistItems);
    }
  }, [selectedOrdemId]);

  const handleCheckItem = (itemId: string, checked: boolean) => {
    setChecklistItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, concluido: checked } : item
      )
    );
  };

  const handleFotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFotos(prev => [...prev, ...Array.from(files)]);
      toast({
        title: "Fotos adicionadas",
        description: `${files.length} foto(s) adicionada(s) ao checklist`
      });
    }
  };

  const handleFinalizarChecklist = () => {
    const itensObrigatorios = checklistItems.filter(item => item.obrigatorio);
    const itensObrigatoriosPendentes = itensObrigatorios.filter(item => !item.concluido);
    
    if (itensObrigatoriosPendentes.length > 0) {
      toast({
        title: "Itens obrigatórios pendentes",
        description: `Complete ${itensObrigatoriosPendentes.length} item(ns) obrigatório(s) antes de finalizar`,
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Checklist finalizado",
      description: "Carregamento concluído com sucesso!",
    });
  };

  const itensObrigatorios = checklistItems.filter(item => item.obrigatorio);
  const itensObrigatoriosConcluidos = itensObrigatorios.filter(item => item.concluido);
  const itensTotaisConcluidos = checklistItems.filter(item => item.concluido);
  const progressoObrigatorio = itensObrigatorios.length > 0 ? (itensObrigatoriosConcluidos.length / itensObrigatorios.length) * 100 : 0;
  const progressoTotal = checklistItems.length > 0 ? (itensTotaisConcluidos.length / checklistItems.length) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Workflow steps navigation
  const workflowSteps = [
    { id: 1, title: "Ordem", path: "/armazenagem/carregamento/ordem", icon: Package, active: false },
    { id: 2, title: "Separação", path: "/armazenagem/carregamento/separacao", icon: Search, active: false },
    { id: 3, title: "Conferência", path: "/armazenagem/carregamento/conferencia", icon: CheckCircle, active: false },
    { id: 4, title: "Endereçamento", path: "/armazenagem/carregamento/enderecamento", icon: MapPin, active: false },
    { id: 5, title: "Checklist", path: "/armazenagem/carregamento/checklist", icon: Clipboard, active: true },
    { id: 6, title: "Expedição", path: "/armazenagem/carregamento/expedicao", icon: Truck, active: false }
  ];

  return (
    <MainLayout title="Checklist de Carregamento">
      <div className="max-w-7xl mx-auto p-6">
        {/* Workflow Navigation */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
            {workflowSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <Link href={step.path}>
                    <Button
                      variant={step.active ? "default" : "outline"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <IconComponent className="h-4 w-4" />
                      {step.id}. {step.title}
                    </Button>
                  </Link>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              4. Checklist de Carregamento
            </h1>
            <p className="text-gray-600 mt-2">
              Verificações finais e documentação fotográfica antes da saída
            </p>
          </div>
        </div>

        {/* Order Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Selecionar Ordem de Carregamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {ordens.map((ordem) => (
                <div
                  key={ordem.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedOrdemId === ordem.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedOrdemId(ordem.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold">{ordem.numero_ordem}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {ordem.motorista} • {ordem.veiculo}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Destino: {ordem.destino} • {ordem.volumes_carregados}/{ordem.total_volumes} volumes carregados
                      </div>
                    </div>
                    <Badge variant={ordem.status === "em_progresso" ? "default" : "secondary"}>
                      {ordem.status === "em_progresso" ? "Em Progresso" : "Aguardando"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedOrdemId && (
          <>
            {/* Progress Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Itens Obrigatórios
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {itensObrigatoriosConcluidos.length}/{itensObrigatorios.length}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full transition-all"
                          style={{ width: `${progressoObrigatorio}%` }}
                        ></div>
                      </div>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Progresso Total
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {itensTotaisConcluidos.length}/{checklistItems.length}
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${progressoTotal}%` }}
                        ></div>
                      </div>
                    </div>
                    <FileCheck className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Fotos Anexadas
                      </p>
                      <p className="text-2xl font-bold text-green-600">{fotos.length}</p>
                    </div>
                    <Camera className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checklist Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {Object.entries(
                checklistItems.reduce((acc: any, item) => {
                  if (!acc[item.categoria]) acc[item.categoria] = [];
                  acc[item.categoria].push(item);
                  return acc;
                }, {})
              ).map(([categoria, items]: [string, any]) => (
                <Card key={categoria}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clipboard className="w-5 h-5" />
                      {categoria}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={item.id}
                            checked={item.concluido}
                            onCheckedChange={(checked) => handleCheckItem(item.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={item.id}
                              className={`text-sm cursor-pointer ${
                                item.concluido ? "line-through text-gray-500" : ""
                              }`}
                            >
                              {item.descricao}
                              {item.obrigatorio && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Photo Upload */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Documentação Fotográfica
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fotos">Adicionar Fotos</Label>
                    <Input
                      id="fotos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFotoUpload}
                      className="mt-2"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Adicione fotos do carregamento, condições do veículo e documentos
                    </p>
                  </div>
                  
                  {fotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {fotos.map((foto, index) => (
                        <div key={index} className="border rounded-lg p-2">
                          <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                            <Camera className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-center mt-1 truncate">{foto.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Observations */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Adicione observações sobre o carregamento, condições especiais ou ocorrências..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Finalize Button */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <h3 className="font-semibold">Finalizar Carregamento</h3>
                    <p className="text-sm text-gray-600">
                      Complete todos os itens obrigatórios antes de finalizar
                    </p>
                  </div>
                  <Button 
                    onClick={handleFinalizarChecklist}
                    size="lg"
                    disabled={progressoObrigatorio < 100}
                    className="w-full md:w-auto"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizar Carregamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedOrdemId && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Clipboard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Selecione uma Ordem
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Escolha uma ordem de carregamento para iniciar o checklist final
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default ChecklistCarregamento;