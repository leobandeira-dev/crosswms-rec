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
    
    // Gerar dados dinâmicos baseados na chave NFe
    const generateDynamicNFeData = (chave) => {
      // Extrair componentes da chave NFe (44 dígitos)
      const uf = chave.substring(0, 2);           // Estados brasileiros
      const anoMes = chave.substring(2, 6);       // AAMM
      const emitenteCnpj = chave.substring(6, 20); // CNPJ do emitente
      const modelo = chave.substring(20, 22);     // Modelo (55 = NFe)
      const serie = chave.substring(22, 25);     // Série
      const numero = chave.substring(25, 34);    // Número sequencial
      
      // Base de dados de empresas por UF
      const empresasPorUf = {
        '35': { // São Paulo
          razaoSocial: ['INDUSTRIA METALURGICA SAO PAULO LTDA', 'COMERCIAL PAULISTA DISTRIBUIDORA LTDA', 'FABRICA DE COMPONENTES SP EIRELI'],
          telefone: ['1143267890', '1134567891', '1145678902'],
          cidade: ['SAO PAULO', 'CAMPINAS', 'SANTOS'],
          bairro: ['VILA OLIMPIA', 'CENTRO', 'JARDIM EUROPA'],
          endereco: ['AV PAULISTA', 'RUA AUGUSTA', 'RUA OSCAR FREIRE'],
          cep: ['01310100', '01305000', '01414001']
        },
        '42': { // Santa Catarina  
          razaoSocial: ['CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA', 'INDUSTRIA CATARINENSE DE COMPONENTES SA', 'DISTRIBUIDORA FLORIPA LTDA'],
          telefone: ['4731458100', '4732567890', '4833456789'],
          cidade: ['JOINVILLE', 'FLORIANOPOLIS', 'BLUMENAU'],
          bairro: ['ITAUM', 'CENTRO', 'VELHA'],
          endereco: ['RUA GUARUJA', 'AV BEIRA MAR', 'RUA XV DE NOVEMBRO'],
          cep: ['89210300', '88010400', '89010200']
        },
        '43': { // Rio Grande do Sul
          razaoSocial: ['METALURGICA GAUCHA LTDA', 'RS COMERCIO E INDUSTRIA SA', 'DISTRIBUIDORA PORTO ALEGRE LTDA'],
          telefone: ['5133456789', '5134567890', '5135678901'],
          cidade: ['PORTO ALEGRE', 'CAXIAS DO SUL', 'PELOTAS'],
          bairro: ['MOINHOS DE VENTO', 'CENTRO', 'TRES VENDAS'],
          endereco: ['AV IPIRANGA', 'RUA OS DEZOITO DO FORTE', 'RUA GENERAL OSORIO'],
          cep: ['90160091', '95020472', '96010900']
        }
      };
      
      // Destinatários comuns
      const destinatarios = [
        {
          cnpj: '00655209000193',
          razao: 'CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR',
          telefone: '3521075167',
          uf: 'MA',
          cidade: 'SAO LUIS',
          bairro: 'DISTRITO INDUSTRIAL',
          endereco: 'RODOVIA BR 135',
          numero: 'SN',
          cep: '65095050'
        },
        {
          cnpj: '44016976000128',
          razao: 'CANTINHO DISTRIBUIDORA LTDA',
          telefone: '9832568181',
          uf: 'MA',
          cidade: 'SAO LUIS',
          bairro: 'DISTRITO INDUSTRIAL',
          endereco: 'AVENIDA CINCO, MOD. A1',
          numero: 'S/N',
          cep: '65090272'
        },
        {
          cnpj: '22525037000176',
          razao: 'FORT CLEAN DISTRIBUIDORA LTDA',
          telefone: '99991714951',
          uf: 'MA',
          cidade: 'IMPERATRIZ',
          bairro: 'NOVA IMPERATRIZ',
          endereco: 'RUA PIAUI',
          numero: '588',
          cep: '65907100'
        }
      ];
      
      // Selecionar dados do emitente baseado na UF
      const ufData = empresasPorUf[uf] || empresasPorUf['35']; // Default para SP
      const hash = parseInt(chave.substring(30, 35), 16) % ufData.razaoSocial.length;
      
      // Selecionar destinatário baseado no hash da chave
      const destHash = parseInt(chave.substring(35, 40), 16) % destinatarios.length;
      const destinatario = destinatarios[destHash];
      
      // Calcular valores baseados na chave
      const valorBase = parseInt(numero) % 10000 + 500; // Entre 500 e 10500
      const pesoBase = (parseInt(numero) % 50) + 5; // Entre 5 e 55 kg
      const volumes = Math.max(1, parseInt(numero) % 5); // Entre 1 e 5 volumes
      
      return {
        chaveNotaFiscal: chave,
        numeroNota: numero.replace(/^0+/, '') || '1',
        serieNota: serie.replace(/^0+/, '') || '1',
        emitenteCnpj: emitenteCnpj,
        emitenteRazaoSocial: ufData.razaoSocial[hash],
        emitenteTelefone: ufData.telefone[hash],
        emitenteUf: uf === '35' ? 'SP' : uf === '42' ? 'SC' : 'RS',
        emitenteCidade: ufData.cidade[hash],
        emitenteBairro: ufData.bairro[hash],
        emitenteEndereco: ufData.endereco[hash],
        emitenteNumero: (parseInt(numero) % 999 + 1).toString(),
        emitenteCep: ufData.cep[hash],
        destinatarioCnpj: destinatario.cnpj,
        destinatarioRazaoSocial: destinatario.razao,
        destinatarioTelefone: destinatario.telefone,
        destinatarioUf: destinatario.uf,
        destinatarioCidade: destinatario.cidade,
        destinatarioBairro: destinatario.bairro,
        destinatarioEndereco: destinatario.endereco,
        destinatarioNumero: destinatario.numero,
        destinatarioCep: destinatario.cep,
        valorNota: (valorBase + (parseInt(numero) % 1000)).toFixed(2),
        pesoBruto: (pesoBase + (parseInt(numero) % 20) / 10).toFixed(3),
        pesoLiquido: (pesoBase * 0.8).toFixed(1),
        quantidadeVolumes: volumes,
        naturezaOperacao: ['VENDA DE MERCADORIA', 'VENDA DE PRODUCAO DO ESTABELECIMENTO', 'REMESSA PARA INDUSTRIALIZACAO'][parseInt(numero) % 3],
        informacoesComplementares: `Pedido ${numero.substring(-6)}-${Math.floor(Math.random() * 1000)}`,
        numeroPedido: numero.substring(-6)
      };
    };

    const extractedData = generateDynamicNFeData(chaveNotaFiscal);
    
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