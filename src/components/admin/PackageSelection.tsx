import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building, Package, Zap } from 'lucide-react';

interface PackageOption {
  id: string;
  nome: string;
  tipo_pacote: string;
  preco_mensal: number;
  descricao?: string;
}

interface PackageSelectionProps {
  selectedModules: string[];
  selectedProcessingPlan: string;
  onModuleChange: (moduleId: string, checked: boolean) => void;
  onProcessingPlanChange: (planId: string) => void;
  packages: PackageOption[];
  disabled?: boolean;
}

export default function PackageSelection({
  selectedModules,
  selectedProcessingPlan,
  onModuleChange,
  onProcessingPlanChange,
  packages,
  disabled = false
}: PackageSelectionProps) {
  
  const modulePackages = packages.filter(p => p.tipo_pacote === 'modulo_sistema');
  const processingPlans = packages.filter(p => p.tipo_pacote === 'plano_processamento');

  const formatPrice = (price: number) => {
    return `R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const calculateTotal = () => {
    const moduleTotal = selectedModules.reduce((total, moduleId) => {
      const module = modulePackages.find(p => p.id === moduleId);
      return total + (module ? module.preco_mensal : 0);
    }, 0);

    const processingPlan = processingPlans.find(p => p.id === selectedProcessingPlan);
    const processingTotal = processingPlan ? processingPlan.preco_mensal : 0;

    return moduleTotal + processingTotal;
  };

  return (
    <div className="space-y-6">
      {/* Módulos do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Módulos do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {modulePackages.map((module) => {
            const isSelected = selectedModules.includes(module.id);
            const isObrigatorio = module.id === 'plataforma-wms';
            
            return (
              <div key={module.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={module.id}
                    checked={isSelected}
                    onCheckedChange={(checked) => onModuleChange(module.id, checked as boolean)}
                    disabled={disabled || isObrigatorio}
                  />
                  <div>
                    <label htmlFor={module.id} className="font-medium cursor-pointer">
                      {module.nome}
                      {isObrigatorio && <Badge variant="secondary" className="ml-2">Obrigatório</Badge>}
                    </label>
                    {module.descricao && (
                      <p className="text-sm text-gray-600">{module.descricao}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">{formatPrice(module.preco_mensal)}/mês</div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Planos de Processamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Planos de Processamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedProcessingPlan} 
            onValueChange={onProcessingPlanChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um plano de processamento" />
            </SelectTrigger>
            <SelectContent>
              {processingPlans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  <div className="flex justify-between items-center w-full">
                    <span>{plan.nome}</span>
                    <span className="ml-4 font-semibold text-green-600">
                      {formatPrice(plan.preco_mensal)}/mês
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Resumo do Total */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Building className="w-5 h-5" />
            Resumo da Assinatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Módulos ({selectedModules.length})</span>
              <span>{formatPrice(selectedModules.reduce((total, moduleId) => {
                const module = modulePackages.find(p => p.id === moduleId);
                return total + (module ? module.preco_mensal : 0);
              }, 0))}</span>
            </div>
            {selectedProcessingPlan && (
              <div className="flex justify-between text-sm">
                <span>Processamento</span>
                <span>{formatPrice(processingPlans.find(p => p.id === selectedProcessingPlan)?.preco_mensal || 0)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total Mensal</span>
              <span className="text-green-600">{formatPrice(calculateTotal())}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}