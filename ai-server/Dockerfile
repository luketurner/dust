FROM ubuntu:22.04

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y ca-certificates wget && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

WORKDIR /app

COPY ./run.sh ./run.sh

ENTRYPOINT ["/bin/sh", "-c", "./run.sh"]
