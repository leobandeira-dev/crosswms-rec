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
  Search,
  Truck,
  User,
  Clock,
  AlertTriangle,
  Scan,
  Box,
  ListChecks
} from "lucide-react";

function SeparacaoCarregamento() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [selectedOrdemId, setSelectedOrdemId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [separacaoItems, setSeparacaoItems] = useState<any[]>([]);
  const [scannedItem, setScannedItem] = useState<string>("");

  // Mock data for ordens de carregamento
  const mockOrdens = [
    {
      id: "ORD-001",
      numero: "12345",
      cliente: "Empresa ABC Ltda",
      motorista: "João Silva",
      veiculo: "ABC-1234",
      status: "Aguardando Separação",
      volumes: 15,
      peso: "1.250kg",
      prazo: "14:30",
      items: [
        { id: 1, codigo: "PROD-001", descricao: "Produto A", quantidade: 10, separado: 0, endereco: "A01-B02-C03" },
        { id: 2, codigo: "PROD-002", descricao: "Produto B", quantidade: 5, separado: 0, endereco: "A02-B01-C04" },
        { id: 3, codigo: "PROD-003", descricao: "Produto C", quantidade: 8, separado: 0, endereco: "A01-B03-C02" }
      ]
    },
    {
      id: "ORD-002",
      numero: "12346",
      cliente: "Transportadora XYZ",
      motorista: "Maria Santos",
      veiculo: "XYZ-5678",
      status: "Em Separação",
      volumes: 8,
      peso: "800kg",
      prazo: "16:00",
      items: [
        { id: 4, codigo: "PROD-004", descricao: "Produto D", quantidade: 12, separado: 8, endereco: "B01-A02-C01" },
        { id: 5, codigo: "PROD-005", descricao: "Produto E", quantidade: 6, separado: 6, endereco: "B02-A01-C03" }
      ]
    }
  ];

  const selectedOrdem = mockOrdens.find(ordem => ordem.id === selectedOrdemId);

  useEffect(() => {
    if (selectedOrdemId && selectedOrdem) {
      setSeparacaoItems(selectedOrdem.items);
    }
  }, [selectedOrdemId, selectedOrdem]);

  const handleScanItem = (codigo: string) => {
    setSeparacaoItems(items => 
      items.map(item => 
        item.codigo === codigo 
          ? { ...item, separado: Math.min(item.separado + 1, item.quantidade) }
          : item
      )
    );
    setScannedItem("");
    toast({
      title: "Item separado",
      description: `Item ${codigo} foi separado com sucesso`
    });
  };

  const handleConcluirSeparacao = () => {
    toast({
      title: "Separação concluída",
      description: "Ordem de separação finalizada com sucesso!",
    });
  };

  const totalItems = separacaoItems.reduce((acc, item) => acc + item.quantidade, 0);
  const totalSeparados = separacaoItems.reduce((acc, item) => acc + item.separado, 0);
  const progresso = totalItems > 0 ? (totalSeparados / totalItems) * 100 : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Separado":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Em Separação":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Aguardando Separação":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Workflow steps navigation
  const workflowSteps = [
    { id: 1, title: "Ordem", path: "/armazenagem/carregamento/ordem", icon: Package, active: false },
    { id: 2, title: "Separação", path: "/armazenagem/carregamento/separacao", icon: Search, active: true },
    { id: 3, title: "Conferência", path: "/armazenagem/carregamento/conferencia", icon: CheckCircle, active: false },
    { id: 4, title: "Endereçamento", path: "/armazenagem/carregamento/enderecamento", icon: MapPin, active: false },
    { id: 5, title: "Checklist", path: "/armazenagem/carregamento/checklist", icon: Clipboard, active: false },
    { id: 6, title: "Expedição", path: "/armazenagem/carregamento/expedicao", icon: Truck, active: false }
  ];

  return (
    <MainLayout title="Separação de Carregamento">
      <div className="max-w-7xl mx-auto p-6">
        {/* Workflow Navigation */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
            {workflowSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <Link href={step.path}>
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                      step.active 
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{step.title}</span>
                    </div>
                  </Link>
                  {index < workflowSteps.length - 1 && (
                    <div className="mx-2 text-gray-300">→</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Separação de Carregamento
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Separação de itens para carregamento de veículos (Etapa Opcional)
            </p>
          </div>
        </div>

        {/* Seleção de Ordem */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Selecionar Ordem de Carregamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockOrdens.map((ordem) => (
                <div
                  key={ordem.id}
                  onClick={() => setSelectedOrdemId(ordem.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedOrdemId === ordem.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{ordem.numero}</h3>
                    <Badge className={getStatusColor(ordem.status)}>
                      {ordem.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    {ordem.motorista}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Prazo: {ordem.prazo}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedOrdemId && (
          <>
            {/* Scanner de Códigos */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scan className="w-5 h-5 mr-2" />
                  Scanner de Códigos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="scanned-code">Código do Produto</Label>
                    <Input
                      id="scanned-code"
                      value={scannedItem}
                      onChange={(e) => setScannedItem(e.target.value)}
                      placeholder="Escaneie ou digite o código do produto"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && scannedItem) {
                          handleScanItem(scannedItem);
                        }
                      }}
                    />
                  </div>
                  <Button 
                    onClick={() => scannedItem && handleScanItem(scannedItem)}
                    disabled={!scannedItem}
                    className="mt-6"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    Separar Item
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progresso da Separação */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ListChecks className="w-5 h-5 mr-2" />
                    Progresso da Separação
                  </div>
                  <Badge variant="outline">
                    {totalSeparados}/{totalItems} itens
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progresso}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {progresso.toFixed(1)}% concluído
                </p>
              </CardContent>
            </Card>

            {/* Lista de Itens para Separação */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Box className="w-5 h-5 mr-2" />
                  Itens para Separação - Ordem {selectedOrdem?.numero}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {separacaoItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{item.codigo}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.descricao}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            Endereço: {item.endereco}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            className={`${
                              item.separado === item.quantidade 
                                ? 'bg-green-100 text-green-800' 
                                : item.separado > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {item.separado}/{item.quantidade}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            item.separado === item.quantidade 
                              ? 'bg-green-500' 
                              : item.separado > 0
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          }`}
                          style={{ width: `${(item.separado / item.quantidade) * 100}%` }}
                        ></div>
                      </div>
                      
                      {item.separado === item.quantidade && (
                        <div className="flex items-center mt-2 text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Separação concluída</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6 space-x-4">
                  <Button variant="outline">
                    Pular Separação
                  </Button>
                  <Button 
                    onClick={handleConcluirSeparacao}
                    disabled={progresso < 100}
                    className="flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Concluir Separação
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
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Selecione uma Ordem
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Escolha uma ordem de carregamento para iniciar a separação
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default SeparacaoCarregamento;