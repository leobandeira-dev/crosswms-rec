
import React, { useState } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UseFormReturn } from 'react-hook-form';
import { consultarCNPJComAlternativa, formatarCNPJ, mapearDadosParaFormulario } from '@/services/cnpjService';

interface CNPJFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean; // Added this prop to the interface
}

const CNPJField: React.FC<CNPJFieldProps> = ({ form, disabled = false }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearched, setLastSearched] = useState<string>('');
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 14) {
      value = value
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    e.target.value = value;
    form.setValue('cnpj', value);
    
    // Reset estado de mock data quando o usuário muda o CNPJ
    if (isUsingMockData) {
      setIsUsingMockData(false);
    }
  };

  const handleBuscarCNPJ = async () => {
    const cnpj = form.getValues('cnpj');
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    
    if (cnpjLimpo.length !== 14) {
      toast({
        title: "CNPJ inválido",
        description: "O CNPJ deve conter 14 dígitos.",
        variant: "destructive"
      });
      return;
    }

    // Se o CNPJ já foi pesquisado recentemente, não faz nova consulta
    if (lastSearched === cnpjLimpo) {
      toast({
        title: "Info",
        description: "Este CNPJ já foi pesquisado recentemente.",
      });
      return;
    }
    
    setIsLoading(true);
    setIsUsingMockData(false);
    
    try {
      // Usando a função alternativa que tenta múltiplos métodos
      const dados = await consultarCNPJComAlternativa(cnpjLimpo);
      
      if (dados.status === 'ERROR') {
        throw new Error(dados.message || 'CNPJ não encontrado');
      }
      
      console.log("Dados recebidos da API:", dados);
      
      // Verifica se estamos usando dados mockados
      if (dados.fantasia && dados.fantasia.includes("DADOS MOCKADOS")) {
        setIsUsingMockData(true);
      }
      
      const dadosFormulario = mapearDadosParaFormulario(dados);
      console.log("Dados mapeados para o formulário:", dadosFormulario);
      
      // Atualizar os campos do formulário com os dados recebidos
      Object.entries(dadosFormulario).forEach(([campo, valor]) => {
        if (valor) {
          form.setValue(campo as any, valor);
        }
      });

      // Registra este CNPJ como já pesquisado
      setLastSearched(cnpjLimpo);
      
      toast({
        title: "Dados carregados",
        description: isUsingMockData ? 
          "Dados mockados carregados. APIs de CNPJ indisponíveis no momento." : 
          `Dados da empresa ${dados.nome} carregados com sucesso.`,
        variant: isUsingMockData ? "default" : "default"
      });
    } catch (error: any) {
      console.error("Erro completo:", error);
      toast({
        title: "Erro ao buscar CNPJ",
        description: error.message || "Não foi possível obter os dados do CNPJ.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="cnpj"
      render={({ field }) => (
        <FormItem className="relative">
          <FormLabel>CNPJ</FormLabel>
          <div className="flex gap-2 mb-1">
            <FormControl>
              <Input 
                placeholder="00.000.000/0000-00" 
                {...field} 
                onChange={handleCNPJChange}
                maxLength={18}
                disabled={disabled}
              />
            </FormControl>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBuscarCNPJ}
              disabled={isLoading || disabled}
              className="whitespace-nowrap"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Search className="h-4 w-4 mr-1" />}
              {isLoading ? "Buscando..." : "Buscar CNPJ"}
            </Button>
          </div>
          {isUsingMockData && (
            <div className="text-amber-600 flex items-center text-xs mt-1 mb-1">
              <AlertCircle className="h-3 w-3 mr-1" />
              APIs de CNPJ indisponíveis. Usando dados fictícios.
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CNPJField;
