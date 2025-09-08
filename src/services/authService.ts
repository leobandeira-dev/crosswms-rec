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
    const response = await this.request('/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        confirmPassword: password,
        nome,
        telefone,
      }),
    });

    this.token = response.session.access_token;
    if (this.token) {
      localStorage.setItem('token', this.token);
    }

    return response;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.token = response.token;
    if (this.token) {
      localStorage.setItem('token', this.token);
    }

    return { 
      user: response.user, 
      session: { access_token: response.token } 
    };
  }

  async signOut(): Promise<void> {
    if (this.token) {
      try {
        await this.request('/logout', { method: 'POST' });
      } catch (error) {
        console.error('Error during signout:', error);
      }
    }

    this.token = null;
    localStorage.removeItem('token');
  }

  async getCurrentUser(): Promise<{ user: AuthResponse['user'] } | null> {
    if (!this.token) {
      console.log('getCurrentUser: No token available');
      return null;
    }

    try {
      console.log('getCurrentUser: Making request to /api/me with token:', this.token);
      
      // Use /api/me endpoint to get user with company data
      const response = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('getCurrentUser: Response status:', response.status);

      if (!response.ok) {
        console.error('getCurrentUser: Response not ok:', response.status, response.statusText);
        throw new Error('Failed to get user data');
      }

      const userData = await response.json();
      console.log('getCurrentUser: Raw response data:', userData);
      
      // Ensure we have the complete user structure with empresa data
      const userWithCompany = {
        ...userData,
        empresa: userData.empresa || null
      };
      
      console.log('getCurrentUser: Processed user data:', userWithCompany);
      return { user: userWithCompany };
    } catch (error) {
      console.error('getCurrentUser: Error occurred:', error);
      // Token might be invalid, clear it
      this.token = null;
      localStorage.removeItem('token');
      return null;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.request('/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async updatePassword(password: string): Promise<{ message: string }> {
    return this.request('/reset-password', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
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