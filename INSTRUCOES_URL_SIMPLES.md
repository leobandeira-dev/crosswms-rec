# 🔗 Como Criar URL Mais Simples para CrossWMS

## 📋 SOLUÇÃO RECOMENDADA: Renomear Projeto no Replit

### Passo 1: Renomear no Replit
1. No Replit, clique no nome do projeto "workspace" (canto superior esquerdo)
2. Altere para: **crosswms**
3. Isso criará a URL: `crosswms.leonardobandei1.repl.co`

### Passo 2: Nova Configuração DNS (Mais Simples)
```
Tipo: CNAME
Nome: www
Destino: crosswms.leonardobandei1.repl.co
TTL: 14400
```

---

## 🎯 RESULTADO FINAL

### URLs Atuais vs Novas
**ANTES (muito longa):**
- `d7b15c31-81fe-4823-bdd9-7694ae6b8d2c-00-workspace.replit.app`

**DEPOIS (simples):**
- `crosswms.leonardobandei1.repl.co`

### Configuração DNS Final
```
# Registro 1 - CNAME
Tipo: CNAME
Nome: www
Destino: crosswms.leonardobandei1.repl.co
TTL: 14400

# Registro 2 - A Record
Tipo: A
Nome: @
Destino: 35.190.73.45
TTL: 14400
```

---

## ⚡ ALTERNATIVA RÁPIDA (Se não conseguir renomear)

Use a URL mais curta do Replit:
```
Tipo: CNAME
Nome: www
Destino: workspace.leonardobandei1.repl.co
TTL: 14400
```

Esta URL também funciona e é mais curta que a original.

---

## 🔄 PRÓXIMOS PASSOS

1. **Renomeie o projeto** no Replit para "crosswms"
2. **Configure DNS** com a URL mais simples
3. **Faça deploy** normalmente
4. **Aguarde propagação** (2-4 horas)

**URL final será:** https://www.crosswms.com.br