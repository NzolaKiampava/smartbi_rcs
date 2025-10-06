# SmartBI RCS

Plataforma de Business Intelligence voltada para equipes que precisam conectar múltiplas fontes de dados, gerar insights com IA generativa e monitorar operações em tempo real. O projeto combina um frontend em React/TypeScript (Vite) com um backend GraphQL configurável, entregando dashboards interativos, análises assistidas por IA e um fluxo completo de gestão de arquivos.

## Índice

- [Visão Geral](#visão-geral)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Arquitetura e Stack Tecnológica](#arquitetura-e-stack-tecnológica)
- [Requisitos](#requisitos)
- [Configuração Rápida](#configuração-rápida)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Fluxos-Chave do Produto](#fluxos-chave-do-produto)
- [Boas Práticas de Observabilidade](#boas-práticas-de-observabilidade)
- [Resolução de Problemas](#resolução-de-problemas)
- [Documentação de Referência](#documentação-de-referência)
- [Contribuição](#contribuição)
- [Licença](#licença)

## Visão Geral

O **SmartBI RCS** oferece um portal completo de analytics que centraliza métricas corporativas, histórico de consultas, gerenciamento de usuários e relatórios enriquecidos com inteligência artificial. A aplicação foi desenhada para ambientes multiempresa (multi-tenant), permitindo que cada companhia visualize apenas os seus indicadores e arquivos.

## Principais Funcionalidades

- **Dashboard modular** com seções para overview executivo, activity feed, desempenho de sistemas e monitoramento de base de dados.
- **Upload inteligente de arquivos** com classificação automática (CSV, Excel, PDF, JSON, SQL, XML) e disparo de rotinas de análise/insights via IA.
- **Página de relatórios integrada ao backend real**, suportando download, exclusão e operações em lote sobre arquivos armazenados em Supabase.
- **Consultas em linguagem natural** que convertem perguntas em SQL/GraphQL e retornam resultados estruturados.
- **Histórico completo de consultas e notificações**, com gamificação, alerts e preferências armazenadas em contexto próprio.
- **Módulo de Analytics** consumindo KPIs do backend, com fallback inteligente quando o `companyId` não está disponível.
- **Gestão de usuários** (ativação, verificação, papéis, empresa) acessível dentro do dashboard.
- **Suporte a temas (light/dark), internacionalização (`react-i18next`) e layout responsivo**.
- **Widget de chat/assistente (Chatbase)** incorporado em todas as telas autenticadas.

## Arquitetura e Stack Tecnológica

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts.
- **Internacionalização e contexto:** `react-i18next`, Context API (Auth, Theme, Notifications, Gamification, Settings).
- **Backend consumido:** serviço GraphQL configurável via variável `VITE_GRAPHQL_ENDPOINT` (padrão para `http://localhost:4000/graphql`).
- **Persistência & arquivos:** integração com Supabase (via API GraphQL) para uploads e relatórios.
- **Automação & build:** Vite para dev/build, Storybook para documentação de componentes, ESLint para linting, PWA via `vite-plugin-pwa`.
- **Serviços auxiliares:** servidores mockados para testes de performance e wearable push (`scripts/*.js`).

## Requisitos

- Node.js **>= 18.x**
- npm **>= 9.x**
- Acesso a um backend GraphQL compatível com o schema esperado (local ou hospedado, ex.: Vercel).
- Opcional: Conta Supabase ou serviço equivalente caso deseje usar a mesma camada de armazenamento e análise.

## Configuração Rápida

> Os comandos a seguir assumem um terminal PowerShell (Windows). Ajuste conforme seu shell preferido.

1. Clone o repositório:
  ```powershell
  git clone https://github.com/NzolaKiampava/smartbi_rcs.git
  cd smartbi_rcs
  ```
2. Instale dependências:
  ```powershell
  npm install
  ```
3. (Opcional) Configure o backend no `.env` (veja [Variáveis de Ambiente](#variáveis-de-ambiente)).
4. Inicie o servidor de desenvolvimento (porta padrão 5173):
  ```powershell
  npm run dev
  ```
5. Acesse `http://localhost:5173` no navegador.

Para gerar build de produção:
```powershell
npm run build
```
e em seguida sirva os artefatos com:
```powershell
npm run preview
```

## Variáveis de Ambiente

As variáveis vivem em arquivos `.env` e seguem o padrão Vite (`VITE_*`). Copie o template e ajuste conforme o ambiente:

```powershell
Copy-Item .env.example .env
```

Edite o valor do endpoint GraphQL:

- Desenvolvimento local:
  ```env
  VITE_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
  ```
- Backend hospedado na Vercel:
  ```env
  VITE_GRAPHQL_ENDPOINT=https://smartbi-backend-psi.vercel.app/api/graphql
  ```

> Sempre reinicie o servidor (`npm run dev`) após alterar o `.env`. Mudanças a quente não têm efeito.

## Scripts Disponíveis

| Script | Comando | Descrição |
| --- | --- | --- |
| Desenvolvimento | `npm run dev` | Inicia o Vite em modo dev com HMR. |
| Build | `npm run build` | Gera bundle otimizado para produção. |
| Preview | `npm run preview` | Serve o build localmente para validação. |
| Lint | `npm run lint` | Executa ESLint em todo o projeto. |
| Storybook | `npm run storybook` | Abre a documentação interativa de componentes. |
| Build Storybook | `npm run build-storybook` | Gera versão estática do Storybook. |
| Perf Servers | `npm run perf-server` / `npm run backend-perf-server` | Inicia servidores mock de performance (frontend e backend). |
| Mock Wearable | `npm run mock-wearable-push` | Simula servidor de push para wearables. |

## Estrutura de Pastas

```
smartbi_rcs/
├─ public/                     # Assets estáticos (PWA icons, imagens, manifest)
├─ src/
│  ├─ components/             # Páginas e componentes agrupados por domínio (Analytics, Reports, Users, etc.)
│  ├─ contexts/               # Providers globais (Auth, Theme, Notifications, Settings, Gamification)
│  ├─ services/               # Integrações com GraphQL, IA, upload de arquivos, métricas
│  ├─ data/                   # Dados mock ou estáticos de apoio
│  ├─ locales/                # Traduções para `react-i18next`
│  ├─ utils/                  # Funções utilitárias e helpers
│  └─ App.tsx                 # Roteamento principal e orquestração do dashboard
├─ backend files/             # Serviços Node auxiliares (ex.: analysis, graphql, perf)
├─ scripts/                   # Servidores mock/ utilidades (performance, upload)
├─ docs (.md)                 # Guias adicionais (deploy, auth, upload, troubleshooting)
├─ package.json
├─ vite.config.ts
└─ tailwind.config.js
```

## Fluxos-Chave do Produto

- **Autenticação e Landing:** combinação de LandingPage, LoginPage e AuthContext garante onboarding suave e controle de sessão. Tokens JWT são buscados no `localStorage` para compor o header `Authorization` nas requisições GraphQL.
- **Analytics (KPI Board):** `graphqlService.getAnalyticsStats` seleciona queries distintas para contexto global ou por empresa (`companyId`), evitando erros `ID!` na API e exibindo métricas reais.
- **Gestão de Arquivos & Relatórios:** `ReportsPage` lista arquivos da API real (Supabase), permite download com blobs, exclusão com modal de confirmação e ações em lote, além de feedback visual e suporte a dark mode.
- **Consultas em Linguagem Natural:** via `executeAIQueryPublic`, converte perguntas do usuário em SQL/GraphQL, mostrando resultados tabulares e histórico (`QueryHistoryPage`).
- **Instant Insight & IA Assistida:** prove insights rápidos baseados em análise de datasets enviados.
- **Notificações, Activity e Gamificação:** contextos dedicados para preferências, tracking de eventos e atualizações em tempo real.
- **Suporte PWA:** manifesto, ícones e service worker pré-configurados para instalação como aplicativo.

## Boas Práticas de Observabilidade

- Console estruturado com emojis (`📡`, `📥`, `✅`, `❌`) para acompanhar requisições GraphQL.
- Logs de CORS e recomendações automáticas quando o backend hospedado bloquear o navegador.
- Feedback visual consistente (toasts, loaders, estados vazios) em todos os fluxos críticos.
- Recomenda-se habilitar a aba **Network** do DevTools ao testar novos endpoints.

## Resolução de Problemas

| Sintoma | Possíveis Causas | Como Resolver |
| --- | --- | --- |
| Página recarrega continuamente | Backend indisponível, CORS, token inválido | Verifique logs no console, confirme o endpoint no `.env`, reteste com backend local. |
| Dados de analytics zerados | `companyId` ausente, backend retornando vazio | Certifique-se de estar autenticado com usuário vinculado a empresa; confira a query no backend. |
| Erros de CORS ao usar Vercel | Backend não liberou domínio do frontend | Ajuste os headers CORS no backend ou use `http://localhost:4000/graphql`. |
| Download de arquivos falha | ID inválido ou token expirado | Refaça login, tente download via endpoint local, cheque logs `📥`. |
| Storybook não abre | Porta ocupada ou dependências faltando | Feche serviços na porta 6006 e rode `npm install` novamente. |

## Documentação de Referência

Este repositório contém guias detalhados para rotinas específicas:

- `AUTHENTICATION_ISSUE_ANALYSIS.md` – fluxo de autenticação e correções comuns.
- `REPORTS_PAGE_INTEGRATION.md` – integração completa da página de relatórios com backend real.
- `FILE_UPLOAD_IMPLEMENTATION.md` e `FILE_UPLOAD_GUIDE.md` – detalhes do pipeline de upload/analytics.
- `BACKEND_CONFIG.md` – instruções aprofundadas para configurar o endpoint GraphQL.
- `NATURAL_LANGUAGE_TESTING_GUIDE.md` – melhores práticas para testar o módulo de linguagem natural.
- `DEPLOY_README.md` e `VERCEL_DEPLOY_GUIDE.md` – dicas de deploy e configuração na Vercel.

Consulte esses arquivos para conhecer decisões arquiteturais e passos de troubleshooting ainda mais específicos.

## Contribuição

1. Faça um fork do repositório.
2. Crie uma branch de feature: `git checkout -b feat/nome-da-feature`.
3. Garanta que lint e build passam: `npm run lint && npm run build`.
4. Abra um Pull Request descrevendo claramente o escopo e screenshots quando aplicável.

Sugestões de melhoria são bem-vindas! Veja a seção “Next Steps” em cada documento técnico para ideias adicionais.

## Licença

Este projeto é de uso privado da equipe SmartBI. Consulte o responsável pelo produto para informações sobre licença e redistribuição.
