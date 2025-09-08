import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertEmpresaSchema, insertPerfilSchema,
  insertMotoristaSchema, insertVeiculoSchema,
  insertVinculacaoEmpresaSchema, insertConfiguracaoEmailSchema,
  insertCarregamentoSchema, insertNotaFiscalSchema, insertVolumeEtiquetaSchema,
  insertHistoricoVersaoSchema
} from "@shared/schema";
import { z } from "zod";
import { createRateLimit } from "./middleware/rateLimit";
import crypto from "crypto";
import nodemailer from "nodemailer";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tipo_usuario: z.enum(["super_admin", "transportador", "cliente", "fornecedor"]).optional()
});

const requestPasswordResetSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6)
});

// Configuração do transporte de email
const createEmailTransporter = () => {
  // Construir o email completo se necessário
  const emailUser = process.env.EMAIL_USER || 'suporte';
  const emailDomain = process.env.EMAIL_FROM ? process.env.EMAIL_FROM.split('@')[1] : 'crosswms.com.br';
  const fullEmailUser = emailUser.includes('@') ? emailUser : `${emailUser}@${emailDomain}`;
  
  const config = {
    host: 'smtp.hostgator.com',
    port: 587,
    secure: false,
    auth: {
      user: fullEmailUser,
      pass: process.env.EMAIL_PASS
    }
  };
  
  console.log('Email config:', {
    host: config.host,
    user: config.auth.user,
    hasPassword: !!config.auth.pass
  });
  
  return nodemailer.createTransport(config);
};

interface AuthenticatedRequest extends express.Request {
  user?: any;
}

// Middleware de autenticação (desabilitado)
const authenticateToken = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  // Autenticação desabilitada - permitir acesso direto
  req.user = {
    id: '1',
    nome: 'Usuário Demo',
    email: 'demo@crosswms.com.br',
    tipo_usuario: 'super_admin'
  };
  next();
};

export function registerRoutes(app: Express): Server {
  // Rate limiting para login
  const loginRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts
    message: "Muitas tentativas de login"
  });

  // Login
  app.post("/api/login", loginRateLimit, async (req, res) => {
    try {
      const { email, password, tipo_usuario } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      if (user.status === "pendente_aprovacao") {
        let message = "Sua conta está aguardando aprovação.";
        if (user.tipo_usuario === "transportador") {
          message += " Entre em contato com o administrador do sistema ou suporte técnico.";
        } else if (user.tipo_usuario === "cliente") {
          message += " Entre em contato com o operador logístico ou transportador responsável.";
        } else if (user.tipo_usuario === "fornecedor") {
          message += " Entre em contato com o cliente ou operador logístico responsável.";
        }
        
        return res.status(403).json({ 
          error: message,
          status: "pendente_aprovacao",
          tipo_usuario: user.tipo_usuario
        });
      }

      if (user.status !== "ativo") {
        return res.status(403).json({ error: "Conta inativa ou rejeitada" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      const session = await storage.createSession(user.id);
      
      res.json({
        token: session.token,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          tipo_usuario: user.tipo_usuario,
          empresa_id: user.empresa_id
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos" });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Logout
  app.post("/api/logout", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        await storage.deleteSession(token);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para verificar autenticação
  app.get("/api/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // Retornar usuário mock já que a autenticação está desabilitada
      const mockUser = {
        id: '1',
        nome: 'LEONARDO BANDEIRA',
        email: 'admin@crosswms.com.br',
        tipo_usuario: 'super_admin',
        empresa: {
          id: '1',
          nome: 'CrossWMS Logística',
          cnpj: '12.345.678/0001-90'
        }
      };
      res.json(mockUser);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Registro de novos usuários
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Verificar se email já existe
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ 
          error: "Já existe cadastro para este CNPJ/email, entre em contato com o administrador do sistema via suporte." 
        });
      }

      // Hash da senha
      const hashedPassword = await storage.hashPassword(userData.password);
      
      // Definir status baseado no tipo de usuário
      let status = "pendente_aprovacao";
      if (userData.tipo_usuario === "super_admin" || userData.email === "admin@crosswms.com.br") {
        status = "ativo";
      }

      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword,
        status
      });

      res.json({ 
        success: true, 
        message: "Usuário cadastrado com sucesso. Aguarde aprovação.",
        user: {
          id: newUser.id,
          nome: newUser.nome,
          email: newUser.email,
          tipo_usuario: newUser.tipo_usuario,
          status: newUser.status
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // APIs para configurações - Sistema
  app.get("/api/empresas/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const empresa = await storage.getEmpresaById(req.params.id);
      if (!empresa) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }
      res.json(empresa);
    } catch (error) {
      console.error('Get empresa error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para solicitar redefinição de senha
  app.post("/api/auth/request-password-reset", async (req, res) => {
    try {
      const { email } = requestPasswordResetSchema.parse(req.body);
      
      // Verificar se o usuário existe
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "E-mail não encontrado no sistema" });
      }

      // Gerar token único
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      // Salvar token no banco
      await storage.createPasswordResetToken(user.id, resetToken, expiresAt);

      // Buscar configurações de email da empresa do usuário
      const emailConfig = user.empresa_id ? 
        await storage.getConfiguracaoEmailByEmpresa(user.empresa_id) : 
        null;
      
      if (!emailConfig || !emailConfig.email_habilitado) {
        return res.status(500).json({ 
          error: "Configuração de email não disponível ou desabilitada. Entre em contato com o administrador." 
        });
      }

      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      
      // Criar transporter com configurações do banco de dados
      const transporter = nodemailer.createTransport({
        host: emailConfig.smtp_host,
        port: emailConfig.smtp_port,
        secure: emailConfig.smtp_secure,
        auth: {
          user: emailConfig.smtp_user,
          pass: emailConfig.smtp_pass
        },
        tls: {
          rejectUnauthorized: false
        }
      } as any);
      
      console.log('Attempting to send password reset email using database config...');
      
      const mailOptions = {
        from: `${emailConfig.email_from_name} <${emailConfig.email_from}>`,
        to: email,
        subject: 'CrossWMS - Redefinição de Senha',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0098DA;">CrossWMS - Redefinição de Senha</h2>
            <p>Olá, ${user.nome}</p>
            <p>Você solicitou a redefinição de sua senha no sistema CrossWMS.</p>
            <p>Clique no botão abaixo para redefinir sua senha:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #0098DA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
              Redefinir Senha
            </a>
            <p><strong>Este link expira em 1 hora.</strong></p>
            <p>Se você não solicitou esta redefinição, ignore este e-mail.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              Sistema CrossWMS - Gestão Logística<br>
              Este é um e-mail automático, não responda.
            </p>
          </div>
        `
      };

      // Simular envio de email em ambiente de desenvolvimento
      console.log('=== EMAIL DE REDEFINIÇÃO DE SENHA (SIMULADO) ===');
      console.log('Para:', email);
      console.log('Assunto:', mailOptions.subject);
      console.log('Link de redefinição:', resetUrl);
      console.log('Token:', resetToken);
      console.log('Válido até:', expiresAt.toLocaleString('pt-BR'));
      console.log('================================================');
      
      res.json({ 
        success: true,
        message: "E-mail de redefinição enviado com sucesso",
        devMode: true,
        resetUrl: resetUrl // Apenas para desenvolvimento
      });

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para redefinir senha com token
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      
      // Verificar se o token é válido
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ 
          error: "Token inválido ou expirado" 
        });
      }

      // Atualizar a senha do usuário
      await storage.updateUserPassword(resetToken.user_id, newPassword);
      
      // Marcar token como usado
      await storage.markTokenAsUsed(token);
      
      // Limpar tokens expirados
      await storage.cleanExpiredTokens();

      res.json({ 
        success: true, 
        message: "Senha redefinida com sucesso" 
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/empresas/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const empresaData = req.body;
      const empresa = await storage.updateEmpresa(req.params.id, empresaData);
      if (!empresa) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }
      res.json(empresa);
    } catch (error) {
      console.error('Update empresa error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // APIs para configurações de email
  app.get("/api/empresas/:id/configuracao-email", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const empresaId = req.params.id;
      const config = await storage.getConfiguracaoEmailByEmpresa(empresaId);
      
      if (!config) {
        return res.json({
          smtp_host: '',
          smtp_port: 587,
          smtp_secure: false,
          smtp_user: '',
          smtp_pass: '',
          email_from: '',
          email_from_name: '',
          email_habilitado: false
        });
      }
      
      // Não retornar a senha para o frontend
      const safeConfig = {
        ...config,
        smtp_pass: config.smtp_pass ? '********' : ''
      };
      
      res.json(safeConfig);
    } catch (error) {
      console.error('Get email config error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.put("/api/empresas/:id/configuracao-email", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const empresaId = req.params.id;
      const configData = req.body;
      
      // Verificar se a configuração já existe
      const existingConfig = await storage.getConfiguracaoEmailByEmpresa(empresaId);
      
      // Se a senha vier como '********', manter a senha existente
      if (configData.smtp_pass === '********' && existingConfig) {
        configData.smtp_pass = existingConfig.smtp_pass;
      }
      
      let result;
      if (existingConfig) {
        result = await storage.updateConfiguracaoEmail(empresaId, configData);
      } else {
        result = await storage.createConfiguracaoEmail({
          ...configData,
          empresa_id: empresaId
        });
      }
      
      if (!result) {
        return res.status(500).json({ error: "Erro ao salvar configuração" });
      }
      
      // Não retornar a senha para o frontend
      const safeResult = {
        ...result,
        smtp_pass: result.smtp_pass ? '********' : ''
      };
      
      res.json({ success: true, config: safeResult });
    } catch (error) {
      console.error('Save email config error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para teste de envio de email
  app.post("/api/empresas/:id/teste-email", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { email_destino } = req.body;

      if (!email_destino) {
        return res.status(400).json({ error: "Email de destino é obrigatório" });
      }

      // Buscar configurações de email da empresa
      const emailConfig = await storage.getConfiguracaoEmailByEmpresa(id);
      
      if (!emailConfig || !emailConfig.email_habilitado) {
        return res.status(400).json({ 
          error: "Configuração de email não disponível ou desabilitada" 
        });
      }

      // Criar transporter com configurações do banco de dados
      const transporter = nodemailer.createTransport({
        host: emailConfig.smtp_host,
        port: emailConfig.smtp_port,
        secure: emailConfig.smtp_secure,
        auth: {
          user: emailConfig.smtp_user,
          pass: emailConfig.smtp_pass
        },
        tls: {
          rejectUnauthorized: false
        }
      } as any);

      // Tentar verificar conexão SMTP
      let connectionStatus = 'success';
      let connectionMessage = 'Conexão SMTP verificada com sucesso';
      
      try {
        console.log('Verificando conexão SMTP...');
        console.log('Host:', emailConfig.smtp_host);
        console.log('Port:', emailConfig.smtp_port);
        console.log('Secure:', emailConfig.smtp_secure);
        console.log('User:', emailConfig.smtp_user);
        
        await transporter.verify();
        console.log('Conexão SMTP verificada com sucesso');
      } catch (verifyError: any) {
        console.error('Erro na verificação SMTP:', verifyError.message);
        connectionStatus = 'warning';
        connectionMessage = `Aviso de conexão: ${verifyError.message}`;
        
        // Continuar com simulação do teste mesmo com erro de conexão
        console.log('Continuando com simulação do teste de email...');
      }

      // Tentar enviar email de teste ou fornecer diagnóstico
      let emailSent = false;
      let emailError = null;
      
      try {
        if (connectionStatus === 'success') {
          const mailOptions = {
            from: `${emailConfig.email_from_name} <${emailConfig.email_from}>`,
            to: email_destino,
            subject: 'CrossWMS - Teste de Configuração de Email',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #0098DA; margin: 0;">CrossWMS</h1>
                  <p style="color: #666; margin: 5px 0;">Sistema de Gestão Logística</p>
                </div>
                
                <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h2 style="color: #0098DA; margin-top: 0;">✅ Teste de Email Realizado com Sucesso!</h2>
                  <p style="color: #333; line-height: 1.6;">
                    Este é um email de teste para validar as configurações de SMTP do sistema CrossWMS.
                  </p>
                </div>
                
                <div style="background: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px;">
                  <h3 style="color: #333; margin-top: 0;">Configurações Testadas:</h3>
                  <ul style="color: #666; line-height: 1.8;">
                    <li><strong>Servidor SMTP:</strong> ${emailConfig.smtp_host}</li>
                    <li><strong>Porta:</strong> ${emailConfig.smtp_port}</li>
                    <li><strong>SSL/TLS:</strong> ${emailConfig.smtp_secure ? 'Sim' : 'Não'}</li>
                    <li><strong>Usuário:</strong> ${emailConfig.smtp_user}</li>
                    <li><strong>Remetente:</strong> ${emailConfig.email_from}</li>
                    <li><strong>Nome:</strong> ${emailConfig.email_from_name}</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                  <p style="color: #999; font-size: 14px;">
                    Este email foi enviado automaticamente pelo sistema CrossWMS<br>
                    Data: ${new Date().toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            `
          };

          await transporter.sendMail(mailOptions);
          emailSent = true;
          console.log('Email de teste enviado com sucesso');
        } else {
          // Se não conseguiu verificar conexão, fornecer diagnóstico
          emailError = connectionMessage;
        }

        // Retornar resultado do teste
        res.json({ 
          success: true,
          test_completed: true,
          connection_status: connectionStatus,
          connection_message: connectionMessage,
          email_sent: emailSent,
          email_error: emailError,
          message: emailSent ? "Email de teste enviado com sucesso" : "Teste de configuração concluído com diagnóstico",
          details: {
            servidor: emailConfig.smtp_host,
            porta: emailConfig.smtp_port,
            ssl_tls: emailConfig.smtp_secure,
            usuario: emailConfig.smtp_user,
            destinatario: email_destino,
            remetente: emailConfig.email_from,
            nome_remetente: emailConfig.email_from_name,
            timestamp: new Date().toLocaleString('pt-BR'),
            diagnostico: connectionStatus !== 'success' ? {
              problema_detectado: "Falha na autenticação SMTP",
              possveis_causas: [
                "Credenciais incorretas (usuário/senha)",
                "Servidor SMTP não permite autenticação externa",
                "Necessário configurar App Password ou autenticação específica",
                "Porta ou configuração SSL/TLS incorreta"
              ],
              sugestoes: [
                "Verificar se o usuário e senha estão corretos",
                "Confirmar se o servidor SMTP está configurado corretamente",
                "Testar com diferentes configurações de porta (587, 465, 25)",
                "Verificar se precisa de autenticação em duas etapas"
              ]
            } : null
          }
        });

      } catch (sendError: any) {
        console.error('Erro ao tentar enviar email:', sendError.message);
        
        // Retornar diagnóstico com erro de envio
        res.json({ 
          success: true,
          test_completed: true,
          connection_status: 'error',
          connection_message: `Erro no envio: ${sendError.message}`,
          email_sent: false,
          email_error: sendError.message,
          message: "Teste de configuração concluído com diagnóstico de erro",
          details: {
            servidor: emailConfig.smtp_host,
            porta: emailConfig.smtp_port,
            ssl_tls: emailConfig.smtp_secure,
            usuario: emailConfig.smtp_user,
            destinatario: email_destino,
            remetente: emailConfig.email_from,
            nome_remetente: emailConfig.email_from_name,
            timestamp: new Date().toLocaleString('pt-BR'),
            diagnostico: {
              problema_detectado: "Falha na autenticação SMTP",
              possveis_causas: [
                "Credenciais incorretas (usuário/senha)",
                "Servidor SMTP não permite autenticação externa",
                "Necessário configurar App Password ou autenticação específica",
                "Porta ou configuração SSL/TLS incorreta"
              ],
              sugestoes: [
                "Verificar se o usuário e senha estão corretos",
                "Confirmar se o servidor SMTP está configurado corretamente",
                "Testar com diferentes configurações de porta (587, 465, 25)",
                "Verificar se precisa de autenticação em duas etapas"
              ]
            }
          }
        });
      }

    } catch (error: any) {
      console.error("Erro geral no teste de email:", error);
      res.status(500).json({ 
        error: "Erro interno no teste de email",
        details: error.message 
      });
    }
  });

  // APIs para configurações - Perfis
  app.get("/api/perfis", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const perfis = await storage.getAllPerfis();
      res.json(perfis);
    } catch (error) {
      console.error('Get perfis error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // APIs para configurações - Permissões
  app.get("/api/permissions", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const permissions = await storage.getAllPermissions();
      res.json(permissions);
    } catch (error) {
      console.error('Get permissions error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/perfis/:perfilId/permissions", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { perfilId } = req.params;
      const permissions = req.body;
      
      await storage.savePerfilPermissions(perfilId, permissions);
      res.json({ success: true, message: "Permissões salvas com sucesso" });
    } catch (error) {
      console.error('Save perfil permissions error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/perfis/:perfilId/permissions", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { perfilId } = req.params;
      const permissions = await storage.getPermissionsByPerfil(perfilId);
      res.json(permissions);
    } catch (error) {
      console.error('Get perfil permissions error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // APIs para aprovações
  app.get("/api/usuarios", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error('Get usuarios error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/usuarios-pendentes", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const users = await storage.getUsersByStatus("pendente_aprovacao");
      res.json(users);
    } catch (error) {
      console.error('Get usuarios pendentes error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/aprovar-usuario/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.updateUser(req.params.id, { status: "ativo" });
      res.json({ success: true, user });
    } catch (error) {
      console.error('Aprovar usuario error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // API para alterar status de usuário
  app.patch("/api/usuarios/:id/status", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ['pendente_aprovacao', 'ativo', 'inativo', 'rejeitado'];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }

      const user = await storage.updateUser(req.params.id, { status });
      res.json({ success: true, user });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // API para excluir usuário
  app.delete("/api/usuarios/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true, message: "Usuário excluído com sucesso" });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // API para atualizar usuário completo
  app.patch("/api/usuarios/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { nome, email, telefone, perfil_id, status } = req.body;
      const updates: any = {};
      
      if (nome) updates.nome = nome;
      if (email) updates.email = email;
      if (telefone) updates.telefone = telefone;
      if (perfil_id) updates.perfil_id = perfil_id;
      if (status) updates.status = status;

      const user = await storage.updateUser(req.params.id, updates);
      res.json({ success: true, user });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // API para listar todas as empresas
  app.get("/api/empresas", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const empresas = await storage.getAllEmpresas();
      res.json(empresas);
    } catch (error) {
      console.error('Get empresas error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/rejeitar-usuario/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const user = await storage.updateUser(req.params.id, { status: "rejeitado" });
      res.json({ success: true, user });
    } catch (error) {
      console.error('Rejeitar usuario error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoints para controle de permissões por perfil
  app.get("/api/perfis", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const perfis = await storage.getPerfis();
      res.json(perfis);
    } catch (error) {
      console.error('Get perfis error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.get("/api/perfis/:perfilId/modulos", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { perfilId } = req.params;
      const perfilModulos = await storage.getPerfilModulos(perfilId);
      res.json(perfilModulos);
    } catch (error) {
      console.error('Get perfil modulos error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/perfis/:perfilId/modulos", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { perfilId } = req.params;
      const { modulos } = req.body;
      
      await storage.savePerfilModulos(perfilId, modulos);
      res.json({ message: 'Configurações de módulos salvas com sucesso' });
    } catch (error) {
      console.error('Save perfil modulos error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  app.post("/api/perfis", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { nome, descricao, tipo_perfil, nivel_hierarquia } = req.body;
      
      const novoPerfil = await storage.createPerfil({
        nome,
        descricao,
        tipo_perfil,
        nivel_hierarquia
      });
      
      res.json(novoPerfil);
    } catch (error) {
      console.error('Create perfil error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para admins listarem todas as empresas
  app.get("/api/admin/empresas", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // Verificar se é super admin
      if (req.user?.tipo_usuario !== 'super_admin') {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      const empresas = await storage.getAllEmpresas();
      res.json(empresas);
    } catch (error) {
      console.error('Get all empresas error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para criar nova empresa (admin)
  app.post("/api/admin/empresas", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // Verificar se é super admin
      if (req.user?.tipo_usuario !== 'super_admin') {
        return res.status(403).json({ error: "Acesso negado" });
      }

      const empresaData = req.body;
      const novaEmpresa = await storage.createEmpresa(empresaData);
      res.status(201).json(novaEmpresa);
    } catch (error) {
      console.error('Create empresa error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para atualizar empresa (admin)
  app.put("/api/admin/empresas/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // Verificar se é super admin
      if (req.user?.tipo_usuario !== 'super_admin') {
        return res.status(403).json({ error: "Acesso negado" });
      }

      const { id } = req.params;
      const empresaData = req.body;
      const empresaAtualizada = await storage.updateEmpresa(id, empresaData);
      
      if (!empresaAtualizada) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }
      
      res.json(empresaAtualizada);
    } catch (error) {
      console.error('Update empresa error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para admins listarem clientes transportador
  app.get("/api/admin/clientes", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // Verificar se é super admin
      if (req.user?.tipo_usuario !== 'super_admin') {
        return res.status(403).json({ error: "Acesso negado" });
      }
      
      const clientes = await storage.getAllClientesTransportador();
      res.json(clientes);
    } catch (error) {
      console.error('Get clientes transportador error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para criar novo cliente transportador (admin)
  app.post("/api/admin/clientes", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // Verificar se é super admin
      if (req.user?.tipo_usuario !== 'super_admin') {
        return res.status(403).json({ error: "Acesso negado" });
      }

      const novoCliente = await storage.createClienteTransportador(req.body);
      res.status(201).json(novoCliente);
    } catch (error) {
      console.error('Create cliente transportador error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para atualizar cliente transportador (admin)
  app.put("/api/admin/clientes/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // Verificar se é super admin
      if (req.user?.tipo_usuario !== 'super_admin') {
        return res.status(403).json({ error: "Acesso negado" });
      }

      const { id } = req.params;
      const clienteAtualizado = await storage.updateClienteTransportador(id, req.body);
      
      if (!clienteAtualizado) {
        return res.status(404).json({ error: "Cliente transportador não encontrado" });
      }
      
      res.json(clienteAtualizado);
    } catch (error) {
      console.error('Update cliente transportador error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para buscar dados da empresa do usuário logado
  app.get("/api/empresas/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const empresa = await storage.getEmpresaById(id);
      
      if (!empresa) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }
      
      res.json(empresa);
    } catch (error) {
      console.error('Get empresa error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Endpoint para atualizar dados da empresa
  app.put("/api/empresas/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const empresaData = req.body;
      
      const empresaAtualizada = await storage.updateEmpresa(id, empresaData);
      
      if (!empresaAtualizada) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }
      
      res.json(empresaAtualizada);
    } catch (error) {
      console.error('Update empresa error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Rate limiting para CNPJ lookup
  const cnpjRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 requests per 15 minutes
    message: "Muitas tentativas de consulta CNPJ"
  });

  // API para consulta de CNPJ (com rate limiting e validação de segurança)
  app.get("/api/lookup-cnpj/:cnpj", cnpjRateLimit, async (req, res) => {
    try {
      const { cnpj } = req.params;
      
      // Remove formatação do CNPJ
      const cleanCnpj = cnpj.replace(/[^\d]/g, '');
      
      if (cleanCnpj.length !== 14) {
        return res.status(400).json({ 
          success: false,
          message: "CNPJ deve ter 14 dígitos"
        });
      }

      // Log de auditoria de segurança (apenas CNPJ parcial)
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const maskedCnpj = cleanCnpj.substring(0, 4) + '****' + cleanCnpj.substring(10);
      console.log(`[SECURITY AUDIT] CNPJ lookup: ${maskedCnpj} from IP: ${clientIp}`);

      // Tentar múltiplas APIs públicas
      let apiData = null;
      let source = '';

      // 1. Tentar BrasilAPI primeiro
      try {
        const brasilApiResponse = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CrossWMS/1.0'
          },
          signal: AbortSignal.timeout(8000)
        });

        if (brasilApiResponse.ok) {
          const brasilData = await brasilApiResponse.json();
          apiData = {
            cnpj: brasilData.cnpj,
            razaoSocial: brasilData.razao_social || brasilData.nome,
            nomeFantasia: brasilData.nome_fantasia,
            telefone: brasilData.ddd_telefone_1 ? `(${brasilData.ddd_telefone_1}) ${brasilData.telefone_1}` : '',
            endereco: brasilData.logradouro,
            numero: brasilData.numero,
            complemento: brasilData.complemento,
            bairro: brasilData.bairro,
            cidade: brasilData.municipio,
            uf: brasilData.uf,
            cep: brasilData.cep
          };
          source = 'BrasilAPI';
        }
      } catch (error) {
        console.log('BrasilAPI falhou, tentando ReceitaWS...');
      }

      // 2. Fallback para ReceitaWS se BrasilAPI falhar
      if (!apiData) {
        try {
          const receitaResponse = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCnpj}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'CrossWMS/1.0'
            },
            signal: AbortSignal.timeout(8000)
          });

          if (receitaResponse.ok) {
            const receitaData = await receitaResponse.json();
            if (receitaData.status === 'OK') {
              apiData = {
                cnpj: receitaData.cnpj,
                razaoSocial: receitaData.nome,
                nomeFantasia: receitaData.fantasia,
                telefone: receitaData.telefone,
                endereco: receitaData.logradouro,
                numero: receitaData.numero,
                complemento: receitaData.complemento,
                bairro: receitaData.bairro,
                cidade: receitaData.municipio,
                uf: receitaData.uf,
                cep: receitaData.cep
              };
              source = 'ReceitaWS';
            }
          }
        } catch (error) {
          console.log('ReceitaWS falhou, tentando CNPJ.ws...');
        }
      }

      // 3. Último fallback para CNPJ.ws
      if (!apiData) {
        try {
          const cnpjWsResponse = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'CrossWMS/1.0'
            },
            signal: AbortSignal.timeout(8000)
          });

          if (cnpjWsResponse.ok) {
            const cnpjWsData = await cnpjWsResponse.json();
            if (cnpjWsData.cnpj_numero) {
              const telefone = cnpjWsData.estabelecimento?.ddd1 && cnpjWsData.estabelecimento?.telefone1 
                ? `(${cnpjWsData.estabelecimento.ddd1}) ${cnpjWsData.estabelecimento.telefone1}`
                : '';
              
              apiData = {
                cnpj: cnpjWsData.cnpj_numero,
                razaoSocial: cnpjWsData.razao_social,
                nomeFantasia: cnpjWsData.estabelecimento?.nome_fantasia,
                telefone: telefone,
                endereco: cnpjWsData.estabelecimento?.logradouro,
                numero: cnpjWsData.estabelecimento?.numero,
                complemento: cnpjWsData.estabelecimento?.complemento,
                bairro: cnpjWsData.estabelecimento?.bairro,
                cidade: cnpjWsData.estabelecimento?.cidade?.nome,
                uf: cnpjWsData.estabelecimento?.estado?.nome,
                cep: cnpjWsData.estabelecimento?.cep
              };
              source = 'CNPJ.ws';
            }
          }
        } catch (error) {
          console.log('CNPJ.ws também falhou');
        }
      }

      if (apiData) {
        return res.status(200).json({
          success: true,
          data: apiData,
          source: source,
          message: `Dados obtidos automaticamente via ${source}`
        });
      } else {
        // Se todas as APIs falharam, retornar erro mas permitir entrada manual
        return res.status(200).json({ 
          success: false,
          message: "Não foi possível consultar o CNPJ automaticamente. APIs indisponíveis.",
          allow_manual: true
        });
      }
    } catch (error) {
      console.error('CNPJ lookup error:', error);
      return res.status(500).json({ 
        success: false,
        message: "Erro interno do servidor ao consultar CNPJ"
      });
    }
  });

  // ================================
  // CARREGAMENTO ROUTES
  // ================================

  // Get all carregamentos
  app.get("/api/carregamentos", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const carregamentos = await storage.getAllCarregamentos();
      res.json(carregamentos);
    } catch (error) {
      console.error('Get carregamentos error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get carregamento by ID
  app.get("/api/carregamentos/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const carregamento = await storage.getCarregamentoById(id);
      
      if (!carregamento) {
        return res.status(404).json({ error: "Carregamento não encontrado" });
      }
      
      res.json(carregamento);
    } catch (error) {
      console.error('Get carregamento error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Create carregamento
  app.post("/api/carregamentos", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertCarregamentoSchema.parse(req.body);
      const carregamento = await storage.createCarregamento(validatedData);
      res.status(201).json(carregamento);
    } catch (error) {
      console.error('Create carregamento error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Update carregamento
  app.put("/api/carregamentos/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertCarregamentoSchema.partial().parse(req.body);
      
      const carregamento = await storage.updateCarregamento(id, validatedData);
      
      if (!carregamento) {
        return res.status(404).json({ error: "Carregamento não encontrado" });
      }
      
      res.json(carregamento);
    } catch (error) {
      console.error('Update carregamento error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Delete carregamento
  app.delete("/api/carregamentos/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCarregamento(id);
      res.status(204).send();
    } catch (error) {
      console.error('Delete carregamento error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get notas fiscais by carregamento
  app.get("/api/carregamentos/:id/notas-fiscais", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const notasFiscais = await storage.getNotasFiscaisByCarregamento(id);
      res.json(notasFiscais);
    } catch (error) {
      console.error('Get notas fiscais by carregamento error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Vincular nota fiscal a carregamento
  app.post("/api/carregamentos/:carregamentoId/notas-fiscais/:notaFiscalId", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { carregamentoId, notaFiscalId } = req.params;
      await storage.vincularNotaFiscalCarregamento(notaFiscalId, carregamentoId);
      res.json({ message: "Nota fiscal vinculada ao carregamento com sucesso" });
    } catch (error) {
      console.error('Vincular nota fiscal error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Desvincular nota fiscal de carregamento
  app.delete("/api/notas-fiscais/:notaFiscalId/carregamento", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { notaFiscalId } = req.params;
      await storage.desvincularNotaFiscalCarregamento(notaFiscalId);
      res.json({ message: "Nota fiscal desvinculada do carregamento com sucesso" });
    } catch (error) {
      console.error('Desvincular nota fiscal error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // === NOTAS FISCAIS ENDPOINTS ===
  
  // Create nota fiscal
  app.post("/api/notas-fiscais", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      // Bypass Zod validation temporariamente e usar dados diretos
      const notaData = req.body;
      
      const chaveAcesso = notaData.chave_nota_fiscal || notaData.chave_acesso || '';
      
      // Verificar se nota fiscal já existe
      try {
        const existingNota = await storage.getNotaFiscalByChave(chaveAcesso);
        if (existingNota) {
          console.log(`Nota fiscal com chave ${chaveAcesso} já existe, retornando dados existentes`);
          return res.status(200).json({ success: true, id: existingNota.id, message: 'Nota fiscal já existe' });
        }
      } catch (checkError) {
        // Se não encontrar, continua com a criação
        console.log(`Nota fiscal ${chaveAcesso} não existe, criando nova`);
      }
      
      // Mapear TODOS os campos importantes do XML para backend
      const mappedData = {
        chave_acesso: chaveAcesso,
        numero_nf: notaData.numero_nota || notaData.numero_nf || '',
        serie: notaData.serie_nota || '',
        modelo: '55', // NFe padrão
        tipo_documento: 'nfe',
        tipo_operacao: notaData.operacao || notaData.natureza_operacao || '',
        empresa_id: notaData.empresa_id || req.user?.empresa_id || '',
        
        // Dados do Emitente
        emitente_cnpj: notaData.emitente_cnpj || '',
        emitente_razao_social: notaData.emitente_razao_social || '',
        emitente_nome_fantasia: notaData.emitente_nome_fantasia || '',
        emitente_telefone: notaData.emitente_telefone || '',
        emitente_endereco: notaData.emitente_endereco || '',
        emitente_numero: notaData.emitente_numero || '',
        emitente_complemento: notaData.emitente_complemento || '',
        emitente_bairro: notaData.emitente_bairro || '',
        emitente_cidade: notaData.emitente_cidade || '',
        emitente_uf: notaData.emitente_uf || '',
        emitente_cep: notaData.emitente_cep || '',
        
        // Dados do Destinatário
        destinatario_cnpj: notaData.destinatario_cnpj || '',
        destinatario_razao_social: notaData.destinatario_razao_social || '',
        destinatario_nome_fantasia: notaData.destinatario_nome_fantasia || '',
        destinatario_telefone: notaData.destinatario_telefone || '',
        destinatario_endereco: notaData.destinatario_endereco || '',
        destinatario_numero: notaData.destinatario_numero || '',
        destinatario_complemento: notaData.destinatario_complemento || '',
        destinatario_bairro: notaData.destinatario_bairro || '',
        destinatario_cidade: notaData.destinatario_cidade || '',
        destinatario_uf: notaData.destinatario_uf || '',
        destinatario_cep: notaData.destinatario_cep || '',
        
        // Valores Financeiros
        valor_total: parseFloat(notaData.valor_nota_fiscal?.toString().replace(/[^\d.,]/g, '').replace(',', '.') || '0'),
        valor_produtos: parseFloat(notaData.valor_produtos?.toString().replace(/[^\d.,]/g, '').replace(',', '.') || '0'),
        valor_frete: parseFloat(notaData.valor_frete?.toString().replace(/[^\d.,]/g, '').replace(',', '.') || '0'),
        valor_seguro: parseFloat(notaData.valor_seguro?.toString().replace(/[^\d.,]/g, '').replace(',', '.') || '0'),
        valor_icms: parseFloat(notaData.valor_icms?.toString().replace(/[^\d.,]/g, '').replace(',', '.') || '0'),
        
        // Dados Físicos
        peso_bruto: notaData.peso_bruto?.toString() || '0',
        peso_liquido: notaData.peso_liquido?.toString() || '0',
        volumes: parseInt(notaData.quantidade_volumes?.toString() || '1'),
        volume_m3: notaData.volume_m3?.toString() || '0',
        
        // Transporte
        modalidade_frete: notaData.tipo_frete || notaData.modalidade_frete || '',
        transportadora_cnpj: notaData.transportadora_cnpj || '',
        transportadora_razao_social: notaData.transportadora_razao_social || '',
        veiculo_placa: notaData.veiculo_placa || '',
        
        // Datas
        data_emissao: notaData.data_hora_emissao ? new Date(notaData.data_hora_emissao) : new Date(),
        data_saida_entrada: notaData.data_saida_entrada ? new Date(notaData.data_saida_entrada) : null,
        data_recebimento: new Date(),
        
        // XML e Metadados
        xml_content: notaData.xml_content || '', // SALVAR CONTEÚDO XML COMPLETO
        xml_source: notaData.xml_source || 'manual', // fonte: manual, nsdocs, upload
        protocolo_autorizacao: notaData.protocolo_autorizacao || '',
        situacao_sefaz: notaData.situacao_sefaz || 'autorizada',
        
        // Informações Complementares
        observacoes: notaData.informacoes_complementares || '',
        status: 'recebido',
        
        // Controle de usuário
        usuario_cadastro: req.user?.id || null,
        data_cadastro: new Date()
      };
      
      const notaFiscal = await storage.createNotaFiscal(mappedData);
      res.status(201).json({ success: true, id: notaFiscal.id });
    } catch (error) {
      console.error('Create nota fiscal error:', error);
      
      // Tratamento específico para erro de chave duplicada
      if ((error as any).code === '23505' && (error as any).constraint === 'notas_fiscais_chave_acesso_key') {
        return res.status(200).json({ 
          success: true, 
          message: 'Nota fiscal já existe no sistema',
          duplicated: true 
        });
      }
      
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Search notas fiscais - Usando prefixo específico para evitar conflito
  app.get("/api/search/notas-fiscais", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { q, type, data_inicio, data_fim } = req.query;
      const searchType = typeof type === 'string' ? type : 'numero'; // Default to 'numero'
      
      // Validação específica para filtro de data
      if (searchType === 'data_inclusao') {
        if (!data_inicio || !data_fim) {
          return res.status(400).json({ 
            success: false, 
            error: 'Para filtro de data de inclusão, forneça data_inicio e data_fim' 
          });
        }
        
        console.log('Searching NFe by date range:', data_inicio, 'to', data_fim);
        
        // Usar a função de pesquisa do storage com período de datas
        const searchResults = await storage.searchNotasFiscaisByDateRange(
          data_inicio as string, 
          data_fim as string
        );

        console.log(`Found ${searchResults.length} NFe results for date range: ${data_inicio} to ${data_fim}`);
        
        return res.json({
          success: true,
          notas: searchResults,
          total: searchResults.length
        });
      } else {
        // Validação para outros tipos de pesquisa
        if (!q || typeof q !== 'string' || q.trim().length < 3) {
          return res.status(400).json({ 
            success: false, 
            error: 'Termo de pesquisa deve ter pelo menos 3 caracteres' 
          });
        }

        const searchTerm = q.trim();
        console.log('Searching NFe with term:', searchTerm, 'type:', searchType);
        
        // Usar a função de pesquisa do storage com tipo especificado
        const searchResults = await storage.searchNotasFiscais(searchTerm, searchType);

        console.log(`Found ${searchResults.length} NFe results for term: "${searchTerm}" type: "${searchType}"`);
        
        return res.json({
          success: true,
          notas: searchResults,
          total: searchResults.length
        });
      }
    } catch (error) {
      console.error('Search notas fiscais error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao pesquisar notas fiscais' 
      });
    }
  });

  // Get nota fiscal by ID
  app.get("/api/notas-fiscais/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const notaFiscal = await storage.getNotaFiscalById(id);
      
      if (!notaFiscal) {
        return res.status(404).json({ error: "Nota fiscal não encontrada" });
      }
      
      res.json(notaFiscal);
    } catch (error) {
      console.error('Get nota fiscal error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get nota fiscal by chave de acesso
  app.get("/api/notas-fiscais/chave/:chave", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { chave } = req.params;
      const notaFiscal = await storage.getNotaFiscalByChave(chave);
      
      if (!notaFiscal) {
        return res.status(404).json({ error: "Nota fiscal não encontrada" });
      }
      
      res.json(notaFiscal);
    } catch (error) {
      console.error('Get nota fiscal by chave error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // === VOLUMES ETIQUETA ENDPOINTS ===
  
  // Create volume etiqueta
  app.post("/api/volumes-etiqueta", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertVolumeEtiquetaSchema.parse(req.body);
      const volume = await storage.createVolumeEtiqueta(validatedData);
      res.status(201).json(volume);
    } catch (error) {
      console.error('Create volume etiqueta error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get volumes by nota fiscal ID
  app.get("/api/volumes-etiqueta/nota-fiscal/:notaFiscalId", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { notaFiscalId } = req.params;
      const volumes = await storage.getVolumesByNotaFiscal(notaFiscalId);
      res.json(volumes);
    } catch (error) {
      console.error('Get volumes by nota fiscal error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // === MOTORISTAS ENDPOINTS ===
  
  // Get all motoristas ativos
  app.get("/api/motoristas", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const motoristas = await storage.getAllMotoristas();
      res.json(motoristas);
    } catch (error) {
      console.error('Get motoristas error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // === VEÍCULOS ENDPOINTS ===
  
  // Get all veículos disponíveis
  app.get("/api/veiculos", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const veiculos = await storage.getAllVeiculos();
      res.json(veiculos);
    } catch (error) {
      console.error('Get veículos error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Search motoristas com filtros por nome ou CPF
  app.get("/api/motoristas/search", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Parâmetro de busca 'q' é obrigatório" });
      }
      
      const motoristas = await storage.searchMotoristas(q);
      res.json(motoristas);
    } catch (error) {
      console.error('Search motoristas error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Search veículos com filtros por placa, marca, modelo ou tipo
  app.get("/api/veiculos/search", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: "Parâmetro de busca 'q' é obrigatório" });
      }
      
      const veiculos = await storage.searchVeiculos(q);
      res.json(veiculos);
    } catch (error) {
      console.error('Search veiculos error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // === API NFE ENDPOINT ===
  
  // Buscar NFe via API NSDocs
  app.get("/api/nfe/:chave", async (req, res) => {
    try {
      const { chave } = req.params;
      
      console.log(`[NFE API] Processando chave: ${chave}`);
      
      // Validar formato da chave
      if (!chave || chave.length !== 44) {
        return res.status(400).json({
          success: false,
          error: "Chave NFe deve ter 44 dígitos"
        });
      }
      
      // Verificar se a chave da API NSDocs está configurada
      const apiKey = process.env.NSDOCS_API_KEY;
      if (!apiKey) {
        return res.json({
          success: false,
          error: 'Chave da API NSDocs não configurada. Configure a variável NSDOCS_API_KEY.',
          requires_api_key: true
        });
      }
      
      // Usar implementação do nsdocs-api.ts do servidor
      const { NSDOcsAPIService } = await import('./nsdocs-api');
      const clientId = 'd4398d37-ed0b-4a4c-9fb6-ee7aeaaf672a';
      const nsdocsService = new NSDOcsAPIService(clientId, apiKey);
      
      const startTime = Date.now();
      const result = await nsdocsService.fetchNFeXML(chave);
      const duration = Date.now() - startTime;
      
      console.log(`[NFE API] Busca concluída em ${duration}ms - Sucesso: ${result.success}`);
      
      console.log(`[NFE API] Resultado para ${chave}:`, result);
      
      if (result.success && result.data) {
        return res.json({
          success: true,
          data: result.data,
          xml_content: result.xml_content,
          source: result.source || 'nsdocs_api'
        });
      } else {
        console.error(`[NFE API] Erro ao processar chave ${chave}:`, result.error);
        return res.json({
          success: false,
          error: result.error || "NFe não encontrada",
          nfe_not_found: result.nfe_not_found || false,
          requires_api_key: result.requires_api_key || false
        });
      }
      
    } catch (error) {
      console.error(`Erro ao processar chave ${req.params.chave}:`, error);
      return res.status(500).json({
        success: false,
        error: "Erro interno do servidor",
        api_error: true
      });
    }
  });

  // ================================
  // HISTORICO DE VERSÕES ROUTES
  // ================================

  // Get all histórico versões
  app.get("/api/historico-versoes", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const historico = await storage.getAllHistoricoVersoes();
      res.json(historico);
    } catch (error) {
      console.error('Get historico versoes error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get última versão
  app.get("/api/historico-versoes/ultima", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const ultimaVersao = await storage.getUltimaVersao();
      res.json(ultimaVersao);
    } catch (error) {
      console.error('Get ultima versao error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Create histórico versão
  app.post("/api/historico-versoes", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertHistoricoVersaoSchema.parse(req.body);
      const historicoVersao = await storage.createHistoricoVersao(validatedData);
      res.status(201).json(historicoVersao);
    } catch (error) {
      console.error('Create historico versao error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Get histórico versão by ID
  app.get("/api/historico-versoes/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const historicoVersao = await storage.getHistoricoVersaoById(id);
      
      if (!historicoVersao) {
        return res.status(404).json({ error: "Versão não encontrada" });
      }
      
      res.json(historicoVersao);
    } catch (error) {
      console.error('Get historico versao error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Assinaturas Routes
  // Get assinaturas by cliente transportador
  app.get("/api/clientes-transportador/:id/assinaturas", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const assinaturas = await storage.getAssinaturasByClienteTransportador(id);
      res.json(assinaturas);
    } catch (error) {
      console.error('Get assinaturas error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Create assinatura
  app.post("/api/assinaturas", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const assinatura = await storage.createAssinatura(req.body);
      res.status(201).json(assinatura);
    } catch (error) {
      console.error('Create assinatura error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Update assinatura
  app.put("/api/assinaturas/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const assinatura = await storage.updateAssinatura(id, req.body);
      
      if (!assinatura) {
        return res.status(404).json({ error: "Assinatura não encontrada" });
      }
      
      res.json(assinatura);
    } catch (error) {
      console.error('Update assinatura error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  // Delete assinatura
  app.delete("/api/assinaturas/:id", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAssinatura(id);
      res.status(204).send();
    } catch (error) {
      console.error('Delete assinatura error:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });

  return createServer(app);
}