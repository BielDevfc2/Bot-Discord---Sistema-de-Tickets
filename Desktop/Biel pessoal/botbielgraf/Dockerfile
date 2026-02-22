FROM node:20-alpine

WORKDIR /app/ticket

COPY ticket/package*.json ./

RUN npm ci --omit=dev || npm install --omit=dev

COPY ticket/ ./

CMD ["node", "index.js"]
