import { db } from "./db";
import { 
  users, sessions, empresas, perfis, motoristas, veiculos, vinculacoes_empresas,
  notas_fiscais, solicitacoes_coleta, carregamentos, permissoes, perfilPermissoes, assinaturas,
  type User, type InsertUser, type Session, type InsertSession, 
  type Empresa, type InsertEmpresa, type Perfil, type InsertPerfil,
  type Motorista, type InsertMotorista, type Veiculo, type InsertVeiculo,
  type VinculacaoEmpresa, type InsertVinculacaoEmpresa,
  type NotaFiscal, type SolicitacaoColeta, type Carregamento,
  type Permissao, type InsertPermissao, type Assinatura
} from "@shared/schema";
import { eq, and, gte, lt, or, like, inArray, desc, asc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUserById(id: string): Promise<User | undefined>;
  getUserWithCompanyById(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByStatus(status: string): Promise<User[]>;
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
  getEmpresaByCnpj(cnpj: string): Promise<Empresa | undefined>;
  updateEmpresa(id: string, empresaData: Partial<InsertEmpresa>): Promise<Empresa | undefined>;
  getAllEmpresas(): Promise<Empresa[]>;
  getEmpresasByMatriz(matrizId: string): Promise<Empresa[]>;
  getEmpresasByGrupo(grupoId: string): Promise<Empresa[]>;
  getEmpresasRelacionadasCliente(clienteId: string): Promise<Empresa[]>;
  
  // Profile operations
  createPerfil(perfil: InsertPerfil): Promise<Perfil>;
  getPerfilById(id: string): Promise<Perfil | undefined>;
  getAllPerfis(): Promise<Perfil[]>;
  
  // Permission operations
  getAllPermissions(): Promise<Permissao[]>;
  getPermissionsByPerfil(perfilId: string): Promise<Permissao[]>;
  createPermission(permission: InsertPermissao): Promise<Permissao>;
  updatePermission(id: string, updates: Partial<InsertPermissao>): Promise<Permissao | undefined>;
  deletePermission(id: string): Promise<void>;
  savePerfilPermissions(perfilId: string, permissions: {[key: string]: boolean}): Promise<void>;
  
  // Motorista operations
  createMotorista(motorista: InsertMotorista): Promise<Motorista>;
  getMotoristaById(id: string): Promise<Motorista | undefined>;
  getAllMotoristas(empresaId: string): Promise<Motorista[]>;
  
  // Veiculo operations
  createVeiculo(veiculo: InsertVeiculo): Promise<Veiculo>;
  getVeiculoById(id: string): Promise<Veiculo | undefined>;
  getAllVeiculos(empresaId: string): Promise<Veiculo[]>;
  
  // Vinculações entre empresas
  createVinculacaoEmpresa(vinculacao: InsertVinculacaoEmpresa): Promise<VinculacaoEmpresa>;
  getVinculacoesByOperador(operadorId: string): Promise<VinculacaoEmpresa[]>;
  getVinculacoesByEmpresa(empresaId: string): Promise<VinculacaoEmpresa[]>;
  updateVinculacaoStatus(id: string, status: string, aprovadoPor?: string): Promise<VinculacaoEmpresa | undefined>;
  
  getOperadorLogisticoByCnpj(cnpj: string): Promise<Empresa | undefined>;
  getUsersPendentesByTransportador(transportadorEmpresaId: string): Promise<User[]>;
  aprovarUsuarioPorTransportador(userId: string, aprovadoPor: string): Promise<User>;
  getAssinaturaByEmpresa(empresaId: string): Promise<any | undefined>;
}

export class DatabaseStorage implements IStorage {
  
  // Authentication operations
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // User operations
  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserWithCompanyById(id: string): Promise<any> {
    const result = await db
      .select({
        id: users.id,
        nome: users.nome,
        email: users.email,
        tipo_usuario: users.tipo_usuario,
        status: users.status,
        empresa_id: users.empresa_id,
        empresa: {
          id: empresas.id,
          nome_empresa: empresas.nome_empresa,
          cnpj: empresas.cnpj,
          tipo_empresa: empresas.tipo_empresa
        }
      })
      .from(users)
      .leftJoin(empresas, eq(users.empresa_id, empresas.id))
      .where(eq(users.id, id));

    return result[0] || undefined;
  }

  async getUsersByStatus(status: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, status));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser || undefined;
  }

  // Session operations
  async createSession(userId: string): Promise<Session> {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const [session] = await db.insert(sessions).values({
      user_id: userId,
      token,
      expires_at: expiresAt
    }).returning();

    return session;
  }

  async getSessionByToken(token: string): Promise<{ session: Session; user: User } | undefined> {
    const result = await db
      .select({
        session: sessions,
        user: users
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.user_id, users.id))
      .where(and(
        eq(sessions.token, token),
        gte(sessions.expires_at, new Date())
      ));

    return result[0] || undefined;
  }

  async deleteSession(token: string): Promise<void> {
    await db.delete(sessions).where(eq(sessions.token, token));
  }

  async cleanExpiredSessions(): Promise<void> {
    await db.delete(sessions).where(lt(sessions.expires_at, new Date()));
  }

  // Company operations
  async createEmpresa(empresa: InsertEmpresa): Promise<Empresa> {
    const [newEmpresa] = await db.insert(empresas).values(empresa).returning();
    return newEmpresa;
  }

  async getEmpresaById(id: string): Promise<Empresa | undefined> {
    const [empresa] = await db.select().from(empresas).where(eq(empresas.id, id));
    return empresa || undefined;
  }

  async getEmpresaByCnpj(cnpj: string): Promise<Empresa | undefined> {
    const [empresa] = await db.select().from(empresas).where(eq(empresas.cnpj, cnpj));
    return empresa || undefined;
  }

  async updateEmpresa(id: string, empresaData: Partial<InsertEmpresa>): Promise<Empresa | undefined> {
    const [empresa] = await db.update(empresas)
      .set({ ...empresaData, updated_at: new Date() })
      .where(eq(empresas.id, id))
      .returning();
    
    return empresa || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllEmpresas(): Promise<Empresa[]> {
    return await db.select().from(empresas);
  }

  // Profile operations
  async createPerfil(perfil: InsertPerfil): Promise<Perfil> {
    const [newPerfil] = await db.insert(perfis).values(perfil).returning();
    return newPerfil;
  }

  async getPerfilById(id: string): Promise<Perfil | undefined> {
    const [perfil] = await db.select().from(perfis).where(eq(perfis.id, id));
    return perfil || undefined;
  }

  async getAllPerfis(): Promise<Perfil[]> {
    return await db.select().from(perfis).orderBy(asc(perfis.nome));
  }

  // Permission operations
  async getAllPermissions(): Promise<Permissao[]> {
    return await db.select().from(permissoes).orderBy(asc(permissoes.categoria), asc(permissoes.nome));
  }

  async getPermissionsByPerfil(perfilId: string): Promise<Permissao[]> {
    const result = await db
      .select({ permissoes })
      .from(perfilPermissoes)
      .innerJoin(permissoes, eq(perfilPermissoes.permissao_id, permissoes.id))
      .where(eq(perfilPermissoes.perfil_id, perfilId));

    return result.map(r => r.permissoes);
  }

  async createPermission(permission: InsertPermissao): Promise<Permissao> {
    const [newPermission] = await db.insert(permissoes).values(permission).returning();
    return newPermission;
  }

  async updatePermission(id: string, updates: Partial<InsertPermissao>): Promise<Permissao | undefined> {
    const [updatedPermission] = await db.update(permissoes)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(permissoes.id, id))
      .returning();
    
    return updatedPermission || undefined;
  }

  async deletePermission(id: string): Promise<void> {
    await db.delete(permissoes).where(eq(permissoes.id, id));
  }

  async savePerfilPermissions(perfilId: string, permissionsMap: {[key: string]: boolean}): Promise<void> {
    // Remove todas as permissões existentes do perfil
    await db.delete(perfilPermissoes).where(eq(perfilPermissoes.perfil_id, perfilId));

    // Adiciona apenas as permissões que estão marcadas como true
    const permissionsToAdd = Object.entries(permissionsMap)
      .filter(([_, hasPermission]) => hasPermission)
      .map(([permissionId, _]) => ({
        perfil_id: perfilId,
        permissao_id: permissionId
      }));

    if (permissionsToAdd.length > 0) {
      await db.insert(perfilPermissoes).values(permissionsToAdd);
    }
  }

  // Motorista operations
  async createMotorista(motorista: InsertMotorista): Promise<Motorista> {
    const [newMotorista] = await db.insert(motoristas).values(motorista).returning();
    return newMotorista;
  }

  async getMotoristaById(id: string): Promise<Motorista | undefined> {
    const [motorista] = await db.select().from(motoristas).where(eq(motoristas.id, id));
    return motorista || undefined;
  }

  async getAllMotoristas(empresaId: string): Promise<Motorista[]> {
    return await db.select().from(motoristas).where(eq(motoristas.empresa_id, empresaId));
  }

  // Veiculo operations
  async createVeiculo(veiculo: InsertVeiculo): Promise<Veiculo> {
    const [newVeiculo] = await db.insert(veiculos).values(veiculo).returning();
    return newVeiculo;
  }

  async getVeiculoById(id: string): Promise<Veiculo | undefined> {
    const [veiculo] = await db.select().from(veiculos).where(eq(veiculos.id, id));
    return veiculo || undefined;
  }

  async getAllVeiculos(empresaId: string): Promise<Veiculo[]> {
    return await db.select().from(veiculos).where(eq(veiculos.empresa_id, empresaId));
  }

  async getEmpresasByMatriz(matrizId: string): Promise<Empresa[]> {
    return await db.select().from(empresas).where(eq(empresas.empresa_matriz_id, matrizId));
  }

  async getEmpresasByGrupo(grupoId: string): Promise<Empresa[]> {
    return await db.select().from(empresas);
  }

  async getEmpresasRelacionadasCliente(clienteId: string): Promise<Empresa[]> {
    return await db.select().from(empresas);
  }

  // Vinculações entre empresas
  async createVinculacaoEmpresa(vinculacao: InsertVinculacaoEmpresa): Promise<VinculacaoEmpresa> {
    const [novaVinculacao] = await db.insert(vinculacoes_empresas).values(vinculacao).returning();
    return novaVinculacao;
  }

  async getVinculacoesByOperador(operadorId: string): Promise<VinculacaoEmpresa[]> {
    return await db.select().from(vinculacoes_empresas)
      .where(eq(vinculacoes_empresas.operador_logistico_id, operadorId))
      .orderBy(desc(vinculacoes_empresas.created_at));
  }

  async getVinculacoesByEmpresa(empresaId: string): Promise<VinculacaoEmpresa[]> {
    return await db.select().from(vinculacoes_empresas)
      .where(eq(vinculacoes_empresas.empresa_vinculada_id, empresaId))
      .orderBy(desc(vinculacoes_empresas.created_at));
  }

  async updateVinculacaoStatus(id: string, status: string, aprovadoPor?: string): Promise<VinculacaoEmpresa | undefined> {
    const [vinculacao] = await db.update(vinculacoes_empresas)
      .set({
        status,
        aprovado_por: aprovadoPor,
        updated_at: new Date()
      })
      .where(eq(vinculacoes_empresas.id, id))
      .returning();

    return vinculacao;
  }

  async getOperadorLogisticoByCnpj(cnpj: string): Promise<Empresa | undefined> {
    const [empresa] = await db.select().from(empresas)
      .where(and(
        eq(empresas.cnpj, cnpj),
        eq(empresas.tipo_empresa, "transportador")
      ));
    return empresa || undefined;
  }

  async getUsersPendentesByTransportador(transportadorEmpresaId: string): Promise<User[]> {
    return await db.select().from(users)
      .where(and(
        eq(users.empresa_id, transportadorEmpresaId),
        eq(users.status, "pendente_aprovacao")
      ));
  }

  // Aprovar usuário por transportador
  async aprovarUsuarioPorTransportador(userId: string, aprovadoPor: string): Promise<User> {
    const [userAtualizado] = await db.update(users)
      .set({
        status: "ativo",
        updated_at: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    return userAtualizado;
  }

  async getAssinaturaByEmpresa(empresaId: string): Promise<any | undefined> {
    const [assinatura] = await db.select().from(assinaturas).where(eq(assinaturas.empresa_id, empresaId));
    return assinatura || undefined;
  }
}

export const storage = new DatabaseStorage();