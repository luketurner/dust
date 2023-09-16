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
npm run dev:db:gen
```