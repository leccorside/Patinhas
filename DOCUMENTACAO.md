# 🐾 DOCUMENTAÇÃO TÉCNICA — PLATAFORMA PATINHAS

> **Versão:** 1.0.0  
> **Data:** 30/10/2026  
> **Status:** Etapa 00 — Planejamento e Arquitetura  
> **Identidade Visual:** Warm Paws Adoption System (`uxui/warm_paws_adoption_system/DESIGN.md`)  

---

## 1. VISÃO GERAL

A **Patinhas** é uma plataforma digital completa de adoção responsável e proteção animal projetada para conectar:
- **Pessoas interessadas em adotar** cães, gatos e outros animais de estimação.
- **Protetores independentes** que resgatam e cuidam de animais até encontrarem um lar permanente.
- **ONGs e abrigos** que necessitam de gestão profissional de seus animais, voluntários, campanhas e processos de adoção.
- **Famílias acolhedoras de lar temporário**, oferecendo abrigo transitório a animais em recuperação ou aguardando adoção.
- **Administradores da plataforma**, responsáveis por moderação, segurança, integridade do ecossistema e relatórios globais.

A plataforma resolve dores críticas do ecossistema de proteção animal: desorganização de formulários em redes sociais, risco de golpes e comercialização disfarçada, falta de acompanhamento pós-adoção, perda de animais resgatados e dificuldade de encontrar candidatos compatíveis com o perfil de cada pet.

### Formato e Experiência do Produto
O produto é um **webapp com aparência permanente de aplicativo mobile** (Mobile-Only Experience), instalável como **Progressive Web App (PWA)**, centralizado em monitores desktop com largura máxima estrita de `430px`. Não existe e nunca existirá versão visual desktop expandida.

---

## 2. OBJETIVOS DO PROJETO

### 2.1 Objetivos de Negócio e Impacto Social
- Aumentar a taxa de sucesso e retenção das adoções através de questionários estruturados e match inteligente.
- Reduzir drasticamente o abandono e devolução através de acompanhamento sistemático pós-adoção.
- Oferecer ferramentas profissionais gratuitas para ONGs e protetores gerenciarem seus animais e candidatos.
- Combater fraudes, maus-tratos e venda ilegal de animais por meio de moderação ativa, denúncias e verificação de identidade.

### 2.2 Objetivos Técnicos e de Arquitetura
- **Execução 100% Dockerizada:** Todo o ambiente de desenvolvimento e produção executa em containers Docker isolados e orquestrados, sem necessidade de dependências locais além de Docker e Git.
- **Aderência Estrita ao Design System Aprovado:** Incorporar 100% dos tokens, componentes, microinterações e diretrizes visuais do *Warm Paws Adoption System* presentes na pasta `uxui/`.
- **Comunicação em Tempo Real:** Suporte a chat instantâneo e atualizações de mapa e status via WebSockets (Socket.IO).
- **Consultas Geoespaciais de Alta Performance:** Uso do PostGIS com índices espaciais GIST para cálculo de proximidade e filtros por raio (5 a 200 km).
- **Segurança e Privacidade:** Criptografia Argon2id, tokens JWT com rotação em cookies HttpOnly/Secure, proteção contra ataques de força bruta e conformidade estrita com a LGPD.

---

## 3. REGRA ABSOLUTA DE LAYOUT MOBILE (MOBILE APP SHELL)

Esta é a diretriz arquitetural mais mandatória de todo o frontend. **Não existe versão desktop**.

### 3.1 Especificações Dimensionais
- **Largura máxima global:** `430px` (padrão de smartphones topo de linha como iPhone Pro Max).
- **Largura em smartphones:** `100%` da tela, respeitando as Safe Areas (`env(safe-area-inset-*)`).
- **Altura mínima:** `100dvh` (viewport dinâmica para evitar cortes com barras de navegação de navegadores móveis).
- **Fundo externo desktop:** `#EDEDEB` (cinza neutro que destaca o smartphone emoldurado).
- **Fundo interno da aplicação:** `#FAFAF8` (Warm Alabaster).
- **Alinhamento:** Centralizado horizontalmente via flexbox no elemento body/container externo.

### 3.2 O Componente Global `MobileAppShell`
Todo o roteamento da aplicação é envelopado pelo `MobileAppShell`:

```tsx
import type { ReactNode } from "react";

interface MobileAppShellProps {
  children: ReactNode;
}

export function MobileAppShell({ children }: MobileAppShellProps) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[#EDEDEB] antialiased">
      <div
        id="mobile-app-root"
        className="
          relative
          flex
          min-h-dvh
          w-full
          max-w-[430px]
          flex-col
          overflow-x-clip
          bg-[#FAFAF8]
          text-[#263238]
          shadow-[0_0_50px_rgba(0,0,0,0.12)]
        "
      >
        {children}
      </div>
    </div>
  );
}
```

### 3.3 Regras de Contenção para Componentes Flutuantes e Modais
- **Nenhum elemento modal, bottom sheet, toast ou overlay pode vazar a largura de 430px.**
- Overlays com `position: fixed` devem ter `left: 50%`, `transform: translateX(-50%)` e `max-w-[430px]` ou ser ancorados com `position: absolute` dentro do `#mobile-app-root` (que possui `position: relative`).
- A barra de navegação inferior flutuante (`FloatingBottomNav`) permanece fixa na base do container mobile com `max-w-[430px]`, `bottom-0` e margem inferior de respiro.
- Mapas interativos (MapLibre GL JS) devem ter suas dimensões e canvas estritamente contidos nos 430px.

---

## 4. DESIGN SYSTEM E IDENTIDADE VISUAL (UX/UI)

Baseado no protótipo aprovado e especificado no arquivo `uxui/warm_paws_adoption_system/DESIGN.md`.

### 4.1 Personalidade e Tom de Voz
- **Acolhedor & Empático (Warm & Empathetic):** Transmite o calor do primeiro encontro entre o tutor e seu futuro pet. Curvas generosas, microinterações carinhosas.
- **Confiável & Profissional (Trustworthy & Professional):** Selos de verificação, histórico médico e vacinal claro, transparência nas etapas de triagem.
- **Alegre & Dinâmico (Joyful & Playful):** Formas suaves orgânicas (`rounded-2xl` a `rounded-full`), paleta vibrante e fotos expressivas em destaque.

### 4.2 Paleta de Cores e Tokens

| Token | Hex | Nome | Uso Principal |
|---|---|---|---|
| `primary` | `#FF7043` | Warm Coral | Botões principais, CTAs, corações de favoritos, destaques ativos |
| `primary-gradient` | `linear-gradient(135deg, #FF8A65 0%, #FF7043 100%)` | Coral Warm Glow | Gradiente de botões de ação primária |
| `secondary` | `#4DB6AC` | Soft Teal | Badges de saúde, vacinas, chat, botões secundários, rotas do mapa |
| `tertiary` | `#FFF3E0` | Apricot Cream | Fundo de badges de especificações (Idade, Porte, Sexo, Peso) |
| `surface` | `#FFFFFF` | Pure White | Cards elevados, bottom sheets, inputs, floating navbar |
| `background` | `#FAFAF8` | Warm Alabaster | Fundo oficial da aplicação mobile |
| `background-desktop`| `#EDEDEB` | Neutral Desktop | Fundo externo fora do container de 430px |
| `text-primary` | `#263238` | Deep Graphite | Títulos, valores de dados, texto principal |
| `text-secondary` | `#78909C` | Slate Grey | Subtítulos, labels, distâncias, metadados |
| `surface-variant` | `#E3F0F8` | Light Ice Blue | Containers de filtros selecionados e estados neutros |
| `error` | `#BA1A1A` | Crimson Red | Alertas, recusas, cancelamentos, denúncias |
| `success` | `#2E7D32` | Forest Green | Confirmações de adoção, status aprovado |

### 4.3 Tipografia
- **Família Tipográfica Principal:** `Plus Jakarta Sans`, sans-serif.
- **Fallback:** `Inter`, sans-serif.
- **Escalas:**
  - `Display Lg`: 36px / line-height 44px / weight 800 / letter-spacing -0.03em
  - `Headline Lg`: 24px (mobile) - 28px / line-height 32px / weight 700 / letter-spacing -0.02em
  - `Headline Md`: 20px / line-height 28px / weight 700 / letter-spacing -0.01em
  - `Headline Sm`: 18px / line-height 24px / weight 600
  - `Body Lg`: 16px / line-height 24px / weight 400
  - `Body Md`: 14px / line-height 20px / weight 400
  - `Body Sm`: 12px / line-height 18px / weight 400
  - `Label Lg`: 14px / line-height 20px / weight 700
  - `Label Md`: 12px / line-height 16px / weight 600
  - `Label Sm`: 11px / line-height 14px / weight 600 / letter-spacing +0.02em

### 4.4 Sombras e Elevação (Elevation System)
- **Nível 0 (Canvas):** Fundo base `#FAFAF8` sem elevação.
- **Nível 1 (Cards & Inputs):** `#FFFFFF` com `box-shadow: 0px 4px 16px rgba(38, 50, 56, 0.05)`.
- **Nível 2 (Floating Action & Nav):** Floating Navigation Bar e botões circulares com `box-shadow: 0px 8px 24px rgba(38, 50, 56, 0.08)`.
- **Nível 3 (Bottom Sheets & Modais):** Bottom Sheet superior com `box-shadow: 0px -8px 32px rgba(38, 50, 56, 0.12)`.
- **Primary Glow:** Botões de CTA primária com `box-shadow: 0px 8px 20px rgba(255, 112, 67, 0.35)`.

### 4.5 Componentes do Design System Mobile
1. **FloatingBottomNav:** Barra inferior com 5 abas flutuantes (Início, Explorar, Mapa, Favoritos, Perfil) com indicador em pílula coral ativa.
2. **PetCard:** Card vertical com foto de destaque em cantos `rounded-2xl`, botão de favoritar no canto superior direito, tag de distância aproximada e chips de gênero/idade.
3. **SpecBadge:** Caixas quadradas ou em pílula em `#FFF3E0` com ícone, rótulo em `#78909C` e valor em negrito `#263238` (ex: 2 anos, Macho, Médio, Vacinado).
4. **BottomSheet:** Gaveta deslizável inferior com cantos `rounded-t-[32px]`, grabber pill centralizado de 36x4px, usada para filtros avançados, detalhes de mapa e questionários.
5. **InteractiveMapMarker:** Marcador circular com miniatura do pet envolto em anel coral (`#FF7043`) ou teal (`#4DB6AC`), com pulso de expansão no item selecionado.
6. **PrimaryButton:** Botão em pílula total (`rounded-full`) com gradiente Coral e ícone circular branco no canto direito.
7. **SearchInput:** Barra de pesquisa em pílula com ícone de lupa à esquerda e botão de filtro integrado à direita.

---

## 5. STACK TECNOLÓGICA COMPLETA

```
┌────────────────────────────────────────────────────────────────────────┐
│                               PATINHAS                                 │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
           ┌───────────────────────┴───────────────────────┐
           ▼                                               ▼
┌───────────────────────┐                       ┌───────────────────────┐
│     APPS/WEB (UI)     │                       │     APPS/API (REST)   │
│  React 18 + Vite      │                       │  NestJS 10 + Node LTS │
│  TypeScript           │                       │  TypeScript           │
│  Tailwind CSS         │                       │  Prisma ORM           │
│  TanStack Query v5    │  REST API / WebSockets│  Socket.IO Gateway    │
│  Zustand              │◄─────────────────────►│  BullMQ Workers       │
│  React Hook Form + Zod│                       │  Passport JWT + Argon2│
│  MapLibre GL JS       │                       │  Swagger / OpenAPI    │
│  Framer Motion        │                       │  Pino Logger          │
│  i18next (PT, EN, ES) │                       │  Web Push (VAPID)     │
│  Workbox PWA          │                       │  Nodemailer           │
└───────────────────────┘                       └───────────┬───────────┘
                                                            │
                     ┌──────────────────────────────────────┼──────────────────────────────────────┐
                     ▼                                      ▼                                      ▼
          ┌───────────────────────┐              ┌───────────────────────┐              ┌───────────────────────┐
          │      POSTGRESQL       │              │         REDIS         │              │         MINIO         │
          │   + Extensão PostGIS  │              │   Cache de Consultas  │              │  Armazenamento S3     │
          │   Dados Relacionais   │              │   Filas BullMQ        │              │  Fotos de Animais     │
          │   Consultas Espaciais │              │   Sessões / Tokens    │              │  Comprovantes / Doc   │
          └───────────────────────┘              └───────────────────────┘              └───────────────────────┘
```

---

## 6. ESTRUTURA DE DIRETÓRIOS DO MONOREPO

```text
patinhas/
├── apps/
│   ├── web/                          # Frontend React Mobile-First
│   │   ├── public/                   # Manifest PWA, ícones, splash screens
│   │   ├── src/
│   │   │   ├── assets/               # Imagens e ilustrações
│   │   │   ├── components/           # Componentes do Design System Mobile
│   │   │   │   ├── ui/               # Botões, inputs, badges, bottom-sheets, modais
│   │   │   │   ├── layout/           # MobileAppShell, FloatingBottomNav, AppHeader
│   │   │   │   └── cards/            # PetCard, ShelterCard, EventCard
│   │   │   ├── features/             # Módulos verticais por funcionalidade
│   │   │   │   ├── auth/             # Login, cadastro, verificação de e-mail
│   │   │   │   ├── home/             # Tela inicial, novidades, urgentes
│   │   │   │   ├── explore/          # Busca avançada e filtros
│   │   │   │   ├── map/              # Tela MapLibre e visualização espacial
│   │   │   │   ├── pet-profile/      # Detalhes do animal e galeria
│   │   │   │   ├── adoption/         # Fluxo de questionário, timeline e histórico
│   │   │   │   ├── chat/             # Chat Socket.IO em tempo real
│   │   │   │   ├── favorites/        # Lista e modo swipe de favoritos
│   │   │   │   ├── shelter-admin/    # Dashboard mobile para ONGs e protetores
│   │   │   │   ├── master-admin/     # Painel de moderação e métricas Master
│   │   │   │   ├── lost-found/       # Animais perdidos e achados
│   │   │   │   ├── foster/           # Cadastro de lares temporários
│   │   │   │   └── post-adoption/    # Checklists e lembretes pós-adoção
│   │   │   ├── hooks/                # Hooks customizados (geolocation, push, websocket)
│   │   │   ├── i18n/                 # Locales pt-BR, en-US, es-ES
│   │   │   ├── services/             # Clientes Axios e endpoints de API
│   │   │   ├── store/                # Estados Zustand (authStore, filterStore)
│   │   │   ├── types/                # Tipos TypeScript específicos do frontend
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── Dockerfile
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   └── api/                          # Backend NestJS Monólito Modular
│       ├── src/
│       │   ├── common/               # Filters, interceptors, guards, decorators
│       │   ├── config/               # Configurações de ambiente validadas por Zod
│       │   ├── database/             # PrismaService e extensões PostGIS
│       │   ├── modules/              # Módulos verticais de negócio
│       │   │   ├── auth/             # Autenticação JWT, Argon2, Refresh Tokens
│       │   │   ├── users/            # Gestão de usuários e perfis
│       │   │   ├── organizations/    # ONGs, abrigos e equipes
│       │   │   ├── animals/          # CRUD de pets, fotos, atributos e status
│       │   │   ├── adoptions/        # Aplicações, questionários, timeline
│       │   │   ├── messaging/        # Chat instantâneo e Socket.IO Gateway
│       │   │   ├── notifications/    # Web Push, VAPID, templates
│       │   │   ├── geolocation/      # Consultas espaciais PostGIS e reverse-geo
│       │   │   ├── matching/         # Algoritmo de compatibilidade tutor-pet
│       │   │   ├── favorites/        # Gestão de curtidas e favoritos
│       │   │   ├── events/           # Feiras e eventos de adoção
│       │   │   ├── foster/           # Gestão de lares temporários
│       │   │   ├── lost-found/       # Anúncios de animais perdidos e achados
│       │   │   ├── donations/        # Campanhas e prestação de contas
│       │   │   ├── moderation/       # Denúncias, análise de anúncios e bloqueios
│       │   │   ├── administration/   # Métricas globais do Master Admin
│       │   │   └── audit/            # Trilha de auditoria e conformidade LGPD
│       │   ├── jobs/                 # Filas BullMQ e processadores assíncronos
│       │   ├── storage/              # Integração MinIO S3 (uploads, thumbnails)
│       │   ├── mail/                 # Nodemailer templates com Mailpit/SMTP
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── prisma/
│       │   ├── schema.prisma         # Modelagem completa das 36+ entidades
│       │   ├── migrations/
│       │   └── seed.ts
│       └── Dockerfile
│
├── packages/
│   ├── shared/                       # Constantes, enums e utilitários compartilhados
│   ├── types/                        # Tipagens TypeScript compartilhadas API/Web
│   └── config/                       # Configurações de ESLint, Prettier e TSConfig
│
├── docker/
│   ├── nginx/                        # Proxy reverso para roteamento web/api
│   ├── postgres/                     # Scripts de inicialização com PostGIS
│   └── scripts/                      # Healthcheck e inicialização de banco
│
├── uxui/                             # Protótipos de UX/UI aprovados e DESIGN.md
├── docker-compose.yml                # Orquestração completa de desenvolvimento
├── docker-compose.prod.yml           # Orquestração de produção com otimizações
├── .env.example                      # Variáveis de ambiente padrão
├── DOCUMENTACAO.md                   # Esta documentação
├── PASSOS.md                         # Planejamento das 27 etapas
└── CONTEXTO.md                       # Estado de execução e decisões
```

---

## 7. MODELAGEM DE DADOS (PRISMA + POSTGRESQL + POSTGIS)

Todas as tabelas utilizam identificadores únicos no formato UUID v4 (`@default(uuid())`), campos de auditoria (`created_at`, `updated_at`, `deleted_at` para soft delete onde aplicável) e tipos estritos.

### Principais Entidades e Relacionamentos

1. **`users`**: ID, email (único), password_hash (Argon2), role (`ADOPTER`, `PROTECTOR`, `SHELTER_MEMBER`, `MASTER_ADMIN`), status (`PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`), email_verified_at, created_at, updated_at.
2. **`user_profiles`**: user_id (FK), full_name, phone, birth_date, document_number (criptografado/mascarado), avatar_url, bio, address_city, address_state, location_geom (PostGIS `geometry(Point, 4326)`).
3. **`user_sessions`**: ID, user_id (FK), refresh_token_hash, user_agent, ip_address, expires_at, revoked_at.
4. **`organizations`**: ID, name, trade_name, cnpj (único), email, phone, bio, logo_url, verified_status (`UNVERIFIED`, `VERIFIED`, `REJECTED`), address_street, address_number, address_city, address_state, location_geom, created_at.
5. **`organization_members`**: organization_id (FK), user_id (FK), member_role (`OWNER`, `ADMIN`, `VOLUNTEER`).
6. **`animals`**: ID, organization_id (FK opcional), protector_id (FK opcional), name, species (`DOG`, `CAT`, `OTHER`), breed, age_approximate, age_unit (`MONTHS`, `YEARS`), sex (`MALE`, `FEMALE`), size (`SMALL`, `MEDIUM`, `LARGE`, `GIANT`), weight_kg, coat_color, description, status (`DRAFT`, `PENDING_REVIEW`, `AVAILABLE`, `IN_ADOPTION`, `ADOPTED`, `UNAVAILABLE`, `ARCHIVED`), is_special_needs, special_needs_description, compatibility_dogs, compatibility_cats, compatibility_children, energy_level (`LOW`, `MODERATE`, `HIGH`), city, state, location_geom.
7. **`animal_photos`**: ID, animal_id (FK), url, thumbnail_url, display_order, is_cover (boolean).
8. **`animal_videos`**: ID, animal_id (FK), url, duration_seconds.
9. **`animal_health_records`**: ID, animal_id (FK), is_vaccinated, vaccination_details, is_neutered, is_dewormed, medical_notes.
10. **`adoption_applications`**: ID, animal_id (FK), adopter_id (FK), current_status (`SUBMITTED`, `UNDER_REVIEW`, `INTERVIEW_SCHEDULED`, `APPROVED`, `REJECTED`, `CANCELLED`, `COMPLETED`), rejection_reason, interview_date, created_at, updated_at.
11. **`adoption_questionnaires`**: ID, application_id (FK), housing_type (`HOUSE`, `APARTMENT`), is_rented, has_outdoor_space, has_netting_screens, family_agreement, household_people_count, has_other_pets, monthly_budget, routine_hours_alone.
12. **`adoption_status_history`**: ID, application_id (FK), changed_by_user_id (FK), previous_status, new_status, observation, created_at.
13. **`conversations`**: ID, animal_id (FK), adopter_id (FK), shelter_or_protector_id (FK), created_at, updated_at.
14. **`messages`**: ID, conversation_id (FK), sender_id (FK), content, attachment_url, is_read, read_at, created_at.
15. **`favorites`**: user_id (FK), animal_id (FK), created_at.
16. **`push_subscriptions`**: ID, user_id (FK), endpoint, p256dh_key, auth_key, user_agent, created_at.
17. **`notifications`**: ID, user_id (FK), type, title, body, action_url, is_read, read_at, created_at.
18. **`notification_preferences`**: user_id (FK), email_messages, push_messages, email_status_change, push_status_change, quiet_hours_start, quiet_hours_end.
19. **`foster_profiles`**: ID, user_id (FK), capacity_pets, accepted_species, has_quarantine_space, availability_status, approval_status.
20. **`lost_found_reports`**: ID, user_id (FK), type (`LOST`, `FOUND`), pet_name, species, breed, color, distinctive_marks, photo_url, last_seen_date, city, state, location_geom, resolved_status (`OPEN`, `REUNITED`, `CLOSED`).
21. **`reports`**: ID, reporter_id (FK), target_type (`ANIMAL`, `USER`, `ORGANIZATION`, `MESSAGE`), target_id, reason, details, status (`PENDING`, `INVESTIGATING`, `RESOLVED`, `DISMISSED`), moderator_id, resolution_notes.
22. **`audit_logs`**: ID, actor_user_id, action, resource_type, resource_id, ip_address, user_agent, metadata_json, created_at.

---

## 8. FLUXOS DE ADOÇÃO E MÁQUINA DE ESTADOS

O processo de adoção é rigoroso, transparente e evita concorrência desleal ou duplicidade de adoções.

### 8.1 As 10 Etapas do Fluxo
```
[1. Demonstração de Interesse]
            │
            ▼
[2. Preenchimento do Questionário de Perfil]
            │
            ▼
[3. Solicitação Enviada (SUBMITTED)]
            │
            ▼
[4. Análise pela ONG/Protetor (UNDER_REVIEW)]
            │
            ▼
[5. Conversa pelo Chat Integrado]
            │
            ▼
[6. Agendamento de Entrevista/Visita (INTERVIEW_SCHEDULED)]
            │
            ▼
[7. Aprovação Prévia (APPROVED)]
            │
            ▼
[8. Assinatura do Termo de Adoção Responsável]
            │
            ▼
[9. Confirmação da Entrega (COMPLETED)]
            │
            ▼
[10. Acompanhamento Pós-Adoção (Checklists periódicos)]
```

### 8.2 Prevenção de Concorrência e Adoções Duplicadas
- Quando uma solicitação atinge o status `APPROVED`, o animal entra no status `IN_ADOPTION`. Novas aplicações para o mesmo pet são pausadas.
- A finalização (`COMPLETED`) utiliza transação Prisma (`prisma.$transaction`) com trava de linha (`SELECT FOR UPDATE`), atualizando atomicamente o pet para `ADOPTED` e cancelando automaticamente outras candidaturas em aberto com notificação cortês aos outros interessados.

---

## 9. GEOLOCALIZAÇÃO E MAPA INTERATIVO (POSTGIS + MAPLIBRE GL JS)

### 9.1 Consultas de Proximidade Espacial
O PostGIS calcula distâncias reais sobre o elipsoide WGS84 utilizando a função `ST_DWithin`:
```sql
SELECT a.id, a.name, a.species, a.breed, 
       ST_Distance(a.location_geom, ST_SetSRID(ST_MakePoint(:userLng, :userLat), 4326)::geography) / 1000.0 as distance_km
FROM animals a
WHERE a.status = 'AVAILABLE'
  AND ST_DWithin(a.location_geom::geography, ST_SetSRID(ST_MakePoint(:userLng, :userLat), 4326)::geography, :radiusMeters)
ORDER BY distance_km ASC;
```

### 9.2 Raios de Proximidade Disponíveis
- 5 km (bairro e imediações)
- 10 km (mesma região da cidade)
- 25 km (cidade inteira)
- 50 km (região metropolitana)
- 100 km (cidades vizinhas)
- 200 km (estado / viagens curtas)

### 9.3 Proteção de Privacidade Estrita (LGPD)
- **Protetores e Pessoas Físicas:** A coordenada geográfica armazenada no anúncio público recebe uma dispersão aleatória proposital de 300 a 800 metros (ruído geográfico). Nunca é exibido o endereço residencial nem o ponto exato no mapa.
- **ONGs e Abrigos Físicos:** Endereço comercial/institucional exibido publicamente apenas após aprovação e verificação do cadastro institucional.

---

## 10. ARQUITETURA DE COMUNICAÇÃO EM TEMPO REAL (SOCKET.IO)

### 10.1 Namespaces e Autenticação
O servidor Socket.IO opera sob `/ws` com middleware de autenticação JWT via cookie ou cabeçalho de handshake.

### 10.2 Eventos de Chat e Mensageria
- `join_conversation` / `leave_conversation`: Entrada em sala segura (`room:conv_{conversationId}`).
- `send_message`: Envio de mensagem com gravação prévia no banco.
- `receive_message`: Entrega instantânea na conversa.
- `typing_start` / `typing_stop`: Indicador visual "digitando...".
- `mark_as_read`: Atualização de recibo de leitura.

### 10.3 Eventos de Mapa e Notificações em Tempo Real
- `animal_status_updated`: Quando um animal é adotado ou reservado, o marcador no mapa de usuários ativos no raio de 50km é atualizado ou removido instantaneamente sem necessidade de reload.

---

## 11. SISTEMA DE NOTIFICAÇÕES (WEB PUSH + VAPID + BULLMQ)

- **Padrão W3C Web Push:** Funciona nativamente em navegadores modernos desktop e mobile (Chrome, Edge, Firefox, Safari iOS 16.4+ quando adicionado à tela inicial como PWA).
- **Chaves VAPID:** Par de chaves pública e privada para assinar as requisições enviadas aos serviços de push de cada fabricante de browser.
- **Filas BullMQ:** As notificações são enfileiradas no Redis para envio assíncrono, protegendo o tempo de resposta da API principal e gerenciando retentativas automáticas e controle de duplicação.
- **Horário de Silêncio:** O sistema respeita as preferências do usuário, retendo notificações não emergenciais entre 22h e 08h.

---

## 12. SEGURANÇA, AUTENTICAÇÃO E CONFORMIDADE LGPD

### 12.1 Hashing de Senhas com Argon2id
Utilização do algoritmo Argon2id com parâmetros recomendados pela OWASP (memória 64MB, 3 iterações, 4 threads de paralelismo), oferecendo resistência extrema contra ataques de dicionário e hardware especializado (GPUs/ASICs).

### 12.2 Gestão de Tokens
- **Access Token:** JWT de curta duração (15 minutos), armazenado em memória no cliente ou cookie seguro.
- **Refresh Token:** Token criptografado de longa duração (7 dias), mantido exclusivamente em cookie `HttpOnly`, `Secure`, `SameSite=Strict`. A cada uso, o token anterior é invalidado e um novo é emitido (rotação estrita de refresh token).

### 12.3 Proteção Contra Força Bruta e Abusos
- Rate Limiting via `@nestjs/throttler` integrado ao Redis.
- Bloqueio progressivo de IP após 5 tentativas de login falhas consecutivas.
- Verificação obrigatória de e-mail antes de habilitar publicações de animais ou adoções.

### 12.4 Conformidade com a LGPD (Lei 13.709/2018)
- Minimização de dados: Coleta estritamente necessária para a segurança do animal e idoneidade do adotante.
- Painel de Privacidade: O usuário pode solicitar download de seus dados em JSON ou exclusão de conta e anonimização de histórico.
- Termos de Uso e Política de Privacidade explícitos com versionamento de consentimento.

---

## 13. PROGRESSIVE WEB APP (PWA) E COMPORTAMENTO OFFLINE

- **Manifest WebApp (`manifest.json`):** Nome "Patinhas", `display: "standalone"`, `theme_color: "#FF7043"`, `background_color: "#FAFAF8"`, ícones adaptativos com máscara.
- **Service Worker via Workbox:**
  - Cache First para assets estáticos (fontes, ícones Lucide, folhas de estilo).
  - Stale-While-Revalidate para listas de animais em destaque e perfis visitados.
  - Network Only com fallback amigável para envio de formulários e mensagens de chat.
  - Tela amigável de "Sem Conexão" estilizada dentro do shell de 430px com instruções para o usuário.

---

## 14. ESTRATÉGIA DE TESTES E QUALIDADE

### 14.1 Pirâmide de Testes
1. **Frontend Unitário & Componentes (Vitest + React Testing Library):**
   - Teste de renderização isolada de todos os componentes do Design System.
   - Validação de formulários Zod e máscaras de entrada.
   - Comportamento de hooks de geolocalização e áudio de alerta.
2. **Backend Unitário & Integração (Jest + Supertest):**
   - Regras de negócio de mudança de status da adoção.
   - Concorrência de solicitações e transações atômicas no Prisma.
   - Algoritmo de cálculo de distância PostGIS e filtros por raio.
   - Autenticação, guards de RBAC e validação de tokens.
3. **End-to-End E2E (Playwright):**
   - Fluxo completo: Cadastro de usuário → Confirmação de e-mail → Publicação de pet → Busca com filtros → Favoritar → Envio de questionário → Aceite no painel da ONG.
4. **Testes Visuais Obrigatórios de Responsividade (Playwright Viewports):**
   - Execução em 11 resoluções distintas: `320px`, `360px`, `375px`, `390px`, `414px`, `430px`, `768px`, `1024px`, `1440px`, `1920px`, `2560px`.
   - **Critério inegociável:** Em qualquer resolução superior a 430px, o container `#mobile-app-root` deve ter exatamente `width: 430px`, estar centralizado com margens iguais e fundo externo `#EDEDEB`.

---

## 15. INFRAESTRUTURA DOCKER E AMBIENTES

Todo o sistema é orquestrado via `docker-compose.yml`. O desenvolvedor não precisa instalar Node.js, PostgreSQL ou Redis no host.

### 15.1 Serviços Definidos no Docker Compose

| Serviço | Imagem Base | Porta Exposta | Função |
|---|---|---|---|
| `web` | `node:20-alpine` (dev) / `nginx:alpine` (prod) | `3000` | Frontend React Vite |
| `api` | `node:20-alpine` | `3333` | Backend NestJS REST & WebSocket |
| `postgres` | `postgis/postgis:16-3.4-alpine` | `5432` | Banco PostgreSQL com PostGIS |
| `redis` | `redis:7-alpine` | `6379` | Cache e filas do BullMQ |
| `minio` | `minio/minio:latest` | `9000` (API) / `9001` (Console) | Storage compatível com AWS S3 |
| `mailpit` | `axllent/mailpit:latest` | `1025` (SMTP) / `8025` (Web UI) | Captura de e-mails em desenvolvimento |
| `worker` | `node:20-alpine` | - | Processador em segundo plano BullMQ |
| `nginx` | `nginx:alpine` | `80` / `443` | Gateway e proxy reverso unificado |

### 15.2 Volumes Persistentes
- `postgres_data`: Persistência de tabelas, índices e dados geoespaciais.
- `minio_data`: Persistência das imagens originais e thumbnails dos pets.
- `redis_data`: Persistência de filas e estado do broker.

---

## 16. CRITÉRIOS DE ACEITE FINAIS DO SISTEMA

1. Execução 100% autônoma via `docker compose up -d --build`.
2. O aplicativo deve obrigatoriamente manter a largura de 430px e centralização em qualquer navegador desktop.
3. Fidelidade visual estrita aos padrões e componentes do *Warm Paws Adoption System*.
4. Módulos de Adotante, Protetor, ONG e Admin Master 100% funcionais no formato mobile.
5. Mapa interativo com suporte a geolocalização e cálculo real de distâncias.
6. Chat e notificações em tempo real sem travamentos.
7. Suporte a internacionalização (PT-BR, EN, ES) com português como padrão.
8. PWA instalável com manifesto válido e suporte offline básico.
9. Cobertura de testes automatizados unitários, de integração e visuais.

---

## 17. MÓDULOS IMPLEMENTADOS (REGISTRO DE PROGRESSO)

### 17.1 Módulos Concluídos (Etapas 00 a 10)
- **Etapa 00 a 02 (Infraestrutura e Banco):** Monorepo PNPM/Turbo, Docker com 6 serviços ativos, Schema Prisma com 36+ entidades, migrations PostGIS com índices espaciais GIST e seed Argon2id.
- **Etapa 03 (Design System):** `MobileAppShell` (max 430px), `FloatingBottomNav` (5 abas), botões, cards, bottom sheets e feedback visual `Warm Paws`.
- **Etapa 04 a 05 (Auth, Usuários e ONGs):** JWT em cookies HttpOnly, Argon2id, Storage MinIO S3, edição de perfil, gestão de ONGs e membros.
- **Etapa 06 (Cadastro de Animais):** CRUD com `AnimalsModule`, stepper assistido de cadastro em 6 etapas, ficha médica e ruído de privacidade PostGIS.
- **Etapa 07 (Home e Busca Avançada):** `HomeView` Bento, `ExploreView` em grid de 2 colunas, filtros avançados em Bottom Sheet e histórias felizes de adoção.
- **Etapa 08 (Mapa e Geolocalização):** MapLibre GL JS, endpoint PostGIS `ST_DWithin` no formato GeoJSON FeatureCollection (RFC 7946), marcador "Você" pulsante e preview cards.
- **Etapa 09 (Favoritos e Modo Descoberta):** `FavoritesModule` no NestJS (`GET /favorites`, `GET /favorites/ids`, `POST /favorites/:id`, `DELETE /favorites/:id`), tela de favoritos com abas e filtros, e `DiscoveryModeModal` (Swipe estilo Tinder com Framer Motion, badges "QUERO ADOTAR" e "DEPOIS", super like e ações táteis).
- **Etapa 10 (Processo de Adoção e Questionários):** `AdoptionsModule` no NestJS com máquina de estados rigorosa (`SUBMITTED` → `UNDER_REVIEW` → `INTERVIEW_SCHEDULED` → `APPROVED` → `COMPLETED`), agendamento de entrevistas, conclusão atômica com trava de concorrência (`prisma.$transaction`) que marca o pet como `ADOPTED` e encerra candidaturas concorrentes; `AdoptionQuestionnaireModal` em 3 passos acolhedores (Lar, Rotina e Compromisso de Guarda Responsável); `MyAdoptionsView` com Stepper visual de 5 etapas baseado em `uxui/ado_es_em_andamento_patinhas`; e `AdoptionProcessDetailModal` com timeline detalhada de auditoria.


