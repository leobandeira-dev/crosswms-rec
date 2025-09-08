
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Settings, Building, User, Shield, CreditCard } from 'lucide-react';
import EmpresaLogoSection from './components/EmpresaLogoSection';
import StripeIntegrationSection from './components/StripeIntegrationSection';

const ConfiguracoesPage: React.FC = () => {
  return (
    <MainLayout title="Configurações">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Configurações do Sistema</h2>
        <p className="text-gray-600">Gerencie as configurações da sua empresa e preferências do sistema</p>
      </div>

      <Tabs defaultValue="empresa" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="empresa" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Usuários
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
          <EmpresaLogoSection />
          
          {/* Placeholder para outras configurações da empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Informações Gerais</h3>
              <p className="text-gray-600">Configure dados básicos da empresa</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Preferências</h3>
              <p className="text-gray-600">Ajuste preferências do sistema</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usuarios">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Gerenciamento de Usuários</h3>
            <p className="text-gray-600">Gerencie usuários e suas permissões</p>
          </div>
        </TabsContent>

        <TabsContent value="permissoes">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Controle de Permissões</h3>
            <p className="text-gray-600">Configure permissões e níveis de acesso</p>
          </div>
        </TabsContent>

        <TabsContent value="pagamentos">
          <StripeIntegrationSection />
        </TabsContent>

        <TabsContent value="sistema">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Configurações do Sistema</h3>
            <p className="text-gray-600">Ajustes gerais do sistema</p>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default ConfiguracoesPage;
