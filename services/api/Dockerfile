FROM node:20-alpine AS base
WORKDIR /app

ENV CI=true

# Install NPM and node gyp stuff
RUN npm install -g pnpm
RUN apk add --no-cache --virtual .build-deps alpine-sdk python3

# Copy in the monorepo
COPY ../../ .

RUN ls -la

# Install deps and build local packages
RUN pnpm install --frozen-lockfile
RUN pnpm run build

# Nuke all node modules
RUN rm -rf ./**/node_modules
RUN rm -rf ./node_modules

# Install only deps for this package
RUN pnpm install --shamefully-hoist --filter=api --prod

# Create a final image
FROM node:20-alpine AS final

WORKDIR /app

# Copy the built files and dependencies
COPY --from=base /app/services/api/dist .

# Shamefully hoist puts all the deps here
COPY --from=base /app/node_modules ./node_modules

EXPOSE 80
CMD ["node", "index.mjs"]
