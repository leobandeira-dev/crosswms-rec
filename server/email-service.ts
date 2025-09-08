import nodemailer from 'nodemailer';
import { createTransporter } from './email-config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      this.transporter = await createTransporter();
      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.error('Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Template para aprovação de usuário
  async sendApprovalNotification(userEmail: string, userName: string, userType: string): Promise<boolean> {
    const template = this.getApprovalTemplate(userName, userType);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Template para aprovação concedida
  async sendApprovalGranted(userEmail: string, userName: string, userType: string): Promise<boolean> {
    const template = this.getApprovalGrantedTemplate(userName, userType);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Template para cadastro realizado
  async sendRegistrationConfirmation(userEmail: string, userName: string, userType: string): Promise<boolean> {
    const template = this.getRegistrationTemplate(userName, userType);
    return this.sendEmail({
      to: userEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  // Template para notificação de administrador sobre novo cadastro
  async sendAdminNotification(adminEmail: string, userName: string, userType: string, userEmail: string): Promise<boolean> {
    const template = this.getAdminNotificationTemplate(userName, userType, userEmail);
    return this.sendEmail({
      to: adminEmail,
      subject: template.subject,
      html: template.html,
      text: template.text
    });
  }

  private getRegistrationTemplate(userName: string, userType: string): EmailTemplate {
    const typeNames = {
      transportador: 'Operador Logístico',
      cliente: 'Cliente Corporativo',
      fornecedor: 'Fornecedor Estratégico'
    };

    const typeName = typeNames[userType as keyof typeof typeNames] || userType;

    return {
      subject: `CrossWMS - Cadastro realizado com sucesso`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background-color: #0098DA; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
            .button { display: inline-block; background-color: #0098DA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CrossWMS</h1>
              <p>Sistema de Gestão Logística</p>
            </div>
            <div class="content">
              <h2>Cadastro Realizado com Sucesso!</h2>
              <p>Olá <strong>${userName}</strong>,</p>
              <p>Seu cadastro como <strong>${typeName}</strong> foi realizado com sucesso no sistema CrossWMS.</p>
              
              <h3>Próximos Passos:</h3>
              <ul>
                <li>Aguarde a aprovação do seu cadastro</li>
                <li>Você receberá um e-mail quando o acesso for liberado</li>
                <li>Em caso de dúvidas, entre em contato com o suporte</li>
              </ul>

              <p>Obrigado por escolher o CrossWMS!</p>
            </div>
            <div class="footer">
              <p>© 2025 CrossWMS - Sistema de Gestão Logística</p>
              <p>Este é um e-mail automático, não responda a esta mensagem.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `CrossWMS - Cadastro realizado\n\nOlá ${userName},\n\nSeu cadastro como ${typeName} foi realizado com sucesso. Aguarde a aprovação para acessar o sistema.\n\nObrigado por escolher o CrossWMS!`
    };
  }

  private getApprovalTemplate(userName: string, userType: string): EmailTemplate {
    const typeNames = {
      transportador: 'Operador Logístico',
      cliente: 'Cliente Corporativo', 
      fornecedor: 'Fornecedor Estratégico'
    };

    const typeName = typeNames[userType as keyof typeof typeNames] || userType;

    return {
      subject: `CrossWMS - Novo cadastro aguardando aprovação`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background-color: #ffc107; color: #212529; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
            .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CrossWMS</h1>
              <p>Novo cadastro pendente</p>
            </div>
            <div class="content">
              <h2>Novo Cadastro Aguardando Aprovação</h2>
              <p>Um novo usuário se cadastrou no sistema:</p>
              
              <div class="alert">
                <strong>Nome:</strong> ${userName}<br>
                <strong>Tipo:</strong> ${typeName}
              </div>

              <p>Acesse o sistema para revisar e aprovar este cadastro.</p>
            </div>
            <div class="footer">
              <p>© 2025 CrossWMS - Sistema de Gestão Logística</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `CrossWMS - Novo cadastro\n\nNovo usuário: ${userName}\nTipo: ${typeName}\n\nAcesse o sistema para aprovar.`
    };
  }

  private getApprovalGrantedTemplate(userName: string, userType: string): EmailTemplate {
    const typeNames = {
      transportador: 'Operador Logístico',
      cliente: 'Cliente Corporativo',
      fornecedor: 'Fornecedor Estratégico'
    };

    const typeName = typeNames[userType as keyof typeof typeNames] || userType;

    return {
      subject: `CrossWMS - Acesso aprovado!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background-color: #28a745; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
            .button { display: inline-block; background-color: #0098DA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CrossWMS</h1>
              <p>Acesso Aprovado!</p>
            </div>
            <div class="content">
              <h2>Seu acesso foi aprovado!</h2>
              <p>Olá <strong>${userName}</strong>,</p>
              <p>Parabéns! Seu cadastro como <strong>${typeName}</strong> foi aprovado.</p>
              
              <p>Agora você pode acessar o sistema CrossWMS com suas credenciais.</p>

              <a href="${process.env.FRONTEND_URL || 'https://crosswms.com.br'}/login" class="button">Acessar Sistema</a>

              <h3>Recursos Disponíveis:</h3>
              <ul>
                <li>Dashboard executivo</li>
                <li>Gestão de operações logísticas</li>
                <li>Relatórios em tempo real</li>
                <li>Documentação digital</li>
              </ul>

              <p>Bem-vindo ao CrossWMS!</p>
            </div>
            <div class="footer">
              <p>© 2025 CrossWMS - Sistema de Gestão Logística</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `CrossWMS - Acesso aprovado!\n\nOlá ${userName},\n\nSeu cadastro como ${typeName} foi aprovado! Agora você pode acessar o sistema.\n\nBem-vindo ao CrossWMS!`
    };
  }

  private getAdminNotificationTemplate(userName: string, userType: string, userEmail: string): EmailTemplate {
    const typeNames = {
      transportador: 'Operador Logístico',
      cliente: 'Cliente Corporativo',
      fornecedor: 'Fornecedor Estratégico'
    };

    const typeName = typeNames[userType as keyof typeof typeNames] || userType;

    return {
      subject: `CrossWMS - Novo cadastro de ${typeName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background-color: #6f42c1; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
            .info-box { background-color: #e9ecef; padding: 20px; border-radius: 4px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CrossWMS Admin</h1>
              <p>Notificação de novo cadastro</p>
            </div>
            <div class="content">
              <h2>Novo Cadastro Realizado</h2>
              <p>Um novo usuário se cadastrou no sistema e aguarda aprovação:</p>
              
              <div class="info-box">
                <strong>Nome:</strong> ${userName}<br>
                <strong>E-mail:</strong> ${userEmail}<br>
                <strong>Tipo de Usuário:</strong> ${typeName}
              </div>

              <p>Acesse o painel administrativo para revisar e aprovar este cadastro.</p>
            </div>
            <div class="footer">
              <p>© 2025 CrossWMS - Sistema de Gestão Logística</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `CrossWMS Admin - Novo cadastro\n\nNome: ${userName}\nE-mail: ${userEmail}\nTipo: ${typeName}\n\nAcesse o painel para aprovar.`
    };
  }

  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }
}

// Instância singleton do serviço de e-mail
export const emailService = new EmailService();