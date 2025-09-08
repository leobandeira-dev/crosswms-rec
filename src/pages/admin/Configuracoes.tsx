import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Settings, 
  Save, 
  Database,
  Shield,
  Bell,
  Globe,
  Clock,
  Key,
  Mail,
  Server
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";

export default function Configuracoes() {
  const [configuracoes, setConfiguracoes] = useState({
    // Configurações Gerais
    nomeInstancia: "CrossWMS Production",
    descricaoInstancia: "Sistema de gestão logística multi-tenant",
    timezone: "America/Sao_Paulo",
    idiomaPadrao: "pt-BR",
    
    // Configurações de Segurança
    sessaoTimeout: "480", // minutos
    tentativasLogin: "3",
    bloqueioTempo: "15", // minutos
    senhaComplexidade: true,
    autenticacaoDoisFatores: false,
    
    // Configurações de Email
    emailServidor: "smtp.gmail.com",
    emailPorta: "587",
    emailSeguranca: "tls",
    emailUsuario: "",
    emailSenha: "",
    emailRemetente: "noreply@crosswms.com.br",
    
    // Configurações de Notificações
    notificacoesEmail: true,
    notificacoesPush: false,
    notificacoesAdmin: true,
    
    // Configurações de Sistema
    backupAutomatico: true,
    backupHorario: "02:00",
    logsRetencao: "90", // dias
    manutencaoModo: false
  });

  const handleSave = () => {
    console.log("Salvando configurações:", configuracoes);
    // Aqui seria implementada a lógica de salvamento
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfiguracoes(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <MainLayout title="Configurações do Sistema">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              Configure parâmetros globais do sistema CrossWMS
            </p>
          </div>
          <Button 
            onClick={handleSave}
            className="bg-[#0098DA] hover:bg-[#007BB5] text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="seguranca">Segurança</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
          </TabsList>

          {/* Configurações Gerais */}
          <TabsContent value="geral">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-[#0098DA]" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription>
                  Configurações básicas da instância do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Instância
                    </label>
                    <Input
                      value={configuracoes.nomeInstancia}
                      onChange={(e) => handleConfigChange('nomeInstancia', e.target.value)}
                      placeholder="Nome da instância do sistema"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <Select 
                      value={configuracoes.timezone} 
                      onValueChange={(value) => handleConfigChange('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                        <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma Padrão
                    </label>
                    <Select 
                      value={configuracoes.idiomaPadrao} 
                      onValueChange={(value) => handleConfigChange('idiomaPadrao', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da Instância
                  </label>
                  <Input
                    value={configuracoes.descricaoInstancia}
                    onChange={(e) => handleConfigChange('descricaoInstancia', e.target.value)}
                    placeholder="Descrição da instância do sistema"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Segurança */}
          <TabsContent value="seguranca">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-[#0098DA]" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription>
                  Configurações de autenticação e segurança do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout de Sessão (minutos)
                    </label>
                    <Input
                      type="number"
                      value={configuracoes.sessaoTimeout}
                      onChange={(e) => handleConfigChange('sessaoTimeout', e.target.value)}
                      placeholder="480"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tentativas de Login
                    </label>
                    <Input
                      type="number"
                      value={configuracoes.tentativasLogin}
                      onChange={(e) => handleConfigChange('tentativasLogin', e.target.value)}
                      placeholder="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tempo de Bloqueio (minutos)
                    </label>
                    <Input
                      type="number"
                      value={configuracoes.bloqueioTempo}
                      onChange={(e) => handleConfigChange('bloqueioTempo', e.target.value)}
                      placeholder="15"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Senha Complexa Obrigatória</h4>
                      <p className="text-sm text-gray-600">
                        Exigir senhas com maiúsculas, minúsculas, números e símbolos
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.senhaComplexidade}
                      onCheckedChange={(checked) => handleConfigChange('senhaComplexidade', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Autenticação de Dois Fatores</h4>
                      <p className="text-sm text-gray-600">
                        Habilitar 2FA para todos os usuários do sistema
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.autenticacaoDoisFatores}
                      onCheckedChange={(checked) => handleConfigChange('autenticacaoDoisFatores', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Email */}
          <TabsContent value="email">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-[#0098DA]" />
                  Configurações de Email
                </CardTitle>
                <CardDescription>
                  Configure o servidor SMTP para envio de emails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Servidor SMTP
                    </label>
                    <Input
                      value={configuracoes.emailServidor}
                      onChange={(e) => handleConfigChange('emailServidor', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porta SMTP
                    </label>
                    <Input
                      value={configuracoes.emailPorta}
                      onChange={(e) => handleConfigChange('emailPorta', e.target.value)}
                      placeholder="587"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Segurança
                    </label>
                    <Select 
                      value={configuracoes.emailSeguranca} 
                      onValueChange={(value) => handleConfigChange('emailSeguranca', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">Nenhuma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Remetente
                    </label>
                    <Input
                      value={configuracoes.emailRemetente}
                      onChange={(e) => handleConfigChange('emailRemetente', e.target.value)}
                      placeholder="noreply@crosswms.com.br"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuário SMTP
                    </label>
                    <Input
                      value={configuracoes.emailUsuario}
                      onChange={(e) => handleConfigChange('emailUsuario', e.target.value)}
                      placeholder="usuario@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha SMTP
                    </label>
                    <Input
                      type="password"
                      value={configuracoes.emailSenha}
                      onChange={(e) => handleConfigChange('emailSenha', e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Notificações */}
          <TabsContent value="notificacoes">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-[#0098DA]" />
                  Configurações de Notificações
                </CardTitle>
                <CardDescription>
                  Configure como o sistema enviará notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Notificações por Email</h4>
                      <p className="text-sm text-gray-600">
                        Enviar notificações importantes por email
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.notificacoesEmail}
                      onCheckedChange={(checked) => handleConfigChange('notificacoesEmail', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Notificações Push</h4>
                      <p className="text-sm text-gray-600">
                        Enviar notificações push para dispositivos móveis
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.notificacoesPush}
                      onCheckedChange={(checked) => handleConfigChange('notificacoesPush', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Alertas de Administrador</h4>
                      <p className="text-sm text-gray-600">
                        Notificar administradores sobre eventos críticos
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.notificacoesAdmin}
                      onCheckedChange={(checked) => handleConfigChange('notificacoesAdmin', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Sistema */}
          <TabsContent value="sistema">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2 text-[#0098DA]" />
                  Configurações de Sistema
                </CardTitle>
                <CardDescription>
                  Configurações de manutenção e backup do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário do Backup
                    </label>
                    <Input
                      type="time"
                      value={configuracoes.backupHorario}
                      onChange={(e) => handleConfigChange('backupHorario', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retenção de Logs (dias)
                    </label>
                    <Input
                      type="number"
                      value={configuracoes.logsRetencao}
                      onChange={(e) => handleConfigChange('logsRetencao', e.target.value)}
                      placeholder="90"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Backup Automático</h4>
                      <p className="text-sm text-gray-600">
                        Realizar backup automático diário do sistema
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.backupAutomatico}
                      onCheckedChange={(checked) => handleConfigChange('backupAutomatico', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Modo de Manutenção</h4>
                      <p className="text-sm text-gray-600">
                        Ativar modo de manutenção (apenas admins terão acesso)
                      </p>
                    </div>
                    <Switch
                      checked={configuracoes.manutencaoModo}
                      onCheckedChange={(checked) => handleConfigChange('manutencaoModo', checked)}
                    />
                  </div>
                </div>

                {configuracoes.manutencaoModo && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-yellow-600 mr-2" />
                      <h4 className="font-medium text-yellow-800">Modo de Manutenção Ativo</h4>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      O sistema está em modo de manutenção. Apenas administradores podem acessar.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}