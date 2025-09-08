
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Settings, Building, User, Shield, CreditCard, UserCheck } from 'lucide-react';
import EmpresaLogoSection from './components/EmpresaLogoSection';
import StripeIntegrationSection from './components/StripeIntegrationSection';
import InformacoesEmpresa from './components/InformacoesEmpresa';
import GerenciamentoUsuarios from './components/GerenciamentoUsuarios';
import ControlePermissoes from './components/ControlePermissoes';
import ConfiguracoesSistema from './components/ConfiguracoesSistema';
import AprovacaoUsuarios from './components/AprovacaoUsuarios';

const ConfiguracoesPage: React.FC = () => {
  return (
    <MainLayout title="Configurações">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Configurações do Sistema</h2>
        <p className="text-gray-600">Gerencie as configurações da sua empresa e preferências do sistema</p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="empresa" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="aprovacoes" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Aprovações
          </TabsTrigger>
          <TabsTrigger value="permissoes" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="space-y-6">
          <InformacoesEmpresa />
          <EmpresaLogoSection />
        </TabsContent>

        <TabsContent value="usuarios">
          <GerenciamentoUsuarios />
        </TabsContent>

        <TabsContent value="aprovacoes">
          <AprovacaoUsuarios />
        </TabsContent>

        <TabsContent value="permissoes">
          <ControlePermissoes />
        </TabsContent>

        <TabsContent value="pagamentos">
          <StripeIntegrationSection />
        </TabsContent>

        <TabsContent value="sistema">
          <ConfiguracoesSistema />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default ConfiguracoesPage;
