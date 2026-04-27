# Stage 1: Build
FROM node:20-alpine AS builder

RUN apk add --no-cache \
    autoconf \
    automake \
    libtool \
    make \
    gcc \
    g++ \
    libc-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    nasm \
    zlib-dev \
    python3

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY src ./src

EXPOSE 3000

CMD ["node", "src/app.js"]