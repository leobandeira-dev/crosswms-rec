
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Info, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const StripeIntegrationSection: React.FC = () => {
  const { toast } = useToast();
  const [stripeApiKey, setStripeApiKey] = useState('');
  const [testMode, setTestMode] = useState(true);
  const [loading, setSaving] = useState(false);

  const validateApiKey = (key: string): boolean => {
    // Validação básica do formato da chave Stripe
    if (!key.trim()) return false;
    
    if (testMode) {
      return key.startsWith('sk_test_') || key.startsWith('pk_test_');
    } else {
      return key.startsWith('sk_live_') || key.startsWith('pk_live_');
    }
  };

  const handleSave = async () => {
    if (!stripeApiKey.trim()) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, insira uma chave API válida do Stripe.",
        variant: "destructive"
      });
      return;
    }

    if (!validateApiKey(stripeApiKey)) {
      const modeText = testMode ? 'teste' : 'produção';
      toast({
        title: "Chave API Inválida",
        description: `A chave API deve ser válida para o modo ${modeText}.`,
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      // Simular salvamento (aqui seria a integração real com o backend)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configurações Salvas",
        description: "As configurações do Stripe foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Integração com Stripe
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  A integração com o Stripe permite processar pagamentos de forma segura. 
                  Configure suas chaves API para habilitar funcionalidades de pagamento no sistema.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripe-mode">Modo de Operação</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="stripe-mode"
                checked={testMode}
                onCheckedChange={setTestMode}
              />
              <Label htmlFor="stripe-mode" className="text-sm">
                {testMode ? 'Modo de Teste' : 'Modo de Produção'}
              </Label>
            </div>
            <p className="text-xs text-gray-600">
              {testMode 
                ? 'Utilize chaves de teste (sk_test_ ou pk_test_) para desenvolvimento'
                : 'Utilize chaves de produção (sk_live_ ou pk_live_) para ambiente real'
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe-api-key">Chave API do Stripe</Label>
            <Input
              id="stripe-api-key"
              type="password"
              placeholder={testMode ? "sk_test_..." : "sk_live_..."}
              value={stripeApiKey}
              onChange={(e) => setStripeApiKey(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-gray-600">
              Sua chave secreta do Stripe. Esta informação será armazenada de forma segura.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Sobre a Integração</p>
              <p className="text-blue-700">
                A integração com Stripe permitirá processar pagamentos com cartão de crédito, 
                débito e outros métodos de pagamento de forma segura. Certifique-se de usar 
                as chaves corretas para cada ambiente.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripeIntegrationSection;
