FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci && cd server && npm ci && cd ../client && npm install

# Build client
RUN cd client && npm run build

# Copy server files
COPY server/ ./server/
COPY shared/ ./shared/

# Copy root level files needed
COPY server.js ./
COPY .env.example .env 2>/dev/null || true

EXPOSE 3001

CMD ["node", "server/index.js"]
