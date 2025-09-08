
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchCNPJData, formatCNPJ, cleanCNPJ } from '@/utils/cnpjApi';
import { NotaFiscalSchemaType } from './notaFiscalSchema';

const DadosEmitente: React.FC = () => {
  const { control, setValue } = useFormContext<NotaFiscalSchemaType>();
  const { toast } = useToast();
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);

  // Função para buscar dados do CNPJ
  const buscarDadosCNPJ = async (cnpj: string) => {
    const cleanCnpj = cleanCNPJ(cnpj);
    console.log('Buscando CNPJ:', cleanCnpj);
    
    if (!cleanCnpj || cleanCnpj.length !== 14) {
      toast({
        title: "CNPJ Inválido",
        description: `Digite um CNPJ válido com 14 dígitos. Você digitou: ${cleanCnpj} (${cleanCnpj.length} dígitos)`,
        variant: "destructive"
      });
      return;
    }

    setIsLoadingCNPJ(true);
    try {
      console.log('Chamando fetchCNPJData com:', cleanCnpj);
      const result = await fetchCNPJData(cleanCnpj);
      console.log('Resultado da busca CNPJ:', result);
      
      if (result.success && result.data) {
        console.log('Preenchendo campos do emitente com:', result.data);
        setValue('emitenteCnpj', formatCNPJ(result.data.cnpj));
        setValue('emitenteRazaoSocial', result.data.razaoSocial);
        setValue('emitenteTelefone', result.data.telefone);
        setValue('emitenteUf', result.data.uf);
        setValue('emitenteCidade', result.data.cidade);
        setValue('emitenteBairro', result.data.bairro);
        setValue('emitenteEndereco', result.data.endereco);
        setValue('emitenteNumero', result.data.numero);
        setValue('emitenteCep', result.data.cep);
        
        toast({
          title: "Sucesso",
          description: `Dados do emitente preenchidos automaticamente (${result.source})`,
          variant: "default"
        });
      } else {
        console.error('Erro na busca CNPJ:', result);
        toast({
          title: "CNPJ não encontrado",
          description: result.error || "Não foi possível encontrar os dados do CNPJ",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Erro ao consultar CNPJ. Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCNPJ(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Dados do Emitente</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="emitenteCnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input {...field} value={field.value || ''} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const clean = cleanCNPJ(field.value || '');
                        if (clean.length === 14) {
                          buscarDadosCNPJ(clean);
                        } else {
                          toast({
                            title: "CNPJ Inválido",
                            description: "Digite um CNPJ válido com 14 dígitos",
                            variant: "destructive"
                          });
                        }
                      }}
                      disabled={isLoadingCNPJ}
                      className="px-3"
                    >
                      {isLoadingCNPJ ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="emitenteRazaoSocial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Razão Social</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="emitenteTelefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="emitenteUf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UF</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="emitenteCidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="emitenteBairro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="emitenteEndereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={control}
              name="emitenteNumero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={control}
              name="emitenteCep"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DadosEmitente;
