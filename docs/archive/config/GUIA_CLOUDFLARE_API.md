# Guia: Como criar API Token do Cloudflare

## Passo a passo para interface em português:

### 1. Acessar Configurações de API
- Vá para: https://dash.cloudflare.com/profile/api-tokens
- Ou: Painel → Meu perfil → Tokens de API

### 2. Criar Novo Token
- Clique em **"Criar token"**
- Escolha **"Token personalizado"**

### 3. Configurar Permissões
Configure apenas estas 3 permissões essenciais:

```
Permissões do token:
├── Zona : Configurações da zona : Editar
├── Zona : DNS : Editar  
└── Zona : Regras de página : Editar
```

**Nota**: Se houver opção de "Limpeza de cache", adicione também (opcional).

### 4. Recursos da Zona
- **Inclui**: Todas as zonas
- Ou específico: crosswms.com.br

### 5. Configurações Adicionais (opcional)
- **Endereços IP do cliente**: Deixar em branco
- **TTL**: Deixar padrão

### 6. Gerar e Copiar Token
- Clique em **"Continuar para o resumo"**
- Revise as configurações
- Clique em **"Criar token"**
- **COPIE O TOKEN** (só aparece uma vez!)

## Após obter o token:

Execute no terminal do Replit:
```bash
node setup-cloudflare.js [SEU_TOKEN_AQUI]
```

## O que será configurado automaticamente:

1. **SSL/TLS** → Modo de criptografia: **Flexível**
2. **DNS** → Registros:
   - `www` → CNAME → Replit (proxy ativado)
   - `@` → CNAME → Replit (proxy ativado)
3. **Regras de página**:
   - `crosswms.com.br/*` → Redirecionamento 301 → `https://www.crosswms.com.br/$1`
4. **Cache** → Limpeza completa

## Tempo de propagação:
- DNS: 5-10 minutos
- SSL: Até 24 horas
- Cache: Imediato

## Verificação:
Após executar o script, teste:
- http://crosswms.com.br (deve redirecionar)
- https://www.crosswms.com.br (deve funcionar)