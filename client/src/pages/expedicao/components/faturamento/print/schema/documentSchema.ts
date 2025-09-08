
import { z } from 'zod';

// Schema de validação do documento
export const documentSchema = z.object({
  documentNumber: z.string().min(1, "Número do documento é obrigatório"),
  documentType: z.string().min(1, "Tipo de documento é obrigatório"),
  departureDateTime: z.date({
    required_error: "Data/hora de saída é obrigatória",
  }),
  arrivalDateTime: z.date({
    required_error: "Data/hora de chegada é obrigatória",
  }),
  driverName: z.string().min(1, "Nome do motorista é obrigatório"),
  truckId: z.string().min(1, "Identificação do cavalo é obrigatória"),
  trailer1: z.string().optional(),
  trailer2: z.string().optional(),
  trailerType: z.string().min(1, "Tipo de carroceria é obrigatório"),
  issuerUser: z.string().min(1, "Usuário emissor é obrigatório"),
  checkerUser: z.string().min(1, "Usuário conferente é obrigatório"),
  transporterName: z.string().min(1, "Nome da transportadora é obrigatória"),
  transporterLogo: z.string().optional(),
});

export type DocumentInfo = z.infer<typeof documentSchema>;
