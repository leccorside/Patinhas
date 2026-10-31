# 🐾 PLANO DE IMPLEMENTAÇÃO E PASSOS — PLATAFORMA PATINHAS

> **Projeto:** Patinhas — Plataforma de Adoção de Animais  
> **Formato:** Webapp Mobile Permanente (Max 430px)  
> **Identidade:** Warm Paws Adoption System (`uxui/warm_paws_adoption_system/DESIGN.md`)  
> **Status:** Etapa 00 em andamento. Aguardando autorização para Etapa 01.

---

## 📌 REGRAS DE EXECUÇÃO
1. Nenhuma etapa pode ser iniciada sem autorização explícita do usuário.
2. Não marcar `[x]` antes que as tarefas estejam concluídas e validadas por testes.
3. Ao término de cada etapa, atualizar `DOCUMENTACAO.md`, `PASSOS.md` e `CONTEXTO.md`.
4. Apresentar sugestão de commit no padrão Conventional Commits ao final de cada entrega.

---

## ETAPA 00 — Documentação e Arquitetura

**Objetivo:** Criar e alinhar toda a documentação, modelagem de dados, arquitetura, design system mobile e regras do projeto antes de escrever código ou iniciar containers.

**Dependências:** Nenhuma.

**Tarefas:**
- [x] Ler e analisar o `PROMPT.md` e os arquivos de UX/UI aprovados em `uxui/`
- [x] Criar `DOCUMENTACAO.md` contendo todos os requisitos e especificações de arquitetura
- [x] Criar `PASSOS.md` detalhando as 27 etapas ordenadas por prioridade
- [x] Criar `CONTEXTO.md` registrando o estado inicial, decisões técnicas e pendências
- [ ] Apresentar resumo da arquitetura e aguardar aprovação explícita do usuário

**Arquivos envolvidos:**
- `DOCUMENTACAO.md`
- `PASSOS.md`
- `CONTEXTO.md`

**Critérios de aceite:**
- Três arquivos criados na raiz do projeto.
- Nenhuma dependência instalada e nenhum container criado antes da autorização.
- Especificação de 430px de largura máxima registrada em todas as diretrizes.
- Tokens e paleta do *Warm Paws Adoption System* refletidos fielmente.

**Testes:**
- Validação de integridade dos arquivos markdown gerados.

**Resultado esperado:**
Base de documentação aprovada para início da configuração de infraestrutura.

---

## ETAPA 01 — Monorepo e Infraestrutura Docker

**Objetivo:** Estabelecer a estrutura do monorepo e configurar o ambiente de desenvolvimento 100% conteinerizado via Docker Compose.

**Dependências:** Etapa 00 aprovada.

**Tarefas:**
- [x] Criar estrutura de diretórios (`apps/web`, `apps/api`, `packages/shared`, `packages/types`, `packages/config`, `docker/`)
- [x] Configurar monorepo com npm workspaces no `package.json` raiz
- [x] Criar `docker-compose.yml` com serviços: web, api, postgres (postgis), redis, minio, mailpit
- [x] Criar `docker-compose.prod.yml` para produção com Nginx gateway
- [x] Criar `.env.example` e `.env` com todas as variáveis documentadas e portas dedicadas
- [x] Criar `Dockerfile` e `Dockerfile.dev` para `apps/web` (Vite dev / Nginx prod)
- [x] Criar `Dockerfile` e `Dockerfile.dev` para `apps/api` (NestJS dev / dist prod)
- [x] Configurar health checks para Postgres, Redis e Mailpit
- [x] Criar scripts de inicialização (`docker/postgres/init-postgis.sh`) e proxy Nginx

**Arquivos envolvidos:**
- `docker-compose.yml`, `docker-compose.prod.yml`, `.env.example`, `.env`
- `apps/web/Dockerfile`, `apps/web/Dockerfile.dev`, `apps/api/Dockerfile`, `apps/api/Dockerfile.dev`
- `package.json`, `packages/*/package.json`, `docker/postgres/init-postgis.sh`, `docker/nginx/nginx.conf`

**Critérios de aceite:**
- Execução bem-sucedida de `docker compose up -d`.
- Todos os serviços reportando status `healthy` ou ativos.
- Frontend (porta 3005) e backend (porta 3333) acessíveis e comunicando-se.
- PostGIS 3.4 ativo no PostgreSQL 16.

**Testes:**
- Teste de subida de containers e verificação de logs limpos (`docker compose ps` e `docker logs`).
- Teste de requisições HTTP (`/api/v1/health`, `/api/docs`, web UI, mailpit e minio).
- Teste de consulta geoespacial PostGIS no container PostgreSQL.

**Resultado esperado:**
Ambiente Docker completo rodando sem requerer Node.js ou banco instalados no host. Concluído com êxito!

---

## ETAPA 02 — Banco de Dados, Migrations e Seed

**Objetivo:** Modelar o banco relacional PostgreSQL com extensão PostGIS utilizando Prisma ORM e criar migrations e seeds iniciais.

**Dependências:** Etapa 01.

**Tarefas:**
- [x] Inicializar Prisma em `apps/api`
- [x] Habilitar extensão PostGIS e UUID no PostgreSQL
- [x] Modelar schema Prisma com as 36+ entidades definidas na documentação
- [x] Configurar tipos espaciais para coordenadas (`location_geom`) e campos latitude/longitude
- [x] Criar 5 índices espaciais GIST para buscas por proximidade (animals, organizations, profiles, etc.)
- [x] Gerar e aplicar primeira migration versionada (`20261031000000_init`)
- [x] Criar script de seed (`seed.ts`) com dados reais: Master Admin, ONGs, protetores, adotantes e animais demonstrativos (Charlie, Luna, Thor, Mel) com Argon2id
- [x] Criar `PrismaService` e `PrismaModule` integrados globalmente à API NestJS

**Arquivos envolvidos:**
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20261031000000_init/migration.sql`
- `apps/api/prisma/seed.ts`
- `apps/api/src/database/prisma.service.ts`
- `apps/api/src/database/prisma.module.ts`
- `apps/api/src/app.module.ts`, `apps/api/src/app.controller.ts`

**Critérios de aceite:**
- Migration executada sem erros no container PostgreSQL.
- Seed populando banco com dados coerentes e hashes Argon2id.
- Índices espaciais GIST criados no PostgreSQL.
- Endpoint `/api/v1/health` reportando `"database": "connected"` e métricas do banco.
- Endpoint `/api/v1/animals/demo` servindo dados reais para o frontend.

**Testes:**
- Teste de consulta geoespacial PostGIS (`ST_Distance` ordenando animais por km a partir do centro de SP).
- Teste de integração HTTP com Prisma no NestJS retornando animais com fotos, traits e organização.

**Resultado esperado:**
Banco de dados estruturado, seguro, com dados de exemplo e cálculo geoespacial ativo. Concluído com êxito!

---

## ETAPA 03 — MobileAppShell e Design System Mobile

**Objetivo:** Criar o container global de contenção mobile (430px) e o design system com base no *Warm Paws Adoption System* (`uxui/`).

**Dependências:** Etapa 01.

**Tarefas:**
- [x] Configurar Tailwind CSS em `apps/web` com a paleta exata de `uxui/warm_paws_adoption_system/DESIGN.md` (Warm Coral, Soft Teal, Apricot, Charcoal)
- [x] Importar fontes `Plus Jakarta Sans` e `Inter`
- [x] Criar componente `MobileAppShell` (max-w-[430px], bg desktop `#EDEDEB`, bg app `#FAFAF8`, centralizado)
- [x] Criar componente `FloatingBottomNav` com 5 abas flutuantes e indicador em pílula coral com animação Framer Motion
- [x] Criar componente `AppHeader` com localização, saudação e sininho de notificações com badge
- [x] Criar componentes de UI base do Design System:
  - `PrimaryButton` (gradiente coral `#FF8A65` → `#FF7043`, pílula, sombra quente, ícone opcional)
  - `SecondaryButton` (verde-azulado `#4DB6AC`, contorno ou ghost)
  - `PetCard` (foto em cantos arredondados `rounded-3xl`, selo de distância, botão de favoritar, badges de sexo/idade, match score)
  - `SpecBadge` (caixas em pílula ou quadradas em `#FFF3E0` para idade, sexo, porte e peso)
  - `BottomSheet` (com grabber pill 36x4px e cantos superiores arredondados 32px, animação spring)
  - `Dialog` (modal centralizado estritamente contido nos 430px)
  - `SearchInput` (pílula com ícone de lupa e botão de filtros integrado)
  - `Badge` (para tags médicas, status, espécies)
  - `Toast` (notificações efêmeras contidas nos 430px)
  - `SkeletonLoader` e `PetCardSkeleton` (efeito shimmer de carregamento)
  - `EmptyState` (estado vazio acolhedor com ilustração)
  - `Tabs` (abas horizontais deslizáveis com indicador pílula)
- [x] Configurar animações e microinterações com Framer Motion
- [x] Montar vitrine interativa de componentes na aplicação para testes visuais
- [x] Validar compilação limpa do Vite e TypeScript sem erros

**Arquivos envolvidos:**
- `apps/web/src/components/layout/MobileAppShell.tsx`
- `apps/web/src/components/layout/FloatingBottomNav.tsx`
- `apps/web/src/components/layout/AppHeader.tsx`
- `apps/web/src/components/ui/*`
- `apps/web/src/components/cards/PetCard.tsx`
- `apps/web/src/components/index.ts`
- `apps/web/src/App.tsx`, `apps/web/tailwind.config.js`

**Critérios de aceite:**
- Em qualquer monitor (1080p, 1440p, 4K), a aplicação fica restrita a 430px de largura e centralizada.
- Componentes com visual idêntico ao protótipo da pasta `uxui/`.
- Microinterações de favoritar, abrir bottom sheets e alternar abas operacionais.

**Testes:**
- Build completo do Vite transformando 1869 módulos com sucesso (`npm run build`).
- Validação visual dos componentes, sombras e paleta em [http://localhost:3005](http://localhost:3005).

**Resultado esperado:**
Design system mobile completo e operacional, pronto para receber as telas do app. Concluído com êxito!

---

## ETAPA 04 — Autenticação e Segurança

**Objetivo:** Implementar o fluxo seguro de autenticação com Argon2id, JWT com refresh rotativo em cookies HttpOnly e confirmação por e-mail.

**Dependências:** Etapas 02 e 03.

**Tarefas:**
- [x] Backend: Módulo Auth no NestJS (registro, login, logout, refresh, reset de senha)
- [x] Backend: Hashing de senhas com padrão Argon2id (OWASP)
- [x] Backend: Emissão de JWT Access Token (15m) e Refresh Token rotativo (7d) em cookies `HttpOnly` seguros e tabela `user_sessions`
- [x] Backend: Envio assíncrono de e-mails de confirmação e recuperação de senha via Mailpit usando Nodemailer
- [x] Backend: Implementação de Guards e Decorators (`JwtAuthGuard`, `@CurrentUser()`, `RolesGuard`, `@Roles()`)
- [x] Frontend: Telas mobile de Login, Cadastro, Confirmação de E-mail e Modal de Recuperação de Senha estilizadas no Warm Paws System
- [x] Frontend: Integração com Zustand (`authStore.ts`) para persistência de sessão e verificação automática (`/api/v1/auth/me`)
- [x] Frontend: Atalhos com 1 clique para login de teste (Adotante, ONG Líder, Admin Master) e visualização de perfil autenticado

**Arquivos envolvidos:**
- `apps/api/src/modules/auth/*` (controller, service, module, dtos, guards, strategies, decorators)
- `apps/api/src/modules/mail/*` (mail service, templates com Warm Coral, mail module)
- `apps/web/src/store/authStore.ts`
- `apps/web/src/features/auth/LoginView.tsx`
- `apps/web/src/features/auth/RegisterView.tsx`
- `apps/web/src/features/auth/ForgotPasswordModal.tsx`
- `apps/web/src/App.tsx`, `apps/api/src/app.module.ts`

**Critérios de aceite:**
- Login rejeita credenciais incorretas com 401 Unauthorized e aceita credenciais válidas com JWT.
- Refresh token rotativo e cookies seguros `HttpOnly` configurados.
- Senhas protegidas com Argon2id.
- E-mails de confirmação capturados e verificáveis no Mailpit (`http://localhost:8026`).
- Rota protegida `/api/v1/auth/me` retorna dados reais do usuário logado.

**Testes:**
- Teste de login com sucesso (`lucas.adotante@gmail.com` / `Patinhas@2026`).
- Teste de login com senha incorreta retornando HTTP 401.
- Teste de cadastro de novo usuário (`mariana@teste.com`) e validação de recebimento de e-mail no Mailpit.
- Teste de autenticação Bearer na rota protegida `/api/v1/auth/me`.
- Build do frontend React compilando 1886 módulos com 0 erros.

**Resultado esperado:**
Sistema de autenticação robusto e seguro em pleno funcionamento. Concluído com êxito!

---

## ETAPA 05 — Usuários, Perfis e Organizações (ONGs)

**Objetivo:** Permitir gestão de perfis individuais (adotante, protetor) e cadastro institucional de ONGs com membros e validação de documentos.

**Dependências:** Etapa 04.

**Tarefas:**
- [ ] Backend: Módulo de Usuários e Perfis com upload de avatar no MinIO
- [ ] Backend: Módulo de Organizações (cadastro de ONG, CNPJ, dados de contato, upload de logotipo)
- [ ] Backend: Gestão de múltiplos membros por ONG com papéis (Owner, Admin, Voluntário)
- [ ] Frontend: Tela de Perfil do Usuário baseada em `uxui/perfil_do_adotante_patinhas`
- [ ] Frontend: Fluxo de cadastro institucional de ONGs
- [ ] Frontend: Upload e corte de fotos com preview

**Arquivos envolvidos:**
- `apps/api/src/modules/users/*`, `apps/api/src/modules/organizations/*`
- `apps/web/src/features/profile/*`, `apps/web/src/features/organizations/*`

**Critérios de aceite:**
- Upload seguro de fotos armazenadas no MinIO e servidas com URLs assinadas/públicas.
- Edição de perfil refletindo instantaneamente no app.

**Testes:**
- Testes unitários para regras de permissão de membros da ONG.

**Resultado esperado:**
Perfis individuais e de organizações ativos e prontos para cadastrar pets.

---

## ETAPA 06 — Cadastro e Gestão de Animais

**Objetivo:** Desenvolver o formulário assistido em etapas para cadastro de pets, upload de fotos com compressão e ciclo de vida do animal.

**Dependências:** Etapa 05.

**Tarefas:**
- [ ] Backend: Módulo de Animais (CRUD, upload de fotos múltiplas, thumbnails automáticos)
- [ ] Backend: Suporte a status (`DRAFT`, `PENDING_REVIEW`, `AVAILABLE`, `IN_ADOPTION`, `ADOPTED`)
- [ ] Backend: Gravação da localização aproximada com PostGIS
- [ ] Frontend: Formulário em etapas (Stepper mobile): Dados básicos, Fotos, Saúde, Personalidade, Localização, Requisitos
- [ ] Frontend: Validação de imagens (tamanho máximo, tipos permitidos) e ordenação de galeria
- [ ] Frontend: Tela de detalhes do pet baseada em `uxui/perfil_do_pet_charlie`

**Arquivos envolvidos:**
- `apps/api/src/modules/animals/*`
- `apps/web/src/features/animals/*`, `apps/web/src/features/pet-profile/*`

**Critérios de aceite:**
- Criação e edição de anúncios de animais com galeria de até 6 fotos.
- Imagens otimizadas com geração de thumbnail.
- Localização geográfica calculada a partir do CEP/cidade com máscara de privacidade.

**Testes:**
- Teste de upload e processamento de imagens e validação dos campos obrigatórios.

**Resultado esperado:**
Animais cadastrados com fotos de alta qualidade e informações médicas completas.

---

## ETAPA 07 — Home, Busca e Filtros Avançados

**Objetivo:** Implementar a tela inicial e a experiência de busca e exploração com filtros detalhados em Bottom Sheet.

**Dependências:** Etapa 06.

**Tarefas:**
- [ ] Backend: Endpoints de listagem paginada com busca textual e filtros combinados
- [ ] Frontend: Tela Home baseada em `uxui/in_cio_patinhas_ado_o` (Categorias, Próximos, Urgentes, Histórias)
- [ ] Frontend: Tela Explorar baseada em `uxui/explorar_filtros_patinhas`
- [ ] Frontend: Bottom Sheet com filtros: Espécie, Porte, Sexo, Idade, Vacinação, Castração, Convivência
- [ ] Frontend: Infinite scroll com TanStack Query (`useInfiniteQuery`)
- [ ] Frontend: Barra de pesquisa instantânea com debounce

**Arquivos envolvidos:**
- `apps/api/src/modules/animals/controllers/animals.controller.ts`
- `apps/web/src/features/home/*`, `apps/web/src/features/explore/*`

**Critérios de aceite:**
- Filtros múltiplos funcionando em tempo real.
- Rolagem infinita fluida sem recarregamento de página.
- Visual rigorosamente alinhado ao protótipo `uxui/in_cio_patinhas_ado_o`.

**Testes:**
- Testes de integração de busca com múltiplas combinações de filtros.

**Resultado esperado:**
Experiência de descoberta de animais dinâmica, agradável e rápida.

---

## ETAPA 08 — Mapa Interativo e Geolocalização

**Objetivo:** Construir o mapa interativo em MapLibre GL JS limitado aos 430px com consultas de proximidade espaciais no PostGIS.

**Dependências:** Etapa 07.

**Tarefas:**
- [ ] Backend: Endpoint `/api/v1/animals/nearby` com consulta PostGIS `ST_DWithin`
- [ ] Frontend: Integração do MapLibre GL JS dentro do container de 430px
- [ ] Frontend: Captura da localização do usuário via Geolocation API com permissão
- [ ] Frontend: Marcadores customizados com a miniatura do pet e anel coral
- [ ] Frontend: Seletor de raio (5, 10, 25, 50, 100, 200 km) com círculo visual translúcido
- [ ] Frontend: Bottom Sheet interativo ao clicar em um marcador com detalhes rápidos
- [ ] Frontend: Botão de centralização e alternância rápida Mapa ↔ Lista

**Arquivos envolvidos:**
- `apps/api/src/modules/geolocation/*`
- `apps/web/src/features/map/*` (baseado em `uxui/mapa_de_ado_o_patinhas`)

**Critérios de aceite:**
- O mapa renderiza perfeitamente contido nos 430px sem transbordar horizontalmente.
- Protetores individuais exibem localização aproximada com ruído de segurança.
- Marcadores agrupam-se (clusterização) em níveis de zoom distantes.

**Testes:**
- Teste de consulta PostGIS validando retorno de animais dentro e fora do raio definido.

**Resultado esperado:**
Mapa de adoção interativo, fluido e com proteção de dados de localização.

---

## ETAPA 09 — Favoritos e Modo Descoberta

**Objetivo:** Permitir favoritar animais com sincronização no banco e disponibilizar tela de favoritos com opção de descoberta rápida.

**Dependências:** Etapa 07.

**Tarefas:**
- [ ] Backend: Endpoints de favoritar, desfavoritar e listar favoritos do usuário
- [ ] Frontend: Ação de favoritar com animação de coração nos PetCards
- [ ] Frontend: Tela de favoritos baseada em `uxui/meus_favoritos_patinhas`
- [ ] Frontend: Modo opcional de cards deslizáveis (Swipe estilo cards) para descoberta rápida
- [ ] Frontend: Alerta visual quando um pet favoritado muda de status

**Arquivos envolvidos:**
- `apps/api/src/modules/favorites/*`
- `apps/web/src/features/favorites/*`

**Critérios de aceite:**
- Estado de favorito atualizado com otimismo de UI (Optimistic Updates via TanStack Query).
- Persistência imediata no PostgreSQL.

**Testes:**
- Testes unitários do hook de favoritos e testes de componente.

**Resultado esperado:**
Área de favoritos intuitiva e sincronizada entre sessões do usuário.

---

## ETAPA 10 — Processo Completo de Adoção e Questionários

**Objetivo:** Implementar o fluxo completo de adoção em 10 etapas com questionário de triagem, timeline visual e controle de concorrência.

**Dependências:** Etapa 06 e 07.

**Tarefas:**
- [ ] Backend: Modelagem e endpoints de candidaturas (`adoption_applications`)
- [ ] Backend: Questionário de elegibilidade do adotante (`adoption_questionnaires`)
- [ ] Backend: Máquina de estados com validação estrita de transições
- [ ] Backend: Transação de conclusão de adoção com trava de concorrência (`prisma.$transaction`)
- [ ] Frontend: Formulário de questionário do adotante em passos mobile
- [ ] Frontend: Tela de acompanhamento baseada em `uxui/ado_es_em_andamento_patinhas`
- [ ] Frontend: Timeline visual do progresso da adoção com ícones de status

**Arquivos envolvidos:**
- `apps/api/src/modules/adoptions/*`
- `apps/web/src/features/adoption/*`

**Critérios de aceite:**
- Prevenção garantida contra adoção dupla do mesmo pet.
- Adoção finalizada cancela com elegância outras candidaturas concorrentes.
- Timeline exibe o estado atual em tempo real.

**Testes:**
- Testes de integração de concorrência com duas solicitações simultâneas aprovadas.

**Resultado esperado:**
Fluxo de adoção seguro, transparente e com experiência acolhedora.

---

## ETAPA 11 — Chat em Tempo Real (Socket.IO)

**Objetivo:** Construir o chat instantâneo entre o adotante e a ONG/protetor vinculado ao pet em processo de adoção.

**Dependências:** Etapa 10.

**Tarefas:**
- [ ] Backend: Gateway Socket.IO com autenticação JWT e rooms por conversa
- [ ] Backend: Persistência de mensagens no PostgreSQL e histórico paginado
- [ ] Backend: Envio de anexos (fotos de comprovantes/recintos) com upload MinIO
- [ ] Frontend: Interface de chat mobile baseada em `uxui/processo_de_ado_o_chat_patinhas`
- [ ] Frontend: Indicador de digitação em tempo real ("digitando...")
- [ ] Frontend: Recibos de leitura (mensagens lidas / não lidas)
- [ ] Frontend: Reconexão automática em caso de oscilação de sinal

**Arquivos envolvidos:**
- `apps/api/src/modules/messaging/*`
- `apps/web/src/features/chat/*`

**Critérios de aceite:**
- Mensagens entregues em menos de 100ms em rede local/Docker.
- Interface contida no container de 430px com rolagem automática para a última mensagem.
- Usuários não autorizados impedidos de escutar ou enviar mensagens na conversa.

**Testes:**
- Testes de WebSocket simulando dois clientes simultâneos trocando mensagens.

**Resultado esperado:**
Chat em tempo real com excelente experiência mobile e segurança completa.

---

## ETAPA 12 — Notificações Push (Web Push + VAPID)

**Objetivo:** Configurar notificações reais via navegador (Web Push API) para avisos de novas mensagens, status de adoção e alertas.

**Dependências:** Etapa 11.

**Tarefas:**
- [ ] Backend: Geração de par de chaves VAPID e endpoint para registrar inscrições push
- [ ] Backend: Fila BullMQ no Redis para envio assíncrono de notificações
- [ ] Frontend: Registro de Service Worker para recepção de eventos `push` e `notificationclick`
- [ ] Frontend: Banner acolhedor de solicitação de permissão (Opt-in)
- [ ] Frontend: Central de Notificações baseada em `uxui/notifica_es_alertas_patinhas`
- [ ] Frontend: Configuração de horários de silêncio e preferências por canal

**Arquivos envolvidos:**
- `apps/api/src/modules/notifications/*`
- `apps/web/src/features/notifications/*`
- `apps/web/public/sw.js`

**Critérios de aceite:**
- Disparo de push ao receber mensagem no chat ou mudança de status na adoção.
- Clique na notificação abre diretamente a tela do evento no app.

**Testes:**
- Teste de enfileiramento e processamento de jobs na fila BullMQ de notificações.

**Resultado esperado:**
Sistema de notificações push funcional mantendo o adotante engajado.

---

## ETAPA 13 — Match Inteligente Adotante ↔ Pet

**Objetivo:** Desenvolver algoritmo determinístico de compatibilidade entre o questionário do adotante e as características do animal.

**Dependências:** Etapas 06 e 10.

**Tarefas:**
- [ ] Backend: Serviço de cálculo de compatibilidade baseado em critérios ponderados (espaço físico, tempo disponível, presença de crianças, outros pets, nível de energia)
- [ ] Backend: Endpoint para obter porcentagem de match e justificativas detalhadas
- [ ] Frontend: Badge com percentual de match no PetCard (ex: "95% compatível com você")
- [ ] Frontend: Modal/Sheet explicativo com motivos da compatibilidade e pontos de atenção
- [ ] Preparar arquitetura de interfaces para substituição ou enriquecimento futuro por IA

**Arquivos envolvidos:**
- `apps/api/src/modules/matching/*`
- `apps/web/src/features/pet-profile/components/MatchScoreBadge.tsx`

**Critérios de aceite:**
- Algoritmo não bloqueia adoções, mas fornece recomendação clara e educativa.
- Transparência total na explicação do índice.

**Testes:**
- Testes unitários com casos de teste (adotante em apartamento sem telas vs pet hiperativo).

**Resultado esperado:**
Índice de match intuitivo auxiliando adoções com maior probabilidade de sucesso.

---

## ETAPA 14 — Dashboard Mobile para ONGs e Protetores

**Objetivo:** Criar o painel de gestão para responsáveis por animais com métricas e gestão de solicitações em formato estritamente mobile.

**Dependências:** Etapas 06 e 10.

**Tarefas:**
- [ ] Backend: Endpoints de agregação e métricas por organização (totais, taxa de adoção, pendências)
- [ ] Frontend: Dashboard mobile com cards de estatísticas compactos
- [ ] Frontend: Gestão de solicitações de adoção recebidas (Aprovar, Agendar, Recusar)
- [ ] Frontend: Gestão do time e colaboradores da ONG
- [ ] Frontend: Relatórios em formato de lista e gráficos leves adaptados a 430px

**Arquivos envolvidos:**
- `apps/api/src/modules/organizations/controllers/shelter-dashboard.controller.ts`
- `apps/web/src/features/shelter-admin/*`

**Critérios de aceite:**
- Dashboard 100% responsivo dentro da largura de 430px sem tabelas horizontais largas.
- Mudanças de status de candidaturas refletidas imediatamente.

**Testes:**
- Testes de autorização garantindo que apenas membros da ONG visualizem seus dados.

**Resultado esperado:**
Painel de gestão intuitivo na palma da mão para protetores e voluntários.

---

## ETAPA 15 — Admin Master (Painel de Gestão da Plataforma)

**Objetivo:** Criar o painel administrativo global para moderação, auditoria e controle de integridade da plataforma no formato mobile.

**Dependências:** Etapa 14.

**Tarefas:**
- [ ] Backend: Módulo Admin Master com endpoints protegidos por papel `MASTER_ADMIN`
- [ ] Backend: Métricas globais da plataforma (usuários ativos, adoções totais, denúncias ativas)
- [ ] Frontend: Dashboard Master adaptado para visualização em smartphone
- [ ] Frontend: Gestão e verificação manual de cadastros de ONGs
- [ ] Frontend: Visualização de logs de auditoria e atividades críticas

**Arquivos envolvidos:**
- `apps/api/src/modules/administration/*`
- `apps/web/src/features/master-admin/*`

**Critérios de aceite:**
- Acesso estritamente bloqueado para usuários não autorizados com resposta 403 Forbidden.
- Visual em conformidade com o Mobile App Shell sem sidebar de desktop.

**Testes:**
- Testes de segurança e controle de acesso via Guard NestJS.

**Resultado esperado:**
Controle total da operação da plataforma com mobilidade.

---

## ETAPA 16 — Moderação, Denúncias e Antifraude

**Objetivo:** Implementar ferramentas para denúncia de maus-tratos, comércio ilegal de animais e moderação preventiva de conteúdos.

**Dependências:** Etapa 15.

**Tarefas:**
- [ ] Backend: Módulo de Denúncias (`reports`) com classificação de gravidade
- [ ] Backend: Fluxo de aprovação prévia de anúncios de novos usuários
- [ ] Backend: Bloqueio e suspensão imediata de contas fraudulentas
- [ ] Frontend: Botão e fluxo de "Denunciar Anúncio / Usuário" nos perfis e no chat
- [ ] Frontend: Tela de triagem de denúncias para moderadores com histórico de ações

**Arquivos envolvidos:**
- `apps/api/src/modules/moderation/*`
- `apps/web/src/features/moderation/*`

**Critérios de aceite:**
- Denúncias registradas com registro de data/hora e trilha de auditoria.
- Anúncios com 3 ou mais denúncias graves suspensos preventivamente de forma automática.

**Testes:**
- Testes de ponta a ponta do fluxo de denúncia e resolução pelo moderador.

**Resultado esperado:**
Ambiente seguro e protegido contra fraudes e comércio de animais.

---

## ETAPA 17 — Módulo de Animais Perdidos e Encontrados

**Objetivo:** Criar seção independente para cadastro e busca geolocalizada de animais desaparecidos na região.

**Dependências:** Etapas 06 e 08.

**Tarefas:**
- [ ] Backend: Módulo `lost-found` com separação estrita de animais para adoção
- [ ] Backend: Busca espacial de pets perdidos por proximidade do último local visto
- [ ] Frontend: Telas de "Perdi meu Pet" e "Encontrei um Pet"
- [ ] Frontend: Marcadores visuais diferenciados no mapa (alerta amarelo/vermelho)
- [ ] Frontend: Status de reencontro ("Reencontrado!") com celebração e arquivamento

**Arquivos envolvidos:**
- `apps/api/src/modules/lost-found/*`
- `apps/web/src/features/lost-found/*`

**Critérios de aceite:**
- Pets perdidos não são misturados com a listagem comum de adoção.
- Contato entre as partes protegido para evitar extorsões.

**Testes:**
- Testes de filtragem espacial no endpoint de animais perdidos.

**Resultado esperado:**
Módulo comunitário ágil para resgate e reencontro de animais.

---

## ETAPA 18 — Gestão de Lares Temporários

**Objetivo:** Permitir que voluntários se cadastrem para oferecer acolhimento temporário a pets resgatados.

**Dependências:** Etapa 05 e 06.

**Tarefas:**
- [ ] Backend: Módulo de Lares Temporários (`foster_profiles`)
- [ ] Backend: Filtros por tipo de imóvel, espécies aceitas e capacidade de acolhimento
- [ ] Frontend: Formulário de voluntariado de lar temporário
- [ ] Frontend: Painel da ONG para buscar e alocar lares temporários disponíveis

**Arquivos envolvidos:**
- `apps/api/src/modules/foster/*`
- `apps/web/src/features/foster/*`

**Critérios de aceite:**
- Diferenciação clara entre acolhimento transitório e solicitação de adoção definitiva.

**Testes:**
- Teste de cadastro e busca de voluntários disponíveis por região.

**Resultado esperado:**
Rede organizada de apoio a animais resgatados aguardando adoção.

---

## ETAPA 19 — Eventos e Feiras de Adoção

**Objetivo:** Divulgação de feiras e campanhas presenciais de adoção organizadas por ONGs parceiras.

**Dependências:** Etapa 05 e 08.

**Tarefas:**
- [ ] Backend: CRUD de eventos com data, local, descrição e ONG promotora
- [ ] Frontend: Calendário e listagem de eventos próximos
- [ ] Frontend: Visualização de feiras no mapa interativo com marcador especial
- [ ] Frontend: Botão de adicionar ao calendário do smartphone e compartilhamento

**Arquivos envolvidos:**
- `apps/api/src/modules/events/*`
- `apps/web/src/features/events/*`

**Critérios de aceite:**
- Feiras com data passada saem automaticamente do destaque principal.

**Testes:**
- Teste de agendamento e exibição de eventos na data correta.

**Resultado esperado:**
Canal de divulgação de feiras presenciais integrando o ecossistema local.

---

## ETAPA 20 — Campanhas de Doação e Apoio a ONGs

**Objetivo:** Permitir que abrigos cadastrem campanhas de arrecadação para custos veterinários e ração.

**Dependências:** Etapa 05.

**Tarefas:**
- [ ] Backend: Módulo de campanhas (`campaigns`) com meta, valor arrecadado e prestação de contas
- [ ] Frontend: Cards de campanha com barra de progresso
- [ ] Frontend: Área de transparência e prestação de contas (fotos de notas e recibos)
- [ ] Preparação da arquitetura para integração futura de gateway de pagamento

**Arquivos envolvidos:**
- `apps/api/src/modules/donations/*`
- `apps/web/src/features/donations/*`

**Critérios de aceite:**
- Nesta fase, pagamentos reais não são processados diretamente; prepara-se a infraestrutura para links de PIX/doação direta ou gateway futuro.

**Testes:**
- Validação de cálculos de progresso da meta e apresentação dos comprovantes.

**Resultado esperado:**
Módulo transparente de apoio financeiro e de suprimentos às ONGs.

---

## ETAPA 21 — Acompanhamento Pós-Adoção e Conteúdo Educativo

**Objetivo:** Auxiliar o tutor no período de adaptação com checklists periódicos e dicas de bem-estar animal.

**Dependências:** Etapa 10.

**Tarefas:**
- [ ] Backend: Agendamento de lembretes e questionários periódicos (15 dias, 30 dias, 3 meses, 6 meses)
- [ ] Frontend: Checklist interativo de adaptação (alimentação, adaptação com outros pets, primeira vacina)
- [ ] Frontend: Guia educativo integrado com artigos e orientações sobre posse responsável

**Arquivos envolvidos:**
- `apps/api/src/modules/adoptions/services/post-adoption.service.ts`
- `apps/web/src/features/post-adoption/*`

**Critérios de aceite:**
- Aviso explícito de que as orientações não substituem acompanhamento médico veterinário.

**Testes:**
- Testes dos gatilhos de notificação dos períodos de acompanhamento.

**Resultado esperado:**
Redução de devoluções e suporte contínuo ao novo tutor.

---

## ETAPA 22 — Internacionalização (i18n)

**Objetivo:** Suportar múltiplos idiomas (Português Brasileiro como padrão, Inglês e Espanhol) em toda a aplicação.

**Dependências:** Todas as telas anteriores.

**Tarefas:**
- [ ] Configurar i18next e react-i18next no frontend
- [ ] Criar arquivos de tradução em `apps/web/src/i18n/locales/{pt-BR,en,es}/`
- [ ] Tela de seleção de idioma baseada em `uxui/idioma_regi_o_patinhas`
- [ ] Persistência da preferência de idioma no localStorage e no perfil do usuário
- [ ] Formatação de moedas, datas e unidades de medida conforme o locale

**Arquivos envolvidos:**
- `apps/web/src/i18n/*`
- `apps/web/src/features/settings/LanguageSettings.tsx`

**Critérios de aceite:**
- Troca de idioma instantânea sem recarregar a aplicação.
- Mensagens de validação Zod e notificações traduzidas corretamente.

**Testes:**
- Testes unitários validando presença de todas as chaves nos 3 idiomas sem strings faltantes.

**Resultado esperado:**
Aplicação com suporte internacional completo e padrão PT-BR.

---

## ETAPA 23 — PWA, Manifest e Modo Offline

**Objetivo:** Tornar a plataforma instalável como aplicativo nativo em smartphones com manifesto, ícones e cache inteligente.

**Dependências:** Etapa 03 e 22.

**Tarefas:**
- [ ] Criar `manifest.webmanifest` com nome, ícones, tema coral e modo `standalone`
- [ ] Configurar Workbox via plugin Vite PWA
- [ ] Criar estratégias de cache para assets estáticos e páginas acessadas recentemente
- [ ] Criar tela de fallback offline acolhedora dentro dos 430px
- [ ] Adicionar botão/prompt discreto "Instalar Aplicativo" quando compatível

**Arquivos envolvidos:**
- `apps/web/vite.config.ts`
- `apps/web/public/manifest.webmanifest`
- `apps/web/src/components/ui/OfflineBanner.tsx`

**Critérios de aceite:**
- Aplicativo passa nos critérios de PWA do Google Lighthouse.
- Instalação direta no smartphone (Android e iOS) funcionando em tela cheia sem barra de navegador.

**Testes:**
- Teste de navegação com conexão de rede desativada no DevTools.

**Resultado esperado:**
Experiência idêntica a um app nativo instalável na tela inicial do celular.

---

## ETAPA 24 — Bateria de Testes Automatizados e Segurança

**Objetivo:** Executar suíte completa de testes unitários, testes de integração, auditoria de segurança e testes visuais nos 11 viewports.

**Dependências:** Todas as etapas anteriores.

**Tarefas:**
- [ ] Executar suíte completa de testes unitários no frontend (Vitest)
- [ ] Executar testes de integração de API no backend (Jest + Supertest)
- [ ] Executar suíte E2E dos 10 fluxos principais de adoção com Playwright
- [ ] Executar testes visuais de responsividade nos 11 viewports obrigatórios (`320px` a `2560px`)
- [ ] Executar auditoria de dependências de segurança (`npm audit`)
- [ ] Validar conformidade com as regras de contenção do `MobileAppShell`

**Arquivos envolvidos:**
- `apps/web/src/**/*.test.tsx`
- `apps/api/test/**/*.spec.ts`
- `tests/e2e/**/*.spec.ts`

**Critérios de aceite:**
- 100% dos testes passando sem falhas.
- Nenhuma quebra visual de layout em viewports largos.

**Testes:**
- Relatório de testes gerado e aprovado.

**Resultado esperado:**
Sistema validado, estável e livre de regressões.

---

## ETAPA 25 — Performance, Otimizações e Observabilidade

**Objetivo:** Otimizar tempo de carregamento, consumo de memória, cache distribuído e implementar logs estruturados.

**Dependências:** Etapa 24.

**Tarefas:**
- [ ] Configurar Code Splitting e Lazy Loading nas rotas do React
- [ ] Configurar cache Redis para endpoints de alta leitura (Home, Filtros, Detalhes do Pet)
- [ ] Configurar compressão gzip/brotli no proxy reverso Nginx
- [ ] Implementar logs estruturados com correlation ID no NestJS (Pino Logger)
- [ ] Configurar health checks completos (`/health/live`, `/health/ready`)

**Arquivos envolvidos:**
- `apps/api/src/common/logger/*`
- `apps/api/src/modules/health/*`
- `docker/nginx/nginx.conf`

**Critérios de aceite:**
- Tempo de resposta da API abaixo de 80ms para rotas cacheadas.
- Score de performance no Lighthouse acima de 90 no mobile.

**Testes:**
- Benchmark de carga com autocannon ou k6 simulando requisições simultâneas.

**Resultado esperado:**
Sistema de alta velocidade, preparado para picos de acesso.

---

## ETAPA 26 — Preparação para Produção e Operação

**Objetivo:** Fechar o pacote de produção com scripts de backup, documentação de deployment e validação final.

**Dependências:** Todas as etapas anteriores concluídas.

**Tarefas:**
- [ ] Revisar e validar `docker-compose.prod.yml` com variáveis de produção seguras
- [ ] Criar script automatizado de backup e restauração do PostgreSQL com PostGIS
- [ ] Criar documentação operacional de deployment e monitoramento
- [ ] Realizar checklist final de conformidade LGPD e segurança
- [ ] Gerar build final de produção e validar inicialização limpa

**Arquivos envolvidos:**
- `docker-compose.prod.yml`
- `scripts/backup-db.sh`, `scripts/restore-db.sh`
- `README.md` atualizado

**Critérios de aceite:**
- Subida de produção executada com sucesso com um único comando.
- Todas as 27 etapas validadas e marcadas com `[x]`.

**Testes:**
- Simulação de deploy completo a partir de repositório limpo.

**Resultado esperado:**
Plataforma Patinhas 100% pronta para lançamento oficial e operação contínua.

