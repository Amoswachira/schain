# Base image
FROM node:14-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json* ./

# Install project dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Expose the port that the application will listen on
EXPOSE 3000

# Run the application
CMD [ "npm", "start" ]
