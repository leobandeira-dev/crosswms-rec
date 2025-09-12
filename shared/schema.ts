import { z } from "zod";
import { pgTable, serial, varchar, text, timestamp, boolean, integer, decimal, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Schema base para timestamps
const timestampSchema = z.object({
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Database tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  nome: varchar("nome").notNull(),
  empresa_id: varchar("empresa_id"),
  perfil_id: varchar("perfil_id"),
  status: varchar("status").default("ativo"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: varchar("token").unique().notNull(),
  user_id: varchar("user_id").notNull(),
  expires_at: timestamp("expires_at").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const empresas = pgTable("empresas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cnpj: varchar("cnpj").unique().notNull(),
  razao_social: varchar("razao_social").notNull(),
  nome_fantasia: varchar("nome_fantasia"),
  endereco: text("endereco"),
  telefone: varchar("telefone"),
  email: varchar("email"),
  tipo: varchar("tipo"),
  status: varchar("status").default("ativo"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const perfis = pgTable("perfis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: varchar("nome").notNull(),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const permissoes = pgTable("permissoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: varchar("nome").notNull(),
  descricao: text("descricao"),
  modulo: varchar("modulo"),
  acao: varchar("acao"),
  created_at: timestamp("created_at").defaultNow(),
});

export const perfilPermissoes = pgTable("perfil_permissoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  perfil_id: varchar("perfil_id").notNull(),
  permissao_id: varchar("permissao_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const perfilModulos = pgTable("perfil_modulos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  perfil_id: varchar("perfil_id").notNull(),
  modulo: varchar("modulo").notNull(),
  ativo: boolean("ativo").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const assinaturas = pgTable("assinaturas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  empresa_id: varchar("empresa_id").notNull(),
  plano: varchar("plano").notNull(),
  status: varchar("status").default("ativa"),
  data_inicio: timestamp("data_inicio").defaultNow(),
  data_fim: timestamp("data_fim"),
  valor: decimal("valor"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  token: varchar("token").unique().notNull(),
  expires_at: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

export const configuracoes_email = pgTable("configuracoes_email", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  empresa_id: varchar("empresa_id").notNull(),
  smtp_host: varchar("smtp_host"),
  smtp_port: integer("smtp_port"),
  smtp_user: varchar("smtp_user"),
  smtp_password: varchar("smtp_password"),
  from_email: varchar("from_email"),
  from_name: varchar("from_name"),
  ativo: boolean("ativo").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const configuracoes_sistema = pgTable("configuracoes_sistema", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  empresa_id: varchar("empresa_id").notNull(),
  
  // API Logística da Informação
  logistica_cnpj: varchar("logistica_cnpj"),
  logistica_token: varchar("logistica_token"),
  logistica_enabled: boolean("logistica_enabled").default(false),
  
  // API CrossXML
  crossxml_api_key: varchar("crossxml_api_key"),
  crossxml_enabled: boolean("crossxml_enabled").default(false),
  
  // API NSDocs
  nsdocs_client_id: varchar("nsdocs_client_id"),
  nsdocs_client_secret: varchar("nsdocs_client_secret"),
  nsdocs_enabled: boolean("nsdocs_enabled").default(false),
  
  // Configurações Gerais
  sistema_versao: varchar("sistema_versao").default("CrossWMS v2.0"),
  sistema_ambiente: varchar("sistema_ambiente").default("production"),
  backup_automatico: boolean("backup_automatico").default(true),
  backup_horario: varchar("backup_horario").default("02:00"),
  sessao_timeout: varchar("sessao_timeout").default("60"),
  max_tentativas_login: varchar("max_tentativas_login").default("5"),
  senha_complexidade: boolean("senha_complexidade").default(true),
  
  // Notificações
  notif_email_novos_usuarios: boolean("notif_email_novos_usuarios").default(true),
  notif_email_aprovacoes: boolean("notif_email_aprovacoes").default(true),
  notif_email_operacoes: boolean("notif_email_operacoes").default(false),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const motoristas = pgTable("motoristas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: varchar("nome").notNull(),
  cpf: varchar("cpf").unique(),
  cnh: varchar("cnh"),
  telefone: varchar("telefone"),
  empresa_id: varchar("empresa_id"),
  status: varchar("status").default("ativo"),
  disponivel: boolean("disponivel").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const veiculos = pgTable("veiculos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  placa: varchar("placa").unique().notNull(),
  modelo: varchar("modelo"),
  marca: varchar("marca"),
  ano: integer("ano"),
  capacidade_peso: decimal("capacidade_peso"),
  capacidade_volume: decimal("capacidade_volume"),
  empresa_id: varchar("empresa_id"),
  status: varchar("status").default("ativo"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const clientesTransportador = pgTable("clientes_transportador", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  razao_social: varchar("razao_social").notNull(),
  nome_fantasia: varchar("nome_fantasia"),
  cnpj: varchar("cnpj").unique(),
  endereco: text("endereco"),
  telefone: varchar("telefone"),
  email: varchar("email"),
  contrato_inicio: timestamp("contrato_inicio"),
  contrato_fim: timestamp("contrato_fim"),
  status: varchar("status").default("ativo"),
  empresa_transportadora_id: varchar("empresa_transportadora_id"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const coletas = pgTable("coletas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  numero_coleta: varchar("numero_coleta").notNull(),
  empresa_cliente_id: varchar("empresa_cliente_id").notNull(),
  endereco_coleta: text("endereco_coleta").notNull(),
  data_solicitacao: timestamp("data_solicitacao").defaultNow(),
  data_prevista: timestamp("data_prevista"),
  status: varchar("status").default("solicitada"),
  observacoes: text("observacoes"),
  usuario_solicitante_id: varchar("usuario_solicitante_id").notNull(),
  zona: varchar("zona"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const ordens_carga = pgTable("ordens_carga", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  numero_ordem: varchar("numero_ordem").notNull(),
  tipo_carregamento: varchar("tipo_carregamento").notNull(),
  empresa_cliente_id: varchar("empresa_cliente_id").notNull(),
  motorista_id: varchar("motorista_id"),
  veiculo_id: varchar("veiculo_id"),
  data_prevista: timestamp("data_prevista").notNull(),
  status: varchar("status").default("planejada"),
  observacoes: text("observacoes"),
  usuario_responsavel_id: varchar("usuario_responsavel_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const itens_carga = pgTable("itens_carga", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ordem_carga_id: varchar("ordem_carga_id").notNull(),
  nota_fiscal_id: varchar("nota_fiscal_id"),
  descricao: text("descricao"),
  quantidade: integer("quantidade"),
  peso: decimal("peso"),
  volume: decimal("volume"),
  created_at: timestamp("created_at").defaultNow(),
});

export const ocorrencias = pgTable("ocorrencias", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tipo_ocorrencia: varchar("tipo_ocorrencia").notNull(),
  descricao: text("descricao").notNull(),
  prioridade: varchar("prioridade").default("media"),
  status: varchar("status").default("aberta"),
  empresa_cliente_id: varchar("empresa_cliente_id"),
  usuario_reportou_id: varchar("usuario_reportou_id").notNull(),
  usuario_responsavel_id: varchar("usuario_responsavel_id"),
  data_resolucao: timestamp("data_resolucao"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const carregamentos = pgTable("carregamentos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  numero_carregamento: varchar("numero_carregamento").notNull(),
  status: varchar("status").default("planejado"),
  data_inicio: timestamp("data_inicio"),
  data_fim: timestamp("data_fim"),
  motorista_id: varchar("motorista_id"),
  veiculo_id: varchar("veiculo_id"),
  empresa_id: varchar("empresa_id").notNull(),
  observacoes: text("observacoes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const notas_fiscais = pgTable("notas_fiscais", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  numero: varchar("numero").notNull(),
  serie: varchar("serie"),
  chave_acesso: varchar("chave_acesso"),
  data_emissao: timestamp("data_emissao"),
  valor_total: decimal("valor_total"),
  peso_total: decimal("peso_total"),
  volume_total: decimal("volume_total"),
  remetente_id: varchar("remetente_id"),
  destinatario_id: varchar("destinatario_id"),
  transportador_id: varchar("transportador_id"),
  empresa_id: varchar("empresa_id").notNull(),
  status: varchar("status").default("pendente"),
  xml_content: text("xml_content"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const volumes_etiqueta = pgTable("volumes_etiqueta", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  codigo_etiqueta: varchar("codigo_etiqueta").unique().notNull(),
  nota_fiscal_id: varchar("nota_fiscal_id").notNull(),
  peso: decimal("peso"),
  dimensoes: varchar("dimensoes"),
  status: varchar("status").default("ativo"),
  posicao_armazenagem: varchar("posicao_armazenagem"),
  empresa_id: varchar("empresa_id").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const historicoVersoes = pgTable("historico_versoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  versao: varchar("versao").notNull(),
  data_lancamento: timestamp("data_lancamento").notNull(),
  descricao: text("descricao").notNull(),
  tipo_atualizacao: varchar("tipo_atualizacao").notNull(),
  empresa_id: varchar("empresa_id"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const pacotesSistema = pgTable("pacotes_sistema", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: varchar("nome").notNull(),
  descricao: text("descricao"),
  versao: varchar("versao"),
  preco: decimal("preco"),
  ativo: boolean("ativo").default(true),
  categoria: varchar("categoria"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const modulosSistema = pgTable("modulos_sistema", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: varchar("nome").notNull(),
  descricao: text("descricao"),
  categoria: varchar("categoria"),
  icone: varchar("icone"),
  rota: varchar("rota"),
  ativo: boolean("ativo").default(true),
  ordem: integer("ordem"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const filaX = pgTable("fila_x", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: varchar("nome").notNull(),
  descricao: text("descricao"),
  prioridade: integer("prioridade").default(1),
  status: varchar("status").default("ativa"),
  empresa_id: varchar("empresa_id"),
  capacidade_maxima: integer("capacidade_maxima"),
  tempo_processamento: integer("tempo_processamento"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const ordensFilaX = pgTable("ordens_fila_x", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fila_id: varchar("fila_id").notNull(),
  ordem_carga_id: varchar("ordem_carga_id"),
  carregamento_id: varchar("carregamento_id"),
  posicao: integer("posicao"),
  status: varchar("status").default("pendente"),
  prioridade: integer("prioridade").default(1),
  data_entrada: timestamp("data_entrada").defaultNow(),
  data_inicio: timestamp("data_inicio"),
  data_conclusao: timestamp("data_conclusao"),
  usuario_id: varchar("usuario_id"),
  observacoes: text("observacoes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const historicoFilaX = pgTable("historico_fila_x", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fila_id: varchar("fila_id").notNull(),
  ordem_fila_id: varchar("ordem_fila_id"),
  acao: varchar("acao").notNull(),
  status_anterior: varchar("status_anterior"),
  status_novo: varchar("status_novo"),
  usuario_id: varchar("usuario_id"),
  observacoes: text("observacoes"),
  dados_adicionais: jsonb("dados_adicionais"),
  created_at: timestamp("created_at").defaultNow(),
});

// Schema para inserção de carregamento
export const insertCarregamentoSchema = z.object({
  id: z.string().optional(),
  numero_carregamento: z.string(),
  status: z.string(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  motorista_id: z.string().optional(),
  veiculo_id: z.string().optional(),
  empresa_id: z.string(),
  observacoes: z.string().optional(),
}).merge(timestampSchema);

// Schema para inserção de nota fiscal
export const insertNotaFiscalSchema = z.object({
  id: z.string().optional(),
  numero: z.string(),
  serie: z.string().optional(),
  chave_acesso: z.string().optional(),
  data_emissao: z.string().optional(),
  valor_total: z.number().optional(),
  peso_total: z.number().optional(),
  volume_total: z.number().optional(),
  remetente_id: z.string().optional(),
  destinatario_id: z.string().optional(),
  transportador_id: z.string().optional(),
  empresa_id: z.string(),
  status: z.string().optional(),
  xml_content: z.string().optional(),
}).merge(timestampSchema);

// Schema para inserção de volume/etiqueta
export const insertVolumeEtiquetaSchema = z.object({
  id: z.string().optional(),
  codigo_etiqueta: z.string(),
  nota_fiscal_id: z.string(),
  peso: z.number().optional(),
  dimensoes: z.string().optional(),
  status: z.string().optional(),
  posicao_armazenagem: z.string().optional(),
  empresa_id: z.string(),
}).merge(timestampSchema);

// Schema para inserção de histórico de versão
export const insertHistoricoVersaoSchema = z.object({
  id: z.string().optional(),
  versao: z.string(),
  data_lancamento: z.string(),
  descricao: z.string(),
  tipo_atualizacao: z.string(),
  empresa_id: z.string().optional(),
}).merge(timestampSchema);

// Schema para inserção de usuário
export const insertUserSchema = z.object({
  id: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
  nome: z.string(),
  empresa_id: z.string().optional(),
  perfil_id: z.string().optional(),
  ativo: z.boolean().default(true),
}).merge(timestampSchema);

// Schema para inserção de empresa
export const insertEmpresaSchema = z.object({
  id: z.string().optional(),
  cnpj: z.string(),
  razao_social: z.string(),
  nome_fantasia: z.string().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  tipo: z.string().optional(), // cliente, transportadora, etc
  status: z.string().default("ativo"),
}).merge(timestampSchema);

// Schema para inserção de coleta
export const insertColetaSchema = z.object({
  id: z.string().optional(),
  numero_coleta: z.string(),
  empresa_cliente_id: z.string(),
  endereco_coleta: z.string(),
  data_solicitacao: z.string(),
  data_prevista: z.string().optional(),
  status: z.string().default("solicitada"),
  observacoes: z.string().optional(),
  usuario_solicitante_id: z.string(),
  zona: z.string().optional(),
}).merge(timestampSchema);

// Schema para inserção de ordem de carga
export const insertOrdemCargaSchema = z.object({
  id: z.string().optional(),
  numero_ordem: z.string(),
  tipo_carregamento: z.string(),
  empresa_cliente_id: z.string(),
  motorista_id: z.string().optional(),
  veiculo_id: z.string().optional(),
  data_prevista: z.string(),
  status: z.string().default("planejada"),
  observacoes: z.string().optional(),
  usuario_responsavel_id: z.string(),
}).merge(timestampSchema);

// Schema para inserção de ocorrência
export const insertOcorrenciaSchema = z.object({
  id: z.string().optional(),
  tipo_ocorrencia: z.string(),
  descricao: z.string(),
  prioridade: z.string().default("media"),
  status: z.string().default("aberta"),
  empresa_cliente_id: z.string().optional(),
  usuario_reportou_id: z.string(),
  usuario_responsavel_id: z.string().optional(),
  data_resolucao: z.string().optional(),
}).merge(timestampSchema);

// Tipos derivados dos schemas
export type InsertCarregamento = z.infer<typeof insertCarregamentoSchema>;
export type InsertNotaFiscal = z.infer<typeof insertNotaFiscalSchema>;
export type InsertVolumeEtiqueta = z.infer<typeof insertVolumeEtiquetaSchema>;
export type InsertHistoricoVersao = z.infer<typeof insertHistoricoVersaoSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEmpresa = z.infer<typeof insertEmpresaSchema>;
export type InsertColeta = z.infer<typeof insertColetaSchema>;
export type InsertOrdemCarga = z.infer<typeof insertOrdemCargaSchema>;
export type InsertOcorrencia = z.infer<typeof insertOcorrenciaSchema>;

// Additional schemas for missing tables
export const insertClienteTransportadorSchema = z.object({
  id: z.string().optional(),
  razao_social: z.string(),
  nome_fantasia: z.string().optional(),
  cnpj: z.string().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  contrato_inicio: z.string().optional(),
  contrato_fim: z.string().optional(),
  status: z.string().default("ativo"),
  empresa_transportadora_id: z.string().optional(),
}).merge(timestampSchema);

export const insertPerfilSchema = z.object({
  id: z.string().optional(),
  nome: z.string(),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
}).merge(timestampSchema);

export const insertPermissaoSchema = z.object({
  id: z.string().optional(),
  nome: z.string(),
  descricao: z.string().optional(),
  modulo: z.string().optional(),
  acao: z.string().optional(),
});

export const insertAssinaturaSchema = z.object({
  id: z.string().optional(),
  empresa_id: z.string(),
  plano: z.string(),
  status: z.string().default("ativa"),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  valor: z.number().optional(),
}).merge(timestampSchema);

export const insertSessionSchema = z.object({
  id: z.string().optional(),
  token: z.string(),
  user_id: z.string(),
  expires_at: z.string(),
});

export const insertPasswordResetTokenSchema = z.object({
  id: z.string().optional(),
  user_id: z.string(),
  token: z.string(),
  expires_at: z.string(),
  used: z.boolean().default(false),
});

export const insertConfiguracaoEmailSchema = z.object({
  id: z.string().optional(),
  empresa_id: z.string(),
  smtp_host: z.string().optional(),
  smtp_port: z.number().optional(),
  smtp_user: z.string().optional(),
  smtp_password: z.string().optional(),
  from_email: z.string().email().optional(),
  from_name: z.string().optional(),
  ativo: z.boolean().default(true),
}).merge(timestampSchema);

export const insertConfiguracaoSistemaSchema = z.object({
  id: z.string().optional(),
  empresa_id: z.string(),
  logistica_cnpj: z.string().optional(),
  logistica_token: z.string().optional(),
  logistica_enabled: z.boolean().default(false),
  crossxml_api_key: z.string().optional(),
  crossxml_enabled: z.boolean().default(false),
  nsdocs_client_id: z.string().optional(),
  nsdocs_client_secret: z.string().optional(),
  nsdocs_enabled: z.boolean().default(false),
  sistema_versao: z.string().default("CrossWMS v2.0"),
  sistema_ambiente: z.string().default("production"),
  backup_automatico: z.boolean().default(true),
  backup_horario: z.string().default("02:00"),
  sessao_timeout: z.string().default("60"),
  max_tentativas_login: z.string().default("5"),
  senha_complexidade: z.boolean().default(true),
  notif_email_novos_usuarios: z.boolean().default(true),
  notif_email_aprovacoes: z.boolean().default(true),
  notif_email_operacoes: z.boolean().default(false),
}).merge(timestampSchema);

export const insertMotoristaSchema = z.object({
  id: z.string().optional(),
  nome: z.string(),
  cpf: z.string().optional(),
  cnh: z.string().optional(),
  telefone: z.string().optional(),
  empresa_id: z.string().optional(),
  status: z.string().default("ativo"),
  disponivel: z.boolean().default(true),
}).merge(timestampSchema);

export const insertVeiculoSchema = z.object({
  id: z.string().optional(),
  placa: z.string(),
  modelo: z.string().optional(),
  marca: z.string().optional(),
  ano: z.number().optional(),
  capacidade_peso: z.number().optional(),
  capacidade_volume: z.number().optional(),
  empresa_id: z.string().optional(),
  status: z.string().default("ativo"),
}).merge(timestampSchema);

// Type exports for all tables
export type User = typeof users.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type Empresa = typeof empresas.$inferSelect;
export type Perfil = typeof perfis.$inferSelect;
export type Permissao = typeof permissoes.$inferSelect;
export type PerfilPermissao = typeof perfilPermissoes.$inferSelect;
export type PerfilModulo = typeof perfilModulos.$inferSelect;
export type Assinatura = typeof assinaturas.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type ConfiguracaoEmail = typeof configuracoes_email.$inferSelect;
export type ConfiguracaoSistema = typeof configuracoes_sistema.$inferSelect;
export type Motorista = typeof motoristas.$inferSelect;
export type Veiculo = typeof veiculos.$inferSelect;
export type ClienteTransportador = typeof clientesTransportador.$inferSelect;
export type Coleta = typeof coletas.$inferSelect;
export type OrdemCarga = typeof ordens_carga.$inferSelect;
export type ItemCarga = typeof itens_carga.$inferSelect;
export type Ocorrencia = typeof ocorrencias.$inferSelect;
export type Carregamento = typeof carregamentos.$inferSelect;
export type NotaFiscal = typeof notas_fiscais.$inferSelect;
export type VolumeEtiqueta = typeof volumes_etiqueta.$inferSelect;
export type HistoricoVersao = typeof historicoVersoes.$inferSelect;
export type PacoteSistema = typeof pacotesSistema.$inferSelect;
export type ModuloSistema = typeof modulosSistema.$inferSelect;

export type InsertClienteTransportador = z.infer<typeof insertClienteTransportadorSchema>;
export type InsertPerfil = z.infer<typeof insertPerfilSchema>;
export type InsertPermissao = z.infer<typeof insertPermissaoSchema>;
export type InsertAssinatura = z.infer<typeof insertAssinaturaSchema>;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type InsertConfiguracaoEmail = z.infer<typeof insertConfiguracaoEmailSchema>;
export type InsertConfiguracaoSistema = z.infer<typeof insertConfiguracaoSistemaSchema>;
export type InsertMotorista = z.infer<typeof insertMotoristaSchema>;
export type InsertVeiculo = z.infer<typeof insertVeiculoSchema>;
