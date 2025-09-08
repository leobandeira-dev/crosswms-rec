import { storage } from "./storage";
import { v4 as uuidv4 } from "uuid";

export async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar empresa padrão
    const empresa = await storage.createEmpresa({
      nome: "CrossWMS Demo",
      tipo_empresa: "matriz",
      cnpj: "00.000.000/0001-00",
      endereco: "Rua Demo, 123",
      cidade: "São Paulo",
      uf: "SP",
      cep: "01000-000",
      telefone: "(11) 99999-9999",
      email: "contato@crosswms.com.br"
    });
    console.log('✅ Empresa criada:', empresa.nome);

    // Criar perfil administrador
    const perfil = await storage.createPerfil({
      nome: "Administrador",
      tipo_perfil: "administrador",
      descricao: "Acesso total ao sistema",
      nivel_hierarquia: 1,
      empresa_id: empresa.id
    });
    console.log('✅ Perfil criado:', perfil.nome);

    // Verificar se usuário já existe
    const existingUser = await storage.getUserByEmail("admin@crosswms.com.br");
    if (!existingUser) {
      // Criar usuário administrador
      const hashedPassword = await storage.hashPassword("123456");
      const user = await storage.createUser({
        email: "admin@crosswms.com.br",
        password: hashedPassword,
        nome: "Administrador do Sistema",
        telefone: "(11) 99999-9999",
        empresa_id: empresa.id,
        perfil_id: perfil.id,
        status: "active"
      });
      console.log('✅ Usuário administrador criado:', user.email);
    } else {
      console.log('ℹ️ Usuário administrador já existe');
    }

    console.log('🎉 Seed concluído com sucesso!');
    console.log('📧 Email: admin@crosswms.com.br');
    console.log('🔑 Senha: 123456');

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}