FROM postgres:15

RUN apt-get update && apt-get install --no-install-recommends -y \
    postgresql-15-pgvector \
    && apt autoremove -y