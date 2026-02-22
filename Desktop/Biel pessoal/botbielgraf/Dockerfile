FROM node:20-alpine

WORKDIR /app

# Copy package files from ticket folder
COPY ticket/package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the ticket folder
COPY ticket/ ./

CMD ["node", "index.js"]
