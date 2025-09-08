
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { InternalFormData } from './solicitacaoFormTypes';
import { calcularTotaisColeta } from '../../../utils/volumes/calculations';
import { SolicitacaoColeta } from '../../../types/coleta.types';

export const useFormSubmission = (
  setFormData: React.Dispatch<React.SetStateAction<InternalFormData>>,
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>,
  setIsOpen: (open: boolean) => void
) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Get form data to submit
      setFormData(prev => {
        // Calculate totals
        const totais = calcularTotaisColeta(prev.notasFiscais);
        
        // Add calculated values and date/timestamp
        const now = new Date();
        const dataInclusao = now.toISOString().split('T')[0];
        const horaInclusao = now.toTimeString().slice(0, 5);
        
        return {
          ...prev,
          quantidadeVolumes: totais.qtdVolumes,
          dataInclusao,
          horaInclusao,
        };
      });
      
      // Get the latest form data to save
      const formData = await new Promise<InternalFormData>(resolve => {
        setFormData(currentData => {
          resolve(currentData);
          return currentData;
        });
      });
      
      // Create new solicitation object
      const novaColeta: SolicitacaoColeta = {
        id: `SOL-${Date.now().toString().substr(-6)}`,
        dataSolicitacao: formData.dataInclusao || new Date().toISOString().split('T')[0],
        dataColeta: formData.dataColeta,
        status: 'pending',
        remetente: {
          cnpj: formData.remetente.cnpj,
          razaoSocial: formData.remetente.razaoSocial,
          nomeFantasia: formData.remetente.razaoSocial,
          endereco: {
            logradouro: formData.remetente.endereco,
            numero: formData.remetente.numero,
            complemento: formData.remetente.complemento || '',
            bairro: formData.remetente.bairro,
            cidade: formData.remetente.cidade,
            uf: formData.remetente.uf,
            cep: formData.remetente.cep
          },
          enderecoFormatado: `${formData.remetente.endereco}, ${formData.remetente.numero} - ${formData.remetente.bairro}, ${formData.remetente.cidade}-${formData.remetente.uf}`
        },
        destinatario: {
          cnpj: formData.destinatario.cnpj,
          razaoSocial: formData.destinatario.razaoSocial,
          nomeFantasia: formData.destinatario.razaoSocial,
          endereco: {
            logradouro: formData.destinatario.endereco,
            numero: formData.destinatario.numero,
            complemento: formData.destinatario.complemento || '',
            bairro: formData.destinatario.bairro,
            cidade: formData.destinatario.cidade,
            uf: formData.destinatario.uf,
            cep: formData.destinatario.cep
          },
          enderecoFormatado: `${formData.destinatario.endereco}, ${formData.destinatario.numero} - ${formData.destinatario.bairro}, ${formData.destinatario.cidade}-${formData.destinatario.uf}`
        },
        notasFiscais: formData.notasFiscais,
        observacoes: formData.observacoes,
        origem: formData.origem,
        destino: formData.destino,
        volumes: formData.quantidadeVolumes
      };
      
      // Update the solicitations list in localStorage
      const existingSolicitations = JSON.parse(localStorage.getItem('solicitacoesColeta') || '[]');
      const updatedSolicitations = [novaColeta, ...existingSolicitations];
      localStorage.setItem('solicitacoesColeta', JSON.stringify(updatedSolicitations));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de coleta foi enviada com sucesso."
      });
      
      // Reset the form and close dialog
      setCurrentStep(1);
      setIsOpen(false);
      
      // Reload the page to show updated solicitations list
      window.location.reload();
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit
  };
};
