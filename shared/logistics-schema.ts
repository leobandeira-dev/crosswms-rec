import { z } from "zod";

// Schema para inserção de dados logísticos
export const insertLogisticsSchema = z.object({
  id: z.string().optional(),
  tipo: z.string(),
  descricao: z.string(),
  status: z.string().default("ativo"),
  empresa_id: z.string(),
  dados_adicionais: z.record(z.any()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema para atualização de dados logísticos
export const updateLogisticsSchema = insertLogisticsSchema.partial();

// Schema para consulta de dados logísticos
export const queryLogisticsSchema = z.object({
  id: z.string().optional(),
  tipo: z.string().optional(),
  status: z.string().optional(),
  empresa_id: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

// Tipos derivados dos schemas
export type InsertLogistics = z.infer<typeof insertLogisticsSchema>;
export type UpdateLogistics = z.infer<typeof updateLogisticsSchema>;
export type QueryLogistics = z.infer<typeof queryLogisticsSchema>;
