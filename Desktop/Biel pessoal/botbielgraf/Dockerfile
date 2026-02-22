FROM node:20-alpine

WORKDIR /app

# Copy root package.json (if any) and install dependencies for the ticket folder
COPY package.json ./

# Install root deps (if any) and then install ticket deps
RUN if [ -f package.json ]; then \
      npm ci --omit=dev || true; \
    fi

# Fallback: make sure ticket deps are installed at runtime when using Dockerfile
COPY ticket/package*.json ./ticket/
WORKDIR /app/ticket
RUN if [ -f package-lock.json ]; then \
      npm ci --omit=dev; \
    else \
      npm install --omit=dev; \
    fi

COPY . .

WORKDIR /app/ticket
CMD ["node", "index.js"]
