# Multi-stage Docker build for BorrowBox (Single-Container Production)

# --- Stage 1: Build React Frontend ---
FROM node:18-alpine AS client-builder

WORKDIR /app

# Copy root and client package definitions
COPY package*.json ./
COPY client/package*.json ./client/

# Install client dependencies & build static assets
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

# --- Stage 2: Server & Production Runner ---
FROM node:18-alpine AS runner

WORKDIR /app

# Set node environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy root and server package definitions
COPY package*.json ./
COPY server/package*.json ./server/

# Install production server dependencies
RUN cd server && npm ci --only=production

# Copy server application source code
COPY server/ ./server/

# Copy built React frontend static dist into Express static public directory
COPY --from=client-builder /app/client/dist ./server/public

# Expose production port
EXPOSE 5000

# Command to launch Express server
CMD ["node", "server/server.js"]
