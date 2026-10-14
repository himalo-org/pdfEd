FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run assets && npm run typecheck && npm test
RUN npm run build

FROM build AS verification
RUN npx playwright install --with-deps chromium
CMD ["npm", "run", "test:browser"]

FROM nginx:stable-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
