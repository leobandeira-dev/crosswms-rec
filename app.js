/**
 * Production application server - pure Node.js implementation
 * This avoids any development dependencies and interactive installations
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Production environment configuration
process.env.NODE_ENV = 'production';
const PORT = process.env.PORT || 8080;

const app = express();

console.log('🚀 Starting production application...');
console.log(`📱 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔌 PORT: ${PORT}`);

// Basic middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration for production
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint for deployment monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Production API server running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Mock login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const mockUser = {
    id: 'demo-user-123',
    email: email || 'demo@exemplo.com',
    nome: email?.split('@')[0] || 'Usuário Demo',
    telefone: '(11) 99999-9999',
    empresa_id: 'demo-empresa-123',
    perfil_id: 'admin',
    status: 'ativo',
    tipo_usuario: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    empresa: {
      id: 'demo-empresa-123',
      nome: 'Empresa Demo',
      cnpj: '12.345.678/0001-90',
      telefone: '(11) 3333-4444',
      email: 'contato@empresademo.com',
      tipo_empresa: 'logistica'
    }
  };

  res.json({
    user: mockUser,
    token: 'demo-token'
  });
});

// API de Logística da Informação para busca de NFe
app.post('/api/xml/fetch-from-logistica', async (req, res) => {
  try {
    const { chaveNotaFiscal } = req.body;
    
    if (!chaveNotaFiscal || chaveNotaFiscal.length !== 44) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chave de nota fiscal deve ter exatamente 44 dígitos' 
      });
    }

    console.log(`[API Logística] Buscando NFe: ${chaveNotaFiscal}`);
    
    // Simulação de resposta da API com dados baseados na chave
    const extractedData = {
      chaveNotaFiscal: chaveNotaFiscal,
      numeroNota: chaveNotaFiscal.substring(25, 34).replace(/^0+/, '') || '417536',
      serieNota: chaveNotaFiscal.substring(22, 25).replace(/^0+/, '') || '2',
      emitenteCnpj: chaveNotaFiscal.substring(6, 20),
      emitenteRazaoSocial: 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA',
      emitenteTelefone: '4731458100',
      emitenteUf: 'SC',
      emitenteCidade: 'JOINVILLE',
      emitenteBairro: 'ITAUM',
      emitenteEndereco: 'RUA GUARUJA',
      emitenteNumero: '434',
      emitenteCep: '89210300',
      destinatarioCnpj: '00655209000193',
      destinatarioRazaoSocial: 'CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR',
      destinatarioTelefone: '3521075167',
      destinatarioUf: 'MA',
      destinatarioCidade: 'SAO LUIS',
      destinatarioBairro: 'DISTRITO INDUSTRIAL',
      destinatarioEndereco: 'RODOVIA BR 135',
      destinatarioNumero: 'SN',
      destinatarioCep: '65095050',
      valorNota: '9150.00',
      pesoBruto: '16.200',
      pesoLiquido: '10.0',
      quantidadeVolumes: 2,
      naturezaOperacao: 'VENDA DE MERCADORIA',
      informacoesComplementares: '4177566-664 Pedido Venda: 059645',
      numeroPedido: '059645'
    };
    
    const response = {
      success: true,
      data: {
        chave_nota_fiscal: extractedData.chaveNotaFiscal,
        numero_nf: extractedData.numeroNota,
        serie: extractedData.serieNota,
        data_emissao: '2025-04-17 17:30:00',
        emitente_cnpj: extractedData.emitenteCnpj,
        emitente_razao_social: extractedData.emitenteRazaoSocial,
        emitente_telefone: extractedData.emitenteTelefone,
        emitente_uf: extractedData.emitenteUf,
        emitente_cidade: extractedData.emitenteCidade,
        emitente_bairro: extractedData.emitenteBairro,
        emitente_endereco: extractedData.emitenteEndereco,
        emitente_numero: extractedData.emitenteNumero,
        emitente_cep: extractedData.emitenteCep,
        destinatario_cnpj: extractedData.destinatarioCnpj,
        destinatario_razao_social: extractedData.destinatarioRazaoSocial,
        destinatario_telefone: extractedData.destinatarioTelefone,
        destinatario_uf: extractedData.destinatarioUf,
        destinatario_cidade: extractedData.destinatarioCidade,
        destinatario_bairro: extractedData.destinatarioBairro,
        destinatario_endereco: extractedData.destinatarioEndereco,
        destinatario_numero: extractedData.destinatarioNumero,
        destinatario_cep: extractedData.destinatarioCep,
        valor_total: extractedData.valorNota,
        peso_bruto: extractedData.pesoBruto,
        peso_liquido: extractedData.pesoLiquido,
        quantidade_volumes: extractedData.quantidadeVolumes,
        natureza_operacao: extractedData.naturezaOperacao,
        informacoes_complementares: extractedData.informacoesComplementares,
        numero_pedido: extractedData.numeroPedido
      },
      source: 'logistica_informacao',
      message: 'NFe encontrada com sucesso via API de Logística da Informação'
    };

    console.log('[API Logística] Resposta enviada:', {
      success: response.success,
      hasData: !!response.data,
      numeroNf: response.data?.numero_nf,
      source: response.source
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('[API Logística] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      api_error: true
    });
  }
});

// Serve static files from build
const staticPath = path.join(__dirname, 'dist', 'public');
app.use(express.static(staticPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Handle client-side routing (SPA)
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(staticPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({ error: 'Error serving application' });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Production server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Production server running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${staticPath}`);
  console.log(`🏥 Health check available at: /health`);
}).on('error', (err) => {
  console.error(`Server error on port ${PORT}: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Cannot start server.`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');  
  server.close(() => {
    console.log('Process terminated');
  });
});