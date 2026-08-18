FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN apk add --no-cache tini && tini -g

EXPOSE 3000

USER node

ENTRYPOINT ["tini", "--"]
CMD ["node", "server.js"]
