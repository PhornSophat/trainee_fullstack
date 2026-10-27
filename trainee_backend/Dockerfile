#**** Stage 1: Build the NestJS Application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Run install if cache is changed
RUN npm ci


# Copy the source code
COPY . .
RUN npm run build

# **** Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

USER node 

EXPOSE 3000

CMD ["node", "dist/main.js"]