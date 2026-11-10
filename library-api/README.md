# Library Management System - Data Layer

A NestJS and Prisma-based data layer for a library management system and book catalog, backed by PostgreSQL.

---

## Table of Contents

- [Overview](#overview)
- [Data Models & Schema](#data-models--schema)
- [Schema Decisions](#schema-decisions)
- [Prisma vs. Document Databases](#prisma-vs-document-databases)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Database Migration & Seeding](#database-migration--seeding)
  - [Running the Application](#running-the-application)
  - [Running Tests](#running-tests)
- [Project Structure](#project-structure)

---

## Overview

This project implements the foundational data layer for a library book catalog and patron management system. It provides strong relational data modeling, schema migrations, automated seeding with sample data across multiple genres, and read-only endpoints to explore the catalog.

---

## Data Models & Schema

The schema is defined in `api/prisma/schema.prisma` using PostgreSQL as the target database:

### 1. `Role` Enum
Defines system access roles:
- `PATRON`: Library patrons / standard readers.
- `LIBRARIAN`: Library staff with administrative privileges.

### 2. `User` Model
Represents registered users in the library system:
- `id` (`String`, CUID, Primary Key)
- `name` (`String`)
- `email` (`String`, Unique)
- `role` (`Role` enum, defaults to `PATRON`)
- `reviews` (`Review[]`, 1-to-many relation)
- `createdAt` / `updatedAt` (`DateTime` timestamps)

### 3. `Genre` Model
Represents distinct literary categories:
- `id` (`String`, CUID, Primary Key)
- `name` (`String`, Unique)
- `books` (`Book[]`, 1-to-many relation)

### 4. `Book` Model
Represents books within the library catalog:
- `id` (`String`, CUID, Primary Key)
- `title` (`String`)
- `author` (`String`)
- `isbn` (`String`, Unique)
- `publishedYear` (`Int?`, Optional)
- `genreId` (`String`, Foreign Key referencing `Genre.id`)
- `genre` (`Genre` relation, with `onDelete: Restrict`)
- `reviews` (`Review[]`, 1-to-many relation)
- `createdAt` / `updatedAt` (`DateTime` timestamps)

### 5. `Review` Model (Stretch Relation)
Represents book reviews written by users:
- `id` (`String`, CUID, Primary Key)
- `rating` (`Int`, e.g. 1-5 rating scale)
- `comment` (`String?`, Optional written critique)
- `bookId` (`String`, Foreign Key referencing `Book.id`, `onDelete: Cascade`)
- `userId` (`String`, Foreign Key referencing `User.id`, `onDelete: Cascade`)
- `book` / `user` relations
- `createdAt` / `updatedAt` (`DateTime` timestamps)
- `@@unique([bookId, userId])` ensures one review per user per book.

---

## Schema Decisions

### Why `Book` References `Genre` Rather Than Embedding It

In relational database design for a library catalog, `Genre` is modeled as an independent, normalized entity referenced via a `genreId` foreign key rather than being embedded as a plain string or unstructured attribute on the `Book` record for several critical reasons:

1. **Data Normalization & Single Source of Truth**:
   Treating genres as standalone records eliminates redundant string duplication across thousands of books. A single canonical row exists for each genre (e.g., "Science Fiction"), avoiding discrepancies like "Sci-Fi", "Science-Fiction", or "sci fi".

2. **Integrity and Anomaly Prevention**:
   - **Update Anomalies**: If a genre needs renaming or recategorization, updating a single record in the `Genre` table automatically reflects across all associated books without requiring bulk table updates or locking large portions of the catalog.
   - **Deletion Anomalies**: With `@relation(..., onDelete: Restrict)`, the database prevents accidental deletion of a genre that currently has active books associated with it.

3. **Query Optimization & Indexing**:
   Filtering and aggregating books by foreign key (`genreId`) leverages B-tree indexes on foreign keys, providing $O(\log N)$ lookups and fast joins. It also makes listing all available genres in the library simple and instant (`prisma.genre.findMany()`) without requiring costly `SELECT DISTINCT` scans over millions of book rows.

4. **Extensibility & Schema Evolution**:
   Modeling `Genre` as a first-class relation allows the schema to easily grow. Additional metadata can be added to `Genre` in future iterations (such as description, Dewey Decimal classification, shelf/aisle location, or hierarchical parent/child sub-genres) without altering the `Book` table structure.

---

## Prisma vs. Document Databases

Modeling relational data in Prisma with PostgreSQL differs noticeably from document databases (such as MongoDB):

- **Strict Schema Enforcement vs. Dynamic Flexibility**:
  In a document database, books might store genres and reviews as nested embedded documents or string arrays directly inside the book document. This offers fast, single-document read performance without joins, but risks data drift, orphaned records, and schema divergence across documents. In Prisma, relations, foreign keys, unique constraints, and referential actions (`Restrict`, `Cascade`) are strictly declared and enforced at the database layer.
- **Explicit Relations & Controlled Joins**:
  In document stores, denormalization is preferred to avoid costly application-level `$lookup` aggregations. In Prisma, data is normalized by default, and developers explicitly control relational queries via the `include` or `select` syntax (e.g., `include: { genre: true, reviews: true }`). This gives compile-time TypeScript safety for query payloads while allowing the database engine to execute optimized relational joins.
- **Declarative Migrations**:
  Prisma manages database state through declarative migration files (`prisma migrate`), ensuring every environment remains exactly synchronized. In document stores, migrations are typically deferred to application logic or manual data migration scripts.

---

## Getting Started

### Prerequisites

- Node.js (v20+ or v22+)
- npm
- PostgreSQL database instance (local or hosted on Neon, Supabase, etc.)

### Environment Configuration

Copy `.env.example` to `.env` in the `api` directory:

```bash
cp api/.env.example api/.env
```

Set your PostgreSQL connection string in `api/.env`:

```env
DATABASE_URL="postgresql://username:password@host:5432/dbname?sslmode=require"
```

### Database Migration & Seeding

Run the Prisma migration to create the schema in your PostgreSQL database:

```bash
cd api
npm run db:migrate -- --name init
```

Run the seed script to populate at least 4 genres and 15+ books (inserts 5 genres, 20 books, 2 users, and sample review):

```bash
npm run db:seed
```

Open Prisma Studio to visually inspect the populated database:

```bash
npm run db:studio
```

### Running the Application

```bash
cd api
# Start development server
npm run start:dev

# Start production build
npm run build
npm run start:prod
```

### Available Endpoints

- `GET /` - Health check ("Hello World!")
- `GET /books` - List all books in the catalog with their associated genres
- `GET /books/:id` - Retrieve a specific book by ID with its genre

### Running Tests

```bash
cd api
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

---

## Project Structure

```text
library-management-system/
├── api/ (and library-api/)
│   ├── .env.example              # Environment variables template
│   ├── prisma/
│   │   ├── schema.prisma         # Prisma schema with Book, Genre, User, Role, Review
│   │   └── seed.ts               # Seed script (5 genres, 20 books, users, review)
│   ├── prisma.config.ts          # Prisma 7 configuration file
│   ├── src/
│   │   ├── main.ts               # Application entry point
│   │   ├── app.module.ts         # Root NestJS module
│   │   ├── books/                # Books controller and service
│   │   └── prisma/
│   │       ├── prisma.module.ts  # Prisma NestJS module
│   │       └── prisma.service.ts # PrismaClient service with OnModuleInit
│   └── test/                     # Unit and e2e test suite
└── README.md                     # Documentation & Schema Decisions
```
