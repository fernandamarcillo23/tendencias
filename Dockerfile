# Etapa 1: Construcción de la aplicación React (Frontend)
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Etapa 2: Servidor Node.js y ejecución unificada
FROM node:20-alpine
WORKDIR /app

# Instalar dependencias del servidor
COPY server/package*.json ./
RUN npm install --omit=dev

# Copiar código del servidor
COPY server/ ./

# Copiar la compilación de React dentro de la carpeta 'public' del servidor
COPY --from=client-builder /app/client/dist ./public

# Variables de entorno por defecto
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "index.js"]
