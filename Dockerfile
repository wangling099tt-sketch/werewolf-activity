# syntax=docker/dockerfile:1.6
FROM node:18-alpine AS client-builder

WORKDIR /build

# Copy only package files first for cache
COPY client/package*.json ./
RUN npm install --no-audit --no-fund

# Copy source and build
COPY client/ ./
RUN npm run build

# === Server stage ===
FROM node:18-alpine AS server-builder

WORKDIR /build
COPY server/package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

# === Final runtime stage ===
FROM node:18-alpine

WORKDIR /app

# Copy built client
COPY --from=client-builder /build/dist /app/client/dist

# Copy server with deps
COPY --from=server-builder /build /app/server

# Copy server source (for runtime)
COPY server/ /app/server/

# Fix Windows-style line endings in server files (git CRLF � LF)
RUN find /app/server -name '*.js' -exec sed -i 's/\r$//' {} \; 2>/dev/null || true

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app/server
CMD ["node", "index.js"]