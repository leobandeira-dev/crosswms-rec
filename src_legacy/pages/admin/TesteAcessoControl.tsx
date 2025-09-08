import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface TestResult {
  status: number;
  data: any;
  error?: string;
}

export default function TesteAcessoControl() {
  const [clienteTransportadorId, setClienteTransportadorId] = useState("9ce08fe7-99cc-496e-85d5-17411eb8199c");
  const [endpoint, setEndpoint] = useState("users");
  const [resultado, setResultado] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testEndpoint = async () => {
    if (!clienteTransportadorId) {
      toast({
        title: "Erro",
        description: "ID do Cliente Transportador é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const url = `/api/clientes-transportador/${clienteTransportadorId}/${endpoint}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      setResultado({
        status: response.status,
        data,
        error: response.ok ? undefined : data.error || 'Erro desconhecido'
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: `Endpoint testado com sucesso - ${response.status}`,
        });
      } else {
        toast({
          title: "Erro",
          description: `Falha no teste - ${response.status}: ${data.error || 'Erro desconhecido'}`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Erro no teste:', error);
      setResultado({
        status: 0,
        data: null,
        error: error.message
      });
      toast({
        title: "Erro",
        description: `Erro de conexão: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const endpoints = [
    { value: "users", label: "Usuários" },
    { value: "notas-fiscais", label: "Notas Fiscais" },
    { value: "carregamentos", label: "Carregamentos" },
    { value: "empresas", label: "Empresas" }
  ];

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge variant="default" className="bg-green-500">Sucesso - {status}</Badge>;
    } else if (status >= 400 && status < 500) {
      return <Badge variant="destructive">Cliente Error - {status}</Badge>;
    } else if (status >= 500) {
      return <Badge variant="destructive">Server Error - {status}</Badge>;
    } else {
      return <Badge variant="secondary">Conectividade - {status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Teste de Controle de Acesso</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações do Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente Transportador ID</Label>
              <Input
                id="clienteId"
                value={clienteTransportadorId}
                onChange={(e) => setClienteTransportadorId(e.target.value)}
                placeholder="Digite o ID do cliente transportador"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Select value={endpoint} onValueChange={setEndpoint}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o endpoint" />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.map((ep) => (
                    <SelectItem key={ep.value} value={ep.value}>
                      {ep.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-gray-100 p-3 rounded-md">
            <Label className="text-sm text-gray-600">URL que será testada:</Label>
            <p className="font-mono text-sm mt-1">
              GET /api/clientes-transportador/{clienteTransportadorId || '{id}'}/{endpoint}
            </p>
          </div>

          <Button 
            onClick={testEndpoint} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Testando..." : "Executar Teste"}
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Resultado do Teste
              {getStatusBadge(resultado.status)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resultado.error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-md mb-4">
                <p className="text-red-800 font-medium">Erro:</p>
                <p className="text-red-700">{resultado.error}</p>
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <Label className="text-sm text-gray-600">Status HTTP:</Label>
                <p className="font-mono">{resultado.status}</p>
              </div>
              
              <div>
                <Label className="text-sm text-gray-600">Dados retornados:</Label>
                <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto max-h-96">
                  {JSON.stringify(resultado.data, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-gray-600">Token de Autenticação:</Label>
              <p className="font-mono break-all">
                {localStorage.getItem('token') ? 'Presente' : 'Não encontrado'}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Cliente Transportador ID padrão:</Label>
              <p className="font-mono">9ce08fe7-99cc-496e-85d5-17411eb8199c</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}