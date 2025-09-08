
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, User, Building, RefreshCw } from 'lucide-react';

const userSchema = z.object({
  nome: z.string().min(3, { message: 'Nome é obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }),
  empresa: z.string().min(2, { message: 'Empresa é obrigatória' }),
  cnpj: z.string().min(14, { message: 'CNPJ inválido' }).max(18),
  perfil: z.string({ required_error: 'Selecione um perfil' }),
});

type UserFormValues = z.infer<typeof userSchema>;

interface CadastroFormProps {
  onSubmit: (data: UserFormValues) => void;
}

// Mock função para buscar empresa por CNPJ
const fetchEmpresaByCNPJ = async (cnpj: string): Promise<any> => {
  // Simulando delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data
  return {
    nome: 'Empresa ' + cnpj.substr(0, 5),
    endereco: 'Rua Exemplo, 123',
    cidade: 'São Paulo',
    estado: 'SP',
  };
};

const CadastroForm: React.FC<CadastroFormProps> = ({ onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cadastroMethod, setCadastroMethod] = useState<'email' | 'google'>('email');
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: '',
      email: '',
      empresa: '',
      cnpj: '',
      perfil: '',
    },
  });

  const handleSubmit = (data: UserFormValues) => {
    onSubmit(data);
    form.reset();
  };

  const handleCNPJBlur = async () => {
    const cnpj = form.getValues('cnpj');
    if (cnpj && cnpj.length >= 14) {
      setIsLoading(true);
      try {
        const empresa = await fetchEmpresaByCNPJ(cnpj);
        form.setValue('empresa', empresa.nome);
      } catch (error) {
        console.error('Erro ao buscar empresa:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div>
      <Tabs value={cadastroMethod} onValueChange={(value: string) => setCadastroMethod(value as 'email' | 'google')}>
        <TabsList className="mb-6">
          <TabsTrigger value="email">Cadastro com Email</TabsTrigger>
          <TabsTrigger value="google">Cadastro com Google</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-gray-100 p-2 flex items-center justify-center border border-r-0 rounded-l">
                            <User size={18} className="text-gray-500" />
                          </div>
                          <Input {...field} className="rounded-l-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-gray-100 p-2 flex items-center justify-center border border-r-0 rounded-l">
                            <Mail size={18} className="text-gray-500" />
                          </div>
                          <Input {...field} type="email" className="rounded-l-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-gray-100 p-2 flex items-center justify-center border border-r-0 rounded-l">
                            <Building size={18} className="text-gray-500" />
                          </div>
                          <Input 
                            {...field} 
                            className="rounded-l-none" 
                            onBlur={handleCNPJBlur}
                          />
                          {isLoading && (
                            <div className="bg-gray-100 p-2 flex items-center justify-center border border-l-0 rounded-r">
                              <RefreshCw size={18} className="text-gray-500 animate-spin" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-gray-100 p-2 flex items-center justify-center border border-r-0 rounded-l">
                            <Building size={18} className="text-gray-500" />
                          </div>
                          <Input {...field} className="rounded-l-none" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="perfil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um perfil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cliente">Cliente</SelectItem>
                          <SelectItem value="Fornecedor externo">Fornecedor externo</SelectItem>
                          <SelectItem value="Funcionário Operacional">Funcionário Operacional</SelectItem>
                          <SelectItem value="Funcionário Supervisor">Funcionário Supervisor</SelectItem>
                          <SelectItem value="Administrador">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" className="bg-cross-blue hover:bg-cross-blue/90">
                  Realizar Cadastro
                </Button>
              </div>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="google">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center p-6">
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-medium">Entre com sua conta Google</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Após autenticação, você precisará completar algumas informações adicionais.
                  </p>
                </div>
                
                <Button 
                  className="flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 w-full max-w-sm"
                  onClick={() => alert('Integração com Google em desenvolvimento.')}
                >
                  <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                      <path d="M21.35,11.1H12v3.2h5.59c-0.24,1.37-0.97,2.52-2.07,3.29v2.73h3.35c1.96-1.81,3.09-4.47,3.09-7.62C21.96,11.97,21.75,11.51,21.35,11.1z" fill="#4285F4"></path>
                      <path d="M12,21.96c2.8,0,5.15-0.93,6.87-2.5l-3.35-2.6c-0.93,0.62-2.12,0.99-3.52,0.99c-2.71,0-5-1.83-5.82-4.3H2.67v2.69C4.37,19.65,7.93,21.96,12,21.96z" fill="#34A853"></path>
                      <path d="M6.17,13.55c-0.21-0.63-0.33-1.3-0.33-1.99c0-0.69,0.12-1.36,0.33-1.99V6.88H2.67C2.04,8.17,1.69,9.63,1.69,11.17c0,1.54,0.35,3,0.98,4.29L6.17,13.55z" fill="#FBBC05"></path>
                      <path d="M12,5.57c1.53,0,2.9,0.53,3.98,1.55l2.97-2.97C17.12,2.47,14.77,1.54,12,1.54c-4.07,0-7.63,2.3-9.33,5.66l3.5,2.71C6.99,7.4,9.28,5.57,12,5.57z" fill="#EA4335"></path>
                    </g>
                  </svg>
                  <span>Continuar com Google</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Importante:</h4>
        <p className="text-sm text-blue-700">
          Após o cadastro, você receberá um email de confirmação com um código de verificação.
          Seu acesso ao sistema estará pendente até a aprovação do administrador.
        </p>
      </div>
    </div>
  );
};

export default CadastroForm;
