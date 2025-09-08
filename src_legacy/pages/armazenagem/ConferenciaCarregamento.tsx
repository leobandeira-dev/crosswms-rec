import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Camera, Scan, Package, Clock, AlertTriangle, Check, MapPin, Clipboard, ArrowRight, Search, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation, Link } from "wouter";

function ConferenciaCarregamento() {
  const [location] = useLocation();
  const [selectedOrdem, setSelectedOrdem] = useState<string>("");
  const [scannedCode, setScannedCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get ordem ID from URL params
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const ordemIdFromUrl = urlParams.get('ordem');

  useEffect(() => {
    if (ordemIdFromUrl) {
      setSelectedOrdem(ordemIdFromUrl);
    }
  }, [ordemIdFromUrl]);

  // Fetch loading orders
  const { data: ordens = [] } = useQuery({
    queryKey: ["/api/ordens-carga"],
    queryFn: () => apiRequest("/api/ordens-carga")
  });

  // Fetch volumes for selected order
  const { data: volumes = [], isLoading: isLoadingVolumes } = useQuery({
    queryKey: ["/api/ordens-carga", selectedOrdem, "volumes"],
    queryFn: () => apiRequest(`/api/ordens-carga/${selectedOrdem}/volumes`),
    enabled: !!selectedOrdem
  });

  // Fetch verification records for selected order
  const { data: conferencias = [], isLoading: isLoadingConferencias } = useQuery({
    queryKey: ["/api/ordens-carga", selectedOrdem, "conferencia"],
    queryFn: () => apiRequest(`/api/ordens-carregamento/${selectedOrdem}/conferencia`),
    enabled: !!selectedOrdem
  });

  // Verify volume mutation
  const verifyVolumeMutation = useMutation({
    mutationFn: (data: { codigo_volume: string; conferente_id: string }) =>
      apiRequest(`/api/ordens-carregamento/${selectedOrdem}/conferencia/verificar`, {
        method: "POST",
        body: JSON.stringify(data)
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ordens-carregamento", selectedOrdem, "conferencia"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ordens-carregamento", selectedOrdem, "volumes"] });
      setLastScanResult({ success: true, data });
      toast({
        title: "Sucesso",
        description: `Volume ${data.codigo_volume_escaneado} verificado com sucesso`
      });
      setScannedCode("");
      // Focus back to input for next scan
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    onError: (error: any) => {
      setLastScanResult({ success: false, error: error.message });
      toast({
        title: "Erro",
        description: error.message || "Erro ao verificar volume",
        variant: "destructive"
      });
      setScannedCode("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  });

  const handleScan = () => {
    if (!scannedCode.trim() || !selectedOrdem) return;
    
    setIsScanning(true);
    verifyVolumeMutation.mutate({
      codigo_volume: scannedCode.trim(),
      conferente_id: "current-user-id" // This would come from auth context
    });
    setIsScanning(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan();
    }
  };

  // Calculate statistics
  const totalVolumes = volumes.length;
  const volumesConferidos = volumes.filter((v: any) => v.status === 'conferido').length;
  const volumesPendentes = totalVolumes - volumesConferidos;
  const progressPercentage = totalVolumes > 0 ? Math.round((volumesConferidos / totalVolumes) * 100) : 0;

  const getVolumeStatus = (volume: any) => {
    return volume.status === 'conferido' ? 'conferido' : 'pendente';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "conferido":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "divergencia":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Workflow steps navigation
  const workflowSteps = [
    { id: 1, title: "Ordem", path: "/armazenagem/carregamento/ordem", icon: Package, active: false },
    { id: 2, title: "Separação", path: "/armazenagem/carregamento/separacao", icon: Search, active: false },
    { id: 3, title: "Conferência", path: "/armazenagem/carregamento/conferencia", icon: CheckCircle, active: true },
    { id: 4, title: "Endereçamento", path: "/armazenagem/carregamento/enderecamento", icon: MapPin, active: false },
    { id: 5, title: "Checklist", path: "/armazenagem/carregamento/checklist", icon: Clipboard, active: false },
    { id: 6, title: "Expedição", path: "/armazenagem/carregamento/expedicao", icon: Truck, active: false }
  ];

  return (
    <MainLayout title="Conferência de Carregamento">
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
              2. Conferência de Carregamento
            </h1>
            <p className="text-gray-600 mt-2">
              Verificar volumes através de escaneamento de códigos
            </p>
          </div>
        </div>

      {/* Order Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selecionar Ordem de Carregamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedOrdem} onValueChange={setSelectedOrdem}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma ordem de carregamento" />
            </SelectTrigger>
            <SelectContent>
              {ordens.map((ordem: any) => (
                <SelectItem key={ordem.id} value={ordem.id}>
                  {ordem.numero_ordem} - {ordem.placa_veiculo || 'Sem veículo'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedOrdem && (
        <>
          {/* Progress Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Progresso da Conferência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{totalVolumes}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total de Volumes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{volumesConferidos}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Conferidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{volumesPendentes}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Pendentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{progressPercentage}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Concluído</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scanner Interface */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="w-5 h-5" />
                Escaneamento de Volumes
              </CardTitle>
              <CardDescription>
                Digite ou escaneie o código do volume para verificação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    placeholder="Digite ou escaneie o código do volume..."
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="text-lg"
                    autoFocus
                  />
                </div>
                <Button 
                  onClick={handleScan}
                  disabled={!scannedCode.trim() || isScanning || verifyVolumeMutation.isPending}
                  className="min-w-[120px]"
                >
                  {verifyVolumeMutation.isPending ? (
                    "Verificando..."
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Verificar
                    </>
                  )}
                </Button>
              </div>

              {/* Last Scan Result */}
              {lastScanResult && (
                <Alert className={lastScanResult.success ? "border-green-200 bg-green-50 dark:bg-green-950" : "border-red-200 bg-red-50 dark:bg-red-950"}>
                  <div className="flex items-center gap-2">
                    {lastScanResult.success ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <AlertDescription>
                      {lastScanResult.success 
                        ? `Volume ${lastScanResult.data.codigo_volume_escaneado} verificado com sucesso`
                        : lastScanResult.error
                      }
                    </AlertDescription>
                  </div>
                </Alert>
              )}

              {/* Scanning Tips */}
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Dicas de Escaneamento:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Use um leitor de código de barras para maior velocidade</li>
                  <li>• Pressione Enter após digitar o código manualmente</li>
                  <li>• Mantenha o foco no campo de entrada para escaneamento contínuo</li>
                  <li>• Volumes já conferidos não podem ser verificados novamente</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Volumes List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Volumes Pendentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Volumes Pendentes ({volumesPendentes})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {volumes
                    .filter((volume: any) => getVolumeStatus(volume) === 'pendente')
                    .map((volume: any) => (
                      <div key={volume.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{volume.codigo_volume}</div>
                            <div className="text-gray-600 dark:text-gray-400 text-sm">{volume.descricao}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              NF: {volume.numero_nota_fiscal} | {volume.peso_kg}kg
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
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      Todos os volumes foram conferidos!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Volumes Conferidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Volumes Conferidos ({volumesConferidos})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {volumes
                    .filter((volume: any) => getVolumeStatus(volume) === 'conferido')
                    .map((volume: any) => (
                      <div key={volume.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{volume.codigo_volume}</div>
                            <div className="text-gray-600 dark:text-gray-400 text-sm">{volume.descricao}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Conferido em: {volume.data_conferencia ? new Date(volume.data_conferencia).toLocaleString() : 'N/A'}
                            </div>
                          </div>
                          <Badge className={getStatusColor('conferido')}>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Conferido
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {volumesConferidos === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum volume conferido ainda
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conference History */}
          {conferencias.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Histórico de Conferência</CardTitle>
                <CardDescription>
                  Últimas verificações realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conferencias.slice(0, 10).map((conferencia: any) => (
                    <div key={conferencia.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="font-semibold text-sm">{conferencia.codigo_volume_escaneado}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(conferencia.data_conferencia).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(conferencia.status_conferencia)}>
                        {conferencia.status_conferencia}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedOrdem && (
        <Card>
          <CardContent className="text-center py-12">
            <Scan className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Selecione uma Ordem de Carregamento
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Escolha uma ordem de carregamento para iniciar a conferência dos volumes
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </MainLayout>
  );
}

export default ConferenciaCarregamento;