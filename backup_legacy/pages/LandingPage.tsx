import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Truck, Package, ClipboardList, BarChart4, Users, ShieldCheck, Warehouse, FileCheck, Headphones, BadgeCheck, Headset } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
const LandingPage = () => {
  const {
    user
  } = useAuth();

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
  return <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl text-primary">LogSystem</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex space-x-4">
                <Link to="#features" className="text-gray-600 hover:text-primary">Funcionalidades</Link>
                <Link to="#modules" className="text-gray-600 hover:text-primary">Módulos</Link>
                <Link to="#pricing" className="text-gray-600 hover:text-primary">Planos</Link>
              </div>
              {user ? <Button asChild>
                  <Link to="/dashboard">
                    Acessar Sistema <LogIn className="ml-2 h-4 w-4" />
                  </Link>
                </Button> : <Button asChild>
                  <Link to="/auth">
                    Login / Cadastro <LogIn className="ml-2 h-4 w-4" />
                  </Link>
                </Button>}
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
                Uma plataforma completa para gerenciar todas as operações logísticas de sua empresa, desde o recebimento de mercadorias até a entrega ao cliente final.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Button size="lg" asChild className="px-10">
                  <Link to="/auth">Começar agora</Link>
                </Button>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="flex justify-center items-center h-full">
                <div className="bg-gray-100 p-8 rounded-xl shadow-lg">
                  <img className="w-full object-cover rounded-lg" alt="Dashboard illustration" src="/lovable-uploads/2720fc5f-47f0-48b5-9b76-972ae900cd75.png" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Principais Benefícios
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Simplifique sua operação logística e ganhe eficiência com nossa plataforma
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Rastreabilidade Total</h3>
              <p className="mt-2 text-gray-500">Acompanhe seus produtos em tempo real desde o recebimento até a entrega</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 rounded-full">
                <BadgeCheck className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Processos Otimizados</h3>
              <p className="mt-2 text-gray-500">Reduza erros operacionais e aumente a produtividade com workflows inteligentes</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart4 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Insights em Tempo Real</h3>
              <p className="mt-2 text-gray-500">Tenha acesso a relatórios e dashboards para tomada de decisões estratégicas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Funcionalidades</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Tudo o que você precisa para gerenciar sua logística
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Uma solução completa que integra todos os processos logísticos em uma única plataforma.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {moduleFeatures.map(feature => <div key={feature.title} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="p-3 inline-flex items-center justify-center rounded-md bg-primary-100">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-base text-gray-500">
                    {feature.description}
                  </p>
                  <ul className="mt-4 space-y-2">
                    {feature.features.map((item, index) => <li key={index} className="flex items-center text-sm text-gray-500">
                        <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
                        {item}
                      </li>)}
                  </ul>
                </div>)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Modules */}
      <div id="modules" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Módulos do Sistema</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Escolha os módulos que sua operação precisa
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Cada módulo foi desenvolvido para atender necessidades específicas da cadeia logística
            </p>
          </div>
          
          <div className="space-y-12">
            {/* Armazenagem */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-primary p-6 text-white">
                  <Warehouse className="h-10 w-10 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Armazenagem</h3>
                  <p className="text-white/80">
                    Controle completo de estoque, movimentações e endereçamento de produtos
                  </p>
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Recebimento</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Recebimento de Fornecedores
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Recebimento de Filiais
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Recebimento de Coletas
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Rastreamento de Notas Fiscais
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Movimentações</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Endereçamento
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Unitização de Paletes
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Transferência entre Endereços
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-green-500"></span>
                          Geração de Etiquetas
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coletas */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-blue-600 p-6 text-white">
                  <ClipboardList className="h-10 w-10 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Coletas</h3>
                  <p className="text-white/80">
                    Gerenciamento completo do processo de coletas e alocação de cargas
                  </p>
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Solicitações</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          Cadastro de Solicitações
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          Importação via XML/Excel
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          Cálculo Automático de Volumes
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          Workflow de Aprovação
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Alocação de Cargas</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          Alocação de Motoristas
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          Roteirização Inteligente
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          Acompanhamento de Status
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          Gestão de Entregas
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Relatórios */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 bg-purple-600 p-6 text-white">
                  <BarChart4 className="h-10 w-10 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Relatórios</h3>
                  <p className="text-white/80">
                    Dashboards e relatórios detalhados para análise e tomada de decisão
                  </p>
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Operacionais</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                          Relatórios de Coletas
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                          Relatórios de Armazenagem
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                          Relatórios de Carregamento
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                          Relatórios de SAC
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Gerenciais</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                          Performance de Motoristas
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                          Faturamento e Expedição
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                          KPIs Operacionais
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                          Exportação em Múltiplos Formatos
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Planos</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Escolha o pacote ideal para seu negócio
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto mb-12">
              Temos opções flexíveis para empresas de todos os tamanhos
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {salesPackages.map((pkg, index) => <Card key={index} className={`relative overflow-hidden ${pkg.highlighted ? 'border-primary shadow-lg ring-2 ring-primary' : ''}`}>
                {pkg.highlighted && <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-primary text-white text-xs font-bold py-1 px-3 rounded-bl-lg">
                    Mais popular
                  </div>}
                <CardHeader>
                  <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">{pkg.price}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pkg.features.map((feature, i) => <li key={i} className="flex items-center">
                        <BadgeCheck className="h-5 w-5 text-green-500 mr-2" />
                        <span>{feature}</span>
                      </li>)}
                  </ul>
                  <Button className={`w-full mt-6 ${pkg.highlighted ? 'bg-primary hover:bg-primary/90' : 'bg-gray-800 hover:bg-gray-700'}`}>
                    Escolher Plano
                  </Button>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Pronto para começar?</span>
            <span className="block text-white opacity-75">Acesse agora mesmo e transforme sua logística.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/auth">
                  Criar uma conta
                </Link>
              </Button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Button variant="outline" size="lg" className="bg-white hover:bg-gray-50" asChild>
                <Link to="/auth">
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-400">
                &copy; {new Date().getFullYear()} LogSystem. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default LandingPage;