import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Percent, Users, Target } from "lucide-react";
import { PacoteSistema } from "@shared/schema";

interface RentabilidadeAnalysisProps {
  pacote: PacoteSistema;
}

export default function RentabilidadeAnalysis({ pacote }: RentabilidadeAnalysisProps) {
  const custoTotal = Number(pacote.custo_infraestrutura || 0) + 
                    Number(pacote.custo_por_documento || 0) + 
                    Number(pacote.custo_api_externa || 0) + 
                    Number(pacote.custo_processamento || 0);
  
  const precoMensal = Number(pacote.preco_mensal || 0);
  const lucroMensal = precoMensal - custoTotal;
  const margemCalculada = precoMensal > 0 ? (lucroMensal / precoMensal) * 100 : 0;
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Receita */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-green-700">
              Receita Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-green-900">
            {formatCurrency(precoMensal)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            Preço praticado no mercado
          </div>
        </CardContent>
      </Card>

      {/* Custos */}
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
            {formatCurrency(custoTotal)}
          </div>
          <div className="text-xs text-red-600 mt-1 space-y-1">
            <div>Infraestrutura: {formatCurrency(Number(pacote.custo_infraestrutura || 0))}</div>
            <div>APIs: {formatCurrency(Number(pacote.custo_api_externa || 0))}</div>
            <div>Processamento: {formatCurrency(Number(pacote.custo_processamento || 0))}</div>
          </div>
        </CardContent>
      </Card>

      {/* Lucro */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-blue-700">
              Lucro Mensal
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-blue-900">
            {formatCurrency(lucroMensal)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Por cliente/pacote ativo
          </div>
        </CardContent>
      </Card>

      {/* Margem */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-purple-700">
              Margem de Lucro
            </CardTitle>
            <Percent className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-purple-900">
            {formatPercent(margemCalculada)}
          </div>
          <Badge 
            variant={margemCalculada >= 50 ? "default" : margemCalculada >= 30 ? "secondary" : "destructive"}
            className="text-xs mt-1"
          >
            {margemCalculada >= 50 ? "Excelente" : margemCalculada >= 30 ? "Boa" : "Baixa"}
          </Badge>
        </CardContent>
      </Card>

      {/* Break-even */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-orange-700">
              Break-even
            </CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold text-orange-900">
            {pacote.break_even_clientes || 1} cliente{(pacote.break_even_clientes || 1) > 1 ? 's' : ''}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            Para cobrir custos fixos
          </div>
        </CardContent>
      </Card>

      {/* Limite/Capacidade */}
      <Card className="border-slate-200 bg-slate-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700">
              Capacidade
            </CardTitle>
            <Users className="h-4 w-4 text-slate-600" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            {pacote.limite_usuarios && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">{pacote.limite_usuarios}</span> usuários
              </div>
            )}
            {pacote.limite_documentos_mes && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">{pacote.limite_documentos_mes.toLocaleString()}</span> docs/mês
              </div>
            )}
            {pacote.limite_filiais && (
              <div className="text-sm text-slate-600">
                <span className="font-medium">{pacote.limite_filiais}</span> filiais
              </div>
            )}
            {!pacote.limite_usuarios && !pacote.limite_documentos_mes && !pacote.limite_filiais && (
              <div className="text-sm text-slate-500">Sem limites específicos</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}