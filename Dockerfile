FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY src ./src

# compile typescript to javascript
RUN npm run build

COPY ./src/certificates ./dist/certificates

COPY ./src/config ./dist/config

# Production Stage
FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

RUN npm install -g pm2

COPY ecosystem.config.js .

# Start the application with PM2
CMD ["pm2-runtime", "start", "ecosystem.config.js"]
