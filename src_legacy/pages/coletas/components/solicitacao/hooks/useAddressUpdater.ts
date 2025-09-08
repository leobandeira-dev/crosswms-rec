
import { useEffect } from 'react';
import { InternalFormData } from './solicitacaoFormTypes';
import { EmpresaInfo } from '../SolicitacaoTypes';

export const useAddressUpdater = (
  formData: InternalFormData,
  setFormData: React.Dispatch<React.SetStateAction<InternalFormData>>
) => {
  // Update remetente and destinatario info when XML is imported
  useEffect(() => {
    if (formData.remetenteInfo) {
      // Convert remetente info from XML format to internal format
      const remetente: EmpresaInfo = {
        razaoSocial: formData.remetenteInfo.nome || '',
        cnpj: formData.remetenteInfo.cnpj || '',
        endereco: formData.remetenteInfo.endereco?.logradouro || '',
        numero: formData.remetenteInfo.endereco?.numero || '',
        complemento: formData.remetenteInfo.endereco?.complemento || '',
        bairro: formData.remetenteInfo.endereco?.bairro || '',
        cidade: formData.remetenteInfo.endereco?.cidade || '',
        uf: formData.remetenteInfo.endereco?.uf || '',
        cep: formData.remetenteInfo.endereco?.cep || '',
        telefone: '',
        email: ''
      };

      // Update origin address fields
      const origem = `${formData.remetenteInfo.endereco?.cidade || ''} - ${formData.remetenteInfo.endereco?.uf || ''}`;
      
      setFormData(prev => ({
        ...prev,
        remetente,
        origem,
        origemEndereco: formData.remetenteInfo.endereco?.logradouro 
          ? `${formData.remetenteInfo.endereco.logradouro}, ${formData.remetenteInfo.endereco.numero || ''}`
          : '',
        origemCEP: formData.remetenteInfo.endereco?.cep || '',
        // Remove reference to cliente and maintain tipoFrete as is
        tipoFrete: prev.tipoFrete // Maintain existing tipoFrete value
      }));
    }
    
    if (formData.destinatarioInfo) {
      // Convert destinatario info from XML format to internal format
      const destinatario: EmpresaInfo = {
        razaoSocial: formData.destinatarioInfo.nome || '',
        cnpj: formData.destinatarioInfo.cnpj || '',
        endereco: formData.destinatarioInfo.endereco?.logradouro || '',
        numero: formData.destinatarioInfo.endereco?.numero || '',
        complemento: formData.destinatarioInfo.endereco?.complemento || '',
        bairro: formData.destinatarioInfo.endereco?.bairro || '',
        cidade: formData.destinatarioInfo.endereco?.cidade || '',
        uf: formData.destinatarioInfo.endereco?.uf || '',
        cep: formData.destinatarioInfo.endereco?.cep || '',
        telefone: '',
        email: ''
      };

      // Update destination address fields
      const destino = `${formData.destinatarioInfo.endereco?.cidade || ''} - ${formData.destinatarioInfo.endereco?.uf || ''}`;
      
      setFormData(prev => ({
        ...prev,
        destinatario,
        destino,
        destinoEndereco: formData.destinatarioInfo.endereco?.logradouro 
          ? `${formData.destinatarioInfo.endereco.logradouro}, ${formData.destinatarioInfo.endereco.numero || ''}`
          : '',
        destinoCEP: formData.destinatarioInfo.endereco?.cep || ''
      }));
    }
  }, [formData.remetenteInfo, formData.destinatarioInfo, setFormData]);
};
