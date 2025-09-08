# Configuração Domínio www.crosswms.com.br na Hostgator

## ⚡ Resumo Rápido
1. **DNS na Hostgator**: Adicionar CNAME para www + A para @
2. **Deploy no Replit**: Fazer deploy e adicionar domínio personalizado
3. **Aguardar**: 2-6 horas para propagação DNS

---

## 📋 Passo 1: Configurar DNS na Hostgator

### Acessar cPanel Hostgator
1. Entre no painel da Hostgator
2. Localize **"Zone Editor"** ou **"Editor de Zona DNS"**
3. Encontre o domínio **crosswms.com.br**

### Adicionar Registros DNS
**Registro 1 - CNAME para www:**
```
Tipo: CNAME
Nome: www
Valor: d7b15c31-81fe-4823-bdd9-7694ae6b8d2c-00-workspace.replit.app
TTL: 14400
```

**Registro 2 - A para raiz:**
```
Tipo: A
Nome: @
Valor: 35.190.73.45
TTL: 14400
```

> **✅ CONFIGURADO**: URL do projeto identificada automaticamente

---

## 🚀 Passo 2: Deploy no Replit

### Fazer Deploy
1. No Replit, clique no botão **"Deploy"** (canto superior direito)
2. Aguarde o build completar (pode levar 2-5 minutos)
3. Anote a URL gerada (exemplo: meu-projeto.replit.app)

### Configurar Domínio Personalizado
1. Vá em **"Deployments"** > **"Settings"**
2. Na seção **"Custom Domain"**
3. Adicione: **www.crosswms.com.br**
4. Aguarde verificação SSL (5-15 minutos)

---

## ✅ Passo 3: Verificação

### Testes
- Acesse `https://www.crosswms.com.br`
- Teste se `https://crosswms.com.br` redireciona para www
- Verifique certificado SSL (cadeado verde)

### Tempo de Propagação
- **DNS**: 2-6 horas
- **SSL**: 5-15 minutos após DNS ativo

---

## 🔧 Configuração Técnica Atual

### Servidor Configurado
- ✅ CORS para www.crosswms.com.br
- ✅ Redirect automático de crosswms.com.br → www.crosswms.com.br
- ✅ Suporte a HTTPS
- ✅ Headers de segurança

### URLs Finais
- **Produção**: https://www.crosswms.com.br
- **Desenvolvimento**: URL atual do Replit
- **Redirect**: crosswms.com.br → www.crosswms.com.br

---

## 📞 Suporte

Se houver problemas:
1. Verifique se os registros DNS estão corretos
2. Aguarde tempo de propagação completo
3. Confirme se o deploy foi bem-sucedido
4. Verifique logs no painel do Replit

**Sistema pronto para produção!** 🎉