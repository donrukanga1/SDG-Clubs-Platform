# Multi-stage production build for full-stack React + Express App
# Stage 1: Build the client assets and compile the server bundle
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Lightweight production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Install ONLY production dependencies to keep the image minimal and secure
COPY package*.json ./
RUN npm ci --only=production

# Copy pre-compiled bundles (both front-end assets and bundled Node server in dist/)
COPY --from=builder /app/dist ./dist

# Expose port 3000 for standard ingress routing
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
