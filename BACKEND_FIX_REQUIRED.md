# 🔧 Backend Fix Required - Database Column Error

## 🚨 Erro Atual

```
Failed to get file uploads: column file_uploads.created_at does not exist
```

## 📋 Problema

O backend está tentando acessar `created_at` na tabela `file_uploads`, mas o schema correto usa `uploaded_at`.

## 🔍 Onde Corrigir

### Arquivo: `backend/src/database/file-analysis-database.service.ts`

Procure pelo método `getAllFileUploads()` e corrija qualquer referência a `created_at`:

**❌ ERRADO:**
```typescript
async getAllFileUploads(): Promise<FileUpload[]> {
  const { data, error } = await this.supabase
    .from('file_uploads')
    .select('*')
    .order('created_at', { ascending: false });  // ← ERRADO
    
  if (error) throw error;
  return data || [];
}
```

**✅ CORRETO:**
```typescript
async getAllFileUploads(): Promise<FileUpload[]> {
  const { data, error } = await this.supabase
    .from('file_uploads')
    .select('*')
    .order('uploaded_at', { ascending: false });  // ← CORRETO
    
  if (error) throw error;
  return data || [];
}
```

## 🗄️ Schema da Tabela (Referência)

De acordo com o schema GraphQL (`file-analysis.schema.ts`):

```graphql
type FileUpload {
  id: ID!
  filename: String!
  originalName: String!
  mimetype: String!
  encoding: String!
  size: Int!
  path: String!
  fileType: FileType!
  uploadedAt: DateTime!      # ← Este é o campo correto
  metadata: JSON
  analysisReport: AnalysisReport
}
```

A coluna no banco de dados Supabase é: `uploaded_at` (snake_case)

## 🔧 Outros Lugares Possíveis

Verifique também se há outras queries usando `created_at` nos seguintes arquivos:

1. `src/database/file-analysis-database.service.ts`
   - `getAllFileUploads()`
   - `getFileUploadsByDateRange()`
   - Qualquer método que faz ORDER BY ou WHERE com datas

2. `src/resolvers/file-analysis.resolvers.ts`
   - Método `getReportsByDateRange` (linha 132)

## ✅ Como Testar Após Correção

1. Faça deploy do backend corrigido
2. Teste a query GraphQL:

```graphql
query ListFiles {
  listFileUploads(limit: 10, offset: 0) {
    files {
      id
      originalName
      uploadedAt
    }
    total
    hasMore
  }
}
```

3. Verifique se não há mais erros de coluna inexistente

## 📝 Resumo da Correção

**Substituir em todos os arquivos do backend:**
- `created_at` → `uploaded_at` (quando referente a file_uploads)

**Arquivos a verificar:**
- ✅ `src/database/file-analysis-database.service.ts`
- ✅ `src/resolvers/file-analysis.resolvers.ts`
- ✅ Qualquer query SQL/Supabase que acessa file_uploads

---

**Status:** ⏳ Aguardando correção no backend  
**Impacto:** 🔴 CRÍTICO - Reports page não funciona sem essa correção  
**Tempo Estimado:** ⏱️ 5 minutos
