# Estágio de build
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN npm install
RUN npm run build --workspace=@patinhas/types
RUN npm run build --workspace=@patinhas/shared
RUN npm run build --workspace=@patinhas/api

# Estágio de produção
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache postgresql-client

ENV NODE_ENV=production

COPY package*.json ./
COPY --from=builder /app/packages/ ./packages/
COPY --from=builder /app/apps/api/package*.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN npm install --omit=dev

WORKDIR /app/apps/api

EXPOSE 3333

CMD ["node", "dist/main"]

