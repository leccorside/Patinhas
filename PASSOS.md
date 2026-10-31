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
- [x] Backend: StorageService com MinIO (`cgr.dev/chainguard/minio`) para upload seguro de arquivos e bucket `patinhas-media` público
- [x] Backend: Módulo de Usuários e Perfis (`UsersService`, `UsersController`) com atualização cadastral, coordenadas geográficas PostGIS e upload de avatar
- [x] Backend: Módulo de Organizações (`OrganizationsService`, `OrganizationsController`) com criação, listagem com filtros, busca por ID, edição, upload de logotipo e gestão de membros (Owner, Admin, Member, Volunteer)
- [x] Frontend: Perfil completo do Usuário (`ProfileView.tsx`, `EditProfileModal.tsx`) com edição de dados, bio, localização e upload de avatar
- [x] Frontend: Cadastro e listagem institucional de ONGs (`CreateOrganizationModal.tsx`, `ShelterCard.tsx`)
- [x] Frontend: Preview e upload de imagens conectado ao backend
- [x] Build limpo do frontend React/Vite com 1889 módulos transformados e 0 erros de compilação

**Arquivos envolvidos:**
- `apps/api/src/modules/storage/storage.service.ts`
- `apps/api/src/modules/users/users.service.ts`, `apps/api/src/modules/users/users.controller.ts`
- `apps/api/src/modules/organizations/organizations.service.ts`, `apps/api/src/modules/organizations/organizations.controller.ts`
- `apps/web/src/features/profile/EditProfileModal.tsx`
- `apps/web/src/features/organizations/CreateOrganizationModal.tsx`
- `apps/web/src/features/organizations/ShelterCard.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Upload seguro de fotos armazenadas no MinIO e servidas via URL pública.
- Edição de perfil refletindo instantaneamente no app.
- Criação e consulta de organizações vinculadas a membros operacionais.

**Testes:**
- Teste de autenticação e consulta de perfil via HTTP (`GET /api/v1/users/profile`) retornando perfil e dados de stats.
- Teste de listagem pública de ONGs (`GET /api/v1/organizations`) retornando organizações ativas e contagem de animais.
- Teste de build do frontend Vite (`npm run build`) concluído com êxito em 4.43s.

**Resultado esperado:**
Perfis individuais e de organizações ativos e prontos para cadastrar pets. Concluído com êxito!

---

## ETAPA 06 — Cadastro e Gestão de Animais

**Objetivo:** Desenvolver o formulário assistido em etapas para cadastro de pets, upload de fotos com compressão e ciclo de vida do animal.

**Dependências:** Etapa 05.

**Tarefas:**
- [x] Backend: Módulo de Animais com CRUD completo (`AnimalsService`, `AnimalsController`, `AnimalsModule`)
- [x] Backend: Suporte a status (`AVAILABLE`, `PENDING_ADOPTION`, `ADOPTED`, `QUARANTINE`, `UNAVAILABLE`)
- [x] Backend: Upload de múltiplas fotos no MinIO S3 (`AnimalPhoto`) e gestão de galeria
- [x] Backend: Ficha de saúde (`AnimalHealthRecord`) e traços de temperamento (`AnimalTrait`)
- [x] Backend: Gravação e sincronização de `location_geom` no PostGIS com ruído de privacidade (~200m a 400m de jitter)
- [x] Backend: Filtros de busca por espécie, raça, porte, sexo, energia, saúde, texto e geodistância Haversine
- [x] Frontend: Formulário assistido em 6 etapas (`CreatePetStepperModal.tsx`):
  1. Informações básicas (Nome, Espécie, Raça, Sexo, Idade, Porte, Peso, Pelagem)
  2. Fotos e Galeria (Upload múltiplo, preview, seleção de foto de capa)
  3. Saúde e Vacinas (Vacinado, Castrado, Vermifugado, Especial, detalhes)
  4. Personalidade e Convívio (Chips interativos: Dócil, Brincalhão, Calmo, sociabilidade cães/gatos/crianças)
  5. Localização e Abrigo (Vínculo à ONG ou Protetor, Cidade, UF com nota de privacidade)
  6. História e Requisitos (História acolhedora e exigências de adoção)
- [x] Frontend: Tela de Perfil Completo do Pet (`PetDetailView.tsx`) com 100% de fidelidade a `uxui/perfil_do_pet_charlie`:
  - Carrossel com fotos e miniaturas clicáveis
  - Badges rápidas de especificações (Idade, Porte/Peso, Sexo, Energia)
  - Ficha de saúde completa com selo 100% em dia
  - Tags de personalidade e convivência
  - História com narrativa acolhedora
  - Card da ONG / Protetor com botão de chat
  - Barra fixa inferior com botões de chamada, compartilhamento e "Quero Adotar"
- [x] Frontend: Integração completa na aplicação e compilação do Vite (`npm run build`) com 1892 módulos e 0 erros

**Arquivos envolvidos:**
- `apps/api/src/modules/animals/animals.service.ts`
- `apps/api/src/modules/animals/animals.controller.ts`
- `apps/api/src/modules/animals/animals.module.ts`
- `apps/api/src/modules/animals/dto/*`
- `apps/web/src/features/animals/animalsService.ts`
- `apps/web/src/features/animals/PetDetailView.tsx`
- `apps/web/src/features/animals/CreatePetStepperModal.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Cadastro e consulta de animais completos com galeria de fotos e ficha médica.
- Geometria PostGIS sincronizada com máscara de ruído para preservação de privacidade.
- Perfil do pet com fidelidade visual ao modelo de design `uxui/perfil_do_pet_charlie`.

**Testes:**
- Teste de busca por espécie e texto (`search=Golden`, `species=DOG`, `species=CAT`).
- Teste de cálculo geodésico retornando distância em km a partir de coordenadas do usuário.
- Teste de criação autenticada de animal (`Pipoca`) com coordenadas protegidas e PostGIS.
- Teste de build do Vite transformando 1892 módulos em 4.24s com 0 erros de compilação.

**Resultado esperado:**
Animais cadastrados, listados e visualizados com perfil acolhedor, galeria interativa e informações médicas completas. Concluído com êxito!

---

## ETAPA 07 — Home, Busca e Filtros Avançados

**Objetivo:** Implementar a tela inicial e a experiência de busca e exploração com filtros detalhados em Bottom Sheet.

**Dependências:** Etapa 06.

**Tarefas:**
- [x] Backend: Listagem paginada com busca textual, raio geodésico (`maxDistanceKm`), filhotes (`isPuppy`), saúde (`isVaccinated`, `isNeutered`) e urgência (`isSpecialNeeds`)
- [x] Backend: Endpoint dedicado de Finais Felizes (`GET /api/v1/animals/success-stories`) com fotos e depoimentos reais
- [x] Frontend: Tela Home (`HomeView.tsx`) fiel ao protótipo `uxui/in_cio_patinhas_ado_o`:
  - Carrossel horizontal de categorias com chips visuais táteis
  - Banner de Urgência & Lar Temporário com recorte decorativo da foto do Thor e botão de ajuda direta
  - Seção de Animais Próximos com Bento cards verticais, botões de favoritos e cálculo dinâmico de distância
  - Seção de ONGs e Abrigos Verificados com contagem de pets disponíveis
  - Seção "História Feliz da Semana" com depoimento e foto de antes/depois
- [x] Frontend: Tela Explorar (`ExploreView.tsx`) fiel ao protótipo `uxui/explorar_filtros_patinhas`:
  - Barra de pesquisa com atalho de filtros e chips rápidos
  - Contador de resultados em tempo real ("X amiguinhos esperando por você" e botão "Limpar tudo")
  - Feed em Grid de 2 Colunas Mobile com badge de Match Score ("96% Match"), barra inferior translúcida de distância e idade, e botão "Conhecer →"
  - Card Contextual de Alerta Inteligente para notificar novos pets
- [x] Frontend: Bottom Sheet de Filtros Avançados (`AdvancedFilterSheet.tsx`) com slider de distância máxima (1 a 50 km), seletores em pílula de espécie, porte, sexo e toggles de cuidados veterinários
- [x] Frontend: Compilação de produção do Vite (`npm run build`) concluída com 1895 módulos e 0 erros

**Arquivos envolvidos:**
- `apps/api/src/modules/animals/animals.service.ts`
- `apps/api/src/modules/animals/animals.controller.ts`
- `apps/api/src/modules/animals/dto/filter-animals.dto.ts`
- `apps/web/src/features/home/HomeView.tsx`
- `apps/web/src/features/explore/ExploreView.tsx`
- `apps/web/src/features/explore/AdvancedFilterSheet.tsx`
- `apps/web/src/features/animals/animalsService.ts`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Busca e filtros combinados funcionando de ponta a ponta sem erros de API.
- Layouts de Home e Explorar com fidelidade visual aos protótipos da pasta `uxui/`.
- Slider de distância limitando os resultados ao raio desejado.

**Testes:**
- Teste de busca por raio geodésico (`maxDistanceKm=10`) retornando apenas animais dentro do limite de km e excluindo os distantes.
- Teste de filtro por filhotes (`isPuppy=true`) retornando pets com até 1 ano.
- Teste de consulta de histórias de sucesso (`GET /api/v1/animals/success-stories`) retornando 3 histórias com fotos e dados de adoção.
- Teste de build do Vite finalizado com código de saída 0 e 1895 módulos transformados.

**Resultado esperado:**
Experiência completa de Home e Busca avançada com filtros fluidos, visual mobile impecável e integração com backend. Concluído com êxito!

## ETAPA 08 — Mapa Interativo e Geolocalização

**Objetivo:** Construir o mapa interativo em MapLibre GL JS limitado aos 430px com consultas de proximidade espaciais no PostGIS.

**Dependências:** Etapa 07.

**Tarefas:**
- [x] Backend: Módulo `GeoModule` e endpoint `GET /api/v1/geo/nearby` com consulta PostGIS `ST_DWithin` geodésica em metros
- [x] Backend: Retorno padronizado no formato GeoJSON FeatureCollection (RFC 7946) para consumo direto pelo MapLibre GL
- [x] Frontend: Integração do MapLibre GL JS (`maplibre-gl@^4.3.2`) estritamente contido no shell mobile de 430px
- [x] Frontend: Marcador central do usuário ("Você") com anel pulsante e radar de proximidade
- [x] Frontend: Marcadores customizados DOM no mapa com miniatura da foto do pet, anel coral/teal, badge de espécie (🐶/🐱) e seta triangular
- [x] Frontend: Seletor dinâmico de raio (5, 10, 25, 50 km) com dropdown e atualização instantânea dos pontos
- [x] Frontend: Draggable Bottom Sheet Card sobreposto na parte inferior do mapa com foto, atributos rápidos de saúde, distância e botão "Conhecer [Nome] →"
- [x] Frontend: Botão flutuante de recentralização ("🎯") e botão switcher Mapa ↔ Lista
- [x] Frontend: Compilação de produção do Vite (`npm run build`) concluída com 1899 módulos e 0 erros

**Arquivos envolvidos:**
- `apps/api/src/modules/geo/geo.service.ts`
- `apps/api/src/modules/geo/geo.controller.ts`
- `apps/api/src/modules/geo/geo.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/map/MapView.tsx`
- `apps/web/src/features/animals/animalsService.ts`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- O mapa renderiza perfeitamente contido nos 430px sem transbordar horizontalmente.
- Protetores individuais exibem localização com ruído de segurança aleatório.
- Seleção de raio (5km a 50km) filtrando espacialmente os pontos no PostGIS.

**Testes:**
- Teste geodésico no PostGIS em 3 raios diferentes: 5km (2 pets), 10km (4 pets) e 100km (5 pets, incluindo Campinas).
- Teste de build do Vite transformando 1899 módulos e gerando bundles CSS/JS sem falhas de tipagem.

**Resultado esperado:**
Mapa interativo completo com navegação vetorial fluida, marcadores temáticos com fotos e consulta espacial PostGIS. Concluído com êxito!
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
- [x] Backend: Módulo `FavoritesModule`, `FavoritesService` e `FavoritesController` com endpoints autenticados:
  - `GET /api/v1/favorites`: Listagem completa com dados do animal, fotos, organização e status
  - `GET /api/v1/favorites/ids`: Array com os IDs dos pets favoritados pelo usuário ativo
  - `POST /api/v1/favorites/:animalId`: Adicionar pet aos favoritos com prevenção de duplicidade
  - `DELETE /api/v1/favorites/:animalId`: Remover pet dos favoritos
- [x] Frontend: Ação de favoritar com animação de pulso/coração nos `PetCard` e sincronização global via `animalsService`
- [x] Frontend: Tela de Meus Favoritos (`FavoritesView.tsx`) fiel ao protótipo `uxui/meus_favoritos_patinhas`:
  - Segmented control de categorias (Todos, Cães, Gatos)
  - Botão de destaque "🔥 Modo Swipe" para abrir o Modo Descoberta
  - Seletor de ordenação de favoritos (Mais recentes, Mais próximos, Mais urgentes)
  - Banner informativo para comparar perfis e requisitos
  - Cards horizontais/verticais com status do pet (`Disponível`, `Em Processo`), selo de distância e botão de remoção rápida
  - Estado vazio acolhedor quando nenhum pet estiver salvo
- [x] Frontend: Modo Descoberta interativo (`DiscoveryModeModal.tsx`) em tela cheia mobile (430px):
  - Gestos de arrastar (drag Tinder-style) com Framer Motion (`x`, rotação de até 18°, opacidade progressiva)
  - Selo dinâmico "QUERO ADOTAR" verde-esmeralda em swipe para a direita
  - Selo dinâmico "DEPOIS" cinza-azulado em swipe para a esquerda
  - Botões táteis na barra de ação: ↺ Desfazer, ✕ Passar, ⭐ Super Like / Favoritar, ❤️ Quero Adotar
  - Card informativo com especificações rápidas (espécie, idade, peso, abrigo e badges)
  - Tela de encerramento ("Você viu todos os amiguinhos!") com botão de rever pets
- [x] Frontend: Compilação de produção do Vite (`npm run build`) validada com 1901 módulos e 0 erros de tipagem

**Arquivos envolvidos:**
- `apps/api/src/modules/favorites/favorites.controller.ts`
- `apps/api/src/modules/favorites/favorites.service.ts`
- `apps/api/src/modules/favorites/favorites.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/favorites/FavoritesView.tsx`
- `apps/web/src/features/discovery/DiscoveryModeModal.tsx`
- `apps/web/src/features/animals/animalsService.ts`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Favoritar e desfavoritar persistem na tabela `favorites` do PostgreSQL via Prisma.
- O array de IDs favoritos sincroniza instantaneamente com o frontend para manter os corações coloridos em toda a aplicação.
- Modo Swipe opera estritamente contido no container mobile de 430px sem extrapolar tela.

**Testes:**
- Teste de fluxo completo autenticado no backend (Login JWT via Cookie -> POST `/favorites/:id` -> GET `/favorites` -> GET `/favorites/ids`) validando integridade relacional.
- Teste de build do Vite no container `patinhas_web` transformando 1901 módulos com 0 erros de compilação TypeScript.

**Resultado esperado:**
Experiência interativa de favoritos e descoberta swipe fluida, tátil e sincronizada com o banco. Concluído com êxito!

---

## ETAPA 10 — Processo Completo de Adoção e Questionários

**Objetivo:** Implementar o fluxo completo de adoção em etapas com questionário de triagem, timeline visual e controle de concorrência.

**Dependências:** Etapa 06 e 07.

**Tarefas:**
- [x] Backend: Módulo `AdoptionsModule`, `AdoptionsService` e `AdoptionsController` com endpoints REST autenticados:
  - `POST /api/v1/adoptions/apply`: Submeter questionário de elegibilidade e candidatura de adoção
  - `GET /api/v1/adoptions/my`: Listar candidaturas do adotante autenticado com dados do pet, ONG e histórico
  - `GET /api/v1/adoptions/received`: Listar candidaturas recebidas para animais da ONG ou do Protetor
  - `GET /api/v1/adoptions/:id`: Obter detalhes da solicitação de adoção com permissões granulares
  - `PATCH /api/v1/adoptions/:id/status`: Transição de status da candidatura com auditoria em `AdoptionStatusHistory`
  - `POST /api/v1/adoptions/:id/schedule-interview`: Agendamento de entrevista em vídeo ou presencial
  - `POST /api/v1/adoptions/:id/complete`: Conclusão atômica de adoção via transação Prisma (`prisma.$transaction`) com trava de concorrência e cancelamento automático de concorrentes
  - `POST /api/v1/adoptions/:id/cancel`: Cancelamento voluntário pelo próprio adotante
- [x] Backend: Máquina de estados com validação estrita de transições (`SUBMITTED` → `UNDER_REVIEW` → `INTERVIEW_SCHEDULED` → `APPROVED` → `COMPLETED`)
- [x] Backend: Transação atômica que marca o animal como `ADOPTED`, cria registro na tabela `adoptions` e cancela com elegância candidaturas ativas de outros candidatos
- [x] Frontend: `adoptionService.ts` com tipagens completas de TypeScript e integração HTTP com cookies seguros
- [x] Frontend: Assistente de Questionário de Adoção (`AdoptionQuestionnaireModal.tsx`) em 3 passos acolhedores (Lar & Ambiente, Rotina & Cuidados, Revisão & Termo de Guarda Responsável)
- [x] Frontend: Tela de Minhas Solicitações (`MyAdoptionsView.tsx`) 100% fiel a `uxui/ado_es_em_andamento_patinhas`:
  - Segmented pills ("Em Andamento", "Concluídas", "Histórico") com contadores
  - Status badges pulsantes (`Em Análise`, `Entrevista Agendada`, `Lar Definitivo 🎉`)
  - Stepper horizontal de 5 nós (Formulário, Triagem, Análise, Entrevista, Adoção) com barra de progresso preenchida
  - Card de aviso acionável com data e hora de entrevista agendada
  - Botões rápidos de conversar com o abrigo e visualizar a ficha do processo
- [x] Frontend: Modal do Processo e Timeline (`AdoptionProcessDetailModal.tsx`) fiel a `uxui/processo_de_ado_o_chat_patinhas`:
  - Top Pet Status Header Card, banner de Adoção Segura & 100% Gratuita, resumo das respostas de moradia e linha do tempo com histórico de auditoria
  - Opção de cancelamento seguro com confirmação
- [x] Frontend: Integração fluida em `App.tsx` na aba de Perfil e nos botões "Quero Adotar" de `PetDetailView` e `FavoritesView`
- [x] Frontend: Compilação de produção do Vite (`npm run build`) concluída com 1905 módulos e 0 erros de tipagem

**Arquivos envolvidos:**
- `apps/api/src/modules/adoptions/dto/*`
- `apps/api/src/modules/adoptions/adoptions.service.ts`
- `apps/api/src/modules/adoptions/adoptions.controller.ts`
- `apps/api/src/modules/adoptions/adoptions.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/adoption/adoptionService.ts`
- `apps/web/src/features/adoption/AdoptionQuestionnaireModal.tsx`
- `apps/web/src/features/adoption/MyAdoptionsView.tsx`
- `apps/web/src/features/adoption/AdoptionProcessDetailModal.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Prevenção garantida contra adoção dupla do mesmo pet.
- Adoção finalizada cancela com elegância outras candidaturas concorrentes e atualiza o animal para `ADOPTED`.
- Stepper e timeline visual exibem o estado atual em tempo real no container mobile de 430px.

**Testes:**
- Teste de ciclo de vida completo no backend (Submissão -> Listagem -> Agendamento de Entrevista -> Aprovação -> Conclusão Atômica com criação de registro em `adoptions` e transição do `Animal` para `ADOPTED`).
- Teste de compilação de produção no container `patinhas_web` gerando bundle em 5.19s com 1905 módulos e 0 erros TypeScript.

**Resultado esperado:**
Fluxo de adoção humanizado, seguro, transparente e com experiência mobile impecável. Concluído com êxito!

---

## ETAPA 11 — Chat em Tempo Real (Socket.IO)

**Objetivo:** Construir o chat instantâneo entre o adotante e a ONG/protetor vinculado ao pet em processo de adoção.

**Dependências:** Etapa 10.

**Tarefas:**
- [x] Backend: Gateway Socket.IO (`ChatGateway`) sob `/ws` com autenticação JWT (cookies HttpOnly e headers), eventos `join_conversation`, `leave_conversation`, `send_message`, `typing_start`, `typing_stop` e `mark_as_read`
- [x] Backend: Módulo `ChatModule`, `ChatService` e `ChatController` com persistência relacional no PostgreSQL e endpoints REST com fallback
- [x] Backend: Suporte a envio de imagens/fotos anexas integradas ao MinIO S3 (`POST /api/v1/chat/upload-attachment`)
- [x] Backend: Isolamento estrito de conversas por `conversationId` com bloqueio de acesso a terceiros
- [x] Frontend: `chatService.ts` com cliente Socket.IO e métodos REST de histórico e envio
- [x] Frontend: Interface mobile de chat (`ChatViewModal.tsx`) 100% fiel ao protótipo `uxui/processo_de_ado_o_chat_patinhas`:
  - Top Pet Status Header Card com foto miniatura, nome do pet, raça e selo de Canal Oficial
  - Safety Trust Banner ("Adoção Segura & 100% Gratuita")
  - Card do interlocutor (Avatar, ONG/protetor e botão de ligar)
  - Stream de mensagens com timestamp, balões com cantos arredondados e suporte a imagens anexas
  - Indicador dinâmico de digitação ("X está digitando...") com três pontos animados
  - Recibos de leitura (check duplo `✓✓`)
  - Barra de digitação fixa inferior com botão de anexo e envio em pílula coral
- [x] Frontend: Lista de conversas ativas (`ConversationsListViewModal.tsx`) acessível pelo perfil do usuário
- [x] Frontend: Compilação de produção do Vite (`npm run build`) concluída com 1937 módulos e 0 erros de tipagem

**Arquivos envolvidos:**
- `apps/api/src/modules/chat/chat.gateway.ts`
- `apps/api/src/modules/chat/chat.service.ts`
- `apps/api/src/modules/chat/chat.controller.ts`
- `apps/api/src/modules/chat/chat.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/chat/chatService.ts`
- `apps/web/src/features/chat/ChatViewModal.tsx`
- `apps/web/src/features/chat/ConversationsListViewModal.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Mensagens entregues em tempo real via Socket.IO com fallback REST e persistência no PostgreSQL.
- Interface contida no container de 430px com rolagem automática para a última mensagem.
- Usuários não autorizados estritamente impedidos de acessar ou enviar mensagens na conversa alheia.

**Testes:**
- Teste de troca de mensagens autenticadas entre Adotante (Lucas) e Protetora/ONG responsável (Patinhas de Luz), validando gravação no banco, leitura de mensagens e rejeição de acesso para terceiros não autorizados (HTTP 403 Forbidden).
- Teste de build do Vite no container `patinhas_web` transformando 1937 módulos em 8.82s com 0 erros de compilação.

**Resultado esperado:**
Chat em tempo real com excelente experiência mobile, segurança completa e sincronização instantânea. Concluído com êxito!

---

## ETAPA 12 — Notificações Push (Web Push + VAPID)

**Objetivo:** Configurar notificações reais via navegador (Web Push API) para avisos de novas mensagens, status de adoção e alertas.

**Dependências:** Etapa 11.

**Tarefas:**
- [x] Backend: Módulo `NotificationsModule`, `NotificationsService` e `NotificationsController` com endpoints REST autenticados:
  - `GET /api/v1/notifications/push/public-key`: Obter chave pública VAPID para registro no browser
  - `POST /api/v1/notifications/push/subscribe`: Registro de `PushSubscription` no PostgreSQL com endpoint e chaves criptográficas (`p256dh`, `auth`)
  - `GET /api/v1/notifications`: Listagem de notificações do usuário com ordenação temporal
  - `PATCH /api/v1/notifications/:id/read`: Marcar notificação individual como lida
  - `POST /api/v1/notifications/read-all`: Marcar todas as notificações do usuário como lidas
  - `GET /api/v1/notifications/preferences` e `PATCH /api/v1/notifications/preferences`: Consulta e atualização de preferências de canais e horários de silêncio (Quiet Hours)
  - `POST /api/v1/notifications/test`: Disparo de notificação de teste
- [x] Backend: Configuração de chaves VAPID (`web-push`) com suporte a variáveis de ambiente e verificação de horário de silêncio
- [x] Frontend: Service Worker (`apps/web/public/sw.js`) com tratamento de eventos `push` e `notificationclick` para abertura contextual
- [x] Frontend: `notificationsService.ts` com conversão de chave VAPID (`urlBase64ToUint8Array`) e registro no navegador
- [x] Frontend: Central de Notificações (`NotificationsViewModal.tsx`) 100% fiel ao protótipo `uxui/notifica_es_alertas_patinhas`:
  - Header com contagem de notificações não lidas e ação rápida de ler todas
  - Filter chips em pílula ("Todas", "Adoções", "Pets & Match", "Mensagens") com contagens dinâmicas
  - Banner acolhedor de solicitação de permissão de push (Opt-in)
  - Agrupamento temporal visual em "Hoje" e "Anteriores"
  - Cards ricos com badges de status, contexto, atalhos de ação e indicador visual de não lida
- [x] Frontend: Integração do badge numérico no `AppHeader` e compilação do Vite (`npm run build`) concluída com 1939 módulos e 0 erros de tipagem

**Arquivos envolvidos:**
- `apps/api/src/modules/notifications/*`
- `apps/web/src/features/notifications/*`
- `apps/web/public/sw.js`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Disparo e persistência de notificações no banco com suporte a envio push seguro.
- Interface contida nos 430px com filtros por categoria e suporte a opt-in.
- Horários de silêncio respeitados.

**Testes:**
- Teste de fluxo completo autenticado na API NestJS (Obtenção de chave VAPID -> Disparo de notificação de teste -> Listagem de notificações -> Leitura em massa via `read-all`).
- Teste de build do Vite no container `patinhas_web` gerando bundle limpo em 9.03s com 1939 módulos transformados.

**Resultado esperado:**
Sistema de notificações push funcional mantendo o adotante engajado. Concluído com êxito!

---

## ETAPA 13 — Match Inteligente Adotante ↔ Pet

**Objetivo:** Desenvolver algoritmo determinístico de compatibilidade entre o questionário do adotante e as características do animal.

**Dependências:** Etapas 06 e 10.

**Tarefas:**
- [x] Backend: Módulo `MatchingModule`, `MatchingService` e `MatchingController` com endpoint REST autenticado `GET /api/v1/matching/animals/:id`
- [x] Backend: Algoritmo determinístico ponderado com 4 dimensões essenciais (25% cada):
  - Moradia e Espaço Físico: compatibilidade entre tipo de residência (Apartamento, Casa com quintal, Sítio) e porte/energia do pet, incluindo checagem de telas de proteção para gatos
  - Rotina e Energia: tempo diário disponível do adotante vs nível de energia e passeios necessários
  - Convivência e Sociabilidade: presença de crianças e outros animais (cães, gatos) no lar vs temperamento do pet
  - Orçamento e Cuidados Especiais: capacidade financeira para alimentação de qualidade e cuidados veterinários regulares vs necessidades médicas contínuas
- [x] Backend: Geração de pontuação de 0 a 100%, nível categórico (`EXCELLENT`, `GOOD`, `MODERATE`, `NEEDS_ATTENTION`), rótulo humanizado, destaques positivos e pontos de atenção educativos
- [x] Backend: Arquitetura desacoplada e tipada (`MatchResultDto`, `PillarScoreDto`) pronta para extensão futura com modelos de IA/LLM
- [x] Frontend: `matchingService.ts` com tipagens completas e integração HTTP
- [x] Frontend: Modal/Sheet explicativo de afinidade (`MatchExplanationModal.tsx`) com score central circular, barras de progresso temáticas por pilar, destaques e cuidados
- [x] Frontend: Integração do badge de compatibilidade na visualização detalhada do pet (`PetDetailView.tsx`) e no fluxo geral de navegação do `App.tsx`
- [x] Frontend: Compilação de produção do Vite (`npm run build`) concluída com 1941 módulos e 0 erros de tipagem

**Arquivos envolvidos:**
- `apps/api/src/modules/matching/matching.dto.ts`
- `apps/api/src/modules/matching/matching.service.ts`
- `apps/api/src/modules/matching/matching.controller.ts`
- `apps/api/src/modules/matching/matching.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/matching/matchingService.ts`
- `apps/web/src/features/matching/MatchExplanationModal.tsx`
- `apps/web/src/features/animals/PetDetailView.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Algoritmo não bloqueia adoções, mas fornece recomendação clara, educativa e transparente.
- Cálculo determinístico com justificativas estruturadas por dimensão de afinidade.
- Modal responsivo e integrado ao design system Warm Paws no container mobile de 430px.

**Testes:**
- Teste com dados reais de usuário autenticado vs animal cadastrado (cadela Mel), resultando em 95% de afinidade ("Combinação Excelente!") com avaliação de moradia, tempo livre, crianças e orçamento.
- Teste de build do Vite no container `patinhas_web` transformando 1941 módulos em 8.44s com 0 erros TypeScript.

**Resultado esperado:**
Índice de match intuitivo auxiliando adoções com maior probabilidade de sucesso. Concluído com êxito!

---

## ETAPA 14 — Dashboard Mobile para ONGs e Protetores

**Objetivo:** Criar o painel de gestão para responsáveis por animais com métricas e gestão de solicitações em formato estritamente mobile.

**Dependências:** Etapas 06 e 10.

**Tarefas:**
- [x] Backend: Endpoints de agregação e métricas por organização:
  - `GET /api/v1/organizations/my-shelters`: Lista organizações das quais o usuário autenticado faz parte com contadores de pets e equipe
  - `GET /api/v1/organizations/:id/dashboard`: Métricas consolidadas (animais ativos, disponíveis, em adoção, adotados, candidaturas pendentes, entrevistas, taxa de conversão %, candidaturas prioritárias, pets recentes e colaboradores)
- [x] Backend: Validação rigorosa de permissão impedindo adotantes comuns ou terceiros de visualizarem dados operacionais (HTTP 403 Forbidden)
- [x] Frontend: `shelterDashboardService.ts` com tipagens completas e integração HTTP nativa com cookies seguros
- [x] Frontend: Dashboard mobile (`ShelterDashboardView.tsx`) formatado estritamente para largura de 430px:
  - Top bar com seletor de ONGs, botão voltar e botão rápido "+ Novo Pet"
  - Bento Grid com 4 cards de métricas (Nossos Pets, Triagem Pendente, Adotados 🎉, Afinidade/Taxa de Sucesso %)
  - Aba "Triagem & Candidaturas" com dados do pretendente, moradia, telas de proteção e botões de ação imediata (Aprovar, Entrevista, Concluir Adoção, Recusar)
  - Aba "Nossos Pets" com lista compacta de animais, fotos de capa, status pills e atalho de navegação
  - Aba "Equipe & Colaboradores" com lista de membros, papéis e modal de convite por e-mail
  - Modais de Agendamento de Entrevista e de Inclusão de Novos Membros
- [x] Frontend: Integração com o Perfil do usuário em `App.tsx` através de card de destaque "Painel da ONG & Protetores" com badge "Gestão Mobile"
- [x] Frontend: Compilação de produção do Vite (`npm run build`) concluída com 1943 módulos e 0 erros de tipagem

**Arquivos envolvidos:**
- `apps/api/src/modules/organizations/organizations.service.ts`
- `apps/api/src/modules/organizations/organizations.controller.ts`
- `apps/web/src/features/shelter/shelterDashboardService.ts`
- `apps/web/src/features/shelter/ShelterDashboardView.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Dashboard 100% responsivo dentro da largura de 430px sem rolagem horizontal indesejada.
- Mudanças de status de candidaturas refletidas imediatamente no estado local.
- Adotantes sem permissão na ONG bloqueados com 403 Forbidden.

**Testes:**
- Teste com líder de ONG autenticado (`contato@patinhasdeluz.org`) recuperando lista de abrigos e métricas consolidadas (3 animais, taxas de adoção, equipe).
- Teste de segurança com adotante comum (`lucas.adotante@gmail.com`) sendo rejeitado com HTTP 403 Forbidden ao tentar acessar o dashboard de organização alheia.
- Teste de build do Vite no container `patinhas_web` transformando 1943 módulos em 8.52s com 0 erros TypeScript.

**Resultado esperado:**
Painel de gestão intuitivo na palma da mão para protetores e voluntários. Concluído com êxito!

---

## ETAPA 15 — Admin Master (Painel de Gestão da Plataforma)

**Objetivo:** Criar o painel administrativo global para moderação, auditoria e controle de integridade da plataforma no formato mobile.

**Dependências:** Etapa 14.

**Tarefas:**
- [x] Backend: Módulo `AdminModule`, `AdminService` e `AdminController` com proteção estrita por `@UseGuards(JwtAuthGuard, RolesGuard)` e `@Roles(UserRole.MASTER_ADMIN)`
- [x] Backend: Endpoints REST administrativos:
  - `GET /api/v1/admin/overview`: Métricas globais consolidadas (usuários por papel/status, ONGs por verificação, animais disponíveis/adotados, adoções totais e denúncias)
  - `GET /api/v1/admin/organizations`: Listagem paginada de organizações com busca textual (nome, CNPJ, cidade) e filtro por status de verificação
  - `PATCH /api/v1/admin/organizations/:id/verify`: Concessão ou revogação de selo de verificação oficial com registro em `AuditLog`
  - `GET /api/v1/admin/users`: Listagem de usuários da plataforma com estatísticas de candidaturas e denúncias
  - `PATCH /api/v1/admin/users/:id/status`: Suspensão preventiva ou reativação de conta de usuário com revogação imediata de sessões ativas e gravação em `AuditLog`
  - `GET /api/v1/admin/audit-logs`: Histórico detalhado de ações administrativas com executor e metadados JSON
- [x] Backend: Bloqueio rigoroso impedindo auto-suspensão do próprio administrador logado e rejeição de acessos de adotantes/membros de ONG comuns com HTTP 403 Forbidden
- [x] Frontend: `adminService.ts` com tipagens completas e integração HTTP nativa com cookies seguros
- [x] Frontend: Painel mobile Master Admin (`AdminMasterDashboardView.tsx`) formatado estritamente para largura de 430px:
  - Header institucional com badge `Master Admin 🛡️` e status da plataforma
  - Bento Grid com 4 cards de métricas (Usuários, ONGs, Animais, Adoções Concluídas)
  - Aba "ONGs" com fila de verificação, CNPJ, dados do responsável e botões de ação ("Aprovar Selo Oficial", "Revogar Selo")
  - Aba "Usuários" com busca rápida, badges de papel, contadores de candidaturas e ações de suspensão/reativação
  - Aba "Auditoria" com feed cronológico dos eventos administrativos
- [x] Frontend: Acesso restrito via Perfil condicionado a `user.role === 'MASTER_ADMIN'` com banner roxo de alta autoridade
- [x] Frontend: Compilação de produção do Vite (`npm run build`) concluída com 1945 módulos e 0 erros de tipagem

**Arquivos envolvidos:**
- `apps/api/src/modules/admin/admin.service.ts`
- `apps/api/src/modules/admin/admin.controller.ts`
- `apps/api/src/modules/admin/admin.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/admin/adminService.ts`
- `apps/web/src/features/admin/AdminMasterDashboardView.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Acesso estritamente bloqueado para usuários não autorizados com resposta 403 Forbidden.
- Visual em conformidade com o Mobile App Shell (430px) sem barras laterais de desktop.
- Registro confiável em banco (`AuditLog`) de todas as decisões tomadas pelo admin.

**Testes:**
- Teste com usuário Master Admin autenticado (`admin@patinhas.org`), validando retorno de métricas globais e listagem de organizações e usuários.
- Teste de segurança com adotante comum (`lucas.adotante@gmail.com`) sendo rejeitado com HTTP 403 Forbidden ao tentar invocar a rota `/api/v1/admin/overview`.
- Teste de compilação de produção do Vite no container `patinhas_web` gerando bundle em 5.87s com 1945 módulos e 0 erros.

**Resultado esperado:**
Controle total da operação da plataforma com mobilidade. Concluído com êxito!

---

## ETAPA 16 — Moderação, Denúncias e Antifraude

**Objetivo:** Implementar ferramentas para denúncia de maus-tratos, comércio ilegal de animais e moderação preventiva de conteúdos.

**Dependências:** Etapa 15.

**Tarefas:**
- [x] Backend: Módulo `ModerationModule`, `ModerationService` e `ModerationController` com endpoints REST autenticados:
  - `POST /api/v1/moderation/reports`: Envio de denúncia sigilosa por qualquer adotante autenticado (recursos: `ANIMAL`, `USER`, `ORGANIZATION`, `MESSAGE`)
  - `GET /api/v1/moderation/reports`: Fila de denúncias detalhadas para moderação com dados do denunciante, recurso denunciado e histórico de ações (Apenas `MASTER_ADMIN`)
  - `PATCH /api/v1/moderation/reports/:id/resolve`: Resolução disciplinar da denúncia (`ACCOUNT_SUSPENDED`, `ANIMAL_REMOVED`, `WARNING_ISSUED`, `DISMISSED`) com aplicação real de penalidade no banco e gravação de auditoria
  - `GET /api/v1/moderation/actions`: Histórico de intervenções e ações tomadas pela moderação
- [x] Backend: Antifraude preventivo automatizado: se um animal receber 3 ou mais denúncias pendentes, o anúncio tem seu status alterado automaticamente para `UNAVAILABLE` para revisão humana preventiva com log de auditoria
- [x] Backend: Bloqueio estrito de acesso não autorizado a rotas de moderação com HTTP 403 Forbidden
- [x] Frontend: `moderationService.ts` com tipagens completas e integração HTTP nativa
- [x] Frontend: Modal humanizado de denúncia (`ReportModal.tsx`) contido em 430px com seleção rápida de motivos (comércio ilegal, maus-tratos, cobrança abusiva, perfil falso), campo de detalhes e garantia explícita de sigilo
- [x] Frontend: Integração do botão discreto de denúncia preventiva no perfil detalhado do pet (`PetDetailView.tsx`) e gerenciamento global no `App.tsx`
- [x] Frontend: Aba "Denúncias" integrada no `AdminMasterDashboardView.tsx` com contagem em tempo real de denúncias pendentes e botões de ação rápida (Suspender Infrator, Remover Pet, Advertir, Arquivar)
- [x] Frontend: Compilação de produção do Vite (`npm run build`) concluída com 1947 módulos e 0 erros de tipagem

**Arquivos envolvidos:**
- `apps/api/src/modules/moderation/dto/moderation.dto.ts`
- `apps/api/src/modules/moderation/moderation.service.ts`
- `apps/api/src/modules/moderation/moderation.controller.ts`
- `apps/api/src/modules/moderation/moderation.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/moderation/moderationService.ts`
- `apps/web/src/features/moderation/ReportModal.tsx`
- `apps/web/src/features/animals/PetDetailView.tsx`
- `apps/web/src/features/admin/AdminMasterDashboardView.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Denúncias registradas com sigilo, data/hora e trilha de auditoria completa em `AuditLog`.
- Anúncios com 3 ou mais denúncias graves suspensos preventivamente de forma automática.
- Usuários sem permissão de moderação bloqueados com resposta 403 Forbidden.

**Testes:**
- Teste de fluxo completo: Adotante autenticado enviou denúncia contra anúncio de animal com cobrança indevida (HTTP 201 Created com Report ID).
- Master Admin listou denúncias ativas (HTTP 200 OK) e executou resolução com emissão de advertência formal gravada em banco (HTTP 200 OK).
- Teste de segurança confirmando bloqueio de listagem para adotante comum com HTTP 403 Forbidden.
- Teste de compilação de produção do Vite no container `patinhas_web` gerando bundle em 6.12s com 1947 módulos e 0 erros.

**Resultado esperado:**
Ambiente seguro e protegido contra fraudes e comércio de animais. Concluído com êxito!

---

## ETAPA 17 — Módulo de Animais Perdidos e Encontrados

**Objetivo:** Criar seção independente para cadastro e busca geolocalizada de animais desaparecidos na região.

**Dependências:** Etapas 06 e 08.

**Tarefas:**
- [x] Backend: Módulo `LostFoundModule`, `LostFoundService` e `LostFoundController` com isolamento estrito de anúncios de adoção:
  - `POST /api/v1/lost-found`: Cadastro de pet perdido (`LOST`) ou encontrado (`FOUND`) com coordenadas geográficas e suporte a PostGIS
  - `GET /api/v1/lost-found`: Listagem com filtros por espécie, tipo, status e cálculo geodésico de distância espacial via `ST_DWithin` e `ST_Distance`
  - `GET /api/v1/lost-found/:id`: Detalhes completos do relato e tutor
  - `PATCH /api/v1/lost-found/:id/reunited`: Transição de status para `REUNITED` ("Reencontrado 🎉") com auditoria
  - `DELETE /api/v1/lost-found/:id`: Exclusão de relato pelo autor ou Master Admin
- [x] Backend: Indexação espacial PostGIS em `location_geom` e auditoria em `AuditLog`
- [x] Frontend: `lostFoundService.ts` com tipagens completas e integração HTTP nativa
- [x] Frontend: Interface mobile (`LostFoundView.tsx`) formatada estritamente para largura de 430px:
  - Header com alternador de abas ("🚨 Perdidos" vs "🐾 Encontrados")
  - Barra de busca rápida por características, cor, bairro ou raça
  - Cards temáticos de alerta com fotos, selos de urgência, local de último avistamento, recompensa e botão de ligação direta
  - Card comemorativo especial com efeito visual para status `REUNITED` ("Reencontrado 🎉")
  - Compartilhamento ágil do alerta via Web Share API
- [x] Frontend: Assistente de cadastro (`CreateLostFoundModal.tsx`) ágil para situações de emergência
- [x] Frontend: Integração com o Perfil do usuário via banner "Perdidos & Achados (Busca Urgente)"
- [x] Frontend: Compilação de produção do Vite (`npm run build`) concluída com 1950 módulos e 0 erros de tipagem

**Arquivos envolvidos:**
- `apps/api/src/modules/lost-found/dto/lost-found.dto.ts`
- `apps/api/src/modules/lost-found/lost-found.service.ts`
- `apps/api/src/modules/lost-found/lost-found.controller.ts`
- `apps/api/src/modules/lost-found/lost-found.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/lost-found/lostFoundService.ts`
- `apps/web/src/features/lost-found/CreateLostFoundModal.tsx`
- `apps/web/src/features/lost-found/LostFoundView.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Pets perdidos rigorosamente separados da listagem padrão de animais para adoção.
- Cálculo de proximidade geoespacial exato por PostGIS.
- Transição festiva para status `REUNITED`.

**Testes:**
- Teste de cadastro de relato de cão perdido com coordenadas geográficas do Parque Ibirapuera em SP (HTTP 201 Created).
- Teste de busca espacial com PostGIS (`ST_DWithin` raio 20km) retornando o pet cadastrado com distância exata calculada (4.78 km).
- Teste de transição para `REUNITED` com sucesso (HTTP 200 OK).
- Teste de compilação de produção do Vite no container `patinhas_web` gerando bundle em 6.38s com 1950 módulos e 0 erros.

**Resultado esperado:**
Módulo comunitário ágil para resgate e reencontro de animais. Concluído com êxito!

---

## ETAPA 18 — Gestão de Lares Temporários

**Objetivo:** Permitir que voluntários se cadastrem para oferecer acolhimento temporário a pets resgatados.

**Dependências:** Etapa 05 e 06.

**Tarefas:**
- [x] Backend: Módulo `FosterModule`, `FosterService` e `FosterController` com endpoints REST autenticados:
  - `GET /api/v1/foster/my-profile`: Consulta do perfil de voluntário do usuário autenticado
  - `POST /api/v1/foster/profile`: Cadastro e atualização atômica (`upsert`) do perfil de Lar Temporário com capacidade de pets, espécies aceitas, quarentena, cidade/UF e disponibilidade ativa
  - `GET /api/v1/foster/available`: Busca de lares temporários disponíveis com filtros por cidade, estado e espécies
  - `POST /api/v1/foster/requests`: Envio de solicitação de acolhimento temporário por líderes ou membros de ONGs
  - `GET /api/v1/foster/my-requests`: Fila de solicitações de acolhimento recebidas pelo voluntário com dados da ONG solicitante
  - `PATCH /api/v1/foster/requests/:id/respond`: Resposta do voluntário (`ACCEPTED` ou `DECLINED`)
- [x] Backend: Auditoria em `AuditLog` para criação de perfil e disparo de solicitações
- [x] Frontend: `fosterService.ts` com tipagens completas e integração HTTP nativa
- [x] Frontend: Modal humanizado de cadastro de voluntário (`FosterVolunteerModal.tsx`) com seleção de capacidade, espécies aceitas, chave seletora de quarentena e disponibilidade ativa
- [x] Frontend: Interface mobile (`FosterView.tsx`) formatada estritamente para largura de 430px:
  - Header com alternador de abas ("🏡 Lares Disponíveis" vs "📋 Pedidos Recebidos")
  - Filtro por cidade
  - Cards detalhados com capacidades, selo de quarentena, experiência e ação de contato telefônico
  - Ações ágeis com 1 toque para aceitar ou recusar acolhimento temporário
- [x] Frontend: Integração com o Perfil do usuário via banner "Lar Temporário & Voluntariado"
- [x] Frontend: Compilação de produção do Vite (`npm run build`) concluída com 1953 módulos e 0 erros de tipagem

**Arquivos envolvidos:**
- `apps/api/src/modules/foster/dto/foster.dto.ts`
- `apps/api/src/modules/foster/foster.service.ts`
- `apps/api/src/modules/foster/foster.controller.ts`
- `apps/api/src/modules/foster/foster.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/foster/fosterService.ts`
- `apps/web/src/features/foster/FosterVolunteerModal.tsx`
- `apps/web/src/features/foster/FosterView.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Diferenciação clara entre acolhimento transitório e solicitação de adoção definitiva.
- Capacidades de acolhimento e cômodo de quarentena respeitados.
- Transições de aceitação ou recusa refletidas instantaneamente.

**Testes:**
- Teste de cadastro/upsert de perfil de voluntário com capacidade para 2 pets em São Paulo (HTTP 201 Created).
- Teste de busca de lares temporários disponíveis por cidade retornando o voluntário cadastrado (HTTP 200 OK).
- Teste de solicitação de acolhimento emitida pela ONG e aceitação pelo voluntário com mensagem de sucesso (HTTP 200 OK).
- Teste de compilação de produção do Vite no container `patinhas_web` gerando bundle em 9.45s com 1953 módulos e 0 erros.

**Resultado esperado:**
Rede organizada de apoio a animais resgatados aguardando adoção. Concluído com êxito!

---

## ETAPA 19 — Eventos e Feiras de Adoção

**Objetivo:** Divulgação de feiras e campanhas presenciais de adoção organizadas por ONGs parceiras.

**Dependências:** Etapa 05 e 08.

**Tarefas:**
- [x] Backend: Módulo `EventsModule`, `EventsService` e `EventsController` com endpoints REST:
  - `POST /api/v1/events`: Cadastro de evento presencial por membros da ONG promotora com localização espacial PostGIS em `location_geom`
  - `GET /api/v1/events`: Listagem pública de feiras futuras (`upcomingOnly=true`) ordenadas por proximidade de data e filtradas por cidade/estado
  - `GET /api/v1/events/:id`: Detalhes completos da feira e da ONG organizadora
  - `DELETE /api/v1/events/:id`: Exclusão restrita à ONG promotora ou Master Admin
- [x] Backend: Auditoria em `AuditLog` para criação de novos eventos
- [x] Frontend: `eventsService.ts` com tipagens completas e integração HTTP nativa
- [x] Frontend: Interface mobile (`EventsView.tsx`) formatada estritamente para largura de 430px:
  - Top bar com título e botão "+ Nova Feira"
  - Cards visuais ricos com banner fotográfico, selo de evento presencial, data e horários
  - Local físico em destaque com endereço completo e identificação da ONG organizadora com selo oficial
  - Botão de integração com Google Calendar (geração de lembrete com 1 clique preenchendo título, local e horários)
  - Botão de compartilhamento de feiras via Web Share API
- [x] Frontend: Assistente de cadastro de feiras presenciais (`CreateEventModal.tsx`) para ONGs parceiras
- [x] Frontend: Integração com o Perfil do usuário via banner "Feiras de Adoção"
- [x] Frontend: Compilação de produção do Vite (`npm run build`) concluída com 1956 módulos e 0 erros de tipagem

**Arquivos envolvidos:**
- `apps/api/src/modules/events/dto/events.dto.ts`
- `apps/api/src/modules/events/events.service.ts`
- `apps/api/src/modules/events/events.controller.ts`
- `apps/api/src/modules/events/events.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/events/eventsService.ts`
- `apps/web/src/features/events/CreateEventModal.tsx`
- `apps/web/src/features/events/EventsView.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Feiras com data passada filtradas automaticamente para não poluir o feed principal.
- Integração ágil com calendário nativo do smartphone.
- Autorização protegida impedindo usuários comuns de criarem feiras em nome de ONGs.

**Testes:**
- Teste de cadastro de feira de adoção futura pela líder da ONG no Parque Villa-Lobos em SP (HTTP 201 Created).
- Teste de listagem de feiras futuras retornando o evento agendado (HTTP 200 OK).
- Teste de segurança confirmando bloqueio de cadastro para usuário comum sem permissão na ONG (HTTP 403 Forbidden).
- Teste de compilação de produção do Vite no container `patinhas_web` gerando bundle em 6.24s com 1956 módulos e 0 erros.

**Resultado esperado:**
Canal de divulgação de feiras presenciais integrando o ecossistema local. Concluído com êxito!

---

## ETAPA 20 — Campanhas de Doação e Apoio a ONGs

**Objetivo:** Permitir que abrigos cadastrem campanhas de arrecadação para custos veterinários e ração.

**Dependências:** Etapa 05.

**Tarefas:**
- [x] Backend: Módulo de campanhas (`CampaignsModule`, `CampaignsService`, `CampaignsController`) com rotas REST completas:
  - `POST /api/v1/campaigns`: Cadastro de campanha de arrecadação com meta (R$), descrição e chave PIX por membros de ONG
  - `GET /api/v1/campaigns`: Listagem pública de campanhas ativas com progresso percentual calculado em tempo real
  - `GET /api/v1/campaigns/:id`: Detalhes completos da campanha e da organização promotora
  - `POST /api/v1/campaigns/:id/donate`: Registro de doações com atualização atômica e auditoria em `auditLog`
  - `PATCH /api/v1/campaigns/:id/toggle`: Pausa ou reativação de campanha por membros autorizados
  - `DELETE /api/v1/campaigns/:id`: Exclusão segura de campanha
- [x] Frontend: Serviço `campaignsService.ts` com integração HTTP REST completa
- [x] Frontend: Modal de doação `DonationModal.tsx` com botões de valores rápidos (R$ 20, 50, 100, 250), cópia da chave PIX com 1 toque e confirmação interativa
- [x] Frontend: Modal de cadastro `CreateCampaignModal.tsx` para abrigos e protetores lançarem vaquinhas de tratamento
- [x] Frontend: Visualização de feed `CampaignsView.tsx` com Bento cards mobile, fotos de destaque, barras de progresso e compartilhamento nativo via Web Share API
- [x] Frontend: Banner interativo integrado na navegação de perfil do `App.tsx`
- [x] Frontend: Compilação de produção com Vite transformando 1960 módulos com 0 erros

**Arquivos envolvidos:**
- `apps/api/src/modules/campaigns/dto/campaign.dto.ts`
- `apps/api/src/modules/campaigns/campaigns.service.ts`
- `apps/api/src/modules/campaigns/campaigns.controller.ts`
- `apps/api/src/modules/campaigns/campaigns.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/campaigns/campaignsService.ts`
- `apps/web/src/features/campaigns/DonationModal.tsx`
- `apps/web/src/features/campaigns/CreateCampaignModal.tsx`
- `apps/web/src/features/campaigns/CampaignsView.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Pagamentos diretos via PIX sem taxas abusivas de intermediários, com registro auditável e transparente do progresso da arrecadação.
- Apenas membros de ONGs ou administradores podem cadastrar campanhas para a respectiva entidade.

**Testes:**
- Teste de cadastro de campanha pela ONG Instituto Patinhas de Luz com meta de R$ 1.500 (HTTP 201 Created).
- Teste de listagem pública com cálculo de 0% de progresso inicial (HTTP 200 OK).
- Teste de contribuição de R$ 150 com atualização automática do progresso para 10% (HTTP 201 Created).
- Teste de bloqueio de usuário não membro (adotante) tentando criar campanha para a ONG (HTTP 403 Forbidden).
- Teste de build do Vite no container `patinhas_web` transformando 1960 módulos em 8.90s com 0 erros.

**Resultado esperado:**
Módulo transparente de apoio financeiro e vaquinhas veterinárias às ONGs. Concluído com êxito!

---

## ETAPA 21 — Acompanhamento Pós-Adoção e Conteúdo Educativo

**Objetivo:** Auxiliar o tutor no período de adaptação com checklists periódicos e dicas de bem-estar animal.

**Dependências:** Etapa 10.

**Tarefas:**
- [x] Backend: Módulo educativo e pós-adoção (`EducationModule`, `EducationService`, `EducationController`) com rotas REST completas:
  - `GET /api/v1/education/articles`: Feed de artigos educativos com filtro por categoria (Adaptação, Saúde, Comportamento) e busca
  - `GET /api/v1/education/articles/:slug`: Detalhes e texto completo do artigo com tempo estimado de leitura
  - `GET /api/v1/education/post-adoption/checklist`: Checklists estruturados por período de adaptação (15 dias - descompressão, 30 dias - rotina & saúde preventiva, 90 dias - vínculo pleno) com aviso legal médico veterinário obrigatório
  - `POST /api/v1/education/post-adoption/feedback`: Envio seguro de relatos de adaptação e fotos pelo adotante com registro em `AuditLog`
- [x] Frontend: Serviço `educationService.ts` com consumo REST e tipagens estritas
- [x] Frontend: Modal de artigo `ArticleDetailModal.tsx` com banner de foto, categoria, tempo de leitura e aviso legal veterinário em destaque
- [x] Frontend: Modal de feedback `PostAdoptionFeedbackModal.tsx` para envio de relato e fotos recentes do pet no novo lar
- [x] Frontend: Visualização interativa `PostAdoptionView.tsx` com tabs (Checklist com persistência no LocalStorage vs Feed de Artigos), barra de progresso percentual e aviso médico veterinário
- [x] Frontend: Banner integrado no perfil móvel em `App.tsx`
- [x] Frontend: Compilação de produção do Vite no container `patinhas_web` concluída com 1964 módulos e 0 erros

**Arquivos envolvidos:**
- `apps/api/src/modules/education/dto/education.dto.ts`
- `apps/api/src/modules/education/education.service.ts`
- `apps/api/src/modules/education/education.controller.ts`
- `apps/api/src/modules/education/education.module.ts`
- `apps/api/src/app.module.ts`
- `apps/web/src/features/education/educationService.ts`
- `apps/web/src/features/education/ArticleDetailModal.tsx`
- `apps/web/src/features/education/PostAdoptionFeedbackModal.tsx`
- `apps/web/src/features/education/PostAdoptionView.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Aviso explícito em todas as seções de que as orientações não substituem o acompanhamento médico veterinário com CRMV ativo.
- Checklists interativos por período (15, 30 e 90 dias) com persistência local e feedback à ONG.

**Testes:**
- Teste de listagem pública de artigos educativos (HTTP 200 OK).
- Teste de recuperação de artigo por slug (HTTP 200 OK).
- Teste de obtenção de checklist de 15 dias validando presença do aviso legal veterinário (HTTP 200 OK).
- Teste de obtenção de checklist de 30 dias com itens de saúde preventiva (HTTP 200 OK).
- Teste de envio autenticado de relato de pós-adoção com gravação em auditoria (HTTP 201 Created).
- Teste de compilação do Vite no container `patinhas_web` transformando 1964 módulos em 5.96s com 0 erros.

**Resultado esperado:**
Redução de devoluções, suporte contínuo ao novo tutor e acolhimento sereno aos animais adotados. Concluído com êxito!
Redução de devoluções e suporte contínuo ao novo tutor.

---

## ETAPA 22 — Internacionalização (i18n)

**Objetivo:** Suportar múltiplos idiomas (Português Brasileiro como padrão, Inglês e Espanhol) em toda a aplicação.

**Dependências:** Todas as telas anteriores.

**Tarefas:**
- [x] Configurar `i18next`, `react-i18next` e `i18next-browser-languagedetector` em `apps/web/src/i18n/index.ts`
- [x] Criar dicionários completos de tradução em `apps/web/src/i18n/locales/{pt-BR,en,es}/translation.json` com termos comuns, navegação, home, cards de pets, status e configurações
- [x] Componente modal mobile de seleção de idioma `LanguageSettingsModal.tsx` baseado nas especificações de `uxui/idioma_regi_o_patinhas`
- [x] Persistência imediata da preferência no `localStorage` sob a chave `patinhas_lng`
- [x] Botão de acesso em "Idioma e Região" nas configurações de perfil com suporte a 🇧🇷 Português, 🇺🇸 English e 🇪🇸 Español
- [x] Compilação de produção com Vite transformando 1988 módulos em 9.47s com 0 erros

**Arquivos envolvidos:**
- `apps/web/src/i18n/locales/pt-BR/translation.json`
- `apps/web/src/i18n/locales/en/translation.json`
- `apps/web/src/i18n/locales/es/translation.json`
- `apps/web/src/i18n/index.ts`
- `apps/web/src/main.tsx`
- `apps/web/src/features/settings/LanguageSettingsModal.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Troca de idioma instantânea e sem recarregamento da página.
- Português Brasileiro (pt-BR) como idioma nativo padrão garantido.

**Testes:**
- Validação de carregamento dos recursos de tradução para pt-BR, en e es.
- Teste de troca dinâmica de idioma via `i18n.changeLanguage()`.
- Teste de compilação do bundle de produção com Vite no container `patinhas_web` (1988 módulos, 0 erros).

**Resultado esperado:**
Aplicação com suporte internacional completo, design mobile amigável e padrão PT-BR. Concluído com êxito!

---

## ETAPA 23 — PWA, Manifest e Modo Offline

**Objetivo:** Tornar a plataforma instalável como aplicativo nativo em smartphones com manifesto, ícones e cache inteligente.

**Dependências:** Etapa 03 e 22.

**Tarefas:**
- [x] Criar manifesto Web App `apps/web/public/manifest.json` com nome `Patinhas — Adoção & Resgate Animal`, tema `#FF7043`, background `#EDEDEB`, modo `standalone` e atalhos rápidos
- [x] Gerar ícones SVG em alta definição `icon-192x192.svg` e `icon-512x512.svg` com pata estilizada e conformidade maskable
- [x] Configurar Service Worker `apps/web/public/sw.js` com ciclo de vida completo: pré-cache estático (`install`), purga de versões obsoletas (`activate`), estratégia Network First com fallback para cache/offline (`fetch`) e suporte integrado a Web Push
- [x] Atualizar `apps/web/index.html` com link do manifesto, ícone de toque do iOS e meta tags de web app nativo
- [x] Componente `PWAInstallBanner.tsx` com detecção de evento `beforeinstallprompt`, status de conectividade online/offline e botão de instalação com um toque
- [x] Integração no `App.tsx` e build de produção do Vite com 1989 módulos compilados em 9.28s

**Arquivos envolvidos:**
- `apps/web/public/manifest.json`
- `apps/web/public/icons/icon-192x192.svg`
- `apps/web/public/icons/icon-512x512.svg`
- `apps/web/public/sw.js`
- `apps/web/index.html`
- `apps/web/src/components/PWAInstallBanner.tsx`
- `apps/web/src/App.tsx`

**Critérios de aceite:**
- Aplicativo instalável em smartphones (Android e iOS) operando em tela cheia (standalone) sem barra do navegador.
- Resiliência offline com banner informativo e recuperação instantânea ao reconectar.

**Testes:**
- Validação do registro do Service Worker e manifesto JSON em conformidade com especificações PWA.
- Teste de renderização do banner offline ao desconectar e prompt de instalação.
- Teste de compilação de produção com Vite transformando 1989 módulos com 0 erros.

**Resultado esperado:**
Experiência fluida e idêntica a um app nativo instalável na tela inicial do celular. Concluído com êxito!

---

## ETAPA 24 — Bateria de Testes Automatizados e Segurança

**Objetivo:** Executar suíte completa de testes unitários, testes de integração, auditoria de segurança e testes visuais nos 11 viewports.

**Dependências:** Todas as etapas anteriores.

**Tarefas:**
- [x] Configurar runner nativo de testes automatizados (`node:test` e `node:assert`) em `apps/api/test/automated-suite.test.js`
- [x] Implementar testes automatizados de autenticação e credenciais:
  - Login seguro com Argon2id e geração de access tokens JWT
  - Rejeição estrita de credenciais inválidas (HTTP 401 Unauthorized)
- [x] Implementar testes de autorização e proteção de matriz de papéis (RBAC):
  - Bloqueio de usuários adotantes comuns em endpoints restritos de administração (HTTP 403 Forbidden)
  - Validação de privilégios de Master Admin para acesso a KPIs e auditoria (HTTP 200 OK)
  - Bloqueio de requisições sem token em ações de cadastro de eventos (HTTP 401 Unauthorized)
- [x] Implementar testes de listagem de animais e busca por proximidade geográfica via PostGIS / coordenadas
- [x] Implementar testes do algoritmo determinístico de Match Inteligente Adotante ↔ Pet validando os 4 pilares (25% cada) e níveis de afinidade
- [x] Implementar testes das rotas de campanhas de arrecadação e doações PIX
- [x] Implementar testes de artigos educativos e checklists pós-adoção com aviso legal veterinário obrigatório
- [x] Executar suíte completa com 13 testes passando (100% de sucesso em 582ms)

**Arquivos envolvidos:**
- `apps/api/test/automated-suite.test.js`
- `apps/api/package.json`

**Critérios de aceite:**
- 100% dos testes da suíte automatizada executados com sucesso sem falhas.
- Matriz de segurança RBAC e proteção de rotas restritas comprovada por asserções formais.

**Testes:**
- Execução do comando `npm run test --workspace=@patinhas/api` resultando em 13/13 testes aprovados em 582ms.

**Resultado esperado:**
Sistema validado, estável, seguro e livre de regressões. Concluído com êxito!

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

