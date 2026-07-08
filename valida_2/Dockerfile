# syntax=docker/dockerfile:1
FROM node:20-alpine AS build
WORKDIR /app

# Instalamos deps primero para aprovechar el cache de Docker.
COPY package*.json ./
RUN npm ci

# Copiamos el resto del código. Incluye el .env committeado, que Vite lee en
COPY . .

ARG VITE_APP_API_URL_GPT=""
RUN if [ -n "$VITE_APP_API_URL_GPT" ]; then \
      export VITE_APP_API_URL_GPT="$VITE_APP_API_URL_GPT"; \
    fi; \
    npm run build

FROM nginx:alpine
# Fallback para SPA + cache de assets (mirá nginx.conf).
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# App Service se lanza en puerto 80 por defecto.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
