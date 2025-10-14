# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source files
COPY . .

# Expose service port
EXPOSE 80

# Run the app
CMD ["npm", "run", "start:dev"]
