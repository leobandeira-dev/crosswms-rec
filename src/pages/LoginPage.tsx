import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Truck, 
  Building2, 
  Package, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building,
  FileText,
  Shield,
  ArrowRight,
  Zap,
  BarChart3,
  Globe
} from "lucide-react";

interface CadastroForm {
  nome: string;
  razao_social: string;
  email: string;
  senha: string;
  telefone: string;
  cnpj: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  operador_logistico_cnpj: string;
  observacoes: string;
}

interface FeedbackCadastro {
  tipo: 'sucesso' | 'erro' | '';
  titulo: string;
  mensagem: string;
}

interface ResetPasswordForm {
  email: string;
}

interface NewPasswordForm {
  password: string;
  confirmPassword: string;
}

interface EmpresaAPIResponse {
  nome?: string;
  fantasia?: string;
  telefone?: string;
  email?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
}

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, loading, signIn } = useAuth();
  const [selectedUserType, setSelectedUserType] = useState<'transportador' | 'cliente' | 'fornecedor' | ''>('');
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [accessMode, setAccessMode] = useState<'login' | 'cadastro' | 'reset-password' | 'new-password'>('login');

  // Verificar se usuário já está logado e redirecionar (otimizado)
  useEffect(() => {
    if (!loading && user) {
      const redirectUrl = user.tipo_usuario === 'super_admin' 
        ? '/admin/dashboard' 
        : user.tipo_usuario === 'transportador'
        ? '/dashboard'
        : user.tipo_usuario === 'cliente'
        ? '/cliente/dashboard'
        : user.tipo_usuario === 'fornecedor'
        ? '/fornecedor/dashboard'
        : '/dashboard';
      
      setLocation(redirectUrl);
    }
  }, [user, loading, setLocation]);
  
  // Estados do formulário de login
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [erroLogin, setErroLogin] = useState('');
  const [mostrarSugestaoCadastro, setMostrarSugestaoCadastro] = useState(false);

  // Estados do formulário de cadastro
  const [formCadastro, setFormCadastro] = useState<CadastroForm>({
    nome: '',
    razao_social: '',
    email: '',
    senha: '',
    telefone: '',
    cnpj: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    operador_logistico_cnpj: '',
    observacoes: ''
  });

  const [feedbackCadastro, setFeedbackCadastro] = useState<FeedbackCadastro>({
    tipo: '',
    titulo: '',
    mensagem: ''
  });

  const [buscandoCNPJ, setBuscandoCNPJ] = useState(false);

  // Estados para redefinição de senha
  const [resetForm, setResetForm] = useState<ResetPasswordForm>({
    email: ''
  });
  const [newPasswordForm, setNewPasswordForm] = useState<NewPasswordForm>({
    password: '',
    confirmPassword: ''
  });
  const [resetToken, setResetToken] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Limpar mensagens de erro ao trocar de modo
  useEffect(() => {
    setErroLogin('');
    setMostrarSugestaoCadastro(false);
    setFeedbackCadastro({ tipo: '', titulo: '', mensagem: '' });
  }, [accessMode, selectedUserType]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErroLogin('');
    setMostrarSugestaoCadastro(false);

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
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirecionamento imediato e forçado
        const redirectUrl = data.user.tipo_usuario === 'super_admin' 
          ? '/admin/dashboard' 
          : data.user.tipo_usuario === 'transportador'
          ? '/dashboard'
          : data.user.tipo_usuario === 'cliente'
          ? '/cliente/dashboard'
          : data.user.tipo_usuario === 'fornecedor'
          ? '/fornecedor/dashboard'
          : '/dashboard';
          
        // Combinação de métodos para garantir redirecionamento
        setLocation(redirectUrl);
        
        // Timeout como fallback caso setLocation falhe
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 100);
        
        return;
      } else {
        setErroLogin(data.error || 'Erro ao fazer login');
        
        if (data.error === 'Usuário não encontrado') {
          setMostrarSugestaoCadastro(true);
        }
      }
    } catch (error) {
      setErroLogin('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const buscarDadosCNPJ = async (cnpj: string) => {
    if (cnpj.length !== 14) return;
    
    setBuscandoCNPJ(true);
    try {
      const response = await fetch(`/api/lookup-cnpj/${cnpj}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const empresa = data.data;
        setFormCadastro(prev => ({
          ...prev,
          razao_social: empresa.razaoSocial || '',
          telefone: empresa.telefone || '',
          endereco: empresa.endereco || '',
          numero: empresa.numero || '',
          complemento: empresa.complemento || '',
          bairro: empresa.bairro || '',
          cidade: empresa.cidade || '',
          uf: empresa.uf || '',
          cep: empresa.cep || ''
        }));
        
        toast({
          title: "Sucesso",
          description: `Dados preenchidos automaticamente via ${data.source}`,
        });
      } else {
        toast({
          title: "CNPJ não encontrado",
          description: data.message || "Não foi possível consultar o CNPJ",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
      toast({
        title: "Erro na consulta",
        description: "Erro ao consultar CNPJ. Tente novamente",
        variant: "destructive"
      });
    } finally {
      setBuscandoCNPJ(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFeedbackCadastro({ tipo: '', titulo: '', mensagem: '' });

    try {
      // Validações básicas
      if (!formCadastro.nome || !formCadastro.email || !formCadastro.senha || !formCadastro.cnpj) {
        setFeedbackCadastro({
          tipo: 'erro',
          titulo: 'Campos obrigatórios',
          mensagem: 'Preencha todos os campos obrigatórios (nome, email, senha, CNPJ).'
        });
        return;
      }

      const requestBody = {
        nome: formCadastro.nome,
        email: formCadastro.email,
        password: formCadastro.senha, // Corrigido: enviando como 'password' para o backend
        telefone: formCadastro.telefone,
        tipo_usuario: selectedUserType,
        empresa: {
          razao_social: formCadastro.razao_social,
          cnpj: formCadastro.cnpj,
          telefone: formCadastro.telefone,
          endereco: formCadastro.endereco,
          numero: formCadastro.numero,
          complemento: formCadastro.complemento,
          bairro: formCadastro.bairro,
          cidade: formCadastro.cidade,
          uf: formCadastro.uf,
          cep: formCadastro.cep,
          operador_logistico_cnpj: selectedUserType !== 'transportador' ? formCadastro.operador_logistico_cnpj : null
        }
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setFeedbackCadastro({
          tipo: 'sucesso',
          titulo: 'Cadastro realizado com sucesso!',
          mensagem: `Aguarde a aprovação ${selectedUserType === 'transportador' ? 'do administrador do sistema' : 'do operador logístico'} para acessar o sistema.`
        });
        
        // Limpar formulário
        setFormCadastro({
          nome: '',
          razao_social: '',
          email: '',
          senha: '',
          telefone: '',
          cnpj: '',
          endereco: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: '',
          cep: '',
          operador_logistico_cnpj: '',
          observacoes: ''
        });
      } else {
        setFeedbackCadastro({
          tipo: 'erro',
          titulo: 'Erro no cadastro',
          mensagem: data.error || 'Erro ao processar cadastro.'
        });
      }
    } catch (error) {
      setFeedbackCadastro({
        tipo: 'erro',
        titulo: 'Erro de conexão',
        mensagem: 'Erro de conexão. Tente novamente.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para solicitar redefinição de senha
  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setErroLogin('');

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetForm.email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "E-mail enviado",
          description: "Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.",
        });
        setAccessMode('login');
        setResetForm({ email: '' });
      } else {
        setErroLogin(data.error || 'Erro ao solicitar redefinição de senha');
      }
    } catch (error) {
      setErroLogin('Erro de conexão. Tente novamente.');
    } finally {
      setIsResetting(false);
    }
  };

  // Função para redefinir senha com token
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    setErroLogin('');

    if (newPasswordForm.password !== newPasswordForm.confirmPassword) {
      setErroLogin('As senhas não coincidem');
      setIsResetting(false);
      return;
    }

    if (newPasswordForm.password.length < 6) {
      setErroLogin('A senha deve ter pelo menos 6 caracteres');
      setIsResetting(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          newPassword: newPasswordForm.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Senha redefinida",
          description: "Sua senha foi alterada com sucesso. Você pode fazer login agora.",
        });
        setAccessMode('login');
        setNewPasswordForm({ password: '', confirmPassword: '' });
        setResetToken('');
      } else {
        setErroLogin(data.error || 'Erro ao redefinir senha');
      }
    } catch (error) {
      setErroLogin('Erro de conexão. Tente novamente.');
    } finally {
      setIsResetting(false);
    }
  };

  const getUserTypeInfo = (userType: string) => {
    switch (userType) {
      case 'transportador':
        return {
          icon: <Truck className="h-8 w-8 text-blue-600" />,
          title: 'Operador Logístico',
          color: 'border-blue-500',
          bgColor: 'bg-blue-50'
        };
      case 'cliente':
        return {
          icon: <Building2 className="h-8 w-8 text-green-600" />,
          title: 'Cliente',
          color: 'border-green-500',
          bgColor: 'bg-green-50'
        };
      case 'fornecedor':
        return {
          icon: <Package className="h-8 w-8 text-orange-600" />,
          title: 'Fornecedor',
          color: 'border-orange-500',
          bgColor: 'bg-orange-50'
        };
      default:
        return {
          icon: <User className="h-8 w-8 text-gray-600" />,
          title: 'Selecione o tipo de usuário',
          color: 'border-gray-300',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const userTypeInfo = getUserTypeInfo(selectedUserType);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se usuário já está logado, não mostrar tela de login
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="text-center pt-8 pb-6">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg mr-4">
            <Truck className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">CrossWMS</h1>
            <p className="text-gray-600">Sistema de Gestão Logística</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-[80vh] items-center">
          
          {/* Seção Informativa - Lado Esquerdo */}
          <div className="order-2 lg:order-1">
            <div className="text-left mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Plataforma Completa para Gestão Logística</h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Sistema multi-tenant com controle hierárquico de acesso e módulos especializados para cada tipo de usuário.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Operador Logístico */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-blue-200/50 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-4">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Operadores Logísticos</h3>
                <p className="text-gray-600 text-sm">Gestão completa de operações, multi-tenant e análises avançadas.</p>
              </div>

              {/* Clientes Corporativos */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-green-200/50 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Clientes Corporativos</h3>
                <p className="text-gray-600 text-sm">Portal exclusivo para solicitações, rastreamento e documentação.</p>
              </div>

              {/* Fornecedores */}
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-orange-200/50 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Fornecedores</h3>
                <p className="text-gray-600 text-sm">Interface para solicitações de carregamento e gestão documental.</p>
              </div>
            </div>

            {/* Simple Benefits */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-gray-200/50">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">Por que escolher o CrossWMS?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Sistema Seguro</h4>
                    <p className="text-gray-600 text-sm">Controle hierárquico de acesso e aprovações</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Integração Completa</h4>
                    <p className="text-gray-600 text-sm">APIs oficiais SEFAZ e automação NFe</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Análises Avançadas</h4>
                    <p className="text-gray-600 text-sm">Relatórios e insights para tomada de decisão</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Multi-Tenant</h4>
                    <p className="text-gray-600 text-sm">Suporte a múltiplas empresas e perfis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Container de Login - Lado Direito */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="sticky top-8 w-full max-w-md lg:max-w-none mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <Button 
                  variant="ghost" 
                  onClick={() => setLocation('/')}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-blue-800 rounded-lg flex items-center justify-center mr-3 border border-blue-900">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">CrossWMS</h1>
                    <p className="text-sm text-slate-600 font-medium">Sistema de Gestão Logística</p>
                  </div>
                </div>
              </div>

              {!selectedUserType ? (
                /* Seleção de Tipo de Usuário */
                <Card className="bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-2xl">
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl text-gray-800">Acesso ao Sistema</CardTitle>
                    <CardDescription>Selecione seu tipo de usuário</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full p-6 h-auto border-blue-300 hover:border-blue-600 hover:bg-blue-50"
                      onClick={() => setSelectedUserType('transportador')}
                    >
                      <div className="flex items-center space-x-4">
                        <Truck className="h-8 w-8 text-blue-700" />
                        <div className="text-left">
                          <p className="font-semibold text-blue-800">Operador Logístico</p>
                          <p className="text-sm text-slate-600">Empresas de logística e transporte</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full p-6 h-auto border-emerald-300 hover:border-emerald-600 hover:bg-emerald-50"
                      onClick={() => setSelectedUserType('cliente')}
                    >
                      <div className="flex items-center space-x-4">
                        <Building2 className="h-8 w-8 text-emerald-700" />
                        <div className="text-left">
                          <p className="font-semibold text-emerald-800">Cliente Corporativo</p>
                          <p className="text-sm text-slate-600">Empresas que contratam serviços</p>
                        </div>
                      </div>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full p-6 h-auto border-amber-300 hover:border-amber-600 hover:bg-amber-50"
                      onClick={() => setSelectedUserType('fornecedor')}
                    >
                      <div className="flex items-center space-x-4">
                        <Package className="h-8 w-8 text-amber-700" />
                        <div className="text-left">
                          <p className="font-semibold text-amber-800">Fornecedor Estratégico</p>
                          <p className="text-sm text-slate-600">Fornecedores vinculados aos clientes</p>
                        </div>
                      </div>
                    </Button>
                  </CardContent>
                </Card>
              ) : !showAccessForm ? (
                /* Escolha entre Login e Cadastro */
                <Card className={`shadow-xl border-2 ${userTypeInfo.color} ${userTypeInfo.bgColor}`}>
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      {userTypeInfo.icon}
                      <CardTitle className="text-xl">{userTypeInfo.title}</CardTitle>
                    </div>
                    <CardDescription>Como você gostaria de prosseguir?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      className="w-full"
                      onClick={() => {
                        setAccessMode('login');
                        setShowAccessForm(true);
                      }}
                    >
                      Já tenho conta
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setAccessMode('cadastro');
                        setShowAccessForm(true);
                      }}
                    >
                      Primeira vez aqui
                    </Button>

                    <div className="text-center">
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedUserType('')}
                        className="text-sm"
                      >
                        Alterar tipo de usuário
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : accessMode === 'login' ? (
                /* Formulário de Login */
                <Card className={`shadow-xl border-2 ${userTypeInfo.color} ${userTypeInfo.bgColor}`}>
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      {userTypeInfo.icon}
                      <CardTitle className="text-xl">{userTypeInfo.title}</CardTitle>
                    </div>
                    <CardDescription>Entre com suas credenciais</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          E-mail
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10"
                          placeholder="seu@email.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Senha
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={mostrarSenha ? "text" : "password"}
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            className="pl-10 pr-10"
                            placeholder="Digite sua senha"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setMostrarSenha(!mostrarSenha)}
                          >
                            {mostrarSenha ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Redirecionando..." : "Entrar"}
                      </Button>

                      {/* Link para redefinir senha */}
                      <div className="text-center">
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            setAccessMode('reset-password');
                          }}
                        >
                          Esqueci minha senha
                        </Button>
                      </div>

                      {/* Feedback de erro de login destacado */}
                      {erroLogin && (
                        <div className="mt-4 p-6 bg-red-600 border-2 border-red-700 rounded-lg shadow-lg animate-pulse">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-red-800 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-white mb-2">
                                {erroLogin}
                              </h4>
                              {erroLogin.includes("pendente de aprovação") && (
                                <p className="text-base text-red-100 font-medium">
                                  {selectedUserType === 'transportador' && 
                                    "Entre em contato com o suporte técnico para acelerar o processo."}
                                  {selectedUserType === 'cliente' && 
                                    "Entre em contato com o operador logístico responsável."}
                                  {selectedUserType === 'fornecedor' && 
                                    "Entre em contato com o cliente ou operador logístico responsável."}
                                  {!selectedUserType && 
                                    "Entre em contato com o administrador do sistema."}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sugestão de cadastro quando usuário não encontrado */}
                      {mostrarSugestaoCadastro && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-blue-800 mb-1">Usuário não encontrado</h4>
                              <p className="text-sm text-blue-700 mb-2">
                                Não encontramos uma conta com este e-mail. Gostaria de se cadastrar?
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setAccessMode('cadastro');
                                  setMostrarSugestaoCadastro(false);
                                  setErroLogin('');
                                }}
                                className="text-blue-700 border-blue-300 hover:bg-blue-100"
                              >
                                Fazer cadastro
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </form>

                    {/* Change Access Mode */}
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowAccessForm(false)}
                        className="w-full text-sm"
                      >
                        Voltar às opções
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : accessMode === 'reset-password' ? (
                /* Formulário de Redefinição de Senha */
                <Card className="shadow-xl border-2 border-orange-200 bg-orange-50">
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <Lock className="h-8 w-8 text-orange-600" />
                      <CardTitle className="text-xl">Redefinir Senha</CardTitle>
                    </div>
                    <CardDescription>Digite seu e-mail para receber instruções</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset_email" className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          E-mail
                        </Label>
                        <Input
                          id="reset_email"
                          type="email"
                          value={resetForm.email}
                          onChange={(e) => setResetForm(prev => ({ ...prev, email: e.target.value }))}
                          required
                          className="pl-10"
                          placeholder="seu@email.com"
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isResetting}>
                        {isResetting ? "Enviando..." : "Enviar Instruções"}
                      </Button>

                      {/* Feedback de erro */}
                      {erroLogin && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-red-800 text-sm">{erroLogin}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-center pt-4 border-t">
                        <Button
                          type="button"
                          variant="link"
                          className="text-sm"
                          onClick={() => {
                            setAccessMode('login');
                            setErroLogin('');
                            setResetForm({ email: '' });
                          }}
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Voltar ao login
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              ) : accessMode === 'new-password' ? (
                /* Formulário de Nova Senha */
                <Card className="shadow-xl border-2 border-green-200 bg-green-50">
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      <Shield className="h-8 w-8 text-green-600" />
                      <CardTitle className="text-xl">Nova Senha</CardTitle>
                    </div>
                    <CardDescription>Digite sua nova senha</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new_password" className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Nova Senha
                        </Label>
                        <Input
                          id="new_password"
                          type="password"
                          value={newPasswordForm.password}
                          onChange={(e) => setNewPasswordForm(prev => ({ ...prev, password: e.target.value }))}
                          required
                          className="pl-10"
                          placeholder="Digite sua nova senha"
                          minLength={6}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm_password" className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Confirmar Senha
                        </Label>
                        <Input
                          id="confirm_password"
                          type="password"
                          value={newPasswordForm.confirmPassword}
                          onChange={(e) => setNewPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                          className="pl-10"
                          placeholder="Confirme sua nova senha"
                          minLength={6}
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isResetting}>
                        {isResetting ? "Salvando..." : "Redefinir Senha"}
                      </Button>

                      {/* Feedback de erro */}
                      {erroLogin && (
                        <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-red-800 text-sm">{erroLogin}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </form>
                  </CardContent>
                </Card>
              ) : (
                /* Formulário de Cadastro */
                <Card className={`shadow-xl border-2 ${userTypeInfo.color} ${userTypeInfo.bgColor}`}>
                  <CardHeader className="text-center">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                      {userTypeInfo.icon}
                      <CardTitle className="text-xl">Cadastro - {userTypeInfo.title}</CardTitle>
                    </div>
                    <CardDescription>Preencha os dados para solicitar acesso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCadastro} className="space-y-4">
                      {/* CNPJ - Primeiro campo para auto-preenchimento */}
                      <div className="space-y-2">
                        <Label htmlFor="cnpj" className="flex items-center">
                          <Search className="h-4 w-4 mr-2" />
                          CNPJ *
                        </Label>
                        <div className="relative">
                          <Input
                            id="cnpj"
                            value={formCadastro.cnpj}
                            onChange={(e) => {
                              const cnpj = e.target.value.replace(/\D/g, '');
                              setFormCadastro(prev => ({ ...prev, cnpj }));
                              if (cnpj.length === 14) {
                                buscarDadosCNPJ(cnpj);
                              }
                            }}
                            maxLength={14}
                            required
                            placeholder="Digite apenas números"
                            className="pl-10"
                          />
                          {buscandoCNPJ && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Telefone */}
                      <div className="space-y-2">
                        <Label htmlFor="telefone" className="flex items-center">
                          <Phone className="h-4 w-4 mr-2" />
                          Telefone
                        </Label>
                        <Input
                          id="telefone"
                          value={formCadastro.telefone}
                          onChange={(e) => setFormCadastro(prev => ({ ...prev, telefone: e.target.value }))}
                          placeholder="(11) 99999-9999"
                          className="pl-10"
                        />
                      </div>

                      {/* Nome */}
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Nome Completo *
                        </Label>
                        <Input
                          id="nome"
                          value={formCadastro.nome}
                          onChange={(e) => setFormCadastro(prev => ({ ...prev, nome: e.target.value }))}
                          required
                          placeholder="Seu nome completo"
                          className="pl-10"
                        />
                      </div>

                      {/* Razão Social */}
                      <div className="space-y-2">
                        <Label htmlFor="razao_social">Razão Social</Label>
                        <Input
                          id="razao_social"
                          value={formCadastro.razao_social}
                          onChange={(e) => setFormCadastro(prev => ({ ...prev, razao_social: e.target.value }))}
                          placeholder="Razão social da empresa"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email_cadastro" className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          E-mail *
                        </Label>
                        <Input
                          id="email_cadastro"
                          type="email"
                          value={formCadastro.email}
                          onChange={(e) => setFormCadastro(prev => ({ ...prev, email: e.target.value }))}
                          required
                          placeholder="seu@email.com"
                          className="pl-10"
                        />
                      </div>

                      {/* Senha */}
                      <div className="space-y-2">
                        <Label htmlFor="senha_cadastro" className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" />
                          Senha *
                        </Label>
                        <Input
                          id="senha_cadastro"
                          type="password"
                          value={formCadastro.senha}
                          onChange={(e) => setFormCadastro(prev => ({ ...prev, senha: e.target.value }))}
                          required
                          placeholder="Digite uma senha segura"
                          className="pl-10"
                        />
                      </div>

                      {/* Endereço */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="endereco">Endereço</Label>
                          <Input
                            id="endereco"
                            value={formCadastro.endereco}
                            onChange={(e) => setFormCadastro(prev => ({ ...prev, endereco: e.target.value }))}
                            placeholder="Rua, avenida..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="numero">Número</Label>
                          <Input
                            id="numero"
                            value={formCadastro.numero}
                            onChange={(e) => setFormCadastro(prev => ({ ...prev, numero: e.target.value }))}
                            placeholder="123"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="bairro">Bairro</Label>
                          <Input
                            id="bairro"
                            value={formCadastro.bairro}
                            onChange={(e) => setFormCadastro(prev => ({ ...prev, bairro: e.target.value }))}
                            placeholder="Centro"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cidade">Cidade</Label>
                          <Input
                            id="cidade"
                            value={formCadastro.cidade}
                            onChange={(e) => setFormCadastro(prev => ({ ...prev, cidade: e.target.value }))}
                            placeholder="São Paulo"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="uf">UF</Label>
                          <Select value={formCadastro.uf} onValueChange={(value) => setFormCadastro(prev => ({ ...prev, uf: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="SP" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="AC">AC</SelectItem>
                              <SelectItem value="AL">AL</SelectItem>
                              <SelectItem value="AP">AP</SelectItem>
                              <SelectItem value="AM">AM</SelectItem>
                              <SelectItem value="BA">BA</SelectItem>
                              <SelectItem value="CE">CE</SelectItem>
                              <SelectItem value="DF">DF</SelectItem>
                              <SelectItem value="ES">ES</SelectItem>
                              <SelectItem value="GO">GO</SelectItem>
                              <SelectItem value="MA">MA</SelectItem>
                              <SelectItem value="MT">MT</SelectItem>
                              <SelectItem value="MS">MS</SelectItem>
                              <SelectItem value="MG">MG</SelectItem>
                              <SelectItem value="PA">PA</SelectItem>
                              <SelectItem value="PB">PB</SelectItem>
                              <SelectItem value="PR">PR</SelectItem>
                              <SelectItem value="PE">PE</SelectItem>
                              <SelectItem value="PI">PI</SelectItem>
                              <SelectItem value="RJ">RJ</SelectItem>
                              <SelectItem value="RN">RN</SelectItem>
                              <SelectItem value="RS">RS</SelectItem>
                              <SelectItem value="RO">RO</SelectItem>
                              <SelectItem value="RR">RR</SelectItem>
                              <SelectItem value="SC">SC</SelectItem>
                              <SelectItem value="SP">SP</SelectItem>
                              <SelectItem value="SE">SE</SelectItem>
                              <SelectItem value="TO">TO</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cep">CEP</Label>
                          <Input
                            id="cep"
                            value={formCadastro.cep}
                            onChange={(e) => setFormCadastro(prev => ({ ...prev, cep: e.target.value }))}
                            placeholder="01234-567"
                          />
                        </div>
                      </div>

                      {/* CNPJ do Operador Logístico (apenas para cliente e fornecedor) */}
                      {selectedUserType !== 'transportador' && (
                        <div className="space-y-2">
                          <Label htmlFor="operador_cnpj">CNPJ do Operador Logístico *</Label>
                          <Input
                            id="operador_cnpj"
                            value={formCadastro.operador_logistico_cnpj}
                            onChange={(e) => setFormCadastro(prev => ({ 
                              ...prev, 
                              operador_logistico_cnpj: e.target.value.replace(/\D/g, '') 
                            }))}
                            required
                            placeholder="CNPJ do operador responsável"
                            maxLength={14}
                          />
                          <p className="text-xs text-gray-600">
                            Informe o CNPJ do operador logístico que irá gerenciar sua conta
                          </p>
                        </div>
                      )}

                      {/* Feedback Visual */}
                      {feedbackCadastro.tipo && (
                        <div className={`p-4 rounded-lg border ${
                          feedbackCadastro.tipo === 'sucesso' 
                            ? 'bg-green-50 border-green-200 text-green-800' 
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                          <div className="flex items-center">
                            {feedbackCadastro.tipo === 'sucesso' ? (
                              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                            )}
                            <div>
                              <h4 className="font-medium">{feedbackCadastro.titulo}</h4>
                              <p className="text-sm mt-1">{feedbackCadastro.mensagem}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Enviando..." : "Solicitar Cadastro"}
                      </Button>
                    </form>

                    {/* Change User Type */}
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowAccessForm(false)}
                        className="w-full text-sm"
                      >
                        Voltar às opções
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}