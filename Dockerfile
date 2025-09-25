# Dockerfile

# ---- Stage 1: Build ----
# This stage installs dependencies and builds the Next.js app
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# ---- Stage 2: Production ----
# This stage creates the final, small production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV production

# Copy the standalone output from the builder stage
# This includes the server, static assets, and minimal node_modules
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# Set the port environment variable
ENV PORT 3000

# Command to start the server
# Next.js standalone output creates a server.js file for us
CMD ["node", "server.js"]