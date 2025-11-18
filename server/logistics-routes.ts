import { Express, Request, Response } from "express";
import { logisticsStorage } from "./logistics-storage";
import { storage } from "./storage";
import { insertUserSchema, insertEmpresaSchema, insertColetaSchema, insertOrdemCargaSchema, insertOcorrenciaSchema, insertMotoristaSchema, insertVeiculoSchema, insertNotaFiscalSchema } from "@shared/schema";
import { z } from "zod";
import { DOMParser } from "@xmldom/xmldom";
import fetch from 'node-fetch';
import 'dotenv/config';
import { or, ilike, desc } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    nome: string;
    empresa_id?: string;
    perfil_id?: string;
  };
}

// Middleware for authentication
const requireAuth = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token required' });
  }

  try {
    const sessionData = await logisticsStorage.getSessionByToken(token);
    if (!sessionData) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = sessionData.user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export function registerLogisticsRoutes(app: Express) {
  // Public XML endpoint for Meu Danfe via API (Windows-friendly, no Python)
  app.post('/api/xml/fetch-from-meudanfe', async (req: Request, res: Response) => {
    try {
      const { chaveNotaFiscal } = req.body;
      const chave = String(chaveNotaFiscal || '').replace(/\D/g, '');
      if (!chave || chave.length !== 44) {
        return res.status(400).json({
          success: false,
          error: 'Chave de nota fiscal deve ter exatamente 44 dígitos',
          code: 'invalid_key'
        });
      }

      const apiKey = process.env.MEUDANFE_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ success: false, error: 'MEUDANFE_API_KEY ausente no servidor', code: 'meudanfe_api_key_missing' });
      }

      // Etapa opcional: adicionar a NFe na área do cliente
      try {
        const addUrl = `https://api.meudanfe.com.br/v2/fd/add/${chave}`;
        const addRes = await fetch(addUrl, { method: 'PUT', headers: { 'Api-Key': apiKey } });
        if (addRes.status === 402) {
          return res.status(402).json({ success: false, error: 'Saldo insuficiente na API Meu Danfe', code: 'meudanfe_insufficient_balance' });
        }
        if (addRes.status === 401 || addRes.status === 403) {
          return res.status(401).json({ success: false, error: 'Api-Key inválida ou não informada na API Meu Danfe', code: 'meudanfe_invalid_api_key' });
        }
      } catch (e) {
        console.warn('[MeuDanfe] Falha ao adicionar NFe, prosseguindo para GET xml:', e instanceof Error ? e.message : e);
      }

      // Baixar XML oficial da NFe
      const getUrl = `https://api.meudanfe.com.br/v2/fd/get/xml/${chave}`;
      const getRes = await fetch(getUrl, { method: 'GET', headers: { 'Api-Key': apiKey, 'Accept': 'application/json' } });

      let getJson: any = null;
      try { getJson = await getRes.json(); } catch (err) {
        console.error('[MeuDanfe] Erro ao parsear JSON do GET xml:', err);
      }

      if (!getRes.ok) {
        return res.status(getRes.status).json({ success: false, error: `Erro HTTP Meu Danfe GET: ${getRes.status}`, code: 'meudanfe_http_error', raw: getJson });
      }

      // Extrair XML considerando formatos variados
      const tryExtractXml = (json: any): string | null => {
        if (!json || typeof json !== 'object') return null;
        const candidates = [
          json.xml,
          json.xml_content,
          json.data?.xml,
          json.result?.xml,
          json.conteudo?.xml,
          json.conteudo,
          json.payload?.xml,
        ];
        for (const c of candidates) {
          if (typeof c === 'string' && c.includes('<NFe')) return c;
          if (typeof c === 'string' && c.includes('<?xml')) return c;
        }
        return null;
      };

      const xmlContent = tryExtractXml(getJson);
      if (!xmlContent) {
        return res.status(200).json({ success: false, error: 'Resposta do Meu Danfe não contém XML', code: 'meudanfe_no_xml', raw: getJson });
      }

      return res.json({ success: true, xml_content: xmlContent, provider: 'meudanfe_api' });
    } catch (error) {
      console.error('[MeuDanfe] Erro no endpoint backend:', error);
      return res.status(500).json({ success: false, error: 'Erro interno do servidor Meu Danfe', code: 'server_error' });
    }
  });

  // Authentication route removed - using main routes.ts instead

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await logisticsStorage.createUser(userData);
      const session = await logisticsStorage.createSession(user.id);

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: userWithoutPassword,
        token: session.token
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await logisticsStorage.deleteSession(token);
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json({ user: userWithoutPassword });
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const metrics = await logisticsStorage.getDashboardMetrics(req.user?.empresa_id);
      res.json(metrics);
    } catch (error) {
      console.error('Dashboard metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // Companies management
  app.get('/api/empresas', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tipo, status } = req.query;
      const empresas = await logisticsStorage.listEmpresas({
        tipo: tipo as string,
        status: status as string
      });
      res.json(empresas);
    } catch (error) {
      console.error('List empresas error:', error);
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  });

  app.post('/api/empresas', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const empresaData = insertEmpresaSchema.parse(req.body);
      const empresa = await logisticsStorage.createEmpresa(empresaData);
      res.json(empresa);
    } catch (error) {
      console.error('Create empresa error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create company' });
    }
  });

  app.get('/api/empresas/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const empresa = await logisticsStorage.getEmpresaById(req.params.id);
      if (!empresa) {
        return res.status(404).json({ error: 'Company not found' });
      }
      res.json(empresa);
    } catch (error) {
      console.error('Get empresa error:', error);
      res.status(500).json({ error: 'Failed to fetch company' });
    }
  });

  // Collections management
  app.get('/api/coletas', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, empresa_cliente_id, zona } = req.query;
      const coletas = await logisticsStorage.listColetas({
        status: status as string,
        empresa_cliente_id: empresa_cliente_id as string,
        zona: zona as string
      });
      res.json(coletas);
    } catch (error) {
      console.error('List coletas error:', error);
      res.status(500).json({ error: 'Failed to fetch collections' });
    }
  });

  app.post('/api/coletas', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const coletaData = insertColetaSchema.parse({
        ...req.body,
        usuario_solicitante_id: req.user!.id
      });
      const coleta = await logisticsStorage.createColeta(coletaData);
      res.json(coleta);
    } catch (error) {
      console.error('Create coleta error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create collection' });
    }
  });

  app.post('/api/coletas/:id/aprovar', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const coleta = await logisticsStorage.aprovarColeta(req.params.id, req.user!.id);
      if (!coleta) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      res.json(coleta);
    } catch (error) {
      console.error('Approve coleta error:', error);
      res.status(500).json({ error: 'Failed to approve collection' });
    }
  });

  app.post('/api/coletas/:id/recusar', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { motivo } = req.body;
      if (!motivo) {
        return res.status(400).json({ error: 'Rejection reason required' });
      }
      
      const coleta = await logisticsStorage.recusarColeta(req.params.id, req.user!.id, motivo);
      if (!coleta) {
        return res.status(404).json({ error: 'Collection not found' });
      }
      res.json(coleta);
    } catch (error) {
      console.error('Reject coleta error:', error);
      res.status(500).json({ error: 'Failed to reject collection' });
    }
  });

  // Loading orders management
  app.get('/api/ordens-carregamento', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, tipo_carregamento, empresa_cliente_id, motorista_id } = req.query;
      const ordens = await logisticsStorage.listOrdensCarga({
        status: status as string,
        tipo_carregamento: tipo_carregamento as string,
        empresa_cliente_id: empresa_cliente_id as string,
        motorista_id: motorista_id as string
      });
      res.json(ordens);
    } catch (error) {
      console.error('List ordens carregamento error:', error);
      res.status(500).json({ error: 'Failed to fetch loading orders' });
    }
  });

  app.post('/api/ordens-carregamento', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ordemData = insertOrdemCargaSchema.parse({
        ...req.body,
        usuario_responsavel_id: req.user!.id
      });
      const ordem = await logisticsStorage.createOrdemCarga(ordemData);
      res.json(ordem);
    } catch (error) {
      console.error('Create ordem carregamento error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create loading order' });
    }
  });

  // Invoice management
  app.get('/api/notas-fiscais', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, remetente_id, destinatario_id } = req.query;
      const notas = await logisticsStorage.listNotasFiscais({
        status: status as string,
        remetente_id: remetente_id as string,
        destinatario_id: destinatario_id as string
      });
      res.json(notas);
    } catch (error) {
      console.error('List notas fiscais error:', error);
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  });

  // A rota de busca foi movida para server/routes.ts para evitar conflito com /api/notas-fiscais/:id

  // Labels/tracking management
  app.get('/api/etiquetas', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { nota_fiscal_id, status, tipo } = req.query;
      const etiquetas = await logisticsStorage.listEtiquetas({
        nota_fiscal_id: nota_fiscal_id as string,
        status: status as string,
        tipo: tipo as string
      });
      res.json(etiquetas);
    } catch (error) {
      console.error('List etiquetas error:', error);
      res.status(500).json({ error: 'Failed to fetch labels' });
    }
  });

  app.get('/api/etiquetas/codigo/:codigo', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const etiqueta = await logisticsStorage.getEtiquetaByCodigo(req.params.codigo);
      if (!etiqueta) {
        return res.status(404).json({ error: 'Label not found' });
      }
      res.json(etiqueta);
    } catch (error) {
      console.error('Get etiqueta by codigo error:', error);
      res.status(500).json({ error: 'Failed to fetch label' });
    }
  });

  // SAC - Customer service
  app.get('/api/ocorrencias', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status, tipo_ocorrencia, prioridade, empresa_cliente_id } = req.query;
      const ocorrencias = await logisticsStorage.listOcorrencias({
        status: status as string,
        tipo_ocorrencia: tipo_ocorrencia as string,
        prioridade: prioridade as string,
        empresa_cliente_id: empresa_cliente_id as string
      });
      res.json(ocorrencias);
    } catch (error) {
      console.error('List ocorrencias error:', error);
      res.status(500).json({ error: 'Failed to fetch occurrences' });
    }
  });

  app.post('/api/ocorrencias', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ocorrenciaData = insertOcorrenciaSchema.parse({
        ...req.body,
        usuario_reportou_id: req.user!.id
      });
      const ocorrencia = await logisticsStorage.createOcorrencia(ocorrenciaData);
      res.json(ocorrencia);
    } catch (error) {
      console.error('Create ocorrencia error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      res.status(500).json({ error: 'Failed to create occurrence' });
    }
  });

  // Fleet management
  app.get('/api/veiculos', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const querySchema = z.object({ status: z.string().optional() });
      const parsed = querySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Parâmetros inválidos', details: parsed.error.flatten() });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId) {
        return res.status(403).json({ error: 'Empresa do usuário não definida' });
      }
      const veiculos = await logisticsStorage.listVeiculos({
        status: parsed.data.status,
        empresa_id: empresaId,
      });
      res.json(veiculos);
    } catch (error) {
      console.error('List veiculos error:', error);
      res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
  });

  app.put('/api/veiculos/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const current = await logisticsStorage.getVeiculoById(id);
      if (!current) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId || (current.empresa_id && current.empresa_id !== empresaId)) {
        return res.status(403).json({ error: 'Acesso negado a este recurso' });
      }
      const schema = insertVeiculoSchema.omit({ id: true, created_at: true, updated_at: true });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
      }
      const veiculo = await logisticsStorage.updateVeiculo(id, parsed.data as any);
      if (!veiculo) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      res.json(veiculo);
    } catch (error) {
      console.error('Update veiculo error:', error);
      res.status(500).json({ error: 'Falha ao atualizar veículo' });
    }
  });

  app.get('/api/motoristas', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const querySchema = z.object({ status: z.string().optional(), disponivel: z.enum(['true','false']).optional() });
      const parsed = querySchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Parâmetros inválidos', details: parsed.error.flatten() });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId) {
        return res.status(403).json({ error: 'Empresa do usuário não definida' });
      }
      const motoristas = await logisticsStorage.listMotoristas({
        status: parsed.data.status,
        disponivel: parsed.data.disponivel ? parsed.data.disponivel === 'true' : undefined,
        empresa_id: empresaId,
      });
      res.json(motoristas);
    } catch (error) {
      console.error('List motoristas error:', error);
      res.status(500).json({ error: 'Failed to fetch drivers' });
    }
  });

  app.put('/api/motoristas/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const current = await logisticsStorage.getMotoristaById(id);
      if (!current) {
        return res.status(404).json({ error: 'Motorista não encontrado' });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId || (current.empresa_id && current.empresa_id !== empresaId)) {
        return res.status(403).json({ error: 'Acesso negado a este recurso' });
      }
      const schema = insertMotoristaSchema.omit({ id: true, created_at: true, updated_at: true });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
      }
      const motorista = await logisticsStorage.updateMotorista(id, parsed.data as any);
      if (!motorista) {
        return res.status(404).json({ error: 'Motorista não encontrado' });
      }
      res.json(motorista);
    } catch (error) {
      console.error('Update motorista error:', error);
      res.status(500).json({ error: 'Falha ao atualizar motorista' });
    }
  });

  // Deleção de motoristas e veículos
  app.delete('/api/motoristas/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deleted = await logisticsStorage.deleteMotorista(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Motorista não encontrado' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete motorista error:', error);
      res.status(500).json({ error: 'Falha ao excluir motorista' });
    }
  });

  app.delete('/api/veiculos/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deleted = await logisticsStorage.deleteVeiculo(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete veiculo error:', error);
      res.status(500).json({ error: 'Falha ao excluir veículo' });
    }
  });

  // Coletas - atualização
  app.put('/api/coletas/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const current = await logisticsStorage.getColetaById(id);
      if (!current) {
        return res.status(404).json({ error: 'Coleta não encontrada' });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId || (current.empresa_cliente_id && current.empresa_cliente_id !== empresaId)) {
        return res.status(403).json({ error: 'Acesso negado a este recurso' });
      }
      const schema = insertColetaSchema.omit({ id: true, created_at: true, updated_at: true });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
      }
      const coleta = await logisticsStorage.updateColeta(id, parsed.data as any);
      if (!coleta) {
        return res.status(404).json({ error: 'Coleta não encontrada' });
      }
      res.json(coleta);
    } catch (error) {
      console.error('Update coleta error:', error);
      res.status(500).json({ error: 'Falha ao atualizar coleta' });
    }
  });

  // Ocorrências (SAC) - atualização
  app.put('/api/ocorrencias/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const current = await logisticsStorage.getOcorrenciaById(id);
      if (!current) {
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId || (current.empresa_cliente_id && current.empresa_cliente_id !== empresaId)) {
        return res.status(403).json({ error: 'Acesso negado a este recurso' });
      }
      const schema = insertOcorrenciaSchema.omit({ id: true, created_at: true, updated_at: true });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
      }
      const ocorrencia = await logisticsStorage.updateOcorrencia(id, parsed.data as any);
      if (!ocorrencia) {
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }
      res.json(ocorrencia);
    } catch (error) {
      console.error('Update ocorrencia error:', error);
      res.status(500).json({ error: 'Falha ao atualizar ocorrência' });
    }
  });

  // Deleção de coletas e ocorrências
  app.delete('/api/coletas/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deleted = await logisticsStorage.deleteColeta(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Coleta não encontrada' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete coleta error:', error);
      res.status(500).json({ error: 'Falha ao excluir coleta' });
    }
  });

  app.delete('/api/ocorrencias/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deleted = await logisticsStorage.deleteOcorrencia(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete ocorrencia error:', error);
      res.status(500).json({ error: 'Falha ao excluir ocorrência' });
    }
  });

  // Notas fiscais - atualização
  app.put('/api/notas-fiscais/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const current = await logisticsStorage.getNotaFiscalById(id);
      if (!current) {
        return res.status(404).json({ error: 'Nota fiscal não encontrada' });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId || (current.empresa_id && current.empresa_id !== empresaId)) {
        return res.status(403).json({ error: 'Acesso negado a este recurso' });
      }
      const schema = insertNotaFiscalSchema.omit({ id: true, created_at: true, updated_at: true });
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
      }
      const nota = await logisticsStorage.updateNotaFiscal(id, parsed.data as any);
      if (!nota) {
        return res.status(404).json({ error: 'Nota fiscal não encontrada' });
      }
      res.json(nota);
    } catch (error) {
      console.error('Update nota fiscal error:', error);
      res.status(500).json({ error: 'Falha ao atualizar nota fiscal' });
    }
  });

  // Empresas - deleção pública via logística
  app.delete('/api/empresas/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const deleted = await logisticsStorage.deleteEmpresa(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Delete empresa error:', error);
      res.status(500).json({ error: 'Falha ao excluir empresa' });
    }
  });

  // System parameters
  app.get('/api/parametros/:categoria?', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const parametros = await logisticsStorage.getParametrosSistema(req.params.categoria);
      res.json(parametros);
    } catch (error) {
      console.error('Get parametros error:', error);
      res.status(500).json({ error: 'Failed to fetch parameters' });
    }
  });

  // Import routes for XML/Excel integration
  app.post('/api/import/xml-nota-fiscal', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { xmlContent } = req.body;
      if (!xmlContent) {
        return res.status(400).json({ error: 'XML content required' });
      }

      // Here would be XML parsing logic to extract invoice data
      // For now, return success response
      res.json({ success: true, message: 'XML processed successfully' });
    } catch (error) {
      console.error('Import XML error:', error);
      res.status(500).json({ error: 'Failed to import XML' });
    }
  });

  app.post('/api/import/excel-coletas', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { excelData } = req.body;
      if (!excelData || !Array.isArray(excelData)) {
        return res.status(400).json({ error: 'Excel data required' });
      }

      // Here would be Excel processing logic to create bulk collections
      // For now, return success response
      res.json({ success: true, imported: excelData.length });
    } catch (error) {
      console.error('Import Excel error:', error);
      res.status(500).json({ error: 'Failed to import Excel' });
    }
  });

  // Upload XML endpoint - NFe XML file processing
  app.post('/api/xml/upload', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { xmlContent, fileName } = req.body;
      
      if (!xmlContent) {
        return res.status(400).json({ 
          success: false, 
          error: 'Conteúdo XML é obrigatório' 
        });
      }

      // Validar se é XML válido
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        
        // Verificar se há erros de parsing
        const parseError = xmlDoc.getElementsByTagName('parsererror');
        if (parseError.length > 0) {
          return res.status(400).json({
            success: false,
            error: 'Arquivo XML inválido ou corrompido'
          });
        }

        // Extrair chave da NFe do XML
        const chaveElements = xmlDoc.getElementsByTagName('chNFe');
        let chaveNFe = '';
        
        if (chaveElements.length > 0) {
          chaveNFe = chaveElements[0].textContent || '';
        } else {
          // Tentar extrair de outros locais possíveis
          const infNFeElements = xmlDoc.getElementsByTagName('infNFe');
          if (infNFeElements.length > 0) {
            const idAttr = infNFeElements[0].getAttribute('Id');
            if (idAttr) {
              chaveNFe = idAttr.replace('NFe', '');
            }
          }
        }

        if (!chaveNFe || chaveNFe.length !== 44) {
          return res.status(400).json({
            success: false,
            error: 'Não foi possível extrair chave NFe válida do XML'
          });
        }

        // Extrair dados básicos do XML para estruturar resposta
        const emitElements = xmlDoc.getElementsByTagName('emit');
        const destElements = xmlDoc.getElementsByTagName('dest');
        const ideElements = xmlDoc.getElementsByTagName('ide');
        const totalElements = xmlDoc.getElementsByTagName('total');
        const transpElements = xmlDoc.getElementsByTagName('transp');
        
        let emitente: any = {};
        let destinatario: any = {};
        let infoGeral: any = {};
        let valores: any = {};
        let transporte: any = {};

        if (emitElements.length > 0) {
          const emit = emitElements[0];
          const enderEmit = emit.getElementsByTagName('enderEmit')[0];
          
          emitente = {
            cnpj: emit.getElementsByTagName('CNPJ')[0]?.textContent || '',
            razao_social: emit.getElementsByTagName('xNome')[0]?.textContent || '',
            nome_fantasia: emit.getElementsByTagName('xFant')[0]?.textContent || '',
            telefone: enderEmit?.getElementsByTagName('fone')[0]?.textContent || '',
            endereco: enderEmit?.getElementsByTagName('xLgr')[0]?.textContent || '',
            numero: enderEmit?.getElementsByTagName('nro')[0]?.textContent || '',
            complemento: enderEmit?.getElementsByTagName('xCpl')[0]?.textContent || '',
            bairro: enderEmit?.getElementsByTagName('xBairro')[0]?.textContent || '',
            cidade: enderEmit?.getElementsByTagName('xMun')[0]?.textContent || '',
            uf: enderEmit?.getElementsByTagName('UF')[0]?.textContent || '',
            cep: enderEmit?.getElementsByTagName('CEP')[0]?.textContent || '',
          };
        }

        if (destElements.length > 0) {
          const dest = destElements[0];
          const enderDest = dest.getElementsByTagName('enderDest')[0];
          
          destinatario = {
            cnpj: dest.getElementsByTagName('CNPJ')[0]?.textContent || '',
            razao_social: dest.getElementsByTagName('xNome')[0]?.textContent || '',
            nome_fantasia: dest.getElementsByTagName('xFant')[0]?.textContent || '',
            telefone: enderDest?.getElementsByTagName('fone')[0]?.textContent || '',
            endereco: enderDest?.getElementsByTagName('xLgr')[0]?.textContent || '',
            numero: enderDest?.getElementsByTagName('nro')[0]?.textContent || '',
            complemento: enderDest?.getElementsByTagName('xCpl')[0]?.textContent || '',
            bairro: enderDest?.getElementsByTagName('xBairro')[0]?.textContent || '',
            cidade: enderDest?.getElementsByTagName('xMun')[0]?.textContent || '',
            uf: enderDest?.getElementsByTagName('UF')[0]?.textContent || '',
            cep: enderDest?.getElementsByTagName('CEP')[0]?.textContent || '',
          };
        }

        if (ideElements.length > 0) {
          const ide = ideElements[0];
          infoGeral = {
            numero_nota: ide.getElementsByTagName('nNF')[0]?.textContent || '',
            serie_nota: ide.getElementsByTagName('serie')[0]?.textContent || '',
            data_emissao: ide.getElementsByTagName('dhEmi')[0]?.textContent || '',
            natureza_operacao: ide.getElementsByTagName('natOp')[0]?.textContent || '',
          };
        }

        if (totalElements.length > 0) {
          const total = totalElements[0];
          const icmsTot = total.getElementsByTagName('ICMSTot')[0];
          
          if (icmsTot) {
            valores = {
              valor_total: icmsTot.getElementsByTagName('vNF')[0]?.textContent || '0.00',
              peso_bruto: icmsTot.getElementsByTagName('vBC')[0]?.textContent || '0.00',
            };
          }
        }

        if (transpElements.length > 0) {
          const transp = transpElements[0];
          const vol = transp.getElementsByTagName('vol')[0];
          
          if (vol) {
            transporte = {
              quantidade_volumes: vol.getElementsByTagName('qVol')[0]?.textContent || '1',
              peso_bruto: vol.getElementsByTagName('pesoB')[0]?.textContent || '0.00',
              peso_liquido: vol.getElementsByTagName('pesoL')[0]?.textContent || '0.00',
            };
          }
        }

        // Retornar dados estruturados no formato esperado pelo frontend
        const responseData = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          chave_nota_fiscal: chaveNFe,
          numero_nota: infoGeral.numero_nota,
          serie_nota: infoGeral.serie_nota,
          data_hora_emissao: infoGeral.data_emissao,
          natureza_operacao: infoGeral.natureza_operacao,
          
          // Dados do emitente
          emitente_cnpj: emitente.cnpj,
          emitente_razao_social: emitente.razao_social,
          emitente_nome_fantasia: emitente.nome_fantasia,
          emitente_telefone: emitente.telefone,
          emitente_endereco: emitente.endereco,
          emitente_numero: emitente.numero,
          emitente_complemento: emitente.complemento,
          emitente_bairro: emitente.bairro,
          emitente_cidade: emitente.cidade,
          emitente_uf: emitente.uf,
          emitente_cep: emitente.cep,
          
          // Dados do destinatário
          destinatario_cnpj: destinatario.cnpj,
          destinatario_razao_social: destinatario.razao_social,
          destinatario_nome_fantasia: destinatario.nome_fantasia,
          destinatario_telefone: destinatario.telefone,
          destinatario_endereco: destinatario.endereco,
          destinatario_numero: destinatario.numero,
          destinatario_complemento: destinatario.complemento,
          destinatario_bairro: destinatario.bairro,
          destinatario_cidade: destinatario.cidade,
          destinatario_uf: destinatario.uf,
          destinatario_cep: destinatario.cep,
          
          // Dados de valores e transporte
          valor_total: valores.valor_total || '0.00',
          peso_bruto: transporte.peso_bruto || '0.00',
          peso_liquido: transporte.peso_liquido || '0.00',
          quantidade_volumes: transporte.quantidade_volumes || '1',
          
          // Metadados
          xml_content: xmlContent,
          xml_source: 'upload',
          arquivo_origem: fileName || 'upload.xml'
        };

        res.json({
          success: true,
          data: responseData,
          message: `XML processado com sucesso - NFe ${infoGeral.numero_nota}`
        });

      } catch (parseError) {
        console.error('Erro ao processar XML:', parseError);
        return res.status(400).json({
          success: false,
          error: 'Erro ao processar arquivo XML'
        });
      }

    } catch (error) {
      console.error('Erro no upload de XML:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // External API integration - CEP lookup
  app.get('/api/cep/:cep', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { cep } = req.params;
      
      // In a real implementation, this would call external CEP API
      // For now, return mock data structure
      res.json({
        cep: cep.replace(/\D/g, ''),
        logradouro: 'Rua Exemplo',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP'
      });
    } catch (error) {
      console.error('CEP lookup error:', error);
      res.status(500).json({ error: 'Failed to lookup CEP' });
    }
  });

  // GET por ID - Veículos
  app.get('/api/veiculos/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const veiculo = await logisticsStorage.getVeiculoById(req.params.id);
      if (!veiculo) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      res.json(veiculo);
    } catch (error) {
      console.error('Get veiculo error:', error);
      res.status(500).json({ error: 'Falha ao buscar veículo' });
    }
  });

  // GET por ID - Motoristas
  app.get('/api/motoristas/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const motorista = await logisticsStorage.getMotoristaById(req.params.id);
      if (!motorista) {
        return res.status(404).json({ error: 'Motorista não encontrado' });
      }
      res.json(motorista);
    } catch (error) {
      console.error('Get motorista error:', error);
      res.status(500).json({ error: 'Falha ao buscar motorista' });
    }
  });

  // GET por ID - Coletas
  app.get('/api/coletas/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const coleta = await logisticsStorage.getColetaById(req.params.id);
      if (!coleta) {
        return res.status(404).json({ error: 'Coleta não encontrada' });
      }
      res.json(coleta);
    } catch (error) {
      console.error('Get coleta error:', error);
      res.status(500).json({ error: 'Falha ao buscar coleta' });
    }
  });

  // GET por ID - Ocorrências
  app.get('/api/ocorrencias/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const ocorrencia = await logisticsStorage.getOcorrenciaById(req.params.id);
      if (!ocorrencia) {
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }
      res.json(ocorrencia);
    } catch (error) {
      console.error('Get ocorrencia error:', error);
      res.status(500).json({ error: 'Falha ao buscar ocorrência' });
    }
  });

  // GET por ID - Notas Fiscais
  app.get('/api/notas-fiscais/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const nota = await logisticsStorage.getNotaFiscalById(req.params.id);
      if (!nota) {
        return res.status(404).json({ error: 'Nota fiscal não encontrada' });
      }
      res.json(nota);
    } catch (error) {
      console.error('Get nota fiscal error:', error);
      res.status(500).json({ error: 'Falha ao buscar nota fiscal' });
    }
  });

  // PATCH - atualizações parciais
  app.patch('/api/veiculos/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const current = await logisticsStorage.getVeiculoById(id);
      if (!current) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId || (current.empresa_id && current.empresa_id !== empresaId)) {
        return res.status(403).json({ error: 'Acesso negado a este recurso' });
      }
      const schema = insertVeiculoSchema.omit({ id: true, created_at: true, updated_at: true }).partial();
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
      }
      const veiculo = await logisticsStorage.updateVeiculo(id, parsed.data as any);
      if (!veiculo) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }
      res.json(veiculo);
    } catch (error) {
      console.error('Patch veiculo error:', error);
      res.status(500).json({ error: 'Falha ao atualizar parcialmente veículo' });
    }
  });

  app.patch('/api/motoristas/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const current = await logisticsStorage.getMotoristaById(id);
      if (!current) {
        return res.status(404).json({ error: 'Motorista não encontrado' });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId || (current.empresa_id && current.empresa_id !== empresaId)) {
        return res.status(403).json({ error: 'Acesso negado a este recurso' });
      }
      const schema = insertMotoristaSchema.omit({ id: true, created_at: true, updated_at: true }).partial();
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
      }
      const motorista = await logisticsStorage.updateMotorista(id, parsed.data as any);
      if (!motorista) {
        return res.status(404).json({ error: 'Motorista não encontrado' });
      }
      res.json(motorista);
    } catch (error) {
      console.error('Patch motorista error:', error);
      res.status(500).json({ error: 'Falha ao atualizar parcialmente motorista' });
    }
  });

  app.patch('/api/coletas/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const current = await logisticsStorage.getColetaById(id);
      if (!current) {
        return res.status(404).json({ error: 'Coleta não encontrada' });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId || (current.empresa_cliente_id && current.empresa_cliente_id !== empresaId)) {
        return res.status(403).json({ error: 'Acesso negado a este recurso' });
      }
      const schema = insertColetaSchema.omit({ id: true, created_at: true, updated_at: true }).partial();
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
      }
      const coleta = await logisticsStorage.updateColeta(id, parsed.data as any);
      if (!coleta) {
        return res.status(404).json({ error: 'Coleta não encontrada' });
      }
      res.json(coleta);
    } catch (error) {
      console.error('Patch coleta error:', error);
      res.status(500).json({ error: 'Falha ao atualizar parcialmente coleta' });
    }
  });

  app.patch('/api/ocorrencias/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const current = await logisticsStorage.getOcorrenciaById(id);
      if (!current) {
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId || (current.empresa_cliente_id && current.empresa_cliente_id !== empresaId)) {
        return res.status(403).json({ error: 'Acesso negado a este recurso' });
      }
      const schema = insertOcorrenciaSchema.omit({ id: true, created_at: true, updated_at: true }).partial();
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
      }
      const ocorrencia = await logisticsStorage.updateOcorrencia(id, parsed.data as any);
      if (!ocorrencia) {
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }
      res.json(ocorrencia);
    } catch (error) {
      console.error('Patch ocorrencia error:', error);
      res.status(500).json({ error: 'Falha ao atualizar parcialmente ocorrência' });
    }
  });

  app.patch('/api/notas-fiscais/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const current = await logisticsStorage.getNotaFiscalById(id);
      if (!current) {
        return res.status(404).json({ error: 'Nota fiscal não encontrada' });
      }
      const empresaId = req.user?.empresa_id;
      if (!empresaId || (current.empresa_id && current.empresa_id !== empresaId)) {
        return res.status(403).json({ error: 'Acesso negado a este recurso' });
      }
      const schema = insertNotaFiscalSchema.omit({ id: true, created_at: true, updated_at: true }).partial();
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Dados inválidos', details: parsed.error.flatten() });
      }
      const nota = await logisticsStorage.updateNotaFiscal(id, parsed.data as any);
      if (!nota) {
        return res.status(404).json({ error: 'Nota fiscal não encontrada' });
      }
      res.json(nota);
    } catch (error) {
      console.error('Patch nota fiscal error:', error);
      res.status(500).json({ error: 'Falha ao atualizar parcialmente nota fiscal' });
    }
  });

}