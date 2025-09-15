import { z } from "zod";
import { pgTable, serial, varchar, text, timestamp, boolean, integer, decimal, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Schema base para timestamps
const timestampSchema = z.object({
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Database tables - Adaptado para Supabase
// Nota: Supabase já possui tabelas como auth.users, então renomeamos para app_users
export const users = pgTable("app_users", {
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

export const sessions = pgTable("app_sessions", {
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

// Schemas Zod para validação
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  nome: z.string().min(3),
  empresa_id: z.string().optional(),
  perfil_id: z.string().optional(),
  status: z.string().default("ativo"),
}).merge(timestampSchema);

export const insertEmpresaSchema = z.object({
  cnpj: z.string().min(14).max(18),
  razao_social: z.string().min(3),
  nome_fantasia: z.string().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email().optional(),
  tipo: z.string().optional(),
  status: z.string().default("ativo"),
}).merge(timestampSchema);

// Tipos derivados dos schemas
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Empresa = typeof empresas.$inferSelect;
export type InsertEmpresa = z.infer<typeof insertEmpresaSchema>;

export type Perfil = typeof perfis.$inferSelect;
export type Session = typeof sessions.$inferSelect;