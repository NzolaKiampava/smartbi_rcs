# 🚀 Deploy do Frontend na Vercel

## 📋 Pré-requisitos

- [ ] Conta no GitHub (já tem ✅)
- [ ] Repositório no GitHub (smartbi_rcs já existe ✅)
- [ ] Conta na Vercel (criar se não tiver)
- [ ] Código commitado e pushed (fazer push das últimas alterações)

## 🎯 Método 1: Deploy via Dashboard Vercel (RECOMENDADO)

### Passo 1: Criar Conta na Vercel

1. Acesse: https://vercel.com
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize a Vercel a acessar seu GitHub

### Passo 2: Importar Projeto

1. No dashboard da Vercel, clique em **"Add New..."**
2. Selecione **"Project"**
3. Encontre o repositório **"smartbi_rcs"**
4. Clique em **"Import"**

### Passo 3: Configurar Build

A Vercel vai detectar automaticamente que é um projeto **Vite + React**.

**Configure assim:**

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### Passo 4: Configurar Variáveis de Ambiente

**IMPORTANTE!** Configure o endpoint do backend:

1. Clique em **"Environment Variables"**
2. Adicione:

```
Name: VITE_GRAPHQL_ENDPOINT
Value: https://smartbi-backend-psi.vercel.app/api/graphql
```

**⚠️ Nota:** Você precisará configurar CORS no backend primeiro (veja `CORS_ISSUE_SOLUTION.md`)

### Passo 5: Deploy!

1. Clique em **"Deploy"**
2. Aguarde 2-5 minutos
3. ✅ Seu site estará no ar!

**URL:** Algo como `https://smartbi-rcs.vercel.app`

## 🎯 Método 2: Deploy via CLI Vercel

### Passo 1: Instalar Vercel CLI

```powershell
npm install -g vercel
```

### Passo 2: Login

```powershell
vercel login
```

Escolha **GitHub** e autorize.

### Passo 3: Deploy

No diretório do projeto:

```powershell
# Deploy de produção
vercel --prod

# Ou apenas deploy (preview)
vercel
```

### Passo 4: Configurar Variáveis

```powershell
vercel env add VITE_GRAPHQL_ENDPOINT production
```

Quando perguntar o valor, digite:
```
https://smartbi-backend-psi.vercel.app/api/graphql
```

## 📁 Arquivos Necessários

### vercel.json (Opcional mas Recomendado)

Crie este arquivo na raiz do projeto:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

**O que isso faz:**
- ✅ Configura build automaticamente
- ✅ Habilita client-side routing (React Router funciona)
- ✅ Otimiza cache (assets nunca expiram, HTML sempre atualiza)

### .vercelignore (Opcional)

Crie este arquivo para ignorar arquivos no deploy:

```
node_modules
.git
.env.local
.DS_Store
*.log
.vscode
.idea
coverage
```

## 🔧 Configurações Avançadas

### Custom Domain

1. No dashboard da Vercel, vá em **Settings → Domains**
2. Adicione seu domínio customizado
3. Configure DNS conforme instruções

### Preview Deployments

Cada branch/PR gera um preview automático:
- **main** → Produção (`smartbi-rcs.vercel.app`)
- **feature/xxx** → Preview (`smartbi-rcs-git-feature-xxx.vercel.app`)

### Rollback

Se algo der errado:
1. Dashboard → Deployments
2. Encontre deploy anterior
3. Clique nos 3 pontos → **Promote to Production**

## ⚠️ Problemas Comuns

### Problema 1: Build Falha

**Erro:** `Command "npm run build" exited with 1`

**Causa:** Erros de TypeScript ou lint

**Solução:**
```powershell
# Teste localmente primeiro
npm run build

# Se falhar, corrija erros
npm run lint
npm run type-check
```

### Problema 2: Página em Branco

**Causa:** Caminho base incorreto

**Solução:** No `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/', // Certifique-se que está assim
  // ...
});
```

### Problema 3: 404 ao Recarregar Página

**Causa:** Client-side routing não configurado

**Solução:** Use o `vercel.json` com rewrites (veja acima)

### Problema 4: CORS Error

**Causa:** Backend não permite requisições do domínio Vercel

**Solução:** Configure CORS no backend para permitir:
```javascript
origin: [
  'http://localhost:5173',
  'https://smartbi-rcs.vercel.app', // Adicione seu domínio Vercel
  'https://smartbi-rcs-*.vercel.app' // Permite previews
]
```

### Problema 5: Variáveis de Ambiente Não Funcionam

**Causa:** Variáveis não começam com `VITE_`

**Solução:** Todas as variáveis de ambiente no Vite **DEVEM** começar com `VITE_`:
- ✅ `VITE_GRAPHQL_ENDPOINT`
- ❌ `GRAPHQL_ENDPOINT`

## 🔍 Verificação Pós-Deploy

### Checklist:

- [ ] Site carrega sem erro 404
- [ ] Console sem erros (F12)
- [ ] Login funciona
- [ ] Navegação entre páginas funciona
- [ ] Assets carregam (imagens, ícones)
- [ ] API conecta (verificar Network tab)
- [ ] PWA funciona (service worker registrado)
- [ ] Mobile responsivo

### Como Testar:

1. Abra a URL do deploy
2. F12 → Console (sem erros?)
3. F12 → Network (requisições funcionam?)
4. Teste login
5. Navegue entre páginas
6. Teste em mobile (F12 → Toggle device toolbar)

## 🚀 Deploy Automático (CI/CD)

A Vercel configura **deploy automático** para:

- ✅ Push na branch `main` → Deploy de produção
- ✅ Push em outras branches → Preview deploy
- ✅ Pull Requests → Preview deploy com comentário no PR

**Não precisa fazer nada!** Já está configurado automaticamente.

## 📊 Monitoramento

### Analytics (Gratuito)

1. Dashboard → Analytics
2. Veja: pageviews, tempo de carregamento, etc.

### Speed Insights (Gratuito)

1. Dashboard → Speed Insights
2. Veja: Core Web Vitals, performance

### Logs (Gratuito)

1. Dashboard → Deployments → [seu deploy]
2. Clique em **"View Function Logs"**
3. Veja erros em tempo real

## 💰 Custos

### Plano Hobby (Gratuito):
- ✅ 100 GB bandwidth/mês
- ✅ Deploys ilimitados
- ✅ Preview deployments
- ✅ HTTPS automático
- ✅ Custom domains
- ❌ Sem password protection
- ❌ Sem analytics avançado

**Suficiente para projetos pessoais!**

### Plano Pro ($20/mês):
- ✅ 1 TB bandwidth/mês
- ✅ Password protection
- ✅ Analytics avançado
- ✅ Edge functions
- ✅ Suporte prioritário

## 🔐 Segurança

### HTTPS

✅ **Automático!** Vercel gera certificado SSL grátis.

### Password Protection

**Plano Pro apenas**

1. Settings → General
2. Enable **"Password Protection"**
3. Defina senha

### Environment Variables

**Nunca** commite `.env` no Git!

Variáveis sensíveis (tokens, secrets) vão apenas na Vercel:
1. Dashboard → Settings → Environment Variables
2. Adicione lá

## 📱 PWA na Vercel

Seu projeto já tem PWA configurado (`vite-plugin-pwa`).

**Na Vercel funciona automaticamente:**
- ✅ Service Worker registrado
- ✅ Manifest disponível
- ✅ Offline mode
- ✅ Install prompt no mobile

**Teste:**
1. Abra site no Chrome mobile
2. Aparecerá banner "Add to Home Screen"
3. Instale e teste offline

## 🎨 Preview Deploy nos PRs

Quando criar um Pull Request:

1. Vercel comenta automaticamente no PR
2. Comentário tem link para preview
3. Cada commit gera novo preview
4. Colaboradores podem testar antes do merge

**Exemplo:**
```
✅ Preview: https://smartbi-rcs-git-feature-xxx.vercel.app
📊 Build: Successful in 2m 34s
```

## 📚 Recursos Úteis

- [Vercel Docs](https://vercel.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Custom Domains](https://vercel.com/docs/custom-domains)

## 🎯 Resumo Rápido

### Deploy em 5 Passos:

1. ✅ Push código para GitHub
2. ✅ Crie conta na Vercel (com GitHub)
3. ✅ Importe repositório `smartbi_rcs`
4. ✅ Configure `VITE_GRAPHQL_ENDPOINT` nas env vars
5. ✅ Clique em Deploy

**Pronto!** 🎉

### Após Deploy:

1. ⚠️ Configure CORS no backend para permitir seu domínio Vercel
2. ✅ Teste todas as funcionalidades
3. ✅ Configure domínio customizado (opcional)
4. ✅ Monitore analytics

## 🆘 Precisa de Ajuda?

**Logs de build:**
```
Dashboard → Deployments → [seu deploy] → Building
```

**Logs de runtime:**
```
Dashboard → Deployments → [seu deploy] → Functions
```

**Suporte Vercel:**
- https://vercel.com/support
- Discord: https://vercel.com/discord

## 🎉 Próximos Passos

Depois do deploy:

1. [ ] Configure CORS no backend (CRÍTICO)
2. [ ] Adicione domínio customizado (opcional)
3. [ ] Configure analytics
4. [ ] Teste PWA no mobile
5. [ ] Compartilhe o link! 🚀
