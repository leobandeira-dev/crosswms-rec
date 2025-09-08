import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";

export default function LandingPrincipal() {
  const [location, setLocation] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSelectProfile = (profileType: string) => {
    setLocation(`/login?type=${profileType}`);
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-slate-100">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0098DA] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-slate-900">CrossWMS</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('solucoes')} className="text-slate-600 hover:text-[#0098DA] transition-colors">
                Soluções
              </button>
              <button onClick={() => scrollToSection('funcionalidades')} className="text-slate-600 hover:text-[#0098DA] transition-colors">
                Funcionalidades
              </button>
              <button onClick={() => scrollToSection('beneficios')} className="text-slate-600 hover:text-[#0098DA] transition-colors">
                Benefícios
              </button>
              <Button 
                onClick={() => setLocation('/login')} 
                className="bg-[#0098DA] hover:bg-[#0078B7] text-white px-6 py-2 rounded-lg"
              >
                Entrar
              </Button>
            </nav>

            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-100">
              <div className="flex flex-col space-y-4">
                <button onClick={() => scrollToSection('solucoes')} className="text-left text-slate-600 hover:text-[#0098DA] transition-colors">
                  Soluções
                </button>
                <button onClick={() => scrollToSection('funcionalidades')} className="text-left text-slate-600 hover:text-[#0098DA] transition-colors">
                  Funcionalidades
                </button>
                <button onClick={() => scrollToSection('beneficios')} className="text-left text-slate-600 hover:text-[#0098DA] transition-colors">
                  Benefícios
                </button>
                <Button 
                  onClick={() => setLocation('/login')} 
                  className="bg-[#0098DA] hover:bg-[#0078B7] text-white w-full"
                >
                  Entrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-10">
              <span className="inline-block bg-[#0098DA] text-white px-6 py-2 rounded-lg text-sm font-medium mb-8">
                Plataforma Empresarial para Logística
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 leading-tight">
              Transformação Digital para <span className="text-[#0098DA]">Operações Logísticas</span>
            </h1>
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-xl md:text-2xl text-slate-700 mb-6 leading-relaxed font-medium">
                Plataforma integrada que moderniza processos operacionais através de automação inteligente e gestão centralizada de dados empresariais.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Solução corporativa completa com portais dedicados para stakeholders, automação de fluxos operacionais e business intelligence integrado. Tecnologia que otimiza performance organizacional e estabelece vantagem competitiva sustentável no setor logístico.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                size="lg" 
                className="bg-[#0098DA] hover:bg-[#007BB8] text-white text-lg px-10 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                onClick={() => setLocation('/login')}
              >
                Iniciar Implementação
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-[#0098DA] text-[#0098DA] hover:bg-[#0098DA] hover:text-white text-lg px-10 py-4 rounded-lg transition-all duration-200 font-medium"
                onClick={() => setLocation('/login')}
              >
                Acessar Sistema
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Principais Desafios - Soluções */}
      <section id="solucoes" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Principais <span className="text-[#0098DA]">Desafios Solucionados</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Problemas críticos que impedem o crescimento de operadores logísticos e como nossa plataforma elimina cada um deles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Desafio 1: Comunicação Manual */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Telefone Não Para de Tocar</h3>
              <p className="text-slate-600 text-center mb-4">
                Clientes ligam constantemente perguntando "onde está minha carga?", "quando vai chegar?", "qual o status?"
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✓ Solução:</h4>
                <p className="text-green-700 text-sm">Portal de autoatendimento 24h com rastreamento em tempo real e notificações automáticas</p>
              </div>
            </div>

            {/* Desafio 2: Planilhas Desorganizadas */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Mar de Planilhas Descontroladas</h3>
              <p className="text-slate-600 text-center mb-4">
                Controle operacional através de dezenas de planilhas, versões conflitantes, erros de digitação, dados perdidos
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✓ Solução:</h4>
                <p className="text-green-700 text-sm">Sistema unificado com importação automática de NFe e gestão digital completa</p>
              </div>
            </div>

            {/* Desafio 3: Perda de Clientes */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Perdendo Clientes para Concorrência</h3>
              <p className="text-slate-600 text-center mb-4">
                Clientes migram para transportadores que oferecem tecnologia, transparência e agilidade nas informações
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✓ Solução:</h4>
                <p className="text-green-700 text-sm">Experiência digital premium que posiciona sua empresa como líder tecnológico</p>
              </div>
            </div>

            {/* Desafio 4: Erros Operacionais */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Erros Custam Tempo e Dinheiro</h3>
              <p className="text-slate-600 text-center mb-4">
                Endereçamento errado, cubagem manual incorreta, mercadorias perdidas, retrabalho constante
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✓ Solução:</h4>
                <p className="text-green-700 text-sm">Automação inteligente com validações, códigos de barras e controle de qualidade</p>
              </div>
            </div>

            {/* Desafio 5: Crescimento Limitado */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Crescimento Travado</h3>
              <p className="text-slate-600 text-center mb-4">
                Impossível crescer sem tecnologia - cada novo cliente significa mais caos operacional e estresse
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✓ Solução:</h4>
                <p className="text-green-700 text-sm">Escalabilidade automática - sistema cresce junto com sua operação</p>
              </div>
            </div>

            {/* Desafio 6: Equipe Sobrecarregada */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Equipe em Burnout Total</h3>
              <p className="text-slate-600 text-center mb-4">
                Time sobrecarregado, estresse constante, alta rotatividade, dificuldade para contratar e reter talentos
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✓ Solução:</h4>
                <p className="text-green-700 text-sm">Automação de tarefas repetitivas liberando equipe para atividades estratégicas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Interfaces Especializadas por <span className="text-[#0098DA]">Perfil Corporativo</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Arquitetura modular com dashboards personalizados e controles de acesso específicos para cada categoria de stakeholder
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => handleSelectProfile('transportador')}>
              <div className="w-16 h-16 bg-[#0098DA] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Operadores Logísticos</h3>
              <p className="text-slate-600 leading-relaxed">
                Gestão centralizada de operações com interfaces dedicadas para stakeholders externos e integração sistêmica completa.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => handleSelectProfile('cliente')}>
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Clientes Corporativos</h3>
              <p className="text-slate-600 leading-relaxed">
                Portal de autoatendimento com visibilidade completa de operações, documentação digital e controle de aprovações.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300 cursor-pointer" onClick={() => handleSelectProfile('fornecedor')}>
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Fornecedores Estratégicos</h3>
              <p className="text-slate-600 leading-relaxed">
                Interface de gestão para solicitações de carregamento e documentação fiscal digital com integração sistemática.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sistema 100% em Nuvem Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-[#0098DA] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Liberação em 24h</h3>
              <p className="text-slate-600 leading-relaxed">
                Sistema configurado e operacional em menos de um dia útil. Comece a usar imediatamente.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-[#0098DA] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Zero Instalação</h3>
              <p className="text-slate-600 leading-relaxed">
                Acesse de qualquer lugar, qualquer dispositivo. Infraestrutura 100% em nuvem sem investimentos.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-[#0098DA] rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Especialista Dedicado</h3>
              <p className="text-slate-600 leading-relaxed">
                Implementação guiada por especialista durante 30 dias. Suporte completo para o sucesso.
              </p>
            </div>
          </div>

          {/* Processo de Implementação Executiva */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Processo de Implementação Executiva
            </h3>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Metodologia comprovada para garantir o sucesso da sua operação
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#0098DA] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Alinhamento Estratégico</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Reunião com especialista para entender suas necessidades
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#0098DA] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Configuração Rápida</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sistema configurado e liberado em 24h após aprovação
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#0098DA] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Avaliação 7 Dias</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Teste completo sem custo com acompanhamento
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#0098DA] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-3">Suporte 30 Dias</h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Acompanhamento especializado até a operação plena
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={() => setLocation('/login')} 
              size="lg"
              className="bg-[#0098DA] hover:bg-[#0078B7] text-white font-bold px-8 py-3 rounded-lg text-base"
            >
              Iniciar Implementação →
            </Button>
          </div>
        </div>
      </section>

      {/* Módulos Completos do Sistema */}
      <section id="funcionalidades" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Arquitetura Modular <span className="text-[#0098DA]">CrossWMS</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Seis módulos especializados integrados que otimizam processos logísticos empresariais através de automação avançada e gestão inteligente de dados operacionais.
            </p>
          </div>

          {/* Grid de Módulos e Funcionalidades */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Módulo 1: Armazenagem Inteligente */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Armazenagem</h3>
              <div className="text-left space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Dashboard operacional</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Conferência automatizada</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Endereçamento inteligente</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Checklist de qualidade</span>
                </div>
              </div>
            </div>

            {/* Módulo 2: Gestão de Coletas */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Coletas</h3>
              <div className="text-left space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Solicitações automatizadas</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Otimização de rotas</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Execução em tempo real</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Relatórios de performance</span>
                </div>
              </div>
            </div>

            {/* Módulo 3: Ordem de Carregamento */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Carregamento</h3>
              <div className="text-left space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Planejamento automático</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Otimização de espaço</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Controle operacional</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Rastreamento total</span>
                </div>
              </div>
            </div>

            {/* Módulo 4: Portal do Cliente */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Portal do Cliente</h3>
              <div className="text-left space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Dashboard de cargas</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Aprovações digitais</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Rastreamento 24h</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-600 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Acesso a documentos</span>
                </div>
              </div>
            </div>

            {/* Módulo 5: Portal do Fornecedor */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Portal do Fornecedor</h3>
              <div className="text-left space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Programação integrada</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Upload de NFes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Comunicação direta</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Relatórios de entrega</span>
                </div>
              </div>
            </div>

            {/* Módulo 6: Gestão Administrativa */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Gestão Administrativa</h3>
              <div className="text-left space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Multi-Tenant completo</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Controle de permissões</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Configurações avançadas</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-red-500 text-sm mt-1">•</span>
                  <span className="text-slate-600 text-sm">Business Intelligence</span>
                </div>
              </div>
            </div>
          </div>

          {/* ROI Section */}
          <div id="beneficios" className="bg-gradient-to-r from-slate-50 to-blue-50 p-12 rounded-2xl mb-16">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-slate-900 mb-4">
                Indicadores de Performance Empresarial
              </h3>
              <p className="text-lg text-slate-600">
                Métricas de otimização operacional baseadas em implementações corporativas realizadas
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#0098DA] mb-2">70%</div>
                <div className="text-slate-600 font-medium">Redução de Consultas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-500 mb-2">85%</div>
                <div className="text-slate-600 font-medium">Melhoria na Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">60%</div>
                <div className="text-slate-600 font-medium">Otimização de Tempo</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-500 mb-2">40%</div>
                <div className="text-slate-600 font-medium">Aumento de Eficiência</div>
              </div>
            </div>
          </div>

          {/* CTA Final */}
          <div className="text-center">
            <h3 className="text-3xl font-bold text-slate-900 mb-6">
              Pare de Competir por Preço. Vença por Tecnologia.
            </h3>
            <p className="text-lg text-slate-600 mb-8 max-w-3xl mx-auto">
              Enquanto seus concorrentes ainda usam planilhas, você já estará oferecendo 
              uma experiência digital premium que seus clientes nunca viram.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-[#0098DA] hover:bg-[#0078B7] text-white text-lg px-12 py-6 rounded-xl"
                onClick={() => setLocation('/login')}
              >
                Começar Implementação
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-[#0098DA] text-[#0098DA] hover:bg-[#0098DA] hover:text-white text-lg px-12 py-6 rounded-xl"
                onClick={() => setLocation('/login')}
              >
                Acessar Sistema
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-[#0098DA] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-2xl font-bold">CrossWMS</span>
            </div>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Sistema completo de gestão logística para transportadoras que querem oferecer 
              experiência digital premium aos seus clientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                onClick={() => setLocation('/login')} 
                size="lg"
                className="bg-[#0098DA] hover:bg-[#0078B7] text-white px-8 py-3 rounded-lg"
              >
                Começar Agora
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3 rounded-lg"
                onClick={() => setLocation('/login')}
              >
                Acessar Sistema
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}