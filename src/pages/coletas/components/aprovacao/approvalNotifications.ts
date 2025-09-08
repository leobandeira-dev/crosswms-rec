
import { toast } from "@/hooks/use-toast";

export const showApprovalNotification = (requestId: string) => {
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString()} às ${currentDate.toLocaleTimeString()}`;
  const approverName = "Maria Oliveira"; // Normally would come from user session
  
  toast({
    title: "Coleta aprovada com sucesso!",
    description: `A coleta ${requestId} foi aprovada em ${formattedDate} por ${approverName}.`,
  });
};

export const showRejectionNotification = (requestId: string) => {
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString()} às ${currentDate.toLocaleTimeString()}`;
  const approverName = "Maria Oliveira"; // Normally would come from user session
  
  toast({
    title: "Coleta recusada",
    description: `A coleta ${requestId} foi recusada em ${formattedDate} por ${approverName}.`,
    variant: "destructive",
  });
};
