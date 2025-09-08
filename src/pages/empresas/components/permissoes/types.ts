
import { ModuloEmpresa, TabelaEmpresa, RotinaEmpresa } from '../../../usuarios/components/permissoes/types';

export interface PerfilEmpresaCustomizado {
  id: string;
  nome: string;
  descricao?: string;
}

export interface PermissionsState {
  [key: string]: boolean;
}

export interface EmpresaMock {
  id: string;
  nome: string;
  cnpj: string;
  perfil: string;
}
