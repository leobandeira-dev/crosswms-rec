interface AuthResponse {
  user: {
    id: string;
    email: string;
    nome: string;
    telefone?: string;
    avatar_url?: string;
    empresa_id?: string;
    perfil_id?: string;
    status?: string;
    funcao?: string;
    created_at: string;
    updated_at: string;
    empresa?: {
      id: string;
      nome: string;
      cnpj: string;
      telefone?: string;
      email?: string;
      tipo_empresa?: string;
    };
  };
  session: {
    access_token: string;
  };
}

interface AuthError {
  error: string;
  details?: any;
}

class AuthService {
  private baseUrl = '/api';
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    return data;
  }

  async signUp(email: string, password: string, nome: string, telefone?: string, cnpj?: string): Promise<AuthResponse> {
    // Sistema simplificado - retorna dados mock sem chamada de API
    const mockUser = {
      id: 'demo-user-123',
      email: email || 'demo@exemplo.com',
      nome: nome || email.split('@')[0] || 'Usuário Demo',
      telefone: telefone || '(11) 99999-9999',
      avatar_url: undefined,
      empresa_id: 'demo-empresa-123',
      perfil_id: 'admin',
      status: 'ativo',
      funcao: 'Administrador',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      empresa: {
        id: 'demo-empresa-123',
        nome: 'Empresa Demo',
        cnpj: cnpj || '12.345.678/0001-90',
        telefone: telefone || '(11) 3333-4444',
        email: email || 'contato@empresademo.com',
        tipo_empresa: 'logistica'
      }
    };

    this.token = 'demo-token';
    localStorage.setItem('token', this.token);

    return { 
      user: mockUser, 
      session: { access_token: this.token } 
    };
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    // Sistema simplificado - retorna dados mock sem chamada de API
    const mockUser = {
      id: 'demo-user-123',
      email: email || 'demo@exemplo.com',
      nome: email.split('@')[0] || 'Usuário Demo',
      telefone: '(11) 99999-9999',
      avatar_url: undefined,
      empresa_id: 'demo-empresa-123',
      perfil_id: 'admin',
      status: 'ativo',
      funcao: 'Administrador',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      empresa: {
        id: 'demo-empresa-123',
        nome: 'Empresa Demo',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 3333-4444',
        email: 'contato@empresademo.com',
        tipo_empresa: 'logistica'
      }
    };

    this.token = 'demo-token';
    localStorage.setItem('token', this.token);

    return { 
      user: mockUser, 
      session: { access_token: this.token } 
    };
  }

  async signOut(): Promise<void> {
    // Sistema simplificado - apenas limpa o localStorage
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async getCurrentUser(): Promise<{ user: AuthResponse['user'] } | null> {
    // Sistema simplificado - retorna dados do localStorage ou dados mock
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('getCurrentUser: User data from localStorage:', userData);
        return { user: userData };
      } catch (error) {
        console.error('getCurrentUser: Error parsing user data:', error);
        return null;
      }
    }

    // Se não há dados no localStorage, retorna dados mock
    const mockUser = {
      id: 'demo-user-123',
      email: 'demo@exemplo.com',
      nome: 'Usuário Demo',
      telefone: '(11) 99999-9999',
      avatar_url: undefined,
      empresa_id: 'demo-empresa-123',
      perfil_id: 'admin',
      status: 'ativo',
      funcao: 'Administrador',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      empresa: {
        id: 'demo-empresa-123',
        nome: 'Empresa Demo',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 3333-4444',
        email: 'contato@empresademo.com',
        tipo_empresa: 'logistica'
      }
    };

    console.log('getCurrentUser: Returning mock user data:', mockUser);
    return { user: mockUser };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    // Sistema simplificado - apenas simula o envio
    console.log('Solicitação de redefinição de senha para:', email);
    return { message: 'Email de redefinição enviado com sucesso' };
  }

  async updatePassword(password: string): Promise<{ message: string }> {
    // Sistema simplificado - apenas simula a atualização
    console.log('Atualização de senha solicitada');
    return { message: 'Senha atualizada com sucesso' };
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authService = new AuthService();
export default authService;