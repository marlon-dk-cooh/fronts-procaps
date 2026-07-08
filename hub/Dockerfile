# Multi-stage build for frontend
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# VALIDA (valida_2) se sirve aislado bajo /valida-app/ porque su stack no es
# compatible con el del hub. OJO: el build context de esta imagen es la carpeta
# hub/, así que desde acá NO se puede COPY ../valida_2. Para el deploy real hay
# que meter el build de VALIDA en /usr/share/nginx/html/valida-app/. Dos opciones:
#   a) Construir valida_2 aparte (cd ../valida_2 && npm ci && npm run build) y
#      montar/copiar su dist en /usr/share/nginx/html/valida-app en el compose.
#   b) Mover el build context a ai-frontend-templates/ y agregar acá algo como:
#        COPY --from=build-valida /app/dist /usr/share/nginx/html/valida-app
#      (con un stage extra que haga el build de valida_2).
# El location /valida-app/ del nginx.conf ya espera el dist en esa ruta.

# # Create a simple nginx config for SPA
# RUN echo 'server { \
#     listen 80; \
#     server_name localhost; \
#     root /usr/share/nginx/html; \
#     index index.html; \
#     location / { \
#         try_files $uri $uri/ /index.html; \
#     } \
# }' > /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
