# 🚨 ANÁLISE CRÍTICA: Problema de Autenticação e Permissões

## Problema Identificado

Você está logado como **SUPER_ADMIN** mas não consegue ver os dados porque:

### 1. ❌ Frontend Usa Endpoints Públicos (Sem Autenticação)

O frontend (`graphqlService.ts`) está usando queries **PUBLIC** que:
- ✅ Não requerem autenticação
- ❌ **SEMPRE retornam dados da empresa "demo"** (hardcoded)
- ❌ **IGNORAM completamente o token de autenticação**
- ❌ **IGNORAM a empresa do usuário logado**

**Evidência no backend (`data-query.resolvers.ts` linha 91-103):**
```typescript
getDataConnectionsPublic: async (...) => {
  // Sempre busca da empresa "demo"!
  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', 'demo')  // ⚠️ HARDCODED!
    .single();
    
  // Busca conexões APENAS da empresa demo
  const { data: connections } = await supabase
    .from('data_connections')
    .select('*')
    .eq('company_id', companies.id)  // ⚠️ Sempre da empresa demo!
}
```

### 2. ✅ Backend Tem Endpoints Autenticados (Mas Frontend Não Usa)

O backend TEM queries corretas que:
- ✅ Verificam autenticação
- ✅ Usam o `companyId` do usuário logado
- ✅ Respeitam permissões SUPER_ADMIN
- ❌ **MAS o frontend NUNCA as chama!**

**Exemplos de queries corretas no backend:**
```typescript
getDataConnections: async (..., context: GraphQLContext) => {
  const { user } = ensureAuthenticated(context);  // ✅ Verifica auth
  return await service.getDataConnections(user.companyId);  // ✅ Usa empresa do usuário
}

getAIQueryHistory: async (..., context: GraphQLContext) => {
  const { user } = ensureAuthenticated(context);  // ✅ Verifica auth
  return await service.getAIQueryHistory(user.companyId, limit);  // ✅ Usa empresa do usuário
}
```

## 🔄 Mapeamento: Frontend → Backend

| Frontend (graphqlService.ts) | Backend Atual (Público) | Backend Correto (Autenticado) | Status |
|------------------------------|------------------------|------------------------------|--------|
| `getDataConnectionsPublic` | ✅ Funciona (demo only) | `getDataConnections` | ❌ Não usado |
| `getAIQueryHistoryPublic` | ✅ Funciona (demo only) | `getAIQueryHistory` | ❌ Não usado |
| `executeAIQueryPublic` | ✅ Funciona (demo only) | `executeAIQuery` | ❌ Não usado |
| `createDataConnectionPublic` | ✅ Funciona (demo only) | `createDataConnection` | ❌ Não usado |
| `deleteDataConnectionPublic` | ✅ Funciona (demo only) | `deleteDataConnection` | ❌ Não usado |

## 💥 Consequências do Problema

1. **Você faz login como SUPER_ADMIN** ✅
2. **Token JWT é armazenado corretamente** ✅
3. **Frontend envia token no header Authorization** ✅
4. **MAS as queries PUBLIC ignoram o token** ❌
5. **Backend sempre retorna dados da empresa "demo"** ❌
6. **Se sua empresa não for "demo", você vê lista vazia** ❌

## ✅ SOLUÇÃO

### Opção 1: Atualizar Frontend para Usar Queries Autenticadas (RECOMENDADO)

Mudar o `graphqlService.ts` para usar as queries corretas:

```typescript
// ❌ ERRADO (atual)
async getConnections(): Promise<Connection[]> {
  const query = `
    query GetConnections {
      getDataConnectionsPublic {  // ⚠️ Sempre retorna empresa demo!
        ...
      }
    }
  `;
}

// ✅ CORRETO (proposto)
async getConnections(): Promise<Connection[]> {
  const query = `
    query GetConnections {
      getDataConnections {  // ✅ Usa empresa do usuário logado
        ...
      }
    }
  `;
}
```

**Vantagens:**
- ✅ Respeita autenticação
- ✅ Cada usuário vê dados da sua empresa
- ✅ SUPER_ADMIN pode acessar todas as empresas
- ✅ Seguro e correto

**Desvantagens:**
- ⚠️ Requer login válido (mas isso é o correto!)

### Opção 2: Modificar Queries Públicas para Aceitar Empresa (NÃO RECOMENDADO)

Modificar as queries públicas para aceitar `companySlug` como parâmetro.

**Desvantagens:**
- ❌ Inseguro (qualquer um pode acessar dados de qualquer empresa)
- ❌ Não usa autenticação JWT
- ❌ Não é escalável

## 📋 Checklist de Correção

- [ ] Atualizar `graphqlService.ts` para usar queries autenticadas
- [ ] Remover sufixo "Public" de todas as queries
- [ ] Testar login como SUPER_ADMIN
- [ ] Verificar se dados da empresa correta aparecem
- [ ] Remover ou proteger endpoints públicos no backend

## 🔒 Queries que Precisam Ser Alteradas no Frontend

1. `getDataConnectionsPublic` → `getDataConnections`
2. `getAIQueryHistoryPublic` → `getAIQueryHistory`
3. `getAIQueryPublic` → `getAIQuery`
4. `executeAIQueryPublic` → `executeAIQuery`
5. `createDataConnectionPublic` → `createDataConnection`
6. `updateDataConnectionPublic` → `updateDataConnection`
7. `deleteDataConnectionPublic` → `deleteDataConnection`
8. `deleteAIQueryPublic` → `deleteAIQuery`
9. `deleteMultipleAIQueriesPublic` → `deleteMultipleAIQueries`
10. `clearAIQueryHistoryPublic` → `clearAIQueryHistory`

## 🎯 Resultado Esperado Após Correção

1. ✅ Login como SUPER_ADMIN funciona
2. ✅ Token JWT é enviado e validado
3. ✅ Backend identifica o usuário e empresa
4. ✅ Dados da empresa correta são retornados
5. ✅ SUPER_ADMIN pode ver dados de todas as empresas
6. ✅ Usuários regulares veem apenas dados da sua empresa
7. ✅ Segurança e permissões funcionam corretamente
