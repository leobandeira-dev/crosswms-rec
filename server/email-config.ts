import nodemailer from 'nodemailer';

export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized: boolean;
  };
}

// Configuração padrão para Hostgator
export const getHostgatorConfig = (): SMTPConfig => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST;

  if (!emailUser || !emailPass || !emailHost) {
    throw new Error('EMAIL_USER, EMAIL_PASS e EMAIL_HOST devem ser configurados nas variáveis de ambiente');
  }

  // Validar se EMAIL_HOST não é um endereço de e-mail
  if (emailHost.includes('@')) {
    throw new Error('EMAIL_HOST deve ser o servidor SMTP (ex: mail.seudominio.com.br), não um endereço de e-mail');
  }

  return {
    host: emailHost,
    port: 587, // Porta padrão Hostgator para SMTP com STARTTLS
    secure: false, // true para 465, false para outras portas
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false // Para evitar problemas com certificados auto-assinados
    }
  };
};

// Configurações alternativas para diferentes provedores
export const getEmailConfig = (provider: string = 'hostgator'): SMTPConfig => {
  switch (provider.toLowerCase()) {
    case 'hostgator':
      return getHostgatorConfig();
    
    case 'gmail':
      return {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER!,
          pass: process.env.EMAIL_PASS!
        }
      };
    
    case 'outlook':
      return {
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER!,
          pass: process.env.EMAIL_PASS!
        }
      };
    
    default:
      return getHostgatorConfig();
  }
};

export const createTransporter = async (provider: string = 'hostgator') => {
  const config = getEmailConfig(provider);
  
  const transporter = nodemailer.createTransport(config);
  
  // Verificar conexão
  try {
    await transporter.verify();
    console.log(`Email transporter configurado com sucesso para ${provider}`);
    return transporter;
  } catch (error) {
    console.error(`Erro ao configurar email transporter para ${provider}:`, error);
    throw error;
  }
};

// Função para testar configuração de e-mail
export const testEmailConfig = async (provider: string = 'hostgator'): Promise<boolean> => {
  try {
    const transporter = await createTransporter(provider);
    console.log('Configuração de e-mail testada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro no teste de configuração de e-mail:', error);
    return false;
  }
};