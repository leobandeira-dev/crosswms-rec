import { Express, Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from './db';
import { assinaturas, pacotesSistema, empresas } from '../shared/schema';

export function registerSubscriptionRoutes(app: Express) {
  
  // Buscar assinaturas de uma empresa
  app.get('/api/empresas/:empresaId/assinaturas', async (req: Request, res: Response) => {
    try {
      const { empresaId } = req.params;
      
      const subscriptions = await db
        .select({
          id: assinaturas.id,
          empresa_id: assinaturas.empresa_id,
          pacote_id: assinaturas.pacote_id,
          data_inicio: assinaturas.data_inicio,
          data_vencimento: assinaturas.data_vencimento,
          valor_mensal: assinaturas.valor_mensal,
          status_pagamento: assinaturas.status_pagamento,
          pacote_nome: pacotesSistema.nome,
          pacote_tipo: pacotesSistema.tipo_pacote,
          pacote_preco: pacotesSistema.preco_mensal,
        })
        .from(assinaturas)
        .innerJoin(pacotesSistema, eq(assinaturas.pacote_id, pacotesSistema.id))
        .where(eq(assinaturas.empresa_id, empresaId));
      
      res.json(subscriptions);
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Buscar todos os pacotes disponíveis
  app.get('/api/pacotes-disponiveis', async (req: Request, res: Response) => {
    try {
      const packages = await db
        .select({
          id: pacotesSistema.id,
          nome: pacotesSistema.nome,
          descricao: pacotesSistema.descricao,
          tipo_pacote: pacotesSistema.tipo_pacote,
          preco_mensal: pacotesSistema.preco_mensal,
          limite_documentos_mes: pacotesSistema.limite_documentos_mes,
          modulos_inclusos: pacotesSistema.modulos_inclusos,
          ativo: pacotesSistema.ativo,
        })
        .from(pacotesSistema)
        .where(eq(pacotesSistema.ativo, true))
        .orderBy(pacotesSistema.tipo_pacote, pacotesSistema.preco_mensal);
      
      res.json(packages);
    } catch (error) {
      console.error('Erro ao buscar pacotes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Criar/Atualizar assinaturas de uma empresa
  app.post('/api/empresas/:empresaId/assinaturas', async (req: Request, res: Response) => {
    try {
      const { empresaId } = req.params;
      const { modules, processingPlan } = req.body;

      // Remover assinaturas antigas
      await db.delete(assinaturas).where(eq(assinaturas.empresa_id, empresaId));

      // Criar novas assinaturas
      const newSubscriptions = [];
      const currentDate = new Date();
      const expirationDate = new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 ano

      // Adicionar módulos selecionados
      for (const moduleId of modules) {
        const packageInfo = await db
          .select()
          .from(pacotesSistema)
          .where(eq(pacotesSistema.id, moduleId))
          .limit(1);

        if (packageInfo.length > 0) {
          newSubscriptions.push({
            empresa_id: empresaId,
            pacote_id: moduleId,
            data_inicio: currentDate,
            data_vencimento: expirationDate,
            valor_mensal: packageInfo[0].preco_mensal,
            status_pagamento: 'ativo' as const,
          });
        }
      }

      // Adicionar plano de processamento
      if (processingPlan) {
        const planInfo = await db
          .select()
          .from(pacotesSistema)
          .where(eq(pacotesSistema.id, processingPlan))
          .limit(1);

        if (planInfo.length > 0) {
          newSubscriptions.push({
            empresa_id: empresaId,
            pacote_id: processingPlan,
            data_inicio: currentDate,
            data_vencimento: expirationDate,
            valor_mensal: planInfo[0].preco_mensal,
            status_pagamento: 'ativo' as const,
          });
        }
      }

      // Inserir todas as assinaturas
      if (newSubscriptions.length > 0) {
        await db.insert(assinaturas).values(newSubscriptions);
      }

      res.json({ success: true, message: 'Assinaturas atualizadas com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar assinaturas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Buscar resumo financeiro de assinaturas por empresa
  app.get('/api/empresas/:empresaId/resumo-financeiro', async (req: Request, res: Response) => {
    try {
      const { empresaId } = req.params;
      
      const subscriptions = await db
        .select({
          valor_mensal: assinaturas.valor_mensal,
          pacote_nome: pacotesSistema.nome,
          pacote_tipo: pacotesSistema.tipo_pacote,
        })
        .from(assinaturas)
        .innerJoin(pacotesSistema, eq(assinaturas.pacote_id, pacotesSistema.id))
        .where(
          and(
            eq(assinaturas.empresa_id, empresaId),
            eq(assinaturas.status_pagamento, 'ativo')
          )
        );

      const modulesTotal = subscriptions
        .filter(s => s.pacote_tipo === 'modulo_sistema')
        .reduce((total, s) => total + parseFloat(s.valor_mensal?.toString() || '0'), 0);

      const processingTotal = subscriptions
        .filter(s => s.pacote_tipo === 'plano_processamento')
        .reduce((total, s) => total + parseFloat(s.valor_mensal?.toString() || '0'), 0);

      const totalMensal = modulesTotal + processingTotal;

      res.json({
        modules_total: modulesTotal,
        processing_total: processingTotal,
        total_mensal: totalMensal,
        modules_count: subscriptions.filter(s => s.pacote_tipo === 'modulo_sistema').length,
        processing_plan: subscriptions.find(s => s.pacote_tipo === 'plano_processamento')?.pacote_nome || null,
      });
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Cancelar assinatura específica
  app.delete('/api/assinaturas/:assinaturaId', async (req: Request, res: Response) => {
    try {
      const { assinaturaId } = req.params;
      
      await db
        .update(assinaturas)
        .set({ status_pagamento: 'cancelado' })
        .where(eq(assinaturas.id, assinaturaId));

      res.json({ success: true, message: 'Assinatura cancelada com sucesso' });
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });
}