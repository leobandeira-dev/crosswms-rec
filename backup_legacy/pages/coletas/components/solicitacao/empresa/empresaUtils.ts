
import { DadosEmpresa, EmpresaInfo } from './empresaTypes';

// Convert DadosEmpresa to EmpresaInfo format
export const convertDadosToEmpresaInfo = (dados: DadosEmpresa): EmpresaInfo => {
  return {
    razaoSocial: dados.razaoSocial,
    cnpj: dados.cnpj,
    endereco: dados.endereco.logradouro,
    numero: dados.endereco.numero,
    complemento: dados.endereco.complemento,
    bairro: dados.endereco.bairro,
    cidade: dados.endereco.cidade,
    uf: dados.endereco.uf,
    cep: dados.endereco.cep,
    telefone: dados.telefone || '',
    email: dados.email || ''
  };
};

// Convert EmpresaInfo to DadosEmpresa format
export const convertEmpresaInfoToDados = (info: EmpresaInfo): DadosEmpresa => {
  return {
    razaoSocial: info.razaoSocial,
    cnpj: info.cnpj,
    nomeFantasia: info.razaoSocial, // Use razaoSocial as fallback for nomeFantasia
    endereco: {
      logradouro: info.endereco,
      numero: info.numero,
      complemento: info.complemento || '',
      bairro: info.bairro,
      cidade: info.cidade,
      uf: info.uf,
      cep: info.cep
    },
    enderecoFormatado: `${info.endereco}, ${info.numero} - ${info.bairro}, ${info.cidade}/${info.uf}`,
    telefone: info.telefone || '',
    email: info.email || ''
  };
};

// Extract empresa info from XML data
export const extractEmpresaInfoFromXML = (xmlData: any): EmpresaInfo => {
  if (!xmlData) return {} as EmpresaInfo;
  
  return {
    razaoSocial: xmlData.razaoSocial || xmlData.nome || '',
    cnpj: xmlData.cnpj || '',
    endereco: xmlData.endereco?.logradouro || '',
    numero: xmlData.endereco?.numero || '',
    complemento: xmlData.endereco?.complemento || '',
    bairro: xmlData.endereco?.bairro || '',
    cidade: xmlData.endereco?.cidade || '',
    uf: xmlData.endereco?.uf || '',
    cep: xmlData.endereco?.cep || '',
    telefone: xmlData.telefone || '',
    email: xmlData.email || ''
  };
};

// Format address for display
export const formatEnderecoCompleto = (info: EmpresaInfo): string => {
  return `${info.endereco}, ${info.numero}${info.complemento ? ' - ' + info.complemento : ''}, ${info.bairro}, ${info.cidade}/${info.uf}`;
};
