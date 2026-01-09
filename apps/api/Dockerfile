FROM node:20-alpine

WORKDIR /app

# Copy package files and npm config
COPY package*.json ./
COPY .npmrc ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "run", "dev"]
