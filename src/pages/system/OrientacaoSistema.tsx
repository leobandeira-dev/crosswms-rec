import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProfileBadge } from '@/components/ui/ProfileBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, Truck, Building, Package, 
  CheckCircle, AlertCircle, Info, ArrowRight,
  LayoutDashboard, Users, Settings, FileText, BarChart3,
  Archive, Map, MessageSquare, Shield, Database
} from 'lucide-react';

const OrientacaoSistema: React.FC = () => {
  const { user } = useAuth();

  const getUserTypeInfo = (userType?: string) => {
    switch (userType?.toLowerCase()) {
      case 'super_admin':
        return {
          title: 'Super Administrador',
          description: 'Administrador geral do sistema com acesso total a todas as funcionalidades',
          icon: Crown,
          color: 'from-purple-600 to-purple-700',
          permissions: [
            'Gestão completa de empresas e usuários',
            'Configuração de pacotes e assinaturas',
            'Monitoramento do sistema e relatórios globais',
            'Aprovação de novos transportadores',
            'Configurações avançadas do sistema',
            'Suporte técnico e helpdesk'
          ],
          modules: [
            { name: 'Dashboard Admin', description: 'Visão geral do sistema', icon: LayoutDashboard },
            { name: 'Gestão de Empresas', description: 'Controle de todas as empresas', icon: Building },
            { name: 'Gestão de Pacotes', description: 'Configuração de planos', icon: Package },
            { name: 'Suporte', description: 'Sistema de tickets', icon: MessageSquare },
            { name: 'Relatórios Globais', description: 'Analytics do sistema', icon: BarChart3 }
          ],
          workflows: [
            '1. Aprovação de Transportadores → 2. Configuração de Pacotes → 3. Monitoramento',
            '1. Gestão de Empresas → 2. Suporte Técnico → 3. Relatórios'
          ]
        };
      case 'transportador':
        return {
          title: 'Transportador / Operador Logístico',
          description: 'Empresa transportadora com acesso completo aos módulos operacionais',
          icon: Truck,
          color: 'from-blue-600 to-blue-700',
          permissions: [
            'Gestão completa de operações logísticas',
            'Controle de coletas e carregamentos',
            'Administração de motoristas e veículos',
            'Aprovação de clientes e fornecedores',
            'Configurações da empresa',
            'Relatórios operacionais'
          ],
          modules: [
            { name: 'Armazenagem', description: 'Conferência, endereçamento, checklist', icon: Archive },
            { name: 'Coletas', description: 'Programação e execução de coletas', icon: Map },
            { name: 'Carregamento', description: 'Planejamento e ordem de carga', icon: Truck },
            { name: 'Marketplace', description: 'Gestão de cargas', icon: Package },
            { name: 'Configurações', description: 'Gestão de usuários e aprovações', icon: Settings }
          ],
          workflows: [
            '1. Recebimento de NFe → 2. Armazenagem → 3. Ordem de Carga → 4. Expedição',
            '1. Solicitação de Coleta → 2. Programação → 3. Execução → 4. Relatórios'
          ]
        };
      case 'cliente':
        return {
          title: 'Cliente',
          description: 'Empresa cliente com acesso ao portal de acompanhamento',
          icon: Building,
          color: 'from-green-600 to-green-700',
          permissions: [
            'Acompanhamento de cargas e coletas',
            'Visualização de documentos',
            'Solicitação de novos serviços',
            'Relatórios de suas operações',
            'Comunicação com transportador',
            'Aprovação de operações'
          ],
          modules: [
            { name: 'Dashboard Cliente', description: 'Visão geral das operações', icon: LayoutDashboard },
            { name: 'Minhas Cargas', description: 'Acompanhamento em tempo real', icon: Package },
            { name: 'Documentos', description: 'NFes e comprovantes', icon: FileText },
            { name: 'Solicitações', description: 'Novos pedidos de coleta', icon: MessageSquare },
            { name: 'Relatórios', description: 'Histórico e performance', icon: BarChart3 }
          ],
          workflows: [
            '1. Solicitação de Coleta → 2. Aprovação → 3. Acompanhamento → 4. Recebimento',
            '1. Consulta de Cargas → 2. Documentos → 3. Relatórios'
          ]
        };
      case 'fornecedor':
        return {
          title: 'Fornecedor',
          description: 'Empresa fornecedora com acesso ao portal de documentação',
          icon: Package,
          color: 'from-orange-600 to-orange-700',
          permissions: [
            'Envio de documentação de cargas',
            'Acompanhamento de entregas',
            'Comunicação com transportador',
            'Visualização de relatórios',
            'Aprovação de recebimentos',
            'Gestão de documentos'
          ],
          modules: [
            { name: 'Portal Fornecedor', description: 'Área principal de trabalho', icon: LayoutDashboard },
            { name: 'Envio de Docs', description: 'Upload de NFes e documentos', icon: FileText },
            { name: 'Minhas Entregas', description: 'Acompanhamento de status', icon: Truck },
            { name: 'Comunicação', description: 'Chat com transportador', icon: MessageSquare },
            { name: 'Relatórios', description: 'Histórico de operações', icon: BarChart3 }
          ],
          workflows: [
            '1. Envio de NFe → 2. Documentação → 3. Acompanhamento → 4. Confirmação',
            '1. Upload de Documentos → 2. Aprovação → 3. Entrega'
          ]
        };
      default:
        return {
          title: 'Usuário',
          description: 'Usuário padrão do sistema',
          icon: Shield,
          color: 'from-gray-600 to-gray-700',
          permissions: [
            'Acesso básico ao sistema',
            'Visualização de informações permitidas',
            'Operações conforme perfil definido'
          ],
          modules: [
            { name: 'Dashboard', description: 'Visão geral básica', icon: LayoutDashboard }
          ],
          workflows: [
            'Acesso limitado conforme permissões do perfil'
          ]
        };
    }
  };

  const userInfo = getUserTypeInfo(user?.funcao);
  const Icon = userInfo.icon;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 bg-gradient-to-r ${userInfo.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
            <Icon size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orientações do Sistema</h1>
            <p className="text-gray-600">Guia completo para {userInfo.title}</p>
          </div>
        </div>
        
        {user && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#0098DA] rounded-full flex items-center justify-center text-white font-medium">
                    {user.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.nome}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <ProfileBadge userType={user.funcao || 'usuario'} size="md" showIcon={true} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon size={24} />
            {userInfo.title}
          </CardTitle>
          <CardDescription>
            {userInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Permissions */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                Suas Permissões
              </h4>
              <ul className="space-y-2">
                {userInfo.permissions.map((permission, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    {permission}
                  </li>
                ))}
              </ul>
            </div>

            {/* Workflows */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ArrowRight size={20} className="text-blue-600" />
                Fluxos de Trabalho
              </h4>
              <ul className="space-y-3">
                {userInfo.workflows.map((workflow, index) => (
                  <li key={index} className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {workflow}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Modules */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database size={24} />
            Módulos Disponíveis
          </CardTitle>
          <CardDescription>
            Funcionalidades e rotinas que você pode acessar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userInfo.modules.map((module, index) => {
              const ModuleIcon = module.icon;
              return (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ModuleIcon size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{module.name}</h5>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info size={24} />
            Dicas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Info size={20} className="text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 mb-1">Navegação</h5>
                <p className="text-sm text-blue-800">
                  Use o menu superior para navegar entre os módulos. Seu badge de perfil sempre estará visível no canto superior direito.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle size={20} className="text-green-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-green-900 mb-1">Permissões</h5>
                <p className="text-sm text-green-800">
                  Suas permissões são definidas pelo seu perfil. Se precisar de acesso adicional, entre em contato com o administrador.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <AlertCircle size={20} className="text-orange-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-orange-900 mb-1">Suporte</h5>
                <p className="text-sm text-orange-800">
                  Em caso de dúvidas ou problemas, utilize o menu de configurações para acessar o suporte ou entre em contato com sua equipe.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrientacaoSistema;