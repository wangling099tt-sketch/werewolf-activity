FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY shared/ ./shared/

RUN npm ci

COPY . .

EXPOSE 3001

USER node

CMD ["node", "server.js"]
