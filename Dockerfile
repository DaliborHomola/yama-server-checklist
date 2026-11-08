FROM harbor.wistron.com/base_image/node:lts-slim AS builder
WORKDIR /app

RUN npm config set proxy http://whqproxys.wistron.com:8080 && \
    npm config set https-proxy http://whqproxys.wistron.com:8080 && \
    npm config set registry https://registry.npmjs.org/

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx vp build

FROM harbor.wistron.com/base_image/node:lts-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

USER node

COPY --from=builder --chown=node:node /app/.output ./.output
COPY --from=builder --chown=node:node /app/src/server/db/migrations ./src/server/db/migrations

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok || process.exit(1)).catch(() => process.exit(1))"

ENTRYPOINT ["node", ".output/server/index.mjs"]
