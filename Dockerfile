# Etapa 1: instala dependencias y build
FROM node:18-alpine AS builder
WORKDIR /app

# Copia package.json y lockfile para cachear npm ci
COPY package.json package-lock.json ./
RUN npm ci

# Copia el resto del código y genera la app
COPY . .
RUN npm run build

# Etapa 2: imagen de producción ligera
FROM node:18-alpine AS runner
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Expone el puerto
EXPOSE 3000

# Copia sólo lo necesario desde builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Crea carpeta para la base de datos SQLite (opcional si la usas en /app/data)
RUN mkdir -p /app/data

# Comando por defecto
CMD ["npm", "run", "start"]
