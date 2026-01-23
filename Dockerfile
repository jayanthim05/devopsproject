# Use Node.js image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Expose port 5000
EXPOSE 5000

# Set environment variable for port
ENV PORT=5000

# Start the application
CMD ["npm", "start"]