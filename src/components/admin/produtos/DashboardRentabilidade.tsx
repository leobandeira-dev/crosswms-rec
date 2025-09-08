import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Users, 
  Target,
  Package,
  BarChart3,
  Calculator,
  AlertCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function DashboardRentabilidade() {
  const { data: pacotes = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/pacotes'],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Análise consolidada
  const analiseConsolidada = pacotes.reduce((acc, pacote) => {
    const custoTotal = Number(pacote.custo_infraestrutura || 0) + 
                      Number(pacote.custo_por_documento || 0) + 
                      Number(pacote.custo_api_externa || 0) + 
                      Number(pacote.custo_processamento || 0);
    const precoMensal = Number(pacote.preco_mensal || 0);
    const lucroMensal = precoMensal - custoTotal;
    
    acc.totalReceita += precoMensal;
    acc.totalCustos += custoTotal;
    acc.totalLucro += lucroMensal;
    acc.totalPacotes++;
    
    if (pacote.tipo_pacote === 'modulo') acc.modulos++;
    if (pacote.tipo_pacote === 'plano_processamento') acc.planos++;
    
    return acc;
  }, {
    totalReceita: 0,
    totalCustos: 0,
    totalLucro: 0,
    totalPacotes: 0,
    modulos: 0,
    planos: 0
  });

  const margemConsolidada = analiseConsolidada.totalReceita > 0 
    ? (analiseConsolidada.totalLucro / analiseConsolidada.totalReceita) * 100 
    : 0;

  // Análise por tipo
  const modulos = pacotes.filter(p => p.tipo_pacote === 'modulo');
  const planos = pacotes.filter(p => p.tipo_pacote === 'plano_processamento');

  const analisePorTipo = (items: any[]) => {
    return items.reduce((acc, item) => {
      const custoTotal = Number(item.custo_infraestrutura || 0) + 
                        Number(item.custo_por_documento || 0) + 
                        Number(item.custo_api_externa || 0) + 
                        Number(item.custo_processamento || 0);
      const precoMensal = Number(item.preco_mensal || 0);
      const lucroMensal = precoMensal - custoTotal;
      
      acc.receita += precoMensal;
      acc.custos += custoTotal;
      acc.lucro += lucroMensal;
      acc.count++;
      
      return acc;
    }, { receita: 0, custos: 0, lucro: 0, count: 0 });
  };

  const analiseModulos = analisePorTipo(modulos);
  const analisePlanos = analisePorTipo(planos);

  return (
    <div className="space-y-6">
      {/* Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">
                Receita Total Potencial
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(analiseConsolidada.totalReceita)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              {analiseConsolidada.totalPacotes} pacotes disponíveis
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-700">
                Custos Operacionais
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-red-900">
              {formatCurrency(analiseConsolidada.totalCustos)}
            </div>
            <div className="text-xs text-red-600 mt-1">
              Infraestrutura + APIs + Processamento
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-blue-700">
                Lucro Potencial
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-blue-900">
              {formatCurrency(analiseConsolidada.totalLucro)}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Por cliente com todos os pacotes
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-purple-700">
                Margem Consolidada
              </CardTitle>
              <Percent className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-purple-900">
              {formatPercent(margemConsolidada)}
            </div>
            <Badge 
              variant={margemConsolidada >= 50 ? "default" : margemConsolidada >= 30 ? "secondary" : "destructive"}
              className="text-xs mt-1"
            >
              {margemConsolidada >= 50 ? "Excelente" : margemConsolidada >= 30 ? "Boa" : "Baixa"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Análise por Tipo */}
      <Tabs defaultValue="comparativo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
          <TabsTrigger value="modulos">Módulos</TabsTrigger>
          <TabsTrigger value="planos">Planos de Processamento</TabsTrigger>
        </TabsList>

        <TabsContent value="comparativo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Módulos do Sistema
                </CardTitle>
                <CardDescription>
                  {analiseModulos.count} módulos disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Receita Total</span>
                    <span className="font-mono">{formatCurrency(analiseModulos.receita)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Custos Total</span>
                    <span className="font-mono text-red-600">{formatCurrency(analiseModulos.custos)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Lucro Total</span>
                    <span className="font-mono text-green-600">{formatCurrency(analiseModulos.lucro)}</span>
                  </div>
                  <Progress 
                    value={analiseModulos.receita > 0 ? (analiseModulos.lucro / analiseModulos.receita) * 100 : 0} 
                    className="h-2" 
                  />
                  <div className="text-xs text-center text-muted-foreground">
                    Margem: {formatPercent(analiseModulos.receita > 0 ? (analiseModulos.lucro / analiseModulos.receita) * 100 : 0)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Planos de Processamento
                </CardTitle>
                <CardDescription>
                  {analisePlanos.count} planos disponíveis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Receita Total</span>
                    <span className="font-mono">{formatCurrency(analisePlanos.receita)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Custos Total</span>
                    <span className="font-mono text-red-600">{formatCurrency(analisePlanos.custos)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Lucro Total</span>
                    <span className="font-mono text-green-600">{formatCurrency(analisePlanos.lucro)}</span>
                  </div>
                  <Progress 
                    value={analisePlanos.receita > 0 ? (analisePlanos.lucro / analisePlanos.receita) * 100 : 0} 
                    className="h-2" 
                  />
                  <div className="text-xs text-center text-muted-foreground">
                    Margem: {formatPercent(analisePlanos.receita > 0 ? (analisePlanos.lucro / analisePlanos.receita) * 100 : 0)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="modulos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modulos.map((modulo) => {
              const custoTotal = Number(modulo.custo_infraestrutura || 0) + 
                                Number(modulo.custo_por_documento || 0) + 
                                Number(modulo.custo_api_externa || 0) + 
                                Number(modulo.custo_processamento || 0);
              const precoMensal = Number(modulo.preco_mensal || 0);
              const lucroMensal = precoMensal - custoTotal;
              const margemCalculada = precoMensal > 0 ? (lucroMensal / precoMensal) * 100 : 0;
              
              return (
                <Card key={modulo.id} className="border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{modulo.nome}</CardTitle>
                    <CardDescription>{modulo.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Receita</div>
                        <div className="font-mono font-medium">{formatCurrency(precoMensal)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Custos</div>
                        <div className="font-mono text-red-600">{formatCurrency(custoTotal)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Lucro</div>
                        <div className="font-mono text-green-600">{formatCurrency(lucroMensal)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Margem</div>
                        <Badge variant={margemCalculada >= 50 ? "default" : margemCalculada >= 30 ? "secondary" : "destructive"}>
                          {formatPercent(margemCalculada)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="planos" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planos.map((plano) => {
              const custoTotal = Number(plano.custo_infraestrutura || 0) + 
                                Number(plano.custo_por_documento || 0) + 
                                Number(plano.custo_api_externa || 0) + 
                                Number(plano.custo_processamento || 0);
              const precoMensal = Number(plano.preco_mensal || 0);
              const lucroMensal = precoMensal - custoTotal;
              const margemCalculada = precoMensal > 0 ? (lucroMensal / precoMensal) * 100 : 0;
              
              return (
                <Card key={plano.id} className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{plano.nome}</CardTitle>
                    <CardDescription>
                      {plano.descricao}
                      {plano.limite_documentos_mes && ` - ${plano.limite_documentos_mes.toLocaleString()} docs/mês`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Receita</div>
                        <div className="font-mono font-medium">{formatCurrency(precoMensal)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Custos</div>
                        <div className="font-mono text-red-600">{formatCurrency(custoTotal)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Lucro</div>
                        <div className="font-mono text-green-600">{formatCurrency(lucroMensal)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Margem</div>
                        <Badge variant={margemCalculada >= 50 ? "default" : margemCalculada >= 30 ? "secondary" : "destructive"}>
                          {formatPercent(margemCalculada)}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Insights e Recomendações */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Calculator className="h-5 w-5" />
            Análise de Rentabilidade e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                <Target className="h-4 w-4" />
                Break-even Global
              </div>
              <div className="text-lg font-bold text-orange-900">
                1 cliente completo
              </div>
              <div className="text-xs text-orange-600">
                Cobrindo todos os custos fixos
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                <Users className="h-4 w-4" />
                Cenário 5 Clientes
              </div>
              <div className="text-lg font-bold text-orange-900">
                {formatCurrency(analiseConsolidada.totalLucro * 5)}
              </div>
              <div className="text-xs text-orange-600">
                Lucro mensal potencial
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                <TrendingUp className="h-4 w-4" />
                ROI Médio
              </div>
              <div className="text-lg font-bold text-orange-900">
                {formatPercent(margemConsolidada * 4)}
              </div>
              <div className="text-xs text-orange-600">
                Retorno sobre investimento anual
              </div>
            </div>
          </div>
          
          <div className="border-t border-orange-200 pt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-700">
                <strong>Recomendação:</strong> O modelo de negócio apresenta excelente rentabilidade. 
                Com margens superiores a 50% na maioria dos pacotes, o sistema é altamente escalável. 
                Foque na aquisição de clientes e na otimização dos custos de APIs para maximizar o lucro.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}