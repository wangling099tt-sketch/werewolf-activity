FROM node:18-alpine AS builder

WORKDIR /app

# Copy all client files first
COPY client/ ./client/

# Install and build client
RUN cd client && npm install && npm run build

# Copy server files
COPY server/ ./server/

# Install server dependencies
RUN cd server && npm install --omit=dev

EXPOSE 3001

WORKDIR /app/server
CMD ["node", "index.js"]