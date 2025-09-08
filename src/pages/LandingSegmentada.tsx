import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Truck, 
  Building2, 
  Package, 
  Users, 
  Shield,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CadastroForm {
  tipo_usuario: 'transportador' | 'cliente' | 'fornecedor';
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cnpj: string;
  razao_social: string;
  cnpj_transportador?: string; // Para cliente e fornecedor
  observacoes: string;
}

export default function LandingSegmentada() {
  const { toast } = useToast();
  const [modalAberto, setModalAberto] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<'transportador' | 'cliente' | 'fornecedor' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CadastroForm>({
    tipo_usuario: 'transportador',
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    cnpj: '',
    razao_social: '',
    cnpj_transportador: '',
    observacoes: ''
  });

  const abrirModal = (tipo: 'transportador' | 'cliente' | 'fornecedor') => {
    setTipoSelecionado(tipo);
    setFormData(prev => ({ ...prev, tipo_usuario: tipo }));
    setModalAberto(true);
  };

  const handleInputChange = (field: keyof CadastroForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCNPJ = (cnpj: string) => {
    const digits = cnpj.replace(/\D/g, '');
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const handleSubmit = async () => {
    if (!formData.nome || !formData.email || !formData.senha || !formData.cnpj) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if ((formData.tipo_usuario === 'cliente' || formData.tipo_usuario === 'fornecedor') && !formData.cnpj_transportador) {
      toast({
        title: "CNPJ do Transportador obrigatório",
        description: "Informe o CNPJ do transportador/operador logístico responsável.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.senha,
          nome: formData.nome,
          razao_social: formData.razao_social || formData.nome,
          telefone: formData.telefone,
          cnpj: formData.cnpj,
          tipo_usuario: formData.tipo_usuario,
          cnpj_transportador: formData.cnpj_transportador,
          observacoes: formData.observacoes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (formData.tipo_usuario === 'transportador') {
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Seu cadastro foi aprovado automaticamente. Você já pode fazer login.",
          });
        } else {
          toast({
            title: "Cadastro enviado com sucesso!",
            description: "Seu cadastro foi enviado para análise. Você receberá um email quando for aprovado.",
          });
        }
        
        setModalAberto(false);
        setFormData({
          tipo_usuario: 'transportador',
          nome: '',
          email: '',
          senha: '',
          telefone: '',
          cnpj: '',
          razao_social: '',
          cnpj_transportador: '',
          observacoes: ''
        });
      } else {
        let tituloErro = "Erro no cadastro";
        let mensagemErro = data.message || "Não foi possível completar o cadastro.";
        
        if (data.error === "Usuário já existe") {
          tituloErro = "Email já cadastrado";
          mensagemErro = "Este email já está registrado no sistema. Tente fazer login ou use outro email.";
        } else if (data.error === "CNPJ já existe") {
          tituloErro = "CNPJ já cadastrado";
          mensagemErro = "Este CNPJ já está registrado no sistema.";
        }
        
        toast({
          title: tituloErro,
          description: mensagemErro,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTipoInfo = () => {
    const tipos = {
      transportador: {
        titulo: "Transportador / Operador Logístico",
        descricao: "Gerencie sua operação logística completa",
        beneficios: [
          "Gestão completa de clientes e fornecedores",
          "Controle total de carregamentos e coletas",
          "Sistema de aprovação de usuários",
          "Relatórios e análises detalhadas"
        ]
      },
      cliente: {
        titulo: "Cliente",
        descricao: "Acompanhe seus envios e coletas",
        beneficios: [
          "Visualização de documentos fiscais",
          "Aprovação/recusa de coletas",
          "Rastreamento em tempo real",
          "Histórico completo de operações"
        ]
      },
      fornecedor: {
        titulo: "Fornecedor",
        descricao: "Gerencie suas entregas e carregamentos",
        beneficios: [
          "Solicitação de ordens de carregamento",
          "Visualização de documentos",
          "Rastreamento de mercadorias",
          "Comunicação direta com transportador"
        ]
      }
    };
    return tipos[tipoSelecionado || 'transportador'];
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-[#0098DA] rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">CrossWMS</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/login'}
                className="border-[#0098DA] text-[#0098DA] hover:bg-[#0098DA] hover:text-white"
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-[#0098DA] to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Sistema de Gestão Logística
          </h1>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Conecte transportadores, clientes e fornecedores em uma plataforma única e segura
          </p>
        </div>
      </section>

      {/* Tipos de Usuário */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Escolha seu Perfil de Acesso
            </h2>
            <p className="text-lg text-gray-600">
              Cada tipo de usuário tem funcionalidades específicas para suas necessidades
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Transportador */}
            <Card className="bg-white border-2 border-gray-200 hover:border-[#0098DA] transition-colors cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-[#0098DA] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Transportador / Operador Logístico
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Para empresas que gerenciam operações logísticas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Gestão completa da operação
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Aprovação de clientes e fornecedores
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Controle de carregamentos
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Relatórios e análises
                  </div>
                </div>
                <Button 
                  onClick={() => abrirModal('transportador')}
                  className="w-full bg-[#0098DA] hover:bg-[#007BB5] text-white"
                >
                  Solicitar Cadastro
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Cliente */}
            <Card className="bg-white border-2 border-gray-200 hover:border-green-500 transition-colors cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Cliente
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Para empresas que contratam serviços logísticos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Aprovação de coletas
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Rastreamento em tempo real
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Visualização de documentos
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    Histórico de operações
                  </div>
                </div>
                <Button 
                  onClick={() => abrirModal('cliente')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  Solicitar Cadastro
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Fornecedor */}
            <Card className="bg-white border-2 border-gray-200 hover:border-orange-500 transition-colors cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Fornecedor
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Para empresas que fornecem produtos/serviços
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                    Solicitação de carregamentos
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                    Visualização de documentos
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                    Rastreamento de mercadorias
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-orange-500 mr-2 flex-shrink-0" />
                    Comunicação direta
                  </div>
                </div>
                <Button 
                  onClick={() => abrirModal('fornecedor')}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Solicitar Cadastro
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Processo de Aprovação */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Processo de Aprovação
            </h2>
            <p className="text-lg text-gray-600">
              Sua segurança é nossa prioridade. Todos os usuários passam por aprovação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-[#0098DA]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Cadastro</h3>
              <p className="text-gray-600">
                Preencha seus dados e aguarde análise
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Verificação</h3>
              <p className="text-gray-600">
                Nossos administradores verificam suas informações
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Aprovação</h3>
              <p className="text-gray-600">
                Receba acesso ao sistema via email
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-[#0098DA] rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold">CrossWMS</span>
              </div>
              <p className="text-gray-400">
                Sistema de gestão logística integrado para transportadores, clientes e fornecedores.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  (11) 9999-9999
                </div>
                <div className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  contato@crosswms.com.br
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Suporte</h3>
              <p className="text-gray-400">
                Nossa equipe está pronta para ajudar com qualquer dúvida sobre o sistema.
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 CrossWMS. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modal de Cadastro */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {tipoSelecionado === 'transportador' && <Truck className="h-5 w-5 mr-2 text-[#0098DA]" />}
              {tipoSelecionado === 'cliente' && <Building2 className="h-5 w-5 mr-2 text-green-500" />}
              {tipoSelecionado === 'fornecedor' && <Package className="h-5 w-5 mr-2 text-orange-500" />}
              Cadastro - {getTipoInfo().titulo}
            </DialogTitle>
            <DialogDescription>
              {getTipoInfo().descricao}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Dados Pessoais</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Seu nome completo"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="senha">Senha *</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formatPhone(formData.telefone)}
                    onChange={(e) => handleInputChange('telefone', e.target.value.replace(/\D/g, ''))}
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Dados da Empresa */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Dados da Empresa</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formatCNPJ(formData.cnpj)}
                    onChange={(e) => handleInputChange('cnpj', e.target.value.replace(/\D/g, ''))}
                    placeholder="00.000.000/0000-00"
                    className="mt-1"
                    maxLength={18}
                  />
                </div>
                <div>
                  <Label htmlFor="razao_social">Razão Social</Label>
                  <Input
                    id="razao_social"
                    value={formData.razao_social}
                    onChange={(e) => handleInputChange('razao_social', e.target.value)}
                    placeholder="Nome da empresa"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* CNPJ do Transportador para Cliente e Fornecedor */}
              {(tipoSelecionado === 'cliente' || tipoSelecionado === 'fornecedor') && (
                <div>
                  <Label htmlFor="cnpj_transportador">CNPJ do Transportador/Operador Logístico *</Label>
                  <Input
                    id="cnpj_transportador"
                    value={formatCNPJ(formData.cnpj_transportador || '')}
                    onChange={(e) => handleInputChange('cnpj_transportador', e.target.value.replace(/\D/g, ''))}
                    placeholder="00.000.000/0000-00"
                    className="mt-1"
                    maxLength={18}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Informe o CNPJ do transportador responsável pela sua operação
                  </p>
                </div>
              )}
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre sua empresa ou necessidades"
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Benefícios */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-900 mb-2">O que você terá acesso:</h5>
              <div className="space-y-1">
                {getTipoInfo().beneficios.map((beneficio, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    {beneficio}
                  </div>
                ))}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setModalAberto(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#0098DA] hover:bg-[#007BB5] text-white"
              >
                {isLoading ? "Enviando..." : "Enviar Cadastro"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}