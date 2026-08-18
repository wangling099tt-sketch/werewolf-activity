FROM node:18-alpine AS builder

WORKDIR /app

# Copy client files first
COPY client/ ./client/

# Force npm install (no cache)
RUN cd client && npm ci --prefer-offline=false || npm install --force

# Build client
RUN cd client && npm run build

# Copy server files
COPY server/ ./server/

# Install server dependencies
RUN cd server && npm install --omit=dev

EXPOSE 3001

WORKDIR /app/server
CMD ["node", "index.js"]