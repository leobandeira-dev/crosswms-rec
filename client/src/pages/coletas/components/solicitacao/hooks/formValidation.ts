
import { InternalFormData } from './solicitacaoFormTypes';
import { toast } from '@/hooks/use-toast';

export const validateStep = (step: number, formData: InternalFormData): boolean => {
  switch (step) {
    case 1:
      return validateStep1(formData);
    case 2:
      return validateStep2(formData);
    default:
      return true;
  }
};

const validateStep1 = (formData: InternalFormData): boolean => {
  // Required fields for step 1
  if (!formData.tipoFrete) {
    toast({
      title: "Campo obrigatório",
      description: "Selecione o tipo de frete (FOB ou CIF)",
      variant: "destructive"
    });
    return false;
  }

  if (!formData.dataColeta) {
    toast({
      title: "Campo obrigatório",
      description: "Informe a data de coleta",
      variant: "destructive"
    });
    return false;
  }

  if (!formData.origem) {
    toast({
      title: "Campo obrigatório",
      description: "Informe a origem da coleta",
      variant: "destructive"
    });
    return false;
  }

  if (!formData.destino) {
    toast({
      title: "Campo obrigatório",
      description: "Informe o destino da coleta",
      variant: "destructive"
    });
    return false;
  }

  if (!formData.notasFiscais || formData.notasFiscais.length === 0) {
    toast({
      title: "Notas fiscais",
      description: "Adicione pelo menos uma nota fiscal",
      variant: "destructive"
    });
    return false;
  }

  return true;
};

const validateStep2 = (formData: InternalFormData): boolean => {
  // Validation for step 2 (if needed)
  
  // Check if remetente info is filled
  if (!formData.remetente || !formData.remetente.razaoSocial || !formData.remetente.cnpj) {
    toast({
      title: "Dados do remetente",
      description: "Preencha os dados do remetente",
      variant: "destructive"
    });
    return false;
  }

  // Check if destinatario info is filled
  if (!formData.destinatario || !formData.destinatario.razaoSocial || !formData.destinatario.cnpj) {
    toast({
      title: "Dados do destinatário",
      description: "Preencha os dados do destinatário",
      variant: "destructive"
    });
    return false;
  }

  return true;
};
