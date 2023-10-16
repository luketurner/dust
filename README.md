# Dust

Dust is a task-management app.

## Development

Dust uses Next.js and Prisma with a Postgres database.

Development dpendencies:

- Node 16+
- Postgres 15+ (or `podman` to run containerized postgres locally)

```bash
# One time setup
npm install
npm run dev:db:setup
npm run dev:db:migrate

# Launch the app in dev
npm run dev:db:run
npm run dev

# run after schema updates
npm run dev:db:migrate
```

## Deployment

Required secrets:

```
NEXTAUTH_SECRET
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
DUST_SSH_KEY_PASSPHRASE
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