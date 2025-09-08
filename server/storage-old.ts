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
import crypto from "crypto";

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
  
  // Company operations for configurations
  getEmpresaById(id: string): Promise<Empresa | undefined>;
  updateEmpresa(id: string, updates: Partial<Empresa>): Promise<Empresa | undefined>;
  getAllUsers(): Promise<User[]>;
  getAssinaturaByEmpresa(empresaId: string): Promise<any | undefined>;
  
  // Motorista operations
  createMotorista(motorista: InsertMotorista): Promise<Motorista>;
  getMotoristaById(id: string): Promise<Motorista | undefined>;
  getAllMotoristas(empresaId: string): Promise<Motorista[]>;
  
  // Veiculo operations
  createVeiculo(veiculo: InsertVeiculo): Promise<Veiculo>;
  getVeiculoById(id: string): Promise<Veiculo | undefined>;
  getAllVeiculos(empresaId: string): Promise<Veiculo[]>;
  
  // Data isolation operations for clients
  getNotasFiscaisForCliente(clienteId: string): Promise<NotaFiscal[]>;
  getSolicitacoesColetaForCliente(clienteId: string): Promise<SolicitacaoColeta[]>;
  getCarregamentosForCliente(clienteId: string): Promise<Carregamento[]>;
  
  // Vinculações entre empresas
  createVinculacaoEmpresa(vinculacao: InsertVinculacaoEmpresa): Promise<VinculacaoEmpresa>;
  getVinculacoesByOperador(operadorId: string): Promise<VinculacaoEmpresa[]>;
  getVinculacoesByEmpresa(empresaId: string): Promise<VinculacaoEmpresa[]>;
  updateVinculacaoStatus(id: string, status: string, aprovadoPor?: string): Promise<VinculacaoEmpresa | undefined>;
  
  getOperadorLogisticoByCnpj(cnpj: string): Promise<Empresa | undefined>;
}

export class DatabaseStorage implements IStorage {
  
  // Authentication methods
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
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
        user: users,
        empresa: empresas
      })
      .from(users)
      .leftJoin(empresas, eq(users.empresa_id, empresas.id))
      .where(eq(users.id, id));

    if (result.length === 0) return undefined;

    const { user, empresa } = result[0];
    return {
      ...user,
      empresa: empresa
    };
  }

  async getUsersByStatus(status: string): Promise<User[]> {
    return await db.select().from(users)
      .where(eq(users.status, status))
      .orderBy(desc(users.created_at));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  // Session operations
  async createSession(userId: string): Promise<Session> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [session] = await db.insert(sessions).values({
      user_id: userId,
      token,
      expires_at: expiresAt,
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
        eq(sessions.ativo, true),
        gte(sessions.expires_at, new Date())
      ));

    if (result.length === 0) return undefined;

    return {
      session: result[0].session,
      user: result[0].user,
    };
  }

  async deleteSession(token: string): Promise<void> {
    await db.update(sessions)
      .set({ ativo: false })
      .where(eq(sessions.token, token));
  }

  async cleanExpiredSessions(): Promise<void> {
    await db.update(sessions)
      .set({ ativo: false })
      .where(lt(sessions.expires_at, new Date()));
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

  async updateEmpresa(id: string, updates: Partial<Empresa>): Promise<Empresa | undefined> {
    const [updated] = await db.update(empresas).set(updates).where(eq(empresas.id, id)).returning();
    return updated;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByStatus(status: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, status));
  }

  async getAllEmpresas(): Promise<Empresa[]> {
    return await db.select().from(empresas).orderBy(asc(empresas.nome));
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
    return await db.select().from(permissoes).orderBy(permissoes.modulo, permissoes.acao);
  }

  async getPermissionsByPerfil(perfilId: string): Promise<Permissao[]> {
    return await db.select()
      .from(permissoes)
      .innerJoin(perfilPermissoes, eq(perfilPermissoes.permissao_id, permissoes.id))
      .where(eq(perfilPermissoes.perfil_id, perfilId));
  }

  async createPermission(permission: InsertPermissao): Promise<Permissao> {
    const [novaPermission] = await db.insert(permissoes).values(permission).returning();
    return novaPermission;
  }

  async updatePermission(id: string, updates: Partial<InsertPermissao>): Promise<Permissao | undefined> {
    const [permissionAtualizada] = await db.update(permissoes)
      .set({ ...updates, created_at: new Date() })
      .where(eq(permissoes.id, id))
      .returning();
    return permissionAtualizada;
  }

  async deletePermission(id: string): Promise<void> {
    await db.delete(permissoes).where(eq(permissoes.id, id));
  }

  async savePerfilPermissions(perfilId: string, permissionsMap: {[key: string]: boolean}): Promise<void> {
    // Remove todas as permissões existentes do perfil
    await db.delete(perfilPermissoes).where(eq(perfilPermissoes.perfil_id, perfilId));
    
    // Busca todas as permissões do sistema
    const allPermissions = await this.getAllPermissions();
    
    // Cria mapa de permissões ativas
    const activePermissions = Object.entries(permissionsMap)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => key);
    
    // Insere novas permissões
    if (activePermissions.length > 0) {
      const permissionsToInsert = allPermissions
        .filter(permission => activePermissions.some(active => 
          active === `${(permission as any).modulo}_${(permission as any).acao}`
        ))
        .map(permission => ({
          perfil_id: perfilId,
          permissao_id: (permission as any).id
        }));
      
      if (permissionsToInsert.length > 0) {
        await db.insert(perfilPermissoes).values(permissionsToInsert);
      }
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
    return await db.select().from(motoristas)
      .where(eq(motoristas.empresa_id, empresaId))
      .orderBy(asc(motoristas.nome));
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
    return await db.select().from(veiculos)
      .where(eq(veiculos.empresa_id, empresaId))
      .orderBy(asc(veiculos.placa));
  }

  // Empresa operations para página de configurações
  async getEmpresaById(id: string): Promise<Empresa | undefined> {
    const [empresa] = await db.select().from(empresas).where(eq(empresas.id, id));
    return empresa || undefined;
  }

  async updateEmpresa(id: string, empresaData: Partial<InsertEmpresa>): Promise<Empresa | undefined> {
    const [updatedEmpresa] = await db
      .update(empresas)
      .set({ ...empresaData, updated_at: new Date() })
      .where(eq(empresas.id, id))
      .returning();
    return updatedEmpresa || undefined;
  }

  // Multi-tenant operations - hierarquia de empresas (3 níveis)
  async getEmpresasByMatriz(matrizId: string): Promise<Empresa[]> {
    // Retorna a empresa matriz + todas as filiais
    return await db.select().from(empresas)
      .where(
        or(
          eq(empresas.id, matrizId), // A própria matriz
          eq(empresas.empresa_matriz_id, matrizId) // Todas as filiais
        )
      )
      .orderBy(asc(empresas.nome));
  }

  async getEmpresasByGrupo(grupoId: string): Promise<Empresa[]> {
    // Retorna todas as empresas do grupo empresarial (transportador + filiais + clientes + fornecedores)
    return await db.select().from(empresas)
      .where(
        or(
          eq(empresas.id, grupoId), // O próprio transportador matriz
          eq(empresas.empresa_matriz_id, grupoId) // Todas as empresas do grupo
        )
      )
      .orderBy(asc(empresas.tipo_empresa), asc(empresas.nome));
  }

  async getEmpresasRelacionadasCliente(clienteId: string): Promise<Empresa[]> {
    // Cliente vê: própria empresa + fornecedores/remetentes que se relacionam via notas fiscais
    const empresasRelacionadas = await db
      .selectDistinct({
        id: empresas.id,
        nome: empresas.nome,
        cnpj: empresas.cnpj,
        tipo_empresa: empresas.tipo_empresa,
        email: empresas.email,
        telefone: empresas.telefone,
        inscricao_estadual: empresas.inscricao_estadual,
        logradouro: empresas.logradouro,
        numero: empresas.numero,
        complemento: empresas.complemento,
        bairro: empresas.bairro,
        cidade: empresas.cidade,
        uf: empresas.uf,
        cep: empresas.cep,
        website: empresas.website,
        plano_assinatura: empresas.plano_assinatura,
        data_vencimento: empresas.data_vencimento,
        configuracoes: empresas.configuracoes,
        empresa_matriz_id: empresas.empresa_matriz_id,
        status: empresas.status,
        created_at: empresas.created_at,
        updated_at: empresas.updated_at
      })
      .from(empresas)
      .leftJoin(notas_fiscais, 
        or(
          eq(notas_fiscais.cnpj_emitente, empresas.cnpj),
          eq(notas_fiscais.cnpj_destinatario, empresas.cnpj)
        )
      )
      .where(
        or(
          eq(empresas.id, clienteId), // Própria empresa
          and(
            or(
              eq(notas_fiscais.cnpj_emitente, empresas.cnpj),
              eq(notas_fiscais.cnpj_destinatario, empresas.cnpj)
            ),
            or(
              // Notas onde o cliente é destinatário
              eq(notas_fiscais.cnpj_destinatario, 
                db.select({ cnpj: empresas.cnpj }).from(empresas).where(eq(empresas.id, clienteId))
              ),
              // Notas onde o cliente é emitente
              eq(notas_fiscais.cnpj_emitente,
                db.select({ cnpj: empresas.cnpj }).from(empresas).where(eq(empresas.id, clienteId))
              )
            )
          )
        )
      );

    return empresasRelacionadas;
  }



  // Data isolation methods for clients
  async getNotasFiscaisForCliente(clienteId: string): Promise<NotaFiscal[]> {
    // Busca o CNPJ do cliente
    const [cliente] = await db.select({ cnpj: empresas.cnpj }).from(empresas).where(eq(empresas.id, clienteId));
    if (!cliente) return [];

    // Retorna apenas notas onde o cliente é emitente ou destinatário
    return await db.select().from(notas_fiscais)
      .where(
        or(
          eq(notas_fiscais.cnpj_emitente, cliente.cnpj),
          eq(notas_fiscais.cnpj_destinatario, cliente.cnpj)
        )
      )
      .orderBy(desc(notas_fiscais.created_at));
  }

  async getSolicitacoesColetaForCliente(clienteId: string): Promise<SolicitacaoColeta[]> {
    // Busca o CNPJ do cliente
    const [cliente] = await db.select({ cnpj: empresas.cnpj }).from(empresas).where(eq(empresas.id, clienteId));
    if (!cliente) return [];

    // Retorna apenas solicitações relacionadas ao cliente
    return await db.select().from(solicitacoes_coleta)
      .where(
        or(
          eq(solicitacoes_coleta.cnpj_remetente, cliente.cnpj),
          eq(solicitacoes_coleta.cnpj_destinatario, cliente.cnpj)
        )
      )
      .orderBy(desc(solicitacoes_coleta.created_at));
  }

  async getCarregamentosForCliente(clienteId: string): Promise<Carregamento[]> {
    // Busca o CNPJ do cliente
    const [cliente] = await db.select({ cnpj: empresas.cnpj }).from(empresas).where(eq(empresas.id, clienteId));
    if (!cliente) return [];

    // Retorna carregamentos onde o cliente aparece nas notas fiscais
    const carregamentosCliente = await db
      .selectDistinct({
        id: carregamentos.id,
        numero_carregamento: carregamentos.numero_carregamento,
        empresa_id: carregamentos.empresa_id,
        status: carregamentos.status,
        data_carregamento: carregamentos.data_carregamento,
        observacoes: carregamentos.observacoes,
        created_at: carregamentos.created_at,
        updated_at: carregamentos.updated_at
      })
      .from(carregamentos)
      .innerJoin(notas_fiscais, eq(notas_fiscais.carregamento_id, carregamentos.id))
      .where(
        or(
          eq(notas_fiscais.cnpj_emitente, cliente.cnpj),
          eq(notas_fiscais.cnpj_destinatario, cliente.cnpj)
        )
      )
      .orderBy(desc(carregamentos.created_at));

    return carregamentosCliente;
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
    const updateData: Partial<VinculacaoEmpresa> = { 
      status: status as any,
      updated_at: new Date()
    };
    
    if (aprovadoPor) {
      updateData.aprovado_por = aprovadoPor;
      updateData.data_aprovacao = new Date();
    }

    const [vinculacaoAtualizada] = await db.update(vinculacoes_empresas)
      .set(updateData)
      .where(eq(vinculacoes_empresas.id, id))
      .returning();
    
    return vinculacaoAtualizada;
  }

  // Solicitações de cadastro
  async createSolicitacaoCadastro(solicitacao: InsertSolicitacaoCadastro): Promise<SolicitacaoCadastro> {
    const [novaSolicitacao] = await db.insert(solicitacoes_cadastro).values(solicitacao).returning();
    return novaSolicitacao;
  }

  async getSolicitacoesPendentes(operadorId: string): Promise<SolicitacaoCadastro[]> {
    return await db.select().from(solicitacoes_cadastro)
      .where(and(
        eq(solicitacoes_cadastro.operador_logistico_id, operadorId),
        eq(solicitacoes_cadastro.status, "pendente")
      ))
      .orderBy(desc(solicitacoes_cadastro.created_at));
  }

  async getSolicitacaoById(id: string): Promise<SolicitacaoCadastro | undefined> {
    const [solicitacao] = await db.select().from(solicitacoes_cadastro)
      .where(eq(solicitacoes_cadastro.id, id));
    return solicitacao;
  }

  async aprovarSolicitacaoCadastro(id: string, aprovadoPor: string): Promise<{ empresa: Empresa; solicitacao: SolicitacaoCadastro }> {
    const solicitacao = await this.getSolicitacaoById(id);
    if (!solicitacao) {
      throw new Error("Solicitação não encontrada");
    }

    // Criar a nova empresa
    const novaEmpresa: InsertEmpresa = {
      nome: solicitacao.nome_empresa,
      cnpj: solicitacao.cnpj,
      inscricao_estadual: solicitacao.inscricao_estadual,
      logradouro: solicitacao.endereco,
      numero: solicitacao.numero,
      complemento: solicitacao.complemento,
      bairro: solicitacao.bairro,
      cidade: solicitacao.cidade,
      uf: solicitacao.uf,
      cep: solicitacao.cep,
      telefone: solicitacao.telefone,
      email: solicitacao.email,
      website: solicitacao.website,
      tipo_empresa: solicitacao.tipo_solicitacao as any,
      empresa_matriz_id: solicitacao.operador_logistico_id
    };

    const empresaCriada = await this.createEmpresa(novaEmpresa);

    // Criar vinculação
    const vinculacao: InsertVinculacaoEmpresa = {
      operador_logistico_id: solicitacao.operador_logistico_id!,
      empresa_vinculada_id: empresaCriada.id,
      tipo_vinculacao: solicitacao.tipo_solicitacao as any,
      status: "ativo",
      aprovado_por: aprovadoPor,
      data_aprovacao: new Date()
    };

    await this.createVinculacaoEmpresa(vinculacao);

    // Atualizar status da solicitação
    const [solicitacaoAtualizada] = await db.update(solicitacoes_cadastro)
      .set({
        status: "aprovado",
        aprovado_por: aprovadoPor,
        data_aprovacao: new Date(),
        updated_at: new Date()
      })
      .where(eq(solicitacoes_cadastro.id, id))
      .returning();

    return { empresa: empresaCriada, solicitacao: solicitacaoAtualizada };
  }

  async rejeitarSolicitacaoCadastro(id: string, motivoRejeicao: string, rejeitadoPor: string): Promise<SolicitacaoCadastro> {
    const [solicitacaoRejeitada] = await db.update(solicitacoes_cadastro)
      .set({
        status: "rejeitado",
        motivo_rejeicao: motivoRejeicao,
        aprovado_por: rejeitadoPor,
        data_aprovacao: new Date(),
        updated_at: new Date()
      })
      .where(eq(solicitacoes_cadastro.id, id))
      .returning();

    return solicitacaoRejeitada;
  }

  async getOperadorLogisticoByCnpj(cnpj: string): Promise<Empresa | undefined> {
    const [operador] = await db.select().from(empresas)
      .where(and(
        eq(empresas.cnpj, cnpj),
        eq(empresas.tipo_empresa, "operador_logistico")
      ));
    return operador;
  }

  // Buscar usuários pendentes vinculados a um transportador
  async getUsersPendentesByTransportador(transportadorEmpresaId: string): Promise<User[]> {
    return await db.select()
      .from(users)
      .innerJoin(empresas, eq(users.empresa_id, empresas.id))
      .where(and(
        eq(users.status, "pendente_aprovacao"),
        eq(empresas.empresa_matriz_id, transportadorEmpresaId),
        inArray(users.tipo_usuario, ["cliente", "fornecedor"])
      ))
      .then(results => results.map(result => result.users));
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