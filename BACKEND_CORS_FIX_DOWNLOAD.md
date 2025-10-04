# 🔧 Backend CORS Fix for File Download - `/api/files/:id/download`

## 🚨 Erro Atual

```
TypeError: Failed to fetch
```

Ao tentar fazer download de arquivo em produção (Vercel).

## 📋 Problema

O endpoint `/api/files/:id/download` não está retornando os headers CORS corretos, fazendo o navegador bloquear a requisição.

## 🔍 Arquivo a Corrigir

### `backend/api/files.ts`

O handler já tem configuração CORS, mas pode estar **faltando headers no response de download**:

## ✅ Solução

No handler de download (GET `/api/files/:id/download`), certifique-se de incluir os headers CORS **antes** de enviar o arquivo:

```typescript
// GET /api/files/:id/download - Download a specific file
if (req.method === 'GET' && pathParts.length === 4 && pathParts[0] === 'api' && pathParts[1] === 'files' && pathParts[3] === 'download') {
  const fileId = pathParts[2];

  // Get file metadata from database
  const { data: fileRecord, error: dbError } = await supabase
    .from('file_uploads')
    .select('*')
    .eq('id', fileId)
    .single();

  if (dbError || !fileRecord) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'File not found'
    }));
    return;
  }

  // Download file from Supabase Storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('file-uploads')
    .download(fileRecord.filename);

  if (downloadError || !fileData) {
    console.error('Storage download error:', downloadError);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: false,
      message: 'Failed to download file from storage',
      error: downloadError?.message
    }));
    return;
  }

  // Convert Blob to Buffer
  const arrayBuffer = await fileData.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // ⚠️ IMPORTANTE: Set CORS headers BEFORE Content-Type
  // Se o CORS já está configurado no topo do handler, isso já deve estar OK
  // Mas certifique-se de que os headers CORS estão sendo setados ANTES de writeHead
  
  // Set appropriate headers for file download
  res.setHeader('Content-Type', fileRecord.mimetype || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.original_name}"`);
  res.setHeader('Content-Length', buffer.length.toString());
  
  // ✅ ADICIONE ESTES HEADERS EXPLICITAMENTE AQUI (se não funcionou com os headers do topo)
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  res.writeHead(200);
  res.end(buffer);
  return;
}
```

## 🔍 Checklist de Verificação

1. **Headers CORS no topo do handler** ✅
   ```typescript
   const allowedOrigins = [
     'http://localhost:5173',
     'https://smartbi-rcs.vercel.app',
     process.env.FRONTEND_URL
   ];
   ```

2. **OPTIONS request handler** ✅
   ```typescript
   if (req.method === 'OPTIONS') {
     res.writeHead(204);
     res.end();
     return;
   }
   ```

3. **CORS headers na resposta de download** ⚠️ **VERIFICAR ESTE**
   - Certifique-se de que `res.setHeader('Access-Control-Allow-Origin', ...)` está sendo chamado **antes** de `res.writeHead(200)`

## 🧪 Como Testar

### 1. Teste direto no navegador (deve retornar o arquivo):
```
https://smartbi-backend-psi.vercel.app/api/files/SEU_FILE_ID/download
```

### 2. Teste com curl (deve mostrar headers CORS):
```bash
curl -I -H "Origin: https://smartbi-rcs.vercel.app" \
  https://smartbi-backend-psi.vercel.app/api/files/SEU_FILE_ID/download
```

Resposta esperada deve incluir:
```
HTTP/2 200
access-control-allow-origin: https://smartbi-rcs.vercel.app
content-type: application/pdf
content-disposition: attachment; filename="example.pdf"
content-length: 12345
```

### 3. Teste no frontend (React):
- Abra Console → Network tab
- Clique em "Download" em um arquivo
- Verifique os headers da requisição e resposta

## 🔧 Alternativa: Usar Supabase Public URL

Se o problema persistir, considere usar URLs públicas do Supabase Storage:

```typescript
// Em vez de fazer download via backend
const { data } = await supabase.storage
  .from('file-uploads')
  .createSignedUrl(fileRecord.filename, 60); // 60 segundos

// Retornar URL signed para o frontend fazer download direto
res.writeHead(200, { 'Content-Type': 'application/json' });
res.end(JSON.stringify({
  success: true,
  downloadUrl: data.signedUrl,
  filename: fileRecord.original_name
}));
```

Depois no frontend:
```typescript
// Pegar URL do backend
const response = await fetch(downloadEndpoint);
const { downloadUrl, filename } = await response.json();

// Download direto do Supabase (sem CORS issues)
const a = document.createElement('a');
a.href = downloadUrl;
a.download = filename;
a.click();
```

## 📝 Resumo

**Problema:** CORS bloqueando download de arquivo  
**Causa:** Headers CORS não estão sendo incluídos na resposta de download  
**Solução:** Adicionar headers CORS explicitamente antes de `res.writeHead(200)` no handler de download

**Prioridade:** 🔴 ALTA - Funcionalidade crítica quebrada

---

**Status:** ⏳ Aguardando correção no backend  
**Tempo Estimado:** ⏱️ 10 minutos
