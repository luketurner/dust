# Dust

Dust is a free, open-source task-management app, hosted at https://dust.luketurner.org. See the [manual](https://dust.luketurner.org/manual) for more information.

## Development

Dust uses Next.js and Prisma with a Postgres database.

Development dependencies:

- Node 16+
- Postgres 15+ w/pgvector extension (or `podman` to run containerized postgres locally)

```bash
# One time setup
npm install
npm run db:build:dev
npm run db:setup:dev
npm run db:migrate

# Launch the app in dev
npm run db:start:dev
npm run dev

# run after schema updates
npm run db:migrate
```

## Deployment

Dust is deployed at Fly.io. Deploy with:

```bash
# first time -- run this
flyctl launch

# then afterwards run this
flyctl deploy
```

Required secrets:

```
NEXTAUTH_SECRET
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
DUST_SSH_KEY_PASSPHRASE
```

Recommended scale for self-hosting:

```
flyctl scale count app=1 cron=1
```

### Postgres

Dust uses a custom version of the [postgres-ha](https://github.com/fly-apps/postgres-ha) app. The vendored version is based on commit [44ab26a7cd0c3f8345887e9e7b9f48a73851eaf5](https://github.com/fly-apps/postgres-ha/commit/44ab26a7cd0c3f8345887e9e7b9f48a73851eaf5).

Changes from the base app:

- Add [pgvector](https://github.com/pgvector/pgvector) extension.

To deploy:

```bash
cd postgres
flyctl deploy
```

Once you do this, the `flyctl postgres` commands won't work anymore, unfortunately.

To connect to the DB, use:

```bash
cd postgres
flyctl proxy 5432
```

To get the password, use:

```bash
cd postgres
flyctl ssh console

# get password
echo $OPERATOR_PASSWORD
```

To get started, need to do the following queries (only need to do this once):

```sql
CREATE DATABASE lt_dust;
```

### LLM Server

To run a tiny LLM server locally:

```bash
cd local
wget https://huggingface.co/jartine/phi-2-llamafile/resolve/main/phi-2.Q2_K.llamafile
./phi-2.Q2_K.llamafile --embedding
```

And put the following in your `.env`:

```bash
DUST_LLM_SERVER="http://127.0.0.1:8080"
DUST_LLM_VERSION="phi-2.Q2_K"
DUST_LLM_EMBEDDING_VERSION="phi-2.Q2_K"
```

## Quote loading

Dust provides daily motivational quotes. Quotes are stored in a `Quote` table in the database. They have to be manually loaded in -- Dust doesn't have UI for creating/editing quotes.

There is a `scripts/load_quotes.mjs` file that can convert an easily-authored YAML file containing quotations into a series of SQL statements that can be pasted into `psql` to load quotes.

The script expects a file called `local/quotes.yml` with content like:

```yaml
quotes:
  AUTHOR:
    BOOK1:
      - Quote1
      - Quote2
    BOOK2:
      - Quote3
      - Quote4
```

And will produce SQL INSERT statements, one for each quote, in `local/quotes.sql`.