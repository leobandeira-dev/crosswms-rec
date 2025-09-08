// Script de teste independente para validar configurações SMTP
import nodemailer from 'nodemailer';

async function testEmailConfig() {
  const config = {
    host: 'smtp.titan.email',
    port: 587,
    secure: false,
    auth: {
      user: 'suporte@crosswms.com.br',
      pass: 'Crosswms@2025'
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  console.log('Testando configuração SMTP...');
  console.log('Host:', config.host);
  console.log('Port:', config.port);
  console.log('User:', config.auth.user);

  try {
    const transporter = nodemailer.createTransport(config);
    
    // Verificar conexão
    console.log('Verificando conexão...');
    await transporter.verify();
    console.log('✅ Conexão SMTP verificada com sucesso!');

    // Enviar email de teste
    console.log('Enviando email de teste...');
    const mailOptions = {
      from: 'Sistema CrossWMS <suporte@crosswms.com.br>',
      to: 'leonardobandeir@gmail.com',
      subject: 'CrossWMS - Teste de Configuração SMTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0098DA;">CrossWMS - Teste Realizado!</h1>
          <p>Este email confirma que as configurações SMTP estão funcionando corretamente.</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso!');
    console.log('Message ID:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      config: {
        host: config.host,
        port: config.port,
        user: config.auth.user
      }
    };

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    
    // Análise detalhada do erro
    if (error.code === 'EAUTH') {
      console.log('\n📋 Diagnóstico:');
      console.log('- Problema: Falha na autenticação SMTP');
      console.log('- Possíveis causas:');
      console.log('  • Credenciais incorretas');
      console.log('  • Servidor não permite autenticação externa');
      console.log('  • Necessário App Password ou 2FA');
      console.log('- Sugestões:');
      console.log('  • Verificar usuário e senha');
      console.log('  • Testar diferentes portas (465, 25)');
      console.log('  • Verificar configurações do provedor');
    }
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      config: {
        host: config.host,
        port: config.port,
        user: config.auth.user
      }
    };
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testEmailConfig()
    .then(result => {
      console.log('\n📊 Resultado final:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erro crítico:', error);
      process.exit(1);
    });
}

module.exports = { testEmailConfig };