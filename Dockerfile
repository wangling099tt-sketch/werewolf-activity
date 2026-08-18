FROM node:18-alpine

WORKDIR /app

# Install all dependencies
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/
RUN npm ci

# Build client
COPY client/src ./client/src
COPY client/index.html ./client/
COPY client/vite.config.js ./client/
COPY client/.env.production ./client/
RUN cd client && npm ci && npm run build

# Copy server files
COPY server/ ./server/
COPY shared/ ./shared/
COPY server.js ./

EXPOSE 3001

USER node

CMD ["node", "server.js"]
