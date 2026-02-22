FROM node:20-alpine

WORKDIR /app

# Copy entire ticket folder
COPY ticket/ ./

# Install dependencies
RUN npm install --omit=dev

CMD ["node", "index.js"]
