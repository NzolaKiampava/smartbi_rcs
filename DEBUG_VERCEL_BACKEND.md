# 🔍 GUIA DE DEBUG: Backend Vercel vs Postman

## 🎯 Situação Atual

- ✅ **Postman:** Funciona perfeitamente com o backend do Vercel
- ❌ **Frontend (Navegador):** Não mostra dados com o backend do Vercel
- ✅ **Frontend (Localhost):** Provavelmente funciona

## 🕵️ Passos para Identificar o Problema

### 1. Abra o Console do Navegador (F12)

Vá para a aba **Console** e procure por estes logs:

#### ✅ Logs de Sucesso (o que você DEVE ver):
```
🔗 GraphQL Endpoint configurado: https://smartbi-backend-psi.vercel.app/api/graphql
📡 GraphQL Request (tentativa 1/2): {endpoint: ..., hasAuth: true, queryType: "query"}
📥 GraphQL Response: {status: 200, statusText: "OK", ok: true}
📦 Resposta GraphQL completa: {hasData: true, hasErrors: false, dataKeys: [...], errorCount: 0}
✅ GraphQL Request bem-sucedida
📊 Query History recebido: {totalItems: 5, isEmpty: false, firstItem: {...}}
```

#### ❌ Logs de Erro (o que NÃO deve ver):
```
❌ Erro HTTP: {status: 500, errorText: "..."}
❌ Erros GraphQL: [...]
❌ Nenhum dado recebido do servidor
❌ Tentativa 1 falhou: ...
```

### 2. Verifique a Aba Network (F12 → Network)

1. Filtre por **Fetch/XHR**
2. Procure pela requisição para `graphql`
3. Clique na requisição
4. Veja:

#### Headers:
```
Request URL: https://smartbi-backend-psi.vercel.app/api/graphql
Request Method: POST
Status Code: 200 OK (ou 4xx/5xx se houver erro)

Request Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbG... (se logado)
```

#### Payload (Request):
```json
{
  "query": "query GetAllQueryHistory { getAIQueryHistoryPublic { id naturalQuery ... } }",
  "variables": null
}
```

#### Response (Resposta):
```json
{
  "data": {
    "getAIQueryHistoryPublic": [
      {
        "id": "123",
        "naturalQuery": "...",
        ...
      }
    ]
  }
}
```

### 3. Compare com o Postman

No Postman que funciona, veja:
- Headers enviados
- Body da requisição
- Resposta recebida

Compare com o que o navegador está enviando.

## 🐛 Problemas Comuns

### Problema 1: CORS Error

**Sintoma:**
```
Access to fetch at '...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Causa:** Backend Vercel não tem CORS configurado para aceitar requisições do seu domínio

**Solução:** Backend precisa adicionar headers CORS:
```typescript
// No backend
res.setHeader('Access-Control-Allow-Origin', '*'); // ou seu domínio específico
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### Problema 2: Token JWT Diferente

**Sintoma:** Postman funciona mas navegador não

**Causa:** Token diferente sendo usado

**Verificação:**
```javascript
// No console do navegador (F12)
console.log('Token no navegador:', localStorage.getItem('accessToken'));
```

Compare com o token que você usa no Postman

### Problema 3: Preflight Request Falhando

**Sintoma:** Vê duas requisições: OPTIONS e POST, mas OPTIONS falha

**Causa:** Backend não responde corretamente ao OPTIONS (preflight CORS)

**Solução:** Backend deve responder ao OPTIONS:
```typescript
if (req.method === 'OPTIONS') {
  res.status(200).end();
  return;
}
```

### Problema 4: Resposta Vazia (200 OK mas sem dados)

**Sintoma:** 
- Status: 200 OK ✅
- Mas response.data é null ou vazio

**Verificação no Console:**
```
📦 Resposta GraphQL completa: {hasData: false, ...}
📊 Query History recebido: {totalItems: 0, isEmpty: true, firstItem: null}
```

**Causa:** Backend retornou resposta mas sem dados

**Possíveis razões:**
1. Empresa "demo" não existe no banco de dados do Vercel
2. Não há queries no histórico
3. Query GraphQL diferente entre Postman e frontend

### Problema 5: Headers Diferentes

**Verificação:** Compare headers entre Postman e Network tab

**Postman:**
```
Content-Type: application/json
Authorization: Bearer abc123...
```

**Navegador (deveria ser o mesmo):**
```
Content-Type: application/json
Authorization: Bearer abc123...
```

Se faltarem headers, verifique o código do `graphqlService.ts`

## 📋 Checklist de Debug

Execute na ordem:

- [ ] 1. Abrir Console (F12)
- [ ] 2. Recarregar a página QueryHistory
- [ ] 3. Procurar por logs com emojis (🔗 📡 📥 📦 ✅ ❌)
- [ ] 4. Anotar o que aparece (copiar e colar os logs)
- [ ] 5. Abrir Network tab (F12 → Network)
- [ ] 6. Recarregar a página novamente
- [ ] 7. Filtrar por "graphql" ou "Fetch/XHR"
- [ ] 8. Clicar na requisição do graphql
- [ ] 9. Ver Headers → Request Headers
- [ ] 10. Ver Payload → Request
- [ ] 11. Ver Response → Response
- [ ] 12. Comparar com Postman
- [ ] 13. Anotar as diferenças

## 🔧 Testes Adicionais

### Teste 1: Comparar Query String

**Postman:**
```json
{
  "query": "query GetAllQueryHistory { getAIQueryHistoryPublic { id naturalQuery generatedQuery status executionTime error createdAt results { data } } }"
}
```

**Frontend (veja no Network):**
Deve ser EXATAMENTE igual!

### Teste 2: Verificar se Há Dados no Backend

Execute no Postman:
```graphql
query TestConnection {
  getDataConnectionsPublic {
    id
    name
  }
  getAIQueryHistoryPublic {
    id
    naturalQuery
  }
}
```

Se retornar vazio, significa que o banco de dados do Vercel não tem dados!

### Teste 3: Tentar Sem Token

No `graphqlService.ts`, temporariamente comente:
```typescript
// if (token) {
//   headers['Authorization'] = `Bearer ${token}`;
// }
```

Isso força a não enviar token. Se funcionar, o problema é o token!

## 💡 Próximos Passos Dependendo do Resultado

### Se Console mostra "✅ Request bem-sucedida" mas página vazia:

→ Problema no componente React, não na requisição
→ Verificar `QueryHistoryPage.tsx` se está renderizando os dados

### Se Console mostra "❌ Erro HTTP: 500":

→ Problema no backend
→ Verificar logs do backend no Vercel

### Se Console mostra "❌ CORS error":

→ Backend precisa configurar CORS
→ Adicionar headers CORS no backend

### Se Console mostra "hasData: false":

→ Backend retornou sucesso mas sem dados
→ Verificar se empresa "demo" existe
→ Verificar se há queries no histórico

### Se Network mostra Status 200 e dados corretos:

→ Frontend recebeu os dados corretamente
→ Problema pode ser no estado do React ou renderização
→ Verificar useState e useEffect no componente

## 📞 Informações Importantes para Reportar

Se o problema persistir, forneça:

1. **Logs do Console** (copie todo o output com os emojis)
2. **Screenshot do Network tab** (Headers + Response)
3. **Token usado** (primeiros 20 caracteres: `localStorage.getItem('accessToken').substring(0, 20)`)
4. **Endpoint** (do console: 🔗 GraphQL Endpoint configurado: ...)
5. **Comparação Postman vs Browser** (o que é diferente?)
