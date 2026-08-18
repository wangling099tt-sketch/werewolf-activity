FROM node:18-alpine

WORKDIR /app

# Copy all client files (including src for build)
COPY client/ ./client/

# Install dependencies and build client
RUN cd client && npm install && npm run build

# Copy server files
COPY server/ ./server/
COPY shared/ ./shared/

# Copy root level files needed
COPY server.js ./
COPY .env.example .env 2>/dev/null || true

EXPOSE 3001

CMD ["node", "server/index.js"]
