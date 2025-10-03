# 🚀 Deploy Rápido - 5 Minutos

## ✅ Pré-Requisitos Prontos

- ✅ Build testado e funcionando
- ✅ `vercel.json` configurado
- ✅ `.vercelignore` criado
- ✅ Repositório no GitHub

## 🎯 Passos para Deploy

### 1️⃣ Commit e Push (SE AINDA NÃO FEZ)

```powershell
git add .
git commit -m "chore: adiciona configuração Vercel para deploy"
git push
```

### 2️⃣ Acessar Vercel

1. Acesse: **https://vercel.com**
2. Clique em **"Sign Up"** ou **"Login"**
3. Escolha **"Continue with GitHub"**
4. Autorize a Vercel

### 3️⃣ Importar Projeto

1. No dashboard, clique em **"Add New..."**
2. Selecione **"Project"**
3. Procure por **"smartbi_rcs"**
4. Clique em **"Import"**

### 4️⃣ Configurar Build (Automático!)

A Vercel vai detectar automaticamente:

```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

**✅ Não precisa mudar nada!**

### 5️⃣ Configurar Variável de Ambiente

**IMPORTANTE!** Clique em **"Environment Variables"**

Adicione:

```
Name:  VITE_GRAPHQL_ENDPOINT
Value: https://smartbi-backend-psi.vercel.app/api/graphql
```

**⚠️ Nota:** Para funcionar, você precisa configurar CORS no backend (veja `CORS_ISSUE_SOLUTION.md`)

**Ou use localhost temporário:**

```
Name:  VITE_GRAPHQL_ENDPOINT
Value: http://localhost:4000/graphql
```

### 6️⃣ Deploy!

1. Clique em **"Deploy"**
2. ☕ Aguarde 2-5 minutos
3. 🎉 **Pronto!**

Você verá:
```
✅ Deployment Ready
Your site is live at: https://smartbi-rcs.vercel.app
```

## 🔍 Verificar Deploy

### Abra o site e verifique:

- [ ] Site carrega sem erro 404
- [ ] F12 → Console sem erros
- [ ] Páginas carregam
- [ ] Imagens aparecem
- [ ] Tentativa de login (pode dar erro CORS - normal!)

### Se der erro CORS:

**Normal!** Veja solução em `CORS_ISSUE_SOLUTION.md`

**Opções:**

1. **Configure CORS no backend** (melhor)
2. **Use backend local** (temporário)
3. **Aguarde** configuração CORS do backend

## 🎯 Próximos Deploys

Depois do primeiro deploy, **é automático!**

```powershell
git add .
git commit -m "feat: nova funcionalidade"
git push
```

✅ Vercel detecta o push e faz deploy automaticamente!

## 🆘 Problemas?

### Build falha na Vercel

**Causa:** Erros de lint ou TypeScript

**Solução:**
```powershell
npm run build  # Teste localmente
npm run lint   # Veja erros
```

### Página em branco

**Causa:** Variável de ambiente não configurada

**Solução:**
1. Dashboard → Settings → Environment Variables
2. Adicione `VITE_GRAPHQL_ENDPOINT`
3. Redeploy

### CORS Error

**Esperado!** Backend precisa permitir seu domínio Vercel.

Veja: `CORS_ISSUE_SOLUTION.md`

## 📱 Domínio Customizado (Opcional)

Depois do deploy:

1. Settings → Domains
2. Add Domain
3. Digite seu domínio
4. Configure DNS conforme instruções

## 🎉 Pronto!

Seu frontend estará online em:
```
https://smartbi-rcs.vercel.app
```

(ou nome diferente se já existir)

---

**📚 Guia completo:** Veja `VERCEL_DEPLOY_GUIDE.md`
