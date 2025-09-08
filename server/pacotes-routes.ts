import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { db } from './db';
import { 
  pacotesSistema, 
  modulosSistema, 
  permissoes,
  assinaturas
} from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

// Validation schemas
const createPacoteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  preco_mensal: z.number().min(0, 'Preço deve ser positivo'),
  preco_anual: z.number().min(0, 'Preço deve ser positivo').optional(),
  limite_usuarios: z.number().min(1, 'Limite de usuários deve ser pelo menos 1').optional(),
  limite_filiais: z.number().min(1, 'Limite de filiais deve ser pelo menos 1').optional(),
  modulos_inclusos: z.array(z.string()).default([]),
  funcionalidades: z.array(z.string()).default([]),
  configuracoes: z.object({}).passthrough().optional(),
});

const updatePacoteSchema = createPacoteSchema.partial();

export function registerPacotesRoutes(app: Express) {
  
  // GET /api/admin/pacotes - Lista todos os pacotes
  app.get('/api/admin/pacotes', async (req: Request, res: Response) => {
    try {
      const pacotes = await db
        .select({
          id: pacotesSistema.id,
          nome: pacotesSistema.nome,
          descricao: pacotesSistema.descricao,
          preco_mensal: pacotesSistema.preco_mensal,
          preco_anual: pacotesSistema.preco_anual,
          limite_usuarios: pacotesSistema.limite_usuarios,
          limite_filiais: pacotesSistema.limite_filiais,
          modulos_inclusos: pacotesSistema.modulos_inclusos,
          funcionalidades: pacotesSistema.funcionalidades,
          ativo: pacotesSistema.ativo,
          created_at: pacotesSistema.created_at,
          updated_at: pacotesSistema.updated_at,
          // Adicionar contador de assinantes como 0 por enquanto
          assinantes_ativos: sql`0`.as('assinantes_ativos')
        })
        .from(pacotesSistema)
        .orderBy(pacotesSistema.nome);

      res.json(pacotes);
    } catch (error) {
      console.error('Erro ao buscar pacotes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // GET /api/admin/pacotes/:id - Busca pacote específico
  app.get('/api/admin/pacotes/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const pacote = await db
        .select()
        .from(pacotesSistema)
        .where(eq(pacotesSistema.id, id))
        .limit(1);

      if (pacote.length === 0) {
        return res.status(404).json({ error: 'Pacote não encontrado' });
      }

      // Os módulos inclusos já estão no campo JSON modulos_inclusos
      res.json(pacote[0]);
    } catch (error) {
      console.error('Erro ao buscar pacote:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // POST /api/admin/pacotes - Criar novo pacote
  app.post('/api/admin/pacotes', async (req: Request, res: Response) => {
    try {
      const validatedData = createPacoteSchema.parse(req.body);
      
      // Gerar ID único baseado no nome
      const pacoteId = validatedData.nome.toLowerCase().replace(/\s+/g, '-');
      
      const novoPacote = await db
        .insert(pacotesSistema)
        .values({
          id: pacoteId,
          nome: validatedData.nome,
          descricao: validatedData.descricao,
          tipo_pacote: 'modulo_sistema',
          preco_mensal: validatedData.preco_mensal.toString(),
          preco_anual: validatedData.preco_anual?.toString(),
          limite_usuarios: validatedData.limite_usuarios,
          limite_filiais: validatedData.limite_filiais,
          modulos_inclusos: validatedData.modulos_inclusos,
          funcionalidades: validatedData.funcionalidades,
          configuracoes: validatedData.configuracoes
        })
        .returning();

      // Módulos inclusos já estão salvos no campo JSON modulos_inclusos

      res.status(201).json(novoPacote);
    } catch (error) {
      console.error('Erro ao criar pacote:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors 
        });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // PUT /api/admin/pacotes/:id - Atualizar pacote
  app.put('/api/admin/pacotes/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validatedData = updatePacoteSchema.parse(req.body);
      
      // Verificar se pacote existe
      const pacoteExistente = await db
        .select()
        .from(pacotesSistema)
        .where(eq(pacotesSistema.id, id))
        .limit(1);

      if (pacoteExistente.length === 0) {
        return res.status(404).json({ error: 'Pacote não encontrado' });
      }

      // Atualizar pacote
      const updateData: any = {};
      if (validatedData.nome) updateData.nome = validatedData.nome;
      if (validatedData.descricao !== undefined) updateData.descricao = validatedData.descricao;
      if (validatedData.preco_mensal !== undefined) updateData.preco_mensal = validatedData.preco_mensal.toString();
      if (validatedData.preco_anual !== undefined) updateData.preco_anual = validatedData.preco_anual?.toString();
      if (validatedData.limite_usuarios !== undefined) updateData.limite_usuarios = validatedData.limite_usuarios;
      if (validatedData.limite_filiais !== undefined) updateData.limite_filiais = validatedData.limite_filiais;
      if (validatedData.modulos_inclusos !== undefined) updateData.modulos_inclusos = validatedData.modulos_inclusos;
      if (validatedData.funcionalidades !== undefined) updateData.funcionalidades = validatedData.funcionalidades;
      if (validatedData.configuracoes !== undefined) updateData.configuracoes = validatedData.configuracoes;

      updateData.updated_at = new Date();

      const pacoteAtualizado = await db
        .update(pacotesSistema)
        .set(updateData)
        .where(eq(pacotesSistema.id, id))
        .returning();

      res.json(pacoteAtualizado[0]);
    } catch (error) {
      console.error('Erro ao atualizar pacote:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: error.errors 
        });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // DELETE /api/admin/pacotes/:id - Excluir pacote
  app.delete('/api/admin/pacotes/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Verificar se há assinantes ativos antes de excluir
      const assinantesAtivos = await db
        .select()
        .from(assinaturas)
        .where(eq(assinaturas.pacote_id, id))
        .limit(1);

      if (assinantesAtivos.length > 0) {
        return res.status(400).json({ 
          error: 'Não é possível excluir pacote com assinantes ativos' 
        });
      }

      // Excluir pacote
      await db
        .delete(pacotesSistema)
        .where(eq(pacotesSistema.id, id));

      res.json({ message: 'Pacote excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir pacote:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // GET /api/admin/modulos - Lista todos os módulos disponíveis
  app.get('/api/admin/modulos', async (req: Request, res: Response) => {
    try {
      const modulos = await db
        .select()
        .from(modulosSistema)
        .orderBy(modulosSistema.categoria, modulosSistema.nome);

      res.json(modulos);
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // GET /api/admin/permissoes - Lista todas as permissões disponíveis
  app.get('/api/admin/permissoes', async (req: Request, res: Response) => {
    try {
      const permissoesDisponiveis = await db
        .select()
        .from(permissoes)
        .orderBy(permissoes.modulo, permissoes.acao);

      res.json(permissoesDisponiveis);
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });
}