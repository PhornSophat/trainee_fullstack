# ==========================================
# Stage 1: Build the React Application (Node.js)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# 1. Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# 2. Copy source code and build production files into /app/dist
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Serve with Nginx (Super Fast & Light)
# ==========================================
FROM nginx:alpine AS runner

# 1. Delete default Nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# 2. Copy our custom config from Step 1
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Copy compiled files (/app/dist) from Stage 1 into Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 4. Expose port 80
EXPOSE 80

# 5. Keep Nginx running in the foreground
CMD ["nginx", "-g", "daemon off;"]
