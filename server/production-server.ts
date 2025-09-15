import express from "express";
import path from "path";
import { registerVolumesRoutes } from "./volumes-routes";

const app = express();
const port = Number(process.env.PORT) || 5000; // Use PORT env var or default to 5000 for Replit

// Middleware básico
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Registrar rotas de volumes/etiquetas
registerVolumesRoutes(app);

// CORS para production
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://*.replit.app',
    'https://*.replit.dev', 
    process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : null
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.some(allowed => allowed && new RegExp(allowed.replace('*', '.*')).test(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// API Routes (copy from minimal-server.ts)
// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando em produção!', timestamp: new Date().toISOString() });
});

// Rota de login mock
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

// Rota de logout mock
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Rota de usuário atual mock
app.get('/api/me', (req, res) => {
  const mockUser = {
    id: 'demo-user-123',
    email: 'demo@exemplo.com',
    nome: 'Usuário Demo',
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

  res.json(mockUser);
});

// Rota para buscar notas fiscais
app.get('/api/armazenagem/recebimento/notas', (req, res) => {
  const mockNotas = [
    {
      id: '1',
      numero: '000001',
      serie: '1',
      chave_acesso: '35240112345678000195550010000000010000000001',
      emitente: 'Empresa Demo Ltda',
      destinatario: 'Cliente Demo Ltda',
      data_emissao: '2024-01-01',
      valor_total: 100.00,
      status: 'recebido'
    },
    {
      id: '2',
      numero: '000002',
      serie: '1',
      chave_acesso: '35240112345678000195550010000000020000000002',
      emitente: 'Fornecedor Demo Ltda',
      destinatario: 'Cliente Demo Ltda',
      data_emissao: '2024-01-02',
      valor_total: 250.50,
      status: 'recebido'
    }
  ];

  res.json(mockNotas);
});

// Servir arquivos estáticos do build do Vite
const staticPath = path.join(process.cwd(), 'dist', 'public');
app.use(express.static(staticPath, {
  maxAge: '1d', // Cache static assets for 1 day in production
  etag: true
}));

// Health check endpoint para deployment
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port,
    env: process.env.NODE_ENV || 'production'
  });
});

// Rota para servir o index.html para todas as rotas do SPA
app.get('*', (req, res) => {
  // Não servir index.html para rotas de API
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(staticPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Erro ao servir index.html:', err);
      res.status(500).json({ error: 'Error serving application' });
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Production server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Iniciar servidor
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Production server running on port ${port}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🌐 Static files served from: ${staticPath}`);
}).on('error', (err: any) => {
  console.error(`Server error on port ${port}: ${err.message}`);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Cannot start server.`);
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