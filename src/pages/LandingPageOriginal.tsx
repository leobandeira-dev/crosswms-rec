import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Truck, Package, ClipboardList, BarChart4, Users, ShieldCheck, Warehouse, FileCheck, Headphones, BadgeCheck, Headset, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LandingPageOriginal = () => {
  const { user } = useAuth();

  // Define the sales packages
  const salesPackages = [{
    name: "Básico",
    price: "R$ 599/mês",
    description: "Para pequenas operações logísticas",
    features: ["Gestão de Coletas", "Cadastros Básicos", "Relatórios Essenciais", "1 Usuário"],
    highlighted: false
  }, {
    name: "Profissional",
    price: "R$ 1.299/mês",
    description: "Para operações em crescimento",
    features: ["Tudo do Básico", "Armazenagem Completa", "Carregamento", "SAC", "5 Usuários"],
    highlighted: true
  }, {
    name: "Empresarial",
    price: "R$ 2.499/mês",
    description: "Para operações complexas",
    features: ["Tudo do Profissional", "Expedição Completa", "Faturamento Automático", "API de Integração", "Usuários Ilimitados"],
    highlighted: false
  }];

  // Define the module features
  const moduleFeatures = [{
    title: "Gestão de Armazenagem",
    description: "Controle completo do estoque, movimentação interna e rastreamento de volumes",
    icon: Warehouse,
    features: ["Recebimento de Fornecedores", "Movimentações Internas", "Endereçamento Inteligente", "Unitização de Paletes"]
  }, {
    title: "Controle de Carregamento",
    description: "Planejamento e execução de carregamentos com rastreabilidade total",
    icon: Truck,
    features: ["Ordens de Carregamento", "Conferência de Carga", "Checklist de Veículos", "Endereçamento em Caminhão"]
  }, {
    title: "Gestão de Coletas",
    description: "Controle de solicitações de coleta e alocação de cargas e motoristas",
    icon: ClipboardList,
    features: ["Solicitações de Coleta", "Aprovações e Workflow", "Alocação de Cargas", "Roteirização Inteligente"]
  }, {
    title: "Expedição e Faturamento",
    description: "Emissão de documentos e gestão de faturamento integrado",
    icon: FileCheck,
    features: ["Emissão de Documentos", "Faturamento Automático", "Controle de Remessas", "Gestão de Notas Fiscais"]
  }, {
    title: "Relatórios Gerenciais",
    description: "Insights e análises para tomada de decisão estratégica",
    icon: BarChart4,
    features: ["Dashboards Personalizados", "Performance de Motoristas", "Volume por Período", "Análise de Ocorrências"]
  }, {
    title: "Suporte ao Cliente",
    description: "Gestão completa de ocorrências e atendimentos",
    icon: Headset,
    features: ["Registro de Ocorrências", "Tratamento de Chamados", "Notificações Automáticas", "Histórico de Atendimentos"]
  }];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl text-primary">CrossWMS</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-4">
                <a href="#features" className="text-gray-600 hover:text-primary">Funcionalidades</a>
                <a href="#modules" className="text-gray-600 hover:text-primary">Módulos</a>
                <a href="#pricing" className="text-gray-600 hover:text-primary">Planos</a>
              </div>
              {user ? (
                <Button asChild>
                  <Link href="/dashboard">
                    Acessar Sistema <LogIn className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/auth">
                    Login / Cadastro <LogIn className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Gestão Logística</span>
                <span className="block text-primary">Eficiente e Inteligente</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                Transforme sua operação logística com nossa plataforma completa de gestão de armazenagem, 
                carregamento e expedição. Controle total, eficiência máxima.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/auth">
                      Começar Agora <LogIn className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Package className="h-8 w-8 text-primary" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">CrossWMS</h3>
                        <p className="text-sm text-gray-500">Sistema de Gestão Logística</p>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="ml-2 text-sm text-gray-700">Controle de Armazenagem</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="ml-2 text-sm text-gray-700">Gestão de Carregamentos</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="ml-2 text-sm text-gray-700">Relatórios Inteligentes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Funcionalidades Principais
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Tudo que você precisa para uma operação logística de excelência
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {moduleFeatures.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="ml-4">
                      <CardTitle className="text-lg font-medium text-gray-900">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="mt-2 text-sm text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Planos e Preços
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Escolha o plano ideal para sua operação
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {salesPackages.map((pkg, index) => (
              <Card key={index} className={`relative overflow-hidden ${pkg.highlighted ? 'border-primary shadow-lg ring-2 ring-primary' : ''}`}>
                {pkg.highlighted && (
                  <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-primary text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                    Mais Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">{pkg.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{pkg.price}</span>
                  </div>
                  <CardDescription className="mt-2 text-sm text-gray-600">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <Button 
                      asChild 
                      className={`w-full ${pkg.highlighted ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={pkg.highlighted ? 'default' : 'outline'}
                    >
                      <Link href="/auth">
                        Escolher Plano
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Pronto para transformar sua operação?</span>
            <span className="block text-primary-200">Comece hoje mesmo.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button asChild size="lg" variant="secondary">
                <Link href="/auth">
                  Começar Agora
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="font-bold text-xl text-white">CrossWMS</span>
            <p className="mt-2 text-gray-400">
              © 2024 CrossWMS. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageOriginal;
