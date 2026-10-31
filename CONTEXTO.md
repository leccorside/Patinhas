# 🐾 CONTEXTO DO PROJETO — PLATAFORMA PATINHAS

> **Documento vivo.** Atualizar após cada etapa concluída ou decisão técnica relevante tomada.

## 📅 Última Atualização
- **Data:** 31/10/2026
- **Etapa atual:** ETAPA 04 — Autenticação e Segurança (Concluída com sucesso!)
- **Status geral:** 🟢 ETAPAS 00, 01, 02, 03 e 04 Concluídas. Autenticação JWT, Argon2id, Cookies HttpOnly e telas de Login/Cadastro operacionais. Aguardando autorização para ETAPA 05.

---

## 🎯 Identidade e UX/UI Incorporados

A documentação e todo o planejamento adotaram integralmente a identidade visual e os protótipos aprovados contidos na pasta `uxui/`:
- **Sistema de Design:** *Warm Paws Adoption System* (`uxui/warm_paws_adoption_system/DESIGN.md`).
- **Paleta Oficial:**
  - Primária: `#FF7043` (Warm Coral) e gradiente `linear-gradient(135deg, #FF8A65 0%, #FF7043 100%)`
  - Secundária: `#4DB6AC` (Soft Teal)
  - Fundo do App: `#FAFAF8` (Warm Alabaster)
  - Superfícies/Cards: `#FFFFFF` (Pure White)
  - Texto Principal: `#263238` (Deep Graphite)
  - Texto Secundário: `#78909C` (Slate Grey)
  - Fundo Externo Desktop: `#EDEDEB` (Neutral Grey)
- **Tipografia:** `Plus Jakarta Sans` (principal) com fallback em `Inter`.
- **Formato Mandatório:** Aplicativo estritamente mobile em coluna única, centralizado horizontalmente em qualquer tela com largura máxima global de **430px** e altura mínima de **100dvh**. Nenhuma expansão de layout para desktop.

---

## 📋 Status das Etapas de Desenvolvimento

| Etapa | Título | Status | Observação |
|---|---|---|---|
| **00** | Documentação e Arquitetura | 🟢 Concluída | `DOCUMENTACAO.md`, `PASSOS.md` e `CONTEXTO.md` gerados |
| **01** | Monorepo e Infraestrutura Docker | 🟢 Concluída | Containers `api`, `web`, `postgres`, `redis`, `minio` e `mailpit` rodando |
| **02** | Banco de Dados e Migrations | 🟢 Concluída | Schema com 36+ entidades, 5 índices GIST, migration e seed com PostGIS |
| **03** | MobileAppShell e Design System | 🟢 Concluída | MobileAppShell (430px) e 14 componentes UI com Framer Motion |
| **04** | Autenticação e Segurança | 🟢 Concluída | Argon2id, JWT, refresh rotativo, Mailpit, telas de Login/Cadastro/Perfil |
| **05** | Usuários, Perfis e Organizações | 🟢 Concluída | MinIO S3, edição de perfil, gestão de ONGs com membros e cards |
| **06** | Cadastro de Animais | 🟢 Concluída | CRUD de animais, Stepper mobile em 6 etapas, PetDetailView e PostGIS |
| **07** | Home, Busca e Filtros | 🟢 Concluída | Home Bento, Explorar em grid 2 colunas, filtros avançados e finais felizes |
| **08** | Mapa e Geolocalização | 🟢 Concluída | MapLibre GL JS, GeoJSON PostGIS ST_DWithin, markers DOM e Bottom Sheet |
| **09** | Favoritos e Modo Descoberta | ⏳ Aguardando autorização | Curtidas, listas e animações |
| **10** | Processo de Adoção | ⏳ Pendente | Questionário e máquina de estados |
| **11** | Chat em Tempo Real | ⏳ Pendente | Socket.IO, salas privadas e anexos |
| **12** | Notificações Push | ⏳ Pendente | Web Push API, VAPID e BullMQ |
| **13** | Match Inteligente | ⏳ Pendente | Compatibilidade ponderada tutor-pet |
| **14** | Dashboard de ONGs | ⏳ Pendente | Métricas e gestão de solicitações mobile |
| **15** | Admin Master | ⏳ Pendente | Moderação global e auditoria |
| **16** | Moderação e Antifraude | ⏳ Pendente | Denúncias e suspensão de contas |
| **17** | Animais Perdidos e Achados | ⏳ Pendente | Módulo comunitário de busca |
| **18** | Lar Temporário | ⏳ Pendente | Voluntariado e acolhimento transitório |
| **19** | Eventos e Feiras | ⏳ Pendente | Calendário de feiras presenciais |
| **20** | Campanhas de Doação | ⏳ Pendente | Apoio a ONGs e prestação de contas |
| **21** | Acompanhamento Pós-Adoção | ⏳ Pendente | Checklists de adaptação e lembretes |
| **22** | Internacionalização | ⏳ Pendente | Suporte a PT-BR, EN e ES com i18next |
| **23** | PWA e Modo Offline | ⏳ Pendente | Manifest, Service Worker e instalação |
| **24** | Testes e Segurança | ⏳ Pendente | Vitest, Jest, Playwright e 11 viewports |
| **25** | Performance e Observabilidade | ⏳ Pendente | Redis cache, code splitting e logs |
| **26** | Preparação para Produção | ⏳ Pendente | Compose prod, backups e documentação |

---

## 🏗️ Decisões Técnicas Registradas

| # | Decisão Técnica | Justificativa Arquitetural | Alternativa Descartada |
|---|---|---|---|
| **1** | Monorepo modular (`apps/web`, `apps/api`, `packages/*`) | Compartilhamento nativo de tipos TypeScript, DTOs e validações Zod entre backend e frontend | Múltiplos repositórios isolados (sincronização frágil) |
| **2** | Backend NestJS (TypeScript) | Modularidade corporativa, injeção de dependência nativa e facilidade de acoplamento de WebSockets | Express puro (ausência de padrão arquitetural) |
| **3** | Prisma ORM | Segurança tipada de ponta a ponta, excelente DX de migrações e suporte a consultas cruas PostGIS | TypeORM (instável em migrações) ou Drizzle |
| **4** | PostgreSQL 16 com extensão PostGIS | Suporte nativo a cálculos geodésicos exatos no elipsoide WGS84 com índices espaciais GIST | MySQL ou MongoDB (suporte geoespacial inferior) |
| **5** | Redis 7 com BullMQ | Gerenciamento de tarefas em segundo plano (e-mails, notificações push e redimensionamento de imagens) | RabbitMQ ou Kafka (complexidade desnecessária para a escala inicial) |
| **6** | MinIO para Armazenamento de Arquivos | Compatibilidade 100% com AWS S3, permitindo execução local autônoma em Docker e migração zero-effort para nuvem | Armazenamento local no sistema de arquivos |
| **7** | MapLibre GL JS para Mapas | Renderização vetorial fluida, open source e independente de chaves de API restritivas do Google Maps | Google Maps JS API (alto custo de escala) ou Leaflet clássico |
| **8** | Socket.IO no Gateway em Tempo Real | Tratamento automático de reconexão, salas seguras por conversa e compatibilidade abrangente | WebSockets puros (requer reimplementação manual de heartbeats e salas) |
| **9** | Web Push W3C com VAPID | Notificações push padronizadas sem dependência obrigatória de serviços proprietários | Dependência exclusiva de Firebase Cloud Messaging |
| **10**| Argon2id para Senhas | Padrão ouro recomendado pela OWASP para proteção contra ataques com aceleração GPU | bcrypt ou PBKDF2 |
| **11**| JWT com Refresh Token Rotativo em Cookies HttpOnly | Blindagem contra roubo de credenciais via ataques XSS e proteção contra CSRF | Tokens em LocalStorage (vulneráveis a injeção de scripts maliciosos) |
| **12**| Mobile-Only Shell (Máximo 430px) | Diretriz obrigatória do projeto para garantir uniformidade de experiência como app nativo em qualquer tela | Layout responsivo desktop expandido (fora do escopo e vetado) |
| **13**| Zustand no Gerenciamento de Estado | Leve, performático e sem boilerplate desnecessário | Redux Toolkit (muito verboso) |
| **14**| TanStack Query v5 | Cache automático de servidor, paginação infinita, deduplicação de requisições e mutações otimistas | Gerenciamento manual de requisições com useEffect |
| **15**| Mailpit em Desenvolvimento | Captura local de e-mails em interface web sem disparos acidentais para caixas reais | Serviços externos de e-mail em ambiente local |

---

## 📁 Arquivos Criados na Sessão Atual (Etapa 00)

| Arquivo | Descrição |
|---|---|
| `DOCUMENTACAO.md` | Documentação técnica e arquitetural completa (36+ entidades, fluxos, APIs, segurança, design system) |
| `PASSOS.md` | Planejamento detalhado das 27 etapas do projeto com tarefas, dependências e critérios de aceite |
| `CONTEXTO.md` | Registro do estado do projeto, decisões técnicas, identidade visual e pendências |

---

## 🔴 Pendências que Precisam de Aprovação do Usuário

1. **Autorização para a ETAPA 09:** Permissão explícita para iniciar a ETAPA 09 — Favoritos e Modo Descoberta (Tinder-style swipe cards com Framer Motion, persistência de curtidas no banco de dados, feedback tátil/sonoro visual e lista de pets salvos).

---

## 💾 Como Retomar o Desenvolvimento em Outra Sessão

1. Consultar este arquivo (`CONTEXTO.md`) para verificar a última etapa concluída e a etapa seguinte autorizada.
2. Ler `PASSOS.md` para identificar as tarefas pendentes (`[ ]`) da etapa em andamento.
3. Consultar `DOCUMENTACAO.md` e `uxui/warm_paws_adoption_system/DESIGN.md` para diretrizes de arquitetura e design.
4. **Regra de Parada:** Nunca avançar de etapa sem a aprovação explícita do usuário.
