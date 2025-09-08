import { Request, Response } from "express";
import { db } from "./db";
import { volumes_etiqueta, notas_fiscais } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export function registerVolumesRoutes(app: any) {
  
  // Salvar nota fiscal no banco e retornar ID único
  app.post('/api/notas-fiscais', async (req: Request, res: Response) => {
    try {
      const notaFiscal = req.body;
      
      console.log('Salvando nota fiscal:', { chave: notaFiscal.chave_nota_fiscal, numero: notaFiscal.numero_nota });

      // Usar a chave da nota fiscal como ID único (permite múltiplas passagens)
      const notaFiscalId = uuidv4();
      
      // Inserir dados mínimos necessários para manter consistência
      try {
        await db.execute(sql`
          INSERT INTO notas_fiscais (
            id, chave_acesso, numero_nf, empresa_id, 
            emitente_razao_social, destinatario_razao_social, 
            valor_total, peso_bruto, volumes,
            data_emissao, status, created_at, updated_at
          ) VALUES (
            ${notaFiscalId},
            ${notaFiscal.chave_nota_fiscal || notaFiscal.chave_acesso || notaFiscalId},
            ${notaFiscal.numero_nota || notaFiscal.numero_nf || ''},
            ${notaFiscal.empresa_id || ''},
            ${notaFiscal.emitente_razao_social || ''},
            ${notaFiscal.destinatario_razao_social || ''},
            ${parseFloat(notaFiscal.valor_nota_fiscal?.toString().replace(/[^\d.,]/g, '').replace(',', '.') || '0')},
            ${parseFloat(notaFiscal.peso_bruto?.toString() || '0')},
            ${parseInt(notaFiscal.quantidade_volumes?.toString() || '1')},
            ${notaFiscal.data_hora_emissao ? new Date(notaFiscal.data_hora_emissao) : new Date()},
            ${'recebido'},
            ${new Date()},
            ${new Date()}
          )
        `);
      } catch (dbError) {
        console.log('Nota fiscal já existe ou erro na inserção, usando ID gerado:', dbError);
      }
      
      res.json({ 
        success: true, 
        id: notaFiscalId, 
        message: 'Nota fiscal processada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao processar nota fiscal:', error);
      res.status(500).json({ error: 'Erro ao processar nota fiscal' });
    }
  });

  // Salvar dimensões de volumes usando ID único da nota fiscal
  app.post('/api/volumes/dimensoes', async (req: Request, res: Response) => {
    try {
      const { 
        nota_fiscal_id, 
        empresa_id,
        volumes 
      } = req.body;

      console.log('Salvando dimensões de volumes:', { nota_fiscal_id, empresa_id, volumes });

      if (!nota_fiscal_id || !empresa_id || !volumes || !Array.isArray(volumes)) {
        return res.status(400).json({ 
          error: 'Dados obrigatórios: nota_fiscal_id (UUID), empresa_id e volumes (array)' 
        });
      }

      // Buscar o número real da nota fiscal
      let numeroNotaReal = nota_fiscal_id.substring(0, 8); // Fallback
      try {
        const notaFiscalData = await db.select({
          numero_nf: notas_fiscais.numero_nf
        })
        .from(notas_fiscais)
        .where(eq(notas_fiscais.id, nota_fiscal_id))
        .limit(1);
        
        if (notaFiscalData.length > 0 && notaFiscalData[0].numero_nf) {
          numeroNotaReal = notaFiscalData[0].numero_nf;
          console.log('Número real da nota fiscal encontrado:', numeroNotaReal);
        }
      } catch (error) {
        console.log('Erro ao buscar número da nota fiscal, usando fallback:', error);
      }

      // Verificar volumes existentes antes de deletar
      const volumesExistentes = await db.select()
        .from(volumes_etiqueta)
        .where(eq(volumes_etiqueta.nota_fiscal_id, nota_fiscal_id));

      console.log('Volumes existentes encontrados:', volumesExistentes.length);

      // Remover volumes existentes desta instância específica da nota fiscal
      await db.delete(volumes_etiqueta)
        .where(eq(volumes_etiqueta.nota_fiscal_id, nota_fiscal_id));

      // Inserir novos volumes com dimensões
      const volumesParaInserir = volumes.map((volume: any, index: number) => {
        const altura_m = parseFloat(volume.altura) || 0;
        const largura_m = parseFloat(volume.largura) || 0;
        const comprimento_m = parseFloat(volume.comprimento) || 0;
        
        // Converter metros para centímetros para armazenamento
        const altura_cm = altura_m * 100;
        const largura_cm = largura_m * 100;
        const comprimento_cm = comprimento_m * 100;
        
        // Calcular volume em m³
        const volume_m3 = altura_m * largura_m * comprimento_m;

        // Gerar código sempre com formato correto usando número da NF
        let codigo_etiqueta;
        const volumeExistente = volumesExistentes[index];
        
        // Verificar se o código existente já está no formato correto
        const formatoCorreto = volumeExistente?.codigo_etiqueta?.startsWith(`NF${numeroNotaReal}-`);
        
        if (volumeExistente && formatoCorreto) {
          // Preservar código existente se já está no formato correto
          codigo_etiqueta = volumeExistente.codigo_etiqueta;
          console.log(`Preservando código correto para volume ${index + 1}:`, codigo_etiqueta);
        } else {
          // Gerar código usando timestamp da criação original ou atual
          let timestampParaUsar;
          
          if (volumeExistente && volumeExistente.created_at) {
            // Usar timestamp original da criação
            timestampParaUsar = new Date(volumeExistente.created_at);
            console.log(`Usando timestamp original para volume ${index + 1}:`, timestampParaUsar);
          } else {
            // Usar timestamp atual se não existe
            timestampParaUsar = new Date();
            console.log(`Usando timestamp atual para volume ${index + 1}:`, timestampParaUsar);
          }
          
          // Converter para horário de São Paulo usando Intl API
          const formatter = new Intl.DateTimeFormat('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
          
          const parts = formatter.formatToParts(timestampParaUsar);
          const day = parts.find(p => p.type === 'day')?.value || '01';
          const month = parts.find(p => p.type === 'month')?.value || '01';
          const year = parts.find(p => p.type === 'year')?.value || '2025';
          const hours = parts.find(p => p.type === 'hour')?.value || '00';
          const minutes = parts.find(p => p.type === 'minute')?.value || '00';
          
          const volumeStr = String(index + 1).padStart(3, '0');
          const dateTimeStr = `${day}${month}${year}-${hours}${minutes}`;
          
          codigo_etiqueta = `NF${numeroNotaReal}-${volumeStr}-${dateTimeStr}`;
          console.log(`Gerando código corrigido para volume ${index + 1}:`, codigo_etiqueta);
        }

        return {
          id: uuidv4(),
          codigo_etiqueta: codigo_etiqueta,
          nota_fiscal_id: nota_fiscal_id,
          empresa_id,
          altura_cm: altura_cm.toString(),
          largura_cm: largura_cm.toString(),
          comprimento_cm: comprimento_cm.toString(),
          volume_m3: volume_m3.toFixed(2),
          peso_kg: (parseFloat(volume.peso) || 0).toString(),
          descricao: `Volume ${index + 1}`,
          status: volumeExistente?.status || 'recebido',
          created_at: new Date(),
          updated_at: new Date()
        };
      });

      const resultados = await db.insert(volumes_etiqueta)
        .values(volumesParaInserir)
        .returning();

      console.log(`Inseridos ${resultados.length} volumes com dimensões para nota fiscal ${nota_fiscal_id}`);

      res.json({ 
        success: true, 
        volumes: resultados,
        message: `${resultados.length} volumes salvos com sucesso`
      });

    } catch (error) {
      console.error('Erro ao salvar dimensões dos volumes:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor ao salvar dimensões',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Buscar volumes por nota fiscal
  app.get('/api/volumes/nota/:nota_fiscal_id', async (req: Request, res: Response) => {
    try {
      const { nota_fiscal_id } = req.params;

      const volumes = await db.select()
        .from(volumes_etiqueta)
        .where(eq(volumes_etiqueta.nota_fiscal_id, nota_fiscal_id));

      res.json({ success: true, volumes });
    } catch (error) {
      console.error('Erro ao buscar volumes:', error);
      res.status(500).json({ error: 'Erro ao buscar volumes' });
    }
  });

  // Atualizar dimensões de um volume específico
  app.put('/api/volumes/:volume_id', async (req: Request, res: Response) => {
    try {
      const { volume_id } = req.params;
      const { altura, largura, comprimento, peso } = req.body;

      const altura_cm = (parseFloat(altura) || 0) * 100;
      const largura_cm = (parseFloat(largura) || 0) * 100;
      const comprimento_cm = (parseFloat(comprimento) || 0) * 100;
      const volume_m3 = (parseFloat(altura) || 0) * (parseFloat(largura) || 0) * (parseFloat(comprimento) || 0);

      await db.update(volumes_etiqueta)
        .set({
          altura_cm: altura_cm.toString(),
          largura_cm: largura_cm.toString(),
          comprimento_cm: comprimento_cm.toString(),
          volume_m3: volume_m3.toFixed(2),
          peso_kg: (parseFloat(peso) || 0).toString(),
          updated_at: new Date()
        })
        .where(eq(volumes_etiqueta.id, volume_id));

      res.json({ success: true, message: 'Volume atualizado com sucesso' });
    } catch (error) {
      console.error('Erro ao atualizar volume:', error);
      res.status(500).json({ error: 'Erro ao atualizar volume' });
    }
  });

  // Deletar um volume específico
  app.delete('/api/volumes/:volume_id', async (req: Request, res: Response) => {
    try {
      const { volume_id } = req.params;

      await db.delete(volumes_etiqueta)
        .where(eq(volumes_etiqueta.id, volume_id));

      res.json({ success: true, message: 'Volume removido com sucesso' });
    } catch (error) {
      console.error('Erro ao remover volume:', error);
      res.status(500).json({ error: 'Erro ao remover volume' });
    }
  });

  // Atualizar status de etiqueta/volume
  app.patch('/api/volumes/:volume_id/status', async (req: Request, res: Response) => {
    try {
      const { volume_id } = req.params;
      const { status } = req.body;

      console.log(`Atualizando status do volume ${volume_id} para: ${status}`);

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }

      // Status válidos: recebido, impressa, processada, enderecada, conferida, carregada
      const statusValidos = ['recebido', 'impressa', 'processada', 'enderecada', 'conferida', 'carregada'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ 
          error: 'Status inválido', 
          statusValidos 
        });
      }

      await db.update(volumes_etiqueta)
        .set({
          status: status,
          updated_at: new Date()
        })
        .where(eq(volumes_etiqueta.id, volume_id));

      res.json({ success: true, message: `Status atualizado para ${status}` });
    } catch (error) {
      console.error('Erro ao atualizar status do volume:', error);
      res.status(500).json({ error: 'Erro ao atualizar status do volume' });
    }
  });

  // Atualizar status de etiqueta por código de etiqueta
  app.patch('/api/volumes/codigo/:codigo_etiqueta/status', async (req: Request, res: Response) => {
    try {
      const { codigo_etiqueta } = req.params;
      const { status } = req.body;

      console.log(`Atualizando status da etiqueta ${codigo_etiqueta} para: ${status}`);

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }

      const statusValidos = ['recebido', 'impressa', 'processada', 'enderecada', 'conferida', 'carregada'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ 
          error: 'Status inválido', 
          statusValidos 
        });
      }

      await db.update(volumes_etiqueta)
        .set({
          status: status,
          updated_at: new Date()
        })
        .where(eq(volumes_etiqueta.codigo_etiqueta, codigo_etiqueta));

      res.json({ success: true, message: `Status da etiqueta ${codigo_etiqueta} atualizado para ${status}` });
    } catch (error) {
      console.error('Erro ao atualizar status da etiqueta:', error);
      res.status(500).json({ error: 'Erro ao atualizar status da etiqueta' });
    }
  });

  // Buscar volumes por nota fiscal com status
  app.get('/api/volumes/nota/:nota_fiscal_numero/status', async (req: Request, res: Response) => {
    try {
      const { nota_fiscal_numero } = req.params;

      console.log(`Buscando status dos volumes da nota fiscal: ${nota_fiscal_numero}`);

      // Buscar volumes pela nota fiscal número
      const volumes = await db.execute(sql`
        SELECT v.*, nf.numero_nf
        FROM volumes_etiqueta v
        JOIN notas_fiscais nf ON v.nota_fiscal_id = nf.id
        WHERE nf.numero_nf = ${nota_fiscal_numero}
      `);

      res.json({ success: true, volumes });
    } catch (error) {
      console.error('Erro ao buscar status dos volumes:', error);
      res.status(500).json({ error: 'Erro ao buscar status dos volumes' });
    }
  });

  // Atualizar status de todas as etiquetas de uma nota fiscal
  app.patch('/api/volumes/nota/:nota_fiscal_numero/status', async (req: Request, res: Response) => {
    try {
      const { nota_fiscal_numero } = req.params;
      const { status } = req.body;

      console.log(`Atualizando status de todas as etiquetas da nota fiscal ${nota_fiscal_numero} para: ${status}`);

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }

      const statusValidos = ['recebido', 'impressa', 'processada', 'enderecada', 'conferida', 'carregada'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ 
          error: 'Status inválido', 
          statusValidos 
        });
      }

      // Atualizar status de todos os volumes relacionados à nota fiscal
      const result = await db.execute(sql`
        UPDATE volumes_etiqueta 
        SET status = ${status}, updated_at = ${new Date()}
        WHERE nota_fiscal_id IN (
          SELECT id FROM notas_fiscais WHERE numero_nf = ${nota_fiscal_numero}
        )
      `);

      res.json({ success: true, message: `Status de todas as etiquetas da nota ${nota_fiscal_numero} atualizado para ${status}` });
    } catch (error) {
      console.error('Erro ao atualizar status das etiquetas:', error);
      res.status(500).json({ error: 'Erro ao atualizar status das etiquetas' });
    }
  });

  // Atualizar status de etiqueta por código de etiqueta (rota específica para UI)
  app.patch('/api/volumes/etiqueta/:codigo_etiqueta/status', async (req: Request, res: Response) => {
    try {
      const { codigo_etiqueta } = req.params;
      const { status } = req.body;

      console.log(`Atualizando status da etiqueta ${codigo_etiqueta} para: ${status}`);

      if (!status) {
        return res.status(400).json({ error: 'Status é obrigatório' });
      }

      const statusValidos = ['recebido', 'impressa', 'processada', 'enderecada', 'conferida', 'carregada', 'Pendente'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ 
          error: 'Status inválido', 
          statusValidos 
        });
      }

      // Buscar e atualizar o volume pelo código da etiqueta
      const result = await db.update(volumes_etiqueta)
        .set({
          status: status,
          updated_at: new Date()
        })
        .where(eq(volumes_etiqueta.codigo_etiqueta, codigo_etiqueta));

      console.log(`Status da etiqueta ${codigo_etiqueta} atualizado para ${status} no banco de dados`);
      
      res.json({ success: true, message: `Status da etiqueta ${codigo_etiqueta} atualizado para ${status}` });
    } catch (error) {
      console.error('Erro ao atualizar status da etiqueta por código:', error);
      res.status(500).json({ error: 'Erro ao atualizar status da etiqueta' });
    }
  });


}