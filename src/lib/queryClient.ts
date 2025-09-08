
import { QueryClient } from '@tanstack/react-query';

// Criando o cliente do React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
      queryFn: async ({ queryKey }) => {
        const [url] = queryKey as [string];
        return apiRequest(url);
      },
    },
  },
});

// Enhanced API request helper with automatic token management
export async function apiRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('[API] Token não encontrado, redirecionando para login');
    window.location.href = '/login';
    return;
  }
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  // Handle token expiration
  if (response.status === 401) {
    localStorage.removeItem('token');
    console.log('[API] Token expirado, redirecionando para login');
    window.location.href = '/login';
    return;
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Optimized fetch with authentication for NSDocs API
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    throw new Error('Token de autenticação não encontrado');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  return response;
}
