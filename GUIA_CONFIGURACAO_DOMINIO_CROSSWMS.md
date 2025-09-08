# 🌐 Configuração Domínio www.crosswms.com.br

## ✅ Informações do Projeto
- **Projeto Replit**: `workspace.leonardobandei1.repl.co` (URL simplificada)
- **Domínio Desejado**: `www.crosswms.com.br`
- **Redirecionamento**: `crosswms.com.br` → `www.crosswms.com.br`

---

## 📋 PASSO 1: Configurar DNS na Hostgator

### 1.1 Acessar Painel Hostgator
1. Entre no **cPanel da Hostgator**
2. Procure por **"Zone Editor"** ou **"Editor de Zona DNS"**
3. Localize o domínio **crosswms.com.br**

### 1.2 Adicionar Registros DNS
Você precisa adicionar EXATAMENTE estes 2 registros:

#### Registro 1 - CNAME para www
```
Tipo: CNAME
Nome: www
Destino: crosswms.leonardobandei1.repl.co
TTL: 14400 (ou deixar padrão)
```

**ALTERNATIVA SIMPLES** (se você renomear o projeto):
```
Tipo: CNAME
Nome: www
Destino: crosswms.leonardobandei1.repl.co
TTL: 14400
```

#### Registro 2 - A para raiz
```
Tipo: A
Nome: @ (ou deixar vazio)
IP: 35.190.73.45
TTL: 14400 (ou deixar padrão)
```

### 1.3 Salvar Configurações
- Clique em **"Salvar"** ou **"Add Record"**
- Aguarde confirmação de que os registros foram criados

---

## 🚀 PASSO 2: Deploy no Replit

### 2.1 Fazer Deploy
1. No Replit, clique no botão **"Deploy"** (canto superior direito)
2. Escolha **"Autoscale"** como tipo de deployment
3. Aguarde o build completar (2-5 minutos)
4. Anote a URL gerada

### 2.2 Configurar Domínio Personalizado
1. Após o deploy, vá em **"Deployments"**
2. Clique em **"Settings"** ou **"Configurações"**
3. Procure por **"Custom Domain"** ou **"Domínio Personalizado"**
4. Adicione: **www.crosswms.com.br**
5. Clique em **"Add Domain"** ou **"Adicionar Domínio"**

### 2.3 Aguardar Verificação SSL
- O Replit irá verificar o DNS (pode levar 5-30 minutos)
- Após verificação, o SSL será configurado automaticamente
- Você verá status "Active" quando pronto

---

## ⏰ TEMPO DE PROPAGAÇÃO

### DNS (Hostgator)
- **Mínimo**: 2 horas
- **Máximo**: 6 horas
- **Comum**: 2-4 horas

### SSL (Replit)
- **Após DNS ativo**: 5-15 minutos
- **Status**: Visível no painel Deployments

---

## ✅ VERIFICAÇÃO FINAL

### Testes para Fazer
1. **Aguardar 2-4 horas** após configurar DNS
2. Acessar `https://www.crosswms.com.br`
3. Testar se `https://crosswms.com.br` redireciona
4. Verificar certificado SSL (cadeado verde)

### URLs Finais
- **Produção**: https://www.crosswms.com.br
- **Desenvolvimento**: URL atual do Replit
- **Redirect**: crosswms.com.br → www.crosswms.com.br

---

## 🔧 STATUS TÉCNICO

### Servidor Já Configurado ✅
- CORS para www.crosswms.com.br
- Redirect automático de raiz para www
- Suporte HTTPS completo
- Headers de segurança

### Próximos Passos
1. ✅ Layout navbar otimizado
2. 🔄 **AGORA**: Configurar DNS na Hostgator
3. 🔄 **DEPOIS**: Deploy no Replit
4. ⏳ **AGUARDAR**: Propagação DNS

---

## 📞 Suporte

**Se houver problemas:**
1. Verificar registros DNS no painel Hostgator
2. Aguardar tempo completo de propagação
3. Confirmar deploy bem-sucedido no Replit
4. Verificar logs no painel Deployments

**Sistema pronto para domínio próprio!**