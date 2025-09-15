# Configuração do Supabase para o CrossWMS com Drizzle ORM

Este documento contém instruções para configurar e utilizar o Supabase como banco de dados para o sistema CrossWMS, integrado com Drizzle ORM.

## Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Node.js e npm instalados
- Projeto CrossWMS clonado

## Passos para Configuração

### 1. Criar um Projeto no Supabase

1. Acesse [app.supabase.com](https://app.supabase.com) e faça login
2. Clique em "New Project"
3. Preencha os detalhes do projeto:
   - Nome: CrossWMS (ou outro nome de sua preferência)
   - Senha do banco de dados: crie uma senha forte
   - Região: escolha a mais próxima de você ou de seus usuários
4. Clique em "Create new project"

### 2. Configurar Variáveis de Ambiente

1. No painel do Supabase, vá para "Settings" > "API"
2. Copie a URL do projeto e a chave anônima (anon key)
3. Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```
# Configurações do Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima-do-supabase
```

### 3. Criar as Tabelas no Supabase

Você pode criar as tabelas de duas maneiras:

#### Opção 1: Usando o Editor SQL do Supabase

1. No painel do Supabase, vá para "SQL Editor"
2. Crie um novo script
3. Cole o seguinte SQL para criar as tabelas principais (adapte conforme necessário):

```sql
-- Criação das tabelas principais
CREATE TABLE IF NOT EXISTS public.app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  nome VARCHAR NOT NULL,
  empresa_id UUID,
  perfil_id UUID,
  status VARCHAR DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cnpj VARCHAR NOT NULL UNIQUE,
  razao_social VARCHAR NOT NULL,
  nome_fantasia VARCHAR,
  endereco TEXT,
  telefone VARCHAR,
  email VARCHAR,
  tipo VARCHAR,
  status VARCHAR DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Opção 2: Usando Drizzle para Gerar SQL

Você pode usar o Drizzle ORM para gerar SQL a partir do schema definido:

1. Certifique-se de que as variáveis de ambiente estão configuradas
2. Execute o comando para gerar o SQL a partir do schema:

```bash
npx drizzle-kit generate
```

3. Os arquivos SQL gerados estarão na pasta `./migrations`
4. Execute os scripts SQL gerados no Editor SQL do Supabase

Alternativamente, você pode criar um script para gerar SQL:

```javascript
// generate-sql.js
import fs from 'fs';
import * as schema from './shared/schema-supabase.js';

// Função simples para gerar SQL básico a partir do schema
function generateSQL() {
  let sql = '';
  
  // Adicione cada tabela ao SQL
  for (const [tableName, table] of Object.entries(schema)) {
    if (table && typeof table === 'object' && table.name) {
      sql += `-- Criando tabela ${table.name}\n`;
      sql += `CREATE TABLE IF NOT EXISTS ${table.name} (\n`;
      // Aqui você precisaria adicionar lógica para gerar as colunas
      sql += `);\n\n`;
    }
  }
  
  return sql;
}

const sql = generateSQL();
fs.writeFileSync('schema.sql', sql);
console.log('SQL gerado com sucesso!');
```

### 4. Inicializar o Banco de Dados com Dados Padrão

Para inicializar o banco de dados com dados padrão (empresa, perfil de administrador, usuário admin) usando Drizzle ORM:

```bash
node -r dotenv/config setup-supabase.js
```

Este script utilizará o Drizzle ORM para criar:
- Uma empresa padrão
- Um perfil de administrador
- Um usuário administrador (admin@crosswms.com / admin123)
- Um usuário transportador para testes (transporte@teste.com / transporte123)

## Usando o Supabase no Projeto com Drizzle ORM

### Importando as Funções de Acesso ao Banco

```javascript
// Exemplo de como usar as funções de acesso ao banco com Drizzle
import { getAll, getById, insert, update, remove } from './server/supabase-db';
import { schema } from './shared/schema-supabase';

// Buscar todos os usuários
async function buscarUsuarios() {
  const { data, error } = await getAll(schema.users);
  if (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
  return data;
}

// Buscar usuário por ID
async function buscarUsuarioPorId(id) {
  const { data, error } = await getById(schema.users, id);
  if (error) {
    console.error(`Erro ao buscar usuário com ID ${id}:`, error);
    return null;
  }
  return data;
}

// Inserir novo usuário
async function inserirUsuario(usuario) {
  const { data, error } = await insert(schema.users, usuario);
  if (error) {
    console.error('Erro ao inserir usuário:', error);
    return null;
  }
  return data[0];
}

// Exemplo usando o cliente Drizzle diretamente
import { db } from './server/supabase';
import { eq } from 'drizzle-orm';

async function exemploUsandoDrizzle() {
  // Buscar todos os usuários
  const usuarios = await db.query.users.findMany();
  
  // Buscar usuário por ID
  const usuario = await db.query.users.findFirst({
    where: eq(schema.users.id, 'id-do-usuario')
  });
  
  // Inserir novo usuário
  const [novoUsuario] = await db.insert(schema.users)
    .values({
      email: 'novo@exemplo.com',
      password: 'senha-hash',
      nome: 'Novo Usuário'
    })
    .returning();
    
  return { usuarios, usuario, novoUsuario };
}

// Exemplo usando o cliente Supabase diretamente (alternativa ao Drizzle)
import { supabaseClient } from './server/supabase';

async function exemploClienteDireto() {
  // Buscar todos os usuários
  const { data: usuarios, error } = await supabaseClient
    .from('app_users')
    .select('*');
    
  // Buscar um usuário específico
  const { data: usuario, error: userError } = await supabaseClient
    .from('app_users')
    .select('*')
    .eq('id', 'id-do-usuario')
    .single();
    
  // Inserir novo usuário
  const { data: novoUsuario, error: insertError } = await supabaseClient
    .from('app_users')
    .insert({
      email: 'novo@exemplo.com',
      password: 'senha-hash',
      nome: 'Novo Usuário'
    })
    .select()
    .single();
    
  return { usuarios, usuario, novoUsuario };
}
```

### Testando a Conexão

Para testar se a conexão com o Supabase está funcionando corretamente:

```javascript
// Teste usando o cliente Supabase diretamente
import { supabaseClient } from './server/supabase';

async function testarConexaoSupabase() {
  try {
    const { data, error } = await supabaseClient
      .from('empresas')
      .select('*')
      .limit(1);
      
    if (error) throw error;
    console.log('Conexão com o Supabase estabelecida com sucesso!');
    console.log('Dados recuperados:', data);
    return true;
  } catch (error) {
    console.error('Erro ao conectar com o Supabase:', error);
    return false;
  }
}

// Teste usando o Drizzle ORM
import { db } from './server/supabase';
import { schema } from './shared/schema-supabase';

async function testarConexaoDrizzle() {
  try {
    const empresas = await db.query.empresas.findMany({
      limit: 1
    });
    
    console.log('Conexão com o Drizzle estabelecida com sucesso!');
    console.log('Dados recuperados:', empresas);
    return true;
  } catch (error) {
    console.error('Erro ao conectar com o Drizzle:', error);
    return false;
  }
}

// Execute ambos os testes
testarConexaoSupabase();
testarConexaoDrizzle();
```

## Recursos Adicionais do Supabase com Drizzle

O Supabase oferece vários recursos além do banco de dados PostgreSQL, e com a integração do Drizzle ORM, você tem ainda mais flexibilidade:

### Recursos do Supabase

- **Autenticação**: O Supabase oferece um sistema de autenticação completo que pode ser integrado ao projeto.
- **Storage**: Para armazenamento de arquivos.
- **Realtime**: Para atualizações em tempo real.
- **Edge Functions**: Para execução de código serverless.

### Vantagens do Drizzle ORM

- **Tipagem forte**: O Drizzle oferece tipagem TypeScript completa para suas consultas
- **Segurança contra SQL Injection**: As consultas são parametrizadas automaticamente
- **Migrations**: Geração e execução de migrações de banco de dados
- **Query Builder**: API fluente para construção de consultas complexas
- **Relações**: Suporte a relações entre tabelas (joins, etc.)

### Recursos Úteis

- [Documentação oficial do Supabase](https://supabase.com/docs)
- [Documentação do Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Exemplos de integração Drizzle + Supabase](https://orm.drizzle.team/docs/get-started-postgresql)