FROM node:8.6.0-alpine

RUN apk update && apk upgrade && apk add ca-certificates

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json package-lock.json /app/

# Build the code
RUN npm install

# Bundle monorail source
COPY . /app/

# Create symlink for new configuration path
RUN mkdir -p /app/config && ln -sf /app/config/config.js /app/config.js

# Prepares environment before running node
ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]

# Port 8080 faces internet and 8484 local network
EXPOSE 8080 8484

# Run monorail
CMD [ "node", "/app/index.js" ]
