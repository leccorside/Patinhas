# Estágio de build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

RUN npm install
RUN npm run build --workspace=@patinhas/types
RUN npm run build --workspace=@patinhas/shared
RUN npm run build --workspace=@patinhas/web

# Estágio de produção com Nginx
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY docker/nginx/web.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

