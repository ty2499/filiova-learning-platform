FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm ci --include=dev

COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./
COPY drizzle.config.ts ./

COPY shared ./shared
COPY client ./client
COPY server ./server

RUN npm run build

RUN npm prune --production

FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y \
    fontconfig \
    fonts-noto-core \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

COPY public ./public
COPY migrations ./migrations
COPY drizzle.config.ts ./

EXPOSE 5000

CMD ["npm", "start"]
