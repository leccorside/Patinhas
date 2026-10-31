# 🚀 Guia de Implantação e Operação em Produção — Plataforma Patinhas

Este documento detalha o processo completo de implantação, configuração e operação contínua da plataforma **Patinhas** em ambientes de produção.

---

## 🏗️ 1. Arquitetura de Produção

A plataforma foi conteinerizada com Docker e pode ser executada em qualquer servidor Linux (Ubuntu 22.04 LTS / Debian 12) ou plataforma de nuvem (AWS EC2, DigitalOcean, Hetzner, Railway, etc.):

- **Gateway / Proxy Reverso:** Nginx com terminação SSL (Let's Encrypt), compressão gzip e cabeçalhos de segurança (HSTS, CSP, X-Frame-Options, X-Content-Type-Options).
- **Frontend SPA:** Nginx servindo o bundle compilado do React 18 / Vite (PWA com Service Worker e cache estático).
- **Backend API:** NestJS rodando em modo produção (`node dist/main`) com clustering e health checks.
- **Banco de Dados:** PostgreSQL 16 com extensão espacial PostGIS 3.4 e índices GIST.
- **Cache Distribuído e Filas:** Redis 7 com autenticação por senha para cache de endpoints e BullMQ.
- **Armazenamento de Mídia:** MinIO (compatível com AWS S3) para fotos de animais, comprovantes de vacinas e laudos.

---

## 📋 2. Variáveis de Ambiente de Produção (`.env.production`)

Crie o arquivo `.env.production` no diretório raiz do projeto com valores fortes e seguros:

```bash
# Ambiente
NODE_ENV=production
PORT=3333
API_PREFIX=api/v1
CORS_ORIGIN=https://app.patinhas.org

# Banco de Dados PostgreSQL + PostGIS
DB_USER=patinhas_prod_user
DB_PASSWORD=GereUmaSenhaForteComArgon2idOuOpenssl
DB_NAME=patinhas_production
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?schema=public

# Redis
REDIS_PASSWORD=SenhaForteParaRedisProduction
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# MinIO / AWS S3
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ROOT_USER=patinhas_storage_admin
MINIO_ROOT_PASSWORD=SenhaForteParaMinIOS3Prod
MINIO_BUCKET_NAME=patinhas-media-prod
STORAGE_USE_SSL=true

# Segurança e JWT
JWT_SECRET=ChaveSuperSecretaDePeloMenos64CaracteresRandomicos
JWT_REFRESH_SECRET=ChaveSuperSecretaDeRefreshDePeloMenos64Caracteres
COOKIE_SECRET=ChaveDeAssinaturaDeCookiesHttpOnly

# Web Push (VAPID)
VAPID_PUBLIC_KEY=SuaChavePublicaGeradaPeloWebPush
VAPID_PRIVATE_KEY=SuaChavePrivadaVAPID
VAPID_SUBJECT=mailto:contato@patinhas.org

# E-mail (SMTP de Produção - SendGrid, Resend ou Amazon SES)
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USER=apikey
MAIL_PASS=SuaApiKeySendGrid
MAIL_FROM="Patinhas <nao-responda@patinhas.org>"
```

---

## ⚡ 3. Inicialização dos Serviços em Produção

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/patinhas.git /opt/patinhas
cd /opt/patinhas

# 2. Configurar o arquivo .env
cp .env.example .env.production
nano .env.production

# 3. Construir e iniciar os containers em background
docker compose -f docker-compose.prod.yml up -d --build

# 4. Executar as migrações do banco de dados Prisma
docker exec -it patinhas_api_prod npx prisma migrate deploy

# 5. Executar o seed inicial de dados essenciais (opcional para primeiro deploy)
docker exec -it patinhas_api_prod npx prisma db seed
```

---

## 💾 4. Rotina de Backup Automatizado do Banco de Dados

### Linux (Cron Job Diário às 03:00)
Adicione ao crontab do servidor (`crontab -e`):

```bash
0 3 * * * /opt/patinhas/scripts/backup-db.sh >> /var/log/patinhas_backup.log 2>&1
```

### Windows Server (Agendador de Tarefas / Task Scheduler)
Execute periodicamente o script PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File C:\caminho\patinhas\scripts\backup-db.ps1
```

---

## 🔍 5. Monitoramento e Verificação de Saúde (Health Check)

- **Status da API:** `GET https://api.patinhas.org/api/v1/health`
- **Documentação OpenAPI:** `GET https://api.patinhas.org/api/docs`
- **Logs em Tempo Real:**
  ```bash
  docker logs -f patinhas_api_prod --tail 50
  docker logs -f patinhas_postgres_prod --tail 50
  docker logs -f patinhas_redis_prod --tail 50
  ```

---

## 🛡️ 6. Checklist de Segurança e LGPD

- [x] Senhas criptografadas com `Argon2id` (tempo de custo 3, memória 64MB).
- [x] Cookies de autenticação `HttpOnly`, `SameSite=Strict` e flag `Secure`.
- [x] Coordenadas aproximadas com jitter de ±200m para proteção de lares temporários e abrigos.
- [x] Logs de auditoria gravados na tabela `audit_logs` para todas as ações administrativas.
- [x] Termos de adoção assinados e registrados com consentimento explícito.
- [x] Suíte de 13 testes automatizados executada e 100% aprovada.
