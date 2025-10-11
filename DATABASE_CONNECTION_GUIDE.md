# Guia de Criação de Conexões de Base de Dados

## Visão Geral

A funcionalidade de criação de conexões de base de dados está totalmente integrada com o backend GraphQL. Você pode criar conexões para diferentes tipos de bases de dados através da interface visual na página **Database**.

## Tipos de Conexão Suportados

### Bases de Dados
- **PostgreSQL** - Banco de dados relacional open-source
- **MySQL** - Sistema de gerenciamento de banco de dados relacional
- **Supabase** - Plataforma de backend com PostgreSQL
- **Firebase** - Plataforma de desenvolvimento de aplicativos do Google

### APIs
- **REST API** - APIs RESTful padrão
- **GraphQL API** - APIs GraphQL
- **SOAP API** - Protocolo SOAP
- **Webhook** - Endpoints de webhook
- **Custom API** - APIs personalizadas

## Como Criar uma Conexão de Base de Dados

### Através da Interface

1. Navegue até a página **Database**
2. Clique no botão **"Add Connection"**
3. Selecione o modo **"Database"** (ícone de banco de dados)
4. Preencha os campos obrigatórios:
   - **Connection Name** * - Nome descritivo para a conexão
   - **Database Type** - Tipo do banco de dados
   - **Host** * - Endereço do servidor (ex: `localhost`, `db.example.com`, ou URL completa do Supabase)
   - **Port** - Porta do servidor (opcional, usa a padrão do tipo de BD)
   - **Database** - Nome da base de dados (se aplicável)
   - **Username** - Usuário de autenticação (se aplicável)
   - **Password** - Senha ou token de autenticação
5. Clique em **"Add Connection"**

### Exemplo: Criar Conexão Supabase

#### Dados do Exemplo
```json
{
  "name": "Conexão Supabase Produção",
  "type": "SUPABASE",
  "config": {
    "host": "https://yazvflcxyqdughavhthm.supabase.co",
    "password": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "isDefault": true
}
```

#### Passos na Interface
1. **Connection Name**: `Conexão Supabase Produção`
2. **Database Type**: Selecione `Supabase`
3. **Host**: `https://yazvflcxyqdughavhthm.supabase.co`
4. **Password**: Cole o service_role key (JWT token) do Supabase
5. Marque como **Default** se desejar (opcional)
6. Clique em **Add Connection**

> **Nota sobre Supabase**: O campo "password" deve conter o **service_role key** ou **anon key** do seu projeto Supabase. Este é um JWT token que você encontra nas configurações do projeto Supabase.

## Estrutura da Mutation GraphQL

A criação utiliza a mutation `createDataConnectionPublic`:

```graphql
mutation CreateDatabaseConnection($input: DataConnectionInput!) {
  createDataConnectionPublic(input: $input) {
    id
    name
    type
    status
    isDefault
    createdAt
    updatedAt
  }
}
```

### Variáveis da Mutation

```json
{
  "input": {
    "name": "Nome da Conexão",
    "type": "POSTGRESQL | MYSQL | SUPABASE | FIREBASE",
    "config": {
      "host": "endereço_do_servidor",
      "port": 5432,
      "database": "nome_do_banco",
      "username": "usuario",
      "password": "senha_ou_token"
    },
    "isDefault": false
  }
}
```

## Mapeamento de Tipos

O frontend mapeia automaticamente os tipos selecionados para os enums do backend:

| Tipo na Interface | Enum do Backend |
|-------------------|-----------------|
| postgresql        | POSTGRESQL      |
| mysql             | MYSQL           |
| supabase          | SUPABASE        |
| firebase          | FIREBASE        |

## Campos Obrigatórios vs Opcionais

### Obrigatórios
- ✅ **name** - Nome da conexão
- ✅ **type** - Tipo da base de dados
- ✅ **host** - Endereço do servidor

### Opcionais
- ⚪ **port** - Porta (usa padrão se não fornecido)
- ⚪ **database** - Nome do banco (depende do tipo)
- ⚪ **username** - Usuário (depende do tipo de autenticação)
- ⚪ **password** - Senha ou token
- ⚪ **isDefault** - Define como conexão padrão (default: false)

## Validação

O botão **"Add Connection"** fica desabilitado até que:
- O campo `name` esteja preenchido
- Para modo database: o campo `host` esteja preenchido
- Para modo API: o campo `baseUrl` esteja preenchido

## Notificações

### Sucesso
Quando a conexão é criada com sucesso:
- ✅ Mensagem: "Conexão de base de dados criada com sucesso!"
- ✅ A lista de conexões é automaticamente recarregada
- ✅ O modal é fechado e o formulário é resetado

### Erro
Se houver erro na criação:
- ❌ Mensagem: "Erro ao criar conexão: [mensagem de erro]"
- ❌ O modal permanece aberto para correções

## Exemplo de Código

### Chamada no GraphQL Service

```typescript
const databaseInput = {
  name: 'Conexão Supabase Produção',
  type: 'SUPABASE',
  config: {
    host: 'https://yazvflcxyqdughavhthm.supabase.co',
    password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  isDefault: true
};

await graphqlService.createDatabaseConnection(databaseInput);
```

## Tipos Especiais

### Supabase
- **Host**: URL completa do projeto (ex: `https://[project-ref].supabase.co`)
- **Password**: Service role key ou anon key (JWT token)
- **Port/Database/Username**: Geralmente não necessários

### Firebase
- **Host**: URL do Realtime Database ou Firestore
- **Password**: API key ou service account credentials
- **Port/Database/Username**: Configuração específica do Firebase

## Troubleshooting

### Erro: "Name is required"
- ✅ Certifique-se de preencher o campo "Connection Name"

### Erro: "Host is required"
- ✅ Preencha o campo "Host" com o endereço do servidor
- ✅ Para Supabase, use a URL completa incluindo `https://`

### Erro: "Invalid connection type"
- ✅ Verifique se o tipo selecionado é suportado pelo backend
- ✅ Tipos válidos: postgresql, mysql, supabase, firebase

### Conexão criada mas status "INACTIVE"
- ⚠️ Verifique as credenciais (username/password)
- ⚠️ Confirme que o host está acessível
- ⚠️ Para Supabase, confirme que o token JWT é válido

## Segurança

⚠️ **Importante**: 
- Senhas e tokens nunca são retornados em queries
- As credenciais são armazenadas de forma segura no backend
- Use sempre conexões HTTPS para Supabase e serviços externos
- Não compartilhe service_role keys publicamente

## Próximos Passos

Após criar a conexão:
1. Verifique o status da conexão no card
2. Use a conexão para queries em AI/Natural Language
3. Configure como padrão se necessário
4. Teste a conectividade através das ferramentas de análise

## Suporte

Para mais informações sobre:
- GraphQL Schema: `backend files/data-query.schema.ts`
- Frontend Service: `src/services/graphqlService.ts`
- Interface: `src/components/Database/DatabasePage.tsx`
