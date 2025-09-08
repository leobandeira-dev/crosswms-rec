import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings, 
  Globe, 
  Clock, 
  Mail, 
  Bell, 
  Shield,
  Database,
  FileText,
  Save,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SystemConfig {
  timezone: string;
  language: string;
  dateFormat: string;
  currency: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  systemNotifications: boolean;
  backupEnabled: boolean;
  backupFrequency: string;
  sessionTimeout: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  maintenanceMode: boolean;
  debugMode: boolean;
}

interface EmailConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_pass: string;
  email_from: string;
  email_from_name: string;
  email_habilitado: boolean;
}

export default function ConfiguracoesSistema() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  // Estado para configurações de email
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    smtp_host: '',
    smtp_port: 587,
    smtp_secure: false,
    smtp_user: '',
    smtp_pass: '',
    email_from: '',
    email_from_name: '',
    email_habilitado: false
  });
  
  // Buscar ID da empresa do usuário logado
  const empresaId = "6a1c6bfe-305f-429d-b74e-18a24b80ad19"; // CrossWMS Administração
  
  // Query para carregar configurações de email
  const { data: emailConfigData, isLoading: emailConfigLoading } = useQuery({
    queryKey: ['email-config', empresaId],
    queryFn: async () => {
      const response = await fetch(`/api/empresas/${empresaId}/configuracao-email`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar configurações');
      return response.json();
    }
  });
  
  // Mutation para salvar configurações de email
  const saveEmailConfigMutation = useMutation({
    mutationFn: async (data: EmailConfig) => {
      const response = await fetch(`/api/empresas/${empresaId}/configuracao-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao salvar configurações');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações de email foram atualizadas com sucesso."
      });
      queryClient.invalidateQueries({ queryKey: ['email-config', empresaId] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar as configurações de email.",
        variant: "destructive"
      });
    }
  });

  // Mutation para teste de email
  const testEmailMutation = useMutation({
    mutationFn: async (email_destino: string) => {
      const response = await fetch(`/api/empresas/${empresaId}/teste-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email_destino })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar email de teste');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.email_sent) {
        toast({
          title: "Email enviado!",
          description: `Email de teste enviado com sucesso para ${data.details.destinatario}`
        });
      } else {
        toast({
          title: "Teste concluído",
          description: `Diagnóstico: ${data.connection_message}. Verifique as configurações SMTP.`,
          variant: "destructive"
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Erro no teste",
        description: error.message || "Erro ao enviar email de teste",
        variant: "destructive"
      });
    }
  });
  
  // Atualizar estado quando dados são carregados
  useEffect(() => {
    if (emailConfigData) {
      setEmailConfig(emailConfigData);
    }
  }, [emailConfigData]);
  
  const [config, setConfig] = useState<SystemConfig>({
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    dateFormat: "DD/MM/YYYY",
    currency: "BRL",
    emailNotifications: true,
    smsNotifications: false,
    systemNotifications: true,
    backupEnabled: true,
    backupFrequency: "daily",
    sessionTimeout: 30,
    maxFileSize: 10,
    allowedFileTypes: ["pdf", "xlsx", "csv", "jpg", "png"],
    maintenanceMode: false,
    debugMode: false
  });

  const handleConfigChange = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleEmailConfigChange = (key: keyof EmailConfig, value: any) => {
    setEmailConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveEmailConfig = async () => {
    saveEmailConfigMutation.mutate(emailConfig);
  };

  const handleTestEmail = async () => {
    const email = "leonardobandeir@gmail.com";
    testEmailMutation.mutate(email);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do sistema foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setConfig({
      timezone: "America/Sao_Paulo",
      language: "pt-BR",
      dateFormat: "DD/MM/YYYY",
      currency: "BRL",
      emailNotifications: true,
      smsNotifications: false,
      systemNotifications: true,
      backupEnabled: true,
      backupFrequency: "daily",
      sessionTimeout: 30,
      maxFileSize: 10,
      allowedFileTypes: ["pdf", "xlsx", "csv", "jpg", "png"],
      maintenanceMode: false,
      debugMode: false
    });
    
    toast({
      title: "Configurações restauradas",
      description: "As configurações foram resetadas para os valores padrão.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Configurações do Sistema
          </h3>
          <p className="text-gray-600">
            Ajustes gerais do sistema
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#0098DA] hover:bg-[#007BB5] text-white"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações Gerais */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-[#0098DA]" />
              Configurações Gerais
            </CardTitle>
            <CardDescription>
              Configurações básicas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select value={config.timezone} onValueChange={(value) => handleConfigChange('timezone', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">America/São Paulo (UTC-3)</SelectItem>
                  <SelectItem value="America/New_York">America/New York (UTC-5)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (UTC+0)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Idioma do Sistema</Label>
              <Select value={config.language} onValueChange={(value) => handleConfigChange('language', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (United States)</SelectItem>
                  <SelectItem value="es-ES">Español (España)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFormat">Formato de Data</Label>
              <Select value={config.dateFormat} onValueChange={(value) => handleConfigChange('dateFormat', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Moeda</Label>
              <Select value={config.currency} onValueChange={(value) => handleConfigChange('currency', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-[#0098DA]" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como o sistema enviará notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Email</Label>
                <p className="text-sm text-gray-500">Receber notificações por email</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={config.emailNotifications}
                onCheckedChange={(checked) => handleConfigChange('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smsNotifications">SMS</Label>
                <p className="text-sm text-gray-500">Receber notificações por SMS</p>
              </div>
              <Switch
                id="smsNotifications"
                checked={config.smsNotifications}
                onCheckedChange={(checked) => handleConfigChange('smsNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="systemNotifications">Sistema</Label>
                <p className="text-sm text-gray-500">Notificações no navegador</p>
              </div>
              <Switch
                id="systemNotifications"
                checked={config.systemNotifications}
                onCheckedChange={(checked) => handleConfigChange('systemNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Email */}
        <Card className="bg-white border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-[#0098DA]" />
              Configurações de Email
            </CardTitle>
            <CardDescription>
              Configure o servidor SMTP para envio de emails do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailConfigLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-[#0098DA]" />
                <span className="ml-2 text-gray-600">Carregando configurações...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Primeira linha: Servidor e Porta */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp_host">Servidor SMTP</Label>
                    <Input
                      id="smtp_host"
                      value={emailConfig.smtp_host}
                      onChange={(e) => handleEmailConfigChange('smtp_host', e.target.value)}
                      placeholder="smtp.hostgator.com"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtp_port">Porta SMTP</Label>
                    <Input
                      id="smtp_port"
                      type="number"
                      value={emailConfig.smtp_port}
                      onChange={(e) => handleEmailConfigChange('smtp_port', parseInt(e.target.value))}
                      placeholder="587"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {/* Segunda linha: Usuário e Senha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp_user">Usuário SMTP</Label>
                    <Input
                      id="smtp_user"
                      value={emailConfig.smtp_user}
                      onChange={(e) => handleEmailConfigChange('smtp_user', e.target.value)}
                      placeholder="contato@empresex.com.br"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="smtp_pass">Senha SMTP</Label>
                    <Input
                      id="smtp_pass"
                      type="password"
                      value={emailConfig.smtp_pass}
                      onChange={(e) => handleEmailConfigChange('smtp_pass', e.target.value)}
                      placeholder="Digite a senha SMTP"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {/* Terceira linha: Email e Nome do Remetente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email_from">Email Remetente</Label>
                    <Input
                      id="email_from"
                      value={emailConfig.email_from}
                      onChange={(e) => handleEmailConfigChange('email_from', e.target.value)}
                      placeholder="noreply@empresex.com.br"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email_from_name">Nome do Remetente</Label>
                    <Input
                      id="email_from_name"
                      value={emailConfig.email_from_name}
                      onChange={(e) => handleEmailConfigChange('email_from_name', e.target.value)}
                      placeholder="Sistema CrossWMS"
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="smtp_secure"
                      checked={emailConfig.smtp_secure}
                      onCheckedChange={(checked) => handleEmailConfigChange('smtp_secure', checked)}
                    />
                    <Label htmlFor="smtp_secure">Conexão SSL/TLS</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email_habilitado"
                      checked={emailConfig.email_habilitado}
                      onCheckedChange={(checked) => handleEmailConfigChange('email_habilitado', checked)}
                    />
                    <Label htmlFor="email_habilitado">Email habilitado</Label>
                  </div>
                </div>
                
                <div className="md:col-span-2 pt-4 border-t flex gap-3">
                  <Button 
                    onClick={handleSaveEmailConfig}
                    disabled={saveEmailConfigMutation.isPending}
                    className="bg-[#0098DA] hover:bg-[#007BB5] text-white"
                  >
                    {saveEmailConfigMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Salvar Configurações de Email
                  </Button>
                  
                  <Button 
                    onClick={handleTestEmail}
                    disabled={testEmailMutation.isPending || !emailConfig.email_habilitado}
                    variant="outline"
                    className="border-[#0098DA] text-[#0098DA] hover:bg-[#0098DA] hover:text-white"
                  >
                    {testEmailMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4 mr-2" />
                    )}
                    Enviar Teste para leonardobandeir@gmail.com
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-[#0098DA]" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Timeout de Sessão (minutos)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={config.sessionTimeout}
                onChange={(e) => handleConfigChange('sessionTimeout', Number(e.target.value))}
                className="mt-1"
                min="5"
                max="480"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tempo de inatividade antes de expirar a sessão
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenanceMode">Modo Manutenção</Label>
                <p className="text-sm text-gray-500">Bloquear acesso ao sistema</p>
              </div>
              <Switch
                id="maintenanceMode"
                checked={config.maintenanceMode}
                onCheckedChange={(checked) => handleConfigChange('maintenanceMode', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="debugMode">Modo Debug</Label>
                <p className="text-sm text-gray-500">Ativar logs detalhados</p>
              </div>
              <Switch
                id="debugMode"
                checked={config.debugMode}
                onCheckedChange={(checked) => handleConfigChange('debugMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup e Armazenamento */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
              <Database className="h-5 w-5 mr-2 text-[#0098DA]" />
              Backup e Armazenamento
            </CardTitle>
            <CardDescription>
              Configurações de backup e arquivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="backupEnabled">Backup Automático</Label>
                <p className="text-sm text-gray-500">Ativar backup automático dos dados</p>
              </div>
              <Switch
                id="backupEnabled"
                checked={config.backupEnabled}
                onCheckedChange={(checked) => handleConfigChange('backupEnabled', checked)}
              />
            </div>

            {config.backupEnabled && (
              <div>
                <Label htmlFor="backupFrequency">Frequência de Backup</Label>
                <Select value={config.backupFrequency} onValueChange={(value) => handleConfigChange('backupFrequency', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">A cada hora</SelectItem>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="maxFileSize">Tamanho Máximo de Arquivo (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={config.maxFileSize}
                onChange={(e) => handleConfigChange('maxFileSize', Number(e.target.value))}
                className="mt-1"
                min="1"
                max="100"
              />
            </div>

            <div>
              <Label htmlFor="allowedFileTypes">Tipos de Arquivo Permitidos</Label>
              <Input
                id="allowedFileTypes"
                value={config.allowedFileTypes.join(', ')}
                onChange={(e) => handleConfigChange('allowedFileTypes', e.target.value.split(', ').map(s => s.trim()))}
                className="mt-1"
                placeholder="pdf, xlsx, csv, jpg, png"
              />
              <p className="text-xs text-gray-500 mt-1">
                Extensões separadas por vírgula
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-[#0098DA]" />
            Status do Sistema
          </CardTitle>
          <CardDescription>
            Informações sobre o estado atual do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-800 font-medium">Status</p>
                  <p className="text-green-900 font-semibold">Online</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Versão</p>
                  <p className="text-blue-900 font-semibold">v2.1.0</p>
                </div>
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-800 font-medium">Uptime</p>
                  <p className="text-purple-900 font-semibold">99.9%</p>
                </div>
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-800 font-medium">Último Backup</p>
                  <p className="text-orange-900 font-semibold">2h atrás</p>
                </div>
                <Database className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}