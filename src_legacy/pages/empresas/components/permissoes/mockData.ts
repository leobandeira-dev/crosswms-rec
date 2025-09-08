
import { ModuloEmpresa } from '../../../usuarios/components/permissoes/types';
import { EmpresaMock } from './types';

// Company profiles - Updated terminology as requested
export const profiles = [
  "Transportadora",
  "Filial",
  "Cliente",
  "Fornecedor"
];

// Mock companies for select
export const empresasMock: EmpresaMock[] = [
  { id: "1", nome: "Transportes Rápidos Ltda", cnpj: "12.345.678/0001-90", perfil: "Transportadora" },
  { id: "2", nome: "Filial SP Transportes", cnpj: "12.345.678/0002-71", perfil: "Filial" },
  { id: "3", nome: "Indústria ABC S.A.", cnpj: "45.678.901/0001-23", perfil: "Cliente" },
  { id: "4", nome: "Fornecedor XYZ S.A.", cnpj: "56.789.012/0001-34", perfil: "Fornecedor" },
];

// Similar to user permissions, adapted for companies
export const systemModules: ModuloEmpresa[] = [
  {
    id: 'armazenagem',
    nome: 'Armazenagem',
    tabelas: [
      {
        id: 'recebimento',
        nome: 'Recebimento',
        rotinas: [
          { id: 'notas', nome: 'Entrada de Notas' },
          { id: 'fornecedor', nome: 'Recebimento de Fornecedor' },
          { id: 'filiais', nome: 'Recebimento de Filiais' },
          { id: 'coleta', nome: 'Recebimento de Coleta' },
          { id: 'etiquetas', nome: 'Geração de Etiquetas' },
        ]
      },
      {
        id: 'movimentacoes',
        nome: 'Movimentações',
        rotinas: [
          { id: 'enderecamento', nome: 'Enderecamento' },
          { id: 'unitizacao', nome: 'Unitização de Paletes' },
          { id: 'movinternas', nome: 'Movimentações Internas' },
        ]
      },
      {
        id: 'carregamento',
        nome: 'Carregamento',
        rotinas: [
          { id: 'ordemcar', nome: 'Ordem de Carregamento' },
          { id: 'enderecamcaminhao', nome: 'Enderecamento de Caminhão' },
          { id: 'conferencia', nome: 'Conferência de Carga' },
          { id: 'checklist', nome: 'Checklist de Carga' },
        ]
      },
    ]
  },
  {
    id: 'coletas',
    nome: 'Coletas',
    tabelas: [
      {
        id: 'solicitacoes',
        nome: 'Solicitações de Coleta',
        rotinas: [
          { id: 'novasol', nome: 'Nova Solicitação' },
          { id: 'consulta', nome: 'Consultar Solicitações' },
        ]
      },
      {
        id: 'aprovacoes',
        nome: 'Aprovações de Coleta',
        rotinas: [
          { id: 'aprovar', nome: 'Aprovar Coletas' },
          { id: 'historico', nome: 'Histórico de Aprovações' },
        ]
      },
      {
        id: 'alocacao',
        nome: 'Alocação de Cargas',
        rotinas: [
          { id: 'alocar', nome: 'Alocar Cargas' },
          { id: 'consultar', nome: 'Consultar Alocações' },
        ]
      },
    ]
  },
  {
    id: 'empresas',
    nome: 'Empresas',
    tabelas: [
      {
        id: 'cadastro',
        nome: 'Cadastro de Empresas',
        rotinas: [
          { id: 'novo', nome: 'Nova Empresa' },
          { id: 'listagem', nome: 'Listagem de Empresas' },
          { id: 'permissoes', nome: 'Gerenciar Permissões' },
        ]
      }
    ]
  },
  {
    id: 'motoristas',
    nome: 'Motoristas',
    tabelas: [
      {
        id: 'cadastro',
        nome: 'Cadastro de Motoristas',
        rotinas: [
          { id: 'novo', nome: 'Novo Motorista' },
          { id: 'listar', nome: 'Listar Motoristas' },
        ]
      },
      {
        id: 'cargas',
        nome: 'Cargas de Motoristas',
        rotinas: [
          { id: 'ativas', nome: 'Cargas Ativas' },
          { id: 'historico', nome: 'Histórico de Cargas' },
        ]
      }
    ]
  },
];
