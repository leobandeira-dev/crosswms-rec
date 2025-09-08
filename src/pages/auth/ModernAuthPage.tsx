import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Package, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Mail,
  Lock,
  User,
  Building,
  Truck,
  BarChart3,
  Shield
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function ModernAuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  
  const [formData, setFormData] = useState({
    email: 'admin@crosswms.com.br',
    password: '123456',
    name: '',
    company: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First, try to initialize seed data if needed
      if (isLogin && formData.email === 'admin@crosswms.com.br' && formData.password === '123456') {
        try {
          const seedResponse = await fetch('/api/seed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (seedResponse.ok) {
            console.log('Seed data initialized');
          }
        } catch (seedError) {
          console.log('Seed already exists or error:', seedError);
        }
      }

      const endpoint = isLogin ? '/api/login' : '/api/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { 
            email: formData.email, 
            password: formData.password, 
            nome: formData.name,
            empresa: formData.company
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo de volta!",
          });
          setLocation('/dashboard');
        } else {
          toast({
            title: "Cadastro realizado com sucesso",
            description: "Agora você pode fazer login",
          });
          setIsLogin(true);
          setFormData({ email: '', password: '', name: '', company: '' });
        }
      } else {
        if (data.error === "Invalid credentials" && isLogin) {
          toast({
            title: "Credenciais inválidas",
            description: "Use: admin@crosswms.com.br / 123456 para demonstração",
            variant: "destructive",
          });
        } else {
          toast({
            title: isLogin ? "Erro no login" : "Erro no cadastro",
            description: data.message || "Verifique suas informações e tente novamente",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5F5F5' }}>
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle at 25px 25px, #0098DA08 2px, transparent 0), radial-gradient(circle at 75px 75px, #0098DA05 2px, transparent 0)',
        backgroundSize: '100px 100px'
      }} />
      
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <Link href="/">
              <div className="flex items-center space-x-3 mb-8 cursor-pointer group">
                <div className="bg-[#0098DA] p-3 rounded-xl group-hover:scale-105 transition-transform">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <span className="text-3xl font-bold text-gray-800">CrossWMS</span>
              </div>
            </Link>
            
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Bem-vindo ao futuro da
              <span className="text-[#0098DA] block">gestão logística</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Plataforma completa para otimizar sua operação de armazenagem e transporte
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-[#0098DA]/10 p-3 rounded-xl">
                <Truck className="h-6 w-6 text-[#0098DA]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Gestão Completa</h3>
                <p className="text-gray-600">Controle total da operação com módulos integrados</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Analytics Avançado</h3>
                <p className="text-gray-600">Dashboards e relatórios em tempo real</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Segurança Total</h3>
                <p className="text-gray-600">Proteção de dados com criptografia avançada</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">+500 empresas confiam</h3>
            <p className="text-blue-100">Junte-se às empresas que transformaram sua logística</p>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <Card className="crosswms-card shadow-xl border-gray-300">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4 lg:hidden">
                <div className="bg-[#0098DA] p-3 rounded-xl">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                {isLogin ? 'Entrar na plataforma' : 'Criar conta'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {isLogin 
                  ? 'Acesse sua conta para gerenciar suas operações' 
                  : 'Comece a otimizar sua logística hoje mesmo'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Seu nome completo"
                          className="pl-10"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          id="company"
                          type="text"
                          placeholder="Nome da empresa"
                          className="pl-10"
                          value={formData.company}
                          onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                          required={!isLogin}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      className="pl-10 pr-10"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm text-gray-600">
                      <input type="checkbox" className="rounded border-gray-300" />
                      <span>Lembrar de mim</span>
                    </label>
                    <Link href="/reset-password">
                      <span className="text-sm text-[#0098DA] hover:text-blue-700 cursor-pointer">
                        Esqueceu a senha?
                      </span>
                    </Link>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-[#0098DA] hover:bg-blue-600 text-white py-3 font-medium rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar conta')}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <span className="text-gray-600">
                  {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                </span>
                <Button
                  variant="link"
                  className="ml-2 p-0 text-[#0098DA] hover:text-blue-700"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Criar conta gratuita' : 'Fazer login'}
                </Button>
              </div>

              {!isLogin && (
                <div className="mt-6 p-4 bg-[#0098DA]/10 rounded-lg border border-[#0098DA]/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className="bg-[#0098DA]/20 text-[#0098DA] border-[#0098DA]/30">Teste Grátis</Badge>
                  </div>
                  <p className="text-sm text-[#0098DA]">
                    Experimente por 30 dias sem compromisso. Cancele quando quiser.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao site
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}