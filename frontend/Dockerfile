# Stage 1: Build the React Application
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependency definition
COPY package.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the Static Files via NGINX
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose Nginx default port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
