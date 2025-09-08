
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormData, formSchema } from '../formSchema';
import { SolicitacaoColeta } from '../../../types/coleta.types';
import { showApprovalNotification, showRejectionNotification } from '../approvalNotifications';

interface UseAprovacaoFormProps {
  selectedRequest: SolicitacaoColeta;
  onClose: () => void;
  onApprove: (solicitacaoId: string, observacoes?: string) => void;
  onReject: (solicitacaoId: string, motivoRecusa: string) => void;
  isRejecting: boolean;
  setIsRejecting: (value: boolean) => void;
}

export const useAprovacaoForm = ({
  selectedRequest,
  onClose,
  onApprove,
  onReject,
  isRejecting,
  setIsRejecting
}: UseAprovacaoFormProps) => {
  // Initialize form with react-hook-form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      observacoes: '',
      motivoRecusa: '',
    },
  });

  // Define global variable for schema refine to work
  (window as any).isRejecting = isRejecting;
  
  const handleSubmit = async (data: FormData) => {
    if (!selectedRequest) return;
    
    console.log("AprovacaoForm: Processando formulário. isRejecting:", isRejecting);
    
    if (isRejecting) {
      // Check if we have a valid rejection reason
      if (!data.motivoRecusa || data.motivoRecusa.length < 10) {
        form.setError('motivoRecusa', {
          type: 'manual',
          message: 'O motivo da recusa é obrigatório e deve ter pelo menos 10 caracteres',
        });
        return;
      }
      
      // Log for debugging
      console.log("AprovacaoForm: Recusando solicitação:", selectedRequest.id, data.motivoRecusa);
      
      // Call the onReject function from parent component with request ID and reason
      onReject(selectedRequest.id, data.motivoRecusa);
      
      showRejectionNotification(selectedRequest.id);
    } else {
      // Log for debugging
      console.log("AprovacaoForm: Aprovando solicitação:", selectedRequest.id, data.observacoes);
      
      // Call the onApprove function from parent component with request ID and notes
      onApprove(selectedRequest.id, data.observacoes);
      
      showApprovalNotification(selectedRequest.id);
    }
  };

  // Function to handle direct approval (avoiding form submission issues)
  const handleApproveClick = () => {
    const observacoes = form.getValues("observacoes");
    console.log("AprovacaoForm: Clique direto no botão Aprovar, observações:", observacoes);
    
    // Call the onApprove function from parent component with request ID and notes
    onApprove(selectedRequest.id, observacoes);
    
    showApprovalNotification(selectedRequest.id);
  };

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
    handleApproveClick,
    isRejecting
  };
};
