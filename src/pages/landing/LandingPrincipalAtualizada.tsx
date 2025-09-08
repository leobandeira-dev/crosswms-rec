import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Package, Users, Truck, BarChart3, Shield, Star, ArrowRight, Menu, X, Cloud, FileText } from 'lucide-react';
import { useLocation } from 'wouter';

const LandingPrincipalAtualizada: React.FC = () => {
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

  const processingPlans = [
    { name: 'Inicial', price: 450, documents: 1000, description: 'Ideal para operações iniciantes' },
    { name: 'Crescimento', price: 950, documents: 2500, description: 'Para operações em crescimento' },
    { name: 'Consolidado', price: 1450, documents: 5000, description: 'Para operações consolidadas' },
    { name: 'Expansão', price: 1950, documents: 10000, description: 'Para operações de grande escala' },
    { name: 'Enterprise', price: 2500, documents: 15000, description: 'Solução enterprise completa' }
  ];

  const getRecommendedPlan = () => {
    if (calculatorData.volumesMes <= 1000) return processingPlans[0];
    if (calculatorData.volumesMes <= 2500) return processingPlans[1];
    if (calculatorData.volumesMes <= 5000) return processingPlans[2];
    if (calculatorData.volumesMes <= 10000) return processingPlans[3];
    return processingPlans[4];
  };

  const calculateTotal = () => {
    let moduleTotal = modulesConfig.plataformaWMS.price;
    if (selectedModules.moduloColetas) moduleTotal += modulesConfig.moduloColetas.price;
    if (selectedModules.portalCliente) moduleTotal += modulesConfig.portalCliente.price;
    if (selectedModules.portalFornecedor) moduleTotal += modulesConfig.portalFornecedor.price;
    
    const recommendedPlan = getRecommendedPlan();
    return moduleTotal + recommendedPlan.price;
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">CrossWMS</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <button onClick={() => scrollToSection('visao-geral')} className="text-gray-600 hover:text-blue-600 transition-colors">
                Visão Geral
              </button>
              <button onClick={() => scrollToSection('modulos')} className="text-gray-600 hover:text-blue-600 transition-colors">
                Módulos
              </button>
              <button onClick={() => scrollToSection('precos')} className="text-gray-600 hover:text-blue-600 transition-colors">
                Preços
              </button>
              <button onClick={() => scrollToSection('calculadora')} className="text-gray-600 hover:text-blue-600 transition-colors">
                Calculadora
              </button>
              <button onClick={() => scrollToSection('funcionalidades')} className="text-gray-600 hover:text-blue-600 transition-colors">
                Funcionalidades
              </button>
              <Button onClick={() => setLocation('/login')} variant="outline">
                Entrar
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4 mt-4">
                <button onClick={() => scrollToSection('visao-geral')} className="text-left text-gray-600 hover:text-blue-600 transition-colors">
                  Visão Geral
                </button>
                <button onClick={() => scrollToSection('modulos')} className="text-left text-gray-600 hover:text-blue-600 transition-colors">
                  Módulos
                </button>
                <button onClick={() => scrollToSection('precos')} className="text-left text-gray-600 hover:text-blue-600 transition-colors">
                  Preços
                </button>
                <button onClick={() => scrollToSection('calculadora')} className="text-left text-gray-600 hover:text-blue-600 transition-colors">
                  Calculadora
                </button>
                <button onClick={() => scrollToSection('funcionalidades')} className="text-left text-gray-600 hover:text-blue-600 transition-colors">
                  Funcionalidades
                </button>
                <Button onClick={() => setLocation('/login')} variant="outline" className="mt-4">
                  Entrar
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="container mx-auto px-6 py-12">
          <Tabs defaultValue="visao-geral" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="visao-geral" onClick={() => scrollToSection('visao-geral')}>Visão Geral</TabsTrigger>
              <TabsTrigger value="modulos" onClick={() => scrollToSection('modulos')}>Módulos</TabsTrigger>
              <TabsTrigger value="precos" onClick={() => scrollToSection('precos')}>Preços</TabsTrigger>
              <TabsTrigger value="calculadora" onClick={() => scrollToSection('calculadora')}>Calculadora</TabsTrigger>
              <TabsTrigger value="funcionalidades" onClick={() => scrollToSection('funcionalidades')}>Funcionalidades</TabsTrigger>
            </TabsList>

            {/* Hero/Visão Geral */}
            <TabsContent value="visao-geral" id="visao-geral">
              <section className="text-center py-20">
                <h1 className="text-7xl font-black text-gray-900 mb-6 leading-tight">
                  Pare de Perder Clientes<br />
                  <span className="text-blue-600">por Falta de Tecnologia</span>
                </h1>
                <p className="text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                  Enquanto seus concorrentes oferecem portais modernos e rastreamento em tempo real, 
                  você ainda usa planilhas? <strong>Seus clientes estão migrando para quem oferece mais transparência.</strong>
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                  <Input
                    type="email"
                    placeholder="Seu melhor email comercial"
                    className="max-w-md h-16 text-lg border-2 focus:border-blue-500"
                  />
                  <Button 
                    size="lg" 
                    className="h-16 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Solicitar Demonstração Gratuita
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>

                {/* Benefícios */}
                <div className="grid md:grid-cols-3 gap-8 mt-20">
                  <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">100% Seguro e Confiável</h3>
                    <p className="text-gray-600 text-lg">Infraestrutura enterprise com backup automático e disponibilidade 99.9%</p>
                  </Card>
                  
                  <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Implementação em 24h</h3>
                    <p className="text-gray-600 text-lg">Sistema 100% nuvem. Sem instalação, sem complicação, sem demora</p>
                  </Card>
                  
                  <Card className="p-8 text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Suporte Especializado</h3>
                    <p className="text-gray-600 text-lg">30 dias de implementação com especialista dedicado + suporte contínuo</p>
                  </Card>
                </div>
              </section>
            </TabsContent>

            {/* Módulos */}
            <TabsContent value="modulos" id="modulos">
              <section className="py-24">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-black text-gray-900 mb-6">Módulos do Sistema</h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Escolha os módulos que sua operação precisa. Comece com o básico e expanda conforme cresce.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Plataforma WMS */}
                  <Card className="p-8 border-2 border-blue-200 bg-blue-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl text-gray-900">Plataforma WMS</CardTitle>
                          <Badge className="mt-2 bg-blue-600">Obrigatório</Badge>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">R$ 499</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{modulesConfig.plataformaWMS.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Dashboard operacional completo
                        </div>
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Gestão de volumes e endereçamento
                        </div>
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Checklist e conferência
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Módulo de Coletas */}
                  <Card className="p-8 border-2 border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl text-gray-900">Módulo de Coletas</CardTitle>
                          <Badge variant="outline" className="mt-2">Opcional</Badge>
                        </div>
                        <div className="text-3xl font-bold text-gray-600">R$ 199</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{modulesConfig.moduloColetas.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Solicitações automatizadas
                        </div>
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Rastreamento GPS em tempo real
                        </div>
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Gestão de veículos e motoristas
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Portal do Cliente */}
                  <Card className="p-8 border-2 border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl text-gray-900">Portal do Cliente</CardTitle>
                          <Badge variant="outline" className="mt-2">Opcional</Badge>
                        </div>
                        <div className="text-3xl font-bold text-gray-600">R$ 199</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{modulesConfig.portalCliente.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Dashboard personalizado
                        </div>
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Solicitação de coletas online
                        </div>
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Rastreamento de cargas
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Portal do Fornecedor */}
                  <Card className="p-8 border-2 border-gray-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl text-gray-900">Portal do Fornecedor</CardTitle>
                          <Badge variant="outline" className="mt-2">Opcional</Badge>
                        </div>
                        <div className="text-3xl font-bold text-gray-600">R$ 199</div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-4">{modulesConfig.portalFornecedor.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Gestão de solicitações
                        </div>
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Documentação fiscal
                        </div>
                        <div className="flex items-center text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Comunicação integrada
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>

            {/* Preços */}
            <TabsContent value="precos" id="precos">
              <section className="py-24">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-black text-gray-900 mb-6">Planos de Processamento</h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Escolha o plano ideal baseado no volume de documentos que sua operação processa mensalmente.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {processingPlans.map((plan, index) => (
                    <Card key={index} className={`p-6 text-center ${index === 2 ? 'border-2 border-blue-500 shadow-lg' : 'border border-gray-200'}`}>
                      <CardHeader>
                        <CardTitle className="text-xl text-gray-900">{plan.name}</CardTitle>
                        {index === 2 && <Badge className="mx-auto bg-blue-600">Mais Popular</Badge>}
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-gray-900 mb-2">R$ {plan.price}</div>
                        <p className="text-gray-600 text-sm mb-4">Até {plan.documents.toLocaleString()} docs/mês</p>
                        <p className="text-gray-500 text-xs">{plan.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-12 p-8 bg-gray-50 rounded-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Como Funciona o CrossWMS</h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">💳 Assinatura do Software</h4>
                      <p className="text-gray-700">Pague apenas pelos módulos que usar. Plataforma WMS é obrigatória (R$ 499/mês), demais módulos são opcionais (R$ 199/mês cada).</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">📊 Plano de Processamento</h4>
                      <p className="text-gray-700">Baseado no volume de documentos processados mensalmente. Comece pequeno e escale conforme cresce.</p>
                    </div>
                  </div>
                </div>
              </section>
            </TabsContent>

            {/* Calculadora */}
            <TabsContent value="calculadora" id="calculadora">
              <section className="py-24">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-black text-gray-900 mb-6">Calculadora de Investimento</h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Descubra o investimento exato para sua operação baseado nos módulos e volume de documentos.
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                  {/* Seleção de Módulos */}
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Selecione os Módulos</h3>
                    
                    {/* Plataforma WMS - Obrigatória */}
                    <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg mb-4">
                      <div className="flex items-center space-x-4">
                        <Package className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-semibold text-gray-800">Plataforma WMS</div>
                          <div className="text-sm text-gray-600">Armazenagem e carregamento completos</div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-600">R$ 499</div>
                    </div>

                    {/* Módulo de Coletas */}
                    <div className={`flex items-center justify-between p-4 border-2 rounded-lg mb-4 cursor-pointer transition-colors ${selectedModules.moduloColetas ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                         onClick={() => setSelectedModules(prev => ({...prev, moduloColetas: !prev.moduloColetas}))}>
                      <div className="flex items-center space-x-4">
                        <Truck className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-semibold text-gray-800">Módulo de Coletas</div>
                          <div className="text-sm text-gray-600">Gestão completa de coletas</div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-600">R$ 199</div>
                    </div>

                    {/* Portal do Cliente */}
                    <div className={`flex items-center justify-between p-4 border-2 rounded-lg mb-4 cursor-pointer transition-colors ${selectedModules.portalCliente ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                         onClick={() => setSelectedModules(prev => ({...prev, portalCliente: !prev.portalCliente}))}>
                      <div className="flex items-center space-x-4">
                        <Users className="w-6 h-6 text-blue-600" />
                        <div>
                          <div className="font-semibold text-gray-800">Portal do Cliente</div>
                          <div className="text-sm text-gray-600">Interface dedicada para clientes</div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-gray-600">R$ 199</div>
                    </div>

                    {/* Portal do Fornecedor */}
                    <div className={`flex items-center justify-between p-4 border-2 rounded-lg mb-4 cursor-pointer transition-colors ${selectedModules.portalFornecedor ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                         onClick={() => setSelectedModules(prev => ({...prev, portalFornecedor: !prev.portalFornecedor}))}>
                      <div className="flex items-center space-x-4">
                        <Package className="w-6 h-6 text-blue-600" />
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
                        Volume de Documentos/Mês
                      </Label>
                      <Input
                        id="volume"
                        type="number"
                        min="1000"
                        value={calculatorData.volumesMes}
                        onChange={(e) => setCalculatorData(prev => ({...prev, volumesMes: parseInt(e.target.value) || 1000}))}
                        className="h-16 text-xl text-center bg-white/80 backdrop-blur-sm border-2 border-blue-300 focus:border-blue-500"
                      />
                      
                      {/* Plano Recomendado */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-lg">{getRecommendedPlan().name}</div>
                            <div className="text-sm opacity-90">{getRecommendedPlan().description}</div>
                          </div>
                          <Badge className="bg-white text-green-600 font-bold">
                            Recomendado
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Resumo do Investimento */}
                  <div className="lg:sticky lg:top-8 lg:self-start">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Resumo do Investimento</h3>
                    
                    <Card className="p-6 border-2 border-gray-200">
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

                      <div className="border-t border-gray-200 mt-4 pt-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Plano de Processamento:</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">{getRecommendedPlan().name}</span>
                          <span className="font-semibold">R$ {getRecommendedPlan().price.toLocaleString()},00</span>
                        </div>
                      </div>

                      <div className="border-t-2 border-gray-300 mt-6 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-gray-900">Total Mensal:</span>
                          <span className="text-3xl font-bold text-blue-600">R$ {calculateTotal().toLocaleString()},00</span>
                        </div>
                      </div>

                      <Button className="w-full mt-6 h-12 bg-blue-600 hover:bg-blue-700 text-lg font-semibold">
                        Solicitar Proposta Comercial
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Card>
                  </div>
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
              </section>
            </TabsContent>

            {/* Funcionalidades */}
            <TabsContent value="funcionalidades" id="funcionalidades">
              <section className="py-24">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-black text-gray-900 mb-6">Funcionalidades Avançadas</h2>
                  <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Descubra todas as funcionalidades que tornam o CrossWMS a escolha ideal para sua operação logística.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Armazenagem */}
                  <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Armazenagem</h3>
                    <ul className="text-sm text-gray-700 text-left space-y-1">
                      <li>• Dashboard operacional</li>
                      <li>• Conferência de volumes</li>
                      <li>• Endereçamento dinâmico</li>
                      <li>• Checklist personalizado</li>
                    </ul>
                  </Card>

                  {/* Coletas */}
                  <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-green-100">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Coletas</h3>
                    <ul className="text-sm text-gray-700 text-left space-y-1">
                      <li>• Solicitações online</li>
                      <li>• Rastreamento GPS</li>
                      <li>• Gestão de veículos</li>
                      <li>• Status em tempo real</li>
                    </ul>
                  </Card>

                  {/* Carregamento */}
                  <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Carregamento</h3>
                    <ul className="text-sm text-gray-700 text-left space-y-1">
                      <li>• Ordem de carga otimizada</li>
                      <li>• Layout do caminhão</li>
                      <li>• Conferência fotográfica</li>
                      <li>• Documentação completa</li>
                    </ul>
                  </Card>

                  {/* Analytics */}
                  <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-50 to-orange-100">
                    <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics</h3>
                    <ul className="text-sm text-gray-700 text-left space-y-1">
                      <li>• Dashboard executivo</li>
                      <li>• Relatórios automatizados</li>
                      <li>• KPIs operacionais</li>
                      <li>• Análise de performance</li>
                    </ul>
                  </Card>
                </div>

                {/* Dashboard Preview */}
                <div className="mt-16 p-8 bg-gray-50 rounded-lg">
                  <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Dashboard em Tempo Real</h3>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                      <div className="text-3xl font-bold text-blue-600">1,247</div>
                      <div className="text-sm text-gray-600">Volumes Processados</div>
                      <div className="text-xs text-green-600">+12% vs. mês anterior</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                      <div className="text-3xl font-bold text-green-600">98.5%</div>
                      <div className="text-sm text-gray-600">Taxa de Precisão</div>
                      <div className="text-xs text-green-600">+2.3% vs. mês anterior</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                      <div className="text-3xl font-bold text-purple-600">2.1h</div>
                      <div className="text-sm text-gray-600">Tempo Médio</div>
                      <div className="text-xs text-green-600">-15min vs. mês anterior</div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow text-center">
                      <div className="text-3xl font-bold text-orange-600">47</div>
                      <div className="text-sm text-gray-600">Coletas Ativas</div>
                      <div className="text-xs text-blue-600">Em tempo real</div>
                    </div>
                  </div>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </main>

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
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg font-semibold px-8 py-4"
            onClick={() => setLocation('/login')}
          >
            Começar Agora Gratuitamente
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-100 py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">CrossWMS</span>
              </div>
              <p className="text-slate-400 text-sm">
                Plataforma logística integrada para operações de alta performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Produto</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Suporte</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutoriais</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <div className="text-sm">
              © 2025 CrossWMS. Todos os direitos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPrincipalAtualizada;