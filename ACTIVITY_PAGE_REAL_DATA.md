# Activity Page - Integração com Dados Reais do Sistema

## 📊 Visão Geral
A página Activity foi completamente integrada com o backend para mostrar **atividades reais** do sistema em tempo real, substituindo os dados estáticos de exemplo.

## ✨ Funcionalidades Implementadas

### 1. **Busca de Dados Reais do Backend**
- ✅ Integração com GraphQL Service para buscar:
  - **Query History** - Consultas AI executadas
  - **File Uploads** - Uploads de ficheiros
- ✅ Mapeamento automático de dados do backend para o formato da UI
- ✅ Filtragem por intervalo de tempo (Today, Week, Month, Quarter)

### 2. **Atualização Automática em Tempo Real**
- ✅ Auto-refresh a cada **30 segundos** para mostrar novas atividades
- ✅ Botão manual de refresh com indicador de loading
- ✅ Timestamp da última atualização visível na UI

### 3. **Indicadores Visuais de Status**

#### Badge "LIVE" no Header
```tsx
{isUsingRealData && (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-lg animate-pulse">
    <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
    LIVE
  </span>
)}
```

#### Indicador de Dados Reais vs Exemplo
- 🟢 **Verde pulsante** - Dados reais do sistema
- 🟡 **Amarelo** - Dados de exemplo (quando não há atividades)

### 4. **Notificações Informativas**

#### Banner de Aviso (Sem Dados Reais)
```
⚠️ Nenhuma atividade real encontrada
A mostrar dados de exemplo. Para ver atividades reais, execute consultas AI ou faça upload de ficheiros.
```

#### Banner de Loading
```
🔄 A carregar atividades do sistema...
```

### 5. **Contadores Dinâmicos em Tempo Real**
- **Total Events** - Todas as atividades
- **Auth Events** - Eventos de autenticação (logins/logouts)
- **Data Events** - Operações de dados (consultas, visualizações)
- **System Events** - Eventos de sistema (uploads, criação)

### 6. **Mapeamento de Atividades**

#### AI Queries → Activities
```typescript
mapQueryToUnifiedActivity(query: AIQueryResult): UnifiedActivity
- Status: success/error/warning
- Título: "AI Query Executed" / "AI Query Failed"
- Descrição: Consulta natural ou gerada
- Categoria: 'data'
- Ícone: Sparkles
```

#### File Uploads → Activities
```typescript
mapFileToUnifiedActivity(file: FileUpload): UnifiedActivity
- Status: baseado em analysisReport.status
- Título: "File Uploaded" / "File Analysis Failed"
- Descrição: Nome do ficheiro
- Categoria: 'system'
- Ícone: FileText
```

## 🔄 Fluxo de Dados

```
Backend GraphQL
    ↓
fetchActivities()
    ↓
Query History + File Uploads
    ↓
mapToUnifiedActivity()
    ↓
Filter by Time Range
    ↓
Sort by Timestamp (DESC)
    ↓
Split into:
    - userLogsData (30 items)
    - recentActivitiesData (18 items)
    - historyActivitiesData (30 items)
    ↓
UI Display with Live Indicators
```

## 🎨 Componentes UI Atualizados

### 1. Header Section
- Badge "LIVE" quando usando dados reais
- Descrição dinâmica baseada no status
- Contadores em tempo real

### 2. Filter Section
- Indicador de status dos dados (Real-time/Exemplo)
- Timestamp da última atualização
- Auto-refresh a cada 30s

### 3. Authentication Logs
- Badge "Real-time" quando usando dados do backend
- Contagem dinâmica de logins bem-sucedidos

### 4. Recent Activities
- Descrição contextual baseada no status
- Badge "Live" quando usando dados reais

## 🚀 Como Testar

### 1. **Verificar Dados de Exemplo** (Estado Inicial)
```bash
# Acesse a página Activity
# Verá: 🟡 "Dados de exemplo"
# Banner: "⚠️ Nenhuma atividade real encontrada"
```

### 2. **Gerar Atividades Reais**

#### Opção A: Executar Consultas AI
```typescript
// Na página Query/Analytics
- Execute uma consulta em linguagem natural
- Aguarde 30s ou clique em Refresh
- Verá: 🟢 "LIVE" badge + "Dados reais do sistema"
```

#### Opção B: Fazer Upload de Ficheiros
```typescript
// Na página File Upload
- Faça upload de um ficheiro CSV/Excel
- Aguarde 30s ou clique em Refresh
- Verá novas atividades de "File Uploaded"
```

### 3. **Monitoramento em Tempo Real**
```bash
# Deixe a página aberta
# Auto-refresh a cada 30 segundos
# Veja novos uploads/queries aparecerem automaticamente
```

## 📋 Estrutura de Dados

### UnifiedActivity
```typescript
interface UnifiedActivity {
  id: string;              // "query-123" ou "file-456"
  timestamp: string;       // ISO timestamp
  source: 'query' | 'file';
  status: 'success' | 'error' | 'warning';
  user: string;            // Nome do usuário
  title: string;           // Título da atividade
  description: string;     // Descrição detalhada
  module: string;          // "AI Analytics" ou "File Processing"
  actionCategory: 'view' | 'edit' | 'delete' | 'create';
  severity: 'low' | 'medium' | 'high';
  category: 'auth' | 'data' | 'system' | 'user';
  icon: React.ComponentType;
  color: string;
  device?: string;
  location?: string;
  ipAddress?: string;
  durationSeconds?: number;
}
```

## 🔍 Filtros Funcionais

### Filtros Aplicados
1. **Search** - Busca em user, activity, details, timestamp, module
2. **Category** - auth, data, system, user
3. **Severity** - low, medium, high
4. **Date Range** - Start Date / End Date
5. **Time Range** - Today, Week, Month, Quarter

### Contadores Dinâmicos
```typescript
const totalActivities = userLogsData.length + aggregatedActivities.length;
const authEvents = userLogsData.length;
const dataEvents = aggregatedActivities.filter(a => a.domainCategory === 'data').length;
const systemEvents = aggregatedActivities.filter(a => a.domainCategory === 'system').length;
```

## ⚙️ Configurações

### Intervalo de Auto-Refresh
```typescript
// Linha ~483 do ActivityPage.tsx
const refreshInterval = setInterval(() => {
  fetchActivities();
}, 30000); // 30 segundos
```

Para alterar:
```typescript
}, 60000); // 1 minuto
}, 10000); // 10 segundos
```

### Limite de Atividades
```typescript
setUserLogsData(unifiedActivities.slice(0, 30).map(toActivityLog));
setRecentActivitiesData(unifiedActivities.slice(0, 18).map(toRecentActivity));
setHistoryActivitiesData(unifiedActivities.slice(18, 48).map(toRecentActivity));
```

## 📊 Métricas de Performance

- ✅ **Build**: Successful (29.98s)
- ✅ **Bundle Size**: 2076.33 KB (603.76 KB gzipped)
- ✅ **Auto-refresh**: 30 segundos
- ✅ **Max Activities**: 48 atividades recentes
- ✅ **GraphQL Queries**: 200 file uploads limit

## 🎯 Próximos Passos Sugeridos

1. **Paginação** - Adicionar paginação para grandes volumes de dados
2. **WebSocket** - Substituir polling por WebSocket para updates instantâneos
3. **Filtros Avançados** - Adicionar filtros por user, module, success/failure
4. **Exportação** - Implementar exportação de atividades para CSV/Excel
5. **Notificações** - Alertas desktop para atividades críticas
6. **Analytics** - Gráficos de tendências de atividades ao longo do tempo

## 🐛 Troubleshooting

### Não vejo dados reais
1. Verifique se o backend está em execução
2. Execute algumas consultas AI ou faça upload de ficheiros
3. Aguarde 30s ou clique no botão "Refresh"
4. Verifique o console do navegador para erros

### Auto-refresh não funciona
1. Verifique se há erros no console
2. Verifique a conexão com o backend
3. Tente refresh manual primeiro

### Dados desatualizados
1. Clique no botão "Refresh" manualmente
2. Verifique o timestamp da última atualização
3. Verifique se o intervalo de tempo selecionado está correto

---

**Status**: ✅ Funcional e em Produção  
**Última Atualização**: 2025-01-19  
**Versão**: 1.0.0
