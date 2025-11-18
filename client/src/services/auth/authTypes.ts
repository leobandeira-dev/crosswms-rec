
import { Usuario } from "@/types/supabase.types";

export type SignInCredentials = {
  email: string;
  password: string;
};

export type SignUpCredentials = {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
  cnpj?: string;
  funcao?: string;
  tipo_usuario?: 'transportador' | 'cliente' | 'fornecedor' | 'super_admin';
  razao_social?: string;
  operador_logistico_cnpj?: string;
};

export type AuthSession = {
  user: any;
  session: any;
};
