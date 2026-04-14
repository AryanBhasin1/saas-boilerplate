# Migrations

Run `npx prisma migrate dev --name init` to generate migrations.

Make sure to enable pgvector first in your Railway Postgres shell:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
