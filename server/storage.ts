import { db } from "./db";
import { 
  users, sessions, empresas, perfis, permissoes, perfilPermissoes, perfilModulos, assinaturas, passwordResetTokens, configuracoes_email,
  carregamentos, notas_fiscais, volumes_etiqueta, motoristas, veiculos, historicoVersoes, clientesTransportador,
  type User, type InsertUser, type Session, type InsertSession, 
  type Empresa, type InsertEmpresa, type Perfil, type InsertPerfil,
  type Permissao, type InsertPermissao, type Assinatura,
  type PasswordResetToken, type InsertPasswordResetToken,
  type ConfiguracaoEmail, type InsertConfiguracaoEmail,
  type Carregamento, type InsertCarregamento,
  type NotaFiscal, type InsertNotaFiscal,
  type VolumeEtiqueta, type InsertVolumeEtiqueta,
  type HistoricoVersao, type InsertHistoricoVersao,
  type ClienteTransportador, type InsertClienteTransportador
} from "@shared/schema";
import { eq, and, gte, lt, or, like, inArray, desc, asc, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUserById(id: string): Promise<User | undefined>;
  getUserWithCompanyById(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUsersByStatus(status: string): Promise<User[]>;
  getUsersByEmpresa(empresaId: string): Promise<any[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  
  // Authentication operations
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  
  // Session operations
  createSession(userId: string): Promise<Session>;
  getSessionByToken(token: string): Promise<{ session: Session; user: User } | undefined>;
  deleteSession(token: string): Promise<void>;
  cleanExpiredSessions(): Promise<void>;
  
  // Cliente Transportador operations
  createClienteTransportador(clienteTransportador: InsertClienteTransportador): Promise<ClienteTransportador>;
  getClienteTransportadorById(id: string): Promise<ClienteTransportador | undefined>;
  getClienteTransportadorByCnpj(cnpj: string): Promise<ClienteTransportador | undefined>;
  updateClienteTransportador(id: string, clienteTransportador: Partial<InsertClienteTransportador>): Promise<ClienteTransportador>;
  deleteClienteTransportador(id: string): Promise<boolean>;
  getAllClientesTransportador(): Promise<ClienteTransportador[]>;

  // Company operations (clientes e fornecedores)
  createEmpresa(empresa: InsertEmpresa): Promise<Empresa>;
  getEmpresaById(id: string): Promise<Empresa | undefined>;
  getEmpresaByCnpj(cnpj: string): Promise<Empresa | undefined>;
  updateEmpresa(id: string, empresaData: Partial<InsertEmpresa>): Promise<Empresa | undefined>;
  getAllEmpresas(): Promise<Empresa[]>;
  getEmpresasByTipo(tipo: string): Promise<Empresa[]>;
  getEmpresasByClienteTransportador(clienteTransportadorId: string): Promise<Empresa[]>;
  
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
  
  // Password reset operations
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenAsUsed(token: string): Promise<void>;
  cleanExpiredTokens(): Promise<void>;
  updateUserPassword(userId: string, newPassword: string): Promise<void>;
  
  // Email configuration operations
  getConfiguracaoEmailByEmpresa(empresaId: string): Promise<ConfiguracaoEmail | undefined>;
  createConfiguracaoEmail(config: InsertConfiguracaoEmail): Promise<ConfiguracaoEmail>;
  updateConfiguracaoEmail(empresaId: string, config: Partial<InsertConfiguracaoEmail>): Promise<ConfiguracaoEmail | undefined>;
  
  // Carregamento operations
  getAllCarregamentos(): Promise<Carregamento[]>;
  getCarregamentoById(id: string): Promise<Carregamento | undefined>;
  createCarregamento(carregamento: InsertCarregamento): Promise<Carregamento>;
  updateCarregamento(id: string, updates: Partial<InsertCarregamento>): Promise<Carregamento | undefined>;
  deleteCarregamento(id: string): Promise<void>;
  getNotasFiscaisByCarregamento(carregamentoId: string): Promise<NotaFiscal[]>;
  vincularNotaFiscalCarregamento(notaFiscalId: string, carregamentoId: string): Promise<void>;
  desvincularNotaFiscalCarregamento(notaFiscalId: string): Promise<void>;
  
  // Número sequencial operations
  getProximoNumeroCarregamento(): Promise<number>;
  generateCarregamentoId(tipo: string): string;
  
  // Nota Fiscal operations
  createNotaFiscal(notaFiscal: InsertNotaFiscal): Promise<NotaFiscal>;
  getNotaFiscalById(id: string): Promise<NotaFiscal | undefined>;
  getNotaFiscalRastreamentoById(id: string): Promise<any | undefined>;
  getNotaFiscalByChave(chaveAcesso: string): Promise<NotaFiscal | undefined>;
  searchNotasFiscais(searchTerm: string, searchType?: string): Promise<NotaFiscal[]>;
  searchNotasFiscaisByDateRange(dataInicio: string, dataFim: string): Promise<NotaFiscal[]>;
  
  // Volume Etiqueta operations
  createVolumeEtiqueta(volume: InsertVolumeEtiqueta): Promise<VolumeEtiqueta>;
  getVolumesByNotaFiscal(notaFiscalId: string): Promise<VolumeEtiqueta[]>;
  
  // Motorista operations
  getAllMotoristas(): Promise<any[]>;
  getMotoristaById(id: string): Promise<any | undefined>;
  searchMotoristas(searchTerm: string): Promise<any[]>;
  
  // Veiculo operations
  getAllVeiculos(): Promise<any[]>;
  getVeiculoById(id: string): Promise<any | undefined>;
  searchVeiculos(searchTerm: string): Promise<any[]>;
  
  // Historico de Versoes operations
  createHistoricoVersao(historicoVersao: InsertHistoricoVersao): Promise<HistoricoVersao>;
  getAllHistoricoVersoes(): Promise<HistoricoVersao[]>;
  getHistoricoVersaoById(id: string): Promise<HistoricoVersao | undefined>;
  getUltimaVersao(): Promise<HistoricoVersao | undefined>;
  
  // Assinatura operations
  getAssinaturasByClienteTransportador(clienteTransportadorId: string): Promise<any[]>;
  createAssinatura(assinatura: any): Promise<any>;
  updateAssinatura(id: string, updates: any): Promise<any | undefined>;
  deleteAssinatura(id: string): Promise<void>;
  
  // Access Control based on Cliente Transportador
  getUsersByClienteTransportador(clienteTransportadorId: string): Promise<User[]>;
  getNotasFiscaisByClienteTransportador(clienteTransportadorId: string): Promise<NotaFiscal[]>;
  getCarregamentosByClienteTransportador(clienteTransportadorId: string): Promise<Carregamento[]>;
  checkUserAccessToClienteTransportador(userId: string, clienteTransportadorId: string): Promise<boolean>;
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
        perfil_id: users.perfil_id,
        empresa: {
          id: empresas.id,
          nome: empresas.nome,
          cnpj: empresas.cnpj,
          tipo_empresa: empresas.tipo_empresa
        },
        perfil: {
          id: perfis.id,
          nome: perfis.nome,
          tipo_perfil: perfis.tipo_perfil
        }
      })
      .from(users)
      .leftJoin(empresas, eq(users.empresa_id, empresas.id))
      .leftJoin(perfis, eq(users.perfil_id, perfis.id))
      .where(eq(users.id, id));

    return result[0] || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUsersByStatus(status: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.status, status));
  }

  async getUsersByEmpresa(empresaId: string): Promise<any[]> {
    const result = await db
      .select({
        id: users.id,
        nome: users.nome,
        email: users.email,
        telefone: users.telefone,
        cpf: users.cpf,
        tipo_usuario: users.tipo_usuario,
        status: users.status,
        funcao: users.funcao,
        departamento: users.departamento,
        ultimo_acesso: users.ultimo_acesso,
        created_at: users.created_at,
        empresa: {
          id: empresas.id,
          nome: empresas.nome,
          cnpj: empresas.cnpj,
          tipo_empresa: empresas.tipo_empresa
        },
        perfil: {
          id: perfis.id,
          nome: perfis.nome,
          tipo_perfil: perfis.tipo_perfil
        }
      })
      .from(users)
      .leftJoin(empresas, eq(users.empresa_id, empresas.id))
      .leftJoin(perfis, eq(users.perfil_id, perfis.id))
      .where(eq(users.empresa_id, empresaId))
      .orderBy(asc(users.nome));

    return result;
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

  async deleteUser(id: string): Promise<void> {
    // First delete related sessions
    await db.delete(sessions).where(eq(sessions.user_id, id));
    
    // Then delete the user
    await db.delete(users).where(eq(users.id, id));
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

  // Cliente Transportador operations
  async createClienteTransportador(clienteTransportador: InsertClienteTransportador): Promise<ClienteTransportador> {
    const [newClienteTransportador] = await db.insert(clientesTransportador).values(clienteTransportador).returning();
    return newClienteTransportador;
  }

  async getClienteTransportadorById(id: string): Promise<ClienteTransportador | undefined> {
    const [cliente] = await db.select().from(clientesTransportador).where(eq(clientesTransportador.id, id));
    return cliente || undefined;
  }

  async getAllClientesTransportador(): Promise<ClienteTransportador[]> {
    return await db.select().from(clientesTransportador);
  }

  async getClienteTransportadorByCnpj(cnpj: string): Promise<ClienteTransportador | undefined> {
    const [cliente] = await db.select().from(clientesTransportador).where(eq(clientesTransportador.cnpj, cnpj));
    return cliente || undefined;
  }

  async updateClienteTransportador(id: string, clienteTransportador: Partial<InsertClienteTransportador>): Promise<ClienteTransportador> {
    const [updatedClienteTransportador] = await db
      .update(clientesTransportador)
      .set({ ...clienteTransportador, updated_at: new Date() })
      .where(eq(clientesTransportador.id, id))
      .returning();
    return updatedClienteTransportador;
  }

  async deleteClienteTransportador(id: string): Promise<boolean> {
    const result = await db.delete(clientesTransportador).where(eq(clientesTransportador.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Company operations (agora para clientes e fornecedores)
  async createEmpresa(empresa: InsertEmpresa): Promise<Empresa> {
    const [newEmpresa] = await db.insert(empresas).values(empresa).returning();
    return newEmpresa;
  }

  async getEmpresaById(id: string): Promise<Empresa | undefined> {
    const [empresa] = await db.select().from(empresas).where(eq(empresas.id, id));
    
    if (!empresa) return undefined;
    
    // Expandir configurações do campo JSON para o nível principal
    const configuracoes = empresa.configuracoes || {};
    
    return {
      ...empresa,
      ...configuracoes
    };
  }

  async getEmpresaByCnpj(cnpj: string): Promise<Empresa | undefined> {
    const [empresa] = await db.select().from(empresas).where(eq(empresas.cnpj, cnpj));
    return empresa || undefined;
  }

  async updateEmpresa(id: string, empresaData: Partial<InsertEmpresa>): Promise<Empresa | undefined> {
    // Se existem configurações de sistema, salvá-las no campo JSON configuracoes
    const updateData: any = { ...empresaData, updated_at: new Date() };
    
    // Identificar campos de configuração do sistema
    const configFields = [
      'email_host', 'email_user', 'email_password', 'email_from', 'email_port', 'email_enabled',
      'nsdocs_client_id', 'nsdocs_client_secret', 'nsdocs_enabled',
      'sistema_versao', 'sistema_ambiente', 'backup_automatico', 'backup_horario',
      'sessao_timeout', 'max_tentativas_login', 'senha_complexidade',
      'notif_email_novos_usuarios', 'notif_email_aprovacoes', 'notif_email_operacoes'
    ];
    
    // Separar configurações dos dados da empresa
    const configuracoes: any = {};
    const dadosEmpresa: any = {};
    
    Object.keys(updateData).forEach(key => {
      if (configFields.includes(key)) {
        configuracoes[key] = updateData[key];
      } else {
        dadosEmpresa[key] = updateData[key];
      }
    });
    
    // Se há configurações, buscar configurações existentes e mesclar
    if (Object.keys(configuracoes).length > 0) {
      const empresaAtual = await this.getEmpresaById(id);
      const configExistentes = empresaAtual?.configuracoes || {};
      
      dadosEmpresa.configuracoes = {
        ...configExistentes,
        ...configuracoes
      };
    }
    
    const [empresa] = await db.update(empresas)
      .set(dadosEmpresa)
      .where(eq(empresas.id, id))
      .returning();
    
    return empresa || undefined;
  }

  async getAllEmpresas(): Promise<Empresa[]> {
    return await db.select().from(empresas);
  }

  async getEmpresasByTipo(tipo: string): Promise<Empresa[]> {
    return await db.select().from(empresas).where(eq(empresas.tipo_empresa, tipo));
  }

  async getEmpresasByClienteTransportador(clienteTransportadorId: string): Promise<Empresa[]> {
    return await db.select().from(empresas).where(eq(empresas.cliente_transportador_id, clienteTransportadorId));
  }

  // Profile operations
  async createPerfil(perfil: InsertPerfil | {
    nome: string;
    descricao?: string;
    tipo_perfil: string;
    nivel_hierarquia?: number;
  }): Promise<Perfil> {
    const perfilData = {
      ...perfil,
      ativo: true,
      nivel_hierarquia: perfil.nivel_hierarquia || 3
    };
    const [newPerfil] = await db.insert(perfis).values(perfilData).returning();
    return newPerfil;
  }

  async getPerfilById(id: string): Promise<Perfil | undefined> {
    const [perfil] = await db.select().from(perfis).where(eq(perfis.id, id));
    return perfil || undefined;
  }

  async getAllPerfis(): Promise<Perfil[]> {
    return await db.select().from(perfis).orderBy(asc(perfis.nome));
  }

  // Método alias para compatibilidade
  async getPerfis(): Promise<Perfil[]> {
    return await this.getAllPerfis();
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
    const [newPermission] = await db.insert(permissoes).values([permission]).returning();
    return newPermission;
  }

  async updatePermission(id: string, updates: Partial<InsertPermissao>): Promise<Permissao | undefined> {
    const [updatedPermission] = await db.update(permissoes)
      .set(updates)
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

  async getAssinaturasByClienteTransportador(clienteTransportadorId: string): Promise<any[]> {
    const result = await db.select().from(assinaturas).where(eq(assinaturas.cliente_transportador_id, clienteTransportadorId));
    return result;
  }

  async createAssinatura(assinatura: any): Promise<any> {
    try {
      // Converter strings de data para objetos Date se necessário
      const assinaturaData = {
        ...assinatura,
        data_inicio: typeof assinatura.data_inicio === 'string' ? new Date(assinatura.data_inicio) : assinatura.data_inicio,
        data_vencimento: typeof assinatura.data_vencimento === 'string' ? new Date(assinatura.data_vencimento) : assinatura.data_vencimento,
        valor_mensal: typeof assinatura.valor_mensal === 'number' ? assinatura.valor_mensal.toString() : assinatura.valor_mensal,
      };
      
      const [newAssinatura] = await db.insert(assinaturas).values(assinaturaData).returning();
      return newAssinatura;
    } catch (error) {
      console.error('Create assinatura error:', error);
      throw error;
    }
  }

  async updateAssinatura(id: string, updates: any): Promise<any | undefined> {
    const [updatedAssinatura] = await db.update(assinaturas)
      .set(updates)
      .where(eq(assinaturas.id, id))
      .returning();
    
    return updatedAssinatura || undefined;
  }

  async deleteAssinatura(id: string): Promise<void> {
    await db.delete(assinaturas).where(eq(assinaturas.id, id));
  }

  // Métodos para controle de módulos por perfil
  async getPerfilModulos(perfilId: string): Promise<any[]> {
    return await db
      .select()
      .from(perfilModulos)
      .where(eq(perfilModulos.perfil_id, perfilId));
  }

  async savePerfilModulos(perfilId: string, modulos: { [key: string]: any }): Promise<void> {
    // Remove todas as configurações existentes para este perfil
    await db.delete(perfilModulos).where(eq(perfilModulos.perfil_id, perfilId));

    // Insere as novas configurações
    const configsToInsert = Object.entries(modulos)
      .filter(([_, config]) => config.acesso_completo) // Apenas módulos com acesso
      .map(([moduloId, config]) => ({
        perfil_id: perfilId,
        modulo_id: moduloId,
        acesso_completo: config.acesso_completo || false,
        rotas_permitidas: config.rotas_permitidas || [],
        rotas_negadas: config.rotas_negadas || [],
        permissoes_especiais: config.permissoes_especiais || {},
        ativo: true,
        configurado_por: 'admin',
        configurado_em: new Date()
      }));

    if (configsToInsert.length > 0) {
      await db.insert(perfilModulos).values(configsToInsert);
    }
  }

  // Password reset operations
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    const [resetToken] = await db
      .insert(passwordResetTokens)
      .values({
        user_id: userId,
        token,
        expires_at: expiresAt,
        used: false
      })
      .returning();
    return resetToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gte(passwordResetTokens.expires_at, new Date())
      ));
    return resetToken || undefined;
  }

  async markTokenAsUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));
  }

  async cleanExpiredTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expires_at, new Date()));
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));
  }

  // Email configuration operations
  async getConfiguracaoEmailByEmpresa(empresaId: string): Promise<ConfiguracaoEmail | undefined> {
    const [config] = await db
      .select()
      .from(configuracoes_email)
      .where(eq(configuracoes_email.empresa_id, empresaId));
    return config || undefined;
  }

  async createConfiguracaoEmail(config: InsertConfiguracaoEmail): Promise<ConfiguracaoEmail> {
    const [newConfig] = await db
      .insert(configuracoes_email)
      .values(config)
      .returning();
    return newConfig;
  }

  async updateConfiguracaoEmail(empresaId: string, config: Partial<InsertConfiguracaoEmail>): Promise<ConfiguracaoEmail | undefined> {
    const [updatedConfig] = await db
      .update(configuracoes_email)
      .set({ ...config, updated_at: new Date() })
      .where(eq(configuracoes_email.empresa_id, empresaId))
      .returning();
    return updatedConfig || undefined;
  }

  // Carregamento operations
  async getAllCarregamentos(): Promise<Carregamento[]> {
    return await db.select().from(carregamentos).orderBy(desc(carregamentos.created_at));
  }

  async getCarregamentoById(id: string): Promise<Carregamento | undefined> {
    const [carregamento] = await db.select().from(carregamentos).where(eq(carregamentos.id, id));
    return carregamento || undefined;
  }

  async createCarregamento(carregamento: InsertCarregamento): Promise<Carregamento> {
    // Gerar número sequencial automático
    const proximoNumero = await this.getProximoNumeroCarregamento();
    const numeroCarregamento = proximoNumero.toString().padStart(6, '0');
    
    const carregamentoCompleto = {
      ...carregamento,
      numero_carregamento: numeroCarregamento
    };

    const [newCarregamento] = await db
      .insert(carregamentos)
      .values(carregamentoCompleto)
      .returning();
    return newCarregamento;
  }

  async updateCarregamento(id: string, updates: Partial<InsertCarregamento>): Promise<Carregamento | undefined> {
    const [updatedCarregamento] = await db
      .update(carregamentos)
      .set(updates)
      .where(eq(carregamentos.id, id))
      .returning();
    return updatedCarregamento || undefined;
  }

  async deleteCarregamento(id: string): Promise<void> {
    await db.delete(carregamentos).where(eq(carregamentos.id, id));
  }

  async getNotasFiscaisByCarregamento(carregamentoId: string): Promise<NotaFiscal[]> {
    return await db.select().from(notas_fiscais)
      .where(eq(notas_fiscais.ordem_carregamento_id, carregamentoId))
      .orderBy(desc(notas_fiscais.created_at));
  }

  async vincularNotaFiscalCarregamento(notaFiscalId: string, carregamentoId: string): Promise<void> {
    await db.update(notas_fiscais)
      .set({ ordem_carregamento_id: carregamentoId })
      .where(eq(notas_fiscais.id, notaFiscalId));
  }

  async desvincularNotaFiscalCarregamento(notaFiscalId: string): Promise<void> {
    await db.update(notas_fiscais)
      .set({ ordem_carregamento_id: null })
      .where(eq(notas_fiscais.id, notaFiscalId));
  }

  // Nota Fiscal operations
  async createNotaFiscal(notaFiscal: InsertNotaFiscal): Promise<NotaFiscal> {
    const [newNotaFiscal] = await db
      .insert(notas_fiscais)
      .values(notaFiscal)
      .returning();
    return newNotaFiscal;
  }

  async getNotaFiscalById(id: string): Promise<NotaFiscal | undefined> {
    const [notaFiscal] = await db.select().from(notas_fiscais).where(eq(notas_fiscais.id, id));
    return notaFiscal || undefined;
  }

  async getNotaFiscalByChave(chaveAcesso: string): Promise<NotaFiscal | undefined> {
    const [notaFiscal] = await db.select().from(notas_fiscais).where(eq(notas_fiscais.chave_acesso, chaveAcesso));
    return notaFiscal || undefined;
  }

  async getNotaFiscalRastreamentoById(id: string): Promise<any | undefined> {
    // Usar a tabela de notas_fiscais temporariamente até termos a tabela específica
    const [nota] = await db.select().from(notas_fiscais).where(eq(notas_fiscais.id, id));
    return nota || undefined;
  }

  async searchNotasFiscais(searchTerm: string, searchType?: string): Promise<NotaFiscal[]> {
    let whereCondition;

    // Definir as condições de busca baseadas no tipo
    switch (searchType) {
      case 'chave':
        whereCondition = or(
          eq(notas_fiscais.chave_acesso, searchTerm),
          like(notas_fiscais.chave_acesso, `%${searchTerm}%`)
        );
        break;
        
      case 'numero':
        whereCondition = or(
          eq(notas_fiscais.numero_nf, searchTerm),
          like(notas_fiscais.numero_nf, `%${searchTerm}%`)
        );
        break;
        
      case 'remetente':
        whereCondition = or(
          like(notas_fiscais.emitente_razao_social, `%${searchTerm}%`),
          like(notas_fiscais.emitente_nome_fantasia, `%${searchTerm}%`),
          like(notas_fiscais.emitente_cnpj, `%${searchTerm}%`)
        );
        break;
        
      case 'destinatario':
        whereCondition = or(
          like(notas_fiscais.destinatario_razao_social, `%${searchTerm}%`),
          like(notas_fiscais.destinatario_nome_fantasia, `%${searchTerm}%`),
          like(notas_fiscais.destinatario_cnpj, `%${searchTerm}%`)
        );
        break;
        
      case 'cidade_origem':
        whereCondition = like(notas_fiscais.emitente_cidade, `%${searchTerm}%`);
        break;
        
      case 'uf_origem':
        whereCondition = eq(notas_fiscais.emitente_uf, searchTerm.toUpperCase());
        break;
        
      case 'cidade_destino':
        whereCondition = like(notas_fiscais.destinatario_cidade, `%${searchTerm}%`);
        break;
        
      case 'uf_destino':
        whereCondition = eq(notas_fiscais.destinatario_uf, searchTerm.toUpperCase());
        break;
        
      case 'estagio':
        // Mapear termos de estágio para os valores do banco
        const estagioMap: { [key: string]: string } = {
          'pendente': 'pendente_coleta',
          'recebido': 'recebido',
          'armazenado': 'armazenado',
          'carregado': 'carregado',
          'transito': 'em_transito',
          'filial': 'filial_destino',
          'rota': 'rota_entrega',
          'aguardando': 'aguardando_descarga',
          'entregue': 'entregue'
        };
        
        const estagioValue = estagioMap[searchTerm.toLowerCase()] || searchTerm.toLowerCase();
        whereCondition = like(notas_fiscais.situacao_sefaz, `%${estagioValue}%`);
        break;
        
      case 'status':
        // Mapear termos de status para os valores do banco
        const statusMap: { [key: string]: string } = {
          'recebido': 'recebido',
          'disponivel': 'disponivel', 
          'bloqueada': 'bloqueada',
          'avariada': 'avariada',
          'extraviado': 'extraviado',
          'carregado': 'carregado',
          'transito': 'em_transito',
          'entregue': 'entregue'
        };
        
        const statusValue = statusMap[searchTerm.toLowerCase()] || searchTerm.toLowerCase();
        whereCondition = like(notas_fiscais.status, `%${statusValue}%`);
        break;
        
      case 'prioridade':
        // Mapear termos de prioridade
        const prioridadeMap: { [key: string]: string } = {
          'normal': 'normal',
          'prioridade': 'alta',
          'expressa': 'expressa'
        };
        
        const prioridadeValue = prioridadeMap[searchTerm.toLowerCase()] || searchTerm.toLowerCase();
        // Assumindo que temos um campo prioridade na tabela notas_fiscais
        whereCondition = like(notas_fiscais.observacoes, `%${prioridadeValue}%`);
        break;
        
      case 'data_inclusao':
        // Buscar por data de inclusão (created_at)
        // O searchTerm vem no formato YYYY-MM-DD do input type="date"
        const dataInicio = new Date(`${searchTerm}T00:00:00.000Z`);
        const dataFim = new Date(`${searchTerm}T23:59:59.999Z`);
        
        whereCondition = and(
          gte(notas_fiscais.created_at, dataInicio),
          lt(notas_fiscais.created_at, dataFim)
        );
        break;
        
      default:
        // Pesquisa geral (comportamento original)
        whereCondition = or(
          eq(notas_fiscais.chave_acesso, searchTerm),
          like(notas_fiscais.chave_acesso, `%${searchTerm}%`),
          eq(notas_fiscais.numero_nf, searchTerm),
          like(notas_fiscais.numero_nf, `%${searchTerm}%`),
          like(notas_fiscais.emitente_razao_social, `%${searchTerm}%`),
          like(notas_fiscais.emitente_nome_fantasia, `%${searchTerm}%`),
          like(notas_fiscais.emitente_cnpj, `%${searchTerm}%`),
          like(notas_fiscais.destinatario_razao_social, `%${searchTerm}%`),
          like(notas_fiscais.destinatario_nome_fantasia, `%${searchTerm}%`),
          like(notas_fiscais.destinatario_cnpj, `%${searchTerm}%`)
        );
    }

    const results = await db
      .select()
      .from(notas_fiscais)
      .where(whereCondition)
      .orderBy(desc(notas_fiscais.created_at))
      .limit(50);
    
    return results;
  }

  async searchNotasFiscaisByDateRange(dataInicio: string, dataFim: string): Promise<NotaFiscal[]> {
    // Converter as datas do formato YYYY-MM-DD para Date
    const dataInicioObj = new Date(`${dataInicio}T00:00:00.000Z`);
    const dataFimObj = new Date(`${dataFim}T23:59:59.999Z`);
    
    console.log('Searching NFe by date range:', dataInicioObj, 'to', dataFimObj);
    
    const whereCondition = and(
      gte(notas_fiscais.created_at, dataInicioObj),
      lt(notas_fiscais.created_at, dataFimObj)
    );

    const results = await db
      .select()
      .from(notas_fiscais)
      .where(whereCondition)
      .orderBy(desc(notas_fiscais.created_at))
      .limit(100); // Limite maior para pesquisas por período
    
    return results;
  }

  // Volume Etiqueta operations
  async createVolumeEtiqueta(volume: InsertVolumeEtiqueta): Promise<VolumeEtiqueta> {
    const [newVolume] = await db
      .insert(volumes_etiqueta)
      .values(volume)
      .returning();
    return newVolume;
  }

  async getVolumesByNotaFiscal(notaFiscalId: string): Promise<VolumeEtiqueta[]> {
    return await db.select().from(volumes_etiqueta)
      .where(eq(volumes_etiqueta.nota_fiscal_id, notaFiscalId))
      .orderBy(desc(volumes_etiqueta.created_at));
  }

  // Motorista operations
  async getAllMotoristas(): Promise<any[]> {
    return await db.select().from(motoristas)
      .where(eq(motoristas.status, 'ativo'))
      .orderBy(asc(motoristas.nome));
  }

  async getMotoristaById(id: string): Promise<any | undefined> {
    const [motorista] = await db.select().from(motoristas).where(eq(motoristas.id, id));
    return motorista || undefined;
  }

  // Veiculo operations
  async getAllVeiculos(): Promise<any[]> {
    return await db.select().from(veiculos)
      .where(eq(veiculos.status, 'disponivel'))
      .orderBy(asc(veiculos.placa));
  }

  async getVeiculoById(id: string): Promise<any | undefined> {
    const [veiculo] = await db.select().from(veiculos).where(eq(veiculos.id, id));
    return veiculo || undefined;
  }

  // Número sequencial operations
  async getProximoNumeroCarregamento(): Promise<number> {
    const ultimoCarregamento = await db.select()
      .from(carregamentos)
      .orderBy(desc(carregamentos.created_at))
      .limit(1);
    
    if (ultimoCarregamento.length === 0) {
      return 1;
    }
    
    // Extrai o número do formato "CAR-2025-XXX"
    const ultimoNumero = ultimoCarregamento[0].numero_carregamento;
    const match = ultimoNumero.match(/(\d+)$/);
    
    if (match) {
      return parseInt(match[1]) + 1;
    }
    
    return 1;
  }

  generateCarregamentoId(tipo: string): string {
    const now = new Date();
    const dia = now.getDate().toString().padStart(2, '0');
    const mes = (now.getMonth() + 1).toString().padStart(2, '0');
    const ano = now.getFullYear().toString();
    const hora = now.getHours().toString().padStart(2, '0');
    const segundo = now.getSeconds().toString().padStart(2, '0');
    
    // Mapear tipos para códigos
    const tipoMap: { [key: string]: string } = {
      'Entrada': 'ENT',
      'Saida': 'SAI',
      'Transferencia': 'TRF',
      'Coleta': 'COL',
      'Recebimento': 'REC',
      'Devolucao': 'DEV',
      'Armazem': 'ARM',
      'Direta': 'DIR',
      'Entrega': 'ENT'
    };
    
    const codigoTipo = tipoMap[tipo] || 'CAR';
    
    return `${codigoTipo}${dia}${mes}${ano}${hora}${segundo}`;
  }

  // Motorista search operations
  async searchMotoristas(searchTerm: string): Promise<any[]> {
    const searchPattern = `%${searchTerm}%`;
    const results = await db
      .select()
      .from(motoristas)
      .where(
        or(
          like(motoristas.nome, searchPattern),
          like(motoristas.cpf, searchPattern),
          like(motoristas.cnh, searchPattern)
        )
      )
      .orderBy(asc(motoristas.nome));
    
    return results;
  }

  // Veiculo search operations
  async searchVeiculos(searchTerm: string): Promise<any[]> {
    const searchPattern = `%${searchTerm}%`;
    const results = await db
      .select()
      .from(veiculos)
      .where(
        or(
          like(veiculos.placa, searchPattern),
          like(veiculos.tipo, searchPattern),
          like(veiculos.marca, searchPattern),
          like(veiculos.modelo, searchPattern)
        )
      )
      .orderBy(asc(veiculos.placa));
    
    return results;
  }

  // Historico de Versoes operations
  async createHistoricoVersao(historicoVersao: InsertHistoricoVersao): Promise<HistoricoVersao> {
    const [newHistorico] = await db.insert(historicoVersoes).values(historicoVersao).returning();
    return newHistorico;
  }

  async getAllHistoricoVersoes(): Promise<HistoricoVersao[]> {
    return await db.select().from(historicoVersoes).orderBy(desc(historicoVersoes.data_deploy));
  }

  async getHistoricoVersaoById(id: string): Promise<HistoricoVersao | undefined> {
    const [historico] = await db.select().from(historicoVersoes).where(eq(historicoVersoes.id, id));
    return historico || undefined;
  }

  async getUltimaVersao(): Promise<HistoricoVersao | undefined> {
    const [ultimaVersao] = await db
      .select()
      .from(historicoVersoes)
      .where(eq(historicoVersoes.status, 'ativo'))
      .orderBy(desc(historicoVersoes.data_deploy))
      .limit(1);
    return ultimaVersao || undefined;
  }

  // Access Control based on Cliente Transportador
  async getUsersByClienteTransportador(clienteTransportadorId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.cliente_transportador_id, clienteTransportadorId));
  }

  async getNotasFiscaisByClienteTransportador(clienteTransportadorId: string): Promise<NotaFiscal[]> {
    // Get users first to verify access
    const usersFromTransportador = await this.getUsersByClienteTransportador(clienteTransportadorId);
    const userIds = usersFromTransportador.map(user => user.id);
    
    if (userIds.length === 0) {
      return [];
    }

    // For now, return all notes - in production you'd filter by user or company context
    return await db.select().from(notas_fiscais);
  }

  async getCarregamentosByClienteTransportador(clienteTransportadorId: string): Promise<Carregamento[]> {
    // Get users first to verify access
    const usersFromTransportador = await this.getUsersByClienteTransportador(clienteTransportadorId);
    const userIds = usersFromTransportador.map(user => user.id);
    
    if (userIds.length === 0) {
      return [];
    }

    // For now, return all carregamentos - in production you'd filter by user or company context
    return await db.select().from(carregamentos);
  }

  async checkUserAccessToClienteTransportador(userId: string, clienteTransportadorId: string): Promise<boolean> {
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, userId),
          eq(users.cliente_transportador_id, clienteTransportadorId)
        )
      );
    
    return !!user;
  }

}

export const storage = new DatabaseStorage();