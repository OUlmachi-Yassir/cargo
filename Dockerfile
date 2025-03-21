# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (if using TypeScript)
RUN npm run build

# Expose the port your app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "run", "start:prod"]