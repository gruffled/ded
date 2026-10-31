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

# Chainguard's nginx image runs as a non-root user, so use an unprivileged port.
EXPOSE 8080

# Start nginx
CMD ["-g", "daemon off;"]
