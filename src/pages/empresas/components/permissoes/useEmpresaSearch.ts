
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmpresaMock } from './types';

export const useEmpresaSearch = () => {
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('');
  const [empresas, setEmpresas] = useState<EmpresaMock[]>([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState<EmpresaMock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Função para buscar empresas do Supabase quando solicitado
  const fetchEmpresas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, razao_social, nome_fantasia, cnpj, perfil, status')
        .eq('status', 'ativo');

      if (error) {
        throw new Error(error.message);
      }

      console.log('Empresas carregadas do Supabase:', data);

      // Mapear os dados do Supabase para o formato esperado pelo componente
      const formattedData: EmpresaMock[] = data.map(item => ({
        id: item.id,
        nome: item.nome_fantasia || item.razao_social,
        cnpj: item.cnpj || '',
        perfil: item.perfil || 'Cliente',
      }));

      setEmpresas(formattedData);
      setFilteredEmpresas(formattedData);
      setIsInitialized(true);
    } catch (err: any) {
      console.error('Erro ao buscar empresas:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmpresaChange = (value: string) => {
    setSelectedEmpresa(value);
  };

  const handleSearch = (term: string, activeFilters?: Record<string, string[]>) => {
    // Se os dados ainda não foram carregados, carrega-os agora
    if (!isInitialized) {
      fetchEmpresas();
      return;
    }

    let filtered = [...empresas];

    // Filtrar por termo de busca (nome ou CNPJ)
    if (term) {
      const searchTerm = term.toLowerCase();
      filtered = filtered.filter(
        empresa =>
          empresa.nome.toLowerCase().includes(searchTerm) ||
          empresa.cnpj.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrar por filtros ativos (como perfil)
    if (activeFilters) {
      if (activeFilters.perfil?.length) {
        filtered = filtered.filter(empresa => 
          activeFilters.perfil.includes(empresa.perfil)
        );
      }
    }

    setFilteredEmpresas(filtered);
  };

  const getEmpresaName = (id: string) => {
    const empresa = empresas.find(e => e.id === id);
    return empresa ? empresa.nome : '';
  };

  return {
    selectedEmpresa,
    filteredEmpresas,
    handleEmpresaChange,
    handleSearch,
    getEmpresaName,
    isLoading,
    error,
    fetchEmpresas,
    isInitialized
  };
};
