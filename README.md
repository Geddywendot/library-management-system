# Library Management System

PostgreSQL + Prisma data layer for the library book catalog.

## Structure

- `api/prisma/schema.prisma` — `Role` enum (`PATRON`, `LIBRARIAN`), `User`, `Genre`, `Book`, and `Review` models.
- `api/prisma/seed.ts` — Idempotent seed script inserting 4 genres, 16 books, 2 users, and a sample review.
- `api/src/prisma/prisma.service.ts` — NestJS `PrismaService` extending `PrismaClient` and connecting on `OnModuleInit`.
- `api/.env.example` — `DATABASE_URL` placeholder.

## Setup

```bash
cd api
cp .env.example .env   # set DATABASE_URL to your PostgreSQL connection string
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

## Schema Decisions

`Book` references `Genre` through a `genreId` foreign key (`@relation`) rather than embedding genre data directly inside each `Book` record:

- **Single source of truth & consistency:** Genre names and descriptions live in one row. Renaming or updating a genre updates it across all linked books automatically without risking typos or mismatched casing (e.g., `"Sci-Fi"` vs `"Science Fiction"`).
- **No data duplication:** Genre metadata is not repeated across every book row.
- **Referential integrity & indexed queries:** PostgreSQL enforces valid `genreId` values at the database level, and the index on `genreId` keeps filtering or grouping books by genre fast.
- **Easy extensibility:** Adding genre-level attributes later (such as shelf location or parent category) requires changing only the `Genre` table.

### Prisma vs. Document Databases

Modeling in Prisma felt more upfront and rigid than a document database: every relation, foreign key, and uniqueness constraint (`@@unique([bookId, userId])` on `Review`) must be declared explicitly in `schema.prisma` and applied via migrations before writing application code, whereas document databases let you embed or reshape nested fields on the fly at the cost of enforcing consistency in application logic.
