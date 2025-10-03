# 🔧 CORREÇÃO: URL Duplicada no Upload (Vercel)

## ❌ Problema Identificado

No frontend hospedado na Vercel, a URL estava duplicada:

```
❌ ERRADO: https://smartbi-backend-psi.vercel.app/api/api/upload
✅ CORRETO: https://smartbi-backend-psi.vercel.app/api/upload
```

### Causa Raiz

O código fazia um `replace` simples sem considerar que a Vercel já tem `/api/` no endpoint:

**Endpoints:**
- **Localhost:** `http://localhost:4000/graphql` → `http://localhost:4000/api/upload` ✅
- **Vercel:** `https://smartbi-backend-psi.vercel.app/api/graphql` → `https://smartbi-backend-psi.vercel.app/api/api/upload` ❌

**Código antigo:**
```typescript
const uploadEndpoint = this.endpoint.replace('/graphql', '/api/upload');
// Problema: no Vercel, /graphql vira /api/upload mas já tem /api/ antes!
```

## ✅ Solução Aplicada

Código agora detecta se é Vercel ou localhost:

```typescript
// Get REST API endpoint
// Handle both localhost and Vercel
let uploadEndpoint: string;
if (this.endpoint.includes('/api/graphql')) {
  // Vercel: replace /api/graphql with /api/upload
  uploadEndpoint = this.endpoint.replace('/api/graphql', '/api/upload');
} else {
  // Localhost: replace /graphql with /api/upload
  uploadEndpoint = this.endpoint.replace('/graphql', '/api/upload');
}
```

### Resultado:

| Ambiente | GraphQL Endpoint | Upload Endpoint | Status |
|----------|-----------------|-----------------|--------|
| **Localhost** | `http://localhost:4000/graphql` | `http://localhost:4000/api/upload` | ✅ |
| **Vercel** | `https://.../api/graphql` | `https://.../api/upload` | ✅ |

## ⚠️ PROBLEMA SECUNDÁRIO: CORS

Mesmo corrigindo a URL, você ainda vai encontrar erro CORS:

```
Access to fetch at 'https://smartbi-backend-psi.vercel.app/api/upload' 
from origin 'https://smartbi-rcs.vercel.app' has been blocked by CORS policy
```

### Por Que CORS?

O backend precisa **permitir** requisições do domínio do frontend.

### Solução CORS

No backend (`api/upload.ts`), adicione o domínio do frontend Vercel:

```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://smartbi-rcs.vercel.app',        // ✅ Adicione esta linha!
  'https://smartbi-rcs-*.vercel.app',      // ✅ Permite previews também
  process.env.FRONTEND_URL
].filter(Boolean);

// CORS headers
res.setHeader('Access-Control-Allow-Origin', origin);
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Credentials', 'true');
```

## 🧪 Testando Localmente

Antes de fazer deploy, teste localmente:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (simular build de produção)
cd frontend
npm run build
npm run preview
```

### Verificar URL no Console:

```
🔗 Upload endpoint: http://localhost:4000/api/upload ✅
📝 File type detected: CSV
```

Não deve ter `/api/api/` duplicado!

## 🚀 Deploy e Teste

### 1. Commit e Push da Correção:

```bash
git add src/services/graphqlService.ts
git commit -m "fix: corrige URL duplicada no upload para Vercel"
git push
```

### 2. Aguarde Deploy Automático:

- Vercel detecta push
- Faz build automaticamente
- Deploy em 2-3 minutos

### 3. Teste no Frontend Vercel:

1. Acesse: `https://smartbi-rcs.vercel.app`
2. Vá para página de Upload
3. Selecione arquivo CSV
4. Abra console (F12)
5. Verifique URL: `https://smartbi-backend-psi.vercel.app/api/upload` ✅

### 4. Se der erro CORS:

**Esperado!** Você precisa configurar CORS no backend.

#### Opção A: Configurar CORS no Backend (RECOMENDADO)

No arquivo `api/upload.ts` do backend, adicione o domínio Vercel.

#### Opção B: Usar Backend Local Temporariamente

No `.env` do frontend na Vercel:

```env
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

**Nota:** Isso só funciona se você estiver testando localmente. Para produção, CORS é obrigatório!

## 📋 Checklist de Correção

- [x] URL duplicada corrigida no código
- [x] Detecta Vercel vs Localhost automaticamente
- [x] Commit e push feitos
- [ ] Deploy na Vercel aguardando
- [ ] Teste da URL (deve ser `/api/upload` sem duplicação)
- [ ] **CORS precisa ser configurado no backend** ⚠️

## 🔍 Debug

### Como Verificar se a Correção Funcionou:

**No Console do Browser (F12):**

```javascript
// Antes (ERRADO):
🔗 Upload endpoint: https://smartbi-backend-psi.vercel.app/api/api/upload ❌

// Depois (CORRETO):
🔗 Upload endpoint: https://smartbi-backend-psi.vercel.app/api/upload ✅
```

### Se Continuar com `/api/api/`:

1. **Limpe cache do navegador:**
   - Ctrl + Shift + Delete
   - Ou hard reload: Ctrl + Shift + R

2. **Verifique o build:**
   - Certifique-se que o código foi buildado com a correção
   - Vercel → Deployments → Último deploy → Source

3. **Verifique variável de ambiente:**
   ```
   VITE_GRAPHQL_ENDPOINT=https://smartbi-backend-psi.vercel.app/api/graphql
   ```
   (Deve ter `/api/graphql` no final)

## 📊 Comparação: Antes vs Depois

### ANTES ❌

```typescript
// Código simples mas quebrava na Vercel
const uploadEndpoint = this.endpoint.replace('/graphql', '/api/upload');

// Resultado:
// Localhost: http://localhost:4000/api/upload ✅
// Vercel: https://.../api/api/upload ❌ (duplicado!)
```

### DEPOIS ✅

```typescript
// Detecta ambiente automaticamente
let uploadEndpoint: string;
if (this.endpoint.includes('/api/graphql')) {
  // Vercel
  uploadEndpoint = this.endpoint.replace('/api/graphql', '/api/upload');
} else {
  // Localhost
  uploadEndpoint = this.endpoint.replace('/graphql', '/api/upload');
}

// Resultado:
// Localhost: http://localhost:4000/api/upload ✅
// Vercel: https://.../api/upload ✅ (correto!)
```

## 🎯 Próximos Passos

1. ✅ **Correção aplicada** - URL não duplica mais
2. ⏳ **Aguardar deploy** - Vercel faz automaticamente
3. 🧪 **Testar upload** - Verificar URL no console
4. ⚠️ **Configurar CORS** - No backend, adicionar domínio Vercel
5. 🎉 **Upload funcionando** - Em produção!

## 🆘 Ajuda com CORS

Se você não tem acesso ao backend ou não sabe configurar CORS, veja o documento completo:

📄 **[CORS_ISSUE_SOLUTION.md](CORS_ISSUE_SOLUTION.md)**

Lá tem exemplos para:
- Node.js/Express
- Apollo Server
- Vercel (vercel.json)
- Testes com cURL

## ✅ Status Final

| Item | Status |
|------|--------|
| URL duplicada | ✅ Corrigido |
| Detecta Vercel/Localhost | ✅ Sim |
| Código commitado | ✅ Sim |
| Deploy aguardando | ⏳ Em progresso |
| CORS configurado | ⚠️ **Pendente no backend** |

---

**A URL está corrigida!** 🎉

Após o deploy, teste e configure CORS no backend para funcionar 100%.
