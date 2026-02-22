FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Use npm ci if package-lock.json exists, otherwise fall back to npm install
RUN if [ -f package-lock.json ]; then \
			npm ci --omit=dev; \
		else \
			npm install --omit=dev; \
		fi

COPY . .

CMD ["node", "index.js"]