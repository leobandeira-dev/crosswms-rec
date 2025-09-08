
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useEmpresasList = () => {
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Carregar empresas do Supabase quando o componente for montado
  useEffect(() => {
    const fetchEmpresas = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .order('razao_social', { ascending: true });
        
        if (error) throw error;
        
        // Mapear os dados do Supabase para o formato esperado pelo componente
        const empresasFormatadas = data.map(emp => ({
          id: emp.id,
          nome: emp.nome_fantasia || emp.razao_social,
          razaoSocial: emp.razao_social,
          nomeFantasia: emp.nome_fantasia,
          cnpj: emp.cnpj,
          perfil: emp.perfil || 'Cliente',
          status: emp.status,
          endereco: emp.logradouro ? `${emp.logradouro}, ${emp.numero} - ${emp.cidade}/${emp.uf}` : null,
          email: emp.email,
          telefone: emp.telefone,
          logradouro: emp.logradouro,
          numero: emp.numero,
          complemento: emp.complemento,
          bairro: emp.bairro,
          cidade: emp.cidade,
          uf: emp.uf,
          estado: emp.estado,
          cep: emp.cep,
          inscricaoEstadual: emp.inscricao_estadual,
          transportadoraPrincipal: emp.transportadora_principal,
          dataCadastro: new Date(emp.created_at).toLocaleDateString(),
        }));
        
        console.log('Empresas carregadas:', empresasFormatadas);
        setEmpresas(empresasFormatadas);
      } catch (error: any) {
        console.error('Erro ao carregar empresas:', error);
        toast({
          title: 'Erro ao carregar empresas',
          description: error.message || 'Não foi possível carregar as empresas.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmpresas();
    
    // Configurar listener para atualizações em tempo real da tabela empresas
    const channel = supabase
      .channel('empresas-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'empresas' }, 
        () => {
          console.log('Alterações detectadas na tabela empresas. Recarregando dados...');
          fetchEmpresas();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const handleVerDetalhes = (empresa: any) => {
    setSelectedEmpresa(empresa);
    setDetailsDialogOpen(true);
  };

  const handleEmpresaSubmit = async (data: any) => {
    console.log("Empresa submetida:", data);
    
    // Recarregar a lista de empresas
    try {
      const { data: empresasAtualizadas, error } = await supabase
        .from('empresas')
        .select('*')
        .order('razao_social', { ascending: true });
        
      if (error) {
        console.error('Erro ao recarregar empresas:', error);
        return;
      }
      
      // Atualizar o estado com as empresas atualizadas
      const empresasFormatadas = empresasAtualizadas.map(emp => ({
        id: emp.id,
        nome: emp.nome_fantasia || emp.razao_social,
        razaoSocial: emp.razao_social,
        nomeFantasia: emp.nome_fantasia,
        cnpj: emp.cnpj,
        perfil: emp.perfil || 'Cliente',
        status: emp.status,
        endereco: emp.logradouro ? `${emp.logradouro}, ${emp.numero} - ${emp.cidade}/${emp.uf}` : null,
        email: emp.email,
        telefone: emp.telefone,
        logradouro: emp.logradouro,
        numero: emp.numero,
        complemento: emp.complemento,
        bairro: emp.bairro,
        cidade: emp.cidade,
        uf: emp.uf,
        estado: emp.estado,
        cep: emp.cep,
        inscricaoEstadual: emp.inscricao_estadual,
        transportadoraPrincipal: emp.transportadora_principal,
        dataCadastro: new Date(emp.created_at).toLocaleDateString(),
      }));
      
      setEmpresas(empresasFormatadas);
      
      toast({
        title: "Empresa atualizada",
        description: "Os dados da empresa foram atualizados com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao atualizar empresas:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar os dados. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return {
    empresas,
    isLoading,
    selectedEmpresa,
    detailsDialogOpen,
    setDetailsDialogOpen,
    handleVerDetalhes,
    handleEmpresaSubmit
  };
};
