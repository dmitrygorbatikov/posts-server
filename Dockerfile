FROM node:18.15.0-alpine AS builder
WORKDIR .
COPY /*.json ./
COPY . .
RUN npm install -g pnpm
RUN pnpm run build

FROM node:18.15.0-alpine
WORKDIR .
COPY --from=builder / ./
EXPOSE ${PORT}
CMD ["pnpm", "run", "start:prod"]
