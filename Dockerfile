# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# 1-bosqich: bog'liqliklar
# ---------------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# 2-bosqich: qurish
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `NEXT_PUBLIC_*` qiymatlari qurish paytida kodga yoziladi,
# shuning uchun ular shu yerda kerak (ishga tushirishda emas).
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------------------------------------------------------------------------
# 3-bosqich: ishga tushirish — faqat kerakli fayllar
# ---------------------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Root sifatida ishlatmaymiz
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
