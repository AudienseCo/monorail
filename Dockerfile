FROM node:8.6.0-alpine

# Create app directory
WORKDIR /app

# Bundle monorail source
COPY . .

# Build the code
RUN npm install

