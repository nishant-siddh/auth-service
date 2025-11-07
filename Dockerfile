# ------------------------------
# STAGE 1: Build the application
# ------------------------------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install all deps (including dev)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build NestJS app (compiles TypeScript to dist/)
RUN npm run build

# ------------------------------
# STAGE 2: Create minimal runtime image
# ------------------------------
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy only production dependencies
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy built output and any required static assets from builder
COPY --from=builder /app/dist ./dist

# Expose port (change if your app listens elsewhere)
EXPOSE 80

# Default command
CMD ["node", "dist/main.js"]
