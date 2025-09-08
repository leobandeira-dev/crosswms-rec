import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Mail, 
  Send, 
  Settings, 
  TestTube,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Info,
  Server,
  Key
} from "lucide-react";
import { useLocation } from "wouter";

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

interface TestEmail {
  to: string;
  subject: string;
  message: string;
}

export default function EmailConfigPage() {
  const [, setLocation] = useLocation();
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    host: 'mail.crosswms.com.br',
    port: 587,
    user: '',
    password: '',
    from: 'noreply@crosswms.com.br'
  });

  const [testEmail, setTestEmail] = useState<TestEmail>({
    to: '',
    subject: 'Teste de configuração CrossWMS',
    message: 'Este é um e-mail de teste para verificar a configuração do sistema de e-mail do CrossWMS.'
  });

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('unknown');

    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus('success');
        toast.success('Conexão testada com sucesso');
      } else {
        setConnectionStatus('error');
        toast.error(data.message || 'Erro na conexão');
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Erro ao testar conexão');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail.to) {
      toast.error('Digite um e-mail de destino');
      return;
    }

    setIsSendingTest(true);

    try {
      const response = await fetch('/api/email/send-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(testEmail)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('E-mail de teste enviado com sucesso');
      } else {
        toast.error(data.message || 'Erro ao enviar e-mail');
      }
    } catch (error) {
      toast.error('Erro ao enviar e-mail de teste');
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-[#0098DA] rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Configuração de E-mail</h1>
              <p className="text-gray-600">Configure e teste o sistema de e-mail Hostgator</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuração SMTP */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Configuração SMTP
              </CardTitle>
              <CardDescription>
                Configure as credenciais do servidor de e-mail da Hostgator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="host" className="flex items-center">
                  <Server className="h-4 w-4 mr-2" />
                  Servidor SMTP
                </Label>
                <Input
                  id="host"
                  value={emailConfig.host}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, host: e.target.value }))}
                  placeholder="mail.seudominio.com.br"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port">Porta</Label>
                <Input
                  id="port"
                  type="number"
                  value={emailConfig.port}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                  placeholder="587"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  E-mail / Usuário
                </Label>
                <Input
                  id="user"
                  type="email"
                  value={emailConfig.user}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, user: e.target.value }))}
                  placeholder="noreply@crosswms.com.br"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={emailConfig.password}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Digite a senha do e-mail"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="from">Remetente (From)</Label>
                <Input
                  id="from"
                  type="email"
                  value={emailConfig.from}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, from: e.target.value }))}
                  placeholder="noreply@crosswms.com.br"
                />
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                  className="w-full"
                >
                  {isTestingConnection ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  {isTestingConnection ? 'Testando...' : 'Testar Conexão'}
                </Button>

                {/* Status da conexão */}
                {connectionStatus !== 'unknown' && (
                  <div className={`mt-3 p-3 rounded-lg flex items-center ${
                    connectionStatus === 'success' 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {connectionStatus === 'success' ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-sm font-medium">
                      {connectionStatus === 'success' 
                        ? 'Conexão estabelecida com sucesso' 
                        : 'Falha na conexão - Verifique as credenciais'
                      }
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Teste de Envio */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Send className="h-5 w-5 mr-2" />
                Teste de Envio
              </CardTitle>
              <CardDescription>
                Envie um e-mail de teste para verificar o funcionamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-to">E-mail de destino</Label>
                <Input
                  id="test-to"
                  type="email"
                  value={testEmail.to}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="teste@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-subject">Assunto</Label>
                <Input
                  id="test-subject"
                  value={testEmail.subject}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Assunto do e-mail"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="test-message">Mensagem</Label>
                <Textarea
                  id="test-message"
                  value={testEmail.message}
                  onChange={(e) => setTestEmail(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Digite a mensagem de teste"
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSendTestEmail}
                disabled={isSendingTest || !testEmail.to}
                className="w-full"
              >
                {isSendingTest ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isSendingTest ? 'Enviando...' : 'Enviar E-mail de Teste'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informações da Hostgator */}
        <Card className="shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Configurações Hostgator
            </CardTitle>
            <CardDescription>
              Informações para configuração do e-mail na Hostgator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Configurações SMTP Padrão:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><strong>Servidor:</strong> mail.seudominio.com.br</li>
                  <li><strong>Porta:</strong> 587 (STARTTLS) ou 465 (SSL)</li>
                  <li><strong>Autenticação:</strong> Obrigatória</li>
                  <li><strong>Usuário:</strong> endereço completo do e-mail</li>
                  <li><strong>Senha:</strong> senha da conta de e-mail</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">Como obter as credenciais:</h4>
                <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                  <li>Acesse o cPanel da Hostgator</li>
                  <li>Vá em "Contas de E-mail"</li>
                  <li>Crie ou configure a conta de e-mail</li>
                  <li>Use o endereço completo como usuário</li>
                  <li>Configure o domínio como servidor SMTP</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Variáveis de Ambiente Necessárias:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
                <div>
                  <p className="text-blue-700">EMAIL_HOST=mail.crosswms.com.br</p>
                  <p className="text-blue-700">EMAIL_USER=noreply@crosswms.com.br</p>
                </div>
                <div>
                  <p className="text-blue-700">EMAIL_PASS=sua_senha_aqui</p>
                  <p className="text-blue-700">EMAIL_FROM=noreply@crosswms.com.br</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}