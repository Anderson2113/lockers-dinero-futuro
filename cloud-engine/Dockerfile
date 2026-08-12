# ==========================================
# ETAPA 1: CONSTRUCCIÓN (BUILDER)
# ==========================================
FROM node:22-alpine AS builder

# Agregar Git para resolución de dependencias
RUN apk add --no-cache git

WORKDIR /app

# 1. Copiar manifiestos de paquetes (Root y Workspaces)
COPY package*.json ./
COPY cloud-engine/package.json cloud-engine/
COPY shared/package.json shared/

# 2. Instalar TODAS las dependencias
RUN npm install

# 3. Copiar el código fuente completo
COPY cloud-engine/ cloud-engine/
COPY shared/ shared/
COPY tsconfig*.json ./

# 4. Compilar los módulos
RUN npm run build --workspace=shared
RUN npm run build --workspace=cloud-engine

# ==========================================
# ETAPA 2: PRODUCCIÓN (RUNNER)
# ==========================================
FROM node:22-alpine AS runner

# Agregar Git también en producción si hay dependencias de runtime que lo requieran
RUN apk add --no-cache git

WORKDIR /app

ENV NODE_ENV=production

# 1. Copiar manifiestos nuevamente
COPY package*.json ./
COPY cloud-engine/package.json cloud-engine/
COPY shared/package.json shared/

# 2. Instalar SOLO dependencias de producción
RUN npm install --omit=dev

# 3. Copiar ÚNICAMENTE los binarios generados
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/cloud-engine/dist ./cloud-engine/dist

# 4. Comando de arranque
CMD ["npm", "run", "start", "--workspace=cloud-engine"]
