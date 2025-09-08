# Arquitetura Multi-Tenant Hierárquica (3 Níveis) - CrossWMS

## Problema Original
O usuário sugeriu adicionar em todas as tabelas:
- ID Transportador
- ID Cliente  
- ID Fornecedor

**Por que isso não é uma boa prática:**
- Redundância de dados em todas as tabelas
- Performance degradada com múltiplos índices
- Dificuldade de manutenção e escalabilidade
- Violação dos princípios de normalização

## Evolução da Solução: Arquitetura de 3 Níveis

### Necessidade Identificada
Transportadores grandes possuem múltiplas filiais (CNPJs diferentes) que operam no mesmo ambiente logístico.

### Estrutura Hierárquica Implementada
```
Super Admin (Sistema)
└── TransLog Brasil (Transportador Matriz)
    ├── TransLog SP (Filial Transportador)
    ├── TransLog RJ (Filial Transportador)
    ├── ABC Indústria (Cliente)
    ├── XYZ Comércio (Cliente)
    ├── DEF Materiais (Fornecedor)
    └── GHI Componentes (Fornecedor)
```

### Como Funciona

#### 1. Estrutura da Tabela Empresas (3 Níveis)
```sql
empresas:
  - id (PK)
  - nome
  - cnpj
  - tipo_empresa: 'sistema' | 'transportador' | 'filial_transportador' | 'cliente' | 'fornecedor'
  - empresa_matriz_id (FK -> empresas.id) -- Para filiais do transportador
  - grupo_empresarial_id (FK -> empresas.id) -- Raiz do tenant (transportador matriz)
  - status
```

#### 2. Isolamento Multi-Tenant por Níveis
- **Super Admin (sistema)**: Vê todos os transportadores
- **Transportador Matriz**: grupo_empresarial_id = NULL, é a raiz do tenant
- **Filial do Transportador**: grupo_empresarial_id = ID do transportador matriz
- **Cliente**: grupo_empresarial_id = ID do transportador matriz
- **Fornecedor**: grupo_empresarial_id = ID do transportador matriz

#### 3. Regras de Acesso por Tipo
```typescript
// Super Admin
isSuperAdmin: true // Vê todos os transportadores

// Transportador Matriz  
tipoUsuario: 'transportador'
// Vê: próprias filiais + todos clientes + todos fornecedores do grupo

// Filial do Transportador
tipoUsuario: 'filial_transportador' 
// Vê: própria empresa + todos clientes + todos fornecedores do grupo

// Cliente
tipoUsuario: 'cliente'
// Vê: própria empresa + fornecedores relacionados via documentos

// Fornecedor  
tipoUsuario: 'fornecedor'
// Vê: própria empresa + documentos onde aparecem
```

#### 4. Middleware de Tenant (3 Níveis)
Intercepta todas as requisições e:
1. Identifica a empresa do usuário logado
2. Determina o grupo empresarial (tenant root)
3. Aplica regras específicas por tipo de usuário
4. Retorna lista de empresas permitidas para filtros automáticos

#### 5. Isolamento de Dados por Cliente
**Implementação de Segurança Avançada**

Cada cliente só visualiza documentos onde aparece como remetente ou destinatário:

```typescript
// Métodos implementados no storage:
getNotasFiscaisForCliente(clienteId): NotaFiscal[]
// Retorna apenas notas onde cliente.cnpj = emitente OR destinatário

getSolicitacoesColetaForCliente(clienteId): SolicitacaoColeta[]  
// Retorna apenas solicitações relacionadas ao CNPJ do cliente

getCarregamentosForCliente(clienteId): Carregamento[]
// Retorna carregamentos que contém notas fiscais do cliente
```

**Endpoints Protegidos:**
- `/api/clientes/:clienteId/notas-fiscais`
- `/api/clientes/:clienteId/solicitacoes-coleta`  
- `/api/clientes/:clienteId/carregamentos`

**Validação de Acesso:**
- Cliente só acessa dados da própria empresa
- Transportador/Filial vê dados de todos os clientes do grupo
- Super Admin vê todos os dados

### Vantagens da Solução

1. **Performance**: Uma única coluna `empresa_id` nas tabelas operacionais
2. **Flexibilidade**: Fácil adicionar novos tipos de empresa
3. **Escalabilidade**: Suporta múltiplos níveis hierárquicos
4. **Manutenção**: Lógica centralizada no middleware
5. **Segurança**: Isolamento automático de dados por tenant

### Implementação Técnica

#### Middleware de Tenant (server/middleware/tenantMiddleware.ts)
```typescript
export const tenantMiddleware = async (req, res, next) => {
  // 1. Buscar empresa do usuário
  // 2. Determinar empresa matriz
  // 3. Listar todas empresas do tenant
  // 4. Adicionar informações ao req.tenant
}
```

#### Uso nas Rotas
```typescript
app.get('/api/notas-fiscais', tenantMiddleware, (req, res) => {
  // req.tenant.idsEmpresas contém todos os IDs do tenant
  // Filtrar automaticamente por empresas do tenant
});
```

### Exemplo Prático

**Empresa Matriz: TransLog Brasil (Transportador)**
- ID: "uuid-translog"
- empresa_matriz_id: null

**Filiais:**
- Cliente ABC Indústria: empresa_matriz_id = "uuid-translog"
- Fornecedor XYZ Ltda: empresa_matriz_id = "uuid-translog"

**Quando TransLog faz login:**
- Acesso a TODOS os dados (próprios + clientes + fornecedores)

**Quando Cliente ABC faz login:**
- Acesso apenas aos seus próprios dados
- Mas TransLog ainda vê todos os dados do ABC

### Tabelas Operacionais

Todas as tabelas operacionais precisam apenas de:
```sql
notas_fiscais:
  - id
  - empresa_id (FK -> empresas.id)
  - dados...

volumes:
  - id
  - empresa_id (FK -> empresas.id) 
  - dados...
```

O middleware automaticamente filtra por `empresa_id IN (idsDoTenant)`.

## Conclusão

Esta arquitetura hierárquica é:
- **Mais eficiente** que múltiplos IDs
- **Mais escalável** para crescimento
- **Mais manutenível** com lógica centralizada
- **Padrão da indústria** para sistemas multi-tenant

A implementação já está funcionando no sistema CrossWMS.