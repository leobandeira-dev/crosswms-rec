import express from "express";

const app = express();
const port = process.env.PORT || 8080;

// Middleware básico
app.use(express.json());

// CORS para Replit
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

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!', timestamp: new Date().toISOString() });
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

// Servir arquivos estáticos
app.use(express.static('dist'));

// Rota para servir o index.html
app.get('*', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CrossWMS - Sistema de Logística</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 40px; }
        .login-form { max-width: 400px; margin: 0 auto; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #0056b3; }
        .message { margin-top: 20px; padding: 10px; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚛 CrossWMS</h1>
          <p>Sistema de Gestão Logística</p>
        </div>
        
        <div class="login-form">
          <h2>Login</h2>
          <form id="loginForm">
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" placeholder="Digite qualquer email" required>
            </div>
            <div class="form-group">
              <label for="password">Senha:</label>
              <input type="password" id="password" placeholder="Digite qualquer senha" required>
            </div>
            <button type="submit">Entrar</button>
          </form>
          <div id="message"></div>
        </div>
      </div>

      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const messageDiv = document.getElementById('message');
          
          try {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password })
            });
            
            if (response.ok) {
              const data = await response.json();
              messageDiv.innerHTML = '<div class="message success">Login realizado com sucesso! Bem-vindo ao sistema.</div>';
              console.log('Usuário logado:', data.user);
            } else {
              messageDiv.innerHTML = '<div class="message error">Erro no login. Tente novamente.</div>';
            }
          } catch (error) {
            messageDiv.innerHTML = '<div class="message error">Erro de conexão. Tente novamente.</div>';
            console.error('Erro:', error);
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📱 Acesse: https://d7b15c31-81fe-4823-bdd9-7694ae6b8d2c-00-ochrue1p6370.riker.replit.dev`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Porta ${port} ocupada, tentando porta ${port + 1}`);
    app.listen(port + 1, "0.0.0.0", () => {
      console.log(`🚀 Servidor rodando na porta ${port + 1}`);
    });
  } else {
    console.error(`Erro do servidor: ${err.message}`);
  }
});
