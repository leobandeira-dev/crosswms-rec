import React, { useState } from 'react';
import { 
  Truck, 
  Building2, 
  Package, 
  Eye, 
  EyeOff, 
  FileText,
  Shield,
  BarChart3,
  Globe
} from "lucide-react";

export default function CrossWMSAuthPage() {
  const [selectedUserType, setSelectedUserType] = useState<'transportador' | 'cliente' | 'fornecedor' | ''>('');
  const [showAccessForm, setShowAccessForm] = useState(false);
  
  // Estados do formulário de login
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [erroLogin, setErroLogin] = useState('');

  const handleUserTypeSelect = (type: 'transportador' | 'cliente' | 'fornecedor') => {
    setSelectedUserType(type);
    setShowAccessForm(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErroLogin('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: senha,
          tipo_usuario: selectedUserType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.session.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirecionamento baseado no tipo de usuário
        const redirectUrl = data.user.tipo_usuario === 'super_admin' 
          ? '/admin/dashboard' 
          : data.user.tipo_usuario === 'transportador'
          ? '/dashboard'
          : data.user.tipo_usuario === 'cliente'
          ? '/cliente/dashboard'
          : data.user.tipo_usuario === 'fornecedor'
          ? '/fornecedor/dashboard'
          : '/dashboard';
          
        window.location.href = redirectUrl;
        return;
      } else {
        setErroLogin(data.error || 'Erro ao fazer login');
      }
    } catch (error: any) {
      setErroLogin('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <div className="flex min-h-screen">
        {/* Lado esquerdo - Apresentação */}
        <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90"></div>
          
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            {/* Logo e título */}
            <div className="mb-16">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">CrossWMS</h1>
                  <p className="text-blue-200">Sistema de Gestão Logística</p>
                </div>
              </div>
              
              <h2 className="text-4xl font-bold mb-4">
                Plataforma Completa para Gestão Logística
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Sistema multi-tenant com controle hierárquico de acesso e módulos especializados para cada tipo de usuário.
              </p>
            </div>

            {/* Cards dos tipos de usuário */}
            <div className="grid grid-cols-1 gap-6 mb-12">
              {/* Operadores Logísticos */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Operadores Logísticos</h3>
                </div>
                <p className="text-blue-100">
                  Gestão completa de operações, multi-tenant e análises avançadas.
                </p>
              </div>

              {/* Clientes Corporativos */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Clientes Corporativos</h3>
                </div>
                <p className="text-blue-100">
                  Portal exclusivo para solicitações, rastreamento e documentação.
                </p>
              </div>

              {/* Fornecedores */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Fornecedores</h3>
                </div>
                <p className="text-blue-100">
                  Interface para solicitações de carregamento e gestão documental.
                </p>
              </div>
            </div>

            {/* Por que escolher o CrossWMS */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-blue-200 mr-3" />
                <div>
                  <h4 className="font-semibold">Sistema Seguro</h4>
                  <p className="text-sm text-blue-200">Controle hierárquico de acessos e permissões</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Globe className="w-6 h-6 text-blue-200 mr-3" />
                <div>
                  <h4 className="font-semibold">Integração Completa</h4>
                  <p className="text-sm text-blue-200">APIs oficiais SEFAZ e automação DANFE</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-blue-200 mr-3" />
                <div>
                  <h4 className="font-semibold">Análises Avançadas</h4>
                  <p className="text-sm text-blue-200">Relatórios e insights para tomada de decisão</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Package className="w-6 h-6 text-blue-200 mr-3" />
                <div>
                  <h4 className="font-semibold">Multi-Tenant</h4>
                  <p className="text-sm text-blue-200">Suporte a múltiplas empresas e perfis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Acesso ao Sistema */}
        <div className="w-full lg:w-2/5 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Header do painel */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">CrossWMS</h2>
                <p className="text-blue-100">Sistema de Gestão Logística</p>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  Acesso ao Sistema
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Selecione seu tipo de usuário
                </p>

                {!showAccessForm ? (
                  /* Seleção de tipo de usuário */
                  <div className="space-y-4">
                    <button
                      onClick={() => handleUserTypeSelect('transportador')}
                      className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-blue-200">
                          <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Operador Logístico</h4>
                          <p className="text-sm text-gray-600">Empresas de logística e transporte</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUserTypeSelect('cliente')}
                      className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-green-200">
                          <Building2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Cliente Corporativo</h4>
                          <p className="text-sm text-gray-600">Empresas que contratam serviços</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleUserTypeSelect('fornecedor')}
                      className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-orange-200">
                          <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Fornecedor Estratégico</h4>
                          <p className="text-sm text-gray-600">Fornecedores vinculados aos clientes</p>
                        </div>
                      </div>
                    </button>
                  </div>
                ) : (
                  /* Formulário de login */
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        Acesso como: {selectedUserType === 'transportador' ? 'Operador Logístico' : 
                                     selectedUserType === 'cliente' ? 'Cliente Corporativo' : 'Fornecedor Estratégico'}
                      </p>
                    </div>

                    {erroLogin && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{erroLogin}</p>
                      </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Senha
                        </label>
                        <div className="relative">
                          <input
                            type={mostrarSenha ? "text" : "password"}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                            placeholder="••••••••"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                          >
                            {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
                      </button>
                    </form>

                    <div className="mt-4 text-center">
                      <button
                        onClick={() => {
                          setShowAccessForm(false);
                          setSelectedUserType('');
                          setErroLogin('');
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        ← Voltar à seleção
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}