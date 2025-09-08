import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Building, Users, Globe, Truck, Check, TrendingUp, Zap, BarChart3, Cloud, FileText, 
  Shield, CheckCircle, Star, Menu, X
} from 'lucide-react';

export default function LandingPrincipalLimpa() {
  const [, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [selectedModules, setSelectedModules] = useState({
    moduloColetas: false,
    portalCliente: false,
    portalFornecedor: false
  });

  const [calculatorData, setCalculatorData] = useState({
    volumesMes: 1000
  });

  const modulesConfig = {
    plataformaWMS: {
      name: "Plataforma WMS",
      price: 499.00,
      description: "Armazenagem: Dashboard, Conferência, Endereçamento, Checklist + Carregamento: Ordem de Carga, Conferência, Layout Caminhão, Fotos",
      required: true
    },
    moduloColetas: {
      name: "Módulo de Coletas",
      price: 199.00,
      description: "Solicitações, Aprovações, Alocação de Veículos, Execução em tempo real, Rastreamento GPS, Etapas do processo",
      required: false
    },
    portalCliente: {
      name: "Portal do Cliente",
      price: 199.00,
      description: "Dashboard personalizado, Solicitação de coletas, Rastreamento de cargas, Documentos fiscais, Sistema de aprovações",
      required: false
    },
    portalFornecedor: {
      name: "Portal do Fornecedor",
      price: 199.00,
      description: "Dashboard específico, Gestão de solicitações, Documentação fiscal, Comunicação integrada, Relatórios operacionais",
      required: false
    }
  };

  // Função para recomendar plano baseado no volume
  const getRecommendedPlan = () => {
    const volume = calculatorData.volumesMes;
    
    if (volume <= 1000) {
      return {
        name: "Inicial 1000",
        price: 450,
        description: "Ideal para até 1.000 documentos/mês",
        color: "bg-blue-50 border-blue-200 text-blue-800"
      };
    } else if (volume <= 2500) {
      return {
        name: "Crescimento 2500", 
        price: 950,
        description: "Recomendado para até 2.500 documentos/mês",
        color: "bg-green-50 border-green-200 text-green-800"
      };
    } else if (volume <= 5000) {
      return {
        name: "Consolidado 5000",
        price: 1450,
        description: "Perfeito para até 5.000 documentos/mês", 
        color: "bg-purple-50 border-purple-200 text-purple-800"
      };
    } else if (volume <= 10000) {
      return {
        name: "Expansão 10000",
        price: 1950,
        description: "Ideal para até 10.000 documentos/mês",
        color: "bg-orange-50 border-orange-200 text-orange-800"
      };
    } else {
      return {
        name: "Enterprise",
        price: 2500,
        description: "Solução customizada para grandes volumes",
        color: "bg-red-50 border-red-200 text-red-800"
      };
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#0098DA] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-800">CrossWMS</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('visao-geral')} className="text-gray-600 hover:text-[#0098DA] transition-colors">
                Visão Geral
              </button>
              <button onClick={() => scrollToSection('modulos')} className="text-gray-600 hover:text-[#0098DA] transition-colors">
                Módulos
              </button>
              <button onClick={() => scrollToSection('precos')} className="text-gray-600 hover:text-[#0098DA] transition-colors">
                Preços
              </button>
              <button onClick={() => scrollToSection('calculadora')} className="text-gray-600 hover:text-[#0098DA] transition-colors">
                Calculadora
              </button>
              <button onClick={() => scrollToSection('funcionalidades')} className="text-gray-600 hover:text-[#0098DA] transition-colors">
                Funcionalidades
              </button>
              <Button 
                onClick={() => setLocation('/login')} 
                className="bg-[#0098DA] hover:bg-[#0078B7] text-white"
              >
                Entrar
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4">
              <nav className="flex flex-col space-y-4">
                <button onClick={() => scrollToSection('visao-geral')} className="text-left text-slate-600 hover:text-[#0098DA] transition-colors">
                  Visão Geral
                </button>
                <button onClick={() => scrollToSection('modulos')} className="text-left text-slate-600 hover:text-[#0098DA] transition-colors">
                  Módulos
                </button>
                <button onClick={() => scrollToSection('precos')} className="text-left text-slate-600 hover:text-[#0098DA] transition-colors">
                  Preços
                </button>
                <button onClick={() => scrollToSection('calculadora')} className="text-left text-slate-600 hover:text-[#0098DA] transition-colors">
                  Calculadora
                </button>
                <button onClick={() => scrollToSection('funcionalidades')} className="text-left text-slate-600 hover:text-[#0098DA] transition-colors">
                  Funcionalidades
                </button>
                <Button 
                  onClick={() => setLocation('/login')} 
                  className="bg-[#0098DA] hover:bg-[#0078B7] text-white w-full"
                >
                  Entrar
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>
      {/* Hero Section */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              Planos a partir de R$899
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-8 leading-tight">
              Ajudamos operadores logísticos a <span className="text-blue-600">gerenciarem seus armazéns, processos e equipes</span> com tecnologia de ponta
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-12 leading-relaxed max-w-4xl mx-auto font-medium">
              Plataforma completa para gestão logística com módulos especializados, 
              integração automática com NFe e calculadora de preços transparente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-10 max-w-2xl mx-auto">
              <div className="flex-1">
                <Input 
                  type="email"
                  placeholder="Digite seu email profissional" 
                  className="h-14 text-lg rounded-2xl border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 px-6 shadow-sm"
                />
              </div>
              <Button 
                size="lg"
                onClick={() => setLocation('/login')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 text-lg rounded-2xl font-bold whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-200 h-14"
              >
                Comece o teste de 30 dias grátis
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-medium">Teste grátis • Sem fidelidade • Sem cartão de crédito</span>
            </div>
          </div>
        </div>
      </section>
      {/* Seção: Visão Geral */}
      <section id="visao-geral" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Como Funciona o CrossWMS</h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
              Nossa precificação é transparente e flexível, dividida em duas partes simples
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Assinatura do Software */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">Assinatura do Software</CardTitle>
                <CardDescription>Taxa fixa mensal baseada nos módulos escolhidos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Escolha os módulos necessários
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Acesso completo às funcionalidades
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Valor fixo e previsível
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Plano de Processamento */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-gray-800">Plano de Processamento</CardTitle>
                <CardDescription>Taxa por volume mensal de documentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Baseado no seu volume real
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Infraestrutura escalável
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    Performance garantida
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Seção: Módulos */}
      <section id="modulos" className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Módulos do Sistema</h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
              Escolha os módulos que sua operação precisa. Comece com o básico e expanda conforme cresce.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-blue-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg text-blue-600">Plataforma WMS</CardTitle>
                <Badge variant="secondary" className="bg-red-100 text-red-700">Obrigatório</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 mb-2">R$ 499/mês</p>
                <p className="text-sm text-gray-600 mb-4">Base do sistema logístico</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Dashboard operacional</li>
                  <li>• Ordem de carga</li>
                  <li>• Conferência</li>
                  <li>• Endereçamento</li>
                  <li>• Checklist</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg text-green-600">Módulo de Coletas</CardTitle>
                <Badge variant="outline">Opcional</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 mb-2">R$ 199/mês</p>
                <p className="text-sm text-gray-600 mb-4">Gestão de coletas</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Solicitações automáticas</li>
                  <li>• Aprovações</li>
                  <li>• Alocação de veículos</li>
                  <li>• Execução GPS</li>
                  <li>• Status tempo real</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg text-purple-600">Portal do Cliente</CardTitle>
                <Badge variant="outline">Opcional</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 mb-2">R$ 199/mês</p>
                <p className="text-sm text-gray-600 mb-4">Portal dedicado</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Dashboard personalizado</li>
                  <li>• Solicitação coletas</li>
                  <li>• Rastreamento cargas</li>
                  <li>• Documentos fiscais</li>
                  <li>• Sistema aprovações</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg text-orange-600">Portal do Fornecedor</CardTitle>
                <Badge variant="outline">Opcional</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-800 mb-2">R$ 199/mês</p>
                <p className="text-sm text-gray-600 mb-4">Gestão de fornecedores</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Dashboard específico</li>
                  <li>• Gestão solicitações</li>
                  <li>• Documentação fiscal</li>
                  <li>• Comunicação integrada</li>
                  <li>• Relatórios operacionais</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Seção: Preços */}
      <section id="precos" className="py-24 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Planos de Processamento</h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
              Escolha o plano ideal baseado no volume mensal de documentos da sua operação
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <Card className="bg-white/90 backdrop-blur-sm border border-blue-200 shadow-lg">
              <CardHeader className="text-center">
                <Badge className="bg-blue-100 text-blue-700 mb-2">Inicial</Badge>
                <CardTitle className="text-xl text-gray-800">1.000 documentos</CardTitle>
                <div className="text-3xl font-bold text-blue-600 mt-2">R$ 450</div>
                <p className="text-sm text-gray-600">por mês</p>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Ideal para começar</li>
                  <li>• Suporte básico</li>
                  <li>• Relatórios essenciais</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-2 border-green-300 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600 text-white">Mais Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <Badge className="bg-green-100 text-green-700 mb-2">Crescimento</Badge>
                <CardTitle className="text-xl text-gray-800">2.500 documentos</CardTitle>
                <div className="text-3xl font-bold text-green-600 mt-2">R$ 950</div>
                <p className="text-sm text-gray-600">por mês</p>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Crescimento sustentado</li>
                  <li>• Suporte prioritário</li>
                  <li>• Relatórios avançados</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-purple-200 shadow-lg">
              <CardHeader className="text-center">
                <Badge className="bg-purple-100 text-purple-700 mb-2">Consolidado</Badge>
                <CardTitle className="text-xl text-gray-800">5.000 documentos</CardTitle>
                <div className="text-3xl font-bold text-purple-600 mt-2">R$ 1.450</div>
                <p className="text-sm text-gray-600">por mês</p>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Operação robusta</li>
                  <li>• Suporte dedicado</li>
                  <li>• Analytics completos</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-orange-200 shadow-lg">
              <CardHeader className="text-center">
                <Badge className="bg-orange-100 text-orange-700 mb-2">Expansão</Badge>
                <CardTitle className="text-xl text-gray-800">10.000 documentos</CardTitle>
                <div className="text-3xl font-bold text-orange-600 mt-2">R$ 1.950</div>
                <p className="text-sm text-gray-600">por mês</p>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Alta performance</li>
                  <li>• Account manager</li>
                  <li>• Customizações</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg">
              <CardHeader className="text-center">
                <Badge className="bg-white text-gray-900 mb-2">Enterprise</Badge>
                <CardTitle className="text-xl">Volume personalizado</CardTitle>
                <div className="text-3xl font-bold mt-2">Custom</div>
                <p className="text-sm text-gray-300">consulte-nos</p>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>• Volume ilimitado</li>
                  <li>• Suporte 24/7</li>
                  <li>• Infraestrutura dedicada</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Custos Adicionais */}
          <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-6 text-center">Custos Adicionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Armazenamento em Nuvem */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center text-sm">
                  <Cloud className="w-4 h-4 mr-2 text-gray-500" />
                  Armazenamento em Nuvem
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>10 GB inclusos</span>
                    <span className="text-green-600 font-medium">Grátis</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Armazenamento adicional</span>
                    <span className="font-medium">US$ 6,00/GB/mês</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Backup automático, redundância e acesso 24/7
                  </p>
                </div>
              </div>

              {/* Documentos Excedentes */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center text-sm">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  Documentos Excedentes
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Planos Inicial-Consolidado</span>
                    <span className="text-green-600 font-medium">Sem cobrança</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expansão (10.000+)</span>
                    <span className="font-medium">R$ 0,15/doc extra</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Flexibilidade para picos sazonais
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">Todos os planos incluem:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-1" />
                Backup automático
              </span>
              <span className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-1" />
                SSL gratuito
              </span>
              <span className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-1" />
                Atualizações incluídas
              </span>
              <span className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-1" />
                Uptime 99.9%
              </span>
            </div>
          </div>
        </div>
      </section>
      {/* Seção: Calculadora */}
      <section id="calculadora" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Calculadora de Preços</h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
              Calcule o investimento ideal para sua operação logística em poucos cliques
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Configuração dos Módulos */}
              <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">Selecione os Módulos</CardTitle>
                  <CardDescription>Escolha os módulos necessários para sua operação</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Plataforma WMS - Obrigatório */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={true} 
                        disabled={true}
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="font-semibold text-blue-800">Plataforma WMS</div>
                        <div className="text-sm text-blue-600">Base obrigatória do sistema</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-blue-600">R$ 499</div>
                  </div>

                  {/* Módulo de Coletas */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={selectedModules.moduloColetas}
                        onCheckedChange={(checked) => 
                          setSelectedModules(prev => ({ ...prev, moduloColetas: checked as boolean }))
                        }
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">Módulo de Coletas</div>
                        <div className="text-sm text-gray-600">Gestão completa de coletas</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-600">R$ 199</div>
                  </div>

                  {/* Portal do Cliente */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={selectedModules.portalCliente}
                        onCheckedChange={(checked) => 
                          setSelectedModules(prev => ({ ...prev, portalCliente: checked as boolean }))
                        }
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">Portal do Cliente</div>
                        <div className="text-sm text-gray-600">Interface dedicada para clientes</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-600">R$ 199</div>
                  </div>

                  {/* Portal do Fornecedor */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Checkbox 
                        checked={selectedModules.portalFornecedor}
                        onCheckedChange={(checked) => 
                          setSelectedModules(prev => ({ ...prev, portalFornecedor: checked as boolean }))
                        }
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="font-semibold text-gray-800">Portal do Fornecedor</div>
                        <div className="text-sm text-gray-600">Gestão de fornecedores</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-600">R$ 199</div>
                  </div>

                  {/* Volume de Documentos */}
                  <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border-2 border-blue-200">
                    <Label htmlFor="volume" className="text-lg font-bold text-gray-900 mb-3 block">
                      Volume Mensal de Documentos
                    </Label>
                    <Input
                      id="volume"
                      type="number"
                      min="1000"
                      value={calculatorData.volumesMes}
                      onChange={(e) => setCalculatorData(prev => ({ ...prev, volumesMes: parseInt(e.target.value) || 1000 }))}
                      className="text-xl h-16 rounded-xl border-2 border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 px-6 font-semibold text-center"
                      placeholder="Ex: 2500"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-blue-700 font-medium">Mínimo: 1.000 documentos/mês</p>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getRecommendedPlan().color}`}>
                        {getRecommendedPlan().name}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resumo do Investimento */}
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl text-blue-800">Resumo do Investimento</CardTitle>
                  <CardDescription className="text-blue-600">Investimento mensal total</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Módulos Selecionados */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Módulos Selecionados:</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Plataforma WMS</span>
                        <span className="font-semibold">R$ 499,00</span>
                      </div>
                      {selectedModules.moduloColetas && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Módulo de Coletas</span>
                          <span className="font-semibold">R$ 199,00</span>
                        </div>
                      )}
                      {selectedModules.portalCliente && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Portal do Cliente</span>
                          <span className="font-semibold">R$ 199,00</span>
                        </div>
                      )}
                      {selectedModules.portalFornecedor && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Portal do Fornecedor</span>
                          <span className="font-semibold">R$ 199,00</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal Módulos:</span>
                      <span className="font-semibold">
                        R$ {(modulesConfig.plataformaWMS.price + 
                            (selectedModules.moduloColetas ? modulesConfig.moduloColetas.price : 0) +
                            (selectedModules.portalCliente ? modulesConfig.portalCliente.price : 0) +
                            (selectedModules.portalFornecedor ? modulesConfig.portalFornecedor.price : 0)
                          ).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Plano de Processamento */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Plano de Processamento:</h3>
                    <div className="bg-white/70 rounded-lg p-3 border border-blue-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-gray-700">{getRecommendedPlan().name}</span>
                          <div className="text-sm text-gray-600">{calculatorData.volumesMes.toLocaleString()} documentos/mês</div>
                        </div>
                        <span className="font-semibold">R$ {getRecommendedPlan().price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t border-blue-200 pt-4">
                    <div className="flex justify-between items-center text-xl">
                      <span className="font-bold text-blue-800">Total Mensal:</span>
                      <span className="font-bold text-blue-800">
                        R$ {(modulesConfig.plataformaWMS.price + 
                            (selectedModules.moduloColetas ? modulesConfig.moduloColetas.price : 0) +
                            (selectedModules.portalCliente ? modulesConfig.portalCliente.price : 0) +
                            (selectedModules.portalFornecedor ? modulesConfig.portalFornecedor.price : 0) +
                            getRecommendedPlan().price
                          ).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">Sem taxa de setup • Sem fidelidade</p>
                  </div>

                  <Button 
                    onClick={() => setLocation('/login')}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-16 text-xl font-bold mt-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Começar Teste Gratuito de 30 Dias
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      {/* Seção: Funcionalidades Avançadas */}
      <section id="funcionalidades" className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Funcionalidades Avançadas</h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto font-medium leading-relaxed">
              Recursos desenvolvidos especificamente para operadores logísticos brasileiros
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Integração NFe Automática</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Importação automática de dados fiscais com validação em tempo real. 
                  Suporte completo a chaves de 44 dígitos e processamento em lote.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Cubagem em Metros</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Sistema de cubagem em metros com cálculo automático de volume. 
                  Interface otimizada para scanner de código de barras.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Multi-Tenant Seguro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Arquitetura multi-empresa com isolamento completo de dados. 
                  Cada cliente vê apenas suas próprias informações.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">CNPJ Automático</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Preenchimento automático de dados empresariais com consulta a bases oficiais. 
                  Validação em tempo real de CNPJ.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-lg">Validação Duplicatas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Sistema inteligente de prevenção de duplicatas com alertas visuais. 
                  Evita reprocessamento de documentos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle className="text-lg">Relatórios Analíticos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Exportação Excel/PDF com análises geográficas, distribuição de cargas 
                  e métricas operacionais detalhadas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para transformar sua operação logística?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de operadores que já automatizaram seus processos
          </p>
          <Button 
            size="lg"
            onClick={() => setLocation('/login')}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg rounded-xl font-medium"
          >
            Comece seu teste gratuito
          </Button>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">+500</div>
              <div className="text-gray-600">Operadores Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">97%</div>
              <div className="text-gray-600">Satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">-70%</div>
              <div className="text-gray-600">Tempo Operacional</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">+40%</div>
              <div className="text-gray-600">Eficiência</div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-6">
        <div className="container mx-auto text-center">
          <p className="mb-4">© 2025 CrossWMS. Todos os direitos reservados.</p>
          <p className="text-gray-400">Sistema de gestão logística para operadores brasileiros</p>
        </div>
      </footer>
    </div>
  );
}