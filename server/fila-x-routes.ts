import { Router, Request, Response } from 'express';
import { eq, and, desc, asc, sql, gte } from 'drizzle-orm';
import { db } from './db';
import { storage } from './storage';
import { 
  filaX,
  ordensFilaX,
  carregamentos,
  notas_fiscais,
  volumes_etiqueta,
  empresas,
  historicoFilaX,
  users,
  insertFilaXSchema,
  insertOrdemFilaXSchema,
  type InsertFilaX,
  type SelectFilaX,
  type InsertOrdemFilaX,
  type SelectOrdemFilaX
} from '../shared/schema';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware de autenticação
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: Function) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const sessionData = await storage.getSessionByToken(token);
    
    if (!sessionData || !sessionData.session) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    const { session, user } = sessionData;
    
    if (new Date() > session.expires_at) {
      return res.status(401).json({ error: 'Token expirado' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};

const router = Router();

export function registerFilaXRoutes(app: any) {
  app.use('/api/fila-x', router);
}

// Buscar todos os cartões da fila com suas ordens vinculadas
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: GET /api/fila-x called');
    
    // Buscar todos os cartões da empresa que não estão arquivados
    const cartoes = await db
      .select()
      .from(filaX)
      .where(
        and(
          eq(filaX.empresa_id, req.user!.empresa_id),
          eq(filaX.arquivado, false)
        )
      )
      .orderBy(asc(filaX.data_entrada));

    // Para cada cartão, buscar as ordens vinculadas
    const cartoesComOrdens = await Promise.all(
      cartoes.map(async (cartao) => {
        // Buscar ordens vinculadas a este cartão
        const ordensVinculadas = await db
          .select()
          .from(ordensFilaX)
          .where(eq(ordensFilaX.fila_x_id, cartao.id));
        
        console.log(`Cartão ${cartao.id}: ${ordensVinculadas.length} ordens vinculadas`);
        


        // Para cada ordem vinculada, buscar informações detalhadas
        const ordensDetalhadas = await Promise.all(
          ordensVinculadas.map(async (ordemVinculada) => {
            let ordemData = null;
            
            try {
              if (ordemVinculada.tipo_ordem === 'ordem_carga' && ordemVinculada.ordem_carga_id) {
                const ordensCargas = await db
                  .select()
                  .from(ordens_carga)
                  .where(eq(ordens_carga.id, ordemVinculada.ordem_carga_id))
                  .limit(1);
                
                if (ordensCargas.length > 0) {
                  ordemData = {
                    ...ordensCargas[0],
                    numero_referencia: ordensCargas[0].numero_ordem,
                    tipo_referencia: 'Ordem de Carga'
                  };
                }
              } else if (ordemVinculada.tipo_ordem === 'carregamento' && ordemVinculada.ordem_id) {
                const carregamentosData = await db
                  .select()
                  .from(carregamentos)
                  .where(eq(carregamentos.id, ordemVinculada.ordem_id))
                  .limit(1);
                
                if (carregamentosData.length > 0) {
                  ordemData = {
                    ...carregamentosData[0],
                    numero_referencia: carregamentosData[0].numero_carregamento,
                    tipo_referencia: 'Carregamento'
                  };
                }
              }
            } catch (orderError) {
              console.log('fila-x-routes: Error fetching order info:', orderError);
            }

            return {
              ...ordemVinculada,
              ordem_data: ordemData
            };
          })
        );

        const resultado = {
          ...cartao,
          ordens_vinculadas: ordensDetalhadas
        };
        
        console.log(`Resultado final cartão ${cartao.id}:`, {
          titulo: cartao.titulo_cartao,
          ordens_count: ordensDetalhadas.length
        });

        return resultado;
      })
    );

    console.log(`fila-x-routes: Found ${cartoesComOrdens.length} cartões in fila`);
    res.json(cartoesComOrdens);
  } catch (error) {
    console.error('fila-x-routes: Error fetching fila items:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Criar novo cartão na fila
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: POST /api/fila-x called');
    console.log('fila-x-routes: Request body:', req.body);

    const { 
      titulo_cartao,
      motorista_nome,
      veiculo_placa,
      tipo_operacao,
      prioridade,
      observacoes 
    } = req.body;

    // Verificar se já existe cartão ativo recente para evitar duplicação
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Verificação mais robusta - evitar cartões com mesmo motorista/veículo OU mesma ordem vinculada
    let existingCard = [];
    
    if (motorista_nome && veiculo_placa) {
      existingCard = await db
        .select()
        .from(filaX)
        .where(
          and(
            eq(filaX.empresa_id, req.user!.empresa_id),
            eq(filaX.motorista_nome, motorista_nome),
            eq(filaX.veiculo_placa, veiculo_placa),
            eq(filaX.arquivado, false),
            gte(filaX.created_at, fiveMinutesAgo)
          )
        )
        .limit(1);
    }
    
    // Se está tentando vincular uma ordem específica, verificar se já não existe cartão para essa ordem
    if (req.body.ordem_id && existingCard.length === 0) {
      const existingOrderCard = await db
        .select({
          cartao_id: ordensFilaX.fila_x_id,
          cartao: filaX
        })
        .from(ordensFilaX)
        .innerJoin(filaX, eq(ordensFilaX.fila_x_id, filaX.id))
        .where(
          and(
            eq(ordensFilaX.ordem_carga_id, req.body.ordem_id),
            eq(ordensFilaX.empresa_id, req.user!.empresa_id),
            eq(filaX.arquivado, false)
          )
        )
        .limit(1);
        
      if (existingOrderCard.length > 0) {
        console.log('fila-x-routes: Ordem já vinculada ao cartão:', existingOrderCard[0].cartao_id);
        return res.status(200).json(existingOrderCard[0].cartao);
      }
    }

    if (existingCard.length > 0) {
      console.log('fila-x-routes: Cartão recente já existe, retornando existente:', existingCard[0].id);
      return res.status(200).json(existingCard[0]);
    }

    // Criar título automático se não fornecido
    const tituloFinal = titulo_cartao || 
      (motorista_nome && veiculo_placa ? `${motorista_nome} - ${veiculo_placa}` :
       motorista_nome ? motorista_nome :
       veiculo_placa ? `Veículo ${veiculo_placa}` :
       'Novo Cartão');

    // Criar novo cartão na fila
    const novoCartao = await db
      .insert(filaX)
      .values({
        titulo_cartao: tituloFinal,
        tipo_operacao: tipo_operacao || 'recebimento',
        estagio: 'triagem',
        data_entrada: new Date(),
        data_atualizacao: new Date(),
        observacoes: observacoes || 'Cartão criado',
        tempo_espera: 0,
        posicao_fila: 1,
        motorista_nome,
        veiculo_placa,
        prioridade: prioridade || 'normal',
        motorista_notificado: false,
        empresa_id: req.user!.empresa_id
      })
      .returning();

    // Registrar no histórico com timestamp explícito
    const timestampCriacao = new Date();
    await db
      .insert(historicoFilaX)
      .values({
        fila_x_id: novoCartao[0].id,
        acao: 'cartao_criado',
        estagio_anterior: null,
        estagio_novo: 'triagem',
        observacoes: 'Novo cartão criado na fila',
        data_acao: timestampCriacao,
        data_alteracao: timestampCriacao,
        usuario_id: req.user!.id,
        empresa_id: req.user!.empresa_id
      });

    const cartaoCriado = novoCartao[0];
    console.log('fila-x-routes: Novo cartão criado:', cartaoCriado);

    // Se foi passado um ordem_id, vincular a ordem ao cartão
    if (req.body.ordem_id) {
      try {
        console.log('fila-x-routes: Vinculando ordem', req.body.ordem_id, 'ao cartão', cartaoCriado.id);
        
        await db.insert(ordensFilaX).values({
          fila_x_id: cartaoCriado.id,
          ordem_carga_id: req.body.ordem_id,
          tipo_ordem: 'ordem_carga',
          data_vinculacao: new Date(),
          observacoes: 'Vinculado automaticamente na criação do cartão',
          empresa_id: req.user!.empresa_id
        });

        console.log('fila-x-routes: Ordem vinculada com sucesso');
      } catch (vinculacaoError) {
        console.error('fila-x-routes: Erro ao vincular ordem:', vinculacaoError);
        // Não falhar a criação do cartão por erro na vinculação
      }
    }
    
    res.json(cartaoCriado);
  } catch (error) {
    console.error('fila-x-routes: Error creating cartão:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Vincular ordem a um cartão existente
router.post('/:id/vincular-ordem', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: POST /api/fila-x/:id/vincular-ordem called');
    console.log('fila-x-routes: Request params:', req.params);
    console.log('fila-x-routes: Request body:', req.body);

    const { id } = req.params;
    const { ordem_id } = req.body;

    // Verificar se o cartão existe
    console.log(`fila-x-routes: Looking for cartao with id: ${id} empresa_id: ${req.user!.empresa_id}`);
    const cartao = await db
      .select()
      .from(filaX)
      .where(
        and(
          eq(filaX.id, id),
          eq(filaX.empresa_id, req.user!.empresa_id)
        )
      )
      .limit(1);

    if (cartao.length === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }
    console.log('fila-x-routes: Found cartao: YES');

    // Primeiro, tentar encontrar na tabela ordens_carga
    console.log(`fila-x-routes: Looking for ordem with id: ${ordem_id}`);
    let ordem = await db
      .select()
      .from(ordens_carga)
      .where(eq(ordens_carga.id, ordem_id))
      .limit(1);

    let tipoOrdem = 'ordem_carga';
    let ordemCarregaId = null;
    let ordemId = null;

    if (ordem.length > 0) {
      ordemCarregaId = ordem_id;
      console.log('fila-x-routes: Found ordem: YES');
    } else {
      // Se não encontrar, tentar na tabela carregamentos
      const ordemCarregamento = await db
        .select()
        .from(carregamentos)
        .where(eq(carregamentos.id, ordem_id))
        .limit(1);
      
      if (ordemCarregamento.length > 0) {
        ordem = ordemCarregamento as any;
        tipoOrdem = 'carregamento';
        ordemId = ordem_id;
        console.log('fila-x-routes: Found ordem: YES');
      }
    }

    if (ordem.length === 0) {
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }

    // Verificar se a ordem já está vinculada a este cartão
    const vinculacaoExistente = await db
      .select()
      .from(ordensFilaX)
      .where(
        and(
          eq(ordensFilaX.fila_x_id, id),
          ordemCarregaId ? eq(ordensFilaX.ordem_carga_id, ordemCarregaId) : eq(ordensFilaX.ordem_id, ordemId)
        )
      )
      .limit(1);

    if (vinculacaoExistente.length > 0) {
      console.log('fila-x-routes: Vinculação já existe - retornando erro 409');
      return res.status(409).json({ 
        error: 'Ordem já vinculada',
        message: `Esta ordem já está vinculada a este cartão.`,
        codigo: 'ORDEM_JA_VINCULADA'
      });
    }

    // Criar a vinculação
    const novaVinculacao = await db
      .insert(ordensFilaX)
      .values({
        fila_x_id: id,
        ordem_id: ordemId,
        ordem_carga_id: ordemCarregaId,
        tipo_ordem: tipoOrdem,
        observacoes: 'Ordem vinculada ao cartão',
        empresa_id: req.user!.empresa_id
      })
      .returning();

    // Registrar no histórico com timestamp explícito
    const timestampVinculacao = new Date();
    await db
      .insert(historicoFilaX)
      .values({
        fila_x_id: id,
        ordem_fila_x_id: novaVinculacao[0].id,
        acao: 'ordem_vinculada',
        observacoes: `Ordem ${tipoOrdem} vinculada ao cartão`,
        data_acao: timestampVinculacao,
        data_alteracao: timestampVinculacao,
        usuario_id: req.user!.id,
        empresa_id: req.user!.empresa_id
      });

    res.json({ success: true, vinculacao: novaVinculacao[0] });
  } catch (error) {
    console.error('fila-x-routes: Error vinculando ordem:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Mover item entre estágios
router.put('/:id/mover', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: PUT /api/fila-x/:id/mover called');
    console.log('fila-x-routes: Item ID:', req.params.id);
    console.log('fila-x-routes: Request body:', req.body);

    const { id } = req.params;
    const { estagio, observacoes } = req.body;

    // Validar estágio - aceitar qualquer string não vazia para permitir etapas personalizadas
    if (!estagio || typeof estagio !== 'string' || estagio.trim().length === 0) {
      return res.status(400).json({ error: 'Estágio deve ser uma string não vazia' });
    }

    // Verificar se o item existe e pertence à empresa (simplificado para aceitar ambos os tipos)
    const filaItem = await db
      .select()
      .from(filaX)
      .where(
        and(
          eq(filaX.id, id),
          eq(filaX.empresa_id, req.user!.empresa_id)
        )
      )
      .limit(1);

    if (filaItem.length === 0) {
      console.log('fila-x-routes: Item not found for ID:', id, 'empresa:', req.user!.empresa_id);
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    const item = filaItem[0];
    console.log('fila-x-routes: Found item:', item);

    // Calcular tempo de espera em minutos (mais preciso e com validação) - fuso São Paulo
    const agora = new Date();
    // Ajustar para timezone de São Paulo (UTC-3)
    const agoraSaoPaulo = new Date(agora.getTime() - (3 * 60 * 60 * 1000));
    const entrada = new Date(item.data_entrada);
    
    // Verificar se a data é válida
    if (isNaN(entrada.getTime())) {
      console.log('fila-x-routes: Data de entrada inválida:', item.data_entrada);
      return res.status(400).json({ error: 'Data de entrada inválida' });
    }
    
    const tempoEsperaMs = agora.getTime() - entrada.getTime();
    // Garantir que não seja negativo
    const tempoEsperaMinutos = Math.max(0, Math.floor(tempoEsperaMs / (1000 * 60)));

    // Atualizar item
    const updatedItem = await db
      .update(filaX)
      .set({
        estagio: estagio as any,
        data_atualizacao: agoraSaoPaulo,
        observacoes: observacoes || item.observacoes,
        tempo_espera: tempoEsperaMinutos,
        motorista_notificado: estagio === 'apresentar' ? true : item.motorista_notificado
      })
      .where(eq(filaX.id, id))
      .returning();

    // Registrar histórico com timestamp explícito de São Paulo para garantir precisão
    await db.insert(historicoFilaX).values({
      fila_x_id: item.id,
      acao: 'movido',
      estagio_anterior: item.estagio,
      estagio_novo: estagio,
      observacoes: observacoes || `Movido para ${estagio}`,
      data_acao: agoraSaoPaulo,        // Data/hora São Paulo
      data_alteracao: agoraSaoPaulo,   // Data/hora São Paulo
      usuario_id: req.user!.id,
      empresa_id: req.user!.empresa_id
    });

    // Se moveu para "finalizado", atualizar status das ordens vinculadas
    if (estagio === 'finalizado') {
      const ordensVinculadas = await db
        .select()
        .from(ordensFilaX)
        .where(eq(ordensFilaX.fila_x_id, id));

      for (const ordem of ordensVinculadas) {
        if (ordem.tipo_ordem === 'carregamento' && ordem.ordem_id) {
          // Atualizar carregamento
          await db
            .update(carregamentos)
            .set({
              status: 'recebida',
              data_inicio: agora,
              updated_at: agora
            })
            .where(eq(carregamentos.id, ordem.ordem_id));
        } else if (ordem.tipo_ordem === 'ordem_carga' && ordem.ordem_carga_id) {
          // Atualizar ordem_carga
          await db
            .update(ordens_carga)
            .set({
              status: 'recebida',
              updated_at: agora
            })
            .where(eq(ordens_carga.id, ordem.ordem_carga_id));
        }
      }
    }

    console.log('fila-x-routes: Item moved successfully:', updatedItem[0]);
    res.json(updatedItem[0]);
  } catch (error) {
    console.error('fila-x-routes: Error moving item:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Editar dados do motorista de um item na fila
router.patch('/:id/editar', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: PATCH /api/fila-x/:id/editar called');
    console.log('fila-x-routes: Item ID:', req.params.id);
    console.log('fila-x-routes: Request body:', req.body);

    const { id } = req.params;
    const { motorista_nome, veiculo_placa, doca_designada, estagio } = req.body;

    // Verificar se o item existe e pertence à empresa
    const filaItem = await db
      .select()
      .from(filaX)
      .where(
        and(
          eq(filaX.id, id),
          eq(filaX.empresa_id, req.user!.empresa_id)
        )
      )
      .limit(1);

    if (filaItem.length === 0) {
      console.log('fila-x-routes: Item not found for ID:', id, 'empresa:', req.user!.empresa_id);
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    const item = filaItem[0];

    // Atualizar dados do motorista
    const updatedItem = await db
      .update(filaX)
      .set({
        motorista_nome: motorista_nome || item.motorista_nome,
        veiculo_placa: veiculo_placa || item.veiculo_placa,
        doca_designada: doca_designada || item.doca_designada,
        estagio: estagio || item.estagio,
        data_atualizacao: new Date(),
        observacoes: `${item.observacoes} - Dados atualizados: ${motorista_nome ? `Motorista: ${motorista_nome}` : ''} ${veiculo_placa ? `Placa: ${veiculo_placa}` : ''} ${doca_designada ? `Doca: ${doca_designada}` : ''} ${estagio ? `Estágio: ${estagio}` : ''}`.trim()
      })
      .where(eq(filaX.id, id))
      .returning();

    // Registrar histórico
    await db.insert(historicoFilaX).values({
      fila_x_id: item.id,
      tipo_ordem: item.tipo_ordem || 'ordem_carga',
      acao: estagio && estagio !== item.estagio ? 'movido' : 'editado',
      estagio_anterior: item.estagio,
      estagio_novo: estagio || item.estagio,
      observacoes: `Dados atualizados: ${motorista_nome ? `Nome: ${motorista_nome}` : ''} ${veiculo_placa ? `Placa: ${veiculo_placa}` : ''} ${doca_designada ? `Doca: ${doca_designada}` : ''} ${estagio && estagio !== item.estagio ? `Movido para: ${estagio}` : ''}`.trim(),
      usuario_id: req.user!.id,
      empresa_id: req.user!.empresa_id
    });

    console.log('fila-x-routes: Item updated successfully:', updatedItem[0]);
    res.json(updatedItem[0]);
  } catch (error) {
    console.error('fila-x-routes: Error updating item:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar histórico de um item específico da fila
router.get('/:id/historico', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log('fila-x-routes: GET /api/fila-x/:id/historico called', { id });

    // Buscar histórico do item
    const historico = await db
      .select({
        id: historicoFilaX.id,
        acao: historicoFilaX.acao,
        estagio_anterior: historicoFilaX.estagio_anterior,
        estagio_novo: historicoFilaX.estagio_novo,
        observacoes: historicoFilaX.observacoes,
        data_acao: historicoFilaX.data_acao,
        created_at: historicoFilaX.created_at,
        usuario_nome: users.nome
      })
      .from(historicoFilaX)
      .leftJoin(users, eq(historicoFilaX.usuario_id, users.id))
      .where(and(
        eq(historicoFilaX.fila_x_id, id),
        eq(historicoFilaX.empresa_id, req.user!.empresa_id)
      ))
      .orderBy(desc(historicoFilaX.created_at));

    // Se não há histórico, criar um histórico retroativo baseado na criação do item
    if (historico.length === 0) {
      console.log('fila-x-routes: No history found, creating retroactive history');
      
      // Buscar o item da fila
      const filaItem = await db
        .select()
        .from(filaX)
        .where(
          and(
            eq(filaX.id, id),
            eq(filaX.empresa_id, req.user!.empresa_id)
          )
        )
        .limit(1);
      
      console.log('fila-x-routes: Found fila item for retroactive history:', filaItem.length > 0 ? 'YES' : 'NO');
      
      if (filaItem.length > 0) {
        const item = filaItem[0];
        console.log('fila-x-routes: Item details for retroactive history:', item);
        
        // Criar histórico retroativo de adição
        await db
          .insert(historicoFilaX)
          .values({
            fila_x_id: item.id,
            ordem_id: item.ordem_id,
            ordem_carga_id: item.ordem_carga_id,
            tipo_ordem: item.tipo_ordem || 'ordem_carga',
            acao: 'adicionado',
            estagio_anterior: null,
            estagio_novo: 'triagem',
            observacoes: 'Histórico criado retroativamente',
            usuario_id: 'b80260fb-a98b-4b76-9a34-f6120bf2b217', // ID super admin como padrão
            empresa_id: item.empresa_id,
            data_acao: item.created_at || new Date(), // Usar data de criação do item
          });
        
        console.log('fila-x-routes: Created retroactive history for item:', item.id);
        
        // Buscar novamente o histórico com os dados do usuário
        const novoHistorico = await db
          .select({
            id: historicoFilaX.id,
            acao: historicoFilaX.acao,
            estagio_anterior: historicoFilaX.estagio_anterior,
            estagio_novo: historicoFilaX.estagio_novo,
            observacoes: historicoFilaX.observacoes,
            data_acao: historicoFilaX.data_acao,
            created_at: historicoFilaX.created_at,
            usuario_nome: users.nome
          })
          .from(historicoFilaX)
          .leftJoin(users, eq(historicoFilaX.usuario_id, users.id))
          .where(and(
            eq(historicoFilaX.fila_x_id, id),
            eq(historicoFilaX.empresa_id, req.user!.empresa_id)
          ))
          .orderBy(desc(historicoFilaX.created_at));
        
        console.log(`fila-x-routes: Found ${novoHistorico.length} history records after creating retroactive`);
        return res.json(novoHistorico);
      }
    }
    
    console.log('fila-x-routes: Found', historico.length, 'history records');
    res.json(historico);
  } catch (error) {
    console.error('Erro ao buscar histórico da fila:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar itens arquivados (DEVE VIR ANTES da rota /:id)
router.get('/arquivados', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: GET /api/fila-x/arquivados called');
    console.log('fila-x-routes: User empresa_id:', req.user!.empresa_id);
    
    // Buscar os cartões arquivados de forma simples
    let cartoesFormatados: any[] = [];
    
    try {
      const cartoesArquivados = await db
        .select()
        .from(filaX)
        .where(
          and(
            eq(filaX.empresa_id, req.user!.empresa_id),
            eq(filaX.arquivado, true)
          )
        )
        .orderBy(desc(filaX.data_arquivamento));

      console.log('fila-x-routes: Found', cartoesArquivados.length, 'archived items');
      
      cartoesFormatados = cartoesArquivados.map(cartao => ({
        ...cartao,
        observacoes_arquivo: 'Arquivado',
        usuario_arquivo: 'Sistema'
      }));
    } catch (dbError) {
      console.error('fila-x-routes: Database error:', dbError);
      cartoesFormatados = [];
    }

    console.log('fila-x-routes: Returning', cartoesFormatados.length, 'formatted archived items');
    res.json(cartoesFormatados);

  } catch (error) {
    console.error('fila-x-routes: Error fetching archived items:', error);
    console.error('fila-x-routes: Error stack:', error.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar histórico da FilaX
router.get('/historico', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: GET /api/fila-x/historico called');
    
    const historico = await db
      .select({
        id: historicoFilaX.id,
        item_id: historicoFilaX.fila_x_id, // Renomear para compatibilidade com frontend
        fila_x_id: historicoFilaX.fila_x_id,
        ordem_id: historicoFilaX.ordem_id,
        ordem_carga_id: historicoFilaX.ordem_carga_id,
        tipo_ordem: historicoFilaX.tipo_ordem,
        acao: historicoFilaX.acao,
        campo_alterado: historicoFilaX.estagio_novo, // Mapear para compatibilidade
        valor_anterior: historicoFilaX.estagio_anterior,
        valor_novo: historicoFilaX.estagio_novo,
        estagio_anterior: historicoFilaX.estagio_anterior,
        estagio_novo: historicoFilaX.estagio_novo,
        observacoes: historicoFilaX.observacoes,
        data_alteracao: historicoFilaX.data_acao, // Mapear para compatibilidade
        data_acao: historicoFilaX.data_acao,
        usuario_nome: users.nome
      })
      .from(historicoFilaX)
      .leftJoin(users, eq(historicoFilaX.usuario_id, users.id))
      .where(eq(historicoFilaX.empresa_id, req.user!.empresa_id))
      .orderBy(desc(historicoFilaX.data_acao))
      .limit(500); // Aumentar para 500 para mais dados históricos

    console.log(`fila-x-routes: Returning ${historico.length} historical records`);
    res.json(historico);
  } catch (error) {
    console.error('fila-x-routes: Error fetching historico:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Buscar detalhes de um item específico
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: GET /api/fila-x/:id called');
    
    const { id } = req.params;

    const item = await db
      .select({
        id: filaX.id,
        ordem_id: filaX.ordem_id,
        estagio: filaX.estagio,
        data_entrada: filaX.data_entrada,
        data_atualizacao: filaX.data_atualizacao,
        observacoes: filaX.observacoes,
        tempo_espera: filaX.tempo_espera,
        posicao_fila: filaX.posicao_fila,
        doca_designada: filaX.doca_designada,
        motorista_notificado: filaX.motorista_notificado,
        ordem: carregamentos
      })
      .from(filaX)
      .innerJoin(carregamentos, eq(filaX.ordem_id, carregamentos.id))
      .where(
        and(
          eq(filaX.id, id),
          eq(carregamentos.empresa_id, req.user!.empresa_id)
        )
      )
      .limit(1);

    if (item.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Buscar notas fiscais e volumes
    const notasFiscaisData = await db
      .select()
      .from(notas_fiscais)
      .where(eq(notas_fiscais.empresa_id, req.user!.empresa_id))
      .limit(10);

    const volumesData = await db
      .select()
      .from(volumes_etiqueta)
      .where(eq(volumes_etiqueta.empresa_id, req.user!.empresa_id))
      .limit(10);

    const itemWithDetails = {
      ...item[0],
      ordem: {
        ...item[0].ordem,
        notasFiscais: notasFiscaisData,
        volumes: volumesData
      }
    };

    res.json(itemWithDetails);
  } catch (error) {
    console.error('fila-x-routes: Error fetching item details:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Remover item da fila
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: DELETE /api/fila-x/:id called');
    
    const { id } = req.params;

    // Verificar se o item existe e pertence à empresa
    const item = await db
      .select({
        filaX: filaX,
        ordem: carregamentos
      })
      .from(filaX)
      .innerJoin(carregamentos, eq(filaX.ordem_id, carregamentos.id))
      .where(
        and(
          eq(filaX.id, id),
          eq(carregamentos.empresa_id, req.user!.empresa_id)
        )
      )
      .limit(1);

    if (item.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Remover item da fila
    await db
      .delete(filaX)
      .where(eq(filaX.id, id));

    console.log('fila-x-routes: Item removed from fila');
    res.json({ message: 'Item removido da fila com sucesso' });
  } catch (error) {
    console.error('fila-x-routes: Error removing item from fila:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});



// Vincular ordem adicional a um cartão existente no FilaX
router.post('/:id/vincular-ordem', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: POST /api/fila-x/:id/vincular-ordem called');
    console.log('fila-x-routes: Request params:', req.params);
    console.log('fila-x-routes: Request body:', req.body);
    
    const { id } = req.params;
    const { ordem_id } = req.body;

    if (!ordem_id) {
      console.log('fila-x-routes: Missing ordem_id in request body');
      return res.status(400).json({ error: 'ID da ordem é obrigatório' });
    }

    // Verificar se o cartão existe e pertence à empresa
    console.log('fila-x-routes: Looking for cartao with id:', id, 'empresa_id:', req.user!.empresa_id);
    const cartao = await db
      .select()
      .from(filaX)
      .where(
        and(
          eq(filaX.id, id),
          eq(filaX.empresa_id, req.user!.empresa_id)
        )
      )
      .limit(1);

    console.log('fila-x-routes: Found cartao:', cartao.length > 0 ? 'YES' : 'NO');
    if (cartao.length === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    // Verificar se a ordem existe
    console.log('fila-x-routes: Looking for ordem with id:', ordem_id);
    const ordem = await db
      .select()
      .from(ordens_carga)
      .where(eq(ordens_carga.id, ordem_id))
      .limit(1);

    console.log('fila-x-routes: Found ordem:', ordem.length > 0 ? 'YES' : 'NO');
    if (ordem.length === 0) {
      // Vamos verificar se a ordem existe mesmo
      const todasOrdens = await db
        .select({ id: ordens_carga.id, numero_ordem: ordens_carga.numero_ordem })
        .from(ordens_carga)
        .limit(5);
      console.log('fila-x-routes: Sample orders in database:', todasOrdens);
      return res.status(404).json({ error: 'Ordem não encontrada' });
    }

    // Verificar se a ordem já está vinculada a este cartão
    if (cartao[0].ordem_carga_id === ordem_id) {
      return res.status(400).json({ 
        error: 'Esta ordem já está vinculada a este cartão.' 
      });
    }

    // Para múltiplas ordens, criar um novo cartão com a mesma configuração
    // Isso permite múltiplas ordens mantendo a compatibilidade com o modelo atual
    
    const novoCartao = await db
      .insert(filaX)
      .values({
        estagio: cartao[0].estagio,
        tipo_operacao: cartao[0].tipo_operacao,
        tipo_ordem: 'ordem_carga',
        prioridade: cartao[0].prioridade,
        ordem_carga_id: ordem_id,
        veiculo_placa: cartao[0].veiculo_placa,
        veiculo_tipo: cartao[0].veiculo_tipo,
        motorista_nome: cartao[0].motorista_nome,
        motorista_telefone: cartao[0].motorista_telefone,
        doca_designada: cartao[0].doca_designada,
        observacoes: `Grupo: ${cartao[0].estagio} - Ordem: ${ordem[0].numero_ordem}`,
        empresa_id: req.user!.empresa_id
      })
      .returning();

    // Registrar no histórico
    await db
      .insert(historicoFilaX)
      .values({
        fila_x_id: novoCartao[0].id,
        ordem_carga_id: ordem_id,
        tipo_ordem: 'ordem_carga',
        acao: 'ordem_vinculada',
        estagio_anterior: cartao[0].estagio,
        estagio_novo: cartao[0].estagio,
        observacoes: `Ordem ${ordem[0].numero_ordem} vinculada ao grupo ${cartao[0].estagio}`,
        usuario_id: req.user!.id,
        empresa_id: req.user!.empresa_id
      });

    res.json({ 
      success: true, 
      message: `Ordem ${ordem[0].numero_ordem} vinculada com sucesso`,
      novo_cartao_id: novoCartao[0].id
    });

  } catch (error) {
    console.error('fila-x-routes: Error linking order to card:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Desvincular ordem de um cartão
router.delete('/:id/desvincular-ordem/:ordem_id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: DELETE /api/fila-x/:id/desvincular-ordem/:ordem_id called');
    const { id, ordem_id } = req.params;

    // Verificar se o cartão existe e pertence à empresa
    const cartao = await db
      .select()
      .from(filaX)
      .where(
        and(
          eq(filaX.id, id),
          eq(filaX.empresa_id, req.user!.empresa_id)
        )
      )
      .limit(1);

    if (cartao.length === 0) {
      return res.status(404).json({ error: 'Cartão não encontrado' });
    }

    // Verificar se a ordem está vinculada a este cartão
    if (cartao[0].ordem_carga_id === ordem_id) {
      // Desvincular a ordem
      await db
        .update(filaX)
        .set({
          ordem_carga_id: null,
          tipo_ordem: null,
          data_atualizacao: new Date()
        })
        .where(eq(filaX.id, id));

      // Registrar no histórico
      await db
        .insert(historicoFilaX)
        .values({
          fila_x_id: id,
          ordem_carga_id: ordem_id,
          tipo_ordem: 'ordem_carga',
          acao: 'ordem_desvinculada',
          estagio_anterior: cartao[0].estagio,
          estagio_novo: cartao[0].estagio,
          observacoes: `Ordem desvinculada do cartão`,
          usuario_id: req.user!.id,
          empresa_id: req.user!.empresa_id
        });

      res.json({ 
        success: true, 
        message: 'Ordem desvinculada com sucesso' 
      });
    } else {
      res.status(400).json({ error: 'Esta ordem não está vinculada a este cartão' });
    }

  } catch (error) {
    console.error('fila-x-routes: Error unlinking order from card:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para arquivar um item individual
router.put('/:id/arquivar', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: PUT /api/fila-x/:id/arquivar called');
    console.log('fila-x-routes: Item ID:', req.params.id);

    const { id } = req.params;
    const agora = new Date();

    // Verificar se o item existe e pertence à empresa
    const filaItem = await db
      .select()
      .from(filaX)
      .where(
        and(
          eq(filaX.id, id),
          eq(filaX.empresa_id, req.user!.empresa_id)
        )
      )
      .limit(1);

    if (filaItem.length === 0) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    // Arquivar o item
    const updatedItem = await db
      .update(filaX)
      .set({
        arquivado: true,
        data_arquivamento: agora,
        updated_at: agora
      })
      .where(eq(filaX.id, id))
      .returning();

    // Registrar histórico
    await db.insert(historicoFilaX).values({
      fila_x_id: id,
      tipo_ordem: filaItem[0].tipo_ordem || 'ordem_carga',
      acao: 'arquivado',
      estagio_anterior: filaItem[0].estagio,
      estagio_novo: filaItem[0].estagio,
      observacoes: 'Item arquivado individualmente',
      usuario_id: req.user!.id,
      empresa_id: req.user!.empresa_id
    });

    console.log('fila-x-routes: Item archived successfully:', updatedItem[0]);
    res.json(updatedItem[0]);
  } catch (error) {
    console.error('fila-x-routes: Error archiving item:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para arquivar todos os itens de um estágio
router.put('/arquivar-estagio/:estagio', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('fila-x-routes: PUT /api/fila-x/arquivar-estagio/:estagio called');
    console.log('fila-x-routes: Estágio:', req.params.estagio);

    const { estagio } = req.params;
    const agora = new Date();

    // Buscar todos os itens do estágio que não estão arquivados
    const itensEstagio = await db
      .select()
      .from(filaX)
      .where(
        and(
          eq(filaX.estagio, estagio),
          eq(filaX.empresa_id, req.user!.empresa_id),
          eq(filaX.arquivado, false)
        )
      );

    if (itensEstagio.length === 0) {
      return res.status(404).json({ error: 'Nenhum item encontrado neste estágio' });
    }

    // Arquivar todos os itens
    const updatedItems = await db
      .update(filaX)
      .set({
        arquivado: true,
        data_arquivamento: agora,
        updated_at: agora
      })
      .where(
        and(
          eq(filaX.estagio, estagio),
          eq(filaX.empresa_id, req.user!.empresa_id),
          eq(filaX.arquivado, false)
        )
      )
      .returning();

    // Registrar histórico para cada item
    const historicoValues = itensEstagio.map(item => ({
      fila_x_id: item.id,
      tipo_ordem: item.tipo_ordem || 'ordem_carga',
      acao: 'arquivado',
      estagio_anterior: item.estagio,
      estagio_novo: item.estagio,
      observacoes: `Arquivamento em lote do estágio ${estagio}`,
      usuario_id: req.user!.id,
      empresa_id: req.user!.empresa_id
    }));

    await db.insert(historicoFilaX).values(historicoValues);

    console.log('fila-x-routes: Stage items archived successfully:', updatedItems.length, 'items');
    res.json({ 
      success: true, 
      itemsArquivados: updatedItems.length,
      estagio: estagio 
    });
  } catch (error) {
    console.error('fila-x-routes: Error archiving stage items:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;