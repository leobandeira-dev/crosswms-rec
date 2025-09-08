import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package,
  DollarSign,
  Users,
  Building,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ModuloSistema {
  id: string;
  nome: string;
  titulo: string;
  descricao: string;
  categoria: string;
  funcionalidades: string[];
  tipo_usuario: string[];
  ativo: boolean;
}

interface PacoteFormProps {
  pacoteId?: string | null;
  onSave: () => void;
  onCancel: () => void;
}

interface PacoteFormData {
  nome: string;
  descricao: string;
  preco_mensal: number;
  preco_anual: number;
  limite_usuarios: number;
  limite_filiais: number;
  modulos_inclusos: string[];
  funcionalidades: string[];
  configuracoes: Record<string, any>;
}

const defaultFormData: PacoteFormData = {
  nome: '',
  descricao: '',
  preco_mensal: 0,
  preco_anual: 0,
  limite_usuarios: 1,
  limite_filiais: 1,
  modulos_inclusos: [],
  funcionalidades: [],
  configuracoes: {}
};

export const PacoteForm = ({ pacoteId, onSave, onCancel }: PacoteFormProps) => {
  const [formData, setFormData] = useState<PacoteFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  // Query para buscar dados do pacote (se editando)
  const { data: pacote, isLoading: pacoteLoading } = useQuery({
    queryKey: ['/api/admin/pacotes', pacoteId],
    enabled: !!pacoteId,
  });

  // Query para buscar módulos disponíveis
  const { data: modulos = [], isLoading: modulosLoading } = useQuery<ModuloSistema[]>({
    queryKey: ['/api/admin/modulos-sistema'],
  });

  // Mutation para criar pacote
  const createMutation = useMutation({
    mutationFn: (data: PacoteFormData) => 
      apiRequest('/api/admin/pacotes', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({
        title: "Pacote criado",
        description: "O pacote foi criado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pacotes'] });
      onSave();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar pacote",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  // Mutation para atualizar pacote
  const updateMutation = useMutation({
    mutationFn: (data: PacoteFormData) => 
      apiRequest(`/api/admin/pacotes/${pacoteId}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({
        title: "Pacote atualizado",
        description: "O pacote foi atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pacotes'] });
      onSave();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar pacote",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  // Carregar dados do pacote para edição
  useEffect(() => {
    if (pacote && typeof pacote === 'object') {
      setFormData({
        nome: (pacote as any).nome || '',
        descricao: (pacote as any).descricao || '',
        preco_mensal: parseFloat((pacote as any).preco_mensal || '0'),
        preco_anual: parseFloat((pacote as any).preco_anual || '0'),
        limite_usuarios: (pacote as any).limite_usuarios || 1,
        limite_filiais: (pacote as any).limite_filiais || 1,
        modulos_inclusos: (pacote as any).modulos_inclusos || [],
        funcionalidades: (pacote as any).funcionalidades || [],
        configuracoes: (pacote as any).configuracoes || {}
      });
    }
  }, [pacote]);

  const handleInputChange = (field: keyof PacoteFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpar erro do campo quando usuario digita
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleModuloToggle = (moduloId: string) => {
    const isIncluded = formData.modulos_inclusos.includes(moduloId);
    const newModulos = isIncluded
      ? formData.modulos_inclusos.filter(id => id !== moduloId)
      : [...formData.modulos_inclusos, moduloId];
    
    handleInputChange('modulos_inclusos', newModulos);

    // Atualizar funcionalidades baseado nos módulos selecionados
    const selectedModules = modulos.filter(m => newModulos.includes(m.id));
    const allFuncionalidades = selectedModules.flatMap(m => m.funcionalidades || []);
    const uniqueFuncionalidades = Array.from(new Set(allFuncionalidades));
    handleInputChange('funcionalidades', uniqueFuncionalidades);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (formData.preco_mensal <= 0) {
      newErrors.preco_mensal = 'Preço mensal deve ser maior que zero';
    }

    if (formData.limite_usuarios <= 0) {
      newErrors.limite_usuarios = 'Limite de usuários deve ser maior que zero';
    }

    if (formData.limite_filiais <= 0) {
      newErrors.limite_filiais = 'Limite de filiais deve ser maior que zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: "Dados inválidos",
        description: "Verifique os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (pacoteId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = pacoteLoading || modulosLoading;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Agrupar módulos por categoria
  const modulosPorCategoria = modulos.reduce((acc, modulo) => {
    const categoria = modulo.categoria || 'Outros';
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(modulo);
    return acc;
  }, {} as Record<string, ModuloSistema[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0098DA] mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Pacote *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Pacote Básico"
                className={errors.nome ? 'border-red-500' : ''}
              />
              {errors.nome && <p className="text-sm text-red-500 mt-1">{errors.nome}</p>}
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descreva as características e benefícios do pacote"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preços e Limites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Preços e Limites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="preco_mensal">Preço Mensal (R$) *</Label>
              <Input
                id="preco_mensal"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco_mensal}
                onChange={(e) => handleInputChange('preco_mensal', parseFloat(e.target.value) || 0)}
                className={errors.preco_mensal ? 'border-red-500' : ''}
              />
              {errors.preco_mensal && <p className="text-sm text-red-500 mt-1">{errors.preco_mensal}</p>}
            </div>

            <div>
              <Label htmlFor="preco_anual">Preço Anual (R$)</Label>
              <Input
                id="preco_anual"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco_anual}
                onChange={(e) => handleInputChange('preco_anual', parseFloat(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Economia: {formData.preco_anual > 0 && formData.preco_mensal > 0 
                  ? `${Math.round((1 - (formData.preco_anual / (formData.preco_mensal * 12))) * 100)}%`
                  : '0%'}
              </p>
            </div>

            <div>
              <Label htmlFor="limite_usuarios">Limite de Usuários *</Label>
              <Input
                id="limite_usuarios"
                type="number"
                min="1"
                value={formData.limite_usuarios}
                onChange={(e) => handleInputChange('limite_usuarios', parseInt(e.target.value) || 1)}
                className={errors.limite_usuarios ? 'border-red-500' : ''}
              />
              {errors.limite_usuarios && <p className="text-sm text-red-500 mt-1">{errors.limite_usuarios}</p>}
            </div>

            <div>
              <Label htmlFor="limite_filiais">Limite de Filiais *</Label>
              <Input
                id="limite_filiais"
                type="number"
                min="1"
                value={formData.limite_filiais}
                onChange={(e) => handleInputChange('limite_filiais', parseInt(e.target.value) || 1)}
                className={errors.limite_filiais ? 'border-red-500' : ''}
              />
              {errors.limite_filiais && <p className="text-sm text-red-500 mt-1">{errors.limite_filiais}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Módulos e Funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Módulos e Funcionalidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(modulosPorCategoria).map(([categoria, modulosCategoria]) => (
            <div key={categoria}>
              <h4 className="font-medium text-lg mb-3">{categoria}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modulosCategoria.map((modulo) => {
                  const isIncluded = formData.modulos_inclusos.includes(modulo.id);
                  return (
                    <Card key={modulo.id} className={`cursor-pointer transition-colors ${
                      isIncluded ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-medium">{modulo.titulo}</h5>
                              {isIncluded ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {modulo.descricao}
                            </p>
                            {modulo.funcionalidades && modulo.funcionalidades.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {modulo.funcionalidades.slice(0, 3).map((func, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {func}
                                  </Badge>
                                ))}
                                {modulo.funcionalidades.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{modulo.funcionalidades.length - 3} mais
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <Switch
                            checked={isIncluded}
                            onCheckedChange={() => handleModuloToggle(modulo.id)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {categoria !== Object.keys(modulosPorCategoria)[Object.keys(modulosPorCategoria).length - 1] && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}
          
          {/* Resumo de Funcionalidades Incluídas */}
          {formData.funcionalidades.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium mb-2">Funcionalidades Incluídas ({formData.funcionalidades.length})</h5>
              <div className="flex flex-wrap gap-1">
                {formData.funcionalidades.map((func, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {func}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : (pacoteId ? 'Atualizar Pacote' : 'Criar Pacote')}
        </Button>
      </div>
    </div>
  );
};