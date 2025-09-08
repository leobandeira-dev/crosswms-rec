
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ordens_carregamento: {
        Row: {
          id: string
          numero_ordem: string
          tipo_carregamento: string
          data_criacao: string
          data_programada: string | null
          data_inicio: string | null
          data_finalizacao: string | null
          status: string
          empresa_cliente_id: string | null
          filial_id: string | null
          motorista_id: string | null
          veiculo_id: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_ordem: string
          tipo_carregamento: string
          data_criacao?: string
          data_programada?: string | null
          data_inicio?: string | null
          data_finalizacao?: string | null
          status?: string
          empresa_cliente_id?: string | null
          filial_id?: string | null
          motorista_id?: string | null
          veiculo_id?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero_ordem?: string
          tipo_carregamento?: string
          data_criacao?: string
          data_programada?: string | null
          data_inicio?: string | null
          data_finalizacao?: string | null
          status?: string
          empresa_cliente_id?: string | null
          filial_id?: string | null
          motorista_id?: string | null
          veiculo_id?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notas_fiscais: {
        Row: {
          id: string
          numero: string
          serie: string | null
          chave_acesso: string | null
          data_emissao: string
          valor_total: number
          quantidade_volumes: number | null
          peso_bruto: number | null
          status: string
          remetente_id: string | null
          destinatario_id: string | null
          ordem_carregamento_id: string | null
          data_saida: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero: string
          serie?: string | null
          chave_acesso?: string | null
          data_emissao: string
          valor_total?: number
          quantidade_volumes?: number | null
          peso_bruto?: number | null
          status?: string
          remetente_id?: string | null
          destinatario_id?: string | null
          ordem_carregamento_id?: string | null
          data_saida?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero?: string
          serie?: string | null
          chave_acesso?: string | null
          data_emissao?: string
          valor_total?: number
          quantidade_volumes?: number | null
          peso_bruto?: number | null
          status?: string
          remetente_id?: string | null
          destinatario_id?: string | null
          ordem_carregamento_id?: string | null
          data_saida?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      itens_carregamento: {
        Row: {
          ordem_carregamento_id: string
          nota_fiscal_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          ordem_carregamento_id: string
          nota_fiscal_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          ordem_carregamento_id?: string
          nota_fiscal_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      etiquetas: {
        Row: {
          id: string
          codigo: string
          nota_fiscal_id: string | null
          status: string
          tipo: string
          volume_numero: number | null
          total_volumes: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo: string
          nota_fiscal_id?: string | null
          status?: string
          tipo: string
          volume_numero?: number | null
          total_volumes?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          nota_fiscal_id?: string | null
          status?: string
          tipo?: string
          volume_numero?: number | null
          total_volumes?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      carregamentos: {
        Row: {
          id: string
          ordem_carregamento_id: string | null
          data_inicio_carregamento: string | null
          data_fim_carregamento: string | null
          responsavel_carregamento_id: string | null
          conferente_id: string | null
          quantidade_volumes: number
          peso_total: number | null
          status: string
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ordem_carregamento_id?: string | null
          data_inicio_carregamento?: string | null
          data_fim_carregamento?: string | null
          responsavel_carregamento_id?: string | null
          conferente_id?: string | null
          quantidade_volumes?: number
          peso_total?: number | null
          status?: string
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ordem_carregamento_id?: string | null
          data_inicio_carregamento?: string | null
          data_fim_carregamento?: string | null
          responsavel_carregamento_id?: string | null
          conferente_id?: string | null
          quantidade_volumes?: number
          peso_total?: number | null
          status?: string
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      enderecamento_caminhao: {
        Row: {
          id: string
          carregamento_id: string
          etiqueta_id: string
          posicao: string
          ordem: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          carregamento_id: string
          etiqueta_id: string
          posicao: string
          ordem?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          carregamento_id?: string
          etiqueta_id?: string
          posicao?: string
          ordem?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      empresas: {
        Row: {
          id: string
          razao_social: string
          nome_fantasia: string | null
          cnpj: string | null
          tipo: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          razao_social: string
          nome_fantasia?: string | null
          cnpj?: string | null
          tipo: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          razao_social?: string
          nome_fantasia?: string | null
          cnpj?: string | null
          tipo?: string
          created_at?: string
          updated_at?: string
        }
      }
      veiculos: {
        Row: {
          id: string
          placa: string
          tipo: string
          modelo: string | null
          marca: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          placa: string
          tipo: string
          modelo?: string | null
          marca?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          placa?: string
          tipo?: string
          modelo?: string | null
          marca?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      motoristas: {
        Row: {
          id: string
          nome: string
          cpf: string | null
          cnh: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          cpf?: string | null
          cnh?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          cpf?: string | null
          cnh?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
