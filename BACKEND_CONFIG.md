# Configuração do Backend GraphQL

## Como Configurar o Endpoint do Backend

O SmartBI RCS pode se conectar a diferentes backends GraphQL. Siga os passos abaixo para configurar:

### 1. Configuração via Arquivo .env

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 2. Escolha o Endpoint

Edite o arquivo `.env` e descomente a linha do endpoint desejado:

#### Para usar Localhost (Desenvolvimento):
```env
VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```

#### Para usar Vercel (Produção):
```env
VITE_GRAPHQL_ENDPOINT=https://smartbi-backend-psi.vercel.app/api/graphql
```

### 3. Reinicie o Servidor de Desenvolvimento

Após alterar o `.env`, **SEMPRE reinicie o servidor**:
```bash
npm run dev
```

## Troubleshooting

### Problema: Página fica dando refresh contínuo

**Causas possíveis:**
1. Backend não está respondendo
2. CORS não configurado corretamente
3. Erros de autenticação

**Solução:**
1. Abra o Console do navegador (F12)
2. Verifique os logs que começam com:
   - 🔗 GraphQL Endpoint configurado
   - 📡 GraphQL Request
   - 📥 GraphQL Response
   - ✅ ou ❌ para sucesso/erro

3. Se o endpoint Vercel não funcionar, volte para localhost:
   ```env
   VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
   ```

### Problema: Não consigo carregar dados do banco

**Verifique:**
1. O backend está rodando? (se localhost)
2. O endpoint está correto no `.env`?
3. Há erros no console do navegador?

**Logs detalhados:**
O frontend agora mostra logs detalhados no console:
- 📡 Indica tentativa de requisição
- 📥 Indica resposta recebida
- ✅ Sucesso
- ❌ Erro com detalhes

### Problema: Erros de CORS

Se você ver erros relacionados a CORS ao usar o backend do Vercel, isso significa que o backend precisa adicionar o domínio do frontend aos headers CORS.

**Solução temporária:** Use localhost para desenvolvimento.

## Notas Importantes

1. ⚠️ **Sempre reinicie** o servidor após mudar o `.env`
2. ⚠️ Mudanças no `.env` durante execução **não têm efeito**
3. ⚠️ O arquivo `.env` **não** deve ser commitado no git (já está no .gitignore)
4. ✅ Use `.env.example` como referência para novos desenvolvedores

## Backend Local

Se você quer rodar o backend localmente:

1. Clone o repositório do backend
2. Configure as variáveis de ambiente do backend
3. Execute: `npm run dev`
4. Configure o frontend para usar: `http://localhost:4000/graphql`

## Resumo dos Arquivos

- `.env.example` - Template com exemplos (commitado no git)
- `.env` - Configuração local (NÃO commitado, adicione ao .gitignore)
- `src/services/graphqlService.ts` - Serviço que usa o endpoint configurado
