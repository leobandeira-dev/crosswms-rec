import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  FileText, 
  Search, 
  Download, 
  Calendar,
  AlertTriangle,
  Info,
  AlertCircle,
  CheckCircle,
  Filter,
  Clock,
  User,
  Activity
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

export default function Logs() {
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [termoBusca, setTermoBusca] = useState("");

  // Mock data for demonstration
  const logs = [
    {
      id: "1",
      timestamp: "2025-06-15T18:30:15Z",
      nivel: "INFO",
      tipo: "AUTH",
      usuario: "admin@crosswms.com.br",
      acao: "Login realizado com sucesso",
      ip: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    {
      id: "2",
      timestamp: "2025-06-15T18:25:43Z",
      nivel: "WARNING",
      tipo: "SYSTEM",
      usuario: "system",
      acao: "Tentativa de acesso negada - Permissão insuficiente",
      ip: "192.168.1.105",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    {
      id: "3",
      timestamp: "2025-06-15T18:20:12Z",
      nivel: "ERROR",
      tipo: "DATABASE",
      usuario: "system",
      acao: "Erro de conexão com banco de dados - Timeout",
      ip: "localhost",
      userAgent: "Internal System Process"
    },
    {
      id: "4",
      timestamp: "2025-06-15T18:15:30Z",
      nivel: "INFO",
      tipo: "CRUD",
      usuario: "admin@translogbrasil.com.br",
      acao: "Empresa criada: TransLog Brasil Ltda",
      ip: "192.168.1.102",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    },
    {
      id: "5",
      timestamp: "2025-06-15T18:10:45Z",
      nivel: "SUCCESS",
      tipo: "BACKUP",
      usuario: "system",
      acao: "Backup automático realizado com sucesso",
      ip: "localhost",
      userAgent: "Backup Service"
    }
  ];

  const nivelConfig = {
    'INFO': { 
      label: 'Info', 
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Info
    },
    'WARNING': { 
      label: 'Aviso', 
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: AlertTriangle
    },
    'ERROR': { 
      label: 'Erro', 
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: AlertCircle
    },
    'SUCCESS': { 
      label: 'Sucesso', 
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircle
    }
  };

  const tipoConfig = {
    'AUTH': { label: 'Autenticação', color: 'bg-purple-50 text-purple-700' },
    'SYSTEM': { label: 'Sistema', color: 'bg-gray-50 text-gray-700' },
    'DATABASE': { label: 'Banco de Dados', color: 'bg-orange-50 text-orange-700' },
    'CRUD': { label: 'Operações', color: 'bg-indigo-50 text-indigo-700' },
    'BACKUP': { label: 'Backup', color: 'bg-teal-50 text-teal-700' }
  };

  const filteredLogs = logs.filter(log => {
    const matchesTipo = !filtroTipo || filtroTipo === "todos" || log.tipo === filtroTipo;
    const matchesNivel = !filtroNivel || filtroNivel === "todos" || log.nivel === filtroNivel;
    const matchesBusca = !termoBusca || 
      log.acao.toLowerCase().includes(termoBusca.toLowerCase()) ||
      log.usuario.toLowerCase().includes(termoBusca.toLowerCase());
    return matchesTipo && matchesNivel && matchesBusca;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  const handleDownloadLogs = () => {
    console.log("Baixando logs do sistema...");
  };

  const renderNivelBadge = (nivel: string) => {
    const config = nivelConfig[nivel as keyof typeof nivelConfig];
    if (!config) return null;
    
    const IconComponent = config.icon;
    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const renderTipoBadge = (tipo: string) => {
    const config = tipoConfig[tipo as keyof typeof tipoConfig];
    if (!config) return null;
    
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <MainLayout title="Logs do Sistema">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              Monitore atividades e eventos do sistema em tempo real
            </p>
          </div>
          <Button 
            onClick={handleDownloadLogs}
            className="bg-[#0098DA] hover:bg-[#007BB5] text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Logs
          </Button>
        </div>

        {/* Filtros */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-[#0098DA]" />
              Filtros de Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar logs..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="AUTH">Autenticação</SelectItem>
                    <SelectItem value="SYSTEM">Sistema</SelectItem>
                    <SelectItem value="DATABASE">Banco de Dados</SelectItem>
                    <SelectItem value="CRUD">Operações</SelectItem>
                    <SelectItem value="BACKUP">Backup</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível
                </label>
                <Select value={filtroNivel} onValueChange={setFiltroNivel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os níveis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os níveis</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARNING">Aviso</SelectItem>
                    <SelectItem value="ERROR">Erro</SelectItem>
                    <SelectItem value="SUCCESS">Sucesso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os períodos</SelectItem>
                    <SelectItem value="1h">Última hora</SelectItem>
                    <SelectItem value="24h">Últimas 24 horas</SelectItem>
                    <SelectItem value="7d">Últimos 7 dias</SelectItem>
                    <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Logs */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-[#0098DA]" />
              Logs do Sistema ({filteredLogs.length})
            </CardTitle>
            <CardDescription>
              Últimas atividades registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="text-sm font-mono">
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderNivelBadge(log.nivel)}
                      </TableCell>
                      <TableCell>
                        {renderTipoBadge(log.tipo)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="text-sm">{log.usuario}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-900">{log.acao}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 font-mono">{log.ip}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum log encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Logs</p>
                  <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Erros</p>
                  <p className="text-2xl font-bold text-red-600">
                    {logs.filter(log => log.nivel === 'ERROR').length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avisos</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {logs.filter(log => log.nivel === 'WARNING').length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sucessos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {logs.filter(log => log.nivel === 'SUCCESS').length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}