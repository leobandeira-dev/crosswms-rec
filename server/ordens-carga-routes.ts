import { Request, Response, Express } from 'express';
import { z } from 'zod';
import { db, pool } from './db';
import { insertOrdemCargaSchema } from '@shared/schema';
import { notas_fiscais, volumes_etiqueta } from '@shared/schema';
import { eq, desc, inArray, and, or, ilike, not } from 'drizzle-orm';
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
    console.log('ordens-carga-routes: No token provided');
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    console.log('ordens-carga-routes: Validating token:', token);
    const sessionData = await storage.getSessionByToken(token);
    console.log('ordens-carga-routes: Session data:', sessionData);
    
    if (!sessionData || !sessionData.session) {
      console.log('ordens-carga-routes: No valid session found');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { session, user } = sessionData;
    console.log('ordens-carga-routes: Session expires at:', session.expires_at, 'Current time:', new Date());
    
    if (new Date() > session.expires_at) {
      console.log('ordens-carga-routes: Token expired');
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    if (!user) {
      console.log('ordens-carga-routes: User not found');
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    console.log('ordens-carga-routes: Authentication successful for user:', user.email);
    next();
  } catch (error) {
    console.error('ordens-carga-routes: Authentication error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper function to process notes in batches
async function processBatchOfNotes(notesBatch: any[], ordemId: string, user: any, orderDates?: any) {
  for (const nota of notesBatch) {
    try {
      console.log('ordens-carga-routes: Processing fiscal note:', nota.numero_nota);
      
      let novaNotaFiscal;
      
      // First check if nota fiscal already exists
      const chaveNota = nota.chave_nota_fiscal || nota.chave_nota || nota.chave_acesso;
      console.log('ordens-carga-routes: Looking for existing nota with chave:', chaveNota);
      
      const existingNotaResult = await pool.query(`
        SELECT id, numero_nf, chave_acesso FROM notas_fiscais 
        WHERE chave_acesso = $1
      `, [chaveNota]);
      
      if (existingNotaResult.rows.length > 0) {
        // Use existing nota fiscal
        novaNotaFiscal = existingNotaResult.rows[0];
        console.log('ordens-carga-routes: Using existing nota fiscal with ID:', novaNotaFiscal.id);
        
        // Check if volumes already exist for this nota fiscal to avoid duplicates
        const existingVolumesResult = await pool.query(`
          SELECT COUNT(*) as volume_count FROM volumes_etiqueta 
          WHERE nota_fiscal_id = $1
        `, [novaNotaFiscal.id]);
        
        const existingVolumeCount = parseInt(existingVolumesResult.rows[0].volume_count);
        if (existingVolumeCount > 0) {
          console.log('ordens-carga-routes: Volumes already exist for this nota fiscal, skipping volume creation');
        } else {
          console.log('ordens-carga-routes: No volumes found for existing nota fiscal, creating volumes');
          await createVolumesForNote(nota, novaNotaFiscal.id, user.empresa_id);
        }
      } else {
        // Create new nota fiscal with improved error handling
        try {
          const notaResult = await pool.query(`
            INSERT INTO notas_fiscais (
              empresa_id, chave_acesso, numero_nf, serie,
              emitente_razao_social, emitente_cnpj, emitente_telefone,
              emitente_endereco, emitente_numero, emitente_bairro,
              emitente_cidade, emitente_uf, emitente_cep,
              destinatario_razao_social, destinatario_cnpj, destinatario_telefone,
              destinatario_endereco, destinatario_numero, destinatario_bairro,
              destinatario_cidade, destinatario_uf, destinatario_cep,
              valor_total, peso_bruto, volumes, data_emissao,
              tipo_operacao, observacoes, xml_content, xml_source,
              data_prevista_coleta, data_coleta, data_prevista_entrada_armazem,
              data_entrada_armazem, data_carregamento, data_prevista_entrega,
              data_chegada_filial_entrega, data_saida_entrega, data_chegada_na_entrega,
              data_entrega, empresa_cliente_id, usuario_responsavel_id
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19,
              $20, $21, $22, $23, $24, $25, $26, $27, $28, $29,
              $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42
            ) ON CONFLICT (chave_acesso) DO UPDATE SET
              updated_at = CURRENT_TIMESTAMP
            RETURNING id, numero_nf, chave_acesso
          `, [
            user.empresa_id,
            chaveNota,
            nota.numero_nota,
            nota.serie_nota,
            nota.emitente_razao_social,
            nota.emitente_cnpj,
            nota.emitente_telefone,
            nota.emitente_endereco,
            nota.emitente_numero,
            nota.emitente_bairro,
            nota.emitente_cidade,
            nota.emitente_uf,
            nota.emitente_cep,
            nota.destinatario_razao_social,
            nota.destinatario_cnpj,
            nota.destinatario_telefone,
            nota.destinatario_endereco,
            nota.destinatario_numero,
            nota.destinatario_bairro,
            nota.destinatario_cidade,
            nota.destinatario_uf,
            nota.destinatario_cep,
            parseInt(String(nota.valor_nota_fiscal || 0)),
            parseFloat(String(nota.peso_bruto || 0)),
            parseInt(String(nota.quantidade_volumes || 1)),
            nota.data_emissao ? new Date(nota.data_emissao) : new Date(),
            nota.natureza_operacao,
            nota.informacoes_complementares,
            // XML content and source
            nota.xml_content || null,
            nota.xml_source || 'api',
            // Dates from order level for NFe tracking
            orderDates?.data_prevista_coleta ? new Date(orderDates.data_prevista_coleta) : null,
            orderDates?.data_coleta ? new Date(orderDates.data_coleta) : null,
            orderDates?.data_prevista_entrada_armazem ? new Date(orderDates.data_prevista_entrada_armazem) : null,
            orderDates?.data_entrada_armazem ? new Date(orderDates.data_entrada_armazem) : null,
            orderDates?.data_carregamento ? new Date(orderDates.data_carregamento) : null,
            orderDates?.data_prevista_entrega ? new Date(orderDates.data_prevista_entrega) : null,
            orderDates?.data_chegada_filial_entrega ? new Date(orderDates.data_chegada_filial_entrega) : null,
            orderDates?.data_saida_entrega ? new Date(orderDates.data_saida_entrega) : null,
            orderDates?.data_chegada_na_entrega ? new Date(orderDates.data_chegada_na_entrega) : null,
            orderDates?.data_entrega ? new Date(orderDates.data_entrega) : null,
            // Metadata
            user.empresa_id, // empresa_cliente_id
            user.id // usuario_responsavel_id
          ]);
          
          novaNotaFiscal = notaResult.rows[0];
          console.log('ordens-carga-routes: Created new nota fiscal with ID:', novaNotaFiscal.id);
          
          // Create volumes for new fiscal note
          await createVolumesForNote(nota, novaNotaFiscal.id, user.empresa_id);
        } catch (notaError: any) {
          console.error('ordens-carga-routes: Error creating nota fiscal:', notaError);
          throw new Error(`Failed to create fiscal note ${nota.numero_nota}: ${notaError?.message || 'Unknown error'}`);
        }
      }
      
      // Link fiscal note to loading order
      try {
        await db.insert(itens_carga).values({
          ordem_carga_id: ordemId,
          nota_fiscal_id: novaNotaFiscal.id,
          peso_item: String(nota.peso_bruto || '0'),
          volume_item: parseInt(nota.quantidade_volumes || '0'),
          valor_frete_item: String(nota.valor_nota_fiscal || '0')
        });
        
        console.log('ordens-carga-routes: Linked nota fiscal', novaNotaFiscal.id, 'to order', ordemId);
      } catch (linkError: any) {
        console.error('ordens-carga-routes: Error linking nota to order:', linkError);
        throw new Error(`Failed to link fiscal note ${nota.numero_nota} to order: ${linkError?.message || 'Unknown error'}`);
      }
      
    } catch (noteError) {
      console.error('ordens-carga-routes: Error processing note:', nota.numero_nota, noteError);
      // Continue with next note instead of failing entire batch
      continue;
    }
  }
}

// Helper function to create volumes for a note with new ID format: NOTA-VOLUME-DATA-HORA+MINUTOS
async function createVolumesForNote(nota: any, notaFiscalId: string, empresaId: string) {
  const quantidadeVolumes = parseInt(nota.quantidade_volumes || '1');
  const pesoPorVolume = parseFloat(nota.peso_bruto || '0') / quantidadeVolumes;
  
  // Generate datetime component for all volumes of this note
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const dateTimeStr = `${day}${month}${year}-${hours}${minutes}`;
  
  for (let i = 1; i <= quantidadeVolumes; i++) {
    const volumeStr = String(i).padStart(3, '0');
    // New format: NOTA-VOLUME-DATA-HORA+MINUTOS
    const codigoEtiqueta = `${nota.numero_nota}-${volumeStr}-${dateTimeStr}`;
    
    try {
      await pool.query(`
        INSERT INTO volumes_etiqueta (
          codigo_etiqueta, nota_fiscal_id, empresa_id,
          altura_cm, largura_cm, comprimento_cm,
          volume_m3, peso_kg, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (codigo_etiqueta) DO NOTHING
      `, [
        codigoEtiqueta,
        notaFiscalId,
        empresaId,
        30, // Default height in cm
        40, // Default width in cm
        50, // Default length in cm
        0.06, // Default volume in m3
        pesoPorVolume.toFixed(3),
        'recebido'
      ]);
    } catch (volumeError) {
      console.error('ordens-carga-routes: Error creating volume:', codigoEtiqueta, volumeError);
      // Continue with next volume
    }
  }
  console.log('ordens-carga-routes: Created', quantidadeVolumes, 'volumes for nota fiscal', notaFiscalId, 'with datetime', dateTimeStr);
}

export function registerOrdensCargaRoutes(app: Express) {
  // List loading orders
  app.get('/api/ordens-carga', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    console.log('ordens-carga-routes: GET /api/ordens-carga called');
    console.log('ordens-carga-routes: Query params:', req.query);
    try {
      // Extract query parameters
      const { status, search, exclude_fila_x } = req.query;
      
      // Build the query
      let query = db.select({
        id: ordens_carga.id,
        numero_ordem: ordens_carga.numero_ordem,
        tipo_carregamento: ordens_carga.tipo_carregamento,
        tipo_movimentacao: ordens_carga.tipo_movimentacao,
        subtipo_operacao: ordens_carga.subtipo_operacao,
        prioridade: ordens_carga.prioridade,
        status: ordens_carga.status,
        observacoes: ordens_carga.observacoes,
        created_at: ordens_carga.created_at,
        updated_at: ordens_carga.updated_at,
        data_operacao: ordens_carga.data_operacao,
        data_programada: ordens_carga.data_programada,
        data_entrada_galpao: ordens_carga.data_entrada_galpao,
        data_carregamento: ordens_carga.data_carregamento,
        data_saida: ordens_carga.data_saida,
        data_entrega_prevista: ordens_carga.data_entrega_prevista,
        data_entrega_realizada: ordens_carga.data_entrega_realizada,
        // Novos campos de data do layout 3 colunas
        data_prevista_coleta: ordens_carga.data_prevista_coleta,
        data_coleta: ordens_carga.data_coleta,
        data_prevista_entrada_armazem: ordens_carga.data_prevista_entrada_armazem,
        data_entrada_armazem: ordens_carga.data_entrada_armazem,
        data_chegada_filial_entrega: ordens_carga.data_chegada_filial_entrega,
        data_saida_entrega: ordens_carga.data_saida_entrega,
        data_chegada_na_entrega: ordens_carga.data_chegada_na_entrega,
        data_entrega: ordens_carga.data_entrega,
        // Dados do remetente
        remetente_razao_social: ordens_carga.remetente_razao_social,
        remetente_cnpj: ordens_carga.remetente_cnpj,
        remetente_telefone: ordens_carga.remetente_telefone,
        remetente_endereco: ordens_carga.remetente_endereco,
        remetente_numero: ordens_carga.remetente_numero,
        remetente_complemento: ordens_carga.remetente_complemento,
        remetente_bairro: ordens_carga.remetente_bairro,
        remetente_cidade: ordens_carga.remetente_cidade,
        remetente_uf: ordens_carga.remetente_uf,
        remetente_cep: ordens_carga.remetente_cep,
        // Dados do destinatário
        destinatario_razao_social: ordens_carga.destinatario_razao_social,
        destinatario_cnpj: ordens_carga.destinatario_cnpj,
        destinatario_telefone: ordens_carga.destinatario_telefone,
        destinatario_endereco: ordens_carga.destinatario_endereco,
        destinatario_numero: ordens_carga.destinatario_numero,
        destinatario_complemento: ordens_carga.destinatario_complemento,
        destinatario_bairro: ordens_carga.destinatario_bairro,
        destinatario_cidade: ordens_carga.destinatario_cidade,
        destinatario_uf: ordens_carga.destinatario_uf,
        destinatario_cep: ordens_carga.destinatario_cep
      })
        .from(ordens_carga);

      // Apply filters
      const whereConditions = [];
      
      // Filter by status if provided
      if (status) {
        whereConditions.push(eq(ordens_carga.status, status as string));
      }
      
      // Apply search filter if provided
      if (search && search.toString().trim()) {
        const searchTerm = `%${search.toString().trim()}%`;
        whereConditions.push(
          or(
            ilike(ordens_carga.numero_ordem, searchTerm),
            ilike(ordens_carga.remetente_razao_social, searchTerm),
            ilike(ordens_carga.destinatario_razao_social, searchTerm)
          )
        );
      }

      // Use different approach when excluding FilaX orders due to Drizzle complexity
      let ordens;
      
      if (exclude_fila_x === 'true') {
        console.log('ordens-carga-routes: Usando consulta SQL direta para exclude_fila_x');
        
        // Build SQL query parts
        let sqlQuery = `
          SELECT oc.* FROM ordens_carga oc
          WHERE oc.id NOT IN (SELECT DISTINCT ordem_carga_id FROM ordens_fila_x WHERE ordem_carga_id IS NOT NULL)
        `;
        
        const params: any[] = [];
        let paramCount = 0;
        
        // Add search condition if present
        if (search) {
          paramCount++;
          sqlQuery += ` AND (oc.numero_ordem ILIKE $${paramCount} OR oc.observacoes ILIKE $${paramCount})`;
          params.push(`%${search}%`);
        }
        
        // Add status filter if present
        if (status) {
          paramCount++;
          sqlQuery += ` AND oc.status = $${paramCount}`;
          params.push(status);
        }
        
        sqlQuery += ` ORDER BY oc.created_at DESC`;
        
        const result = await pool.query(sqlQuery, params);
        ordens = result.rows;
        
        console.log('ordens-carga-routes: SQL direto encontrou', ordens.length, 'ordens');
      } else {
        // Apply where conditions if any for regular queries
        if (whereConditions.length > 0) {
          query = query.where(and(...whereConditions));
        }
        
        ordens = await query.orderBy(desc(ordens_carga.created_at));
      }

      console.log('ordens-carga-routes: Found', ordens.length, 'orders');
      console.log('ordens-carga-routes: First few orders:', ordens.slice(0, 2).map(o => ({ id: o.id, numero: o.numero_ordem })));

      // Calculate totals for each order efficiently
      const ordensComTotais = await Promise.all(ordens.map(async (ordem) => {
        try {
          // Get items for this order
          const itensResult = await pool.query(`
            SELECT ic.nota_fiscal_id 
            FROM itens_carga ic 
            WHERE ic.ordem_carga_id = $1
          `, [ordem.id]);

          if (itensResult.rows.length === 0) {
            return {
              ...ordem,
              totalNotas: 0,
              totalVolumes: 0,
              totalValor: 0,
              totalPeso: 0,
              modulo: 'ordem_carga',
              notasFiscais: [],
              volumes: []
            };
          }

          const notasIds = itensResult.rows.map(row => row.nota_fiscal_id);
          
          // Calculate totals using aggregation
          const totalsResult = await pool.query(`
            SELECT 
              COUNT(nf.id) as total_notas,
              COALESCE(SUM(CAST(nf.valor_total AS DECIMAL)), 0) as total_valor,
              COALESCE(SUM(CAST(nf.peso_bruto AS DECIMAL)), 0) as total_peso,
              COALESCE(SUM(CAST(nf.volumes AS INTEGER)), 0) as total_volumes
            FROM notas_fiscais nf 
            WHERE nf.id = ANY($1)
          `, [notasIds]);

          const totals = totalsResult.rows[0] || {};

          // Buscar volumes para cálculo de dimensões
          const volumesResult = await pool.query(`
            SELECT 
              ve.altura_cm,
              ve.largura_cm,
              ve.comprimento_cm,
              ve.nota_fiscal_id
            FROM volumes_etiqueta ve
            INNER JOIN notas_fiscais nf ON nf.id = ve.nota_fiscal_id
            WHERE nf.id = ANY($1)
          `, [notasIds]);

          return {
            ...ordem,
            totalNotas: parseInt(totals.total_notas) || 0,
            totalVolumes: parseInt(totals.total_volumes) || 0,
            totalValor: parseFloat(totals.total_valor) || 0,
            totalPeso: parseFloat(totals.total_peso) || 0,
            modulo: 'ordem_carga',
            notasFiscais: [],
            volumes: volumesResult.rows
          };
        } catch (error) {
          console.error('Error calculating totals for order', ordem.id, ':', error);
          return {
            ...ordem,
            totalNotas: 0,
            totalVolumes: 0,
            totalValor: 0,
            totalPeso: 0,
            modulo: 'ordem_carga',
            notasFiscais: [],
            volumes: []
          };
        }
      }));
      
      res.json(ordensComTotais);
    } catch (error) {
      console.error('ordens-carga-routes: List ordens error:', error);
      res.status(500).json({ error: 'Erro ao buscar ordens de carga' });
    }
  });

  // GET /api/ordens-carga/:id/nfes - Buscar NFes vinculadas a uma ordem
  app.get('/api/ordens-carga/:id/nfes', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    console.log('ordens-carga-routes: GET /api/ordens-carga/:id/nfes called');
    const { id } = req.params;
    
    try {
      // Buscar itens da ordem
      const itensOrdem = await db.select()
        .from(itens_carga)
        .where(eq(itens_carga.ordem_carga_id, id));

      console.log('ordens-carga-routes: Found', itensOrdem.length, 'items for order', id);

      if (itensOrdem.length === 0) {
        return res.json([]);
      }

      // Buscar notas fiscais vinculadas
      const notasIds = itensOrdem.map(item => item.nota_fiscal_id).filter(id => id);
      
      if (notasIds.length === 0) {
        return res.json([]);
      }

      const notasFiscais = await db.select({
        id: notas_fiscais.id,
        chave_nota_fiscal: notas_fiscais.chave_acesso,
        numero_nota: notas_fiscais.numero_nf,
        serie_nota: notas_fiscais.serie,
        data_hora_emissao: notas_fiscais.data_emissao,
        natureza_operacao: notas_fiscais.natureza_operacao,
        emitente_cnpj: notas_fiscais.emitente_cnpj,
        emitente_razao_social: notas_fiscais.emitente_razao_social,
        emitente_telefone: notas_fiscais.emitente_telefone,
        emitente_uf: notas_fiscais.emitente_uf,
        emitente_cidade: notas_fiscais.emitente_cidade,
        emitente_bairro: notas_fiscais.emitente_bairro,
        emitente_endereco: notas_fiscais.emitente_endereco,
        emitente_numero: notas_fiscais.emitente_numero,
        emitente_cep: notas_fiscais.emitente_cep,
        destinatario_cnpj: notas_fiscais.destinatario_cnpj,
        destinatario_razao_social: notas_fiscais.destinatario_razao_social,
        destinatario_telefone: notas_fiscais.destinatario_telefone,
        destinatario_uf: notas_fiscais.destinatario_uf,
        destinatario_cidade: notas_fiscais.destinatario_cidade,
        destinatario_bairro: notas_fiscais.destinatario_bairro,
        destinatario_endereco: notas_fiscais.destinatario_endereco,
        destinatario_numero: notas_fiscais.destinatario_numero,
        destinatario_cep: notas_fiscais.destinatario_cep,
        quantidade_volumes: notas_fiscais.volumes,
        valor_nota_fiscal: notas_fiscais.valor_total,
        peso_bruto: notas_fiscais.peso_bruto,
        informacoes_complementares: notas_fiscais.observacoes,
        numero_pedido: notas_fiscais.numero_pedido,
        operacao: notas_fiscais.tipo_operacao,
        cliente_retira: notas_fiscais.cliente_retira,
        tipo_frete: notas_fiscais.tipo_frete,
        custo_extra: notas_fiscais.custo_extra
      })
        .from(notas_fiscais)
        .where(inArray(notas_fiscais.id, notasIds));

      console.log('ordens-carga-routes: Found', notasFiscais.length, 'NFes for order', id);

      res.json(notasFiscais);
    } catch (error) {
      console.error('ordens-carga-routes: Error fetching NFes for order:', error);
      res.status(500).json({ error: 'Erro ao buscar NFes da ordem' });
    }
  });

  // Get loading order by ID
  app.get('/api/ordens-carga/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    console.log('ordens-carga-routes: GET /api/ordens-carga/:id called with ID:', req.params.id);
    try {
      const { id } = req.params;
      
      const ordem = await db.select({
        id: ordens_carga.id,
        numero_ordem: ordens_carga.numero_ordem,
        tipo_carregamento: ordens_carga.tipo_carregamento,
        tipo_movimentacao: ordens_carga.tipo_movimentacao,
        subtipo_operacao: ordens_carga.subtipo_operacao,
        prioridade: ordens_carga.prioridade,
        data_operacao: ordens_carga.data_operacao,
        data_programada: ordens_carga.data_programada,
        data_entrada_galpao: ordens_carga.data_entrada_galpao,
        data_entrega_prevista: ordens_carga.data_entrega_prevista,
        data_entrega_realizada: ordens_carga.data_entrega_realizada,
        // Novos campos de data do layout 3 colunas
        data_prevista_coleta: ordens_carga.data_prevista_coleta,
        data_coleta: ordens_carga.data_coleta,
        data_prevista_entrada_armazem: ordens_carga.data_prevista_entrada_armazem,
        data_entrada_armazem: ordens_carga.data_entrada_armazem,
        data_carregamento: ordens_carga.data_carregamento,
        data_prevista_entrega: ordens_carga.data_prevista_entrega,
        data_chegada_filial_entrega: ordens_carga.data_chegada_filial_entrega,
        data_saida_entrega: ordens_carga.data_saida_entrega,
        data_chegada_na_entrega: ordens_carga.data_chegada_na_entrega,
        data_entrega: ordens_carga.data_entrega,
        observacoes: ordens_carga.observacoes,
        status: ordens_carga.status,
        created_at: ordens_carga.created_at,
        updated_at: ordens_carga.updated_at,
        // Dados do Remetente
        remetente_razao_social: ordens_carga.remetente_razao_social,
        remetente_cnpj: ordens_carga.remetente_cnpj,
        remetente_telefone: ordens_carga.remetente_telefone,
        remetente_endereco: ordens_carga.remetente_endereco,
        remetente_numero: ordens_carga.remetente_numero,
        remetente_complemento: ordens_carga.remetente_complemento,
        remetente_bairro: ordens_carga.remetente_bairro,
        remetente_cidade: ordens_carga.remetente_cidade,
        remetente_uf: ordens_carga.remetente_uf,
        remetente_cep: ordens_carga.remetente_cep,
        // Dados do Destinatário
        destinatario_razao_social: ordens_carga.destinatario_razao_social,
        destinatario_cnpj: ordens_carga.destinatario_cnpj,
        destinatario_telefone: ordens_carga.destinatario_telefone,
        destinatario_endereco: ordens_carga.destinatario_endereco,
        destinatario_numero: ordens_carga.destinatario_numero,
        destinatario_complemento: ordens_carga.destinatario_complemento,
        destinatario_bairro: ordens_carga.destinatario_bairro,
        destinatario_cidade: ordens_carga.destinatario_cidade,
        destinatario_uf: ordens_carga.destinatario_uf,
        destinatario_cep: ordens_carga.destinatario_cep
      })
        .from(ordens_carga)
        .where(eq(ordens_carga.id, id))
        .limit(1);

      if (!ordem.length) {
        console.log('ordens-carga-routes: Order not found:', id);
        return res.status(404).json({ error: 'Ordem de carga não encontrada' });
      }

      console.log('ordens-carga-routes: Found order:', ordem[0].numero_ordem);
      console.log('ordens-carga-routes: Remetente data:', {
        razao_social: ordem[0].remetente_razao_social,
        cnpj: ordem[0].remetente_cnpj,
        telefone: ordem[0].remetente_telefone
      });
      console.log('ordens-carga-routes: Destinatario data:', {
        razao_social: ordem[0].destinatario_razao_social,
        cnpj: ordem[0].destinatario_cnpj,
        telefone: ordem[0].destinatario_telefone
      });

      // Buscar notas fiscais relacionadas através da tabela de relacionamento
      const itensOrdem = await db.select()
        .from(itens_carga)
        .where(eq(itens_carga.ordem_carga_id, id));

      console.log('ordens-carga-routes: Found', itensOrdem.length, 'items for order', id);

      // Buscar as notas fiscais completas baseadas nos IDs dos itens
      const notasFiscais = [];
      const volumes = [];
      
      if (itensOrdem.length > 0) {
        const notasIds = itensOrdem.map(item => item.nota_fiscal_id);
        
        const notasData = await db.select({
          id: notas_fiscais.id,
          chave_nota: notas_fiscais.chave_acesso,
          numero_nota: notas_fiscais.numero_nf,
          serie_nota: notas_fiscais.serie,
          emitente_razao_social: notas_fiscais.emitente_razao_social,
          emitente_cnpj: notas_fiscais.emitente_cnpj,
          emitente_telefone: notas_fiscais.emitente_telefone,
          emitente_endereco: notas_fiscais.emitente_endereco,
          emitente_cidade: notas_fiscais.emitente_cidade,
          emitente_uf: notas_fiscais.emitente_uf,
          destinatario_razao_social: notas_fiscais.destinatario_razao_social,
          destinatario_cnpj: notas_fiscais.destinatario_cnpj,
          destinatario_telefone: notas_fiscais.destinatario_telefone,
          destinatario_endereco: notas_fiscais.destinatario_endereco,
          destinatario_cidade: notas_fiscais.destinatario_cidade,
          destinatario_uf: notas_fiscais.destinatario_uf,
          valor_nota_fiscal: notas_fiscais.valor_total,
          peso_bruto: notas_fiscais.peso_bruto,
          quantidade_volumes: notas_fiscais.volumes,
          data_emissao: notas_fiscais.data_emissao
        })
          .from(notas_fiscais)
          .where(inArray(notas_fiscais.id, notasIds));
        
        notasFiscais.push(...notasData);
        
        console.log('ordens-carga-routes: Found', notasFiscais.length, 'fiscal notes for order', id);

        // Buscar volumes relacionados às notas fiscais
        for (const nota of notasFiscais) {
          const notaVolumes = await db.select()
            .from(volumes_etiqueta)
            .where(eq(volumes_etiqueta.nota_fiscal_id, nota.id));
          volumes.push(...notaVolumes);
        }
      }

      console.log('ordens-carga-routes: Found', volumes.length, 'volumes for order', id);

      const ordemCompleta = {
        ...ordem[0],
        notasFiscais: notasFiscais,
        volumes: volumes,
        totalNotas: notasFiscais.length,
        totalVolumes: volumes.length
      };

      res.json(ordemCompleta);
    } catch (error) {
      console.error('ordens-carga-routes: Get ordem error:', error);
      res.status(500).json({ error: 'Erro ao buscar ordem de carga' });
    }
  });

  // Create loading order
  app.post('/api/ordens-carga', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    console.log('ordens-carga-routes: POST /api/ordens-carga called');
    console.log('ordens-carga-routes: Request body:', JSON.stringify(req.body, null, 2));
    
    try {
      // Use order number from frontend if provided, otherwise generate one
      const numeroOrdem = req.body.numero_ordem || `ORD-${Date.now()}`;
      console.log('ordens-carga-routes: Using order number:', numeroOrdem);

      // Extract header data from first fiscal note if available
      let remetenteData = {};
      let destinatarioData = {};
      
      if (req.body.notasFiscais && req.body.notasFiscais.length > 0) {
        const firstNota = req.body.notasFiscais[0];
        
        // Extract remetente data
        remetenteData = {
          remetente_razao_social: firstNota.emitente_razao_social || '',
          remetente_cnpj: firstNota.emitente_cnpj || '',
          remetente_telefone: firstNota.emitente_telefone || '',
          remetente_endereco: firstNota.emitente_endereco || '',
          remetente_numero: firstNota.emitente_numero || '',
          remetente_complemento: firstNota.emitente_complemento || '',
          remetente_bairro: firstNota.emitente_bairro || '',
          remetente_cidade: firstNota.emitente_cidade || '',
          remetente_uf: firstNota.emitente_uf || '',
          remetente_cep: firstNota.emitente_cep || ''
        };
        
        // Extract destinatario data
        destinatarioData = {
          destinatario_razao_social: firstNota.destinatario_razao_social || '',
          destinatario_cnpj: firstNota.destinatario_cnpj || '',
          destinatario_telefone: firstNota.destinatario_telefone || '',
          destinatario_endereco: firstNota.destinatario_endereco || '',
          destinatario_numero: firstNota.destinatario_numero || '',
          destinatario_complemento: firstNota.destinatario_complemento || '',
          destinatario_bairro: firstNota.destinatario_bairro || '',
          destinatario_cidade: firstNota.destinatario_cidade || '',
          destinatario_uf: firstNota.destinatario_uf || '',
          destinatario_cep: firstNota.destinatario_cep || ''
        };
      }

      // Auto-fill dates based on operation type for better UX
      const currentDateTime = new Date();
      const tipoMovimentacao = req.body.tipo_movimentacao;
      
      // Auto-fill logic for common operation flows
      let autoFilledData: any = {};
      if (tipoMovimentacao === 'Entrada' && !req.body.data_entrada_armazem) {
        autoFilledData.data_entrada_armazem = currentDateTime;
        console.log('ordens-carga-routes: Auto-filled data_entrada_armazem for Entrada operation');
      } else if (tipoMovimentacao === 'Saida' && !req.body.data_carregamento) {
        autoFilledData.data_carregamento = currentDateTime;
        console.log('ordens-carga-routes: Auto-filled data_carregamento for Saida operation');
      }

      // Process and clean the data before validation
      const processedData = {
        ...req.body,
        ...remetenteData,
        ...destinatarioData,
        numero_ordem: numeroOrdem,
        volume_total: parseInt(req.body.volume_total || '0'),
        peso_total: req.body.peso_total || '0',
        valor_total_frete: req.body.valor_total_frete || '0',
        status: 'criada',
        empresa_cliente_id: req.user.empresa_id,
        usuario_responsavel_id: req.user.id,
        // Auto-filled dates
        ...autoFilledData,
        // Convert date strings to Date objects - new fields
        data_prevista_coleta: req.body.data_prevista_coleta ? new Date(req.body.data_prevista_coleta) : undefined,
        data_coleta: req.body.data_coleta ? new Date(req.body.data_coleta) : undefined,
        data_prevista_entrada_armazem: req.body.data_prevista_entrada_armazem ? new Date(req.body.data_prevista_entrada_armazem) : undefined,
        data_entrada_armazem: autoFilledData.data_entrada_armazem || (req.body.data_entrada_armazem ? new Date(req.body.data_entrada_armazem) : undefined),
        data_carregamento: autoFilledData.data_carregamento || (req.body.data_carregamento ? new Date(req.body.data_carregamento) : undefined),
        data_prevista_entrega: req.body.data_prevista_entrega ? new Date(req.body.data_prevista_entrega) : undefined,
        data_chegada_filial_entrega: req.body.data_chegada_filial_entrega ? new Date(req.body.data_chegada_filial_entrega) : undefined,
        data_saida_entrega: req.body.data_saida_entrega ? new Date(req.body.data_saida_entrega) : undefined,
        data_chegada_na_entrega: req.body.data_chegada_na_entrega ? new Date(req.body.data_chegada_na_entrega) : undefined,
        data_entrega: req.body.data_entrega ? new Date(req.body.data_entrega) : undefined
      };

      const validatedData = insertOrdemCargaSchema.parse(processedData);
      console.log('ordens-carga-routes: Validated data:', validatedData);

      // Create order with validated data
      const orderData = validatedData;

      console.log('ordens-carga-routes: Creating order with data:', orderData);

      const [novaOrdem] = await db.insert(ordens_carga)
        .values(orderData)
        .returning();

      console.log('ordens-carga-routes: Order created:', novaOrdem);

      // Add fiscal notes to order if provided
      if (req.body.notasFiscais && req.body.notasFiscais.length > 0) {
        console.log('ordens-carga-routes: Adding', req.body.notasFiscais.length, 'fiscal notes');
        
        // Process notes in batches of 10 to avoid timeout issues
        const BATCH_SIZE = 10;
        const totalNotes = req.body.notasFiscais.length;
        
        for (let batchStart = 0; batchStart < totalNotes; batchStart += BATCH_SIZE) {
          const batchEnd = Math.min(batchStart + BATCH_SIZE, totalNotes);
          const batch = req.body.notasFiscais.slice(batchStart, batchEnd);
          
          console.log('ordens-carga-routes: Processing batch', (batchStart / BATCH_SIZE) + 1, 'of', Math.ceil(totalNotes / BATCH_SIZE), '- notes', batchStart + 1, 'to', batchEnd);
          
          // Process this batch with order dates for NFe tracking
          await processBatchOfNotes(batch, novaOrdem.id, req.user, novaOrdem);
        }
        
        console.log('ordens-carga-routes: All fiscal notes created and linked successfully');
      }



      // Process volume data and create volume records if provided
      if (req.body.volumeData && req.body.volumeData.length > 0) {
        console.log('ordens-carga-routes: Processing volume data for', req.body.volumeData.length, 'notes');
        
        for (const volumeInfo of req.body.volumeData) {
          if (volumeInfo.volumes && volumeInfo.volumes.length > 0) {
            // Find the corresponding nota fiscal using the chave_acesso
            const notaFiscalResult = await pool.query(`
              SELECT id FROM notas_fiscais 
              WHERE chave_acesso = $1 AND empresa_id = $2
            `, [volumeInfo.notaId, req.user.empresa_id]);
            
            if (notaFiscalResult.rows.length === 0) {
              console.log('ordens-carga-routes: Nota fiscal not found for chave:', volumeInfo.notaId);
              continue;
            }
            
            const notaFiscalId = notaFiscalResult.rows[0].id;
            
            // Generate datetime component for all volumes of this note
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const dateTimeStr = `${day}${month}${year}-${hours}${minutes}`;
            
            for (const volume of volumeInfo.volumes) {
              // Create volume record with dimensions using new ID format: NOTA-VOLUME-DATA-HORA+MINUTOS
              const volumeStr = String(volume.volume).padStart(3, '0');
              const codigoEtiqueta = `${volumeInfo.numeroNota}-${volumeStr}-${dateTimeStr}`;
              
              try {
                await pool.query(`
                  INSERT INTO volumes_etiqueta (
                    codigo_etiqueta, nota_fiscal_id, empresa_id,
                    altura_cm, largura_cm, comprimento_cm,
                    volume_m3, peso_kg, ordem_carga_id, usuario_criacao, status
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `, [
                  codigoEtiqueta,
                  notaFiscalId,
                  req.user.empresa_id,
                  (volume.altura * 100), // Convert m to cm
                  (volume.largura * 100),
                  (volume.comprimento * 100),
                  volume.m3,
                  (volumeInfo.pesoTotal / volumeInfo.volumes.length),
                  novaOrdem.id,
                  req.user.id,
                  'recebido'
                ]);
                console.log('ordens-carga-routes: Volume created:', codigoEtiqueta);
              } catch (volumeError) {
                console.error('ordens-carga-routes: Error creating volume:', volumeError);
                // Continue with other volumes
              }
            }
          }
        }
        console.log('ordens-carga-routes: Volume data processed successfully');
      }

      res.status(201).json({ 
        success: true, 
        id: novaOrdem.id, 
        numero_ordem: numeroOrdem,
        ordem: novaOrdem 
      });
    } catch (error) {
      console.error('ordens-carga-routes: Create ordem error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Erro ao criar ordem de carga' });
    }
  });

  // Update loading order
  app.put('/api/ordens-carga/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    console.log('ordens-carga-routes: PUT /api/ordens-carga/:id called with ID:', req.params.id);
    console.log('ordens-carga-routes: Update body:', JSON.stringify(req.body, null, 2));
    
    try {
      const { id } = req.params;
      
      // Verify ordem exists and belongs to user's company
      const existingOrdem = await db.select()
        .from(ordens_carga)
        .where(eq(ordens_carga.id, id))
        .limit(1);

      if (!existingOrdem.length) {
        return res.status(404).json({ error: 'Ordem de carga não encontrada' });
      }

      // Extract header data from request body directly or from first fiscal note
      let remetenteData = {};
      let destinatarioData = {};
      
      // Check if remetente/destinatario data comes directly in request body (edit mode)
      if (req.body.remetente_razao_social || req.body.remetente_cnpj) {
        console.log('ordens-carga-routes: Using remetente data from request body');
        remetenteData = {
          remetente_razao_social: req.body.remetente_razao_social || '',
          remetente_cnpj: req.body.remetente_cnpj || '',
          remetente_telefone: req.body.remetente_telefone || '',
          remetente_endereco: req.body.remetente_endereco || '',
          remetente_numero: req.body.remetente_numero || '',
          remetente_complemento: req.body.remetente_complemento || '',
          remetente_bairro: req.body.remetente_bairro || '',
          remetente_cidade: req.body.remetente_cidade || '',
          remetente_uf: req.body.remetente_uf || '',
          remetente_cep: req.body.remetente_cep || ''
        };
      }
      
      if (req.body.destinatario_razao_social || req.body.destinatario_cnpj) {
        console.log('ordens-carga-routes: Using destinatario data from request body');
        destinatarioData = {
          destinatario_razao_social: req.body.destinatario_razao_social || '',
          destinatario_cnpj: req.body.destinatario_cnpj || '',
          destinatario_telefone: req.body.destinatario_telefone || '',
          destinatario_endereco: req.body.destinatario_endereco || '',
          destinatario_numero: req.body.destinatario_numero || '',
          destinatario_complemento: req.body.destinatario_complemento || '',
          destinatario_bairro: req.body.destinatario_bairro || '',
          destinatario_cidade: req.body.destinatario_cidade || '',
          destinatario_uf: req.body.destinatario_uf || '',
          destinatario_cep: req.body.destinatario_cep || ''
        };
      }
      
      // Fallback: Extract from first fiscal note if no direct data and fiscal notes available
      if (Object.keys(remetenteData).length === 0 && Object.keys(destinatarioData).length === 0 && 
          req.body.notasFiscais && req.body.notasFiscais.length > 0) {
        console.log('ordens-carga-routes: Using remetente/destinatario data from first nota fiscal');
        const firstNota = req.body.notasFiscais[0];
        
        // Extract remetente data
        remetenteData = {
          remetente_razao_social: firstNota.emitente_razao_social || '',
          remetente_cnpj: firstNota.emitente_cnpj || '',
          remetente_telefone: firstNota.emitente_telefone || '',
          remetente_endereco: firstNota.emitente_endereco || '',
          remetente_numero: firstNota.emitente_numero || '',
          remetente_complemento: firstNota.emitente_complemento || '',
          remetente_bairro: firstNota.emitente_bairro || '',
          remetente_cidade: firstNota.emitente_cidade || '',
          remetente_uf: firstNota.emitente_uf || '',
          remetente_cep: firstNota.emitente_cep || ''
        };
        
        // Extract destinatario data
        destinatarioData = {
          destinatario_razao_social: firstNota.destinatario_razao_social || '',
          destinatario_cnpj: firstNota.destinatario_cnpj || '',
          destinatario_telefone: firstNota.destinatario_telefone || '',
          destinatario_endereco: firstNota.destinatario_endereco || '',
          destinatario_numero: firstNota.destinatario_numero || '',
          destinatario_complemento: firstNota.destinatario_complemento || '',
          destinatario_bairro: firstNota.destinatario_bairro || '',
          destinatario_cidade: firstNota.destinatario_cidade || '',
          destinatario_uf: firstNota.destinatario_uf || '',
          destinatario_cep: firstNota.destinatario_cep || ''
        };
      }

      // Process updates without overriding the ID and timestamp fields
      const updateData = {
        ...req.body,
        ...remetenteData,
        ...destinatarioData,
        volume_total: parseInt(req.body.volume_total || '0'),
        peso_total: req.body.peso_total || '0',
        valor_total_frete: req.body.valor_total_frete || '0',
        updated_at: new Date()
      };

      // Convert date strings to proper Date objects, handle empty strings
      if (updateData.data_operacao && updateData.data_operacao !== '') {
        updateData.data_operacao = new Date(updateData.data_operacao);
      } else if (updateData.data_operacao === '') {
        delete updateData.data_operacao;
      }
      
      // Validação dos novos campos de data
      if (updateData.data_prevista_coleta && typeof updateData.data_prevista_coleta === 'string' && updateData.data_prevista_coleta !== '') {
        updateData.data_prevista_coleta = new Date(updateData.data_prevista_coleta);
      } else if (updateData.data_prevista_coleta === '') {
        delete updateData.data_prevista_coleta;
      }
      
      if (updateData.data_coleta && typeof updateData.data_coleta === 'string' && updateData.data_coleta !== '') {
        updateData.data_coleta = new Date(updateData.data_coleta);
      } else if (updateData.data_coleta === '') {
        delete updateData.data_coleta;
      }
      
      if (updateData.data_prevista_entrada_armazem && typeof updateData.data_prevista_entrada_armazem === 'string' && updateData.data_prevista_entrada_armazem !== '') {
        updateData.data_prevista_entrada_armazem = new Date(updateData.data_prevista_entrada_armazem);
      } else if (updateData.data_prevista_entrada_armazem === '') {
        delete updateData.data_prevista_entrada_armazem;
      }
      
      if (updateData.data_entrada_armazem && typeof updateData.data_entrada_armazem === 'string' && updateData.data_entrada_armazem !== '') {
        updateData.data_entrada_armazem = new Date(updateData.data_entrada_armazem);
      } else if (updateData.data_entrada_armazem === '') {
        delete updateData.data_entrada_armazem;
      }
      
      if (updateData.data_carregamento && typeof updateData.data_carregamento === 'string' && updateData.data_carregamento !== '') {
        updateData.data_carregamento = new Date(updateData.data_carregamento);
      } else if (updateData.data_carregamento === '') {
        delete updateData.data_carregamento;
      }
      
      if (updateData.data_prevista_entrega && typeof updateData.data_prevista_entrega === 'string' && updateData.data_prevista_entrega !== '') {
        updateData.data_prevista_entrega = new Date(updateData.data_prevista_entrega);
      } else if (updateData.data_prevista_entrega === '') {
        delete updateData.data_prevista_entrega;
      }
      
      if (updateData.data_chegada_filial_entrega && typeof updateData.data_chegada_filial_entrega === 'string' && updateData.data_chegada_filial_entrega !== '') {
        updateData.data_chegada_filial_entrega = new Date(updateData.data_chegada_filial_entrega);
      } else if (updateData.data_chegada_filial_entrega === '') {
        delete updateData.data_chegada_filial_entrega;
      }
      
      if (updateData.data_saida_entrega && typeof updateData.data_saida_entrega === 'string' && updateData.data_saida_entrega !== '') {
        updateData.data_saida_entrega = new Date(updateData.data_saida_entrega);
      } else if (updateData.data_saida_entrega === '') {
        delete updateData.data_saida_entrega;
      }
      
      if (updateData.data_chegada_na_entrega && typeof updateData.data_chegada_na_entrega === 'string' && updateData.data_chegada_na_entrega !== '') {
        updateData.data_chegada_na_entrega = new Date(updateData.data_chegada_na_entrega);
      } else if (updateData.data_chegada_na_entrega === '') {
        delete updateData.data_chegada_na_entrega;
      }
      
      if (updateData.data_entrega && typeof updateData.data_entrega === 'string' && updateData.data_entrega !== '') {
        updateData.data_entrega = new Date(updateData.data_entrega);
      } else if (updateData.data_entrega === '') {
        delete updateData.data_entrega;
      }

      // Remove fields that shouldn't be updated or are handled separately
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.notasFiscais; // This is handled separately
      delete updateData.volumes; // This is handled separately
      delete updateData.volumeData; // This is handled separately
      delete updateData.totalNotas;
      delete updateData.totalVolumes;
      delete updateData.totalValor;
      delete updateData.totalPeso;
      delete updateData.totalM3;
      delete updateData.modulo;
      
      // Remove empty string fields that can cause conversion issues
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' && (key.includes('peso') || key.includes('quantidade') || key.includes('valor'))) {
          delete updateData[key];
        }
      });
      
      // Preserve numero_ordem from existing order if not provided in update
      if (!updateData.numero_ordem && existingOrdem[0].numero_ordem) {
        updateData.numero_ordem = existingOrdem[0].numero_ordem;
      }

      console.log('ordens-carga-routes: Processing update for ordem:', id);
      console.log('ordens-carga-routes: Dados de classificação recebidos:', {
        tipo_movimentacao: req.body.tipo_movimentacao,
        subtipo_operacao: req.body.subtipo_operacao,
        prioridade: req.body.prioridade,
        data_operacao: req.body.data_operacao,
        observacoes: req.body.observacoes
      });
      console.log('ordens-carga-routes: Update data que será salvo:', updateData);

      // Update the order
      const [updatedOrdem] = await db
        .update(ordens_carga)
        .set(updateData)
        .where(eq(ordens_carga.id, id))
        .returning();

      if (!updatedOrdem) {
        return res.status(500).json({ error: 'Erro ao atualizar ordem de carga' });
      }

      // Update related fiscal notes with pipeline dates and metadata
      console.log('ordens-carga-routes: Updating pipeline dates in related fiscal notes');
      
      // Get all fiscal notes related to this order
      const relatedNotesResult = await pool.query(`
        SELECT nf.id 
        FROM notas_fiscais nf
        JOIN itens_carga ic ON nf.id = ic.nota_fiscal_id
        WHERE ic.ordem_carga_id = $1
      `, [id]);

      // Update each fiscal note with pipeline dates
      for (const note of relatedNotesResult.rows) {
        await pool.query(`
          UPDATE notas_fiscais SET
            data_prevista_coleta = $1,
            data_coleta = $2,
            data_prevista_entrada_armazem = $3,
            data_entrada_armazem = $4,
            data_carregamento = $5,
            data_prevista_entrega = $6,
            data_chegada_filial_entrega = $7,
            data_saida_entrega = $8,
            data_chegada_na_entrega = $9,
            data_entrega = $10,
            empresa_cliente_id = $11,
            usuario_responsavel_id = $12,
            updated_at = $13
          WHERE id = $14
        `, [
          updateData.data_prevista_coleta || null,
          updateData.data_coleta || null,
          updateData.data_prevista_entrada_armazem || null,
          updateData.data_entrada_armazem || null,
          updateData.data_carregamento || null,
          updateData.data_prevista_entrega || null,
          updateData.data_chegada_filial_entrega || null,
          updateData.data_saida_entrega || null,
          updateData.data_chegada_na_entrega || null,
          updateData.data_entrega || null,
          req.user.empresa_id,
          req.user.id,
          new Date(),
          note.id
        ]);
      }
      
      console.log('ordens-carga-routes: Updated', relatedNotesResult.rows.length, 'fiscal notes with pipeline dates');

      // If there are new fiscal notes, handle them
      if (req.body.notasFiscais && req.body.notasFiscais.length > 0) {
        // Remove existing items for this order
        await db.delete(itens_carga).where(eq(itens_carga.ordem_carga_id, id));

        // Process fiscal notes and volumes
        for (const notaFiscal of req.body.notasFiscais) {
          console.log('ordens-carga-routes: Processing fiscal note:', notaFiscal.numero_nota || notaFiscal.chave_nota);
          
          // Insert or update fiscal note
          let notaFiscalId = notaFiscal.id;
          
          // Validar se o ID é um UUID válido (36 caracteres com hífens)
          const isValidUuid = notaFiscalId && notaFiscalId.length === 36 && notaFiscalId.includes('-');
          
          if (!notaFiscalId || !isValidUuid) {
            console.log('ordens-carga-routes: Invalid or missing UUID for nota, searching by chave');
            
            // Buscar nota existente pela chave
            const chaveNota = notaFiscal.chave_nota_fiscal || notaFiscal.chave_nota || notaFiscal.chave_acesso;
            const existingNotaResult = await pool.query(`
              SELECT id FROM notas_fiscais WHERE chave_acesso = $1
            `, [chaveNota]);
            
            if (existingNotaResult.rows.length > 0) {
              // Usar nota existente
              notaFiscalId = existingNotaResult.rows[0].id;
              console.log('ordens-carga-routes: Found existing nota with ID:', notaFiscalId);
            } else {
              // Create new fiscal note with complete data mapping
              console.log('ordens-carga-routes: Creating new nota fiscal with complete data');
              const notaFiscalData = {
                // Chaves primárias
                chave_acesso: notaFiscal.chave_nota_fiscal || chaveNota,
                numero_nf: notaFiscal.numero_nota || notaFiscal.numero,
                serie: notaFiscal.serie_nota || notaFiscal.serie,
                modelo: notaFiscal.modelo || '55',
                tipo_documento: 'nfe',
                tipo_operacao: notaFiscal.natureza_operacao || notaFiscal.operacao,
                empresa_id: req.user.empresa_id,
                
                // Dados do emitente
                emitente_cnpj: notaFiscal.emitente_cnpj,
                emitente_razao_social: notaFiscal.emitente_razao_social,
                emitente_nome_fantasia: notaFiscal.emitente_nome_fantasia,
                emitente_telefone: notaFiscal.emitente_telefone,
                emitente_endereco: notaFiscal.emitente_endereco,
                emitente_numero: notaFiscal.emitente_numero,
                emitente_complemento: notaFiscal.emitente_complemento,
                emitente_bairro: notaFiscal.emitente_bairro,
                emitente_cidade: notaFiscal.emitente_cidade,
                emitente_uf: notaFiscal.emitente_uf,
                emitente_cep: notaFiscal.emitente_cep,
                
                // Dados do destinatário
                destinatario_cnpj: notaFiscal.destinatario_cnpj,
                destinatario_razao_social: notaFiscal.destinatario_razao_social,
                destinatario_nome_fantasia: notaFiscal.destinatario_nome_fantasia,
                destinatario_telefone: notaFiscal.destinatario_telefone,
                destinatario_endereco: notaFiscal.destinatario_endereco,
                destinatario_numero: notaFiscal.destinatario_numero,
                destinatario_complemento: notaFiscal.destinatario_complemento,
                destinatario_bairro: notaFiscal.destinatario_bairro,
                destinatario_cidade: notaFiscal.destinatario_cidade,
                destinatario_uf: notaFiscal.destinatario_uf,
                destinatario_cep: notaFiscal.destinatario_cep,
                
                // Valores e pesos
                valor_total: parseFloat(notaFiscal.valor_nota_fiscal || notaFiscal.valor || 0),
                peso_bruto: parseFloat(notaFiscal.peso_bruto || notaFiscal.peso || 0),
                volumes: parseInt(notaFiscal.quantidade_volumes || notaFiscal.volume || 1),
                
                // Datas
                data_emissao: notaFiscal.data_hora_emissao ? new Date(notaFiscal.data_hora_emissao) : null,
                
                // Observações e XML
                observacoes: notaFiscal.informacoes_complementares || notaFiscal.observacoes,
                xml_content: notaFiscal.xml_content,
                xml_source: notaFiscal.xml_source || 'manual',
                
                // Metadados de sincronização
                empresa_cliente_id: req.user.empresa_id,
                usuario_responsavel_id: req.user.id,
                
                // Datas do pipeline logístico (sincronizadas da ordem)
                data_prevista_coleta: req.body.data_prevista_coleta,
                data_coleta: req.body.data_coleta,
                data_prevista_entrada_armazem: req.body.data_prevista_entrada_armazem,
                data_entrada_armazem: req.body.data_entrada_armazem,
                data_carregamento: req.body.data_carregamento,
                data_prevista_entrega: req.body.data_prevista_entrega,
                data_chegada_filial_entrega: req.body.data_chegada_filial_entrega,
                data_saida_entrega: req.body.data_saida_entrega,
                data_chegada_na_entrega: req.body.data_chegada_na_entrega,
                data_entrega: req.body.data_entrega,
                
                // Status
                status: 'recebido'
              };
              
              // Use raw SQL to avoid schema conflicts
              const newNotaResult = await pool.query(`
                INSERT INTO notas_fiscais (
                  chave_acesso, numero_nf, serie, modelo, tipo_documento, tipo_operacao, empresa_id,
                  emitente_cnpj, emitente_razao_social, emitente_nome_fantasia, emitente_telefone,
                  emitente_endereco, emitente_numero, emitente_complemento, emitente_bairro,
                  emitente_cidade, emitente_uf, emitente_cep,
                  destinatario_cnpj, destinatario_razao_social, destinatario_nome_fantasia, destinatario_telefone,
                  destinatario_endereco, destinatario_numero, destinatario_complemento, destinatario_bairro,
                  destinatario_cidade, destinatario_uf, destinatario_cep,
                  valor_total, peso_bruto, volumes, data_emissao, observacoes, xml_content, xml_source,
                  empresa_cliente_id, usuario_responsavel_id, status,
                  data_prevista_coleta, data_coleta, data_prevista_entrada_armazem, data_entrada_armazem,
                  data_carregamento, data_prevista_entrega, data_chegada_filial_entrega, data_saida_entrega,
                  data_chegada_na_entrega, data_entrega
                ) VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
                  $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
                  $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50
                ) RETURNING id
              `, [
                notaFiscalData.chave_acesso,
                notaFiscalData.numero_nf,
                notaFiscalData.serie,
                notaFiscalData.modelo,
                notaFiscalData.tipo_documento,
                notaFiscalData.tipo_operacao,
                notaFiscalData.empresa_id,
                notaFiscalData.emitente_cnpj,
                notaFiscalData.emitente_razao_social,
                notaFiscalData.emitente_nome_fantasia,
                notaFiscalData.emitente_telefone,
                notaFiscalData.emitente_endereco,
                notaFiscalData.emitente_numero,
                notaFiscalData.emitente_complemento,
                notaFiscalData.emitente_bairro,
                notaFiscalData.emitente_cidade,
                notaFiscalData.emitente_uf,
                notaFiscalData.emitente_cep,
                notaFiscalData.destinatario_cnpj,
                notaFiscalData.destinatario_razao_social,
                notaFiscalData.destinatario_nome_fantasia,
                notaFiscalData.destinatario_telefone,
                notaFiscalData.destinatario_endereco,
                notaFiscalData.destinatario_numero,
                notaFiscalData.destinatario_complemento,
                notaFiscalData.destinatario_bairro,
                notaFiscalData.destinatario_cidade,
                notaFiscalData.destinatario_uf,
                notaFiscalData.destinatario_cep,
                notaFiscalData.valor_total,
                notaFiscalData.peso_bruto,
                notaFiscalData.volumes,
                notaFiscalData.data_emissao,
                notaFiscalData.observacoes,
                notaFiscalData.xml_content,
                notaFiscalData.xml_source,
                notaFiscalData.empresa_cliente_id,
                notaFiscalData.usuario_responsavel_id,
                notaFiscalData.status,
                notaFiscalData.data_prevista_coleta,
                notaFiscalData.data_coleta,
                notaFiscalData.data_prevista_entrada_armazem,
                notaFiscalData.data_entrada_armazem,
                notaFiscalData.data_carregamento,
                notaFiscalData.data_prevista_entrega,
                notaFiscalData.data_chegada_filial_entrega,
                notaFiscalData.data_saida_entrega,
                notaFiscalData.data_chegada_na_entrega,
                notaFiscalData.data_entrega
              ]);
              
              const newNotaFiscal = { id: newNotaResult.rows[0].id };
              notaFiscalId = newNotaFiscal.id;
              console.log('ordens-carga-routes: Created new nota with ID:', notaFiscalId);
            }
          }

          // Create item relationship
          await db.insert(itens_carga).values({
            ordem_carga_id: id,
            nota_fiscal_id: notaFiscalId,
            volume_item: notaFiscal.volume || 1
          });

          // Process volumes if they exist
          if (notaFiscal.volumes && notaFiscal.volumes.length > 0) {
            for (const volume of notaFiscal.volumes) {
              const codigoEtiqueta = volume.codigo || `VOL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              
              await pool.query(`
                INSERT INTO volumes_etiqueta (
                  codigo_etiqueta, nota_fiscal_id, empresa_id,
                  altura_cm, largura_cm, comprimento_cm,
                  peso_kg, volume_m3, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              `, [
                codigoEtiqueta,
                notaFiscalId,
                req.user.empresa_id,
                volume.altura || 0,
                volume.largura || 0,
                volume.comprimento || 0,
                volume.peso || 0,
                volume.cubagem || 0,
                'recebido'
              ]);
            }
          }
        }
      }

      console.log('ordens-carga-routes: Successfully updated ordem:', updatedOrdem.numero_ordem);
      
      res.json({ 
        success: true, 
        message: 'Ordem de carga atualizada com sucesso',
        numero_ordem: updatedOrdem.numero_ordem,
        ordem: updatedOrdem 
      });
    } catch (error) {
      console.error('ordens-carga-routes: Update ordem error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      }
      res.status(500).json({ error: 'Erro ao atualizar ordem de carga' });
    }
  });

  // Delete loading order with cascade deletion
  app.delete('/api/ordens-carga/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    console.log('ordens-carga-routes: DELETE /api/ordens-carga/:id called');
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'ID da ordem é obrigatório' });
      }

      console.log('ordens-carga-routes: Deleting order with ID:', id);

      // First, verify if the order exists and user has permission
      const existingOrder = await db.select()
        .from(ordens_carga)
        .where(eq(ordens_carga.id, id))
        .limit(1);

      if (!existingOrder.length) {
        console.log('ordens-carga-routes: Order not found:', id);
        return res.status(404).json({ error: 'Ordem de carga não encontrada' });
      }

      console.log('ordens-carga-routes: Found order to delete:', existingOrder[0].numero_ordem);

      // Start transaction for cascade deletion
      await db.transaction(async (tx) => {
        // 1. Get all related nota_fiscal_ids through itens_carga
        const relatedItems = await tx.select({
          nota_fiscal_id: itens_carga.nota_fiscal_id
        })
        .from(itens_carga)
        .where(eq(itens_carga.ordem_carga_id, id));

        console.log('ordens-carga-routes: Found', relatedItems.length, 'related fiscal notes');

        // 2. For each fiscal note, delete related volumes_etiqueta
        for (const item of relatedItems) {
          await tx.delete(volumes_etiqueta)
            .where(eq(volumes_etiqueta.nota_fiscal_id, item.nota_fiscal_id));
          console.log('ordens-carga-routes: Deleted volumes for nota fiscal:', item.nota_fiscal_id);
        }

        // 3. Delete etiquetas related to the order (if any direct relationship exists)
        // Note: Based on schema, etiquetas might be related through volumes_etiqueta
        // If there's a direct relationship, add it here

        // 4. Delete itens_carga (relationship table)
        await tx.delete(itens_carga)
          .where(eq(itens_carga.ordem_carga_id, id));
        console.log('ordens-carga-routes: Deleted itens_carga for order:', id);

        // 5. Delete related fiscal notes
        for (const item of relatedItems) {
          await tx.delete(notas_fiscais)
            .where(eq(notas_fiscais.id, item.nota_fiscal_id));
          console.log('ordens-carga-routes: Deleted nota fiscal:', item.nota_fiscal_id);
        }

        // 6. Finally, delete the order itself
        await tx.delete(ordens_carga)
          .where(eq(ordens_carga.id, id));
        console.log('ordens-carga-routes: Deleted order:', id);
      });

      console.log('ordens-carga-routes: Successfully deleted order and all related records:', existingOrder[0].numero_ordem);
      
      res.json({ 
        success: true, 
        message: 'Ordem de carga e todos os registros relacionados foram excluídos com sucesso',
        numero_ordem: existingOrder[0].numero_ordem
      });
    } catch (error) {
      console.error('ordens-carga-routes: Delete ordem error:', error);
      res.status(500).json({ error: 'Erro ao excluir ordem de carga' });
    }
  });
}