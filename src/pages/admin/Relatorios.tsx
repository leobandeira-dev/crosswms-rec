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
  BarChart3, 
  Search, 
  Download, 
  Calendar,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Filter
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

export default function Relatorios() {
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroPeriodo, setFiltroPeriodo] = useState("");
  const [termoBusca, setTermoBusca] = useState("");

  // Mock data for demonstration
  const relatoriosDisponiveis = [
    {
      id: "1",
      nome: "Relatório de Empresas",
      descricao: "Lista completa de empresas cadastradas no sistema",
      tipo: "Administrativo",
      ultimaAtualizacao: "2025-06-15",
      registros: 25
    },
    {
      id: "2", 
      nome: "Relatório de Usuários",
      descricao: "Usuários ativos por empresa e perfil",
      tipo: "Administrativo",
      ultimaAtualizacao: "2025-06-15",
      registros: 150
    },
    {
      id: "3",
      nome: "Relatório de Pacotes",
      descricao: "Pacotes contratados e utilização",
      tipo: "Comercial",
      ultimaAtualizacao: "2025-06-15",
      registros: 12
    },
    {
      id: "4",
      nome: "Relatório de Logs",
      descricao: "Logs de sistema e auditoria",
      tipo: "Técnico",
      ultimaAtualizacao: "2025-06-15",
      registros: 1250
    }
  ];

  const metricas = [
    {
      titulo: "Total de Empresas",
      valor: "25",
      icone: Users,
      cor: "text-blue-600",
      background: "bg-blue-50"
    },
    {
      titulo: "Usuários Ativos",
      valor: "150",
      icone: Package,
      cor: "text-green-600", 
      background: "bg-green-50"
    },
    {
      titulo: "Receita Mensal",
      valor: "R$ 45.000",
      icone: DollarSign,
      cor: "text-purple-600",
      background: "bg-purple-50"
    },
    {
      titulo: "Taxa de Crescimento",
      valor: "+12%",
      icone: TrendingUp,
      cor: "text-orange-600",
      background: "bg-orange-50"
    }
  ];

  const filteredRelatorios = relatoriosDisponiveis.filter(relatorio => {
    const matchesTipo = !filtroTipo || filtroTipo === "todos" || relatorio.tipo === filtroTipo;
    const matchesBusca = !termoBusca || 
      relatorio.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      relatorio.descricao.toLowerCase().includes(termoBusca.toLowerCase());
    return matchesTipo && matchesBusca;
  });

  const handleDownload = (relatorio: any) => {
    // Simular download
    console.log(`Baixando relatório: ${relatorio.nome}`);
  };

  return (
    <MainLayout title="Relatórios do Sistema">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              Acesse relatórios detalhados e métricas do sistema
            </p>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricas.map((metrica, index) => {
            const IconComponent = metrica.icone;
            return (
              <Card key={index} className="bg-white border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {metrica.titulo}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {metrica.valor}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${metrica.background}`}>
                      <IconComponent className={`h-6 w-6 ${metrica.cor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filtros */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-[#0098DA]" />
              Filtros de Relatórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Relatório
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Digite o nome do relatório..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Relatório
                </label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="Administrativo">Administrativo</SelectItem>
                    <SelectItem value="Comercial">Comercial</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período
                </label>
                <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os períodos</SelectItem>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="semana">Esta semana</SelectItem>
                    <SelectItem value="mes">Este mês</SelectItem>
                    <SelectItem value="ano">Este ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Relatórios */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-[#0098DA]" />
              Relatórios Disponíveis ({filteredRelatorios.length})
            </CardTitle>
            <CardDescription>
              Todos os relatórios disponíveis no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Relatório</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Registros</TableHead>
                    <TableHead>Última Atualização</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRelatorios.map((relatorio) => (
                    <TableRow key={relatorio.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">
                            {relatorio.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            {relatorio.descricao}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            relatorio.tipo === 'Administrativo' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                            relatorio.tipo === 'Comercial' ? 'border-green-200 text-green-700 bg-green-50' :
                            'border-purple-200 text-purple-700 bg-purple-50'
                          }
                        >
                          {relatorio.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-900 font-medium">
                          {relatorio.registros.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(relatorio.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleDownload(relatorio)}
                            className="bg-[#0098DA] hover:bg-[#007BB5] text-white"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredRelatorios.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum relatório encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}