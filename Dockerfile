# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Declarar ARGs para as variáveis Vite (passadas pelo EasyPanel em tempo de build)
ARG VITE_API_URL
ARG VITE_PLAN_NAME
ARG VITE_PLAN_AMOUNT

# Exportar como ENV para o Vite conseguir ler durante o build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PLAN_NAME=$VITE_PLAN_NAME
ENV VITE_PLAN_AMOUNT=$VITE_PLAN_AMOUNT

COPY package*.json ./
RUN npm ci
COPY . .
RUN chmod +x node_modules/.bin/* && npm run build

# Stage 2: Servir com Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
