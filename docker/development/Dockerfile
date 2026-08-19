FROM node:22-alpine

WORKDIR /app

# Install dependency untuk node-gyp
RUN apk add --no-cache \
    python3 \
    make \
    g++

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm","run","dev"]