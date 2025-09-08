
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Empresa } from '../types/empresa.types';
import CNPJField from './form/CNPJField';
import BasicInfoFields from './form/BasicInfoFields';
import AddressFields from './form/AddressFields';
import CompanyProfileFields from './form/CompanyProfileFields';
import { useEmpresaOperations } from '@/hooks/useEmpresaOperations';

// Schema for form validation
const empresaSchema = z.object({
  cnpj: z.string().min(18, 'CNPJ inválido').max(18, 'CNPJ inválido'),
  razaoSocial: z.string().min(3, 'Razão social deve ter pelo menos 3 caracteres'),
  nomeFantasia: z.string().min(2, 'Nome fantasia deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  logradouro: z.string().min(5, 'Logradouro deve ter pelo menos 5 caracteres'),
  numero: z.string().min(1, 'Número é obrigatório'),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  cidade: z.string().min(2, 'Cidade inválida'),
  uf: z.string().length(2, 'Estado deve ter 2 caracteres (sigla)'),
  cep: z.string().length(9, 'CEP inválido'),
  transportadoraPrincipal: z.boolean().optional(),
  perfil: z.string().min(1, 'Selecione um perfil'),
  complemento: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
});

type EmpresaFormValues = z.infer<typeof empresaSchema>;

interface EmpresaFormProps {
  empresa?: Partial<Empresa>;
  onSubmit?: (data: Partial<Empresa>) => void;
  onCancel?: () => void;
}

const perfisList = [
  { value: 'Transportadora', label: 'Transportadora' },
  { value: 'Filial', label: 'Filial' },
  { value: 'Cliente', label: 'Cliente' },
  { value: 'Fornecedor', label: 'Fornecedor' },
];

const EmpresaForm: React.FC<EmpresaFormProps> = ({ empresa, onSubmit, onCancel }) => {
  const { cadastrarEmpresa, atualizarEmpresa, isLoading } = useEmpresaOperations();
  const isEditMode = !!empresa?.id;
  
  const form = useForm<EmpresaFormValues>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      cnpj: empresa?.cnpj || '',
      razaoSocial: empresa?.razaoSocial || '',
      nomeFantasia: empresa?.nomeFantasia || '',
      email: empresa?.email || '',
      telefone: empresa?.telefone || '',
      logradouro: empresa?.logradouro || '',
      numero: empresa?.numero || '',
      complemento: empresa?.complemento || '',
      bairro: empresa?.bairro || '',
      cidade: empresa?.cidade || '',
      uf: empresa?.uf || '',
      cep: empresa?.cep || '',
      inscricaoEstadual: empresa?.inscricaoEstadual || '',
      transportadoraPrincipal: empresa?.transportadoraPrincipal || false,
      perfil: empresa?.perfil || '',
    },
  });

  const handleSubmit = async (data: EmpresaFormValues) => {
    console.log('Submetendo formulário:', data);
    
    // Se tiver um callback externo de onSubmit, chama ele
    if (onSubmit) {
      onSubmit(data);
      return;
    }
    
    let success = false;
    
    // Caso contrário, usa o hook para cadastrar ou atualizar
    if (isEditMode && empresa?.id) {
      success = await atualizarEmpresa(empresa.id, data as Partial<Empresa>);
    } else {
      success = await cadastrarEmpresa(data as Partial<Empresa>);
    }
    
    // Se o cadastro foi bem-sucedido, reseta o formulário
    if (success && !isEditMode) {
      form.reset({
        cnpj: '',
        razaoSocial: '',
        nomeFantasia: '',
        email: '',
        telefone: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: '',
        inscricaoEstadual: '',
        transportadoraPrincipal: false,
        perfil: '',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* CNPJ Search Section */}
        <div className="mb-2">
          <CNPJField form={form} disabled={isEditMode} />
        </div>
        
        {/* Basic Information Section */}
        <div className="mb-4">
          <h3 className="font-medium mb-3">Informações Básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BasicInfoFields form={form} />
          </div>
        </div>
        
        {/* Address Section */}
        <div className="mb-4">
          <h3 className="font-medium mb-3">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddressFields form={form} />
          </div>
        </div>
        
        {/* Profile Section */}
        <div className="mb-4">
          <CompanyProfileFields form={form} perfisList={perfisList} />
        </div>
        
        <div className="flex space-x-4">
          <Button 
            type="submit" 
            className="bg-cross-blue hover:bg-cross-blueDark"
            disabled={isLoading}
          >
            {isLoading ? (isEditMode ? 'Salvando...' : 'Cadastrando...') : (isEditMode ? 'Salvar Alterações' : 'Cadastrar Empresa')}
          </Button>
          
          {onCancel && (
            <Button 
              type="button"
              variant="outline" 
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default EmpresaForm;
