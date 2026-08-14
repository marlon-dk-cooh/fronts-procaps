# Multi-stage build for frontend
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Vite inyecta las variables VITE_* en tiempo de build, no de ejecución:
# deben pasarse con --build-arg para que queden en el bundle.
ARG VITE_APP_API_URL_GPT
ENV VITE_APP_API_URL_GPT=$VITE_APP_API_URL_GPT
ARG VITE_APP_API_URL_SQL
ENV VITE_APP_API_URL_SQL=$VITE_APP_API_URL_SQL
ARG VITE_CATALOG
ENV VITE_CATALOG=$VITE_CATALOG
ARG VITE_USE_MOCKS="false"
ENV VITE_USE_MOCKS=$VITE_USE_MOCKS
ARG VITE_CLIENT_ID
ENV VITE_CLIENT_ID=$VITE_CLIENT_ID
ARG VITE_TENANT_ID
ENV VITE_TENANT_ID=$VITE_TENANT_ID
ARG VITE_REDIRECT_URI
ENV VITE_REDIRECT_URI=$VITE_REDIRECT_URI

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
