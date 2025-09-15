import { supabaseClient, db, schema } from './supabase';
import { eq } from 'drizzle-orm';

// Funções genéricas para operações CRUD

// Função para buscar todos os registros de uma tabela usando Drizzle
export async function getAll<T>(table: keyof typeof db.query) {
  try {
    // Usando Drizzle ORM para consultas
    const data = await db.query[table].findMany();
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar registros da tabela ${table}:`, error);
    return { data: null, error };
  }
}

// Função para buscar um registro por ID usando Drizzle
export async function getById<T>(table: keyof typeof db.query, id: string) {
  try {
    // Usando Drizzle ORM para consultas com filtro por ID
    const tableObj = schema[table];
    const data = await db.query[table].findFirst({
      where: eq(tableObj.id, id)
    });
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar registro com ID ${id} da tabela ${table}:`, error);
    return { data: null, error };
  }
}

// Função para inserir um novo registro usando Drizzle
export async function insert<T>(table: keyof typeof schema, data: T) {
  try {
    // Usando Drizzle ORM para inserção de dados
    const tableObj = schema[table];
    const insertedData = await db.insert(tableObj).values(data as any).returning();
    return { data: insertedData, error: null };
  } catch (error) {
    console.error(`Erro ao inserir registro na tabela ${table}:`, error);
    return { data: null, error };
  }
}

// Função para atualizar um registro usando Drizzle
export async function update<T>(table: keyof typeof schema, id: string, data: Partial<T>) {
  try {
    // Usando Drizzle ORM para atualização de dados
    const tableObj = schema[table];
    const updatedData = await db.update(tableObj)
      .set(data as any)
      .where(eq(tableObj.id, id))
      .returning();
    return { data: updatedData, error: null };
  } catch (error) {
    console.error(`Erro ao atualizar registro com ID ${id} na tabela ${table}:`, error);
    return { data: null, error };
  }
}

// Função para excluir um registro usando Drizzle
export async function remove(table: keyof typeof schema, id: string) {
  try {
    // Usando Drizzle ORM para remoção de dados
    const tableObj = schema[table];
    await db.delete(tableObj)
      .where(eq(tableObj.id, id));
    return { success: true, error: null };
  } catch (error) {
    console.error(`Erro ao excluir registro com ID ${id} da tabela ${table}:`, error);
    return { success: false, error };
  }
}

// Funções específicas para entidades do sistema

// Usuários
export async function getUsers() {
  return getAll('users');
}

export async function getUserById(id: string) {
  return getById('users', id);
}

export async function getUserByEmail(email: string) {
  try {
    // Usando Drizzle para buscar por email
    const data = await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
    
    return { data, error: null };
  } catch (error) {
    console.error(`Erro ao buscar usuário com email ${email}:`, error);
    return { data: null, error };
  }
}

export async function createUser(userData: schema.InsertUser) {
  return insert('users', userData);
}

export async function updateUser(id: string, userData: Partial<schema.InsertUser>) {
  return update('users', id, userData);
}

export async function deleteUser(id: string) {
  return remove('users', id);
}

// Empresas
export async function getEmpresas() {
  return getAll('empresas');
}

export async function getEmpresaById(id: string) {
  return getById('empresas', id);
}

export async function createEmpresa(empresaData: schema.InsertEmpresa) {
  return insert('empresas', empresaData);
}

export async function updateEmpresa(id: string, empresaData: Partial<schema.InsertEmpresa>) {
  return update('empresas', id, empresaData);
}

export async function deleteEmpresa(id: string) {
  return remove('empresas', id);
}