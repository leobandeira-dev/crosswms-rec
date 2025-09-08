import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Scan,
  MapPinIcon,
  CheckSquare,
  Search,
  Truck
} from "lucide-react";

function EnderecamentoCarregamento() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedOrdemId, setSelectedOrdemId] = useState<string>("");
  const [enderecoScan, setEnderecoScan] = useState("");
  const [volumeScan, setVolumeScan] = useState("");

  // Sample data for demonstration
  const mockOrdens = [
    {
      id: "1",
      numero_ordem: "ORD-2025-001",
      motorista: "João Silva",
      veiculo: "Mercedes Sprinter - ABC-1234",
      status: "em_progresso",
      total_volumes: 15,
      volumes_enderecados: 8,
      destino: "São Paulo - SP"
    },
    {
      id: "2", 
      numero_ordem: "ORD-2025-002",
      motorista: "Maria Santos",
      veiculo: "Iveco Daily - DEF-5678",
      status: "aguardando",
      total_volumes: 22,
      volumes_enderecados: 0,
      destino: "Rio de Janeiro - RJ"
    }
  ];

  const mockVolumes = [
    {
      id: "1",
      codigo_volume: "VOL-001-2025",
      descricao: "Equipamentos eletrônicos",
      peso_kg: 5.2,
      numero_nota_fiscal: "12345",
      endereco_atual: "A-01-15",
      endereco_destino: "B-02-08",
      status_enderecamento: "enderecado"
    },
    {
      id: "2",
      codigo_volume: "VOL-002-2025", 
      descricao: "Materiais de escritório",
      peso_kg: 2.8,
      numero_nota_fiscal: "12346",
      endereco_atual: "",
      endereco_destino: "A-03-12",
      status_enderecamento: "pendente"
    },
    {
      id: "3",
      codigo_volume: "VOL-003-2025",
      descricao: "Produtos farmacêuticos",
      peso_kg: 1.5,
      numero_nota_fiscal: "12347",
      endereco_atual: "C-01-05",
      endereco_destino: "C-02-18",
      status_enderecamento: "enderecado"
    }
  ];

  const volumes = mockVolumes;
  const ordens = mockOrdens;

  const volumesPendentes = volumes.filter(v => v.status_enderecamento === 'pendente').length;
  const volumesEnderecados = volumes.filter(v => v.status_enderecamento === 'enderecado').length;

  const handleEnderecarVolume = () => {
    if (!enderecoScan || !volumeScan) {
      toast({
        title: "Campos obrigatórios",
        description: "Digite o endereço e escaneie o volume",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Volume endereçado",
      description: `Volume ${volumeScan} endereçado para ${enderecoScan}`,
    });

    setEnderecoScan("");
    setVolumeScan("");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "enderecado":
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
    { id: 4, title: "Endereçamento", path: "/armazenagem/carregamento/enderecamento", icon: MapPin, active: true },
    { id: 5, title: "Checklist", path: "/armazenagem/carregamento/checklist", icon: Clipboard, active: false },
    { id: 6, title: "Expedição", path: "/armazenagem/carregamento/expedicao", icon: Truck, active: false }
  ];

  return (
    <MainLayout title="Endereçamento de Carregamento">
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
              3. Endereçamento de Carregamento
            </h1>
            <p className="text-gray-600 mt-2">
              Definir endereços de destino para volumes através de escaneamento
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
                        Destino: {ordem.destino} • {ordem.volumes_enderecados}/{ordem.total_volumes} volumes endereçados
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
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Volumes Pendentes
                      </p>
                      <p className="text-2xl font-bold text-orange-600">{volumesPendentes}</p>
                    </div>
                    <MapPinIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Volumes Endereçados
                      </p>
                      <p className="text-2xl font-bold text-green-600">{volumesEnderecados}</p>
                    </div>
                    <CheckSquare className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total de Volumes
                      </p>
                      <p className="text-2xl font-bold text-blue-600">{volumes.length}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scanning Interface */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="w-5 h-5" />
                  Scanner de Endereçamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="endereco">Endereço de Destino</Label>
                    <Input
                      id="endereco"
                      placeholder="Ex: A-01-15"
                      value={enderecoScan}
                      onChange={(e) => setEnderecoScan(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div>
                    <Label htmlFor="volume">Código do Volume</Label>
                    <Input
                      id="volume"
                      placeholder="Escaneie o código do volume"
                      value={volumeScan}
                      onChange={(e) => setVolumeScan(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleEnderecarVolume} className="w-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      Endereçar Volume
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Volumes Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Volumes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-orange-600" />
                    Volumes Pendentes ({volumesPendentes})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {volumes
                      .filter((volume: any) => volume.status_enderecamento === 'pendente')
                      .map((volume: any) => (
                        <div key={volume.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{volume.codigo_volume}</div>
                              <div className="text-gray-600 dark:text-gray-400 text-sm">{volume.descricao}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                NF: {volume.numero_nota_fiscal} | {volume.peso_kg}kg
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                Destino: {volume.endereco_destino}
                              </div>
                            </div>
                            <Badge className={getStatusColor('pendente')}>
                              Pendente
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {volumesPendentes === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <MapPinIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p>Todos os volumes foram endereçados</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Addressed Volumes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                    Volumes Endereçados ({volumesEnderecados})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {volumes
                      .filter((volume: any) => volume.status_enderecamento === 'enderecado')
                      .map((volume: any) => (
                        <div key={volume.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-sm">{volume.codigo_volume}</div>
                              <div className="text-gray-600 dark:text-gray-400 text-sm">{volume.descricao}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                Atual: {volume.endereco_atual} → Destino: {volume.endereco_destino}
                              </div>
                            </div>
                            <Badge className={getStatusColor('enderecado')}>
                              Endereçado
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {volumesEnderecados === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p>Nenhum volume endereçado ainda</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!selectedOrdemId && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Selecione uma Ordem
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Escolha uma ordem de carregamento para iniciar o endereçamento dos volumes
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default EnderecamentoCarregamento;