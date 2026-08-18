FROM node:18-alpine

WORKDIR /app

# Copy all client files (including src for build)
COPY client/ ./client/

# Install dependencies and build client
RUN cd client && npm install && npm run build

# Copy server files
COPY server/ ./server/

EXPOSE 3001

CMD ["node", "server/index.js"]
