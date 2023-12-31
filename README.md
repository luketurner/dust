# Dust

Dust is a free, open-source task-management app, hosted at https://dust.luketurner.org. See the [manual](https://dust.luketurner.org/manual) for more information.

## Development

Dust uses Next.js and Prisma with a Postgres database.

Development dependencies:

- Node 16+
- Postgres 15+ (or `podman` to run containerized postgres locally)

```bash
# One time setup
npm install
npm run db:setup
npm run db:migrate

# Launch the app in dev
npm run db:start
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