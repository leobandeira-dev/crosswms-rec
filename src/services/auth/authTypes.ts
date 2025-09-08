
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
  cnpj: string;
  funcao?: string;
};

export type AuthSession = {
  user: any;
  session: any;
};
