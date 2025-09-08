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
      carregamentos: {
        Row: {
          conferente_id: string | null
          created_at: string | null
          data_fim_carregamento: string | null
          data_inicio_carregamento: string | null
          id: string
          observacoes: string | null
          ordem_carregamento_id: string | null
          peso_total: number | null
          quantidade_volumes: number
          responsavel_carregamento_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          conferente_id?: string | null
          created_at?: string | null
          data_fim_carregamento?: string | null
          data_inicio_carregamento?: string | null
          id?: string
          observacoes?: string | null
          ordem_carregamento_id?: string | null
          peso_total?: number | null
          quantidade_volumes?: number
          responsavel_carregamento_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          conferente_id?: string | null
          created_at?: string | null
          data_fim_carregamento?: string | null
          data_inicio_carregamento?: string | null
          id?: string
          observacoes?: string | null
          ordem_carregamento_id?: string | null
          peso_total?: number | null
          quantidade_volumes?: number
          responsavel_carregamento_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carregamentos_conferente_id_fkey"
            columns: ["conferente_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carregamentos_ordem_carregamento_id_fkey"
            columns: ["ordem_carregamento_id"]
            isOneToOne: false
            referencedRelation: "ordens_carregamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "carregamentos_responsavel_carregamento_id_fkey"
            columns: ["responsavel_carregamento_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      coletas: {
        Row: {
          cidade_coleta: string
          created_at: string | null
          data_programada: string | null
          data_solicitacao: string
          empresa_cliente_id: string
          endereco_coleta: string
          estado_coleta: string
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          motorista_id: string | null
          numero_coleta: string
          observacoes: string | null
          status: string
          tipo_coleta: string
          updated_at: string | null
          usuario_solicitante_id: string | null
          veiculo_id: string | null
        }
        Insert: {
          cidade_coleta: string
          created_at?: string | null
          data_programada?: string | null
          data_solicitacao?: string
          empresa_cliente_id: string
          endereco_coleta: string
          estado_coleta: string
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          motorista_id?: string | null
          numero_coleta: string
          observacoes?: string | null
          status?: string
          tipo_coleta?: string
          updated_at?: string | null
          usuario_solicitante_id?: string | null
          veiculo_id?: string | null
        }
        Update: {
          cidade_coleta?: string
          created_at?: string | null
          data_programada?: string | null
          data_solicitacao?: string
          empresa_cliente_id?: string
          endereco_coleta?: string
          estado_coleta?: string
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          motorista_id?: string | null
          numero_coleta?: string
          observacoes?: string | null
          status?: string
          tipo_coleta?: string
          updated_at?: string | null
          usuario_solicitante_id?: string | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coletas_empresa_cliente_id_fkey"
            columns: ["empresa_cliente_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coletas_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coletas_usuario_solicitante_id_fkey"
            columns: ["usuario_solicitante_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coletas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios_ocorrencia: {
        Row: {
          comentario: string
          created_at: string | null
          data_comentario: string
          id: string
          ocorrencia_id: string
          usuario_id: string
        }
        Insert: {
          comentario: string
          created_at?: string | null
          data_comentario?: string
          id?: string
          ocorrencia_id: string
          usuario_id: string
        }
        Update: {
          comentario?: string
          created_at?: string | null
          data_comentario?: string
          id?: string
          ocorrencia_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_ocorrencia_ocorrencia_id_fkey"
            columns: ["ocorrencia_id"]
            isOneToOne: false
            referencedRelation: "ocorrencias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_ocorrencia_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cnpj: string | null
          complemento: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          inscricao_estadual: string | null
          logo_url: string | null
          logradouro: string | null
          nome_fantasia: string | null
          numero: string | null
          perfil: string | null
          razao_social: string
          status: string
          telefone: string | null
          tipo: string
          transportadora_principal: boolean | null
          uf: string | null
          updated_at: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          logo_url?: string | null
          logradouro?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          perfil?: string | null
          razao_social: string
          status?: string
          telefone?: string | null
          tipo: string
          transportadora_principal?: boolean | null
          uf?: string | null
          updated_at?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cnpj?: string | null
          complemento?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          inscricao_estadual?: string | null
          logo_url?: string | null
          logradouro?: string | null
          nome_fantasia?: string | null
          numero?: string | null
          perfil?: string | null
          razao_social?: string
          status?: string
          telefone?: string | null
          tipo?: string
          transportadora_principal?: boolean | null
          uf?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      enderecamento_caminhao: {
        Row: {
          carregamento_id: string
          created_at: string | null
          etiqueta_id: string
          id: string
          ordem: number | null
          posicao: string
          updated_at: string | null
        }
        Insert: {
          carregamento_id: string
          created_at?: string | null
          etiqueta_id: string
          id?: string
          ordem?: number | null
          posicao: string
          updated_at?: string | null
        }
        Update: {
          carregamento_id?: string
          created_at?: string | null
          etiqueta_id?: string
          id?: string
          ordem?: number | null
          posicao?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enderecamento_caminhao_carregamento_id_fkey"
            columns: ["carregamento_id"]
            isOneToOne: false
            referencedRelation: "carregamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      etiquetas: {
        Row: {
          altura: number | null
          area: string | null
          cep: string | null
          chave_nf: string | null
          cidade: string | null
          classificacao_quimica: string | null
          codigo: string
          codigo_onu: string | null
          codigo_risco: string | null
          comprimento: number | null
          created_at: string
          criado_por_usuario_id: string | null
          data_geracao: string
          data_impressao: string | null
          data_inutilizacao: string | null
          descricao: string | null
          destinatario: string | null
          endereco: string | null
          etiqueta_mae_id: string | null
          etiquetado: boolean | null
          fragil: boolean | null
          id: string
          id_empresa: string | null
          informacoes_adicionais: string | null
          largura: number | null
          motivo_inutilizacao: string | null
          nota_fiscal_id: string | null
          numero_pedido: string | null
          peso: number | null
          peso_total_bruto: string | null
          quantidade: number | null
          remetente: string | null
          status: string
          tipo: string
          tipo_etiqueta: string | null
          total_volumes: number | null
          transportadora: string | null
          uf: string | null
          updated_at: string
          usuario_inutilizacao_id: string | null
          volume_numero: number | null
        }
        Insert: {
          altura?: number | null
          area?: string | null
          cep?: string | null
          chave_nf?: string | null
          cidade?: string | null
          classificacao_quimica?: string | null
          codigo: string
          codigo_onu?: string | null
          codigo_risco?: string | null
          comprimento?: number | null
          created_at?: string
          criado_por_usuario_id?: string | null
          data_geracao?: string
          data_impressao?: string | null
          data_inutilizacao?: string | null
          descricao?: string | null
          destinatario?: string | null
          endereco?: string | null
          etiqueta_mae_id?: string | null
          etiquetado?: boolean | null
          fragil?: boolean | null
          id?: string
          id_empresa?: string | null
          informacoes_adicionais?: string | null
          largura?: number | null
          motivo_inutilizacao?: string | null
          nota_fiscal_id?: string | null
          numero_pedido?: string | null
          peso?: number | null
          peso_total_bruto?: string | null
          quantidade?: number | null
          remetente?: string | null
          status?: string
          tipo?: string
          tipo_etiqueta?: string | null
          total_volumes?: number | null
          transportadora?: string | null
          uf?: string | null
          updated_at?: string
          usuario_inutilizacao_id?: string | null
          volume_numero?: number | null
        }
        Update: {
          altura?: number | null
          area?: string | null
          cep?: string | null
          chave_nf?: string | null
          cidade?: string | null
          classificacao_quimica?: string | null
          codigo?: string
          codigo_onu?: string | null
          codigo_risco?: string | null
          comprimento?: number | null
          created_at?: string
          criado_por_usuario_id?: string | null
          data_geracao?: string
          data_impressao?: string | null
          data_inutilizacao?: string | null
          descricao?: string | null
          destinatario?: string | null
          endereco?: string | null
          etiqueta_mae_id?: string | null
          etiquetado?: boolean | null
          fragil?: boolean | null
          id?: string
          id_empresa?: string | null
          informacoes_adicionais?: string | null
          largura?: number | null
          motivo_inutilizacao?: string | null
          nota_fiscal_id?: string | null
          numero_pedido?: string | null
          peso?: number | null
          peso_total_bruto?: string | null
          quantidade?: number | null
          remetente?: string | null
          status?: string
          tipo?: string
          tipo_etiqueta?: string | null
          total_volumes?: number | null
          transportadora?: string | null
          uf?: string | null
          updated_at?: string
          usuario_inutilizacao_id?: string | null
          volume_numero?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "etiquetas_criado_por_usuario_id_fkey"
            columns: ["criado_por_usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etiquetas_id_empresa_fkey"
            columns: ["id_empresa"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      etiquetas_unitizacao: {
        Row: {
          data_inclusao: string
          etiqueta_id: string
          unitizacao_id: string
        }
        Insert: {
          data_inclusao?: string
          etiqueta_id: string
          unitizacao_id: string
        }
        Update: {
          data_inclusao?: string
          etiqueta_id?: string
          unitizacao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "etiquetas_unitizacao_unitizacao_id_fkey"
            columns: ["unitizacao_id"]
            isOneToOne: false
            referencedRelation: "unitizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_carregamento: {
        Row: {
          created_at: string | null
          nota_fiscal_id: string
          ordem_carregamento_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          nota_fiscal_id: string
          ordem_carregamento_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          nota_fiscal_id?: string
          ordem_carregamento_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_carregamento_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_carregamento_ordem_carregamento_id_fkey"
            columns: ["ordem_carregamento_id"]
            isOneToOne: false
            referencedRelation: "ordens_carregamento"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_nota_fiscal: {
        Row: {
          codigo_produto: string
          created_at: string | null
          descricao: string
          id: string
          nota_fiscal_id: string
          quantidade: number
          sequencia: number
          updated_at: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          codigo_produto: string
          created_at?: string | null
          descricao: string
          id?: string
          nota_fiscal_id: string
          quantidade?: number
          sequencia: number
          updated_at?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          codigo_produto?: string
          created_at?: string | null
          descricao?: string
          id?: string
          nota_fiscal_id?: string
          quantidade?: number
          sequencia?: number
          updated_at?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_nota_fiscal_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
        ]
      }
      localizacoes: {
        Row: {
          area: string | null
          capacidade_peso: number | null
          capacidade_volume: number | null
          codigo: string
          corredor: string | null
          created_at: string | null
          descricao: string | null
          estante: string | null
          filial_id: string | null
          id: string
          nivel: string | null
          ocupado: boolean | null
          posicao: string | null
          status: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          capacidade_peso?: number | null
          capacidade_volume?: number | null
          codigo: string
          corredor?: string | null
          created_at?: string | null
          descricao?: string | null
          estante?: string | null
          filial_id?: string | null
          id?: string
          nivel?: string | null
          ocupado?: boolean | null
          posicao?: string | null
          status?: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          capacidade_peso?: number | null
          capacidade_volume?: number | null
          codigo?: string
          corredor?: string | null
          created_at?: string | null
          descricao?: string | null
          estante?: string | null
          filial_id?: string | null
          id?: string
          nivel?: string | null
          ocupado?: boolean | null
          posicao?: string | null
          status?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "localizacoes_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      motoristas: {
        Row: {
          categoria_cnh: string | null
          cnh: string | null
          cpf: string | null
          created_at: string | null
          empresa_id: string | null
          id: string
          nome: string
          status: string
          telefone: string | null
          updated_at: string | null
          validade_cnh: string | null
        }
        Insert: {
          categoria_cnh?: string | null
          cnh?: string | null
          cpf?: string | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
          status?: string
          telefone?: string | null
          updated_at?: string | null
          validade_cnh?: string | null
        }
        Update: {
          categoria_cnh?: string | null
          cnh?: string | null
          cpf?: string | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
          status?: string
          telefone?: string | null
          updated_at?: string | null
          validade_cnh?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "motoristas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      movimentacoes: {
        Row: {
          created_at: string | null
          data_movimentacao: string
          etiqueta_id: string
          id: string
          localizacao_destino_id: string | null
          localizacao_origem_id: string | null
          observacoes: string | null
          tipo_movimentacao: string
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_movimentacao?: string
          etiqueta_id: string
          id?: string
          localizacao_destino_id?: string | null
          localizacao_origem_id?: string | null
          observacoes?: string | null
          tipo_movimentacao: string
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_movimentacao?: string
          etiqueta_id?: string
          id?: string
          localizacao_destino_id?: string | null
          localizacao_origem_id?: string | null
          observacoes?: string | null
          tipo_movimentacao?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_localizacao_destino_id_fkey"
            columns: ["localizacao_destino_id"]
            isOneToOne: false
            referencedRelation: "localizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_localizacao_origem_id_fkey"
            columns: ["localizacao_origem_id"]
            isOneToOne: false
            referencedRelation: "localizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          arquivo_cte_coleta: string | null
          arquivo_cte_viagem: string | null
          arquivos_diversos: string | null
          chave_acesso: string | null
          coleta_id: string | null
          created_at: string | null
          data_embarque: string | null
          data_emissao: string
          data_entrada: string | null
          data_hora_emissao: string | null
          data_hora_entrada: string | null
          data_inclusao: string | null
          data_saida: string | null
          destinatario_bairro: string | null
          destinatario_cep: string | null
          destinatario_cidade: string | null
          destinatario_cnpj: string | null
          destinatario_endereco: string | null
          destinatario_id: string | null
          destinatario_numero: string | null
          destinatario_razao_social: string | null
          destinatario_telefone: string | null
          destinatario_uf: string | null
          emitente_bairro: string | null
          emitente_cep: string | null
          emitente_cidade: string | null
          emitente_cnpj: string | null
          emitente_endereco: string | null
          emitente_numero: string | null
          emitente_razao_social: string | null
          emitente_telefone: string | null
          emitente_uf: string | null
          entregue_ao_fornecedor: string | null
          fob_cif: string | null
          fracionado: boolean | null
          id: string
          informacoes_complementares: string | null
          lista_romaneio: string | null
          motorista: string | null
          numero: string
          numero_coleta: string | null
          numero_cte_coleta: string | null
          numero_cte_viagem: string | null
          numero_pedido: string | null
          observacoes: string | null
          ordem_carregamento_id: string | null
          peso_bruto: number | null
          quantidade_volumes: number | null
          quimico: boolean | null
          remetente_id: string | null
          responsavel_entrega: string | null
          serie: string | null
          status: string
          status_embarque: string | null
          tempo_armazenamento_horas: number | null
          tipo: string | null
          tipo_operacao: string | null
          transportadora_id: string | null
          updated_at: string | null
          valor_coleta: number | null
          valor_total: number
        }
        Insert: {
          arquivo_cte_coleta?: string | null
          arquivo_cte_viagem?: string | null
          arquivos_diversos?: string | null
          chave_acesso?: string | null
          coleta_id?: string | null
          created_at?: string | null
          data_embarque?: string | null
          data_emissao?: string
          data_entrada?: string | null
          data_hora_emissao?: string | null
          data_hora_entrada?: string | null
          data_inclusao?: string | null
          data_saida?: string | null
          destinatario_bairro?: string | null
          destinatario_cep?: string | null
          destinatario_cidade?: string | null
          destinatario_cnpj?: string | null
          destinatario_endereco?: string | null
          destinatario_id?: string | null
          destinatario_numero?: string | null
          destinatario_razao_social?: string | null
          destinatario_telefone?: string | null
          destinatario_uf?: string | null
          emitente_bairro?: string | null
          emitente_cep?: string | null
          emitente_cidade?: string | null
          emitente_cnpj?: string | null
          emitente_endereco?: string | null
          emitente_numero?: string | null
          emitente_razao_social?: string | null
          emitente_telefone?: string | null
          emitente_uf?: string | null
          entregue_ao_fornecedor?: string | null
          fob_cif?: string | null
          fracionado?: boolean | null
          id?: string
          informacoes_complementares?: string | null
          lista_romaneio?: string | null
          motorista?: string | null
          numero?: string
          numero_coleta?: string | null
          numero_cte_coleta?: string | null
          numero_cte_viagem?: string | null
          numero_pedido?: string | null
          observacoes?: string | null
          ordem_carregamento_id?: string | null
          peso_bruto?: number | null
          quantidade_volumes?: number | null
          quimico?: boolean | null
          remetente_id?: string | null
          responsavel_entrega?: string | null
          serie?: string | null
          status?: string
          status_embarque?: string | null
          tempo_armazenamento_horas?: number | null
          tipo?: string | null
          tipo_operacao?: string | null
          transportadora_id?: string | null
          updated_at?: string | null
          valor_coleta?: number | null
          valor_total?: number
        }
        Update: {
          arquivo_cte_coleta?: string | null
          arquivo_cte_viagem?: string | null
          arquivos_diversos?: string | null
          chave_acesso?: string | null
          coleta_id?: string | null
          created_at?: string | null
          data_embarque?: string | null
          data_emissao?: string
          data_entrada?: string | null
          data_hora_emissao?: string | null
          data_hora_entrada?: string | null
          data_inclusao?: string | null
          data_saida?: string | null
          destinatario_bairro?: string | null
          destinatario_cep?: string | null
          destinatario_cidade?: string | null
          destinatario_cnpj?: string | null
          destinatario_endereco?: string | null
          destinatario_id?: string | null
          destinatario_numero?: string | null
          destinatario_razao_social?: string | null
          destinatario_telefone?: string | null
          destinatario_uf?: string | null
          emitente_bairro?: string | null
          emitente_cep?: string | null
          emitente_cidade?: string | null
          emitente_cnpj?: string | null
          emitente_endereco?: string | null
          emitente_numero?: string | null
          emitente_razao_social?: string | null
          emitente_telefone?: string | null
          emitente_uf?: string | null
          entregue_ao_fornecedor?: string | null
          fob_cif?: string | null
          fracionado?: boolean | null
          id?: string
          informacoes_complementares?: string | null
          lista_romaneio?: string | null
          motorista?: string | null
          numero?: string
          numero_coleta?: string | null
          numero_cte_coleta?: string | null
          numero_cte_viagem?: string | null
          numero_pedido?: string | null
          observacoes?: string | null
          ordem_carregamento_id?: string | null
          peso_bruto?: number | null
          quantidade_volumes?: number | null
          quimico?: boolean | null
          remetente_id?: string | null
          responsavel_entrega?: string | null
          serie?: string | null
          status?: string
          status_embarque?: string | null
          tempo_armazenamento_horas?: number | null
          tipo?: string | null
          tipo_operacao?: string | null
          transportadora_id?: string | null
          updated_at?: string | null
          valor_coleta?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_notas_fiscais_ordem_carregamento"
            columns: ["ordem_carregamento_id"]
            isOneToOne: false
            referencedRelation: "ordens_carregamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_coleta_id_fkey"
            columns: ["coleta_id"]
            isOneToOne: false
            referencedRelation: "coletas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_destinatario_id_fkey"
            columns: ["destinatario_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_remetente_id_fkey"
            columns: ["remetente_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_fiscais_transportadora_id_fkey"
            columns: ["transportadora_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      ocorrencias: {
        Row: {
          coleta_id: string | null
          created_at: string | null
          data_ocorrencia: string
          descricao: string
          id: string
          nota_fiscal_id: string | null
          ordem_carregamento_id: string | null
          prioridade: string
          status: string
          tipo: string
          updated_at: string | null
          usuario_reportou_id: string
          usuario_responsavel_id: string | null
        }
        Insert: {
          coleta_id?: string | null
          created_at?: string | null
          data_ocorrencia?: string
          descricao: string
          id?: string
          nota_fiscal_id?: string | null
          ordem_carregamento_id?: string | null
          prioridade?: string
          status?: string
          tipo: string
          updated_at?: string | null
          usuario_reportou_id: string
          usuario_responsavel_id?: string | null
        }
        Update: {
          coleta_id?: string | null
          created_at?: string | null
          data_ocorrencia?: string
          descricao?: string
          id?: string
          nota_fiscal_id?: string | null
          ordem_carregamento_id?: string | null
          prioridade?: string
          status?: string
          tipo?: string
          updated_at?: string | null
          usuario_reportou_id?: string
          usuario_responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ocorrencias_coleta_id_fkey"
            columns: ["coleta_id"]
            isOneToOne: false
            referencedRelation: "coletas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_nota_fiscal_id_fkey"
            columns: ["nota_fiscal_id"]
            isOneToOne: false
            referencedRelation: "notas_fiscais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_ordem_carregamento_id_fkey"
            columns: ["ordem_carregamento_id"]
            isOneToOne: false
            referencedRelation: "ordens_carregamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_usuario_reportou_id_fkey"
            columns: ["usuario_reportou_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ocorrencias_usuario_responsavel_id_fkey"
            columns: ["usuario_responsavel_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      ordens_carregamento: {
        Row: {
          created_at: string | null
          data_criacao: string
          data_finalizacao: string | null
          data_inicio: string | null
          data_programada: string | null
          empresa_cliente_id: string | null
          filial_id: string | null
          id: string
          motorista_id: string | null
          numero_ordem: string
          observacoes: string | null
          status: string
          tipo_carregamento: string
          updated_at: string | null
          veiculo_id: string | null
        }
        Insert: {
          created_at?: string | null
          data_criacao?: string
          data_finalizacao?: string | null
          data_inicio?: string | null
          data_programada?: string | null
          empresa_cliente_id?: string | null
          filial_id?: string | null
          id?: string
          motorista_id?: string | null
          numero_ordem: string
          observacoes?: string | null
          status?: string
          tipo_carregamento?: string
          updated_at?: string | null
          veiculo_id?: string | null
        }
        Update: {
          created_at?: string | null
          data_criacao?: string
          data_finalizacao?: string | null
          data_inicio?: string | null
          data_programada?: string | null
          empresa_cliente_id?: string | null
          filial_id?: string | null
          id?: string
          motorista_id?: string | null
          numero_ordem?: string
          observacoes?: string | null
          status?: string
          tipo_carregamento?: string
          updated_at?: string | null
          veiculo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_carregamento_empresa_cliente_id_fkey"
            columns: ["empresa_cliente_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_carregamento_filial_id_fkey"
            columns: ["filial_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_carregamento_motorista_id_fkey"
            columns: ["motorista_id"]
            isOneToOne: false
            referencedRelation: "motoristas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_carregamento_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          empresa_id: string | null
          funcao: string
          id: string
          nome: string
          ultimo_login: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          empresa_id?: string | null
          funcao?: string
          id: string
          nome: string
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          empresa_id?: string | null
          funcao?: string
          id?: string
          nome?: string
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      unitizacoes: {
        Row: {
          codigo: string
          created_at: string | null
          data_unitizacao: string
          id: string
          localizacao_id: string | null
          observacoes: string | null
          status: string
          tipo_unitizacao: string
          updated_at: string | null
          usuario_id: string | null
        }
        Insert: {
          codigo: string
          created_at?: string | null
          data_unitizacao?: string
          id?: string
          localizacao_id?: string | null
          observacoes?: string | null
          status?: string
          tipo_unitizacao?: string
          updated_at?: string | null
          usuario_id?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string | null
          data_unitizacao?: string
          id?: string
          localizacao_id?: string | null
          observacoes?: string | null
          status?: string
          tipo_unitizacao?: string
          updated_at?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unitizacoes_localizacao_id_fkey"
            columns: ["localizacao_id"]
            isOneToOne: false
            referencedRelation: "localizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unitizacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "perfis"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos: {
        Row: {
          ano: number | null
          capacidade_peso: number | null
          capacidade_volume: number | null
          created_at: string | null
          empresa_id: string | null
          id: string
          marca: string | null
          modelo: string | null
          placa: string
          renavam: string | null
          status: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ano?: number | null
          capacidade_peso?: number | null
          capacidade_volume?: number | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          placa: string
          renavam?: string | null
          status?: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ano?: number | null
          capacidade_peso?: number | null
          capacidade_volume?: number | null
          created_at?: string | null
          empresa_id?: string | null
          id?: string
          marca?: string | null
          modelo?: string | null
          placa?: string
          renavam?: string | null
          status?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      volumes_coleta: {
        Row: {
          altura: number | null
          coleta_id: string
          comprimento: number | null
          created_at: string | null
          id: string
          largura: number | null
          nota_fiscal_numero: string | null
          peso: number | null
          quantidade: number
          tipo_volume: string
          updated_at: string | null
        }
        Insert: {
          altura?: number | null
          coleta_id: string
          comprimento?: number | null
          created_at?: string | null
          id?: string
          largura?: number | null
          nota_fiscal_numero?: string | null
          peso?: number | null
          quantidade?: number
          tipo_volume?: string
          updated_at?: string | null
        }
        Update: {
          altura?: number | null
          coleta_id?: string
          comprimento?: number | null
          created_at?: string | null
          id?: string
          largura?: number | null
          nota_fiscal_numero?: string | null
          peso?: number | null
          quantidade?: number
          tipo_volume?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volumes_coleta_coleta_id_fkey"
            columns: ["coleta_id"]
            isOneToOne: false
            referencedRelation: "coletas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      obter_funcao_usuario: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
