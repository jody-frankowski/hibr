FROM node:22-alpine AS builder

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM caddy AS runner

COPY --from=builder /app/out /usr/share/caddy

EXPOSE 80
