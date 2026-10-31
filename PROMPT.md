# 🐾 PROMPT MASTER — PLATAFORMA DE ADOÇÃO DE ANIMAIS

## 1. OBJETIVO DO PROJETO

Desenvolva uma plataforma completa de adoção responsável de animais de estimação, utilizando tecnologias modernas, arquitetura escalável, segurança, excelente experiência do usuário e execução integral dos serviços próprios em Docker.

O aplicativo conectará:

- Pessoas interessadas em adotar animais.
- Protetores independentes.
- ONGs e abrigos.
- Pessoas interessadas em oferecer lar temporário.
- Administradores da plataforma.

A aplicação deverá permitir encontrar animais disponíveis para adoção, explorar um mapa interativo, cadastrar animais, enviar solicitações, conversar com responsáveis, acompanhar processos de adoção e receber notificações em tempo real.

O produto será um **webapp com aparência permanente de aplicativo mobile**, instalável como Progressive Web App (PWA).

Utilizar o protótipo previamente aprovado como referência visual, mantendo sua identidade, cores, tipografia, componentes e experiência.

---

# 2. REGRA ABSOLUTA — APLICATIVO SEMPRE EM FORMATO MOBILE

Esta é uma decisão arquitetural obrigatória desde a criação do projeto.

**O sistema NÃO deverá possuir uma versão visual desktop.**

Independentemente do dispositivo utilizado, a interface deverá manter o formato, as proporções e a navegação de um aplicativo de smartphone.

### Dimensões obrigatórias

- Largura máxima global: `430px`.
- Largura em smartphones: `100%`.
- Altura mínima: `100dvh`.
- Centralização horizontal em telas maiores.
- Interface em coluna única.
- Navegação mobile permanente.
- Componentes dimensionados para telas de celular.
- Nenhuma expansão de layout para desktop.

### Em navegadores desktop

Quando aberto em monitores de 1024px, 1440px, 1920px, 2560px ou superiores:

- Centralizar o aplicativo horizontalmente.
- Manter largura máxima de 430px.
- Utilizar fundo externo neutro, como `#EDEDEB`.
- Preservar a navegação inferior mobile.
- Não criar menus laterais.
- Não utilizar dashboards desktop.
- Não expandir mapas.
- Não criar grids de múltiplas colunas.
- Não aumentar fontes ou botões proporcionalmente ao monitor.
- Não permitir que modais ultrapassem os limites do aplicativo.

O resultado deverá parecer um aplicativo de celular sendo executado dentro do navegador.

### Em smartphones

- Ocupar toda a largura disponível.
- Respeitar safe areas do dispositivo.
- Adaptar-se ao teclado virtual.
- Utilizar altura dinâmica da viewport.
- Evitar scroll horizontal.
- Manter navegação inferior.
- Oferecer experiência semelhante a um aplicativo nativo.

### Componente global obrigatório

Criar um componente `MobileAppShell`, responsável por envolver toda a aplicação.

Exemplo de estrutura:

```tsx
import type { ReactNode } from "react";

interface MobileAppShellProps {
  children: ReactNode;
}

export function MobileAppShell({
  children,
}: MobileAppShellProps) {
  return (
    <div className="flex min-h-dvh w-full justify-center bg-[#EDEDEB]">
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
          shadow-xl
        "
      >
        {children}
      </div>
    </div>
  );
}
```

Todas as rotas deverão utilizar esse container.

Elementos fixos, modais, notificações, menus e overlays deverão respeitar os limites do aplicativo.

Não utilizar `position: fixed` com largura total da viewport para elementos internos sem limitar sua área ao App Shell.

A navegação inferior deverá permanecer dentro dos 430px.

### Navegação principal

Criar uma barra inferior com cinco opções:

1. Início.
2. Explorar.
3. Mapa.
4. Favoritos.
5. Perfil.

Mensagens e notificações deverão estar acessíveis pelo cabeçalho e por atalhos contextuais.

### Regra para dashboards

Mesmo o painel Admin Master e os painéis de ONGs deverão seguir o formato mobile.

Utilizar:

- Cards verticais.
- Indicadores compactos.
- Gráficos adaptados.
- Abas horizontais.
- Listas.
- Filtros em bottom sheets.
- Menus expansíveis.

Nunca criar sidebar ou tabelas largas de desktop.

---

# 3. FLUXO OBRIGATÓRIO DE DESENVOLVIMENTO

## ANTES DE IMPLEMENTAR QUALQUER FUNCIONALIDADE

Criar obrigatoriamente três arquivos na raiz do projeto.

### DOCUMENTACAO.md

Deverá conter:

- Visão geral.
- Objetivos.
- Requisitos funcionais.
- Requisitos não funcionais.
- Arquitetura.
- Tecnologias.
- Design system.
- Regra global de layout mobile.
- Estrutura de diretórios.
- Modelagem de dados.
- APIs.
- WebSockets.
- Fluxos de adoção.
- Geolocalização.
- Notificações.
- Segurança.
- LGPD.
- Internacionalização.
- Infraestrutura Docker.
- Estratégia de testes.
- Critérios de aceite.
- Implantação.

### PASSOS.md

Criar planejamento detalhado, ordenado por prioridade.

Cada etapa deverá conter:

- Identificador.
- Objetivo.
- Tarefas com checkboxes.
- Dependências.
- Arquivos envolvidos.
- Critérios de aceite.
- Testes.
- Resultado esperado.

### CONTEXTO.md

Registrar continuamente:

- Estado atual.
- Decisões técnicas.
- Etapa em andamento.
- Etapas concluídas.
- Arquivos alterados.
- Problemas encontrados.
- Pendências.
- Próximos passos.
- Informações necessárias para retomar o desenvolvimento em outra sessão.

## REGRA DE PARADA

Após criar os três arquivos, interromper a execução.

**Não instalar dependências, criar containers, desenvolver telas ou implementar funcionalidades antes da minha autorização.**

## APÓS CADA ETAPA AUTORIZADA

1. Concluir as tarefas.
2. Executar testes.
3. Corrigir erros.
4. Atualizar `DOCUMENTACAO.md`.
5. Atualizar `PASSOS.md`.
6. Atualizar `CONTEXTO.md`.
7. Marcar `[x]` apenas nas tarefas validadas.
8. Apresentar resumo.
9. Informar arquivos modificados.
10. Gerar sugestão de commit Conventional Commits.
11. Aguardar autorização para a próxima etapa.

Nunca avançar automaticamente.

---

# 4. STACK TECNOLÓGICA

## Frontend

- React.
- TypeScript.
- Vite.
- Tailwind CSS.
- React Router.
- TanStack Query.
- Zustand.
- React Hook Form.
- Zod.
- Axios.
- Lucide Icons.
- Motion.
- i18next.
- Workbox.
- Vitest.
- React Testing Library.
- Playwright.

## Backend

- Node.js LTS.
- NestJS.
- TypeScript.
- Prisma ORM.
- REST API.
- Swagger/OpenAPI.
- Socket.IO.
- BullMQ.
- JWT.
- Argon2.
- Jest.

## Banco de dados

- PostgreSQL.
- PostGIS.
- Redis.

## Armazenamento

- MinIO, compatível com S3.

## Mapas

- MapLibre GL JS.
- Provedor de tiles configurável.
- PostGIS para consultas geográficas.
- Geocodificação configurável.

## Notificações

- Web Push API.
- Service Workers.
- VAPID.
- BullMQ.
- Redis.
- Firebase Cloud Messaging opcional.

## E-mails

- Nodemailer.
- Mailpit para desenvolvimento.
- SMTP configurável para produção.

---

# 5. EXECUÇÃO 100% EM DOCKER

Todos os serviços próprios deverão executar em containers.

Criar Docker Compose com:

- Frontend React.
- Backend NestJS.
- PostgreSQL/PostGIS.
- Redis.
- MinIO.
- Mailpit.
- Worker BullMQ.
- Nginx quando necessário.

Comando principal:

```bash
docker compose up -d --build
```

Criar volumes persistentes, health checks, variáveis de ambiente e scripts de inicialização.

O desenvolvedor não deverá precisar instalar Node.js, PostgreSQL ou Redis diretamente na máquina.

Mapas externos, envio de e-mails reais e serviços de push poderão depender de provedores externos. Documentar essas dependências e disponibilizar alternativas locais ou simuladas para desenvolvimento.

---

# 6. IDENTIDADE VISUAL

Utilizar o protótipo aprovado.

### Estilo

- Moderno.
- Clean.
- Minimalista.
- Acolhedor.
- Premium.
- Mobile First.
- Fotografias grandes.
- Cards arredondados.
- Sombras suaves.
- Microinterações.
- Animações discretas.

### Paleta

- Primária: `#FF7043`.
- Secundária: `#4DB6AC`.
- Background: `#FAFAF8`.
- Cards: `#FFFFFF`.
- Texto principal: `#263238`.
- Texto secundário: `#78909C`.
- Fundo externo desktop: `#EDEDEB`.

### Tipografia

Utilizar Plus Jakarta Sans ou Inter.

### Componentes

Criar design system reutilizável com:

- Buttons.
- Inputs.
- Selects.
- Cards.
- Badges.
- Bottom sheets.
- Dialogs.
- Toasts.
- Tabs.
- Skeletons.
- Empty states.
- Loaders.
- Navigation bar.
- App header.
- Image gallery.
- Search bar.
- Filter chips.

Todos deverão respeitar o container mobile.

---

# 7. PERFIS E PERMISSÕES

Implementar quatro perfis.

## Adotante

- Cadastro.
- Login.
- Perfil.
- Busca de animais.
- Mapa.
- Favoritos.
- Solicitações.
- Questionários.
- Chat.
- Notificações.
- Histórico de adoções.

## Protetor independente

- Cadastro de animais.
- Gerenciamento de anúncios.
- Solicitações recebidas.
- Análise de candidatos.
- Chat.
- Agendamentos.
- Aprovação ou recusa.
- Histórico de adoções.

## ONG/Abrigo

- Perfil institucional.
- Múltiplos colaboradores.
- Gestão de animais.
- Gestão de solicitações.
- Relatórios.
- Eventos.
- Campanhas.
- Gestão de lares temporários.

## Administrador Master

- Dashboard global.
- Gestão de usuários.
- Gestão de ONGs.
- Gestão de protetores.
- Moderação de animais.
- Denúncias.
- Auditoria.
- Configurações.
- Indicadores.
- Integrações.
- Gerenciamento de permissões.

Implementar RBAC e autorização por recurso.

---

# 8. AUTENTICAÇÃO

Implementar:

- Cadastro por e-mail.
- Confirmação obrigatória de e-mail.
- Login.
- Recuperação de senha.
- Redefinição de senha.
- Refresh token rotativo.
- Logout.
- Revogação de sessões.
- Proteção contra força bruta.
- Rate limiting.
- Logs de segurança.

Utilizar Argon2 para senhas.

Preferir cookies HttpOnly e Secure quando apropriado, com proteção CSRF e configuração SameSite adequada.

Criar proteção contra abuso e cadastros automatizados sem coleta excessiva de dados pessoais.

---

# 9. HOME

Criar tela inicial com:

- Saudação personalizada.
- Localização aproximada.
- Busca.
- Categorias.
- Animais próximos.
- Novos animais.
- Adoções urgentes.
- ONGs em destaque.
- Eventos próximos.
- Histórias de sucesso.

### Card do animal

- Fotografia.
- Nome.
- Idade.
- Sexo.
- Porte.
- Cidade.
- Distância aproximada.
- Status.
- Favorito.
- Selo de verificação.

Implementar carregamento incremental.

---

# 10. EXPLORAR E BUSCA AVANÇADA

Permitir filtrar por:

- Espécie.
- Raça.
- Idade.
- Sexo.
- Porte.
- Cor.
- Cidade.
- Estado.
- Distância.
- Vacinação.
- Castração.
- Vermifugação.
- Necessidades especiais.
- Compatibilidade com crianças.
- Compatibilidade com outros animais.
- Nível de energia.

Implementar:

- Ordenação.
- Busca textual.
- Filtros combináveis.
- Buscas salvas.
- Alertas personalizados.
- Alternância lista/mapa.

No mobile, utilizar bottom sheets para filtros avançados.

---

# 11. MAPA INTERATIVO EM TEMPO REAL

Criar uma tela de mapa totalmente funcional.

### Funcionalidades

- Geolocalização mediante permissão.
- Busca por cidade.
- Marcadores de animais.
- Marcadores de ONGs.
- Agrupamento de marcadores.
- Filtros.
- Raio de distância.
- Centralização.
- Atualização dinâmica.
- Cards de animais.
- Bottom sheet.
- Alternância mapa/lista.

### Raios

- 5 km.
- 10 km.
- 25 km.
- 50 km.
- 100 km.
- 200 km.

### Backend

Utilizar PostGIS com índices espaciais para consultas de proximidade.

### Atualizações

Quando um animal for cadastrado, adotado ou ficar indisponível, atualizar os resultados relevantes utilizando WebSocket ou invalidação de cache.

### Privacidade

Nunca expor endereço residencial exato de protetores.

Exibir coordenadas aproximadas de anúncios particulares.

O mapa representa os locais aproximados dos anúncios, não rastreamento contínuo de animais ou usuários.

### Layout

O mapa deverá permanecer dentro dos 430px mesmo no desktop.

---

# 12. PERFIL DO ANIMAL

Criar tela detalhada contendo:

- Galeria de fotografias.
- Vídeos.
- Nome.
- Espécie.
- Raça.
- Idade.
- Sexo.
- Porte.
- Peso.
- Cidade.
- Distância.
- Vacinação.
- Castração.
- Vermifugação.
- Personalidade.
- Compatibilidade.
- História.
- Responsável.
- Status.

### Ações

- Quero adotar.
- Favoritar.
- Compartilhar.
- Conversar.
- Denunciar.

Manter botão principal de adoção acessível na parte inferior da tela.

---

# 13. CADASTRO DE ANIMAIS

Criar formulário em etapas:

1. Informações básicas.
2. Fotografias e vídeos.
3. Saúde.
4. Personalidade.
5. Compatibilidade.
6. História.
7. Localização.
8. Requisitos para adoção.
9. Revisão.
10. Publicação.

Permitir salvar rascunho.

Implementar validação de arquivos, otimização de imagens e armazenamento no MinIO.

### Status

- Rascunho.
- Pendente de moderação.
- Disponível.
- Em processo de adoção.
- Adotado.
- Indisponível.
- Arquivado.

---

# 14. PROCESSO DE ADOÇÃO

Implementar fluxo completo.

### Etapas

1. Interesse.
2. Questionário.
3. Solicitação enviada.
4. Análise.
5. Conversa.
6. Entrevista.
7. Aprovação.
8. Confirmação.
9. Adoção concluída.
10. Acompanhamento pós-adoção.

### Status

- Draft.
- Submitted.
- UnderReview.
- InterviewScheduled.
- Approved.
- Rejected.
- Cancelled.
- Completed.

Criar timeline visual.

Registrar histórico das transições.

Impedir adoções duplicadas utilizando transações, validações de concorrência e idempotência.

---

# 15. CHAT EM TEMPO REAL

Implementar chat com Socket.IO.

### Recursos

- Conversas por animal.
- Mensagens instantâneas.
- Histórico.
- Mensagens não lidas.
- Indicador de digitação.
- Confirmação de leitura.
- Upload de imagens.
- Notificações.
- Reconexão.
- Bloqueio.
- Denúncia.

O chat deverá ter interface semelhante a aplicativos de mensagens, sempre limitado ao container mobile.

Implementar autorização para impedir acesso de usuários não participantes.

---

# 16. NOTIFICAÇÕES PUSH

Implementar notificações reais usando Web Push.

### Eventos

- Nova mensagem.
- Nova solicitação.
- Solicitação aprovada.
- Solicitação recusada.
- Entrevista agendada.
- Animal favorito adotado.
- Novo animal próximo.
- Novo animal compatível.
- Eventos de adoção.
- Lembretes pós-adoção.

### Recursos

- Opt-in.
- Preferências.
- Horários de silêncio.
- Histórico.
- Marcar como lida.
- Cancelamento de subscription.
- Retentativas.
- Controle de duplicidade.

Documentar as limitações de suporte a push nos diferentes navegadores e sistemas operacionais.

---

# 17. MATCH INTELIGENTE

Criar mecanismo de compatibilidade entre adotantes e animais.

### Critérios

- Tipo de residência.
- Espaço disponível.
- Experiência.
- Crianças.
- Outros animais.
- Tempo disponível.
- Nível de atividade.
- Preferências.
- Distância.

Exibir pontuação estimada e justificativas.

Começar com algoritmo determinístico e configurável.

Preparar arquitetura para IA opcional no futuro.

Não tratar a pontuação como aprovação automática de adoção.

---

# 18. FAVORITOS

Implementar:

- Favoritar.
- Remover favorito.
- Listar favoritos.
- Filtrar.
- Alertas de disponibilidade.
- Compartilhamento.

Criar modo opcional de descoberta por cards deslizáveis.

---

# 19. DASHBOARD DE ONGS E PROTETORES

Criar dashboard mobile com:

- Total de animais.
- Animais disponíveis.
- Animais adotados.
- Solicitações pendentes.
- Mensagens não lidas.
- Taxa de adoção.
- Histórico.
- Eventos.

### Gestão

- CRUD de animais.
- Candidatos.
- Solicitações.
- Agendamentos.
- Equipe.
- Relatórios.
- Perfil institucional.

Todos os indicadores e gráficos deverão ser adaptados ao formato mobile de até 430px.

---

# 20. ADMIN MASTER

Criar painel administrativo completo.

### Dashboard

- Usuários.
- ONGs.
- Protetores.
- Animais disponíveis.
- Adoções realizadas.
- Solicitações.
- Denúncias.
- Evolução mensal.
- Distribuição geográfica.

### Gestão

- Usuários.
- Organizações.
- Animais.
- Adoções.
- Denúncias.
- Eventos.
- Categorias.
- Conteúdo educativo.
- Integrações.
- Configurações.
- Auditoria.

Utilizar cards, listas, filtros e telas de detalhes.

Não criar versão desktop do painel administrativo.

---

# 21. MODERAÇÃO E SEGURANÇA

Implementar:

- Denúncias.
- Revisão de anúncios.
- Bloqueio de contas.
- Suspensão.
- Verificação de ONGs.
- Detecção de duplicidades.
- Proteção contra spam.
- Logs de auditoria.
- Controle de permissões.

Não permitir comercialização disfarçada de animais.

Criar mecanismos de revisão administrativa e registro das decisões.

---

# 22. ANIMAIS PERDIDOS E ENCONTRADOS

Criar módulo independente com:

- Cadastro de animal perdido.
- Cadastro de animal encontrado.
- Fotografias.
- Última localização aproximada.
- Data.
- Características.
- Alertas regionais.
- Busca no mapa.
- Contato protegido.
- Status de reencontro.

Não misturar esses anúncios com animais disponíveis para adoção.

---

# 23. LAR TEMPORÁRIO

Implementar:

- Cadastro de voluntários.
- Disponibilidade.
- Capacidade.
- Espécies aceitas.
- Região.
- Solicitações.
- Aprovação.
- Histórico.

Diferenciar acolhimento temporário de adoção definitiva.

---

# 24. EVENTOS DE ADOÇÃO

Criar:

- Calendário.
- Listagem.
- Detalhes.
- Localização no mapa.
- Data e horário.
- ONG organizadora.
- Inscrição.
- Compartilhamento.
- Notificações.

---

# 25. DOAÇÕES

Criar módulo de campanhas de apoio às ONGs.

### Recursos

- Campanhas.
- Metas.
- Descrição.
- Atualizações.
- Prestação de contas.
- Histórico.

Preparar integração futura com gateway de pagamentos, sem implementar processamento financeiro real nesta primeira versão.

---

# 26. ACOMPANHAMENTO PÓS-ADOÇÃO

Implementar:

- Checklist.
- Orientações.
- Lembretes.
- Cuidados.
- Adaptação.
- Histórico.
- Conteúdo educativo.

Não substituir orientação veterinária.

---

# 27. INTERNACIONALIZAÇÃO

Implementar:

- PT-BR.
- EN.
- ES.

Utilizar i18next.

### Requisitos

- Detecção inicial de idioma.
- Seleção manual.
- Persistência.
- Tradução de telas.
- Tradução de validações.
- Tradução de notificações.
- Formatação regional.

Idioma inicial: português brasileiro.

---

# 28. PWA

Implementar Progressive Web App.

### Recursos

- Manifest.
- Service Worker.
- Ícones.
- Splash screen.
- Instalação.
- Modo standalone.
- Cache.
- Notificações push.
- Tratamento de conectividade.
- Página offline.

O aplicativo deverá ser instalável em dispositivos compatíveis.

Preparar a arquitetura para eventual aplicativo nativo futuro.

---

# 29. MODELAGEM DE DADOS

Projetar as entidades necessárias, incluindo:

- users
- user_profiles
- user_sessions
- roles
- permissions
- organizations
- organization_members
- animals
- animal_photos
- animal_videos
- animal_health_records
- animal_traits
- animal_locations
- adoption_applications
- adoption_questionnaires
- adoption_answers
- adoption_status_history
- adoptions
- conversations
- messages
- message_attachments
- favorites
- saved_searches
- notifications
- notification_preferences
- push_subscriptions
- adoption_events
- foster_profiles
- foster_requests
- lost_found_reports
- reports
- moderation_actions
- campaigns
- educational_articles
- audit_logs
- system_settings

Utilizar UUIDs, índices, constraints, chaves estrangeiras e índices geográficos.

A modelagem definitiva deverá ser documentada e validada antes da implementação.

---

# 30. ARQUITETURA DO BACKEND

Utilizar monólito modular com princípios SOLID, Clean Architecture e separação de responsabilidades.

### Módulos

- Auth.
- Users.
- Organizations.
- Animals.
- Adoptions.
- Messaging.
- Notifications.
- Geolocation.
- Matching.
- Favorites.
- Events.
- Foster.
- LostAndFound.
- Donations.
- Moderation.
- Administration.
- Audit.

Separar controllers, services, DTOs, repositories, domain e infrastructure.

Evitar microserviços desnecessários.

---

# 31. APIs

Criar REST API versionada:

`/api/v1`

Implementar:

- Swagger.
- Paginação.
- Filtros.
- Ordenação.
- Validação.
- Tratamento padronizado de erros.
- Autorização.
- Rate limiting.
- Idempotência em operações críticas.

Documentar também os eventos WebSocket.

---

# 32. PERFORMANCE

Implementar:

- Lazy loading.
- Code splitting.
- Cache Redis.
- Índices no banco.
- Otimização de consultas.
- Thumbnails.
- Compressão de imagens.
- Paginação.
- Infinite scroll.
- Debounce.
- Clusterização de marcadores.
- Processamento assíncrono.
- Retentativas.
- Controle de concorrência.

Evitar consultas N+1.

---

# 33. TESTES

## Frontend

- Componentes.
- Hooks.
- Formulários.
- Navegação.
- Estados de interface.

## Backend

- Unitários.
- Integração.
- Autenticação.
- Autorização.
- Regras de adoção.
- Geolocalização.
- Notificações.
- Concorrência.

## E2E

Validar os principais fluxos:

1. Cadastro.
2. Confirmação de e-mail.
3. Login.
4. Busca.
5. Mapa.
6. Favoritos.
7. Solicitação.
8. Chat.
9. Aprovação.
10. Adoção concluída.

## Testes visuais obrigatórios

Testar larguras de:

- 320px.
- 360px.
- 375px.
- 390px.
- 414px.
- 430px.
- 768px.
- 1024px.
- 1440px.
- 1920px.
- 2560px.

Em qualquer viewport superior a 430px, o aplicativo deverá permanecer centralizado com largura máxima de 430px.

Validar também modais, mapas, bottom sheets, menus, chat e dashboards.

---

# 34. OBSERVABILIDADE

Implementar:

- Logs estruturados.
- Health checks.
- Correlation IDs.
- Monitoramento de erros.
- Auditoria.
- Métricas.
- Monitoramento de filas.

Preparar integração opcional com OpenTelemetry, Prometheus e Grafana.

---

# 35. LGPD E PRIVACIDADE

Implementar:

- Política de privacidade.
- Termos de uso.
- Consentimentos quando necessários.
- Gestão de preferências.
- Exportação de dados.
- Solicitação de exclusão.
- Política de retenção.
- Proteção de localização.
- Controle de acesso.
- Auditoria.

Evitar exposição de endereços residenciais, telefones e informações pessoais sem autorização adequada.

Documentar o tratamento de dados para revisão jurídica.

---

# 36. ESTRUTURA DO PROJETO

Utilizar estrutura semelhante a:

```text
pet-adoption/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── shared/
│   ├── types/
│   └── config/
├── docker/
│   ├── nginx/
│   ├── postgres/
│   └── scripts/
├── docs/
├── scripts/
├── tests/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
├── .gitignore
├── README.md
├── DOCUMENTACAO.md
├── PASSOS.md
└── CONTEXTO.md
```

A estrutura poderá ser refinada durante o planejamento.

---

# 37. PLANO DE IMPLEMENTAÇÃO

Criar no `PASSOS.md` pelo menos as seguintes etapas:

- [ ] 00 — Documentação e arquitetura.
- [ ] 01 — Monorepo e Docker.
- [ ] 02 — Banco de dados e migrations.
- [ ] 03 — MobileAppShell e design system.
- [ ] 04 — Autenticação.
- [ ] 05 — Usuários, perfis e organizações.
- [ ] 06 — Cadastro de animais.
- [ ] 07 — Home, busca e filtros.
- [ ] 08 — Mapa e geolocalização.
- [ ] 09 — Favoritos.
- [ ] 10 — Processo de adoção.
- [ ] 11 — Chat em tempo real.
- [ ] 12 — Notificações.
- [ ] 13 — Match inteligente.
- [ ] 14 — Dashboard de ONGs.
- [ ] 15 — Admin Master.
- [ ] 16 — Moderação.
- [ ] 17 — Animais perdidos.
- [ ] 18 — Lar temporário.
- [ ] 19 — Eventos.
- [ ] 20 — Doações.
- [ ] 21 — Pós-adoção.
- [ ] 22 — Internacionalização.
- [ ] 23 — PWA.
- [ ] 24 — Testes e segurança.
- [ ] 25 — Performance e observabilidade.
- [ ] 26 — Preparação para produção.

Detalhar cada etapa com subtarefas, dependências e critérios de aceite.

---

# 38. CRITÉRIOS FINAIS DE ACEITE

O sistema deverá:

- Executar os serviços próprios via Docker.
- Utilizar React e NestJS.
- Persistir dados no PostgreSQL.
- Possuir mapas reais.
- Implementar geolocalização.
- Possuir notificações push.
- Possuir chat em tempo real.
- Implementar fluxo completo de adoção.
- Possuir painéis de ONGs e Admin Master.
- Suportar PT-BR, EN e ES.
- Ser instalável como PWA.
- Possuir testes automatizados.
- Documentar APIs.
- Aplicar controles de segurança e privacidade.

### Critério visual obrigatório

**Todas as telas deverão possuir aparência mobile, inclusive em navegadores desktop, com largura máxima global de 430px.**

Não deverá existir versão visual desktop.

---

# 39. REGRAS FINAIS

1. Criar primeiro a documentação.
2. Não implementar antes da autorização.
3. Seguir o protótipo aprovado.
4. Manter layout mobile em todas as telas.
5. Não criar versão desktop.
6. Utilizar Docker.
7. Implementar funcionalidades reais nas etapas autorizadas.
8. Evitar mocks em fluxos finais de produção.
9. Validar cada etapa.
10. Atualizar os três arquivos obrigatórios.
11. Marcar checkboxes somente após conclusão.
12. Gerar sugestão de commit.
13. Não executar commits automaticamente.
14. Não avançar sem autorização.
15. Preservar contexto para continuidade.
16. Priorizar segurança, desempenho e acessibilidade.

---

# PRIMEIRA AÇÃO OBRIGATÓRIA

**Execute exclusivamente a ETAPA 00 — Documentação e planejamento.**

Crie:

- `DOCUMENTACAO.md`
- `PASSOS.md`
- `CONTEXTO.md`

Documente integralmente a arquitetura, os requisitos, o design system mobile, o banco de dados, as integrações, a infraestrutura Docker e todas as etapas necessárias.

Após criar os arquivos, apresente:

- Resumo da arquitetura.
- Estrutura proposta.
- Lista de etapas.
- Decisões técnicas relevantes.
- Pendências que precisam de aprovação.

**NÃO INSTALE DEPENDÊNCIAS.**

**NÃO CRIE O FRONTEND OU BACKEND.**

**NÃO INICIE OS CONTAINERS.**

**NÃO IMPLEMENTE FUNCIONALIDADES.**

**AGUARDE MINHA AUTORIZAÇÃO EXPLÍCITA PARA INICIAR A ETAPA 01.**