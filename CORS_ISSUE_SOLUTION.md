# 🚫 PROBLEMA CORS - Backend Vercel

## 🎯 O Problema Identificado

**Erro no Console:**
```
Access to fetch at 'https://smartbi-backend-psi.vercel.app/api/graphql' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Tradução:**
O backend no Vercel está **bloqueando requisições do navegador** por segurança (política CORS).

## 🔍 Por Que Funciona no Postman Mas Não no Browser?

| Aspecto | Postman | Browser (Frontend) |
|---------|---------|-------------------|
| **Verifica CORS** | ❌ Não | ✅ Sim |
| **Preflight Request** | ❌ Não envia | ✅ Envia OPTIONS |
| **Segurança** | Ferramenta de dev | Protege o usuário |
| **Funciona?** | ✅ Sim | ❌ Não (bloqueado) |

**Postman não faz verificação CORS** porque é uma ferramenta de desenvolvimento, não um navegador.

**Browser faz verificação CORS** para proteger contra ataques maliciosos.

## 🛠️ Solução 1: Configurar CORS no Backend (RECOMENDADO)

O backend precisa adicionar headers CORS permitindo requisições do frontend.

### Para Node.js/Express:

```javascript
// No backend (Vercel)
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',      // Desenvolvimento
    'http://localhost:3000',      // Desenvolvimento alternativo
    'https://seu-dominio.com'     // Produção
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Para Apollo Server:

```javascript
const server = new ApolloServer({
  typeDefs,
  resolvers,
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://seu-dominio.com'
    ],
    credentials: true
  }
});
```

### Para Vercel (vercel.json):

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Credentials", "value": "true" },
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
        { "key": "Access-Control-Allow-Headers", "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" }
      ]
    }
  ]
}
```

**⚠️ Nota:** `"value": "*"` permite todas as origens. Para produção, especifique domínios:
```json
{ "key": "Access-Control-Allow-Origin", "value": "http://localhost:5173" }
```

## 🛠️ Solução 2: Usar Proxy (Temporário)

Se não pode modificar o backend imediatamente, use um proxy local.

### Adicione ao vite.config.ts:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://smartbi-backend-psi.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
});
```

**Depois, mude o endpoint no .env:**
```env
# Em vez de:
# VITE_GRAPHQL_ENDPOINT=https://smartbi-backend-psi.vercel.app/api/graphql

# Use:
VITE_GRAPHQL_ENDPOINT=/api/graphql
```

Agora o Vite vai fazer proxy das requisições, evitando CORS.

## 🛠️ Solução 3: Backend Local (Desenvolvimento)

**Método mais simples para desenvolvimento:**

1. Clone o repositório do backend
2. Execute localmente:
   ```bash
   npm install
   npm run dev
   ```
3. Use endpoint local no .env:
   ```env
   VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
   ```

**Vantagens:**
- ✅ Sem problemas CORS
- ✅ Debug mais fácil
- ✅ Mais rápido (sem latência de rede)
- ✅ Pode modificar código backend

## 📋 Checklist de Configuração CORS

Use este checklist para verificar se o backend está configurado corretamente:

### Backend Vercel:

- [ ] Adicionar middleware CORS
- [ ] Configurar origens permitidas (localhost + produção)
- [ ] Permitir credentials: true
- [ ] Permitir headers: Content-Type, Authorization
- [ ] Permitir methods: GET, POST, OPTIONS
- [ ] Testar com curl:
  ```bash
  curl -i -X OPTIONS \
    -H "Origin: http://localhost:5173" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    https://smartbi-backend-psi.vercel.app/api/graphql
  ```
- [ ] Verificar response headers:
  - Access-Control-Allow-Origin
  - Access-Control-Allow-Methods
  - Access-Control-Allow-Headers
  - Access-Control-Allow-Credentials

### Frontend:

- [ ] .env configurado com endpoint correto
- [ ] graphqlService.ts detecta erro CORS (já implementado ✅)
- [ ] Fallback para localhost se CORS falhar (opcional)

## 🔍 Como Detectar Erro CORS

### No Console do Browser:

```
🚫 ERRO CORS DETECTADO!
⚠️ O backend no Vercel não permite requisições do navegador
💡 Solução: Configure CORS no backend ou use endpoint localhost
📍 Endpoint atual: https://smartbi-backend-psi.vercel.app/api/graphql
```

### No Network Tab:

1. Abra DevTools (F12)
2. Vá para a aba **Network**
3. Procure por requisição para `/api/graphql`
4. Status: **(failed)** ou **net::ERR_FAILED**
5. Tipo: **preflight** (OPTIONS) ou **graphql** (POST)
6. Headers → Response Headers: **Sem** `Access-Control-Allow-Origin`

## 📊 Comparação de Soluções

| Solução | Dificuldade | Tempo | Recomendado Para |
|---------|-------------|-------|------------------|
| **1. CORS Backend** | Média | 30 min | ✅ Produção |
| **2. Proxy Vite** | Baixa | 5 min | ⚠️ Dev temporário |
| **3. Backend Local** | Baixa | 10 min | ✅ Desenvolvimento |

## 🎯 Recomendação

### Para Desenvolvimento:
1. **Curto prazo:** Use backend local (Solução 3)
2. **Médio prazo:** Configure proxy Vite (Solução 2)

### Para Produção:
1. **Obrigatório:** Configure CORS no backend (Solução 1)
2. Deploy frontend no mesmo domínio do backend (evita CORS)

## 🐛 Troubleshooting

### "Configurei CORS mas ainda não funciona"

**Possíveis causas:**

1. **Cache do browser**
   - Solução: Ctrl + Shift + R (hard reload)

2. **Preflight request não configurado**
   - Solução: Permitir método OPTIONS

3. **Credentials não configurado**
   - Solução: `credentials: true` no backend

4. **Wildcard com credentials**
   - Erro: `origin: '*'` + `credentials: true` não funciona
   - Solução: Especifique origens: `['http://localhost:5173']`

5. **Vercel não aplicou mudanças**
   - Solução: Force redeploy no Vercel

### "Funciona no Postman mas não no browser"

✅ **Normal!** Isso confirma que é problema CORS.

Postman não verifica CORS, browser sim.

### "Erro 403 Forbidden"

Diferente de CORS. Backend está bloqueando a requisição por outro motivo (auth, rate limit, etc).

### "Erro 404 Not Found"

Endpoint errado. Verifique URL no .env.

## 📚 Recursos

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vercel: Headers Configuration](https://vercel.com/docs/projects/project-configuration#headers)
- [Apollo Server: CORS](https://www.apollographql.com/docs/apollo-server/security/cors/)
- [Express CORS](https://expressjs.com/en/resources/middleware/cors.html)

## ✅ Status Atual

- ✅ Erro CORS detectado automaticamente no frontend
- ✅ Mensagem clara no console explicando o problema
- ✅ Não tenta retry em caso de CORS (inútil)
- ⏳ **Aguardando:** Configuração CORS no backend Vercel
- 🔄 **Workaround temporário:** Use backend local

## 🚀 Próximos Passos

1. Configurar CORS no backend Vercel (Solução 1)
2. Ou usar backend local durante desenvolvimento (Solução 3)
3. Testar novamente com endpoint corrigido
4. Verificar que dados carregam corretamente
