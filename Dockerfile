FROM node:8.6.0-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json /app/

# Build the code
RUN npm install

# Bundle monorail source
COPY . /app/

# Prepares environment before running node
ENTRYPOINT ["docker-entrypoint.sh"]

# Port 8080 faces internet and 8484 local network
EXPOSE 8080 8484

# Run monorail
CMD [ "node", "/app/index.js" ]
