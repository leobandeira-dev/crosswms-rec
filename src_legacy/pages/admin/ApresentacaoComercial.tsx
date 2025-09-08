import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Pause, Truck, Clock, Target, Zap, Building, Users, BarChart3, Shield, CheckCircle, ArrowRight, Printer, Eye, Rocket, Mail, Phone } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  content: React.ReactNode;
}

const ApresentacaoComercial: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [clientData, setClientData] = useState({
    cnpj: '',
    razaoSocial: '',
    telefone: '',
    endereco: '',
    cidade: '',
    uf: ''
  });
  const [showClientForm, setShowClientForm] = useState(false);
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  
  // Estados da calculadora dinâmica
  const [selectedModules, setSelectedModules] = useState({
    plataforma: true, // obrigatório
    coletas: true,
    cliente: true,
    fornecedor: false
  });
  const [documentVolume, setDocumentVolume] = useState(2500);
  const [storageGB, setStorageGB] = useState(10); // Armazenamento em GB
  const [extraDocuments, setExtraDocuments] = useState(0); // Documentos excedentes

  // Função para formatar telefone brasileiro
  const formatPhoneBrazilian = (phone: string) => {
    if (!phone) return '';
    
    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');
    
    // Formatação conforme padrão brasileiro
    if (numbers.length === 10) {
      // Telefone fixo: (11) 1234-5678
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else if (numbers.length === 11) {
      // Celular: (11) 91234-5678
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 13 && numbers.startsWith('55')) {
      // Número internacional: +55 (11) 91234-5678
      const withoutCountry = numbers.slice(2);
      return `+55 (${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 7)}-${withoutCountry.slice(7)}`;
    }
    
    return phone; // Retorna original se não conseguir formatar
  };

  // Função para calcular preço dos módulos
  const calculateModulePrice = () => {
    let total = 499; // Plataforma WMS obrigatória
    if (selectedModules.coletas) total += 199;
    if (selectedModules.cliente) total += 199;
    if (selectedModules.fornecedor) total += 199;
    return total;
  };

  // Função para obter plano recomendado
  const getRecommendedPlan = () => {
    if (documentVolume <= 1000) return { name: 'Inicial', price: 450, description: 'Até 1.000 documentos/mês' };
    if (documentVolume <= 2500) return { name: 'Crescimento', price: 950, description: 'Até 2.500 documentos/mês' };
    if (documentVolume <= 5000) return { name: 'Consolidado', price: 1450, description: 'Até 5.000 documentos/mês' };
    if (documentVolume <= 10000) return { name: 'Expansão', price: 1950, description: 'Até 10.000 documentos/mês' };
    return { name: 'Enterprise', price: 2500, description: 'Acima de 10.000 documentos/mês' };
  };

  // Função para calcular custos adicionais
  const calculateAdditionalCosts = () => {
    let additionalCosts = 0;
    
    // Armazenamento acima de 10GB: US$ 6,00/GB adicional (convertido para R$ 36,00 considerando USD=6.00)
    if (storageGB > 10) {
      additionalCosts += (storageGB - 10) * 36;
    }
    
    // Documentos excedentes acima de 10.000: R$ 0,15 por documento
    if (extraDocuments > 0) {
      additionalCosts += extraDocuments * 0.15;
    }
    
    return additionalCosts;
  };

  // Função para calcular total
  const calculateTotal = () => {
    return calculateModulePrice() + getRecommendedPlan().price + calculateAdditionalCosts();
  };

  // Função para gerar PDF
  const generatePDF = () => {
    window.print();
  };

  const slides: Slide[] = [
    // Slide 1: Capa Principal
    {
      id: 1,
      title: 'Capa',
      content: (
        <div className="print-slide-content bg-gradient-to-br from-blue-600 to-blue-800 text-white flex flex-col justify-center items-center">
          <div className="text-center space-y-10">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Truck className="w-16 h-16 text-blue-600" />
            </div>
            <div>
              <h1 className="text-8xl font-black mb-6">CrossWMS</h1>
              <p className="text-3xl font-medium text-blue-100">Plataforma Logística Integrada de Alta Performance</p>
            </div>
            <div className="grid grid-cols-3 gap-12 mt-16 w-full max-w-4xl">
              <div className="text-center bg-white/10 p-8 rounded-xl shadow-lg backdrop-blur-sm">
                <div className="text-6xl font-black mb-3">100%</div>
                <div className="text-xl font-medium text-blue-200">Cloud Native</div>
              </div>
              <div className="text-center bg-white/10 p-8 rounded-xl shadow-lg backdrop-blur-sm">
                <div className="text-6xl font-black mb-3">6</div>
                <div className="text-xl font-medium text-blue-200">Módulos Integrados</div>
              </div>
              <div className="text-center bg-white/10 p-8 rounded-xl shadow-lg backdrop-blur-sm">
                <div className="text-6xl font-black mb-3">24h</div>
                <div className="text-xl font-medium text-blue-200">Deploy Rápido</div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 2: Desafios do Mercado
    {
      id: 2,
      title: 'Desafios',
      content: (
        <div className="print-slide-content bg-gradient-to-br from-gray-50 to-red-50">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-gray-900 mb-4">Principais Desafios do Setor</h1>
            <p className="text-2xl text-gray-700 font-medium">Problemas enfrentados diariamente por operadores logísticos</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <Card className="p-8 bg-white shadow-xl rounded-xl border-l-4 border-red-500">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mr-6 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Telefone Não Para</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">Clientes ligando constantemente para rastrear cargas e solicitar informações sobre entregas</p>
            </Card>
            <Card className="p-8 bg-white shadow-xl rounded-xl border-l-4 border-orange-500">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-6 shadow-lg">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Mar de Planilhas</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">Controle manual em Excel sem integração entre setores e departamentos</p>
            </Card>
            <Card className="p-8 bg-white shadow-xl rounded-xl border-l-4 border-yellow-500">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mr-6 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Perdendo Clientes</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">Concorrência oferece tecnologia e portais que você ainda não tem disponível</p>
            </Card>
            <Card className="p-8 bg-white shadow-xl rounded-xl border-l-4 border-purple-500">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-6 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Estresse Operacional</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">Equipe sobrecarregada com processos manuais e retrabalho constante</p>
            </Card>
          </div>
        </div>
      )
    },

    // Slide 3: Solução CrossWMS
    {
      id: 3,
      title: 'Solução',
      content: (
        <div className="print-slide-content bg-gradient-to-br from-gray-50 to-green-50">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-black text-gray-900 mb-4">A Solução CrossWMS</h1>
            <p className="text-2xl text-gray-700 font-medium">Transformação digital completa para operadores logísticos</p>
          </div>
          <div className="grid grid-cols-2 gap-10">
            <div className="space-y-6">
              <Card className="p-8 bg-white shadow-xl rounded-xl border-l-4 border-green-500">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Automação Total</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">Portal do cliente elimina 70% das ligações de rastreamento automatizando consultas</p>
              </Card>
              <Card className="p-8 bg-white shadow-xl rounded-xl border-l-4 border-blue-500">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Integração Completa</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">Todos os módulos conectados em tempo real com sincronização automática</p>
              </Card>
              <Card className="p-8 bg-white shadow-xl rounded-xl border-l-4 border-purple-500">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Vantagem Competitiva</h3>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed">Ofereça tecnologia de ponta aos seus clientes e se destaque no mercado</p>
              </Card>
            </div>
            <div className="bg-white rounded-xl shadow-xl p-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Resultados Comprovados</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-xl font-medium text-gray-700">Redução de Ligações</span>
                  <span className="text-3xl font-black text-green-600">-70%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-xl font-medium text-gray-700">Satisfação do Cliente</span>
                  <span className="text-3xl font-black text-blue-600">+85%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="text-xl font-medium text-gray-700">Tempo de Processamento</span>
                  <span className="text-3xl font-black text-purple-600">-60%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <span className="text-xl font-medium text-gray-700">Eficiência Operacional</span>
                  <span className="text-3xl font-black text-orange-600">+40%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // Slide 4: Módulos do Sistema
    {
      id: 4,
      title: 'Módulos',
      content: (
        <div className="print-slide-content bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black text-gray-900 mb-4">Módulos do Sistema</h1>
            <p className="text-2xl text-gray-700 font-medium">Plataforma completa e integrada</p>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6 bg-white shadow-xl rounded-xl border-l-4 border-blue-500">
              <div className="flex items-center mb-5">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Plataforma WMS</h3>
              </div>
              <ul className="text-base text-gray-700 space-y-2 leading-relaxed">
                <li>• Dashboard operacional em tempo real</li>
                <li>• Conferência automática de mercadorias</li>
                <li>• Endereçamento otimizado no armazém</li>
                <li>• Checklist de qualidade operacional</li>
                <li>• Ordem de Carga com planejamento</li>
                <li>• Layout Caminhão otimizado</li>
              </ul>
            </Card>

            <Card className="p-6 bg-white shadow-xl rounded-xl border-l-4 border-green-500">
              <div className="flex items-center mb-5">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Módulo Coletas</h3>
              </div>
              <ul className="text-base text-gray-700 space-y-2 leading-relaxed">
                <li>• Solicitações automatizadas de coleta</li>
                <li>• Aprovações com workflow de validação</li>
                <li>• Alocação de Veículos otimizada</li>
                <li>• Execução GPS com rastreamento</li>
                <li>• Status tempo real para clientes</li>
                <li>• Programação inteligente</li>
              </ul>
            </Card>

            <Card className="p-6 bg-white shadow-xl rounded-xl border-l-4 border-purple-500">
              <div className="flex items-center mb-5">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Portal do Cliente</h3>
              </div>
              <ul className="text-base text-gray-700 space-y-2 leading-relaxed">
                <li>• Dashboard personalizado por cliente</li>
                <li>• Solicitação de coletas automática</li>
                <li>• Rastreamento de cargas online</li>
                <li>• Documentos fiscais digitais</li>
                <li>• Sistema de aprovações</li>
                <li>• Relatórios executivos</li>
              </ul>
            </Card>

            <Card className="p-6 bg-white shadow-xl rounded-xl border-l-4 border-orange-500">
              <div className="flex items-center mb-5">
                <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Portal do Fornecedor</h3>
              </div>
              <ul className="text-base text-gray-700 space-y-2 leading-relaxed">
                <li>• Dashboard específico do fornecedor</li>
                <li>• Gestão de solicitações automática</li>
                <li>• Documentação fiscal integrada</li>
                <li>• Comunicação direta integrada</li>
                <li>• Relatórios operacionais</li>
                <li>• Agendamentos programados</li>
              </ul>
            </Card>
          </div>
        </div>
      )
    },

    // Slide 5: Proposta Comercial Interativa
    {
      id: 5,
      title: 'Proposta Comercial',
      content: (
        <div className="print-slide-content bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
          <div className="text-center mb-3">
            <h1 className="text-3xl font-black text-gray-900 mb-1">Proposta Comercial Interativa</h1>
            <p className="text-base text-gray-700">Configure sua solução personalizada</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Seleção de Módulos */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Selecione os Módulos</h3>
              <div className="space-y-1">
                {/* Plataforma WMS - Obrigatório */}
                <Card className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input type="checkbox" checked={true} disabled className="mr-2" />
                      <div>
                        <h4 className="font-bold text-sm">Plataforma WMS</h4>
                        <p className="text-xs opacity-90">Obrigatório - Base do sistema</p>
                      </div>
                    </div>
                    <div className="text-base font-bold">R$ 499</div>
                  </div>
                </Card>
                
                {/* Módulo de Coletas */}
                <Card className={`p-2 ${selectedModules.coletas ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedModules.coletas}
                        onChange={(e) => setSelectedModules(prev => ({ ...prev, coletas: e.target.checked }))}
                        className="mr-2" 
                      />
                      <div>
                        <h4 className="font-bold text-sm">Módulo de Coletas</h4>
                        <p className="text-xs opacity-90">Opcional - Gestão completa de coletas</p>
                      </div>
                    </div>
                    <div className="text-base font-bold">R$ 199</div>
                  </div>
                </Card>
                
                {/* Portal do Cliente */}
                <Card className={`p-2 ${selectedModules.cliente ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedModules.cliente}
                        onChange={(e) => setSelectedModules(prev => ({ ...prev, cliente: e.target.checked }))}
                        className="mr-2" 
                      />
                      <div>
                        <h4 className="font-bold text-sm">Portal do Cliente</h4>
                        <p className="text-xs opacity-90">Opcional - Acesso para clientes</p>
                      </div>
                    </div>
                    <div className="text-base font-bold">R$ 199</div>
                  </div>
                </Card>
                
                {/* Portal do Fornecedor */}
                <Card className={`p-2 ${selectedModules.fornecedor ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedModules.fornecedor}
                        onChange={(e) => setSelectedModules(prev => ({ ...prev, fornecedor: e.target.checked }))}
                        className="mr-2" 
                      />
                      <div>
                        <h4 className="font-bold text-sm">Portal do Fornecedor</h4>
                        <p className="text-xs opacity-90">Opcional - Acesso para fornecedores</p>
                      </div>
                    </div>
                    <div className="text-base font-bold">R$ 199</div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Planos de Processamento */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Plano de Processamento</h3>
              
              <div className="bg-white p-2 rounded-lg border-2 border-gray-200 mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume mensal de documentos
                </label>
                <input
                  type="number"
                  value={documentVolume}
                  onChange={(e) => setDocumentVolume(Number(e.target.value))}
                  className="w-full p-2 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-base font-bold text-center"
                  min="1000"
                  step="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ajuste o volume para ver o plano recomendado
                </p>
              </div>

              <Card className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white mb-2">
                <div className="text-center">
                  <h4 className="font-bold text-base">{getRecommendedPlan().name}</h4>
                  <p className="text-xs opacity-90">{getRecommendedPlan().description}</p>
                  <div className="text-lg font-bold mt-1">R$ {getRecommendedPlan().price}/mês</div>
                  <Badge className="bg-white text-emerald-600 mt-1 text-xs">Recomendado</Badge>
                </div>
              </Card>

              <div className="bg-white p-2 rounded-lg border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1 text-xs">Outros planos:</h4>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Inicial (até 1.000):</span>
                    <span className="font-medium">R$ 450/mês</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crescimento (até 2.500):</span>
                    <span className="font-medium">R$ 950/mês</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consolidado (até 5.000):</span>
                    <span className="font-medium">R$ 1.450/mês</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expansão (até 10.000):</span>
                    <span className="font-medium">R$ 1.950/mês</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enterprise (10.000+):</span>
                    <span className="font-medium">R$ 2.500/mês</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custos Adicionais */}
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Custos Adicionais (Opcionais)</h3>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Armazenamento */}
                <div className="bg-white p-2 rounded border">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Armazenamento (GB)
                  </label>
                  <input
                    type="number"
                    value={storageGB}
                    onChange={(e) => setStorageGB(Number(e.target.value))}
                    className="w-full p-1 border rounded text-sm"
                    min="10"
                    step="1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    10GB grátis. US$ 6,00/GB extra
                  </p>
                </div>

                {/* Documentos Excedentes */}
                <div className="bg-white p-2 rounded border">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Docs Excedentes
                  </label>
                  <input
                    type="number"
                    value={extraDocuments}
                    onChange={(e) => setExtraDocuments(Number(e.target.value))}
                    className="w-full p-1 border rounded text-sm"
                    min="0"
                    step="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    R$ 0,15/doc (após 10.000)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo da Configuração */}
          <div className="mt-2">
            <Card className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <h3 className="text-lg font-bold mb-2 text-center">Configuração Selecionada</h3>
              <div className="grid grid-cols-4 gap-1 mb-2">
                <div className="text-center">
                  <div className="bg-blue-500 p-1 rounded text-xs">
                    <div className="font-bold">Plataforma WMS</div>
                    <div className="text-sm font-bold">R$ 499</div>
                  </div>
                </div>
                {selectedModules.coletas && (
                  <div className="text-center">
                    <div className="bg-green-500 p-1 rounded text-xs">
                      <div className="font-bold">Coletas</div>
                      <div className="text-sm font-bold">R$ 199</div>
                    </div>
                  </div>
                )}
                {selectedModules.cliente && (
                  <div className="text-center">
                    <div className="bg-purple-500 p-1 rounded text-xs">
                      <div className="font-bold">Portal Cliente</div>
                      <div className="text-sm font-bold">R$ 199</div>
                    </div>
                  </div>
                )}
                {selectedModules.fornecedor && (
                  <div className="text-center">
                    <div className="bg-orange-500 p-1 rounded text-xs">
                      <div className="font-bold">Portal Fornecedor</div>
                      <div className="text-sm font-bold">R$ 199</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center p-2 bg-white/20 rounded-lg">
                <div className="text-lg font-bold">Total: R$ {calculateTotal().toFixed(2)}/mês</div>
                <div className="text-xs opacity-90 space-y-0.5">
                  <div>Módulos: R$ {calculateModulePrice().toFixed(2)}</div>
                  <div>Processamento: R$ {getRecommendedPlan().price.toFixed(2)}</div>
                  {calculateAdditionalCosts() > 0 && (
                    <div>Custos Adicionais: R$ {calculateAdditionalCosts().toFixed(2)}</div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )
    },

    // Slide 6: Próximos Passos - Implementação
    {
      id: 6,
      title: 'Próximos Passos',
      content: (
        <div className="print-slide-content bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-black text-gray-900 mb-2">Próximos Passos</h1>
            <p className="text-xl text-gray-700">Seu caminho para a transformação digital</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Timeline de Implementação */}
            <div className="space-y-3">
              {/* Etapa 1 */}
              <Card className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 text-lg shadow-md">1</div>
                  <div>
                    <h3 className="font-bold text-lg">Análise (7 dias)</h3>
                    <p className="text-sm opacity-90 mt-1">
                      Mapeamento dos processos atuais e definição de requisitos específicos
                    </p>
                  </div>
                </div>
              </Card>

              {/* Etapa 2 */}
              <Card className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-green-600 text-lg shadow-md">2</div>
                  <div>
                    <h3 className="font-bold text-lg">Configuração (14 dias)</h3>
                    <p className="text-sm opacity-90 mt-1">
                      Setup completo da plataforma com integração de sistemas existentes
                    </p>
                  </div>
                </div>
              </Card>

              {/* Etapa 3 */}
              <Card className="p-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-purple-600 text-lg shadow-md">3</div>
                  <div>
                    <h3 className="font-bold text-lg">Treinamento (7 dias)</h3>
                    <p className="text-sm opacity-90 mt-1">
                      Capacitação da equipe e suporte especializado durante a transição
                    </p>
                  </div>
                </div>
              </Card>

              {/* Etapa 4 */}
              <Card className="p-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-orange-600 text-lg shadow-md">4</div>
                  <div>
                    <h3 className="font-bold text-lg">Go-Live (Contínuo)</h3>
                    <p className="text-sm opacity-90 mt-1">
                      Acompanhamento especializado e otimizações contínuas do sistema
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="flex flex-col justify-center">
              <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center rounded-xl shadow-xl">
                <div className="mb-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Zap className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Comece Agora</h3>
                  <p className="text-lg opacity-90 mb-4">
                    Seja o próximo caso de sucesso do CrossWMS
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-blue-500 p-3 rounded-lg shadow-md">
                    <p className="font-bold text-sm mb-1">Contato Comercial:</p>
                    <div className="flex items-center justify-center">
                      <Building className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">comercial@laflogistica.com.br</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500 p-3 rounded-lg shadow-md">
                    <div className="flex items-center justify-center">
                      <Users className="w-4 h-4 mr-2" />
                      <span className="text-sm font-bold">(11) 96171-9449</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm text-blue-100">
                    <p>Transforme sua operação logística hoje mesmo!</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Rodapé com benefícios */}
          <div className="mt-6 grid grid-cols-4 gap-4">
            <Card className="p-4 bg-white border-2 border-blue-200 text-center rounded-lg shadow-md">
              <div className="font-bold text-2xl text-blue-600">28 dias</div>
              <div className="text-sm text-gray-600 font-medium">Implementação Completa</div>
            </Card>
            <Card className="p-4 bg-white border-2 border-green-200 text-center rounded-lg shadow-md">
              <div className="font-bold text-2xl text-green-600">24/7</div>
              <div className="text-sm text-gray-600 font-medium">Suporte Técnico</div>
            </Card>
            <Card className="p-4 bg-white border-2 border-purple-200 text-center rounded-lg shadow-md">
              <div className="font-bold text-2xl text-purple-600">100%</div>
              <div className="text-sm text-gray-600 font-medium">Cloud Native</div>
            </Card>
            <Card className="p-4 bg-white border-2 border-orange-200 text-center rounded-lg shadow-md">
              <div className="font-bold text-2xl text-orange-600">ROI</div>
              <div className="text-sm text-gray-600 font-medium">Garantido</div>
            </Card>
          </div>
        </div>
      )
    }
  ];

  // Client data handling
  const handleCnpjLookup = async (cnpj: string) => {
    if (cnpj.length !== 14) return;
    
    setIsLoadingCnpj(true);
    try {
      const response = await fetch(`/api/lookup-cnpj/${cnpj}`);
      const data = await response.json();
      
      if (data.success) {
        console.log('Dados CNPJ recebidos:', data);
        setClientData(prev => ({
          ...prev,
          cnpj,
          razaoSocial: data.data.razaoSocial || '',
          telefone: data.data.telefone?.replace(' undefined', '') || '',
          endereco: data.data.endereco || '',
          cidade: data.data.cidade || '',
          uf: data.data.uf || ''
        }));
        console.log('Dados preenchidos com sucesso:', {
          razaoSocial: data.data.razaoSocial,
          telefone: data.data.telefone?.replace(' undefined', ''),
          cidade: data.data.cidade,
          uf: data.data.uf
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
    } finally {
      setIsLoadingCnpj(false);
    }
  };

  const ClientFormSlide = () => {
    if (!showClientForm || !clientData.cnpj) return null;
    
    const today = new Date();
    const validUntil = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);
    
    return (
      <div className="print-slide-content bg-gradient-to-br from-white to-blue-50">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Proposta Comercial Personalizada</h1>
          <p className="text-xl text-gray-700">Transformação Digital para {clientData.razaoSocial}</p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <Card className="p-6 bg-white shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Dados da Empresa</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">CNPJ:</span>
                <span className="text-gray-900">{clientData.cnpj}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Razão Social:</span>
                <span className="text-gray-900">{clientData.razaoSocial}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Telefone:</span>
                <span className="text-gray-900">{formatPhoneBrazilian(clientData.telefone)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Cidade/UF:</span>
                <span className="text-gray-900">{clientData.cidade}/{clientData.uf}</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <h3 className="text-2xl font-bold mb-4">Detalhes da Proposta</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Data da Proposta:</span>
                <span className="font-bold">{today.toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Válida até:</span>
                <span className="font-bold">{validUntil.toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Investimento Total:</span>
                <span className="text-2xl font-bold">R$ {calculateTotal()}/mês</span>
              </div>
              <div className="text-sm opacity-90 mt-4">
                <p>✓ Implementação incluída</p>
                <p>✓ Treinamento da equipe</p>
                <p>✓ Suporte técnico 24/7</p>
                <p>✓ Atualizações automáticas</p>
              </div>
            </div>
          </Card>
        </div>
        <div className="mt-8 text-center">
          <Card className="p-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <h3 className="text-2xl font-bold mb-4">Próximo Passo</h3>
            <p className="text-lg mb-4">Agende uma demonstração personalizada e veja o CrossWMS em funcionamento</p>
            <div className="space-y-2">
              <p className="font-bold">comercial@laflogistica.com.br</p>
              <p className="font-bold">📱 (11) 96171-9449</p>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Auto-play functionality  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlay && !isPrintMode) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % (slides.length + (showClientForm && clientData.cnpj ? 1 : 0)));
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, isPrintMode, slides.length, showClientForm, clientData.cnpj]);

  const totalSlides = slides.length + (showClientForm && clientData.cnpj ? 1 : 0);
  const isClientSlide = showClientForm && clientData.cnpj && currentSlide === slides.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {!isPrintMode && (
        <div className="bg-white shadow-sm p-4 mb-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Apresentação Comercial CrossWMS</h1>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClientForm(!showClientForm)}
              >
                <Building className="w-4 h-4 mr-2" />
                {showClientForm ? 'Ocultar' : 'Dados Cliente'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
              >
                {isAutoPlay ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isAutoPlay ? 'Pausar' : 'Auto'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPrintMode(!isPrintMode)}
              >
                {isPrintMode ? <Eye className="w-4 h-4 mr-2" /> : <Printer className="w-4 h-4 mr-2" />}
                {isPrintMode ? 'Visualizar' : 'Imprimir'}
              </Button>
            </div>
          </div>
          
          {showClientForm && (
            <div className="max-w-6xl mx-auto mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Dados do Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={clientData.cnpj}
                    onChange={(e) => {
                      const cnpj = e.target.value.replace(/\D/g, '');
                      setClientData(prev => ({ ...prev, cnpj }));
                      if (cnpj.length === 14) {
                        handleCnpjLookup(cnpj);
                      }
                    }}
                    placeholder="Digite o CNPJ"
                    className="w-full p-2 border rounded-lg"
                    maxLength={14}
                  />
                  {isLoadingCnpj && <p className="text-xs text-blue-600 mt-1">Buscando dados...</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
                  <input
                    type="text"
                    value={clientData.razaoSocial}
                    onChange={(e) => setClientData(prev => ({ ...prev, razaoSocial: e.target.value }))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={clientData.telefone}
                    onChange={(e) => setClientData(prev => ({ ...prev, telefone: e.target.value }))}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className={`max-w-6xl mx-auto ${isPrintMode ? '' : 'px-4'}`}>
        {isPrintMode ? (
          <div className="print-mode">
            {/* Botão PDF visível apenas na tela, não na impressão */}
            <div className="fixed top-4 right-4 z-50 print:hidden">
              <Button
                onClick={generatePDF}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                size="lg"
              >
                <Printer className="w-5 h-5 mr-2" />
                Gerar PDF
              </Button>
            </div>
            
            {showClientForm && clientData.cnpj && (
              <div className="print-slide-page">
                <ClientFormSlide />
              </div>
            )}
            {slides.map((slide) => (
              <div key={slide.id} className="print-slide-page">
                {slide.content}
              </div>
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-lg">
            <CardContent className="p-8">
              {isClientSlide ? <ClientFormSlide /> : slides[currentSlide]?.content}
            </CardContent>
            
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}
                  disabled={totalSlides <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm font-medium text-gray-600">
                  {currentSlide + 1} / {totalSlides}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)}
                  disabled={totalSlides <= 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-sm text-gray-600">
                {isClientSlide ? 'Proposta Personalizada' : slides[currentSlide]?.title}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApresentacaoComercial;