import { Request, Response, Express } from 'express';
import { z } from 'zod';
import { db } from './db';
import { insertOrdemCargaSchema } from '@shared/schema';
import { notas_fiscais } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware de autenticação
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('carregamento-routes: No token provided');
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    console.log('carregamento-routes: Validating token:', token);
    const sessionData = await storage.getSessionByToken(token);
    console.log('carregamento-routes: Session data:', sessionData);
    
    if (!sessionData || !sessionData.session) {
      console.log('carregamento-routes: No valid session found');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { session, user } = sessionData;
    console.log('carregamento-routes: Session expires at:', session.expires_at, 'Current time:', new Date());
    
    if (new Date() > session.expires_at) {
      console.log('carregamento-routes: Token expired');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!user) {
      console.log('carregamento-routes: User not found');
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    console.log('carregamento-routes: Authentication successful for user:', user.email);
    next();
  } catch (error) {
    console.error('carregamento-routes: Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Validation schemas
const createOrdemCarregamentoSchema = z.object({
  tipo_movimentacao: z.string(),
  subtipo_operacao: z.string(),
  prioridade: z.string(),
  data_operacao: z.string(),
  observacoes: z.string().optional(),
  notasFiscais: z.array(z.any()),
  totalNotas: z.number(),
  totalValor: z.number(),
  totalPeso: z.number(),
  totalVolumes: z.number(),
  modulo: z.string()
});

export function registerCarregamentoRoutes(app: Express) {
  // List loading orders with search support
  app.get('/api/carregamentos', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { modulo, status, search } = req.query;
      
      let ordens;
      
      if (modulo) {
        ordens = await db.select()
          .from(ordens_carga)
          .where(eq(ordens_carga.tipo_carregamento, modulo as string))
          .orderBy(desc(ordens_carga.created_at));
      } else {
        ordens = await db.select()
          .from(ordens_carga)
          .orderBy(desc(ordens_carga.created_at));
      }

      // Se houver status filter, aplicar
      if (status) {
        ordens = ordens.filter(ordem => ordem.status === status);
      }

      // Se houver pesquisa, filtrar por texto
      if (search && typeof search === 'string' && search.trim() !== '') {
        const searchTerm = search.toLowerCase().trim();
        ordens = ordens.filter(ordem => 
          ordem.numero_carregamento?.toLowerCase().includes(searchTerm) ||
          ordem.endereco_coleta?.toLowerCase().includes(searchTerm) ||
          ordem.observacoes?.toLowerCase().includes(searchTerm) ||
          ordem.tipo_carregamento?.toLowerCase().includes(searchTerm)
        );
      }

      // Para cada ordem, buscar as notas fiscais relacionadas (simplificado)
      const ordensComDetalhes = await Promise.all(
        ordens.map(async (ordem) => {
          const itens = await db.select()
            .from(itens_carga)
            .where(eq(itens_carga.ordem_carga_id, ordem.id));

          return {
            ...ordem,
            notasFiscais: itens,
            totalNotas: itens.length
          };
        })
      );

      res.json(ordensComDetalhes);
    } catch (error) {
      console.error('List ordens carregamento error:', error);
      res.status(500).json({ error: 'Erro ao buscar ordens de carregamento' });
    }
  });

  // Get loading order by ID
  app.get('/api/ordens-carregamento/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      
      const ordem = await db.select()
        .from(ordens_carga)
        .where(eq(ordens_carga.id, id))
        .limit(1);

      if (!ordem.length) {
        return res.status(404).json({ error: 'Ordem de carregamento não encontrada' });
      }

      // Buscar notas fiscais relacionadas
      const itens = await db.select()
        .from(itens_carga)
        .where(eq(itens_carga.ordem_carga_id, id));

      const ordemCompleta = {
        ...ordem[0],
        notasFiscais: itens,
        totalNotas: itens.length
      };

      res.json(ordemCompleta);
    } catch (error) {
      console.error('Get ordem carregamento error:', error);
      res.status(500).json({ error: 'Erro ao buscar ordem de carregamento' });
    }
  });

  // Create loading order via FilaX or regular flow
  app.post('/api/carregamentos', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tipo_carregamento, tipo_movimentacao, subtipo_operacao, status, observacoes } = req.body;
      
      // Gerar número da ordem baseado no tipo
      let prefixo = '';
      switch (tipo_carregamento) {
        case 'Recebimento':
          prefixo = 'REC';
          break;
        case 'Expedição':
          prefixo = 'EXP';
          break;
        default:
          prefixo = 'ORD';
      }
      
      const numeroOrdem = `${prefixo}-${Date.now()}`;
      
      // Criar ordem simples
      const novaOrdem = {
        id: uuidv4(),
        numero_carregamento: numeroOrdem,
        tipo_carregamento: tipo_carregamento || 'Recebimento',
        tipo_movimentacao: tipo_movimentacao || 'Entrada',
        subtipo_operacao: subtipo_operacao || 'Recebimento',
        endereco_coleta: 'A definir',
        status: status || 'criada',
        observacoes: observacoes || null,
        remetente_razao_social: 'A definir',
        destinatario_razao_social: 'A definir',
        created_at: new Date(),
        updated_at: new Date()
      };

      const [ordemCriada] = await db.insert(ordens_carga)
        .values(novaOrdem)
        .returning();

      console.log('Ordem de carregamento criada via FilaX:', ordemCriada.numero_carregamento);
      res.json(ordemCriada);
    } catch (error) {
      console.error('Create ordem carregamento error:', error);
      res.status(500).json({ error: 'Erro ao criar ordem de carregamento' });
    }
  });

  // Create loading order (legacy route)
  app.post('/api/ordens-carregamento', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const validatedData = createOrdemCarregamentoSchema.parse(req.body);
      
      // Gerar número da ordem baseado no módulo
      let prefixo = '';
      switch (validatedData.modulo) {
        case 'armazenagem_recebimento':
          prefixo = 'REC';
          break;
        case 'coletas':
          prefixo = 'COL';
          break;
        case 'carregamento':
          prefixo = 'CAR';
          break;
        default:
          prefixo = 'ORD';
      }
      
      const numeroOrdem = `${prefixo}-${Date.now()}`;
      
      // Criar ordem de carregamento
      const novaOrdem = {
        id: uuidv4(),
        numero_ordem: numeroOrdem,
        tipo_carregamento: validatedData.modulo,
        endereco_destino: 'A definir',
        data_programada: new Date(validatedData.data_operacao),
        peso_total: validatedData.totalPeso.toString(),
        volume_total: validatedData.totalVolumes,
        status: 'criada',
        observacoes: validatedData.observacoes || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      const [ordemCriada] = await db.insert(ordens_carregamento)
        .values(novaOrdem)
        .returning();

      console.log('Ordem de carregamento criada:', ordemCriada.numero_ordem);

      // Relacionar notas fiscais com a ordem
      if (validatedData.notasFiscais && validatedData.notasFiscais.length > 0) {
        const itensCarregamento = validatedData.notasFiscais.map((nota: any) => ({
          id: uuidv4(),
          ordem_carregamento_id: ordemCriada.id,
          nota_fiscal_id: nota.id || nota.id_unico,
          peso_item: nota.peso_bruto || '0',
          volume_item: parseInt(nota.quantidade_volumes) || 1,
          status_conferencia: 'pendente',
          created_at: new Date()
        }));

        await db.insert(itens_carregamento).values(itensCarregamento);
        console.log(`Relacionadas ${itensCarregamento.length} notas fiscais à ordem ${numeroOrdem}`);
      }

      res.json({
        success: true,
        id: ordemCriada.id,
        numero_ordem: numeroOrdem,
        ordem: ordemCriada
      });

    } catch (error) {
      console.error('Create ordem carregamento error:', error);
      res.status(500).json({ 
        error: 'Erro ao criar ordem de carregamento',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });
}