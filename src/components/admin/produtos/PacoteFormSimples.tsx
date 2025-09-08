import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Package,
  DollarSign,
  Settings,
  CheckCircle,
  XCircle,
  Calculator
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PacoteFormProps {
  pacoteId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

interface PacoteFormData {
  nome: string;
  descricao: string;
  tipo_pacote: string; // 'modulo_sistema' ou 'plano_processamento'
  
  // Para Módulos do Sistema
  rotas_ativas: string[];
  modulos_inclusos: string[];
  funcionalidades: string[];
  
  // Para Planos de Processamento
  limite_documentos_mes: number;
  limite_notas_fiscais: number;
  limite_ordens_carga: number;
  
  // Campos comuns
  preco_mensal: number;
  preco_anual: number;
  custo_infraestrutura: number;
  custo_por_documento: number;
  custo_api_externa: number;
  custo_processamento: number;
  margem_lucro_percentual: number;
  lucro_estimado_mensal: number;
  break_even_clientes: number;
  limite_usuarios: number;
  limite_filiais: number;
}

export const PacoteFormSimples: React.FC<PacoteFormProps> = ({ pacoteId, onSave, onCancel }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<PacoteFormData>({
    nome: '',
    descricao: '',
    tipo_pacote: 'modulo_sistema',
    
    // Para Módulos do Sistema
    rotas_ativas: [],
    modulos_inclusos: [],
    funcionalidades: [],
    
    // Para Planos de Processamento
    limite_documentos_mes: 0,
    limite_notas_fiscais: 0,
    limite_ordens_carga: 0,
    
    // Campos comuns
    preco_mensal: 0,
    preco_anual: 0,
    custo_infraestrutura: 0,
    custo_por_documento: 0,
    custo_api_externa: 0,
    custo_processamento: 0,
    margem_lucro_percentual: 0,
    lucro_estimado_mensal: 0,
    break_even_clientes: 1,
    limite_usuarios: 0,
    limite_filiais: 0
  });

  const [isActive, setIsActive] = useState(true);

  // Função para calcular automaticamente margem e lucro
  const calcularRentabilidade = () => {
    const receita = Number(formData.preco_mensal || 0);
    const custoTotal = Number(formData.custo_infraestrutura || 0) + 
                      Number(formData.custo_por_documento || 0) + 
                      Number(formData.custo_api_externa || 0) + 
                      Number(formData.custo_processamento || 0);
    
    if (receita > 0) {
      const lucroEstimado = receita - custoTotal;
      const margemLucro = (lucroEstimado / receita) * 100;
      const breakEven = custoTotal > 0 ? Math.ceil(custoTotal / (receita > custoTotal ? receita - custoTotal : 1)) : 1;
      
      setFormData(prev => ({
        ...prev,
        margem_lucro_percentual: Number(margemLucro.toFixed(2)),
        lucro_estimado_mensal: Number(lucroEstimado.toFixed(2)),
        break_even_clientes: breakEven
      }));
    }
  };

  // Executar cálculo sempre que custos ou preço mudarem
  useEffect(() => {
    calcularRentabilidade();
  }, [
    formData.preco_mensal,
    formData.custo_infraestrutura,
    formData.custo_por_documento,
    formData.custo_api_externa,
    formData.custo_processamento
  ]);

  // Módulos disponíveis
  const modulosDisponiveis = [
    { id: 'dashboard', titulo: 'Dashboard', descricao: 'Painel principal com métricas' },
    { id: 'coletas', titulo: 'Coletas', descricao: 'Gestão de solicitações de coleta' },
    { id: 'armazenagem', titulo: 'Armazenagem', descricao: 'Gestão de armazém e estoque' },
    { id: 'carregamento', titulo: 'Carregamento', descricao: 'Planejamento de cargas' },
    { id: 'relatorios', titulo: 'Relatórios', descricao: 'Relatórios e análises' },
    { id: 'configuracoes', titulo: 'Configurações', descricao: 'Configurações do sistema' }
  ];

  // Carregar dados do pacote se for edição
  const { data: pacote } = useQuery({
    queryKey: [`/api/admin/pacotes/${pacoteId}`],
    enabled: !!pacoteId,
  });

  useEffect(() => {
    if (pacote) {
      setFormData({
        nome: (pacote as any).nome || '',
        descricao: (pacote as any).descricao || '',
        tipo_pacote: (pacote as any).tipo_pacote || 'modulo_sistema',
        
        // Para Módulos do Sistema
        rotas_ativas: (pacote as any).rotas_ativas || [],
        modulos_inclusos: (pacote as any).modulos_inclusos || [],
        funcionalidades: (pacote as any).funcionalidades || [],
        
        // Para Planos de Processamento
        limite_documentos_mes: (pacote as any).limite_documentos_mes || 0,
        limite_notas_fiscais: (pacote as any).limite_notas_fiscais || 0,
        limite_ordens_carga: (pacote as any).limite_ordens_carga || 0,
        
        // Campos comuns
        preco_mensal: (pacote as any).preco_mensal || 0,
        preco_anual: (pacote as any).preco_anual || 0,
        custo_infraestrutura: (pacote as any).custo_infraestrutura || 0,
        custo_por_documento: (pacote as any).custo_por_documento || 0,
        custo_api_externa: (pacote as any).custo_api_externa || 0,
        custo_processamento: (pacote as any).custo_processamento || 0,
        margem_lucro_percentual: (pacote as any).margem_lucro_percentual || 0,
        lucro_estimado_mensal: (pacote as any).lucro_estimado_mensal || 0,
        break_even_clientes: (pacote as any).break_even_clientes || 1,
        limite_usuarios: (pacote as any).limite_usuarios || 0,
        limite_filiais: (pacote as any).limite_filiais || 0
      });
      setIsActive((pacote as any).ativo);
    }
  }, [pacote]);

  // Mutation para salvar pacote
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = pacoteId 
        ? `/api/admin/pacotes/${pacoteId}` 
        : '/api/admin/pacotes';
      const method = pacoteId ? 'PUT' : 'POST';
      
      return apiRequest(url, {
        method,
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: pacoteId ? "Pacote atualizado com sucesso!" : "Pacote criado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pacotes'] });
      onSave();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar pacote",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do pacote é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const dataToSave = {
      ...formData,
      id: pacoteId || `pacote_${Date.now()}`,
      ativo: isActive,
      preco_mensal: Number(formData.preco_mensal),
      preco_anual: Number(formData.preco_anual),
      limite_usuarios: Number(formData.limite_usuarios) || null,
      limite_filiais: Number(formData.limite_filiais) || null,
    };

    saveMutation.mutate(dataToSave);
  };

  const toggleModulo = (moduloId: string) => {
    setFormData(prev => ({
      ...prev,
      modulos_inclusos: prev.modulos_inclusos.includes(moduloId)
        ? prev.modulos_inclusos.filter(id => id !== moduloId)
        : [...prev.modulos_inclusos, moduloId]
    }));
  };

  const addFuncionalidade = (funcionalidade: string) => {
    if (funcionalidade.trim() && !formData.funcionalidades.includes(funcionalidade)) {
      setFormData(prev => ({
        ...prev,
        funcionalidades: [...prev.funcionalidades, funcionalidade.trim()]
      }));
    }
  };

  const removeFuncionalidade = (funcionalidade: string) => {
    setFormData(prev => ({
      ...prev,
      funcionalidades: prev.funcionalidades.filter(f => f !== funcionalidade)
    }));
  };

  const funcionalidadesPrincipais = [
    // NFe e Documentos
    'Importação NFe via API (NSDocs)',
    'Upload de arquivos XML',
    'Preenchimento manual de documentos',
    'Validação automática de chaves NFe',
    'Extração completa de dados fiscais',
    'Geração de etiquetas e códigos de barras',
    'Impressão de romaneios e relatórios',
    
    // Gestão de Volumes e Cubagem
    'Cubagem em metros cúbicos (m³)',
    'Gestão individual de volumes',
    'Dimensionamento (altura, largura, comprimento)',
    'Controle de peso bruto e líquido',
    'Rastreamento de volumes por código',
    'Alertas de dimensões não informadas',
    
    // Ordem de Carregamento
    'Planejamento de cargas',
    'Classificação de documentos (Entrada/Saída)',
    'Gestão de remetentes e destinatários',
    'Busca automática de dados por CNPJ',
    'Controle de prioridades',
    'Validação de múltiplas partes',
    
    // Armazenagem e Logística
    'Dashboard com indicadores operacionais',
    'Conferência de mercadorias',
    'Endereçamento de produtos',
    'Checklist de carregamento',
    'Rastreamento completo',
    'Controle de movimentações',
    
    // Coletas e Solicitações
    'Solicitações de coleta',
    'Programação de rotas',
    'Execução de coletas',
    'Relatórios de performance',
    'Notificações automáticas',
    
    // Multi-Tenant e Administração
    'Arquitetura multi-empresa',
    'Controle hierárquico de acesso',
    'Gestão de perfis e permissões',
    'Sistema de aprovações',
    'Configurações por empresa',
    'Auditoria de segurança',
    
    // Relatórios e Analytics
    'Relatórios personalizáveis',
    'Exportação Excel/PDF',
    'Insights de performance',
    'Análise geográfica',
    'Métricas operacionais',
    'Dashboard executivo',
    
    // Integrações e APIs
    'API REST completa',
    'Integração com scanner de código de barras',
    'Consulta automática de CNPJs',
    'Sincronização em tempo real',
    'Webhooks para notificações',
    
    // Segurança e Confiabilidade
    'Autenticação JWT',
    'Controle de sessões',
    'Logs de auditoria',
    'Backup automático',
    'Recuperação de dados',
    'Criptografia de senhas'
  ];

  const adicionarFuncionalidadesPrincipais = () => {
    const funcionalidadesTodas = formData.funcionalidades.concat(funcionalidadesPrincipais);
    const funcionalidadesUnicas = funcionalidadesTodas.filter((func, index) => 
      funcionalidadesTodas.indexOf(func) === index
    );
    
    setFormData(prev => ({
      ...prev,
      funcionalidades: funcionalidadesUnicas
    }));
    
    toast({
      title: "Funcionalidades Adicionadas",
      description: `${funcionalidadesPrincipais.length} funcionalidades principais do sistema foram adicionadas.`
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipo de Pacote */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label htmlFor="tipo_pacote" className="text-base font-semibold">Tipo de Pacote *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.tipo_pacote === 'modulo_sistema' 
                      ? 'border-blue-500 bg-blue-100' 
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, tipo_pacote: 'modulo_sistema' }))}
                >
                  <h3 className="font-semibold text-blue-700">Módulo do Sistema</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Valores fixos mensais - mapeia rotas específicas do sistema
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Ex: Plataforma WMS, Portal Cliente, Portal Fornecedor
                  </p>
                </div>
                
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.tipo_pacote === 'plano_processamento' 
                      ? 'border-green-500 bg-green-100' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, tipo_pacote: 'plano_processamento' }))}
                >
                  <h3 className="font-semibold text-green-700">Plano de Processamento</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Valores variáveis por documento processado
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Ex: Start 1000, Growth 2500, Business 5000
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome do Pacote *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder={formData.tipo_pacote === 'modulo_sistema' ? "Ex: Plataforma WMS" : "Ex: Start 1000"}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="ativo">Pacote Ativo</Label>
                {isActive ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva as características do pacote..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preços e Limites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Preços e Limites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="preco_mensal">Preço Mensal (R$)</Label>
                <Input
                  id="preco_mensal"
                  type="number"
                  step="0.01"
                  value={formData.preco_mensal}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco_mensal: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label htmlFor="preco_anual">Preço Anual (R$)</Label>
                <Input
                  id="preco_anual"
                  type="number"
                  step="0.01"
                  value={formData.preco_anual}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco_anual: Number(e.target.value) }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="limite_usuarios">Limite de Usuários</Label>
                <Input
                  id="limite_usuarios"
                  type="number"
                  value={formData.limite_usuarios || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, limite_usuarios: Number(e.target.value) }))}
                  placeholder="Deixe vazio para ilimitado"
                />
              </div>
              
              <div>
                <Label htmlFor="limite_filiais">Limite de Filiais</Label>
                <Input
                  id="limite_filiais"
                  type="number"
                  value={formData.limite_filiais || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, limite_filiais: Number(e.target.value) }))}
                  placeholder="Deixe vazio para ilimitado"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custos Operacionais e Rentabilidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Custos Operacionais e Rentabilidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custo_infraestrutura">Custo de Infraestrutura (R$)</Label>
                <Input
                  id="custo_infraestrutura"
                  type="number"
                  step="0.01"
                  value={formData.custo_infraestrutura || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, custo_infraestrutura: Number(e.target.value) }))}
                  placeholder="Ex: 45.00"
                />
                <p className="text-xs text-gray-500 mt-1">Custos fixos de servidor, hosting, etc.</p>
              </div>
              
              <div>
                <Label htmlFor="custo_por_documento">Custo por Documento (R$)</Label>
                <Input
                  id="custo_por_documento"
                  type="number"
                  step="0.01"
                  value={formData.custo_por_documento || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, custo_por_documento: Number(e.target.value) }))}
                  placeholder="Ex: 0.15"
                />
                <p className="text-xs text-gray-500 mt-1">Custo variável por documento processado</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="custo_api_externa">Custo API Externa (R$)</Label>
                <Input
                  id="custo_api_externa"
                  type="number"
                  step="0.01"
                  value={formData.custo_api_externa || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, custo_api_externa: Number(e.target.value) }))}
                  placeholder="Ex: 0.05"
                />
                <p className="text-xs text-gray-500 mt-1">Custos de APIs terceirizadas (NSDocs, etc.)</p>
              </div>
              
              <div>
                <Label htmlFor="custo_processamento">Custo de Processamento (R$)</Label>
                <Input
                  id="custo_processamento"
                  type="number"
                  step="0.01"
                  value={formData.custo_processamento || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, custo_processamento: Number(e.target.value) }))}
                  placeholder="Ex: 15.00"
                />
                <p className="text-xs text-gray-500 mt-1">Custos operacionais de processamento</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="margem_lucro_percentual">Margem de Lucro (%) - Calculado</Label>
                <Input
                  id="margem_lucro_percentual"
                  type="number"
                  step="0.01"
                  value={formData.margem_lucro_percentual || ''}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                  placeholder="Calculado automaticamente"
                />
                <p className="text-xs text-green-600 mt-1">✓ Calculado automaticamente: (Receita - Custos) / Receita × 100</p>
              </div>
              
              <div>
                <Label htmlFor="lucro_estimado_mensal">Lucro Estimado Mensal (R$) - Calculado</Label>
                <Input
                  id="lucro_estimado_mensal"
                  type="number"
                  step="0.01"
                  value={formData.lucro_estimado_mensal || ''}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                  placeholder="Calculado automaticamente"
                />
                <p className="text-xs text-green-600 mt-1">✓ Calculado automaticamente: Receita - Custos Totais</p>
              </div>
              
              <div>
                <Label htmlFor="break_even_clientes">Break-even (Clientes) - Calculado</Label>
                <Input
                  id="break_even_clientes"
                  type="number"
                  value={formData.break_even_clientes || ''}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                  placeholder="Calculado automaticamente"
                />
                <p className="text-xs text-green-600 mt-1">✓ Calculado automaticamente: Custos ÷ Lucro por Cliente</p>
              </div>
            </div>
            
            {/* Resumo da Rentabilidade em Tempo Real */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-3">📊 Resumo da Rentabilidade</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Receita Mensal</p>
                  <p className="text-lg font-bold text-blue-600">R$ {Number(formData.preco_mensal || 0).toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Custos Totais</p>
                  <p className="text-lg font-bold text-red-600">
                    R$ {(Number(formData.custo_infraestrutura || 0) + 
                         Number(formData.custo_por_documento || 0) + 
                         Number(formData.custo_api_externa || 0) + 
                         Number(formData.custo_processamento || 0)).toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Lucro Mensal</p>
                  <p className={`text-lg font-bold ${Number(formData.lucro_estimado_mensal || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {Number(formData.lucro_estimado_mensal || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Margem (%)</p>
                  <p className={`text-lg font-bold ${Number(formData.margem_lucro_percentual || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(formData.margem_lucro_percentual || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Break-even:</strong> {formData.break_even_clientes} cliente(s) para cobrir custos</li>
                  <li>• <strong>Viabilidade:</strong> {(formData.margem_lucro_percentual || 0) > 20 ? '✅ Excelente' : (formData.margem_lucro_percentual || 0) > 10 ? '⚠️ Aceitável' : '❌ Baixa'} rentabilidade</li>
                  <li>• <strong>Cálculos:</strong> Atualizados automaticamente em tempo real</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campos específicos para Planos de Processamento */}
        {formData.tipo_pacote === 'plano_processamento' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-green-600" />
                Limites de Processamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="limite_documentos_mes">Documentos/Mês *</Label>
                  <Input
                    id="limite_documentos_mes"
                    type="number"
                    value={formData.limite_documentos_mes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, limite_documentos_mes: Number(e.target.value) }))}
                    placeholder="Ex: 1000"
                    required={formData.tipo_pacote === 'plano_processamento'}
                  />
                  <p className="text-xs text-gray-500 mt-1">Limite total de documentos</p>
                </div>
                
                <div>
                  <Label htmlFor="limite_notas_fiscais">NFe/Mês</Label>
                  <Input
                    id="limite_notas_fiscais"
                    type="number"
                    value={formData.limite_notas_fiscais || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, limite_notas_fiscais: Number(e.target.value) }))}
                    placeholder="Ex: 600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Limite específico para NFe</p>
                </div>
                
                <div>
                  <Label htmlFor="limite_ordens_carga">Ordens de Carga/Mês</Label>
                  <Input
                    id="limite_ordens_carga"
                    type="number"
                    value={formData.limite_ordens_carga || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, limite_ordens_carga: Number(e.target.value) }))}
                    placeholder="Ex: 400"
                  />
                  <p className="text-xs text-gray-500 mt-1">Limite específico para ordens</p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Informações sobre Planos de Processamento</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Os custos são calculados por documento processado</li>
                  <li>• Inclui NFe inseridas, ordens de carga criadas e solicitações de coleta</li>
                  <li>• Valores cobrados conforme uso mensal efetivo</li>
                  <li>• Alertas automáticos quando próximo do limite</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Campos específicos para Módulos do Sistema */}
        {formData.tipo_pacote === 'modulo_sistema' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                Rotas Ativas do Módulo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Rotas do Sistema CrossWMS</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Selecione quais rotas ficarão ativas quando este módulo for contratado:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    // Armazenagem
                    { grupo: 'Armazenagem', rotas: ['/armazenagem', '/armazenagem/recebimento', '/armazenagem/conferencia', '/armazenagem/enderecamento', '/armazenagem/checklist'] },
                    // Coletas
                    { grupo: 'Coletas', rotas: ['/coletas', '/coletas/nova-ordem', '/coletas/solicitacoes', '/coletas/programacao'] },
                    // Carregamento
                    { grupo: 'Carregamento', rotas: ['/carregamento', '/carregamento/planejamento', '/carregamento/execucao'] },
                    // Portal Cliente
                    { grupo: 'Portal Cliente', rotas: ['/cliente/dashboard', '/cliente/solicitacoes', '/cliente/rastreamento'] },
                    // Portal Fornecedor  
                    { grupo: 'Portal Fornecedor', rotas: ['/fornecedor/dashboard', '/fornecedor/documentos', '/fornecedor/comunicacao'] },
                    // Relatórios
                    { grupo: 'Relatórios', rotas: ['/relatorios', '/relatorios/operacionais', '/relatorios/financeiros'] },
                    // Configurações
                    { grupo: 'Configurações', rotas: ['/configuracoes', '/configuracoes/usuarios', '/configuracoes/permissoes'] }
                  ].map((modulo) => (
                    <div key={modulo.grupo} className="border rounded-lg p-3">
                      <h5 className="font-medium text-blue-800 mb-2">{modulo.grupo}</h5>
                      {modulo.rotas.map((rota) => (
                        <label key={rota} className="flex items-center space-x-2 mb-1">
                          <input
                            type="checkbox"
                            checked={formData.rotas_ativas.includes(rota)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  rotas_ativas: [...prev.rotas_ativas, rota]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  rotas_ativas: prev.rotas_ativas.filter(r => r !== rota)
                                }));
                              }
                            }}
                            className="rounded border-blue-300"
                          />
                          <span className="text-xs">{rota}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Módulos Inclusos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Módulos Inclusos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modulosDisponiveis.map((modulo) => (
                <div
                  key={modulo.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.modulos_inclusos.includes(modulo.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => toggleModulo(modulo.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{modulo.titulo}</h4>
                    {formData.modulos_inclusos.includes(modulo.id) && (
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{modulo.descricao}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Funcionalidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Funcionalidades Específicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={adicionarFuncionalidadesPrincipais}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Carregar Funcionalidades Principais do Sistema
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Digite uma funcionalidade personalizada..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addFuncionalidade(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  addFuncionalidade(input.value);
                  input.value = '';
                }}
              >
                Adicionar
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.funcionalidades.map((func, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeFuncionalidade(func)}
                >
                  {func} ×
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Salvando...' : (pacoteId ? 'Atualizar' : 'Criar')} Pacote
          </Button>
        </div>
      </form>
    </div>
  );
};