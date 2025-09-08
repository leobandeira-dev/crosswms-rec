
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Empresa } from '@/pages/empresas/types/empresa.types';

export const useEmpresaOperations = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const cadastrarEmpresa = async (dadosEmpresa: Partial<Empresa>) => {
    setIsLoading(true);
    console.log('Dados da empresa a cadastrar:', dadosEmpresa);

    try {
      // Verificar se o CNPJ já existe - garantindo que seja feito apenas se o CNPJ estiver preenchido
      if (dadosEmpresa.cnpj) {
        const cnpjLimpo = dadosEmpresa.cnpj.replace(/\D/g, '');
        
        const { data: empresaExistente } = await supabase
          .from('empresas')
          .select('id')
          .eq('cnpj', cnpjLimpo)
          .maybeSingle();

        if (empresaExistente) {
          toast({
            title: 'CNPJ já cadastrado',
            description: 'Uma empresa com este CNPJ já existe no sistema.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return false;
        }
      } else {
        toast({
          title: 'CNPJ obrigatório',
          description: 'O CNPJ é obrigatório para cadastrar uma empresa.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return false;
      }

      // Mapear os dados do formulário para o formato esperado pelo Supabase
      const empresaData = {
        razao_social: dadosEmpresa.razaoSocial,
        nome_fantasia: dadosEmpresa.nomeFantasia,
        cnpj: dadosEmpresa.cnpj ? dadosEmpresa.cnpj.replace(/\D/g, '') : null,
        email: dadosEmpresa.email,
        telefone: dadosEmpresa.telefone,
        logradouro: dadosEmpresa.logradouro,
        numero: dadosEmpresa.numero,
        complemento: dadosEmpresa.complemento,
        bairro: dadosEmpresa.bairro,
        cidade: dadosEmpresa.cidade,
        uf: dadosEmpresa.uf,
        estado: dadosEmpresa.uf, // Supabase usa 'estado' em vez de 'uf'
        cep: dadosEmpresa.cep ? dadosEmpresa.cep.replace(/\D/g, '') : null,
        inscricao_estadual: dadosEmpresa.inscricaoEstadual,
        perfil: dadosEmpresa.perfil,
        tipo: dadosEmpresa.tipo || 'Cliente',
        transportadora_principal: dadosEmpresa.transportadoraPrincipal || false,
        status: 'ativo',
      };

      console.log('Dados a serem enviados para o Supabase:', empresaData);

      const { data, error } = await supabase
        .from('empresas')
        .insert(empresaData)
        .select();

      if (error) {
        console.error('Erro durante inserção no Supabase:', error);
        throw new Error(error.message);
      }

      console.log('Empresa cadastrada com sucesso:', data);

      toast({
        title: 'Empresa cadastrada com sucesso',
        description: `${dadosEmpresa.razaoSocial} foi cadastrada com sucesso.`,
      });

      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Erro ao cadastrar empresa:', error);
      toast({
        title: 'Erro ao cadastrar empresa',
        description: error.message || 'Não foi possível cadastrar a empresa. Tente novamente.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  };

  const atualizarEmpresa = async (id: string, dadosEmpresa: Partial<Empresa>) => {
    setIsLoading(true);
    console.log('Atualizando empresa ID:', id, 'com dados:', dadosEmpresa);

    try {
      // Mapear os dados para o formato esperado pelo Supabase
      const empresaData = {
        razao_social: dadosEmpresa.razaoSocial,
        nome_fantasia: dadosEmpresa.nomeFantasia,
        email: dadosEmpresa.email,
        telefone: dadosEmpresa.telefone,
        logradouro: dadosEmpresa.logradouro,
        numero: dadosEmpresa.numero,
        complemento: dadosEmpresa.complemento,
        bairro: dadosEmpresa.bairro,
        cidade: dadosEmpresa.cidade,
        uf: dadosEmpresa.uf,
        estado: dadosEmpresa.uf, // Supabase usa 'estado' em vez de 'uf'
        cep: dadosEmpresa.cep ? dadosEmpresa.cep.replace(/\D/g, '') : null,
        inscricao_estadual: dadosEmpresa.inscricaoEstadual,
        perfil: dadosEmpresa.perfil,
        tipo: dadosEmpresa.tipo || 'Cliente',
        transportadora_principal: dadosEmpresa.transportadoraPrincipal || false,
      };

      const { data, error } = await supabase
        .from('empresas')
        .update(empresaData)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      console.log('Empresa atualizada com sucesso:', data);

      toast({
        title: 'Empresa atualizada com sucesso',
        description: `${dadosEmpresa.razaoSocial} foi atualizada com sucesso.`,
      });

      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar empresa:', error);
      toast({
        title: 'Erro ao atualizar empresa',
        description: error.message || 'Não foi possível atualizar a empresa. Tente novamente.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
  };

  return {
    cadastrarEmpresa,
    atualizarEmpresa,
    isLoading,
  };
};
