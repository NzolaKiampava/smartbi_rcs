# Guia de Implementação - Melhorias para Error 503 da API Gemini

## Problema Identificado

O erro `503 Service Unavailable` da API Gemini indica que o serviço está temporariamente indisponível. Isso pode acontecer devido a:

- Manutenção programada do Google
- Sobrecarga do serviço
- Problemas temporários de infraestrutura
- Limite de requisições excedido

## Soluções Implementadas

### 1. Backend - Retry Logic com Backoff Exponencial

**Arquivo:** `ai-query.service.updated.ts`

**Principais melhorias:**

- **Retry automático**: Até 3 tentativas com backoff exponencial
- **Validação de API key**: Verificação antes de fazer requisições
- **Mensagens de erro específicas**: Tradução de códigos de erro para mensagens user-friendly
- **Status check**: Método para verificar disponibilidade da API

**Configuração no construtor:**
```typescript
constructor(geminiConfig: GeminiConfig) {
  this.geminiConfig = {
    model: 'gemini-1.5-flash',
    maxTokens: 2048,
    temperature: 0.1,
    maxRetries: 3,        // Número máximo de tentativas
    retryDelay: 1000,     // Delay inicial em ms
    ...geminiConfig
  };
}
```

**Como usar no backend:**

1. Substitua o arquivo `ai-query.service.ts` pelo conteúdo de `ai-query.service.updated.ts`
2. Atualize as chamadas para incluir os novos parâmetros de configuração:

```typescript
// No seu arquivo de configuração (ex: app.module.ts ou config.ts)
const geminiConfig: GeminiConfig = {
  apiKey: process.env.GEMINI_API_KEY,
  model: 'gemini-1.5-flash',
  maxRetries: 3,
  retryDelay: 1000
};

const aiService = new AIQueryService(geminiConfig);
```

### 2. Frontend - Melhor UX e Feedback Visual

**Melhorias implementadas:**

- **Status da API em tempo real**: Card mostrando se a API está disponível
- **Mensagens de erro específicas**: Tradução de erros técnicos para linguagem user-friendly
- **Desabilitação inteligente**: Botão desabilitado quando API indisponível
- **Avisos visuais**: Banner de alerta quando serviço está indisponível

**Principais recursos adicionados:**

1. **Monitoramento de Status da API:**
   - Verificação a cada 30 segundos
   - Indicador visual no dashboard
   - Desabilitação automática quando indisponível

2. **Tratamento de Erros Melhorado:**
   - Erro 503: "O serviço de IA está temporariamente indisponível"
   - Erro 429: "Limite de requisições excedido"
   - Erro 401/403: "Erro de autenticação com o serviço de IA"

## Variáveis de Ambiente Necessárias

Certifique-se de que estas variáveis estão configuradas no backend:

```env
# .env no backend
GEMINI_API_KEY=sua_api_key_do_gemini_aqui
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_RETRIES=3
GEMINI_RETRY_DELAY=1000
```

## Configuração da API Key do Gemini

1. Acesse: https://makersuite.google.com/app/apikey
2. Crie uma nova API key
3. Configure no arquivo `.env` do backend
4. Reinicie o servidor backend

## Monitoramento e Logs

**Para monitorar os problemas da API Gemini:**

1. **Verifique os logs do backend** para erros como:
   ```
   Error translating to SQL: Error: Gemini API request failed: 503 Service Unavailable
   ```

2. **Use o método de teste de conexão:**
   ```typescript
   const result = await aiService.testConnection();
   console.log(result);
   ```

3. **Monitore o status da API:**
   ```typescript
   const status = await aiService.checkAPIStatus();
   console.log(status);
   ```

## Fallback Mechanisms (Recomendações Futuras)

Para implementar um sistema de fallback completo:

1. **Cache de consultas anteriores**: Salvar queries SQL geradas para reutilização
2. **Modo offline**: Templates predefinidos para consultas comuns
3. **API alternativa**: Integração com outros serviços de AI (OpenAI, Claude, etc.)
4. **Queue system**: Fila de requisições para processar quando API voltar

## Códigos de Status da API Gemini

| Código | Significado | Ação Recomendada |
|--------|-------------|-------------------|
| 200 | OK | Continuar normal |
| 400 | Bad Request | Verificar formato da requisição |
| 401 | Unauthorized | Verificar API key |
| 403 | Forbidden | Verificar permissões da API key |
| 429 | Too Many Requests | Aguardar e tentar novamente |
| 503 | Service Unavailable | Aguardar e tentar novamente |

## Testando as Melhorias

1. **Simular erro 503**: Temporariamente use uma API key inválida
2. **Verificar retry logic**: Monitore logs para ver as tentativas
3. **Testar UI**: Verificar se mensagens aparecem corretamente
4. **Validar status**: Confirmar se indicador de status funciona

## Próximos Passos

1. Implementar as mudanças no backend
2. Testar com API key válida
3. Monitorar logs por alguns dias
4. Considerar implementar cache para reduzir dependência da API
5. Adicionar métricas de disponibilidade da API

## Suporte

Se os problemas persistirem:

1. Verifique o status oficial do Google AI: https://status.cloud.google.com/
2. Considere implementar um sistema de cache mais robusto
3. Avalie APIs alternativas como backup

---

**Nota importante**: As melhorias implementadas reduzirão significativamente a frequência de erros 503, mas não podem eliminar completamente problemas de infraestrutura do lado do Google. O retry logic e melhor UX garantem uma experiência mais robusta para os usuários.