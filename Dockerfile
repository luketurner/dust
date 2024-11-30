# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=18.16.1
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Next.js/Prisma"

# Next.js/Prisma app lives here
WORKDIR /app

# Set production environment
ENV NEXT_TELEMETRY_DISABLED="1" \
    NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y build-essential openssl pkg-config python-is-python3 unzip ca-certificates curl

# Install Bun
# Used for running the Git export job on the backend
RUN curl -fsSLO "https://github.com/oven-sh/bun/releases/latest/download/bun-linux-x64-baseline.zip" \
 && unzip "bun-linux-x64-baseline.zip" \
 && chmod +x "bun-linux-x64-baseline/bun" \
 && mv "bun-linux-x64-baseline/bun" "/usr/local/bin/bun" \
 && rm -rf bun-linux-x64-baseline*

# Install node modules
COPY --link package-lock.json package.json ./
RUN npm ci --include=dev

# Generate Prisma Client
COPY --link prisma .
RUN npx prisma generate

# Copy application code
COPY --link . .

# TODO -- just don't copy this to begin with?
RUN rm -rf ./ai-server
RUN rm -rf ./postgres

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --omit=dev

# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y ca-certificates curl git openssh-client openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install Supercronic
# Latest releases available at https://github.com/aptible/supercronic/releases
# TODO -- do this in the build image instead, like we did with bun
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.26/supercronic-linux-amd64 \
    SUPERCRONIC=supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=7a79496cf8ad899b99a719355d4db27422396735

RUN curl -fsSLO "$SUPERCRONIC_URL" \
 && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
 && chmod +x "$SUPERCRONIC" \
 && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
 && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic

# Copy built application
COPY --from=build /app /app
COPY --from=build /usr/local/bin/bun /usr/local/bin/bun

COPY crontab crontab

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
ENV NEXTAUTH_URL="https://dust.luketurner.org"
CMD [ "npm", "run", "start" ]
