import { 
  users, 
  sessions, 
  empresas, 
  perfis, 
  veiculos, 
  motoristas,
  notas_fiscais,
  volumes_etiqueta,
  type User, 
  type InsertUser,
  type Session,
  type Empresa,
  type InsertEmpresa,
  type Perfil,
  type InsertPerfil,
  type Veiculo,
  type InsertVeiculo,
  type Motorista,
  type InsertMotorista,
  type NotaFiscal,
  type InsertNotaFiscal,
  type VolumeEtiqueta,
  type InsertVolumeEtiqueta
} from "@shared/schema";
import {
  insertColetaSchema,
  insertOrdemCargaSchema,
  insertOcorrenciaSchema,
  type InsertColeta,
  type InsertOrdemCarga,
  type InsertOcorrencia
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, count, sum, avg, like } from "drizzle-orm";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export interface ILogisticsStorage {
  // User operations
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Authentication operations
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  
  // Session operations
  createSession(userId: string): Promise<Session>;
  getSessionByToken(token: string): Promise<{ session: Session; user: User } | undefined>;
  deleteSession(token: string): Promise<void>;
  cleanExpiredSessions(): Promise<void>;
  
  // Company operations
  createEmpresa(empresa: InsertEmpresa): Promise<Empresa>;
  getEmpresaById(id: string): Promise<Empresa | undefined>;
  listEmpresas(filters?: { tipo?: string; status?: string }): Promise<Empresa[]>;
  updateEmpresa(id: string, updates: Partial<Empresa>): Promise<Empresa | undefined>;
  
  // Profile operations
  createPerfil(perfil: InsertPerfil): Promise<Perfil>;
  getPerfilById(id: string): Promise<Perfil | undefined>;
  listPerfis(): Promise<Perfil[]>;
  
  // Fleet management - Vehicles
  createVeiculo(veiculo: InsertVeiculo): Promise<Veiculo>;
  getVeiculoById(id: string): Promise<Veiculo | undefined>;
  listVeiculos(filters?: { status?: string; empresa_id?: string }): Promise<Veiculo[]>;
  updateVeiculo(id: string, updates: Partial<Veiculo>): Promise<Veiculo | undefined>;
  
  // Fleet management - Drivers
  createMotorista(motorista: InsertMotorista): Promise<Motorista>;
  getMotoristaById(id: string): Promise<Motorista | undefined>;
  listMotoristas(filters?: { status?: string; disponivel?: boolean }): Promise<Motorista[]>;
  updateMotorista(id: string, updates: Partial<Motorista>): Promise<Motorista | undefined>;
  
  // Invoice management
  createNotaFiscal(nota: InsertNotaFiscal): Promise<NotaFiscal>;
  getNotaFiscalById(id: string): Promise<NotaFiscal | undefined>;
  listNotasFiscais(filters?: { 
    status?: string; 
    remetente_id?: string; 
    destinatario_id?: string;
    data_inicio?: Date;
    data_fim?: Date;
  }): Promise<NotaFiscal[]>;
  searchNotasFiscais(searchTerm: string, searchType?: string): Promise<NotaFiscal[]>;
  updateNotaFiscal(id: string, updates: Partial<NotaFiscal>): Promise<NotaFiscal | undefined>;
  
  // Label management
  createEtiqueta(etiqueta: InsertEtiqueta): Promise<Etiqueta>;
  getEtiquetaById(id: string): Promise<Etiqueta | undefined>;
  getEtiquetaByCodigo(codigo: string): Promise<Etiqueta | undefined>;
  listEtiquetas(filters?: { 
    nota_fiscal_id?: string; 
    status?: string; 
    tipo?: string 
  }): Promise<Etiqueta[]>;
  updateEtiqueta(id: string, updates: Partial<Etiqueta>): Promise<Etiqueta | undefined>;
  
  // Collection management
  createColeta(coleta: InsertColeta): Promise<Coleta>;
  getColetaById(id: string): Promise<Coleta | undefined>;
  listColetas(filters?: { 
    status?: string; 
    empresa_cliente_id?: string;
    data_inicio?: Date;
    data_fim?: Date;
    zona?: string;
  }): Promise<Coleta[]>;
  updateColeta(id: string, updates: Partial<Coleta>): Promise<Coleta | undefined>;
  aprovarColeta(id: string, userId: string): Promise<Coleta | undefined>;
  recusarColeta(id: string, userId: string, motivo: string): Promise<Coleta | undefined>;
  
  // Loading order management
  createOrdemCarga(ordem: InsertOrdemCarga): Promise<OrdemCarga>;
  getOrdemCargaById(id: string): Promise<OrdemCarga | undefined>;
  listOrdensCarga(filters?: { 
    status?: string; 
    tipo_carregamento?: string;
    empresa_cliente_id?: string;
    motorista_id?: string;
  }): Promise<OrdemCarga[]>;
  updateOrdemCarga(id: string, updates: Partial<OrdemCarga>): Promise<OrdemCarga | undefined>;
  
  // SAC - Customer service
  createOcorrencia(ocorrencia: InsertOcorrencia): Promise<Ocorrencia>;
  getOcorrenciaById(id: string): Promise<Ocorrencia | undefined>;
  listOcorrencias(filters?: {
    status?: string;
    tipo_ocorrencia?: string;
    prioridade?: string;
    empresa_cliente_id?: string;
    usuario_responsavel_id?: string;
  }): Promise<Ocorrencia[]>;
  updateOcorrencia(id: string, updates: Partial<Ocorrencia>): Promise<Ocorrencia | undefined>;
  
  // Dashboard metrics
  getDashboardMetrics(empresa_id?: string): Promise<{
    coletas_pendentes: number;
    cargas_em_transito: number;
    ocorrencias_abertas: number;
    expedicoes_hoje: number;
    volumes_armazem: number;
    posicoes_disponiveis: number;
    frota_disponivel: number;
    tempo_medio_processamento: number;
  }>;
  
  // System parameters
  getParametrosSistema(categoria?: string): Promise<Array<{
    categoria: string;
    chave: string;
    valor: string;
    descricao: string | null;
  }>>;
  
  // Audit logging
  logAuditoria(data: {
    tabela: string;
    registro_id: string;
    acao: string;
    dados_anteriores?: any;
    dados_novos?: any;
    usuario_id?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void>;
}

export class LogisticsStorage implements ILogisticsStorage {
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(userData.password);
    const [user] = await db
      .insert(users)
      .values({ ...userData, password: hashedPassword })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    if (updates.password) {
      updates.password = await this.hashPassword(updates.password);
    }
    const [user] = await db
      .update(users)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createSession(userId: string): Promise<Session> {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const [session] = await db
      .insert(sessions)
      .values({
        user_id: userId,
        token,
        expires_at: expiresAt
      })
      .returning();
    
    return session;
  }

  async getSessionByToken(token: string): Promise<{ session: Session; user: User } | undefined> {
    const [result] = await db
      .select()
      .from(sessions)
      .innerJoin(users, eq(sessions.user_id, users.id))
      .where(and(
        eq(sessions.token, token),
        eq(users.status, "active")
      ));
    
    if (!result || new Date() > result.sessions.expires_at) {
      return undefined;
    }
    
    return {
      session: result.sessions,
      user: result.users
    };
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async cleanExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(eq(sessions.expires_at, new Date()));
  }

  async createEmpresa(empresaData: InsertEmpresa): Promise<Empresa> {
    const [empresa] = await db
      .insert(empresas)
      .values(empresaData)
      .returning();
    return empresa;
  }

  async getEmpresaById(id: string): Promise<Empresa | undefined> {
    const [empresa] = await db.select().from(empresas).where(eq(empresas.id, id));
    return empresa || undefined;
  }

  async listEmpresas(filters?: { tipo?: string; status?: string }): Promise<Empresa[]> {
    let query = db.select().from(empresas);
    
    if (filters?.tipo) {
      query = query.where(eq(empresas.tipo, filters.tipo));
    }
    if (filters?.status) {
      query = query.where(eq(empresas.status, filters.status));
    }
    
    return query.orderBy(asc(empresas.razao_social));
  }

  async updateEmpresa(id: string, updates: Partial<Empresa>): Promise<Empresa | undefined> {
    const [empresa] = await db
      .update(empresas)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(empresas.id, id))
      .returning();
    return empresa || undefined;
  }

  async createPerfil(perfilData: InsertPerfil): Promise<Perfil> {
    const [perfil] = await db
      .insert(perfis)
      .values(perfilData)
      .returning();
    return perfil;
  }

  async getPerfilById(id: string): Promise<Perfil | undefined> {
    const [perfil] = await db.select().from(perfis).where(eq(perfis.id, id));
    return perfil || undefined;
  }

  async listPerfis(): Promise<Perfil[]> {
    return db.select().from(perfis).orderBy(asc(perfis.nome));
  }

  async createVeiculo(veiculoData: InsertVeiculo): Promise<Veiculo> {
    const [veiculo] = await db
      .insert(veiculos)
      .values(veiculoData)
      .returning();
    return veiculo;
  }

  async getVeiculoById(id: string): Promise<Veiculo | undefined> {
    const [veiculo] = await db.select().from(veiculos).where(eq(veiculos.id, id));
    return veiculo || undefined;
  }

  async listVeiculos(filters?: { status?: string; empresa_id?: string }): Promise<Veiculo[]> {
    let query = db.select().from(veiculos);
    
    if (filters?.status) {
      query = query.where(eq(veiculos.status, filters.status));
    }
    if (filters?.empresa_id) {
      query = query.where(eq(veiculos.empresa_id, filters.empresa_id));
    }
    
    return query.orderBy(asc(veiculos.placa));
  }

  async updateVeiculo(id: string, updates: Partial<Veiculo>): Promise<Veiculo | undefined> {
    const [veiculo] = await db
      .update(veiculos)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(veiculos.id, id))
      .returning();
    return veiculo || undefined;
  }

  async createMotorista(motoristaData: InsertMotorista): Promise<Motorista> {
    const [motorista] = await db
      .insert(motoristas)
      .values(motoristaData)
      .returning();
    return motorista;
  }

  async getMotoristaById(id: string): Promise<Motorista | undefined> {
    const [motorista] = await db.select().from(motoristas).where(eq(motoristas.id, id));
    return motorista || undefined;
  }

  async listMotoristas(filters?: { status?: string; disponivel?: boolean }): Promise<Motorista[]> {
    let query = db.select().from(motoristas);
    
    if (filters?.status) {
      query = query.where(eq(motoristas.status, filters.status));
    }
    
    return query.orderBy(asc(motoristas.cpf));
  }

  async updateMotorista(id: string, updates: Partial<Motorista>): Promise<Motorista | undefined> {
    const [motorista] = await db
      .update(motoristas)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(motoristas.id, id))
      .returning();
    return motorista || undefined;
  }

  async createNotaFiscal(notaData: InsertNotaFiscal): Promise<NotaFiscal> {
    const [nota] = await db
      .insert(notas_fiscais)
      .values(notaData)
      .returning();
    return nota;
  }

  async getNotaFiscalById(id: string): Promise<NotaFiscal | undefined> {
    const [nota] = await db.select().from(notas_fiscais).where(eq(notas_fiscais.id, id));
    return nota || undefined;
  }

  async listNotasFiscais(filters?: { 
    status?: string; 
    remetente_id?: string; 
    destinatario_id?: string;
    data_inicio?: Date;
    data_fim?: Date;
  }): Promise<NotaFiscal[]> {
    let query = db.select().from(notas_fiscais);
    
    const conditions = [];
    if (filters?.status) conditions.push(eq(notas_fiscais.status, filters.status));
    if (filters?.remetente_id) conditions.push(eq(notas_fiscais.remetente_id, filters.remetente_id));
    if (filters?.destinatario_id) conditions.push(eq(notas_fiscais.destinatario_id, filters.destinatario_id));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(notas_fiscais.created_at));
  }

  // Note: searchNotasFiscais moved to storage.ts to avoid duplication

  async updateNotaFiscal(id: string, updates: Partial<NotaFiscal>): Promise<NotaFiscal | undefined> {
    const [nota] = await db
      .update(notas_fiscais)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(notas_fiscais.id, id))
      .returning();
    return nota || undefined;
  }

  async createEtiqueta(etiquetaData: InsertEtiqueta): Promise<Etiqueta> {
    const [etiqueta] = await db
      .insert(etiquetas)
      .values(etiquetaData)
      .returning();
    return etiqueta;
  }

  async getEtiquetaById(id: string): Promise<Etiqueta | undefined> {
    const [etiqueta] = await db.select().from(etiquetas).where(eq(etiquetas.id, id));
    return etiqueta || undefined;
  }

  async getEtiquetaByCodigo(codigo: string): Promise<Etiqueta | undefined> {
    const [etiqueta] = await db.select().from(etiquetas).where(eq(etiquetas.codigo, codigo));
    return etiqueta || undefined;
  }

  async listEtiquetas(filters?: { 
    nota_fiscal_id?: string; 
    status?: string; 
    tipo?: string 
  }): Promise<Etiqueta[]> {
    let query = db.select().from(etiquetas);
    
    const conditions = [];
    if (filters?.nota_fiscal_id) conditions.push(eq(etiquetas.nota_fiscal_id, filters.nota_fiscal_id));
    if (filters?.status) conditions.push(eq(etiquetas.status, filters.status));
    if (filters?.tipo) conditions.push(eq(etiquetas.tipo, filters.tipo));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(etiquetas.created_at));
  }

  async updateEtiqueta(id: string, updates: Partial<Etiqueta>): Promise<Etiqueta | undefined> {
    const [etiqueta] = await db
      .update(etiquetas)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(etiquetas.id, id))
      .returning();
    return etiqueta || undefined;
  }

  async createColeta(coletaData: InsertColeta): Promise<Coleta> {
    const [coleta] = await db
      .insert(coletas)
      .values(coletaData)
      .returning();
    return coleta;
  }

  async getColetaById(id: string): Promise<Coleta | undefined> {
    const [coleta] = await db.select().from(coletas).where(eq(coletas.id, id));
    return coleta || undefined;
  }

  async listColetas(filters?: { 
    status?: string; 
    empresa_cliente_id?: string;
    data_inicio?: Date;
    data_fim?: Date;
    zona?: string;
  }): Promise<Coleta[]> {
    let query = db.select().from(coletas);
    
    const conditions = [];
    if (filters?.status) conditions.push(eq(coletas.status, filters.status));
    if (filters?.empresa_cliente_id) conditions.push(eq(coletas.empresa_cliente_id, filters.empresa_cliente_id));
    if (filters?.zona) conditions.push(eq(coletas.zona_coleta, filters.zona));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(coletas.created_at));
  }

  async updateColeta(id: string, updates: Partial<Coleta>): Promise<Coleta | undefined> {
    const [coleta] = await db
      .update(coletas)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(coletas.id, id))
      .returning();
    return coleta || undefined;
  }

  async aprovarColeta(id: string, userId: string): Promise<Coleta | undefined> {
    return this.updateColeta(id, {
      status: "aprovada",
      usuario_aprovador_id: userId,
      data_aprovacao: new Date()
    });
  }

  async recusarColeta(id: string, userId: string, motivo: string): Promise<Coleta | undefined> {
    return this.updateColeta(id, {
      status: "recusada",
      usuario_aprovador_id: userId,
      motivo_recusa: motivo,
      data_aprovacao: new Date()
    });
  }

  async createOrdemCarga(ordemData: InsertOrdemCarga): Promise<OrdemCarga> {
    const [ordem] = await db
      .insert(ordens_carga)
      .values(ordemData)
      .returning();
    return ordem;
  }

  async getOrdemCargaById(id: string): Promise<OrdemCarga | undefined> {
    const [ordem] = await db.select().from(ordens_carga).where(eq(ordens_carga.id, id));
    return ordem || undefined;
  }

  async listOrdensCarga(filters?: { 
    status?: string; 
    tipo_carregamento?: string;
    empresa_cliente_id?: string;
    motorista_id?: string;
  }): Promise<OrdemCarga[]> {
    let query = db.select().from(ordens_carga);
    
    const conditions = [];
    if (filters?.status) conditions.push(eq(ordens_carga.status, filters.status));
    if (filters?.tipo_carregamento) conditions.push(eq(ordens_carga.tipo_carregamento, filters.tipo_carregamento));
    if (filters?.empresa_cliente_id) conditions.push(eq(ordens_carga.empresa_cliente_id, filters.empresa_cliente_id));
    if (filters?.motorista_id) conditions.push(eq(ordens_carga.motorista_id, filters.motorista_id));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(ordens_carga.created_at));
  }

  async updateOrdemCarga(id: string, updates: Partial<OrdemCarga>): Promise<OrdemCarga | undefined> {
    const [ordem] = await db
      .update(ordens_carga)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(ordens_carga.id, id))
      .returning();
    return ordem || undefined;
  }

  async createOcorrencia(ocorrenciaData: InsertOcorrencia): Promise<Ocorrencia> {
    const [ocorrencia] = await db
      .insert(ocorrencias)
      .values(ocorrenciaData)
      .returning();
    return ocorrencia;
  }

  async getOcorrenciaById(id: string): Promise<Ocorrencia | undefined> {
    const [ocorrencia] = await db.select().from(ocorrencias).where(eq(ocorrencias.id, id));
    return ocorrencia || undefined;
  }

  async listOcorrencias(filters?: {
    status?: string;
    tipo_ocorrencia?: string;
    prioridade?: string;
    empresa_cliente_id?: string;
    usuario_responsavel_id?: string;
  }): Promise<Ocorrencia[]> {
    let query = db.select().from(ocorrencias);
    
    const conditions = [];
    if (filters?.status) conditions.push(eq(ocorrencias.status, filters.status));
    if (filters?.tipo_ocorrencia) conditions.push(eq(ocorrencias.tipo_ocorrencia, filters.tipo_ocorrencia));
    if (filters?.prioridade) conditions.push(eq(ocorrencias.prioridade, filters.prioridade));
    if (filters?.empresa_cliente_id) conditions.push(eq(ocorrencias.empresa_cliente_id, filters.empresa_cliente_id));
    if (filters?.usuario_responsavel_id) conditions.push(eq(ocorrencias.usuario_responsavel_id, filters.usuario_responsavel_id));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(ocorrencias.created_at));
  }

  async updateOcorrencia(id: string, updates: Partial<Ocorrencia>): Promise<Ocorrencia | undefined> {
    const [ocorrencia] = await db
      .update(ocorrencias)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(ocorrencias.id, id))
      .returning();
    return ocorrencia || undefined;
  }

  async getDashboardMetrics(empresa_id?: string): Promise<{
    coletas_pendentes: number;
    cargas_em_transito: number;
    ocorrencias_abertas: number;
    expedicoes_hoje: number;
    volumes_armazem: number;
    posicoes_disponiveis: number;
    frota_disponivel: number;
    tempo_medio_processamento: number;
  }> {
    // This would be implemented with complex queries in a real system
    // For now, returning mock data based on the documentation requirements
    return {
      coletas_pendentes: 24,
      cargas_em_transito: 36,
      ocorrencias_abertas: 7,
      expedicoes_hoje: 18,
      volumes_armazem: 2847,
      posicoes_disponiveis: 1153,
      frota_disponivel: 18,
      tempo_medio_processamento: 2.4
    };
  }

  async getParametrosSistema(categoria?: string): Promise<Array<{
    categoria: string;
    chave: string;
    valor: string;
    descricao: string | null;
  }>> {
    let query = db.select({
      categoria: parametros_sistema.categoria,
      chave: parametros_sistema.chave,
      valor: parametros_sistema.valor,
      descricao: parametros_sistema.descricao
    }).from(parametros_sistema)
    .where(eq(parametros_sistema.ativo, true));
    
    if (categoria) {
      query = query.where(eq(parametros_sistema.categoria, categoria));
    }
    
    return query.orderBy(asc(parametros_sistema.categoria), asc(parametros_sistema.ordem));
  }

  async logAuditoria(data: {
    tabela: string;
    registro_id: string;
    acao: string;
    dados_anteriores?: any;
    dados_novos?: any;
    usuario_id?: string;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void> {
    await db.insert(logs_auditoria).values(data);
  }
}

export const logisticsStorage = new LogisticsStorage();