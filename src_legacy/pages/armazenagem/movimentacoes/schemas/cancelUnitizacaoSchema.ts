
import { z } from "zod";

export const cancelUnitizacaoSchema = z.object({
  codigo: z.string().optional(),
  tipo_unitizacao: z.string().optional(),
  localizacao_id: z.string().optional(),
  observacoes: z.string().optional(),
});

export type CancelUnitizacaoSchemaType = z.infer<typeof cancelUnitizacaoSchema>;

export const defaultValues: CancelUnitizacaoSchemaType = {
  codigo: '',
  tipo_unitizacao: '',
  localizacao_id: '',
  observacoes: '',
};
