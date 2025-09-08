
export const handleWhatsAppSupport = (cargaInfo?: {
  id?: string;
  destino?: string;
  motorista?: string;
  veiculo?: string;
  cpf?: string;
}) => {
  // Número fictício para suporte via WhatsApp
  const phoneNumber = "5511912345678";
  
  let messageText = "Olá,%20preciso%20de%20suporte";
  
  if (cargaInfo) {
    messageText = `Olá,%20preciso%20de%20suporte%20com%20a%20carga%20${cargaInfo.id || ''}%20com%20destino%20${cargaInfo.destino || ''}`;
    
    if (cargaInfo.motorista) {
      messageText += `%20-%20Motorista:%20${cargaInfo.motorista}`;
    }
    
    if (cargaInfo.cpf) {
      messageText += `%20-%20CPF:%20${cargaInfo.cpf}`;
    }
    
    if (cargaInfo.veiculo) {
      messageText += `%20-%20Veículo:%20${cargaInfo.veiculo}`;
    }
  }
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${messageText}`;
  window.open(whatsappUrl, '_blank');
};

export const problemosComuns = [
  {
    title: "Problemas na Portaria",
    description: "Não permitem entrada devido à documentação/autorização"
  },
  {
    title: "Cliente Ausente",
    description: "Local fechado, cliente não está no endereço"
  },
  {
    title: "Endereço Incorreto",
    description: "O endereço não foi encontrado ou está incorreto"
  },
  {
    title: "Recusa de Recebimento",
    description: "Cliente não quer receber por motivo não especificado"
  },
  {
    title: "Problemas Mecânicos",
    description: "Veículo com problemas mecânicos, preciso de suporte"
  },
  {
    title: "Mercadoria Danificada",
    description: "Foi identificado dano na mercadoria durante o transporte"
  },
  {
    title: "Falta de Documentação",
    description: "Falta nota fiscal ou outros documentos necessários"
  }
];

