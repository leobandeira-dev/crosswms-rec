
import * as z from 'zod';

// Schema for validating the approval/rejection form
export const formSchema = z.object({
  observacoes: z.string().optional(),
  motivoRecusa: z.string().min(10, {
    message: "O motivo da recusa deve ter pelo menos 10 caracteres",
  }).optional().refine(value => {
    // If rejecting, reason is required
    if ((window as any).isRejecting && (!value || value.length < 10)) {
      return false;
    }
    return true;
  }, {
    message: "O motivo da recusa é obrigatório para rejeições",
  }),
});

export type FormData = z.infer<typeof formSchema>;
