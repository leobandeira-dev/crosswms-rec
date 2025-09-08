
import { Empresa } from '../../types/empresa.types';

export const mapEmpresaToFormData = (empresa: any) => {
  return {
    id: empresa.id,
    cnpj: empresa.cnpj,
    razaoSocial: empresa.razaoSocial || empresa.razao_social,
    nomeFantasia: empresa.nomeFantasia || empresa.nome_fantasia,
    email: empresa.email,
    telefone: empresa.telefone,
    logradouro: empresa.logradouro,
    numero: empresa.numero,
    complemento: empresa.complemento,
    bairro: empresa.bairro,
    cidade: empresa.cidade,
    uf: empresa.uf || empresa.estado,
    cep: empresa.cep,
    inscricaoEstadual: empresa.inscricaoEstadual || empresa.inscricao_estadual,
    perfil: empresa.perfil,
    transportadoraPrincipal: empresa.transportadoraPrincipal || empresa.transportadora_principal,
  };
};
