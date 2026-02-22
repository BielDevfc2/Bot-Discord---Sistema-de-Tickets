FROM node:20-alpine
WORKDIR /app
COPY . .
WORKDIR /app/ticket
RUN npm ci --production
CMD ["node", "index.js"]
