# Nagual dashboard — production container for VPS (standalone Next.js)
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1
# build script already copies static + public into .next/standalone, so it is self-contained
COPY --from=build /app/.next/standalone ./
EXPOSE 3000
CMD ["node", "server.js"]
