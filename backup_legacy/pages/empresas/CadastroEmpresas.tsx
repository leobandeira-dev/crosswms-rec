
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import EmpresaDetailsDialog from './components/EmpresaDetailsDialog';
import { useEmpresasList } from './hooks/useEmpresasList';
import { useEmpresasTabs, EmpresaTab } from './hooks/useEmpresasTabs';
import NovaEmpresaTab from './components/tabs/NovaEmpresaTab';
import PermissoesTabWrapper from './components/tabs/PermissoesTabWrapper';
import EmpresasListTabWrapper from './components/tabs/EmpresasListTabWrapper';

interface CadastroEmpresasProps {
  initialTab?: EmpresaTab;
}

const CadastroEmpresas: React.FC<CadastroEmpresasProps> = ({ initialTab = 'cadastro' }) => {
  const { currentTab, setCurrentTab } = useEmpresasTabs({ initialTab });
  const { 
    empresas, 
    isLoading, 
    selectedEmpresa, 
    detailsDialogOpen, 
    setDetailsDialogOpen, 
    handleVerDetalhes, 
    handleEmpresaSubmit 
  } = useEmpresasList();
  
  return (
    <MainLayout title="Cadastro de Empresas">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Gerenciamento de Empresas</h2>
        <p className="text-gray-600">Cadastro, permissões e listagem de empresas no sistema</p>
      </div>
      
      <Tabs defaultValue="cadastro" className="mb-6" value={currentTab} onValueChange={(value) => setCurrentTab(value as EmpresaTab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="cadastro">Nova Empresa</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          <TabsTrigger value="listagem">Empresas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cadastro">
          <NovaEmpresaTab />
        </TabsContent>
        
        <TabsContent value="permissoes">
          <PermissoesTabWrapper />
        </TabsContent>
        
        <TabsContent value="listagem">
          <EmpresasListTabWrapper 
            empresas={empresas}
            isLoading={isLoading}
            onViewDetails={handleVerDetalhes}
          />
        </TabsContent>
      </Tabs>
      
      <EmpresaDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        empresa={selectedEmpresa}
        onSubmit={handleEmpresaSubmit}
      />
    </MainLayout>
  );
};

export default CadastroEmpresas;
