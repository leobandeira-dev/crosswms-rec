
import { toast } from "@/hooks/use-toast";

/**
 * Handles errors that occur during PDF generation
 * @param error The error that occurred during PDF generation
 * @returns null to indicate PDF generation failed
 */
export const handlePDFError = (error: unknown) => {
  console.error("Erro detalhado ao gerar PDF:", error);
  toast({
    title: "Erro",
    description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
    variant: "destructive"
  });
  return null;
};
