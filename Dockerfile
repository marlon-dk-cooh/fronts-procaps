# syntax=docker/dockerfile:1
#
# Build combinado hub + VALIDA. 
# El hub sirve /sema y /valida (este último monta a VALIDA en un <iframe>, ver hub/src/pages/valida/Valida.tsx). 
# Como los dos frontends corren en stacks incompatibles (hub: React 18 + Tailwind v3 + Vite 7,
# VALIDA: React 19 + Tailwind v4 + Vite 8 + React Compiler), cada uno se compila
# en su propio stage y el resultado final solo junta los dos `dist` con nginx.
#
# Build context: ai-frontend-templates/ (esta carpeta), NO hub/ ni valida_2/.
#   docker build -t hub-valida:test -f Dockerfile .
# Sale desde esta raiz.

# ---------- Stage 1: build del hub (SEMA en /sema, shell del hub) ----------
FROM node:18-alpine AS build-hub
WORKDIR /app
COPY hub/package*.json ./
RUN npm ci
COPY hub/ .
RUN npm run build

# ---------- Stage 2: build de VALIDA (valida_2, montado en /valida-app) ----------
FROM node:20-alpine AS build-valida
WORKDIR /app
COPY valida_2/package*.json ./
RUN npm ci
COPY valida_2/ .

# VALIDA ya trae su .env committeado con la URL del backend en Azure Container
# Apps, pero la dejamos parametrizable por build-arg para no depender de eso en
# el pipeline real más adelante. Por ahora el default es igual a lo que ya hay
# en valida_2/.env, así el build funciona out-of-the-box sin pasar nada.
ARG VITE_VALIDA_API_URL_GPT="https://azcrprocapsdevservicios.icymushroom-816c3a5a.westus.azurecontainerapps.io/api/v1"
ENV VITE_APP_API_URL_GPT=$VITE_VALIDA_API_URL_GPT
RUN npm run build

# ---------- Stage 3: nginx sirviendo ambos dist ----------
FROM nginx:alpine
COPY --from=build-hub /app/dist /usr/share/nginx/html
COPY --from=build-valida /app/dist /usr/share/nginx/html/valida-app
COPY hub/nginx.conf /etc/nginx/nginx.conf

# Web App for Containers / App Service arranca el contenedor esperando el
# puerto 80 por defecto.
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
