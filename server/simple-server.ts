// Servidor simplificado para funcionar sem erros
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

import express, { type Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";
import * as pathModule from "path";
import fs from "fs";
import viteConfig from "../vite.config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

const app = express();

// Aumentar limite de payload
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// CORS para Replit
app.use((req, res, next) => {
  const origin = req.get('origin');
  const host = req.get('host');
  
  // Permitir domínios do Replit
  if (origin && (origin.includes('replit.dev') || origin.includes('repl.co'))) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      console.log(`${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!', timestamp: new Date().toISOString() });
});

// Rota de login mock
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  // Aceita qualquer email/senha
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

// Middleware de erro
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error('Server error:', err);
  res.status(status).json({ message });
});

// Setup Vite em desenvolvimento
async function setupVite() {
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: {
      middlewareMode: true,
      hmr: { port: 24678 }
    },
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = pathModule.resolve(__dirname, "..", "index.html");
      let template = fs.readFileSync(clientTemplate, "utf-8");
      
      template = await vite.transformIndexHtml(url, template);
      
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// Iniciar servidor
async function startServer() {
  try {
    if (app.get("env") === "development") {
      await setupVite();
    }
    
    const port = process.env.PORT || 8080;
    app.listen(port, "0.0.0.0", () => {
      console.log(`Servidor rodando na porta ${port}`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Porta ${port} ocupada, tentando porta ${port + 1}`);
        app.listen(port + 1, "0.0.0.0", () => {
          console.log(`Servidor rodando na porta ${port + 1}`);
        });
      } else {
        console.error(`Erro do servidor: ${err.message}`);
      }
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
  }
}

startServer();
