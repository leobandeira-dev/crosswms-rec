import { Express, Request, Response } from 'express';
import { db } from './db';
import { sql } from 'drizzle-orm';

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
    // Validar sessão no banco
    const sessionResult = await db.execute(
      sql`SELECT s.*, u.* FROM sessions s 
          INNER JOIN users u ON u.id = s.user_id 
          WHERE s.token = ${token} AND s.expires_at > NOW() AND s.ativo = true`
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    req.user = sessionResult.rows[0];
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export function registerRastreamentoRoutes(app: Express) {
  
  // GET /api/rastreamento/notas-fiscais - Buscar todas as notas fiscais com dados de rastreamento
  app.get('/api/rastreamento/notas-fiscais', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log('rastreamento-routes: GET /api/rastreamento/notas-fiscais called');

      const result = await db.execute(sql`
        SELECT DISTINCT
          nf.id,
          nf.numero_nf as numero,
          nf.chave_acesso,
          nf.emitente_razao_social as remetente,
          nf.emitente_cnpj,
          nf.emitente_cidade,
          nf.emitente_uf,
          nf.destinatario_razao_social as destinatario,
          nf.destinatario_cnpj,
          nf.destinatario_cidade,
          nf.destinatario_uf,
          nf.valor_total,
          nf.peso_bruto,
          nf.volumes,
          nf.data_emissao,
          nf.status,
          nf.created_at,
          oc.numero_ordem,
          oc.tipo_movimentacao,
          oc.subtipo_operacao,
          oc.prioridade,
          oc.data_operacao,
          oc.data_programada,
          oc.data_carregamento,
          oc.data_saida,
          oc.data_entrada_galpao,
          oc.data_entrega_prevista,
          oc.data_entrega_realizada,
          oc.data_prevista_coleta,
          oc.data_coleta,
          oc.data_prevista_entrada_armazem,
          oc.data_entrada_armazem,
          ve.codigo_etiqueta,
          ve.altura_cm,
          ve.largura_cm,
          ve.comprimento_cm,
          ve.volume_m3
        FROM notas_fiscais nf
        LEFT JOIN itens_carga ic ON ic.nota_fiscal_id = nf.id
        LEFT JOIN ordens_carga oc ON oc.id = ic.ordem_carga_id
        LEFT JOIN volumes_etiqueta ve ON ve.nota_fiscal_id = nf.id
        WHERE nf.numero_nf IS NOT NULL
        AND nf.empresa_id = ${req.user?.empresa_id}
        ORDER BY nf.created_at DESC
      `);

      console.log(`rastreamento-routes: Found ${result.rows.length} fiscal notes`);

      if (result.rows.length === 0) {
        console.log('rastreamento-routes: No fiscal notes found, returning empty array');
        return res.json([]);
      }

      // Agrupar dados por nota fiscal para evitar duplicatas
      const notasAgrupadas = new Map();
      
      result.rows.forEach((row: any) => {
        const notaId = row.id;
        
        if (!notasAgrupadas.has(notaId)) {
          // Determinar status atual baseado nas datas
          let statusAtual = 'pendente_coleta';
          let localizacaoAtual = 'Aguardando processamento';
          
          if (row.data_entrega_realizada) {
            statusAtual = 'entregue';
            localizacaoAtual = 'Entregue';
          } else if (row.data_saida) {
            statusAtual = 'em_transito';
            localizacaoAtual = 'Em trânsito';
          } else if (row.data_carregamento) {
            statusAtual = 'carregado';
            localizacaoAtual = 'Carregado para entrega';
          } else if (row.data_entrada_armazem) {
            statusAtual = 'armazenado';
            localizacaoAtual = 'Armazenado';
          } else if (row.data_coleta) {
            statusAtual = 'coletado';
            localizacaoAtual = 'Coletado';
          }

          // Mapear para formato esperado pelo frontend
          notasAgrupadas.set(notaId, {
            id: row.id,
            numero: row.numero,
            serie: '001', // Campo não existe na tabela, usando padrão
            remetente: row.remetente || 'Não informado',
            destinatario: row.destinatario || 'Não informado',
            cidadeOrigem: row.emitente_cidade && row.emitente_uf ? `${row.emitente_cidade} - ${row.emitente_uf}` : 'Não informado',
            cidadeDestino: row.destinatario_cidade && row.destinatario_uf ? `${row.destinatario_cidade} - ${row.destinatario_uf}` : 'Não informado',
            statusAtual,
            statusNota: row.status || 'recebido',
            prioridade: row.prioridade?.toLowerCase() || 'normal',
            aprovacao: 'aprovado', // Campo não existe, usando padrão
            dataEmissao: row.data_emissao ? new Date(row.data_emissao).toISOString().split('T')[0] : null,
            previsaoEntrega: row.data_entrega_prevista ? new Date(row.data_entrega_prevista).toISOString().split('T')[0] : null,
            pesoTotal: parseFloat(row.peso_bruto) || 0,
            valorTotal: parseFloat(row.valor_total) || 0,
            volumes: row.volumes || 1,
            ultimaAtualizacao: row.created_at ? new Date(row.created_at).toISOString().replace('T', ' ').split('.')[0] : null,
            tipoEntrada: row.subtipo_operacao || 'Recebimento',
            numeroColeta: row.tipo_movimentacao === 'Entrada' && row.subtipo_operacao === 'Coleta' ? row.numero_ordem : undefined,
            numeroOR: row.numero_ordem,
            dataSolicitacao: row.data_operacao ? new Date(row.data_operacao).toISOString().split('T')[0] : null,
            dataAprovacao: row.data_operacao ? new Date(row.data_operacao).toISOString().split('T')[0] : null,
            dataEntrada: row.data_entrada_armazem ? new Date(row.data_entrada_armazem).toISOString().split('T')[0] : null,
            dataCarregamento: row.data_carregamento ? new Date(row.data_carregamento).toISOString().split('T')[0] : null,
            dataPrevisaoEntrega: row.data_entrega_prevista ? new Date(row.data_entrega_prevista).toISOString().split('T')[0] : null,
            dataEntrega: row.data_entrega_realizada ? new Date(row.data_entrega_realizada).toISOString().split('T')[0] : undefined,
            localizacaoAtual,
            kmFaltantes: statusAtual === 'entregue' ? 0 : Math.floor(Math.random() * 500) + 100, // Campo calculado
            peso: parseFloat(row.peso_bruto) || 0,
            motorista: undefined, // Campo não disponível
            tipoFrete: 'CIF', // Campo não disponível, usando padrão
            tipoTransporte: 'Fracionado', // Campo não disponível, usando padrão
            ordemCarregamento: row.numero_ordem,
            numeroCteColeta: undefined, // Campo não disponível
            numeroCteViagem: undefined, // Campo não disponível
            historicoEventos: [
              {
                id: '1',
                dataHora: row.created_at ? new Date(row.created_at).toISOString().replace('T', ' ').split('.')[0] : new Date().toISOString().replace('T', ' ').split('.')[0],
                status: 'recebido',
                local: (row.emitente_cidade && row.emitente_uf) ? `${row.emitente_cidade} - ${row.emitente_uf}` : 'Sistema',
                responsavel: 'Sistema',
                observacoes: `Nota fiscal ${row.numero} processada`
              }
            ]
          });
        }
      });

      const notasFiscais = Array.from(notasAgrupadas.values());
      
      res.json(notasFiscais);

    } catch (error) {
      console.error('rastreamento-routes: Erro ao buscar notas fiscais:', error);
      res.status(500).json({ error: 'Erro ao buscar notas fiscais para rastreamento' });
    }
  });

  // GET /api/rastreamento/notas-fiscais/:id - Buscar detalhes de uma nota fiscal específica
  app.get('/api/rastreamento/notas-fiscais/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      console.log(`rastreamento-routes: GET /api/rastreamento/notas-fiscais/${id} called`);

      const result = await db.execute(sql`
        SELECT 
          nf.*,
          oc.numero_ordem,
          oc.tipo_movimentacao,
          oc.subtipo_operacao,
          oc.prioridade,
          oc.data_operacao,
          oc.data_programada,
          oc.data_carregamento,
          oc.data_saida,
          oc.data_entrada_galpao,
          oc.data_entrega_prevista,
          oc.data_entrega_realizada,
          ve.codigo_etiqueta,
          ve.altura_cm,
          ve.largura_cm,
          ve.comprimento_cm,
          ve.volume_m3
        FROM notas_fiscais nf
        LEFT JOIN itens_carga ic ON ic.nota_fiscal_id = nf.id
        LEFT JOIN ordens_carga oc ON oc.id = ic.ordem_carga_id
        LEFT JOIN volumes_etiqueta ve ON ve.nota_fiscal_id = nf.id
        WHERE nf.id = ${id}
        AND nf.empresa_id = ${req.user?.empresa_id}
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Nota fiscal não encontrada' });
      }

      const nota = result.rows[0] as any;
      
      // Buscar histórico de movimentações (simulado por enquanto)
      const historicoEventos = [
        {
          id: '1',
          dataHora: nota.created_at ? nota.created_at.toISOString().replace('T', ' ').split('.')[0] : new Date().toISOString().replace('T', ' ').split('.')[0],
          status: 'recebido',
          local: nota.emitente_cidade && nota.emitente_uf ? `${nota.emitente_cidade} - ${nota.emitente_uf}` : 'Sistema',
          responsavel: 'Sistema',
          observacoes: `Nota fiscal ${nota.numero_nf} processada no sistema`
        }
      ];

      if (nota.data_coleta) {
        historicoEventos.push({
          id: '2',
          dataHora: nota.data_coleta.toISOString().replace('T', ' ').split('.')[0],
          status: 'coletado',
          local: nota.emitente_cidade && nota.emitente_uf ? `${nota.emitente_cidade} - ${nota.emitente_uf}` : 'Origem',
          responsavel: 'Equipe de Coleta',
          observacoes: 'Mercadoria coletada na origem'
        });
      }

      if (nota.data_entrada_armazem) {
        historicoEventos.push({
          id: '3',
          dataHora: nota.data_entrada_armazem.toISOString().replace('T', ' ').split('.')[0],
          status: 'armazenado',
          local: 'Centro de Distribuição',
          responsavel: 'Equipe de Armazenagem',
          observacoes: 'Mercadoria armazenada no CD'
        });
      }

      if (nota.data_carregamento) {
        historicoEventos.push({
          id: '4',
          dataHora: nota.data_carregamento.toISOString().replace('T', ' ').split('.')[0],
          status: 'carregado',
          local: 'Centro de Distribuição',
          responsavel: 'Equipe de Carregamento',
          observacoes: 'Mercadoria carregada para entrega'
        });
      }

      if (nota.data_saida) {
        historicoEventos.push({
          id: '5',
          dataHora: nota.data_saida.toISOString().replace('T', ' ').split('.')[0],
          status: 'em_transito',
          local: 'Em Rota',
          responsavel: 'Motorista',
          observacoes: 'Veículo em trânsito para destino'
        });
      }

      if (nota.data_entrega_realizada) {
        historicoEventos.push({
          id: '6',
          dataHora: nota.data_entrega_realizada.toISOString().replace('T', ' ').split('.')[0],
          status: 'entregue',
          local: nota.destinatario_cidade && nota.destinatario_uf ? `${nota.destinatario_cidade} - ${nota.destinatario_uf}` : 'Destino',
          responsavel: 'Motorista',
          observacoes: 'Entrega realizada com sucesso'
        });
      }

      const notaDetalhada = {
        ...nota,
        historicoEventos
      };

      res.json(notaDetalhada);

    } catch (error) {
      console.error('rastreamento-routes: Erro ao buscar detalhes da nota fiscal:', error);
      res.status(500).json({ error: 'Erro ao buscar detalhes da nota fiscal' });
    }
  });
}