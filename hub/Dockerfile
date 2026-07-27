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

# VALIDA está integrada nativamente en el código del hub (hub/src/valida/),
# así que solo necesita su URL de backend al momento del build.
ARG VITE_APP_API_URL_VALIDA="https://azcrprocapsdevservicios.icymushroom-816c3a5a.westus.azurecontainerapps.io/api/v1"
ENV VITE_APP_API_URL_VALIDA=$VITE_APP_API_URL_VALIDA

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
