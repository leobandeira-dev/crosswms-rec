# 📊 Dados do Sistema - CrossWMS

Esta pasta contém arquivos de dados, exemplos e respostas de teste do sistema.

## 📁 Estrutura de Dados

### 🧪 Testes (`test/`)
Arquivos de dados para testes:
- `data.json` - Dados de exemplo do sistema
- `response.json` - Resposta de API de exemplo
- `response_new.json` - Nova resposta de API
- `response_individual.json` - Resposta individual
- `project-structure.json` - Estrutura do projeto

### 📚 Exemplos (`examples/`)
Arquivos de exemplo e assets anexados:
- `Pasted-XML-da-NF-e-para-Danfe-PDF-*.txt` - Documentação API conversão XML
- `Pasted-ConsultaNFe-Retorno-XML-*.txt` - Exemplos consulta NFe
- `Pasted--Exemplos-de-C-digo-Python-*.txt` - Exemplos código Python
- `Pasted-Product-Discovery-YMS-*.txt` - Descoberta de produto

### 🍪 Cookies (`cookies/`)
Arquivos de cookies para diferentes usuários:
- `cookies.txt` - Cookies gerais
- `cookies_cliente.txt` - Cookies cliente
- `cookies_fornecedor.txt` - Cookies fornecedor
- `cookies_superadmin.txt` - Cookies super admin
- `cookies_transportador.txt` - Cookies transportador

### 📝 Git (`git/`)
Arquivos relacionados ao controle de versão:
- `COMMIT_MESSAGE.txt` - Mensagem de commit padrão
- `git-commands.txt` - Comandos Git para upload

## 🔍 Como Usar

### Dados de Teste
```javascript
// Importar dados de teste
import testData from './data/test/data.json';
import apiResponse from './data/test/response.json';
```

### Estrutura do Projeto
```javascript
// Importar estrutura do projeto
import projectStructure from './data/test/project-structure.json';
```

## 📋 Tipos de Dados

### data.json
- Dados de exemplo para desenvolvimento
- Configurações padrão
- Estruturas de teste

### response*.json
- Respostas de API para testes
- Dados mockados
- Exemplos de integração

### project-structure.json
- Estrutura hierárquica do projeto
- Metadados de organização
- Referências de arquivos

## ⚠️ Importante

- **Não commite** dados sensíveis
- **Use .gitignore** para dados privados
- **Mantenha exemplos** atualizados
- **Documente** estruturas de dados

## 🔗 Dados Críticos (Raiz)

Estes arquivos **NÃO** devem ser movidos:
- `package.json` - Configuração do projeto
- `package-lock.json` - Lock das dependências
- `tsconfig.json` - Configuração TypeScript
- `components.json` - Configuração de componentes

---

*Mantenha esta documentação atualizada conforme novos dados são adicionados.*
