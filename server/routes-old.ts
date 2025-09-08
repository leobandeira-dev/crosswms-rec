import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertEmpresaSchema, insertPerfilSchema,
  insertMotoristaSchema, insertVeiculoSchema,
  insertVinculacaoEmpresaSchema
} from "@shared/schema";
import { z } from "zod";
import { createRateLimit } from "./middleware/rateLimit";
import { emailService } from "./email-service";

// Authentication middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const result = await storage.getSessionByToken(token);
    if (!result) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = result.user;
    req.session = result.session;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export function registerRoutes(app: Express): Server {
  const httpServer = createServer(app);

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const { 
        email, 
        password, 
        nome, 
        razao_social,
        telefone, 
        cnpj, 
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        tipo_usuario = "transportador" 
      } = req.body;
      
      // Validações básicas
      if (!email || !password || !nome || !cnpj) {
        return res.status(400).json({ 
          error: "Dados obrigatórios faltando",
          message: "Email, senha, nome e CNPJ são obrigatórios"
        });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          error: "Cadastro já existe",
          message: "Já existe cadastro para este email, entre em contato com o administrador do sistema via suporte."
        });
      }

      // Verificar se CNPJ já está cadastrado
      const existingEmpresa = await storage.getEmpresaByCnpj(cnpj);
      if (existingEmpresa) {
        return res.status(400).json({ 
          error: "Cadastro já existe",
          message: "Já existe cadastro para este CNPJ, entre em contato com o administrador do sistema via suporte."
        });
      }

      // Para transportadores, criar diretamente (são aprovados automaticamente)
      if (tipo_usuario === "transportador") {
        // Buscar a empresa matriz (CrossWMS Admin)
        const empresaMatriz = await storage.getEmpresaById("6a1c6bfe-305f-429d-b74e-18a24b80ad19");
        if (!empresaMatriz) {
          return res.status(500).json({ 
            error: "Erro de configuração",
            message: "Empresa matriz não encontrada no sistema"
          });
        }

        // Criar empresa do transportador com empresa_matriz_id
        let empresa;
        try {
          empresa = await storage.createEmpresa({
            nome: razao_social || nome,
            cnpj: cnpj,
            telefone: telefone || '',
            email: email,
            logradouro: endereco || '',
            numero: numero || '',
            complemento: complemento || '',
            bairro: bairro || '',
            cidade: cidade || '',
            uf: uf || '',
            cep: cep || '',
            tipo_empresa: "transportador",
            empresa_matriz_id: empresaMatriz.id
          });
        } catch (error: any) {
          console.error('Create empresa error:', error);
          if (error.code === '23505' && error.constraint === 'empresas_cnpj_unique') {
            return res.status(400).json({ 
              error: "CNPJ já cadastrado",
              message: "Este CNPJ já está cadastrado no sistema"
            });
          }
          return res.status(500).json({ 
            error: "Erro no cadastro",
            message: "Não foi possível criar a empresa"
          });
        }

        // Buscar ou criar perfil padrão para transportador
        let perfil;
        const perfisExistentes = await storage.getAllPerfis();
        perfil = perfisExistentes.find(p => p.tipo_perfil === "transportador");
        
        if (!perfil) {
          perfil = await storage.createPerfil({
            nome: "Administrador",
            descricao: "Perfil padrão de administrador",
            tipo_perfil: "transportador"
          });
        }

        const hashedPassword = await storage.hashPassword(password);
        const user = await storage.createUser({
          email,
          password: hashedPassword,
          nome,
          telefone: telefone || null,
          empresa_id: empresa.id,
          perfil_id: perfil.id,
          tipo_usuario,
          status: "pendente_aprovacao",

          funcao: "transportador"
        });

        // Enviar e-mail de confirmação de cadastro
        try {
          await emailService.sendEmail({
            to: email,
            subject: "Cadastro realizado no CrossWMS - Aguardando aprovação",
            html: `
              <h2>Bem-vindo ao CrossWMS!</h2>
              <p>Olá <strong>${nome}</strong>,</p>
              <p>Seu cadastro como operador logístico foi realizado com sucesso no sistema CrossWMS.</p>
              <p><strong>Status:</strong> Aguardando aprovação do Super Admin</p>
              <p><strong>Próximos passos:</strong></p>
              <ul>
                <li>Sua solicitação será analisada em até 24 horas</li>
                <li>Você receberá um e-mail quando for aprovado</li>
                <li>Após aprovação, poderá acessar o sistema completo</li>
              </ul>
              <p>Para suporte: suporte@crosswms.com.br</p>
              <hr>
              <p><em>CrossWMS - Sistema de Gestão Logística</em></p>
            `,
            text: `Bem-vindo ao CrossWMS! Seu cadastro como operador logístico foi realizado com sucesso. Status: Aguardando aprovação do Super Admin. Você receberá um e-mail quando for aprovado.`
          });
        } catch (emailError) {
          console.error('Erro ao enviar e-mail de confirmação:', emailError);
        }

        res.json({ 
          user: { ...user, password: undefined },
          message: "Cadastro realizado com sucesso! Aguarde aprovação do Super Admin para acessar o sistema.",
          action: "registration_pending"
        });
      } else {
        // Para clientes e fornecedores, criar usuário não aprovado
        const hashedPassword = await storage.hashPassword(password);
        
        // Buscar perfil padrão para o tipo de usuário
        const perfisExistentes = await storage.getAllPerfis();
        let perfil = perfisExistentes.find(p => p.tipo_perfil === tipo_usuario);
        
        if (!perfil) {
          perfil = await storage.createPerfil({
            nome: tipo_usuario === "cliente" ? "Cliente" : "Fornecedor",
            descricao: `Perfil padrão para ${tipo_usuario}`,
            tipo_perfil: tipo_usuario
          });
        }

        const user = await storage.createUser({
          email,
          password: hashedPassword,
          nome,
          telefone,
          perfil_id: perfil.id,
          tipo_usuario,
          status: "pendente_aprovacao"
        });

        // Enviar e-mail de confirmação de cadastro para cliente/fornecedor
        try {
          await emailService.sendEmail({
            to: email,
            subject: `Cadastro realizado no CrossWMS - ${tipo_usuario === 'cliente' ? 'Cliente' : 'Fornecedor'}`,
            html: `
              <h2>Bem-vindo ao CrossWMS!</h2>
              <p>Olá <strong>${nome}</strong>,</p>
              <p>Seu cadastro como ${tipo_usuario === 'cliente' ? 'cliente' : 'fornecedor'} foi realizado com sucesso no sistema CrossWMS.</p>
              <p><strong>Status:</strong> Aguardando aprovação do operador logístico</p>
              <p><strong>Próximos passos:</strong></p>
              <ul>
                <li>Sua solicitação será analisada pelo operador logístico responsável</li>
                <li>Você receberá um e-mail quando for aprovado</li>
                <li>Após aprovação, poderá acessar o portal ${tipo_usuario === 'cliente' ? 'do cliente' : 'do fornecedor'}</li>
              </ul>
              <p>Para dúvidas, entre em contato com o operador logístico responsável.</p>
              <hr>
              <p><em>CrossWMS - Sistema de Gestão Logística</em></p>
            `,
            text: `Bem-vindo ao CrossWMS! Seu cadastro como ${tipo_usuario === 'cliente' ? 'cliente' : 'fornecedor'} foi realizado com sucesso. Status: Aguardando aprovação do operador logístico.`
          });
        } catch (emailError) {
          console.error('Erro ao enviar e-mail de confirmação:', emailError);
        }

        res.status(201).json({ 
          success: true,
          message: "Solicitação de cadastro enviada! Aguarde aprovação do operador logístico.",
          requires_approval: true
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: "Erro no cadastro",
        message: "Não foi possível completar o cadastro. Tente novamente."
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          error: "Usuário não encontrado",
          message: "Este email não está cadastrado no sistema. Para acessar o CrossWMS, você precisa solicitar cadastro através da página inicial.",
          action: "register_required"
        });
      }

      const isValid = await storage.verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ 
          error: "Senha incorreta",
          message: "A senha informada está incorreta. Verifique e tente novamente."
        });
      }

      // Verificar se o usuário está aprovado
      if (user.status === "pendente_aprovacao") {
        let message;
        if (user.tipo_usuario === "transportador") {
          message = "Seu cadastro está pendente de aprovação pelo administrador do sistema. Entre em contato com o suporte técnico para acelerar o processo.";
        } else if (user.tipo_usuario === "cliente") {
          message = "Seu cadastro está pendente de aprovação pelo operador logístico. Entre em contato com o transportador responsável para acelerar o processo.";
        } else if (user.tipo_usuario === "fornecedor") {
          message = "Seu cadastro está pendente de aprovação. Entre em contato com o cliente ou operador logístico responsável para acelerar o processo.";
        } else {
          message = "Seu cadastro ainda está sendo analisado. Entre em contato com o responsável pela aprovação.";
        }
          
        return res.status(403).json({ 
          error: "Cadastro pendente de aprovação",
          message,
          action: "approval_pending"
        });
      }

      if (user.status === "rejeitado" || user.status === "inativo") {
        return res.status(403).json({ 
          error: "Acesso negado",
          message: "Seu acesso foi negado ou desabilitado. Entre em contato com o operador logístico.",
          action: "access_denied"
        });
      }

      const session = await storage.createSession(user.id);
      res.json({ user: { ...user, password: undefined }, token: session.token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/logout", authenticateToken, async (req, res) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (token) {
        await storage.deleteSession(token);
      }
      
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/me", authenticateToken, async (req, res) => {
    try {
      const userWithCompany = await storage.getUserWithCompanyById((req as any).user.id);
      if (!userWithCompany) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ ...userWithCompany, password: undefined });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Empresas routes
  app.get("/api/empresas", authenticateToken, async (req, res) => {
    try {
      const empresas = await storage.getAllEmpresas();
      res.json(empresas);
    } catch (error) {
      console.error('Get empresas error:', error);
      res.status(500).json({ error: "Failed to get empresas" });
    }
  });

  app.post("/api/empresas", authenticateToken, async (req, res) => {
    try {
      const empresaData = insertEmpresaSchema.parse(req.body);
      const empresa = await storage.createEmpresa(empresaData);
      res.json(empresa);
    } catch (error) {
      console.error('Create empresa error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid empresa data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create empresa" });
    }
  });

  app.get("/api/empresas/:id", authenticateToken, async (req, res) => {
    try {
      const empresa = await storage.getEmpresaById(req.params.id);
      if (!empresa) {
        return res.status(404).json({ error: "Empresa not found" });
      }
      res.json(empresa);
    } catch (error) {
      console.error('Get empresa error:', error);
      res.status(500).json({ error: "Failed to get empresa" });
    }
  });

  // Perfis routes
  app.get("/api/perfis", authenticateToken, async (req, res) => {
    try {
      const perfis = await storage.getAllPerfis();
      res.json(perfis);
    } catch (error) {
      console.error('Get perfis error:', error);
      res.status(500).json({ error: "Failed to get perfis" });
    }
  });

  app.post("/api/perfis", authenticateToken, async (req, res) => {
    try {
      const perfilData = insertPerfilSchema.parse(req.body);
      const perfil = await storage.createPerfil(perfilData);
      res.json(perfil);
    } catch (error) {
      console.error('Create perfil error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid perfil data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create perfil" });
    }
  });

  // Motoristas routes
  app.get("/api/motoristas", authenticateToken, async (req, res) => {
    try {
      const { empresaId } = req.query;
      if (!empresaId) {
        return res.status(400).json({ error: "empresaId is required" });
      }
      const motoristas = await storage.getAllMotoristas(empresaId as string);
      res.json(motoristas);
    } catch (error) {
      console.error('Get motoristas error:', error);
      res.status(500).json({ error: "Failed to get motoristas" });
    }
  });

  app.post("/api/motoristas", authenticateToken, async (req, res) => {
    try {
      const motoristaData = insertMotoristaSchema.parse(req.body);
      const motorista = await storage.createMotorista(motoristaData);
      res.json(motorista);
    } catch (error) {
      console.error('Create motorista error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid motorista data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create motorista" });
    }
  });

  app.get("/api/motoristas/:id", authenticateToken, async (req, res) => {
    try {
      const motorista = await storage.getMotoristaById(req.params.id);
      if (!motorista) {
        return res.status(404).json({ error: "Motorista not found" });
      }
      res.json(motorista);
    } catch (error) {
      console.error('Get motorista error:', error);
      res.status(500).json({ error: "Failed to get motorista" });
    }
  });

  // Veiculos routes
  app.get("/api/veiculos", authenticateToken, async (req, res) => {
    try {
      const { empresaId } = req.query;
      if (!empresaId) {
        return res.status(400).json({ error: "empresaId is required" });
      }
      const veiculos = await storage.getAllVeiculos(empresaId as string);
      res.json(veiculos);
    } catch (error) {
      console.error('Get veiculos error:', error);
      res.status(500).json({ error: "Failed to get veiculos" });
    }
  });

  app.post("/api/veiculos", authenticateToken, async (req, res) => {
    try {
      const veiculoData = insertVeiculoSchema.parse(req.body);
      const veiculo = await storage.createVeiculo(veiculoData);
      res.json(veiculo);
    } catch (error) {
      console.error('Create veiculo error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid veiculo data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create veiculo" });
    }
  });

  app.get("/api/veiculos/:id", authenticateToken, async (req, res) => {
    try {
      const veiculo = await storage.getVeiculoById(req.params.id);
      if (!veiculo) {
        return res.status(404).json({ error: "Veiculo not found" });
      }
      res.json(veiculo);
    } catch (error) {
      console.error('Get veiculo error:', error);
      res.status(500).json({ error: "Failed to get veiculo" });
    }
  });

  // Empresas routes - endpoints para página de configurações
  app.get("/api/empresas/:id", authenticateToken, async (req, res) => {
    try {
      const empresa = await storage.getEmpresaById(req.params.id);
      if (!empresa) {
        return res.status(404).json({ error: "Empresa not found" });
      }
      res.json(empresa);
    } catch (error) {
      console.error('Get empresa error:', error);
      res.status(500).json({ error: "Failed to get empresa" });
    }
  });

  app.put("/api/empresas/:id", authenticateToken, async (req, res) => {
    try {
      const empresa = await storage.updateEmpresa(req.params.id, req.body);
      if (!empresa) {
        return res.status(404).json({ error: "Empresa not found" });
      }
      res.json(empresa);
    } catch (error) {
      console.error('Update empresa error:', error);
      res.status(500).json({ error: "Failed to update empresa" });
    }
  });

  // Rate limiting for CNPJ lookup endpoint
  const cnpjLookupRateLimit = createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Maximum 20 lookups per IP per 15 minutes
    message: "Muitas consultas de CNPJ. Tente novamente em 15 minutos."
  });

  // CNPJ Lookup - External API only (secure, no database exposure)
  // Endpoint para listar usuários pendentes de aprovação
  app.get("/api/usuarios-pendentes", async (req, res) => {
    try {
      const usuariosPendentes = await storage.getUsersByStatus('pendente_aprovacao');
      res.json(usuariosPendentes);
    } catch (error) {
      console.error('Error fetching pending users:', error);
      res.status(500).json({ error: "Failed to fetch pending users" });
    }
  });

  // Endpoint para aprovar/rejeitar usuário
  app.post("/api/aprovar-usuario/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // status: 'ativo' ou 'rejeitado'
      
      const user = await storage.updateUser(id, { status });
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Enviar e-mail de aprovação para transportadores aprovados pelo Super Admin
      if (status === 'ativo' && user.tipo_usuario === 'transportador') {
        try {
          await emailService.sendEmail({
            to: user.email,
            subject: "Cadastro aprovado no CrossWMS - Acesso liberado ao sistema",
            html: `
              <h2>Parabéns! Seu cadastro foi aprovado!</h2>
              <p>Olá <strong>${user.nome}</strong>,</p>
              <p>Seu cadastro como operador logístico foi aprovado pelo Super Admin do CrossWMS.</p>
              <p><strong>Status:</strong> Acesso liberado</p>
              <p><strong>Próximos passos:</strong></p>
              <ul>
                <li>Acesse o sistema CrossWMS usando suas credenciais</li>
                <li>Configure sua empresa e operações</li>
                <li>Gerencie aprovações de clientes e fornecedores</li>
                <li>Explore todas as funcionalidades do sistema</li>
              </ul>
              <p><strong>Link de acesso:</strong> <a href="${process.env.BASE_URL || 'https://crosswms.replit.app'}/login">Acessar CrossWMS</a></p>
              <p>Para suporte técnico: suporte@crosswms.com.br</p>
              <hr>
              <p><em>CrossWMS - Sistema de Gestão Logística</em></p>
            `,
            text: `Parabéns! Seu cadastro como operador logístico foi aprovado no CrossWMS. Acesse o sistema usando suas credenciais.`
          });
        } catch (emailError) {
          console.error('Erro ao enviar e-mail de aprovação para transportador:', emailError);
        }
      }

      res.json({ 
        success: true, 
        message: status === 'ativo' ? 'Usuário aprovado com sucesso!' : 'Usuário rejeitado',
        user: { ...user, password: undefined }
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      res.status(500).json({ error: "Failed to update user status" });
    }
  });

  // Endpoint para buscar informações da empresa por ID
  app.get("/api/empresas/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const empresa = await storage.getEmpresaById(id);
      
      if (!empresa) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }
      
      res.json(empresa);
    } catch (error) {
      console.error('Error fetching empresa:', error);
      res.status(500).json({ error: "Falha ao buscar informações da empresa" });
    }
  });

  // Endpoint para buscar perfis
  app.get("/api/perfis", authenticateToken, async (req, res) => {
    try {
      const perfis = await storage.getAllPerfis();
      res.json(perfis);
    } catch (error) {
      console.error('Error fetching perfis:', error);
      res.status(500).json({ error: "Falha ao buscar perfis" });
    }
  });

  // Endpoint para buscar permissões
  app.get("/api/permissions", authenticateToken, async (req, res) => {
    try {
      const permissions = await storage.getAllPermissions();
      res.json(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ error: "Falha ao buscar permissões" });
    }
  });

  // Endpoint para salvar permissões de um perfil
  app.post("/api/permissions", authenticateToken, async (req, res) => {
    try {
      const { perfil_id, permissions } = req.body;
      
      if (!perfil_id || !permissions) {
        return res.status(400).json({ error: "perfil_id e permissions são obrigatórios" });
      }

      await storage.savePerfilPermissions(perfil_id, permissions);
      res.json({ message: "Permissões salvas com sucesso" });
    } catch (error) {
      console.error('Error saving permissions:', error);
      res.status(500).json({ error: "Falha ao salvar permissões" });
    }
  });

  app.post("/api/lookup-cnpj", async (req, res) => {
    try {
      const { cnpj, tipo_solicitacao } = req.body;
      
      // Security validations
      if (!cnpj || !tipo_solicitacao) {
        return res.status(400).json({ 
          success: false,
          message: "CNPJ e tipo de solicitação são obrigatórios"
        });
      }

      // Allow for client/supplier/transporter registration
      if (!['cliente', 'fornecedor', 'transportador'].includes(tipo_solicitacao)) {
        return res.status(403).json({ 
          success: false,
          message: "Operação não permitida"
        });
      }
      
      // Remove formatting from CNPJ
      const cleanCnpj = cnpj.replace(/[^\d]/g, '');
      
      if (cleanCnpj.length !== 14) {
        return res.status(400).json({ 
          success: false,
          message: "CNPJ deve ter 14 dígitos"
        });
      }

      // Security audit log (only log partial CNPJ)
      const clientIp = req.ip || req.connection.remoteAddress;
      console.log(`[AUDIT] CNPJ lookup - IP: ${clientIp}, CNPJ: ${cleanCnpj.substring(0, 4)}******, Type: ${tipo_solicitacao}, Time: ${new Date().toISOString()}`);

      // Try ReceitaWS API (most reliable for Brazilian CNPJ data)
      try {
        const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCnpj}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status !== 'ERROR' && data.nome) {
            // Extract only the first phone number to keep database clean
            let telefone = data.telefone || '';
            if (telefone.includes(' / ')) {
              telefone = telefone.split(' / ')[0].trim();
            } else if (telefone.includes('/')) {
              telefone = telefone.split('/')[0].trim();
            }
            
            // Return successful data
            return res.json({
              success: true,
              company: {
                cnpj: data.cnpj,
                nome: data.nome,
                fantasia: data.fantasia || data.nome,
                situacao: data.situacao,
                logradouro: data.logradouro,
                numero: data.numero,
                complemento: data.complemento,
                bairro: data.bairro,
                cidade: data.municipio,
                uf: data.uf,
                cep: data.cep,
                telefone: telefone
              },
              message: "Dados encontrados. Informações preenchidas automaticamente.",
              source: 'ReceitaWS'
            });
          }
        }
      } catch (error) {
        // Continue to fallback if API fails
      }
      
      // If API fails, allow manual input
      return res.status(200).json({ 
        success: false,
        message: "Não foi possível consultar o CNPJ automaticamente. Preencha os dados manualmente.",
        allow_manual: true
      });
    } catch (error) {
      console.error("[INFO] Error in CNPJ lookup:", error);
      res.status(500).json({ 
        success: false,
        message: "Erro ao consultar CNPJ. Tente novamente."
      });
    }
  });

  // Solicitações de cadastro - Sistema de aprovação
  app.post("/api/solicitacoes-cadastro", async (req, res) => {
    try {
      const solicitacaoData = insertSolicitacaoCadastroSchema.parse(req.body);
      
      // Validar se o operador logístico existe
      const operador = await storage.getOperadorLogisticoByCnpj(solicitacaoData.operador_logistico_cnpj);
      if (!operador) {
        return res.status(400).json({ error: "Operador logístico não encontrado com este CNPJ" });
      }

      // Adicionar o ID do operador à solicitação
      const solicitacaoCompleta = {
        ...solicitacaoData,
        operador_logistico_id: operador.id
      };

      const solicitacao = await storage.createSolicitacaoCadastro(solicitacaoCompleta);
      res.json({ 
        success: true, 
        message: "Seu cadastro foi solicitado, assim que aprovado você receberá um e-mail de confirmação",
        solicitacao 
      });
    } catch (error) {
      console.error('Create solicitacao cadastro error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Falha ao criar solicitação de cadastro" });
    }
  });

  app.get("/api/solicitacoes-cadastro/pendentes", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      if (!user.empresa_id) {
        return res.status(400).json({ error: "Usuário não vinculado a empresa" });
      }

      const solicitacoes = await storage.getSolicitacoesPendentes(user.empresa_id);
      res.json(solicitacoes);
    } catch (error) {
      console.error('Get solicitacoes pendentes error:', error);
      res.status(500).json({ error: "Falha ao buscar solicitações pendentes" });
    }
  });

  app.post("/api/solicitacoes-cadastro/:id/aprovar", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const resultado = await storage.aprovarSolicitacaoCadastro(req.params.id, user.id);
      res.json(resultado);
    } catch (error) {
      console.error('Aprovar solicitacao error:', error);
      res.status(500).json({ error: "Falha ao aprovar solicitação" });
    }
  });

  app.post("/api/solicitacoes-cadastro/:id/rejeitar", authenticateToken, async (req, res) => {
    try {
      const user = req.user;
      const { motivoRejeicao } = req.body;
      
      if (!motivoRejeicao) {
        return res.status(400).json({ error: "Motivo da rejeição é obrigatório" });
      }

      const solicitacao = await storage.rejeitarSolicitacaoCadastro(req.params.id, motivoRejeicao, user.id);
      res.json(solicitacao);
    } catch (error) {
      console.error('Rejeitar solicitacao error:', error);
      res.status(500).json({ error: "Falha ao rejeitar solicitação" });
    }
  });

  // API para configurações - endpoints necessários para todas as abas
  app.get("/api/empresas/:id", authenticateToken, async (req, res) => {
    try {
      const empresa = await storage.getEmpresaById(req.params.id);
      if (!empresa) {
        return res.status(404).json({ error: "Empresa não encontrada" });
      }
      res.json(empresa);
    } catch (error) {
      console.error('Get empresa error:', error);
      res.status(500).json({ error: "Falha ao buscar empresa" });
    }
  });

  app.put("/api/empresas/:id", authenticateToken, async (req, res) => {
    try {
      const empresa = await storage.updateEmpresa(req.params.id, req.body);
      res.json(empresa);
    } catch (error) {
      console.error('Update empresa error:', error);
      res.status(500).json({ error: "Falha ao atualizar empresa" });
    }
  });

  app.get("/api/usuarios", authenticateToken, async (req, res) => {
    try {
      const usuarios = await storage.getAllUsers();
      res.json(usuarios);
    } catch (error) {
      console.error('Get usuarios error:', error);
      res.status(500).json({ error: "Falha ao buscar usuários" });
    }
  });

  app.get("/api/assinaturas/:empresaId", authenticateToken, async (req, res) => {
    try {
      const assinatura = await storage.getAssinaturaByEmpresa(req.params.empresaId);
      res.json(assinatura);
    } catch (error) {
      console.error('Get assinatura error:', error);
      res.status(500).json({ error: "Falha ao buscar assinatura" });
    }
  });

  // APIs para Perfis e Permissões
  app.get("/api/perfis", authenticateToken, async (req, res) => {
    try {
      const perfis = await storage.getAllPerfis();
      res.json(perfis);
    } catch (error) {
      console.error('Get perfis error:', error);
      res.status(500).json({ error: "Falha ao buscar perfis" });
    }
  });

  app.get("/api/permissions", authenticateToken, async (req, res) => {
    try {
      const permissions = await storage.getAllPermissions();
      res.json(permissions);
    } catch (error) {
      console.error('Get permissions error:', error);
      res.status(500).json({ error: "Falha ao buscar permissões" });
    }
  });

  app.post("/api/perfis/:id/permissions", authenticateToken, async (req, res) => {
    try {
      await storage.savePerfilPermissions(req.params.id, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error('Save perfil permissions error:', error);
      res.status(500).json({ error: "Falha ao salvar permissões do perfil" });
    }
  });

  app.get("/api/usuarios-pendentes", authenticateToken, async (req, res) => {
    try {
      const usuarios = await storage.getUsersByStatus('pendente_aprovacao');
      res.json(usuarios);
    } catch (error) {
      console.error('Get usuarios pendentes error:', error);
      res.status(500).json({ error: "Falha ao buscar usuários pendentes" });
    }
  });

  app.post("/api/aprovar-usuario/:id", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      const usuario = await storage.aprovarUsuarioPorTransportador(req.params.id, user.id);
      res.json(usuario);
    } catch (error) {
      console.error('Aprovar usuario error:', error);
      res.status(500).json({ error: "Falha ao aprovar usuário" });
    }
  });

  app.get("/api/email-config", authenticateToken, async (req, res) => {
    try {
      const emailConfig = {
        host: process.env.EMAIL_HOST || '',
        user: process.env.EMAIL_USER || '',
        from: process.env.EMAIL_FROM || '',
        enabled: true
      };
      res.json(emailConfig);
    } catch (error) {
      console.error('Get email config error:', error);
      res.status(500).json({ error: "Falha ao buscar configurações de email" });
    }
  });

  app.post("/api/email-config", authenticateToken, async (req, res) => {
    try {
      // In production, this would save to database
      console.log('Email config saved:', req.body);
      res.json({ success: true });
    } catch (error) {
      console.error('Save email config error:', error);
      res.status(500).json({ error: "Falha ao salvar configurações de email" });
    }
  });

  // Vinculações entre empresas
  app.get("/api/vinculacoes-empresas", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user.empresa_id) {
        return res.status(400).json({ error: "Usuário não vinculado a empresa" });
      }

      const vinculacoes = await storage.getVinculacoesByOperador(user.empresa_id);
      res.json(vinculacoes);
    } catch (error) {
      console.error('Get vinculacoes error:', error);
      res.status(500).json({ error: "Falha ao buscar vinculações" });
    }
  });

  app.post("/api/vinculacoes-empresas", authenticateToken, async (req, res) => {
    try {
      const vinculacaoData = insertVinculacaoEmpresaSchema.parse(req.body);
      const vinculacao = await storage.createVinculacaoEmpresa(vinculacaoData);
      res.json(vinculacao);
    } catch (error) {
      console.error('Create vinculacao error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Dados inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Falha ao criar vinculação" });
    }
  });

  // Buscar usuários pendentes vinculados ao transportador
  app.get("/api/usuarios-pendentes-transportador", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Verificar se é transportador
      if (user.tipo_usuario !== "transportador") {
        return res.status(403).json({ error: "Acesso negado. Apenas transportadores podem aprovar usuários." });
      }

      const usuariosPendentes = await storage.getUsersPendentesByTransportador(user.empresa_id);
      res.json(usuariosPendentes);
    } catch (error) {
      console.error('Get usuarios pendentes transportador error:', error);
      res.status(500).json({ error: "Falha ao buscar usuários pendentes" });
    }
  });

  // Aprovar usuário por transportador
  app.post("/api/aprovar-usuario-transportador/:id", authenticateToken, async (req, res) => {
    try {
      const user = (req as any).user;
      
      // Verificar se é transportador
      if (user.tipo_usuario !== "transportador") {
        return res.status(403).json({ error: "Acesso negado. Apenas transportadores podem aprovar usuários." });
      }

      const userAprovado = await storage.aprovarUsuarioPorTransportador(req.params.id, user.id);
      
      // Enviar e-mail de aprovação
      try {
        await emailService.sendEmail({
          to: userAprovado.email,
          subject: "Cadastro aprovado no CrossWMS - Acesso liberado",
          html: `
            <h2>Parabéns! Seu cadastro foi aprovado!</h2>
            <p>Olá <strong>${userAprovado.nome}</strong>,</p>
            <p>Seu cadastro como ${userAprovado.tipo_usuario === 'cliente' ? 'cliente' : 'fornecedor'} foi aprovado pelo operador logístico.</p>
            <p><strong>Status:</strong> Acesso liberado</p>
            <p><strong>Próximos passos:</strong></p>
            <ul>
              <li>Acesse o sistema CrossWMS usando suas credenciais</li>
              <li>Complete seu perfil com informações adicionais</li>
              <li>Explore as funcionalidades disponíveis no seu portal</li>
            </ul>
            <p><strong>Link de acesso:</strong> <a href="${process.env.BASE_URL || 'https://crosswms.replit.app'}/login">Acessar CrossWMS</a></p>
            <p>Para suporte: Entre em contato com o operador logístico responsável.</p>
            <hr>
            <p><em>CrossWMS - Sistema de Gestão Logística</em></p>
          `,
          text: `Parabéns! Seu cadastro foi aprovado no CrossWMS. Acesse o sistema usando suas credenciais.`
        });
      } catch (emailError) {
        console.error('Erro ao enviar e-mail de aprovação:', emailError);
      }
      
      res.json({ 
        message: "Usuário aprovado com sucesso!",
        user: { ...userAprovado, password: undefined }
      });
    } catch (error) {
      console.error('Aprovar usuario transportador error:', error);
      res.status(500).json({ error: "Falha ao aprovar usuário" });
    }
  });

  // Validar operador logístico por CNPJ
  app.get("/api/operadores-logisticos/validar/:cnpj", async (req, res) => {
    try {
      const operador = await storage.getOperadorLogisticoByCnpj(req.params.cnpj);
      if (!operador) {
        return res.status(404).json({ error: "Operador logístico não encontrado" });
      }
      res.json({ 
        id: operador.id, 
        nome: operador.nome, 
        cnpj: operador.cnpj,
        existe: true 
      });
    } catch (error) {
      console.error('Validar operador error:', error);
      res.status(500).json({ error: "Falha ao validar operador logístico" });
    }
  });

  app.put("/api/empresas/:id", authenticateToken, async (req, res) => {
    try {
      const empresaData = insertEmpresaSchema.partial().parse(req.body);
      const updatedEmpresa = await storage.updateEmpresa(req.params.id, empresaData);
      if (!updatedEmpresa) {
        return res.status(404).json({ error: "Empresa not found" });
      }
      res.json(updatedEmpresa);
    } catch (error) {
      console.error('Update empresa error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid empresa data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update empresa" });
    }
  });

  // Users management routes
  app.get("/api/users", authenticateToken, async (req, res) => {
    try {
      // For security, we'll implement this as needed
      res.json({ message: "Users endpoint available" });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Seed route for initial data
  app.post("/api/seed", async (req, res) => {
    try {
      // Check if admin user already exists
      const existingUser = await storage.getUserByEmail("admin@crosswms.com.br");
      if (existingUser) {
        return res.json({ message: "Seed data already exists", user: { email: existingUser.email } });
      }

      // Create default empresa
      const empresa = await storage.createEmpresa({
        nome: "CrossWMS Demo",
        tipo_empresa: "matriz",
        cnpj: "00.000.000/0001-00",
        logradouro: "Rua Demo",
        numero: "123",
        cidade: "São Paulo",
        uf: "SP",
        cep: "01000-000",
        telefone: "(11) 99999-9999",
        email: "contato@crosswms.com.br"
      });

      // Create default perfil
      const perfil = await storage.createPerfil({
        nome: "Administrador",
        tipo_perfil: "administrador",
        descricao: "Acesso total ao sistema",
        nivel_hierarquia: 1,
        empresa_id: empresa.id
      });

      // Create admin user
      const hashedPassword = await storage.hashPassword("123456");
      const user = await storage.createUser({
        nome: "Administrador do Sistema",
        email: "admin@crosswms.com.br",
        password: hashedPassword,
        telefone: "(11) 99999-9999",
        empresa_id: empresa.id,
        perfil_id: perfil.id,
        status: "active"
      });

      res.json({ 
        message: "Seed completed successfully",
        credentials: {
          email: "admin@crosswms.com.br",
          password: "123456"
        },
        user: { ...user, password: undefined }
      });
    } catch (error) {
      console.error('Seed error:', error);
      res.status(500).json({ error: "Seed failed" });
    }
  });

  // Client data isolation routes
  app.get("/api/clientes/:clienteId/notas-fiscais", authenticateToken, async (req: any, res) => {
    try {
      const { clienteId } = req.params;
      const user = req.user;
      
      // Verifica se o usuário tem permissão para acessar dados deste cliente
      if (user.tipo_usuario === 'cliente' && user.empresa_id !== clienteId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const notasFiscais = await storage.getNotasFiscaisForCliente(clienteId);
      res.json(notasFiscais);
    } catch (error) {
      console.error('Get notas fiscais for cliente error:', error);
      res.status(500).json({ error: "Failed to get notas fiscais" });
    }
  });

  app.get("/api/clientes/:clienteId/solicitacoes-coleta", authenticateToken, async (req: any, res) => {
    try {
      const { clienteId } = req.params;
      const user = req.user;
      
      // Verifica se o usuário tem permissão para acessar dados deste cliente
      if (user.tipo_usuario === 'cliente' && user.empresa_id !== clienteId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const solicitacoes = await storage.getSolicitacoesColetaForCliente(clienteId);
      res.json(solicitacoes);
    } catch (error) {
      console.error('Get solicitacoes coleta for cliente error:', error);
      res.status(500).json({ error: "Failed to get solicitacoes coleta" });
    }
  });

  app.get("/api/clientes/:clienteId/carregamentos", authenticateToken, async (req: any, res) => {
    try {
      const { clienteId } = req.params;
      const user = req.user;
      
      // Verifica se o usuário tem permissão para acessar dados deste cliente
      if (user.tipo_usuario === 'cliente' && user.empresa_id !== clienteId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const carregamentos = await storage.getCarregamentosForCliente(clienteId);
      res.json(carregamentos);
    } catch (error) {
      console.error('Get carregamentos for cliente error:', error);
      res.status(500).json({ error: "Failed to get carregamentos" });
    }
  });

  // Email configuration and testing endpoints
  app.post("/api/email/test", async (req, res) => {
    try {
      const isConnected = await emailService.testConnection();
      if (isConnected) {
        res.json({ success: true, message: "Configuração de e-mail testada com sucesso" });
      } else {
        res.status(500).json({ success: false, message: "Falha na conexão com servidor de e-mail" });
      }
    } catch (error) {
      console.error("Erro no teste de e-mail:", error);
      res.status(500).json({ success: false, message: "Erro ao testar configuração de e-mail" });
    }
  });

  app.post("/api/email/send-test", async (req, res) => {
    try {
      const { to, subject, message } = req.body;
      
      if (!to || !subject || !message) {
        return res.status(400).json({ success: false, message: "Campos obrigatórios: to, subject, message" });
      }

      const sent = await emailService.sendEmail({
        to: to,
        subject: subject,
        html: `<p>${message}</p>`,
        text: message
      });

      if (sent) {
        res.json({ success: true, message: "E-mail de teste enviado com sucesso" });
      } else {
        res.status(500).json({ success: false, message: "Falha ao enviar e-mail de teste" });
      }
    } catch (error) {
      console.error("Erro ao enviar e-mail de teste:", error);
      res.status(500).json({ success: false, message: "Erro ao enviar e-mail de teste" });
    }
  });

  return httpServer;
}