# Build stage — always run on the build host's native arch.
# The output is static HTML/JS/CSS so the arch of the builder is
# irrelevant. This avoids QEMU emulation when buildx targets arm64.
FROM --platform=$BUILDPLATFORM cgr.dev/chainguard/node:latest AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM cgr.dev/chainguard/nginx:latest

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
