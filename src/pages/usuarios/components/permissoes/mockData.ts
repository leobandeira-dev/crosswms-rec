
// Mock data for user profiles
export const userProfiles = [
  'Administrador',
  'Gerente',
  'Supervisor',
  'Operador',
  'Cliente',
  'Fornecedor'
];

// Mock permissions for testing
export const mockPermissions = {
  'Cadastros': {
    'Usuarios': {
      'view': true,
      'edit': true,
      'delete': true
    },
    'Empresas': {
      'view': true,
      'edit': true,
      'delete': false
    },
    'Motoristas': {
      'view': true,
      'edit': false,
      'delete': false
    }
  },
  'Operações': {
    'Coletas': {
      'view': true,
      'edit': true,
      'delete': true
    },
    'Carregamento': {
      'view': true,
      'edit': true,
      'delete': false
    }
  }
};
