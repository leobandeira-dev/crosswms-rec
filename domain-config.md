# Configuração de Domínio Personalizado - www.crosswms.com.br

## Configurações DNS na Hostgator

Para conectar seu domínio www.crosswms.com.br ao Replit, configure os seguintes registros DNS no painel da Hostgator:

### 1. Registro CNAME para www (PRINCIPAL)
```
Tipo: CNAME
Nome: www
Valor: [SEU-REPL-NAME].replit.app
TTL: 14400 (4 horas)
```

### 2. Registro A para domínio raiz (REDIRECT)
```
Tipo: A
Nome: @
Valor: 35.190.73.45
TTL: 14400
```

**IMPORTANTE**: Substitua `[SEU-REPL-NAME]` pelo nome real do seu Repl no Replit (exemplo: crosswms-sistema.replit.app)

## Configuração no Replit

1. **Deploy da Aplicação**: Clique no botão "Deploy" no painel do Replit
2. **Configuração de Domínio**: 
   - Vá em Settings > Domains
   - Adicione www.crosswms.com.br como domínio personalizado
   - Adicione crosswms.com.br (sem www) como redirect
3. **Certificado SSL**: O Replit gerará automaticamente o certificado SSL gratuito

## URLs de Acesso
- Desenvolvimento: https://crosswms-com-br.replit.dev
- Produção: https://www.crosswms.com.br
- Redirect: https://crosswms.com.br → https://www.crosswms.com.br

## Passo a Passo Completo

### 1. No Painel Hostgator (cPanel):
1. **Acesse o cPanel** da sua conta Hostgator
2. **Localize "Zone Editor"** ou "Editor de Zona DNS"
3. **Encontre o domínio** crosswms.com.br na lista
4. **Adicione os registros DNS:**
   - **CNAME**: Nome = `www`, Valor = `[SEU-REPL-NAME].replit.app`
   - **A**: Nome = `@`, Valor = `35.190.73.45`
5. **Salve as alterações**
6. **Aguarde 2-6 horas** para propagação

### 2. No Replit (Deploy):
1. **Clique em "Deploy"** no painel superior do Replit
2. **Aguarde o build** da aplicação completar
3. **Acesse "Deployments" > "Settings"**
4. **Em "Custom Domain"** adicione: `www.crosswms.com.br`
5. **Aguarde verificação SSL** (5-15 minutos)

### 3. Teste Final:
- Acesse `https://www.crosswms.com.br`
- Verifique se `https://crosswms.com.br` redireciona para www
- Confirme certificado SSL (cadeado verde no navegador)

## Status da Configuração
- [x] Servidor configurado para suportar domínio personalizado
- [x] CORS configurado para www.crosswms.com.br
- [x] Redirect automático de crosswms.com.br para www.crosswms.com.br
- [ ] Deploy da aplicação no Replit
- [ ] Configuração DNS na Hostgator
- [ ] Adição do domínio no painel Replit
- [ ] Verificação SSL/HTTPS
- [ ] Teste de conectividade

## Informações Técnicas
- **SSL**: Automático via Let's Encrypt
- **CDN**: Incluído no Replit
- **Uptime**: 99.9% SLA do Replit
- **Protocolo**: HTTPS obrigatório
- **Redirect**: Automático de não-www para www